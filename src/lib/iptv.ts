export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export interface Movie {
  stream_id: number;
  name: string;
  stream_icon?: string;
  container_extension?: string;
  direct_source?: string;
}

export interface Series {
  series_id: number;
  name: string;
  cover?: string;
  plot?: string;
}

export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export function parseM3U(content: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  let current: Partial<Channel> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#EXTINF:")) {
      const nameMatch = trimmed.match(/,(.+)$/);
      const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
      const groupMatch = trimmed.match(/group-title="([^"]*)"/);
      const idMatch = trimmed.match(/tvg-id="([^"]*)"/);

      current = {
        id: idMatch ? idMatch[1] : `ch-${channels.length}`,
        name: nameMatch ? nameMatch[1].trim() : "Unknown Channel",
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : "Uncategorized",
      };
    } else if (trimmed && !trimmed.startsWith("#") && current.name) {
      current.url = trimmed;
      channels.push(current as Channel);
      current = {};
    }
  }

  return channels;
}

const PROXY_SERVICES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

async function fetchWithProxy(url: string, options?: RequestInit, preferDirect = false): Promise<Response> {
  const errors: string[] = [];

  // Try direct first for API calls (some servers have CORS)
  if (preferDirect) {
    try {
      const res = await fetch(url, { ...options, mode: "cors" });
      if (res.ok) return res;
      errors.push(`Direct: HTTP ${res.status}`);
    } catch (err) {
      errors.push(`Direct: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Try each proxy service
  for (const makeProxy of PROXY_SERVICES) {
    const proxyUrl = makeProxy(url);
    try {
      const res = await fetch(proxyUrl, options);
      if (res.ok || res.status === 206) return res;
      errors.push(`Proxy: HTTP ${res.status}`);
    } catch (err) {
      errors.push(`Proxy: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All fetch attempts failed:\n${errors.join("\n")}`);
}

export function getDirectUrl(proxiedUrl: string): string {
  // No longer stripping proxy wrapper — direct is handled separately
  return proxiedUrl;
}

export async function fetchM3U(m3uUrl: string): Promise<Channel[]> {
  const response = await fetchWithProxy(m3uUrl);
  const text = await response.text();
  return parseM3U(text);
}

export async function fetchXtreamLive(creds: XtreamCredentials): Promise<Channel[]> {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_streams`;
  const response = await fetchWithProxy(apiUrl, {}, true);
  const data = await response.json();

  if (!Array.isArray(data)) throw new Error("Invalid Xtream response");

  return data.map((item: Record<string, unknown>) => ({
    id: String(item.stream_id || ""),
    name: String(item.name || "Unknown"),
    url: `${baseUrl}/live/${creds.username}/${creds.password}/${item.stream_id}.m3u8`,
    logo: item.stream_icon ? String(item.stream_icon) : undefined,
    group: item.category_name ? String(item.category_name) : "Live TV",
  }));
}

export async function fetchXtreamVod(creds: XtreamCredentials): Promise<Movie[]> {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_vod_streams`;
  const response = await fetchWithProxy(apiUrl, {}, true);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid Xtream response");
  return data as Movie[];
}

export async function fetchXtreamSeries(creds: XtreamCredentials): Promise<Series[]> {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series`;
  const response = await fetchWithProxy(apiUrl, {}, true);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid Xtream response");
  return data as Series[];
}

export function getXtreamStreamUrl(creds: XtreamCredentials, streamId: number, type: "live" | "vod"): string {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  if (type === "live") {
    return `${baseUrl}/live/${creds.username}/${creds.password}/${streamId}.m3u8`;
  }
  return `${baseUrl}/movie/${creds.username}/${creds.password}/${streamId}.${creds.password}`;
}

export function getXtreamSeriesInfoUrl(creds: XtreamCredentials, seriesId: number): string {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  return `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_info&series_id=${seriesId}`;
}

export function proxyStreamUrl(url: string): string {
  return url; // Return original — player handles proxying via hls.js xhrSetup
}