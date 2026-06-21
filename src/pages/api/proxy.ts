import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return res.status(400).json({ error: "Invalid URL scheme" });
  }

  console.log("[CoPilot TV Proxy] Fetching:", url);

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        (req.headers["user-agent"] as string) ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: (req.headers.accept as string) || "*/*",
    };

    if (req.headers.referer) {
      headers["Referer"] = req.headers.referer as string;
    }

    if (req.headers.range) {
      headers["Range"] = req.headers.range as string;
    }

    const response = await fetch(url, {
      headers,
      redirect: "follow",
    });

    console.log("[CoPilot TV Proxy] Response status:", response.status, "for", url);

    if (!response.ok && response.status !== 206) {
      const errorText = await response.text().catch(() => "");
      console.error("[CoPilot TV Proxy] Upstream error:", response.status, errorText.slice(0, 200));
      return res.status(response.status).json({
        error: "Upstream request failed",
        status: response.status,
        url,
      });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const isM3U8 =
      url.toLowerCase().includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("m3u");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Accept");

    // For m3u8 playlists: rewrite every internal URL to route through this proxy
    if (isM3U8) {
      const text = await response.text();
      const originalUrl = new URL(url);
      const basePath = originalUrl.href.substring(0, originalUrl.href.lastIndexOf("/") + 1);

      const lines = text.split("\n").map((line) => {
        const trimmed = line.trim();
        // Keep comments, directives, and empty lines as-is
        if (!trimmed || trimmed.startsWith("#")) return line;

        // Resolve relative URLs to absolute
        let absoluteUrl = trimmed;
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          absoluteUrl = new URL(trimmed, basePath).href;
        }

        // Route through proxy
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });

      const modified = lines.join("\n");
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "no-cache");
      res.send(modified);
      console.log("[CoPilot TV Proxy] Rewrote m3u8, segments:", lines.filter(l => l.startsWith("/api/proxy")).length);
      return;
    }

    // For video segments and other binary data: stream through
    res.status(response.status);

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const acceptRanges = response.headers.get("accept-ranges");
    if (acceptRanges) {
      res.setHeader("Accept-Ranges", acceptRanges);
    }

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      res.setHeader("Content-Range", contentRange);
    }

    res.setHeader("Content-Type", contentType);

    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            res.write(Buffer.from(value));
          }
        }
      } finally {
        reader.releaseLock();
      }
      res.end();
    } else {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error("[CoPilot TV Proxy] Error:", error);
    res.status(500).json({ error: "Proxy request failed", detail: String(error) });
  }
}