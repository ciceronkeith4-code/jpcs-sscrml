import type { User, Semester, Subject, CurriculumItem, AwardSetting, Announcement, AwardResult } from "../types";
import { APP_CONFIG } from "../constants/app.constants";
import { applyCurriculumSchedule } from "./schedule";
import { supabase } from "../lib/supabaseClient";
import { GoogleSheetsAuthService } from "../services/googleSheets.service";

const KEYS = {
  users: "sscr_users",
  semesters: "sscr_semesters",
  subjects: "sscr_subjects",
  curriculum: "sscr_curriculum",
  awardSettings: "sscr_award_settings",
  announcements: "sscr_announcements",
  session: "sscr_session",
  // UI State cache
  uiSidebar: "sscr_ui_sidebar",
  uiTheme: "sscr_ui_theme",
  uiLastSem: "sscr_ui_last_sem",
};

const CACHE_VERSION = "v1.0.0";

interface CacheWrapper<T> {
  version: string;
  updated_at: number;
  expires_at: number;
  data: T;
}

// ── Cache Helpers ─────────────────────────────────────────────────────────

function getCacheKey(key: string) {
  return `${key}_wrapped`;
}

function loadCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy);
          saveCache(key, parsedLegacy);
          return parsedLegacy;
        } catch {}
      }
      return fallback;
    }
    const parsed = JSON.parse(raw) as CacheWrapper<T>;
    if (parsed.version !== CACHE_VERSION) {
      if (parsed.data) {
        saveCache(key, parsed.data);
        return parsed.data;
      }
      return fallback;
    }
    if (parsed.expires_at && Date.now() > parsed.expires_at) {
      return fallback;
    }
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function saveCache<T>(key: string, value: T) {
  try {
    const wrapper: CacheWrapper<T> = {
      version: CACHE_VERSION,
      updated_at: Date.now(),
      expires_at: Date.now() + 365 * 24 * 60 * 60 * 1000, // Persistent academic data for 1 year
      data: value,
    };
    localStorage.setItem(getCacheKey(key), JSON.stringify(wrapper));
  } catch (err) {
    console.error(`localStorage saveCache error for "${key}":`, err);
  }
}

// ── Seed default data ──────────────────────────────────────────────────────

const DEFAULT_AWARD_SETTINGS: AwardSetting[] = [
  { id: "1", award_name: "Gold Medalist", minimum_average: 95, minimum_subject_grade: 91.5 },
  { id: "2", award_name: "Silver Medalist", minimum_average: 92, minimum_subject_grade: 88.5 },
  { id: "3", award_name: "Bronze Medalist", minimum_average: 85, minimum_subject_grade: 84.5 },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Official Start of Classes",
    description: "1st Semester AY 2026–2027",
    publish_date: "2026-08-17",
    start_date: "2026-08-17",
    priority: "high",
  },
  {
    id: "2",
    title: "Official Academic Notice",
    description: "Pre-enlistment and clearing procedures for the upcoming term must be submitted to department chairs.",
    publish_date: "2026-08-10",
    priority: "normal",
  },
  {
    id: "3",
    title: "Sequential Blocking Information",
    description: "San Sebastian College Recoletos implements the July 18 Revised Blocking model. Grades must satisfy prerequisite course criteria before registration into succeeding course cycles is allowed.",
    publish_date: "2026-08-05",
    priority: "normal",
  },
];

import { OFFICIAL_BSIT_CURRICULUM_SEED } from "../services/curriculum.service";

const DEFAULT_CURRICULUM: CurriculumItem[] = OFFICIAL_BSIT_CURRICULUM_SEED.map((c) => ({
  id: `curr_${c.id}`,
  course: "BSIT",
  year_level: c.year_level.replace("BSIT ", "").trim(),
  semester: "First Semester",
  subject_code: c.subject_code,
  subject_name: c.subject_description,
  units: c.total_units,
  block: (c.block === "A" || c.block === "B" || c.block === "AB") ? c.block : "A",
  lec_units: c.lec_units,
  lab_units: c.lab_units,
  schedule_days: c.days,
  schedule_time: c.time,
  room: c.room,
  faculty: c.faculty || "",
  mode: c.mode,
}));

function uid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Init Store & Setup Realtime ───────────────────────────────────────────

let isInitialized = false;

