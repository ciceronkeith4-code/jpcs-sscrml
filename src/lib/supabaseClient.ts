import { createClient } from "@supabase/supabase-js";

// Active official Supabase project for JPCS Portal
export const ACTIVE_SUPABASE_URL = "https://gwnayxgmxlxrcensoerk.supabase.co";
export const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bmF5eGdteGx4cmNlbnNvZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNzYyNzgsImV4cCI6MjEwMzY1MjI3OH0.YqSOF_qfHpGtlNJ73CXPBMCOG-Czt6x6OehKyQx3l_g";

const rawEnvUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const rawEnvKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// If Vercel has the old dead project URL 'isezuvblfrwjbiplznau', force the active working one
const isInvalidOldProject = rawEnvUrl.includes("isezuvblfrwjbiplznau") || !rawEnvUrl;

export const DEFAULT_SUPABASE_URL = isInvalidOldProject ? ACTIVE_SUPABASE_URL : rawEnvUrl;
export const DEFAULT_SUPABASE_ANON_KEY = isInvalidOldProject ? ACTIVE_SUPABASE_ANON_KEY : rawEnvKey;

export const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

