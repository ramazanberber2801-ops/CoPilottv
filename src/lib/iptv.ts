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

function buildProxyUrl(targetUrl: string): string {
  return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
}

export async function fetchM3U(m3uUrl: string): Promise<Channel[]> {
  const proxyUrl = buildProxyUrl(m3uUrl);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error("Failed to fetch M3U playlist");
  const text = await response.text();
  return parseM3U(text);
}

export async function fetchXtreamLive(creds: XtreamCredentials): Promise<Channel[]> {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_live_streams`;
  const proxyUrl = buildProxyUrl(apiUrl);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error("Failed to fetch live streams");
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
  const proxyUrl = buildProxyUrl(apiUrl);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error("Failed to fetch VOD streams");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid Xtream response");
  return data as Movie[];
}

export async function fetchXtreamSeries(creds: XtreamCredentials): Promise<Series[]> {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series`;
  const proxyUrl = buildProxyUrl(apiUrl);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error("Failed to fetch series");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid Xtream response");
  return data as Series[];
}

export function getXtreamStreamUrl(creds: XtreamCredentials, streamId: number, type: "live" | "vod"): string {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  if (type === "live") {
    return buildProxyUrl(`${baseUrl}/live/${creds.username}/${creds.password}/${streamId}.m3u8`);
  }
  return buildProxyUrl(`${baseUrl}/movie/${creds.username}/${creds.password}/${streamId}.${creds.password}`);
}

export function getXtreamSeriesInfoUrl(creds: XtreamCredentials, seriesId: number): string {
  const baseUrl = creds.serverUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&action=get_series_info&series_id=${seriesId}`;
  return buildProxyUrl(apiUrl);
}

export function proxyStreamUrl(url: string): string {
  return buildProxyUrl(url);
}