export function initStore() {
  if (isInitialized) return;
  isInitialized = true;

  // Clear legacy sheets cache and curriculum
  localStorage.removeItem(getCacheKey(KEYS.curriculum));
  localStorage.removeItem("jpcs_sheets_accounts_cache");

  const currentAnnouncements = loadCache<Announcement[]>(KEYS.announcements, []);
  if (!currentAnnouncements || currentAnnouncements.length === 0) {
    saveCache(KEYS.announcements, DEFAULT_ANNOUNCEMENTS);
  }
  if (!localStorage.getItem(getCacheKey(KEYS.awardSettings))) saveCache(KEYS.awardSettings, DEFAULT_AWARD_SETTINGS);

  // Background fetch all user credentials from Supabase to restore officers and photos
  supabase
    .from("user_credentials")
    .select("email, profile_photo, officer_position, full_name, student_number, course, year_level, role")
    .then(({ data: allCreds }) => {
      if (allCreds && allCreds.length > 0) {
        allCreds.forEach((cred) => {
          if (cred.email) {
            if (cred.officer_position && cred.officer_position !== "None") {
              saveOfficerOverride(cred.email, cred.officer_position);
              if (cred.student_number) saveOfficerOverride(cred.student_number, cred.officer_position);
            }
            if (cred.profile_photo) {
              savePhotoOverride(cred.email, cred.profile_photo);
              if (cred.student_number) savePhotoOverride(cred.student_number, cred.profile_photo);
            }
            if (cred.year_level || cred.course || cred.full_name) {
              const details: Partial<User> = {};
              if (cred.year_level) details.year_level = String(cred.year_level);
              if (cred.course) details.course = cred.course;
              if (cred.full_name) details.full_name = cred.full_name;
              if (cred.student_number) details.student_number = cred.student_number;
              saveProfileOverride(cred.email, details);
              if (cred.student_number) saveProfileOverride(cred.student_number, details);
            }
          }
        });
      }
    })
    .catch(() => {});

  // Refresh active session from Supabase & Google Sheets without wiping local data
  const currentSession = loadCache<User | null>(KEYS.session, null);
  if (currentSession?.email) {
    const cleanEmail = currentSession.email.trim().toLowerCase();
    const overrides = getOfficerOverrides();
    const photoOverrides = getPhotoOverrides();
    const cleanNo = (currentSession.student_number || "").toLowerCase();
    const assignedPos = overrides[cleanEmail] || (cleanNo ? overrides[cleanNo] : undefined);
    const assignedPhoto = photoOverrides[cleanEmail] || (cleanNo ? photoOverrides[cleanNo] : undefined);

    supabase
      .from("user_credentials")
      .select("profile_photo, officer_position, full_name, student_number, course, year_level, role")
      .eq("email", cleanEmail)
      .maybeSingle()
      .then(async ({ data: dbUser }) => {
        let matched: User | null = null;
        try {
          matched = await GoogleSheetsAuthService.findUserByEmail(cleanEmail);
        } catch {}

        const latestPhoto = assignedPhoto || dbUser?.profile_photo || currentSession.profile_photo || "";
        const latestOfficerPos = assignedPos !== undefined
          ? assignedPos
          : (dbUser?.officer_position && dbUser.officer_position !== "None"
              ? dbUser.officer_position
              : "None");

        const updated: User = {
          ...currentSession,
          profile_photo: latestPhoto,
          officer_position: latestOfficerPos,
          full_name: dbUser?.full_name || matched?.full_name || currentSession.full_name,
          student_number: dbUser?.student_number || matched?.student_number || currentSession.student_number,
          year_level: dbUser?.year_level || matched?.year_level || currentSession.year_level,
          course: dbUser?.course || matched?.course || currentSession.course,
          role: (dbUser?.role as any) || currentSession.role,
        };

        saveCache(KEYS.session, updated);
        window.dispatchEvent(new Event("sscr_store_synced"));
      })
      .catch(() => {});
  }
}

// ── Academic Data Sync ────────────────────────────────────────────────────

