import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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