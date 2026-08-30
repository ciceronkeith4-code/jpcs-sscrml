import { createClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gwnayxgmxlxrcensoerk.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bmF5eGdteGx4cmNlbnNvZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNzYyNzgsImV4cCI6MjEwMzY1MjI3OH0.YqSOF_qfHpGtlNJ73CXPBMCOG-Czt6x6OehKyQx3l_g";

export const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