export async function syncUserAcademicData(user: User) {
  try {
    const studentNo = (user.student_number || "").trim();
    const userId = (user.id || "").trim();

    // Build filter
    const orFilter = studentNo
      ? `user_id.eq.${userId},student_number.eq.${studentNo}`
      : `user_id.eq.${userId}`;

    // 1. Fetch semesters for this student from Supabase
    const { data: semsData, error: semsErr } = await supabase
      .from("semesters")
      .select("*")
      .or(orFilter);

    const localSems = loadCache<Semester[]>(KEYS.semesters, []);

    if (!semsErr && semsData && semsData.length > 0) {
      const mergedMap = new Map<string, Semester>();
      localSems.forEach((s) => mergedMap.set(s.id, s));
      semsData.forEach((s) => mergedMap.set(s.id, s));
      saveCache(KEYS.semesters, Array.from(mergedMap.values()));
    } else if (localSems.length > 0) {
      // Push local semesters to Supabase so they persist permanently
      const mySems = localSems.filter((s) => s.user_id === userId || (studentNo && s.student_number === studentNo));
      if (mySems.length > 0) {
        void supabase.from("semesters").upsert(mySems, { onConflict: "id" });
      }
    }

    // 2. Fetch subjects/grades for this student from Supabase
    const { data: subsData, error: subsErr } = await supabase
      .from("subjects")
      .select("*")
      .or(orFilter);

    const localSubs = loadCache<Subject[]>(KEYS.subjects, []);

    if (!subsErr && subsData && subsData.length > 0) {
      const mergedMap = new Map<string, Subject>();
      localSubs.forEach((s) => mergedMap.set(s.id, s));
      subsData.forEach((s) => mergedMap.set(s.id, s));
      saveCache(KEYS.subjects, Array.from(mergedMap.values()));
    } else if (localSubs.length > 0) {
      // Push local subjects to Supabase so they persist permanently
      const mySubs = localSubs.filter((s) => s.user_id === userId || (studentNo && s.student_number === studentNo));
      if (mySubs.length > 0) {
        void supabase.from("subjects").upsert(mySubs, { onConflict: "id" });
      }
    }

    // 3. Fetch announcements from Supabase
    const { data: annData, error: annErr } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!annErr && annData && annData.length > 0) {
      saveCache(KEYS.announcements, annData);
    } else {
      saveCache(KEYS.announcements, DEFAULT_ANNOUNCEMENTS);
    }

    // 4. Fetch award settings from Supabase
    const { data: awardsData, error: awardsErr } = await supabase
      .from("award_settings")
      .select("*");

    if (!awardsErr && awardsData && awardsData.length > 0) {
      saveCache(KEYS.awardSettings, awardsData);
    }

    window.dispatchEvent(new Event("sscr_store_synced"));
  } catch (err) {
    console.warn("Academic data sync notice:", err);
  }
}

export async function syncFromSupabase() {
  const session = getSession();
  if (session) {
    await syncUserAcademicData(session);
  }
}

// ── Auth & Profile Actions ────────────────────────────────────────────────

export function isUserOnline(userId: string): boolean {
  const currentSession = getSession();
  if (currentSession && currentSession.id === userId) return true;
  const onlineUsers = loadCache<string[]>("sscr_online_users", []);
  return onlineUsers.includes(userId);
}

export function setOnlineStatus(userId: string, online: boolean) {
  const onlineUsers = loadCache<string[]>("sscr_online_users", []);
  if (online) {
    if (!onlineUsers.includes(userId)) saveCache("sscr_online_users", [...onlineUsers, userId]);
  } else {
    saveCache("sscr_online_users", onlineUsers.filter((id) => id !== userId));
  }
}

export function getSession(): User | null {
  const session = loadCache<User | null>(KEYS.session, null);
  if (session) {
    setOnlineStatus(session.id, true);
  }
  return session;
}

