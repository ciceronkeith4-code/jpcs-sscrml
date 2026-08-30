import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Input, Select, PageHeader, Alert, Modal } from "../components/ui";
import { StorageService } from "../../services/storage.service";
import { updateProfile } from "../store";
import { changeUserPassword } from "../auth/auth";
import { supabase } from "../../lib/supabaseClient";
import type { User } from "../../types";

const COURSES = [
  { value: "BSIT", label: "BS Information Technology" },
];

const YEAR_LEVELS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
];

export function ProfilePage({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account Form State
  const [pForm, setPForm] = useState({
    full_name: user.full_name,
    student_number: user.student_number,
    course: user.course,
    year_level: user.year_level,
    email: user.email,
  });
  const [pSuccess, setPSuccess] = useState(false);
  const [pError, setPError] = useState("");
  const [pLoading, setPLoading] = useState(false);

  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Password Show / Hide State
  const [studentPassword, setStudentPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  // Change Password Modal State
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // User Guide Active Tab
  const [activeGuideTab, setActiveGuideTab] = useState<"curriculum" | "password" | "photo" | "gpa">("curriculum");

  useEffect(() => {
    setPForm({
      full_name: user.full_name,
      student_number: user.student_number,
      course: user.course,
      year_level: user.year_level,
      email: user.email,
    });

    async function fetchUserPassword() {
      if (!user?.email) return;
      try {
        const { data } = await supabase
          .from("user_credentials")
          .select("password_hash, profile_photo")
          .eq("email", user.email.trim().toLowerCase())
          .maybeSingle();

        if (data?.password_hash) {
          setStudentPassword(data.password_hash);
        } else {
          setStudentPassword("sscrmnlitdepartment");
        }

        if (data?.profile_photo && !user.profile_photo) {
          onUpdate({ ...user, profile_photo: data.profile_photo });
        }
      } catch {
        setStudentPassword("sscrmnlitdepartment");
      }
    }
    fetchUserPassword();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPError("");
    setPSuccess(false);
    setPLoading(true);
    try {
      const updated: User = {
        ...user,
        full_name: pForm.full_name,
        student_number: pForm.student_number,
        course: pForm.course,
        year_level: pForm.year_level,
      };

      updateProfile(user.id, updated);
      onUpdate(updated);

      // Also persist to Supabase user_credentials
      if (user.email) {
        const passwordToPersist = (studentPassword && studentPassword !== "••••••••••••") ? studentPassword : "sscrmnlitdepartment";
        await supabase
          .from("user_credentials")
          .upsert(
            {
              email: user.email.trim().toLowerCase(),
              password_hash: passwordToPersist,
              full_name: pForm.full_name || user.full_name || user.email.split("@")[0],
              student_number: pForm.student_number || user.student_number || `SSCR-${user.email.split("@")[0]}`,
              course: pForm.course || user.course || "BSIT",
              year_level: String(pForm.year_level || user.year_level || "1"),
              role: user.role || "student",
              officer_position: user.officer_position || "None",
              profile_photo: user.profile_photo || "",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          );
      }

      setPSuccess(true);
      setTimeout(() => setPSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile update failed", err);
      setPError(err?.message || "Failed to save profile changes.");
    } finally {
      setPLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setPassLoading(true);
    try {
      // Pass newPass as 1st argument (newPassword) and studentPassword as 2nd argument (currentPassword)
      await changeUserPassword(newPass, studentPassword && studentPassword !== "••••••••••••" ? studentPassword : undefined);
      setStudentPassword(newPass);
      setPassSuccess("Password successfully changed and synced with database!");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        setShowChangePassModal(false);
        setPassSuccess("");
      }, 1500);
    } catch (err: any) {
      setPassError(err?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const photoUrl = await StorageService.uploadProfilePhoto(user.id || user.email, file, user.profile_photo);
      
      const updated: User = {
        ...user,
        profile_photo: photoUrl,
      };

      updateProfile(user.id, updated);
      onUpdate(updated);

      // Save photo URL to Supabase user_credentials with all required non-null fields
      if (user.email) {
        const passwordToPersist = (studentPassword && studentPassword !== "••••••••••••") ? studentPassword : "sscrmnlitdepartment";
        await supabase
          .from("user_credentials")
          .upsert(
            {
              email: user.email.trim().toLowerCase(),
              password_hash: passwordToPersist,
              full_name: user.full_name || user.email.split("@")[0],
              student_number: user.student_number || `SSCR-${user.email.split("@")[0]}`,
              course: user.course || "BSIT",
              year_level: String(user.year_level || "1"),
              role: user.role || "student",
              officer_position: user.officer_position || "None",
              profile_photo: photoUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          );
      }

      setUploadSuccess("Profile photo uploaded and synced successfully!");
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setUploadError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processAndUploadFile(file);
    }
    // reset input value so re-uploading same file name works
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      void processAndUploadFile(file);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user.profile_photo || !window.confirm("Are you sure you want to remove your profile photo?")) return;

    setRemovingPhoto(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      await StorageService.deleteProfilePhoto(user.profile_photo);

      const updated: User = {
        ...user,
        profile_photo: "",
      };

      updateProfile(user.id, updated);
      onUpdate(updated);

      // Update Supabase user_credentials
      if (user.email) {
        const passwordToPersist = (studentPassword && studentPassword !== "••••••••••••") ? studentPassword : "sscrmnlitdepartment";
        await supabase
          .from("user_credentials")
          .upsert(
            {
              email: user.email.trim().toLowerCase(),
              password_hash: passwordToPersist,
              full_name: user.full_name || user.email.split("@")[0],
              student_number: user.student_number || `SSCR-${user.email.split("@")[0]}`,
              course: user.course || "BSIT",
              year_level: String(user.year_level || "1"),
              role: user.role || "student",
              officer_position: user.officer_position || "None",
              profile_photo: "",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          );
      }

      setUploadSuccess("Profile photo removed.");
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to remove profile photo.");
    } finally {
      setRemovingPhoto(false);
    }
  };

  const fullName = user?.full_name || "User";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Student Identity & Profile"
        subtitle="Manage your official SSCR Manila IT Department credentials, profile picture, and academic identity."
      />

      <div className="space-y-6">
        {/* ── Photo Upload & Avatar Card ─────────────────────────────────── */}
        <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Profile Photo</h3>
              <p className="text-xs text-slate-500">
                Upload your official photo. This is saved to Supabase Storage and displayed across the portal and officer roster.
              </p>
            </div>
            {user.profile_photo && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                loading={removingPhoto}
                disabled={uploading}
                onClick={handleAvatarRemove}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 text-xs"
              >
                Remove Photo
              </Button>
            )}
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 animate-pulse font-semibold">
              <svg className="animate-spin size-4 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Compressing and uploading photo to Supabase Storage...
            </div>
          )}
          {uploadError && <Alert variant="error" className="text-xs">{uploadError}</Alert>}
          {uploadSuccess && <Alert variant="success" className="text-xs">{uploadSuccess}</Alert>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="relative group">
                <div className="size-28 sm:size-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user.full_name}
                      className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl font-black text-slate-500 tracking-wider">{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-[#800000] text-white rounded-full shadow-md hover:bg-[#660000] transition-colors cursor-pointer"
                  title="Change photo"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{user.full_name}</p>
                <span className="inline-block mt-1 text-[10px] bg-slate-200/70 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  {user.student_number || "Student"}
                </span>
              </div>
            </div>

            {/* Drag & Drop Upload Dropzone */}
            <div className="md:col-span-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-[#800000] bg-rose-50/70 scale-[1.01]"
                    : "border-slate-300 hover:border-[#800000] hover:bg-slate-50/80 bg-slate-50/40"
                }`}
              >
                <div className={`p-3 rounded-full transition-colors ${isDragging ? "bg-rose-100 text-[#800000]" : "bg-slate-100 text-slate-600"}`}>
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    <span className="text-[#800000] underline">Click to choose image from folder / gallery</span> or drag & drop here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PNG, JPG, JPEG, or WebP (Auto-compressed and saved to Supabase Storage)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Account Details & Settings Card ───────────────────────────── */}
        <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Account Details</h3>
            <p className="text-xs text-slate-500">Update your student profile information.</p>
          </div>

          {pSuccess && <Alert variant="success" className="text-xs">Profile details saved successfully.</Alert>}
          {pError && <Alert variant="error" className="text-xs">{pError}</Alert>}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Full Name"
              value={pForm.full_name}
              onChange={(e) => setPForm((f) => ({ ...f, full_name: e.target.value }))}
              required
            />

            {!isAdmin && (
              <>
                <Input
                  label="Student Number"
                  value={pForm.student_number}
                  onChange={(e) => setPForm((f) => ({ ...f, student_number: e.target.value }))}
                  placeholder="e.g. 2026-1030"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Program / Course"
                    value={pForm.course}
                    onChange={(e) => setPForm((f) => ({ ...f, course: e.target.value }))}
                    options={COURSES}
                  />
                  <Select
                    label="Year Level"
                    value={pForm.year_level}
                    onChange={(e) => setPForm((f) => ({ ...f, year_level: e.target.value }))}
                    options={YEAR_LEVELS}
                  />
                </div>
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              value={pForm.email}
              readOnly
              hint="Your institutional email address cannot be changed."
            />

            {/* Password Section with Eye Toggle and Change Password Action */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(true)}
                  className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={showPassword ? studentPassword : "••••••••••••"}
                  readOnly
                  className="w-full pr-12 bg-slate-50 text-slate-700 font-mono focus:ring-[#800000]/20 focus:border-[#800000]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={pLoading} className="px-6 font-bold shadow-xs">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* ── User Guide ──────────────────────────────────────────────── */}
        <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">User Guide</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick instructions for curriculum subjects and account security.</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveGuideTab("curriculum")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === "curriculum" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Curriculum Subjects
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("password")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === "password" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Change Password
              </button>
            </div>
          </div>

          {activeGuideTab === "curriculum" ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Check Official Schedule</p>
                  <p className="text-xs text-slate-500 mt-0.5">Navigate to Curriculum to view the official schedule, units, faculty, and room assignments for BSIT 1 to BSIT 4.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Create Academic Semester</p>
                  <p className="text-xs text-slate-500 mt-0.5">Open Semesters from the sidebar and click Add Semester (e.g., 2026–2027 First Semester).</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Enroll Subjects</p>
                  <p className="text-xs text-slate-500 mt-0.5">Click Add Subject inside your semester, type the subject code (e.g., ITE101), and save.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Track Grades & Automatic Sync</p>
                  <p className="text-xs text-slate-500 mt-0.5">Encode grades to calculate term GPA. All data is automatically saved and synchronized to Supabase.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Open Change Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Click the Change Password button located next to the Password field in Account Details above.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Enter New Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Input your new password (minimum 6 characters) and re-type to confirm.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3">
                <span className="size-5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Save & Apply</p>
                  <p className="text-xs text-slate-500 mt-0.5">Click Save New Password. Your credentials are automatically updated in Supabase for your next login.</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Change Password Modal ───────────────────────────────────────── */}
      <Modal
        open={showChangePassModal}
        onClose={() => setShowChangePassModal(false)}
        title="Change Account Password"
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter a new password for your account (minimum 6 characters).
          </p>

          {passError && <Alert variant="error" className="text-xs">{passError}</Alert>}
          {passSuccess && <Alert variant="success" className="text-xs">{passSuccess}</Alert>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">New Password</label>
            <Input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password (min. 6 chars)"
              className="focus:ring-[#800000]/20 focus:border-[#800000]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Confirm New Password</label>
            <Input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Re-type new password"
              className="focus:ring-[#800000]/20 focus:border-[#800000]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangePassModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={passLoading}
              className="bg-[#800000] text-white hover:bg-[#660000] font-bold"
            >
              Save New Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
