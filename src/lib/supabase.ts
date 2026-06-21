import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycvgovawzowxjfyvbulm.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdmdvdmF3em93eGpmeXZidWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjgwNjMsImV4cCI6MjA5NzYwNDA2M30.aqDrCTguGNxNgP7bFpAXNP6LrkwPj4wA_aqwbBrYErA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "copilot-tv-auth-token",
  },
});

export type PlaylistConfig = {
  id?: string;
  user_id?: string;
  config_type: "m3u" | "xtream";
  m3u_url?: string | null;
  xtream_server_url?: string | null;
  xtream_username?: string | null;
  xtream_password?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  subscription: "free" | "premium";
  created_at: string;
};

export async function getUserPlaylist(userId: string): Promise<PlaylistConfig | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("getUserPlaylist error:", error);
    return null;
  }
  return data && data.length > 0 ? (data[0] as PlaylistConfig) : null;
}

export async function upsertPlaylist(
  config: Omit<PlaylistConfig, "id" | "created_at" | "updated_at">
): Promise<void> {
  const { data: existingRows, error: fetchError } = await supabase
    .from("playlists")
    .select("id")
    .eq("user_id", config.user_id)
    .limit(1);

  if (fetchError) throw new Error(fetchError.message);

  const existingId = existingRows && existingRows.length > 0 ? (existingRows[0] as { id: string }).id : null;

  if (existingId) {
    const { error } = await supabase
      .from("playlists")
      .update(config)
      .eq("id", existingId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("playlists").insert(config);
    if (error) throw new Error(error.message);
  }
}