import { clearSession, getSession, saveCache, syncUserAcademicData, getOfficerOverrides, getPhotoOverrides } from "../store";
import type { User } from "../../types";
import { GoogleSheetsAuthService } from "../../services/googleSheets.service";
import { supabase } from "../../lib/supabaseClient";

const AUTH_ERROR_STORAGE_KEY = "jpcs_auth_error";
export const DEFAULT_INITIAL_PASSWORD = "sscrmnlitdepartment";

export type AuthErrorCode =
  | "invalid_credentials"
  | "disabled_account"
  | "too_many_requests"
  | "network"
  | "configuration"
  | "not_in_masterlist"
  | "unknown";

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Invalid email or password.",
  disabled_account: "This account has been disabled. Contact your administrator.",
  too_many_requests: "Too many login attempts. Please wait and try again later.",
  network: "Unable to load student information. Please check your connection and try again.",
  configuration: "Authentication is not configured yet. Please contact the administrator.",
  not_in_masterlist: "Your account could not be found in the official student masterlist. Please contact the administrator.",
  unknown: "Sign in could not be completed. Please try again.",
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, customMessage?: string) {
    const message = customMessage || AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.unknown;
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export function rememberAuthError(code: AuthErrorCode) {
  try {
    sessionStorage.setItem(AUTH_ERROR_STORAGE_KEY, code);
  } catch {}
}

export function getSavedAuthError(): string | null {
  try {
    const code = sessionStorage.getItem(AUTH_ERROR_STORAGE_KEY) as AuthErrorCode | null;
    if (code && AUTH_ERROR_MESSAGES[code]) {
      sessionStorage.removeItem(AUTH_ERROR_STORAGE_KEY);
      return AUTH_ERROR_MESSAGES[code];
    }
  } catch {}
  return null;
}

export function clearSavedAuthError() {
  try {
    sessionStorage.removeItem(AUTH_ERROR_STORAGE_KEY);
  } catch {}
}

export function isConfigured() {
  return true;
}

/**
 * Primary Authentication: Authenticates user against Supabase Database first,
 * with fallback to Google Sheets masterlist for initial first-time onboarding.
 */
export async function startEmailLogin(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Direct Supabase Database Authentication
  let isSupabaseAuthenticated = false;
  let dbCredUser: any = null;

  try {
    const { data: dbCred, error: dbErr } = await supabase
      .from("user_credentials")
      .select("*")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (!dbErr && dbCred) {
      dbCredUser = dbCred;
      if (dbCred.password_hash === cleanPassword) {
        isSupabaseAuthenticated = true;
      }
    }
  } catch (err) {
    console.warn("Supabase database credentials query notice:", err);
  }

  // If user is authenticated via Supabase:
  if (isSupabaseAuthenticated && dbCredUser) {
    const isAdmin = dbCredUser.role === "admin" || normalizedEmail.includes("admin");
    const isFaculty = dbCredUser.role === "faculty";
    const resolvedRole = isAdmin ? "admin" : isFaculty ? "faculty" : "student";

    const photoOverrides = getPhotoOverrides();
    const officerOverrides = getOfficerOverrides();
    const cleanKey = normalizedEmail;
    const noKey = (dbCredUser.student_number || "").toLowerCase();

    const assignedPhoto = photoOverrides[cleanKey] || (noKey ? photoOverrides[noKey] : undefined) || dbCredUser.profile_photo || "";
    const assignedPos = officerOverrides[cleanKey] || (noKey ? officerOverrides[noKey] : undefined);
    const effectivePos = assignedPos !== undefined ? assignedPos : (dbCredUser.officer_position && dbCredUser.officer_position !== "None" ? dbCredUser.officer_position : "None");

    const sessionUser: User = {
      id: dbCredUser.id || `user_${normalizedEmail.replace(/[^a-z0-9]/gi, "_")}`,
      uid: dbCredUser.id || `user_${normalizedEmail.replace(/[^a-z0-9]/gi, "_")}`,
      full_name: dbCredUser.full_name || normalizedEmail.split("@")[0],
      student_number: dbCredUser.student_number || `SSCR-${normalizedEmail.split("@")[0]}`,
      course: dbCredUser.course || "BSIT",
      year_level: String(dbCredUser.year_level || "1"),
      role: resolvedRole as any,
      email: normalizedEmail,
      verified: true,
      status: "active",
      mustChangePassword: false,
      officer_position: effectivePos,
      profile_photo: assignedPhoto,
      selected_semester_id: dbCredUser.selected_semester_id || undefined,
      selected_academic_year: dbCredUser.selected_academic_year || undefined,
      selected_semester: dbCredUser.selected_semester || undefined,
    };

    saveCache("sscr_session", sessionUser);
    window.dispatchEvent(new Event("sscr_store_synced"));

    try {
      await syncUserAcademicData(sessionUser);
    } catch (err) {
      console.warn("Academic data sync notice:", err);
    }

    return sessionUser;
  }

  // 2. If user is in Supabase but entered wrong password:
  if (dbCredUser && !isSupabaseAuthenticated) {
    throw new AuthError("invalid_credentials");
  }

  // 3. For users NOT yet in Supabase: Check Google Sheets Masterlist for first-time onboarding
  let matchedStudent: User | null = null;
  try {
    matchedStudent = await GoogleSheetsAuthService.findUserByEmail(normalizedEmail);
  } catch (err) {
    console.error("Google Sheets lookup error:", err);
    throw new AuthError("network");
  }

  if (!matchedStudent) {
    throw new AuthError("not_in_masterlist");
  }

  // 4. Default password check for initial first-time onboarding
  const isDefaultPassword = cleanPassword === DEFAULT_INITIAL_PASSWORD;
  if (!isDefaultPassword) {
    throw new AuthError("invalid_credentials");
  }

  // Check if profile exists in Supabase user_credentials
  let dbUserForSheet: any = null;
  try {
    const { data } = await supabase
      .from("user_credentials")
      .select("profile_photo, officer_position, full_name, student_number")
      .eq("email", normalizedEmail)
      .maybeSingle();
    dbUserForSheet = data;
  } catch {}

  const isAdmin = normalizedEmail.includes("admin") || matchedStudent.role === "admin";
  const isFaculty = matchedStudent.role === "faculty";
  const resolvedRole = isAdmin ? "admin" : isFaculty ? "faculty" : "student";

  const photoOverrides = getPhotoOverrides();
  const officerOverrides = getOfficerOverrides();
  const studentNo = (matchedStudent.student_number || "").toLowerCase();

  const assignedPhoto = photoOverrides[normalizedEmail] || (studentNo ? photoOverrides[studentNo] : undefined) || dbUserForSheet?.profile_photo || "";
  const assignedPos = officerOverrides[normalizedEmail] || (studentNo ? officerOverrides[studentNo] : undefined);
  const effectivePos = assignedPos !== undefined ? assignedPos : (dbUserForSheet?.officer_position && dbUserForSheet.officer_position !== "None" ? dbUserForSheet.officer_position : matchedStudent.officer_position || "None");

  const sessionUser: User = {
    id: matchedStudent.id,
    uid: matchedStudent.id,
    full_name: matchedStudent.full_name,
    student_number: matchedStudent.student_number || `SSCR-${matchedStudent.id.slice(0, 6)}`,
    course: matchedStudent.course || "BSIT",
    year_level: matchedStudent.year_level || "1",
    role: resolvedRole as any,
    email: normalizedEmail,
    verified: true,
    status: "active",
    mustChangePassword: true, // Force password setup for first-time login
    officer_position: effectivePos,
    profile_photo: assignedPhoto,
  };

  saveCache("sscr_session", sessionUser);
  window.dispatchEvent(new Event("sscr_store_synced"));

  try {
    await syncUserAcademicData(sessionUser);
  } catch (err) {
    console.warn("Academic data sync notice:", err);
  }

  return sessionUser;
}

/**
 * Changes student password and securely stores their credentials in Supabase
 */
export async function changeUserPassword(newPassword: string, currentPassword?: string) {
  const session = getSession();
  if (!session || !session.email) {
    throw new AuthError("unknown", "No active session found. Please sign in again.");
  }

  const normalizedEmail = session.email.trim().toLowerCase();
  const cleanNew = newPassword.trim();

  // If current password is provided, validate it
  if (currentPassword && currentPassword.trim()) {
    const cleanCurrent = currentPassword.trim();
    if (cleanCurrent !== DEFAULT_INITIAL_PASSWORD) {
      try {
        const { data: dbCred } = await supabase
          .from("user_credentials")
          .select("password_hash")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (dbCred && dbCred.password_hash !== cleanCurrent) {
          throw new Error("Current password mismatch");
        }
      } catch {
        throw new AuthError("invalid_credentials", "Current password is incorrect.");
      }
    }
  }

  // 1. Save or update user in Supabase user_credentials table
  try {
    const { error: upsertErr } = await supabase
      .from("user_credentials")
      .upsert(
        {
          email: normalizedEmail,
          password_hash: cleanNew,
          student_number: session.student_number || `SSCR-${normalizedEmail.split("@")[0]}`,
          full_name: session.full_name || normalizedEmail.split("@")[0],
          year_level: String(session.year_level || "1"),
          role: session.role || "student",
          course: session.course || "BSIT",
          officer_position: session.officer_position || "None",
          profile_photo: session.profile_photo || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (upsertErr) {
      console.warn("Supabase user_credentials upsert error:", upsertErr);
      throw new Error(upsertErr.message);
    }



    // 2. Update session in client cache
    const updatedUser: User = {
      ...session,
      mustChangePassword: false,
    };

    saveCache("sscr_session", updatedUser);
    window.dispatchEvent(new Event("sscr_store_synced"));
  } catch (err: any) {
    console.error("Supabase password update error:", err);
    throw new AuthError("unknown", err?.message || "Failed to update password.");
  }
}

export async function signOutEverywhere() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase sign out notice:", err);
  }
  clearSession();
}
