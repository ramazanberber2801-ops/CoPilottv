import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const diagnostics = {
    url_present: !!url,
    key_present: !!key,
    url_format_valid: url ? url.startsWith("https://") && url.includes(".supabase.co") : false,
    key_format_valid: key ? key.startsWith("eyJ") : false,
    url: url || null,
    key_preview: key ? `${key.slice(0, 20)}...` : null,
    error: null as string | null,
    supabase_status: null as number | null,
  };

  if (!url || !key) {
    diagnostics.error = "Missing SUPABASE_URL or SUPABASE_ANON_KEY";
    return res.status(500).json(diagnostics);
  }

  if (!diagnostics.key_format_valid) {
    diagnostics.error = "ANON_KEY does not look like a valid Supabase JWT key. Expected format: eyJ...";
    return res.status(400).json(diagnostics);
  }

  try {
    const testClient = createClient(url, key);
    const { data, error } = await testClient.from("playlists").select("id").limit(1);

    if (error) {
      diagnostics.error = error.message;
      diagnostics.supabase_status = error.code ? parseInt(error.code, 10) || null : null;
      return res.status(500).json(diagnostics);
    }

    return res.status(200).json({
      ...diagnostics,
      connected: true,
      playlists_table_accessible: true,
    });
  } catch (err) {
    diagnostics.error = err instanceof Error ? err.message : String(err);
    return res.status(500).json(diagnostics);
  }
}