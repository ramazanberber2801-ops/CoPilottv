import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return res.status(400).json({ error: "Invalid URL scheme" });
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        (req.headers["user-agent"] as string) ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: (req.headers.accept as string) || "*/*",
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range as string;
    }

    const response = await fetch(url, { headers });

    res.status(response.status);

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}