export function clearSession() {
  const currentSession = loadCache<User | null>(KEYS.session, null);
  if (currentSession) {
    setOnlineStatus(currentSession.id, false);
  }
  // Only remove active login session so student academic data, officers, and settings persist safely across sessions
  localStorage.removeItem(getCacheKey(KEYS.session));
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export async function refreshSessionFromSupabase(supabaseUser?: any): Promise<User | null> {
  const currentUser = supabaseUser || (await supabase.auth.getUser()).data.user;
  if (!currentUser?.id || !currentUser.email) {
    return getSession();
  }

  const normalizedEmail = currentUser.email.trim().toLowerCase();

  // Search Google Sheets for authenticated email
  let matchedStudent: User | null = null;
  try {
    matchedStudent = await GoogleSheetsAuthService.findUserByEmail(normalizedEmail);
  } catch (err) {
    console.warn("Google Sheets session refresh error:", err);
  }

  if (!matchedStudent) {
    return getSession();
  }

  const isAdmin = normalizedEmail.includes("admin") || matchedStudent.role === "admin";
  const isFaculty = matchedStudent.role === "faculty";
  const resolvedRole = isAdmin ? "admin" : isFaculty ? "faculty" : "student";

  const sessionUser: User = {
    id: currentUser.id,
    uid: currentUser.id,
    full_name: matchedStudent.full_name,
    student_number: matchedStudent.student_number || `SSCR-${currentUser.id.slice(0, 6)}`,
    course: matchedStudent.course || "BSIT",
    year_level: matchedStudent.year_level || "1",
    role: resolvedRole as any,
    email: normalizedEmail,
    verified: true,
    status: "active",
    mustChangePassword: false,
    officer_position: matchedStudent.officer_position || "None",
  };

  saveCache(KEYS.session, sessionUser);
  await syncUserAcademicData(sessionUser);
  return sessionUser;
}

export function logout() {
  clearSession();
  void supabase.auth.signOut();
}


const OFFICER_OVERRIDES_KEY = "jpcs_officer_assignments";
const PHOTO_OVERRIDES_KEY = "jpcs_photo_assignments";
const PROFILE_OVERRIDES_KEY = "jpcs_profile_assignments";

export function getOfficerOverrides(): Record<string, string> {
  return loadCache<Record<string, string>>(OFFICER_OVERRIDES_KEY, {});
}

export function saveOfficerOverride(emailOrStudentNumber: string, position: string) {
  const overrides = getOfficerOverrides();
  const cleanKey = emailOrStudentNumber.trim().toLowerCase();
  if (!position || position === "None" || position === "") {
    delete overrides[cleanKey];
  } else {
    overrides[cleanKey] = position;
  }
  saveCache(OFFICER_OVERRIDES_KEY, overrides);
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export function getPhotoOverrides(): Record<string, string> {
  return loadCache<Record<string, string>>(PHOTO_OVERRIDES_KEY, {});
}

export function savePhotoOverride(emailOrStudentNumber: string, photoUrl: string) {
  const photos = getPhotoOverrides();
  const cleanKey = emailOrStudentNumber.trim().toLowerCase();
  if (!photoUrl) {
    delete photos[cleanKey];
  } else {
    photos[cleanKey] = photoUrl;
  }
  saveCache(PHOTO_OVERRIDES_KEY, photos);
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export function getProfileOverrides(): Record<string, Partial<User>> {
  return loadCache<Record<string, Partial<User>>>(PROFILE_OVERRIDES_KEY, {});
}

export function saveProfileOverride(emailOrStudentNumber: string, details: Partial<User>) {
  const overrides = getProfileOverrides();
  const cleanKey = emailOrStudentNumber.trim().toLowerCase();
  overrides[cleanKey] = { ...(overrides[cleanKey] || {}), ...details };
  saveCache(PROFILE_OVERRIDES_KEY, overrides);
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export function updateProfile(id: string, data: Partial<User>) {
  const users = loadCache<User[]>(KEYS.users, []);
  let targetUser: User | null = null;

  const updated = users.map((u) => {
    if (u.id === id || (u.email && data.email && u.email.toLowerCase() === data.email.toLowerCase()) || (u.student_number && data.student_number && u.student_number === data.student_number)) {
      const merged = { ...u, ...data };
      targetUser = merged;
      return merged;
    }
    return u;
  });

  if (!targetUser) {
    targetUser = {
      id: id || uid(),
      full_name: data.full_name || "Student",
      student_number: data.student_number || "",
      course: data.course || "BSIT",
      year_level: data.year_level ? String(data.year_level) : "1",
      role: data.role || "student",
      email: data.email || "",
      verified: true,
      officer_position: data.officer_position || "None",
      profile_photo: data.profile_photo || "",
    };
    updated.push(targetUser);
  }

  saveCache(KEYS.users, updated);

  if (data.profile_photo !== undefined) {
    if (targetUser.email) savePhotoOverride(targetUser.email, data.profile_photo);
    if (targetUser.student_number) savePhotoOverride(targetUser.student_number, data.profile_photo);
  }

  if (data.officer_position !== undefined) {
    if (targetUser.email) saveOfficerOverride(targetUser.email, data.officer_position);
    if (targetUser.student_number) saveOfficerOverride(targetUser.student_number, data.officer_position);
  }

  if (data.year_level !== undefined || data.course !== undefined || data.full_name !== undefined || data.student_number !== undefined) {
    const patch: Partial<User> = {};
    if (data.year_level !== undefined) patch.year_level = String(data.year_level);
    if (data.course !== undefined) patch.course = data.course;
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.student_number !== undefined) patch.student_number = data.student_number;
    if (targetUser.email) saveProfileOverride(targetUser.email, patch);
    if (targetUser.student_number) saveProfileOverride(targetUser.student_number, patch);
  }

  // Sync to Supabase user_credentials in background with complete fields
  if (targetUser.email) {
    const userEmail = targetUser.email.toLowerCase();
    void supabase
      .from("user_credentials")
      .upsert(
        {
          email: userEmail,
          profile_photo: targetUser.profile_photo || "",
          officer_position: targetUser.officer_position || "None",
          full_name: targetUser.full_name || "Student",
          student_number: targetUser.student_number || "",
          course: targetUser.course || "BSIT",
          year_level: String(targetUser.year_level || "1"),
          role: targetUser.role || "student",
          password_hash: "sscrmnlitdepartment",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
  }

  const session = getSession();
  if (session && (session.id === id || (session.email && targetUser.email && session.email.toLowerCase() === targetUser.email.toLowerCase()))) {
    saveCache(KEYS.session, { ...session, ...data });
  }

  window.dispatchEvent(new Event("sscr_store_synced"));
  return targetUser;
}

// ── Semesters ─────────────────────────────────────────────────────────────

export function getSemesters(userId: string): Semester[] {
  return loadCache<Semester[]>(KEYS.semesters, []).filter((s) => s.user_id === userId);
}

export function addSemester(data: Omit<Semester, "id">): Semester {
  const all = loadCache<Semester[]>(KEYS.semesters, []);
  const sem: Semester = { ...data, id: uid() };
  saveCache(KEYS.semesters, [...all, sem]);
  window.dispatchEvent(new Event("sscr_store_synced"));

  // Background Supabase sync
  void supabase.from("semesters").upsert([sem], { onConflict: "id" });
  return sem;
}

export async function createSemester(
  data: Omit<Semester, "id">,
): Promise<{ success: boolean; data: Semester | null; error?: string }> {
  const duplicate = getSemesters(data.user_id).find(
    (semester) =>
      semester.academic_year.replace("-", "–") === data.academic_year.replace("-", "–") &&
      semester.semester === data.semester,
  );
  if (duplicate) {
    return {
      success: false,
      data: null,
      error: `${data.academic_year} ${data.semester} already exists.`,
    };
  }

  const semester: Semester = { ...data, id: uid() };
  const current = loadCache<Semester[]>(KEYS.semesters, []);
  saveCache(KEYS.semesters, [...current.filter((item) => item.id !== semester.id), semester]);
  window.dispatchEvent(new Event("sscr_store_synced"));

  // Background Supabase sync
  void supabase.from("semesters").upsert([semester], { onConflict: "id" });
  return { success: true, data: semester };
}

export async function editSemester(
  id: string,
  data: Partial<Semester>,
): Promise<{ success: boolean; error?: string }> {
  const current = loadCache<Semester[]>(KEYS.semesters, []);
  const target = current.find((semester) => semester.id === id);
  if (!target) return { success: false, error: "Semester not found." };

  const nextAcademicYear = data.academic_year || target.academic_year;
  const nextSemesterName = data.semester || target.semester;
  const duplicate = current.find(
    (semester) =>
      semester.id !== id &&
      semester.user_id === target.user_id &&
      semester.academic_year.replace("-", "–") === nextAcademicYear.replace("-", "–") &&
      semester.semester === nextSemesterName,
  );
  if (duplicate) {
    return {
      success: false,
      error: `${nextAcademicYear} ${nextSemesterName} already exists.`,
    };
  }

  const updatedSem = { ...target, ...data };
  saveCache(KEYS.semesters, current.map((semester) => (
    semester.id === id ? updatedSem : semester
  )));
  window.dispatchEvent(new Event("sscr_store_synced"));

  // Background Supabase sync
  void supabase.from("semesters").update({
    academic_year: updatedSem.academic_year,
    semester: updatedSem.semester,
  }).eq("id", id);

  return { success: true };
}

export async function removeSemester(id: string): Promise<{ success: boolean; error?: string }> {
  const semesters = loadCache<Semester[]>(KEYS.semesters, []);
  const subjects = loadCache<Subject[]>(KEYS.subjects, []);
  saveCache(KEYS.semesters, semesters.filter((semester) => semester.id !== id));
  saveCache(KEYS.subjects, subjects.filter((subject) => subject.semester_id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));

  // Background Supabase delete
  void supabase.from("semesters").delete().eq("id", id);
  void supabase.from("subjects").delete().eq("semester_id", id);

  return { success: true };
}

export function updateSemester(id: string, data: Partial<Semester>) {
  const all = loadCache<Semester[]>(KEYS.semesters, []);
  const updated = all.map((s) => (s.id === id ? { ...s, ...data } : s));
  saveCache(KEYS.semesters, updated);
  window.dispatchEvent(new Event("sscr_store_synced"));

  void supabase.from("semesters").update(data).eq("id", id);
}

export function deleteSemester(id: string) {
  const allSems = loadCache<Semester[]>(KEYS.semesters, []);
  const allSubs = loadCache<Subject[]>(KEYS.subjects, []);

  saveCache(KEYS.semesters, allSems.filter((s) => s.id !== id));
  saveCache(KEYS.subjects, allSubs.filter((s) => s.semester_id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));

  void supabase.from("semesters").delete().eq("id", id);
  void supabase.from("subjects").delete().eq("semester_id", id);
}

// ── Subjects ──────────────────────────────────────────────────────────────

export function getSubjects(semesterId: string): Subject[] {
  const curriculum = loadCache<CurriculumItem[]>(KEYS.curriculum, DEFAULT_CURRICULUM);
  return loadCache<Subject[]>(KEYS.subjects, [])
    .filter((s) => s.semester_id === semesterId)
    .map((subject) =>
      applyCurriculumSchedule(
        subject.status === "Graded" && subject.grade <= 0
          ? { ...subject, status: "Currently Taking" }
          : subject,
        curriculum,
      ),
    );
}

export function getAllSubjects(userId: string): Subject[] {
  const semIds = getSemesters(userId).map((s) => s.id);
  const curriculum = loadCache<CurriculumItem[]>(KEYS.curriculum, DEFAULT_CURRICULUM);
  return loadCache<Subject[]>(KEYS.subjects, [])
    .filter((s) => semIds.includes(s.semester_id))
    .map((subject) =>
      applyCurriculumSchedule(
        subject.status === "Graded" && subject.grade <= 0
          ? { ...subject, status: "Currently Taking" }
          : subject,
        curriculum,
      ),
    );
}

export function addSubject(data: Omit<Subject, "id">): Subject {
  const all = loadCache<Subject[]>(KEYS.subjects, []);
  const sub: Subject = { ...data, id: uid() };
  saveCache(KEYS.subjects, [...all, sub]);
  window.dispatchEvent(new Event("sscr_store_synced"));

  // Background Supabase sync
  void supabase.from("subjects").upsert([
    {
      id: sub.id,
      semester_id: sub.semester_id,
      user_id: sub.user_id || "",
      student_number: sub.student_number || "",
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      units: Number(sub.units) || 3,
      grade: Number(sub.grade) || 0,
      status: sub.status || "Currently Taking",
      room: sub.room || "",
      schedule_day: sub.schedule_day || sub.schedule_days || "",
      schedule_start: sub.schedule_start || "",
      schedule_end: sub.schedule_end || "",
    },
  ], { onConflict: "id" });

  return sub;
}

export function updateSubject(id: string, data: Partial<Subject>) {
  const all = loadCache<Subject[]>(KEYS.subjects, []);
  const updated = all.map((s) => (s.id === id ? { ...s, ...data } : s));
  saveCache(KEYS.subjects, updated);
  window.dispatchEvent(new Event("sscr_store_synced"));

  const payload: any = {};
  if (data.subject_code !== undefined) payload.subject_code = data.subject_code;
  if (data.subject_name !== undefined) payload.subject_name = data.subject_name;
  if (data.units !== undefined) payload.units = Number(data.units);
  if (data.grade !== undefined) payload.grade = Number(data.grade);
  if (data.status !== undefined) payload.status = data.status;
  if (data.room !== undefined) payload.room = data.room;
  if (data.schedule_day !== undefined || data.schedule_days !== undefined) {
    payload.schedule_day = data.schedule_day || data.schedule_days;
  }
  if (data.schedule_start !== undefined) payload.schedule_start = data.schedule_start;
  if (data.schedule_end !== undefined) payload.schedule_end = data.schedule_end;
  payload.updated_at = new Date().toISOString();

  void supabase.from("subjects").update(payload).eq("id", id);
}

export function deleteSubject(id: string) {
  const all = loadCache<Subject[]>(KEYS.subjects, []);
  saveCache(KEYS.subjects, all.filter((s) => s.id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));

  void supabase.from("subjects").delete().eq("id", id);
}

// ── Calculations & Awards ─────────────────────────────────────────────────

export function hasRecordedFinalGrade(subject: Subject): boolean {
  const isFinal = subject.status === "Graded" || subject.status === undefined;
  return isFinal && Number.isFinite(subject.grade) && subject.grade > 0;
}

export function calculateGA(subjects: Subject[]): number {
  const graded = subjects.filter(hasRecordedFinalGrade);
  if (!graded.length) return 0;
  const totalWeighted = graded.reduce((sum, s) => sum + s.grade * s.units, 0);
  const totalUnits = graded.reduce((sum, s) => sum + s.units, 0);
  return totalUnits ? totalWeighted / totalUnits : 0;
}

export function checkAward(ga: number, subjects: Subject[], settings: AwardSetting[]): AwardResult {
  const graded = subjects.filter(hasRecordedFinalGrade);
  if (!graded.length) return { award: null, reason: "No graded subjects recorded." };

  const sorted = [...settings].sort((a, b) => b.minimum_average - a.minimum_average);
  let bestFailReason = "";

  for (const s of sorted) {
    if (ga < s.minimum_average) continue;
    const minGrade = Math.min(...graded.map((sub) => sub.grade));
    if (minGrade >= s.minimum_subject_grade) {
      return { award: s.award_name, reason: "" };
    }
    const belowMin = graded.filter((sub) => sub.grade < s.minimum_subject_grade);
    if (!bestFailReason) {
      bestFailReason = `${belowMin.length} subject${belowMin.length > 1 ? "s" : ""} below the minimum grade of ${s.minimum_subject_grade} required for ${s.award_name}.`;
    }
  }

  return {
    award: null,
    reason: bestFailReason || (ga > 0 ? "General average does not meet any award threshold." : "No graded subjects recorded."),
  };
}

// ── Curriculum ────────────────────────────────────────────────────────────

export function getCurriculum(filters?: { course?: string; year_level?: string; semester?: string }): CurriculumItem[] {
  let items = loadCache<CurriculumItem[]>(KEYS.curriculum, DEFAULT_CURRICULUM);
  if (filters?.course) items = items.filter((i) => i.course === filters.course);
  if (filters?.year_level) {
    items = items.filter((i) => String(i.year_level) === String(filters.year_level));
  }
  if (filters?.semester) items = items.filter((i) => i.semester === filters.semester);
  return items;
}

export function addCurriculumItem(data: Omit<CurriculumItem, "id">): CurriculumItem {
  const all = loadCache<CurriculumItem[]>(KEYS.curriculum, []);
  const item: CurriculumItem = { ...data, id: uid() };
  saveCache(KEYS.curriculum, [...all, item]);
  window.dispatchEvent(new Event("sscr_store_synced"));
  return item;
}

export async function updateCurriculumItem(
  id: string,
  data: Partial<CurriculumItem>,
): Promise<{ success: boolean; error?: string }> {
  const all = loadCache<CurriculumItem[]>(KEYS.curriculum, []);
  saveCache(KEYS.curriculum, all.map((i) => (i.id === id ? { ...i, ...data } : i)));
  window.dispatchEvent(new Event("sscr_store_synced"));
  return { success: true };
}

export function deleteCurriculumItem(id: string) {
  const all = loadCache<CurriculumItem[]>(KEYS.curriculum, []);
  saveCache(KEYS.curriculum, all.filter((i) => i.id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));
}

// ── Award Settings ────────────────────────────────────────────────────────

export function getAwardSettings(): AwardSetting[] {
  return loadCache<AwardSetting[]>(KEYS.awardSettings, DEFAULT_AWARD_SETTINGS);
}

export function saveAwardSettings(settings: AwardSetting[]) {
  saveCache(KEYS.awardSettings, settings);
  window.dispatchEvent(new Event("sscr_store_synced"));
}

// ── Announcements ─────────────────────────────────────────────────────────

export function getAnnouncements(): Announcement[] {
  return loadCache<Announcement[]>(KEYS.announcements, DEFAULT_ANNOUNCEMENTS).sort(
    (a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
}

export function addAnnouncement(data: Omit<Announcement, "id">): Announcement {
  const all = loadCache<Announcement[]>(KEYS.announcements, []);
  const item: Announcement = { ...data, id: uid() };
  saveCache(KEYS.announcements, [...all, item]);
  window.dispatchEvent(new Event("sscr_store_synced"));
  return item;
}

export function updateAnnouncement(id: string, data: Partial<Announcement>) {
  const all = loadCache<Announcement[]>(KEYS.announcements, []);
  saveCache(KEYS.announcements, all.map((i) => (i.id === id ? { ...i, ...data } : i)));
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export function deleteAnnouncement(id: string) {
  const all = loadCache<Announcement[]>(KEYS.announcements, []);
  saveCache(KEYS.announcements, all.filter((i) => i.id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));
}

// ── Admin operations ──────────────────────────────────────────────────────

export function getAllUsers(): User[] {
  const localUsers = loadCache<User[]>(KEYS.users, []);
  const sheetsAccountsRaw = localStorage.getItem("jpcs_sheets_accounts_cache");
  const overrides = getOfficerOverrides();
  const photoOverrides = getPhotoOverrides();
  const profileOverrides = getProfileOverrides();

  let mergedUsers: User[] = [];
  if (sheetsAccountsRaw) {
    try {
      const sheetUsers: User[] = JSON.parse(sheetsAccountsRaw);
      const mergedMap = new Map<string, User>();
      sheetUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
      localUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
      mergedUsers = Array.from(mergedMap.values());
    } catch {
      mergedUsers = localUsers;
    }
  } else {
    mergedUsers = localUsers;
  }

  // Apply officer assignment, photo, and profile details overrides
  return mergedUsers.map((u) => {
    const emailKey = u.email.toLowerCase();
    const noKey = (u.student_number || "").toLowerCase();
    const assignedPos = overrides[emailKey] || (noKey ? overrides[noKey] : undefined);
    const assignedPhoto = photoOverrides[emailKey] || (noKey ? photoOverrides[noKey] : undefined);
    const profileOverride = profileOverrides[emailKey] || (noKey ? profileOverrides[noKey] : undefined);

    let res = u;
    if (profileOverride) {
      res = { ...res, ...profileOverride };
    }
    if (assignedPos !== undefined) {
      res = { ...res, officer_position: assignedPos };
    }
    if (assignedPhoto !== undefined) {
      res = { ...res, profile_photo: assignedPhoto };
    }
    return res;
  });
}


export function verifyUserEmail(email: string): boolean {
  const users = loadCache<User[]>(KEYS.users, []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    users[idx].verified = true;
    saveCache(KEYS.users, users);
    window.dispatchEvent(new Event("sscr_store_synced"));
    return true;
  }
  return false;
}

export function deleteUser(id: string) {
  const users = loadCache<User[]>(KEYS.users, []);
  saveCache(KEYS.users, users.filter((u) => u.id !== id));
  window.dispatchEvent(new Event("sscr_store_synced"));
}

export function compressImage(file: File, maxWidth = 600, maxHeight = 600, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadOfficerImageToStorage(file: File, officerId: string, type: "default" | "hover"): Promise<{ url: string; path?: string }> {
  const dataUrl = await compressImage(file);
  return { url: dataUrl };
}

export async function deleteOfficerImageFromStorage(pathOrUrl?: string) {
  // No-op for base64 / local asset photos
}

