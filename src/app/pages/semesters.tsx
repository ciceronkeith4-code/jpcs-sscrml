import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card, Button, Modal, Input, Select, PageHeader, Badge, EmptyState, ConfirmDialog,
  AwardDisplay, Dropdown, Alert, cn,
} from "../components/ui";

import {
  getSemesters, createSemester, editSemester, removeSemester,
  getSubjects, calculateGA, checkAward, getAwardSettings, getCurriculum,
  saveSubject, addSubject, updateSubject, deleteSubject, deleteSubjectAsync,
  saveSelectedSemester, getSelectedSemesterId, importCurriculumForStudent,
} from "../store";
import type { User, Semester, Subject } from "../../types";

const today = new Date();
const currentAcademicYearStart = today.getMonth() + 1 >= 6
  ? today.getFullYear()
  : today.getFullYear() - 1;
const DEFAULT_ACADEMIC_YEAR = `${currentAcademicYearStart}–${currentAcademicYearStart + 1}`;
const ACADEMIC_YEARS = Array.from(
  { length: Math.max(8, currentAcademicYearStart - 2019) },
  (_, index) => {
    const start = 2020 + index;
    const value = `${start}–${start + 1}`;
    return { value, label: value };
  },
);
const SEMESTER_OPTIONS = [
  { value: "First Semester", label: "First Semester" },
  { value: "Second Semester", label: "Second Semester" },
  { value: "Summer", label: "Summer" },
];

const YEAR_LEVEL_OPTIONS = [
  { value: "BSIT 1", label: "1st Year (BSIT 1)" },
  { value: "BSIT 2", label: "2nd Year (BSIT 2)" },
  { value: "BSIT 3", label: "3rd Year (BSIT 3)" },
  { value: "BSIT 4", label: "4th Year (BSIT 4)" },
];

const BLOCK_OPTIONS = [
  { value: "A", label: "Block A" },
  { value: "B", label: "Block B" },
  { value: "AB", label: "Block AB" },
];

export function SemestersPage({ user }: { user: User }) {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState(() => getSemesters(user.id));
  const awardSettings = getAwardSettings();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [deleting, setDeleting] = useState<Semester | null>(null);
  const [form, setForm] = useState({ academic_year: DEFAULT_ACADEMIC_YEAR, semester: "First Semester" });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const refresh = useCallback(() => setSemesters(getSemesters(user.id)), [user.id]);

  useEffect(() => {
    const handleSync = () => refresh();
    window.addEventListener("sscr_store_synced", handleSync);
    return () => window.removeEventListener("sscr_store_synced", handleSync);
  }, [refresh]);

  const openAdd = () => {
    setActionError("");
    setForm({ academic_year: DEFAULT_ACADEMIC_YEAR, semester: "First Semester" });
    setModal("add");
  };
  const openEdit = (sem: Semester) => {
    setActionError("");
    setEditing(sem);
    setForm({ academic_year: sem.academic_year, semester: sem.semester });
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    setActionError("");

    const result = modal === "add"
      ? await createSemester({ ...form, user_id: user.id }, user)
      : editing
        ? await editSemester(editing.id, form, user)
        : { success: false, error: "No semester was selected." };

    setSaving(false);
    if (!result.success) {
      setActionError(result.error || "Unable to save semester.");
      return;
    }

    setModal(null);
    setEditing(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setActionError("");
    const result = await removeSemester(deleting.id, user);
    setSaving(false);
    if (!result.success) {
      setActionError(result.error || "Unable to delete semester.");
      return;
    }
    setDeleting(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Semesters"
        subtitle="Manage your academic semesters and grades."
        action={<Button onClick={openAdd}>Add Semester</Button>}
      />

      {actionError && !modal && (
        <Alert variant="error" className="mb-5">{actionError}</Alert>
      )}

      {semesters.length === 0 ? (
        <EmptyState
          title="No semesters yet"
          description="Create your first semester to start recording grades."
          action={<Button onClick={openAdd}>Add Semester</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {semesters.map((sem) => {
            const subjects = getSubjects(sem.id);
            const ga = calculateGA(subjects);
            const award = checkAward(ga, subjects, awardSettings);
            return (
              <Card
                key={sem.id}
                hover
                className="p-5 flex flex-col gap-4"
                onClick={() => navigate(`/semesters/${sem.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{sem.academic_year}</p>
                    <p className="text-base font-semibold text-foreground mt-0.5">{sem.semester}</p>
                  </div>
                  <Dropdown
                    trigger={
                      <div className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                      </div>
                    }
                    items={[
                      { label: "View Subjects", onClick: () => navigate(`/semesters/${sem.id}`), icon: <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
                      { label: "Edit Semester", onClick: () => openEdit(sem), icon: <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
                      { label: "Delete Semester", onClick: () => setDeleting(sem), destructive: true, icon: <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/semesters/${sem.id}`); }}
                    className="bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg p-3 text-center transition-all active:scale-95 cursor-pointer group"
                  >
                    <p className="text-lg font-semibold text-foreground tabular-nums group-hover:text-primary transition-colors">{ga > 0 ? ga.toFixed(2) : "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">GA</p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/semesters/${sem.id}`); }}
                    className="bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg p-3 text-center transition-all active:scale-95 cursor-pointer group"
                  >
                    <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{subjects.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Subjects</p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/semesters/${sem.id}`); }}
                    className="bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg p-3 text-center transition-all active:scale-95 cursor-pointer group"
                  >
                    <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{subjects.reduce((s, sub) => s + sub.units, 0)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Units</p>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <AwardDisplay award={award.award} />
                  <span className="text-xs text-muted-foreground">View subjects →</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "add" ? "New Semester" : "Edit Semester"} size="sm">
        <div className="flex flex-col gap-4">
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <Select label="Academic Year" value={form.academic_year} onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))} options={ACADEMIC_YEARS} />
          <Select label="Semester" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} options={SEMESTER_OPTIONS} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete semester?"
        description={`This will permanently delete "${deleting?.academic_year} ${deleting?.semester}" and all its subjects.`}
        loading={saving}
      />
    </div>
  );
}

// ── Subject Management ─────────────────────────────────────────────────────

export function SubjectsPage({ user }: { user: User }) {
  const { semesterId: paramSemId } = useParams();
  const [tick, setTick] = useState(0);
  const semesters = getSemesters(user.id);
  const initialSemId = paramSemId ?? getSelectedSemesterId(user) ?? semesters[semesters.length - 1]?.id ?? "";
  const [selectedSemId, setSelectedSemId] = useState<string>(initialSemId);
  const [subjects, setSubjects] = useState<Subject[]>(() => selectedSemId ? getSubjects(selectedSemId) : []);
  const [modal, setModal] = useState<"add" | "edit" | "import" | null>(null);
  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Subject Add/Edit Form State
  const [form, setForm] = useState({
    subject_code: "",
    subject_name: "",
    units: "3",
    grade: "",
    status: "Currently Taking" as "Currently Taking" | "Waiting" | "Graded",
    block: "A" as "A" | "B" | "AB",
    schedule_days: "",
    schedule_time: "",
    room: "",
    faculty: "",
  });

  // Change Curriculum Form State
  const defaultYearTag = user.year_level === "4" ? "BSIT 4" : user.year_level === "3" ? "BSIT 3" : user.year_level === "2" ? "BSIT 2" : "BSIT 1";
  const [currForm, setCurrForm] = useState({
    academic_year: DEFAULT_ACADEMIC_YEAR,
    semester: "First Semester",
    year_level: defaultYearTag,
    block: "A",
    auto_import: true,
  });

  const awardSettings = getAwardSettings();
  const currentSem = semesters.find((s) => s.id === selectedSemId);
  const ga = calculateGA(subjects);
  const award = checkAward(ga, subjects, awardSettings);

  const refreshSubjects = useCallback((semId: string) => {
    if (!semId) {
      setSubjects([]);
      return;
    }
    setSubjects(getSubjects(semId));
  }, []);

  useEffect(() => {
    if (!selectedSemId && semesters.length > 0) {
      const activeId = getSelectedSemesterId(user) || semesters[semesters.length - 1]?.id;
      setSelectedSemId(activeId);
      refreshSubjects(activeId);
    }
  }, [semesters, selectedSemId, user, refreshSubjects]);

  useEffect(() => {
    const handleSync = () => {
      setTick((t) => t + 1);
      if (selectedSemId) refreshSubjects(selectedSemId);
    };
    window.addEventListener("sscr_store_synced", handleSync);
    return () => window.removeEventListener("sscr_store_synced", handleSync);
  }, [selectedSemId, refreshSubjects]);

  const handleSemChange = async (semId: string) => {
    setSelectedSemId(semId);
    refreshSubjects(semId);
    if (semId) {
      await saveSelectedSemester(user, semId);
    }
  };

  const [importYear, setImportYear] = useState("1");
  const [importSem, setImportSem] = useState("First Semester");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");

  const curriculumItems = currentSem
    ? getCurriculum({ course: user.course })
    : [];

  const availableCurriculumItems = curriculumItems.filter(
    (item) => !subjects.some((s) => s.subject_code === item.subject_code)
  );

  const openAdd = () => {
    setStatusMessage(null);
    setEditingId(null);
    setSelectedCurriculumId("");
    setForm({
      subject_code: "",
      subject_name: "",
      units: "3",
      grade: "",
      status: "Currently Taking",
      block: "A",
      schedule_days: "",
      schedule_time: "",
      room: "",
      faculty: "",
    });
    setModal("add");
  };

  const openEdit = (id: string) => {
    setStatusMessage(null);
    const sub = subjects.find((s) => s.id === id);
    if (!sub) return;
    setEditingId(id);
    const match = curriculumItems.find((c) => c.subject_code === sub.subject_code);
    setSelectedCurriculumId(match ? match.id : "");
    setForm({
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      units: String(sub.units),
      grade: sub.status === "Graded" || sub.status === undefined ? String(sub.grade) : "",
      status: sub.status ?? "Graded",
      block: (sub.block as any) || "A",
      schedule_days: sub.schedule_days || sub.schedule_day || "",
      schedule_time: sub.schedule_time || "",
      room: sub.room || "",
      faculty: sub.faculty || "",
    });
    setModal("edit");
  };

  const handleCurriculumSubjectChange = (id: string) => {
    setSelectedCurriculumId(id);
    const item = curriculumItems.find((c) => c.id === id);
    if (item) {
      setForm((f) => ({
        ...f,
        subject_code: item.subject_code,
        subject_name: item.subject_name,
        units: String(item.units),
        block: (item.block as any) || f.block,
        schedule_days: item.schedule_days || "",
        schedule_time: item.schedule_time || "",
        room: item.room || "",
        faculty: item.faculty || "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        subject_code: "",
        subject_name: "",
        units: "3",
      }));
    }
  };

  const filteredImportItems = curriculumItems.filter(
    (item) => String(item.year_level) === String(importYear) && item.semester === importSem
  );

  const handleSave = async () => {
    if (!selectedSemId) return;
    setSaving(true);
    setStatusMessage(null);

    const parsedGrade = form.grade.trim() !== "" ? parseFloat(form.grade) : 0;
    const data: Omit<Subject, "id"> = {
      semester_id: selectedSemId,
      user_id: user.id,
      student_number: user.student_number,
      subject_code: form.subject_code.trim(),
      subject_name: form.subject_name.trim(),
      units: parseInt(form.units) || 3,
      grade: form.status === "Graded" ? (isNaN(parsedGrade) ? 0 : parsedGrade) : 0,
      status: form.status,
      block: form.block,
      schedule_days: form.schedule_days,
      schedule_time: form.schedule_time,
      room: form.room,
      faculty: form.faculty,
    };

    const result = await saveSubject(data, user, editingId || undefined);
    setSaving(false);

    if (!result.success) {
      setStatusMessage({ type: "error", text: result.error || "Unable to save subject to database." });
      return;
    }

    setStatusMessage({ type: "success", text: "Subject saved successfully." });
    setModal(null);
    refreshSubjects(selectedSemId);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setStatusMessage(null);

    const result = await deleteSubjectAsync(deleting);
    setSaving(false);

    if (!result.success) {
      setStatusMessage({ type: "error", text: result.error || "Unable to remove subject." });
      return;
    }

    setDeleting(null);
    setStatusMessage({ type: "success", text: "Subject removed successfully." });
    refreshSubjects(selectedSemId);
  };

  const handleImport = async (items: typeof curriculumItems) => {
    if (!selectedSemId) return;
    setSaving(true);
    setStatusMessage(null);

    let count = 0;
    for (const item of items) {
      if (!subjects.find((s) => s.subject_code === item.subject_code)) {
        await saveSubject({
          semester_id: selectedSemId,
          user_id: user.id,
          student_number: user.student_number,
          subject_code: item.subject_code,
          subject_name: item.subject_name,
          units: item.units,
          grade: 0,
          status: "Currently Taking",
          block: (item.block as any) || "A",
          schedule_days: item.schedule_days,
          schedule_time: item.schedule_time,
          room: item.room,
          faculty: item.faculty,
        }, user);
        count++;
      }
    }

    setSaving(false);
    setStatusMessage({ type: "success", text: `Successfully imported ${count} subject${count !== 1 ? "s" : ""} from curriculum.` });
    refreshSubjects(selectedSemId);
    setModal(null);
  };

  // [ Change Curriculum / Semester ] Modal Flow
  const handleApplyCurriculumChange = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      // 1. Check if semester exists, create if not
      let targetSem = semesters.find(
        (s) =>
          s.academic_year.replace("-", "–") === currForm.academic_year.replace("-", "–") &&
          s.semester === currForm.semester
      );

      if (!targetSem) {
        const createRes = await createSemester({
          academic_year: currForm.academic_year,
          semester: currForm.semester,
          user_id: user.id,
          student_number: user.student_number,
          year_level: currForm.year_level.replace("BSIT ", "").trim(),
          course: "BSIT",
        }, user);

        if (!createRes.success || !createRes.data) {
          throw new Error(createRes.error || "Failed to create new semester.");
        }
        targetSem = createRes.data;
      }

      // 2. Persist active semester selection in Supabase
      await saveSelectedSemester(user, targetSem.id);
      setSelectedSemId(targetSem.id);

      // 3. If auto_import requested and semester has no subjects, import curriculum template
      if (currForm.auto_import) {
        const existingSubjects = getSubjects(targetSem.id);
        if (existingSubjects.length === 0) {
          await importCurriculumForStudent(user, targetSem.id, currForm.year_level, currForm.block);
        }
      }

      setSaving(false);
      setCurriculumModalOpen(false);
      setStatusMessage({ type: "success", text: `Active curriculum changed to ${currForm.academic_year} · ${currForm.semester} (${currForm.year_level}).` });
      refreshSubjects(targetSem.id);
    } catch (err: any) {
      setSaving(false);
      setStatusMessage({ type: "error", text: err?.message || "Failed to update curriculum and semester." });
    }
  };

  const semOptions = [
    { value: "", label: "Select semester" },
    ...semesters.map((s) => ({ value: s.id, label: `${s.academic_year} · ${s.semester}` })),
  ];

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Record and manage your subjects, schedules, and final grades."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurriculumModalOpen(true)}
              className="border-primary/40 text-primary hover:bg-primary/5 font-bold"
            >
              <svg className="size-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Change Semester / Curriculum
            </Button>
            {selectedSemId && (
              <>
                <Button variant="outline" size="sm" onClick={() => setModal("import")}>Import from Curriculum</Button>
                <Button size="sm" onClick={openAdd}>Add Subject</Button>
              </>
            )}
          </div>
        }
      />

      {statusMessage && (
        <Alert variant={statusMessage.type} className="mb-5">
          {statusMessage.text}
        </Alert>
      )}

      {/* Semester selector & Change Curriculum Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Select
            value={selectedSemId}
            onChange={(e) => void handleSemChange(e.target.value)}
            options={semOptions}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setCurriculumModalOpen(true)}
          className="shrink-0 text-xs font-semibold"
        >
          <svg className="size-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Change Curriculum
        </Button>
      </div>

      {!selectedSemId ? (
        <EmptyState
          title="No Active Semester Selected"
          description="Choose a semester above or click 'Change Semester / Curriculum' to set up your subjects."
          action={<Button onClick={() => setCurriculumModalOpen(true)}>Set Up Curriculum</Button>}
        />
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-xl font-semibold text-foreground tabular-nums">{ga > 0 ? ga.toFixed(2) : "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">General Average</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-xl font-semibold text-foreground">{subjects.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subjects</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-xl font-semibold text-foreground">{subjects.reduce((s, sub) => s + sub.units, 0)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Units</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <AwardDisplay award={award.award} reason={award.reason} />
              <p className="text-xs text-muted-foreground mt-1.5">Award Status</p>
            </div>
          </div>

          {/* Subjects table */}
          <Card>
            {subjects.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Block</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Code</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Subject Name</th>
                      <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Units</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Days</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Room</th>
                      <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Final Grade</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => {
                      const block = sub.block || "A";
                      const isB = block === "B";
                      const isAB = block === "AB";
                      return (
                        <tr key={sub.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors font-medium">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                              isB ? "bg-purple-100 text-purple-900 border-purple-300" :
                              isAB ? "bg-amber-100 text-amber-950 border-amber-300" :
                              "bg-blue-100 text-blue-900 border-blue-300"
                            }`}>
                              BLK {block}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                              {sub.subject_code}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-foreground font-bold">{sub.subject_name}</td>
                          <td className="px-5 py-3.5 text-center text-muted-foreground font-bold">{sub.units}</td>
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{sub.schedule_days || sub.schedule_day || "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{sub.schedule_time || (sub.schedule_start && sub.schedule_end ? `${sub.schedule_start} - ${sub.schedule_end}` : "—")}</td>
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{sub.room || "—"}</td>
                          <td className="px-5 py-3.5 text-center">
                            {sub.status === "Currently Taking" ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                Taking
                              </span>
                            ) : sub.status === "Waiting" ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                                Waiting
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center w-14 py-1 rounded-md text-xs font-bold tabular-nums ${
                                sub.grade >= 95 ? "bg-indigo-600 text-white" :
                                sub.grade >= 90 ? "bg-emerald-600 text-white" :
                                sub.grade >= 85 ? "bg-amber-500 text-white" :
                                sub.grade >= 75 ? "bg-slate-500 text-white" :
                                "bg-red-600 text-white"
                              }`}>{sub.grade}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(sub.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => setDeleting(sub.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No subjects yet in this semester"
                description="Add subjects manually, import from official curriculum, or use Change Curriculum."
                action={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setModal("import")}>Import Curriculum</Button>
                    <Button size="sm" onClick={openAdd}>Add Subject</Button>
                  </div>
                }
              />
            )}
          </Card>
        </>
      )}

      {/* ── [ Change Curriculum / Semester ] Modal ──────────────────── */}
      <Modal
        open={curriculumModalOpen}
        onClose={() => !saving && setCurriculumModalOpen(false)}
        title="Change Semester / Curriculum"
        size="md"
      >
        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Select your academic term and official curriculum cohort. Your selection will be permanently saved to Supabase.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Academic Year"
              value={currForm.academic_year}
              onChange={(e) => setCurrForm((f) => ({ ...f, academic_year: e.target.value }))}
              options={ACADEMIC_YEARS}
            />
            <Select
              label="Semester"
              value={currForm.semester}
              onChange={(e) => setCurrForm((f) => ({ ...f, semester: e.target.value }))}
              options={SEMESTER_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Curriculum Year Level"
              value={currForm.year_level}
              onChange={(e) => setCurrForm((f) => ({ ...f, year_level: e.target.value }))}
              options={YEAR_LEVEL_OPTIONS}
            />
            <Select
              label="Section / Block"
              value={currForm.block}
              onChange={(e) => setCurrForm((f) => ({ ...f, block: e.target.value }))}
              options={BLOCK_OPTIONS}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Auto-Populate Subjects</span>
              <span className="text-[11px] text-slate-500 block">Copy official BSIT curriculum subjects into your semester load</span>
            </div>
            <input
              type="checkbox"
              checked={currForm.auto_import}
              onChange={(e) => setCurrForm((f) => ({ ...f, auto_import: e.target.checked }))}
              className="size-4 text-[#800000] rounded focus:ring-[#800000] cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setCurriculumModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleApplyCurriculumChange} loading={saving}>
              Save & Apply Curriculum
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Subject Add/Edit Modal ─────────────────────────────────── */}
      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "add" ? "Add Subject" : "Edit Subject"} size="sm">
        <div className="p-6 flex flex-col gap-4">
          
          {modal === "add" && (
            <Select
              label="Pre-fill from Curriculum (Optional)"
              value={selectedCurriculumId}
              onChange={(e) => handleCurriculumSubjectChange(e.target.value)}
              options={[
                { value: "", label: "Type custom subject, or choose to pre-fill..." },
                ...availableCurriculumItems.map((c) => ({
                  value: c.id,
                  label: `${c.subject_code} - ${c.subject_name} (${c.units} units)`
                }))
              ]}
            />
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Subject Code"
                placeholder="ITP123"
                value={form.subject_code}
                onChange={(e) => setForm((f) => ({ ...f, subject_code: e.target.value }))}
              />
            </div>
            <div>
              <Select
                label="Block"
                value={form.block}
                onChange={(e) => setForm((f) => ({ ...f, block: e.target.value as any }))}
                options={BLOCK_OPTIONS}
              />
            </div>
          </div>

          <Input
            label="Subject Name"
            placeholder="System Administration & Maintenance"
            value={form.subject_name}
            onChange={(e) => setForm((f) => ({ ...f, subject_name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Units"
              value={form.units}
              onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
              options={[1,2,3,4,5,6].map((n) => ({ value: String(n), label: `${n} unit${n > 1 ? "s" : ""}` }))}
            />
            <Select
              label="Subject Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
              options={[
                { value: "Graded", label: "Graded" },
                { value: "Currently Taking", label: "Currently Taking" },
                { value: "Waiting", label: "Waiting" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Schedule Days"
              placeholder="M/T/W/TH"
              value={form.schedule_days}
              onChange={(e) => setForm((f) => ({ ...f, schedule_days: e.target.value }))}
            />
            <Input
              label="Schedule Time"
              placeholder="9:00 - 10:30"
              value={form.schedule_time}
              onChange={(e) => setForm((f) => ({ ...f, schedule_time: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room"
              placeholder="NETLAB"
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            />
            <Input
              label="Faculty"
              placeholder="Frederick Zamora"
              value={form.faculty}
              onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value }))}
            />
          </div>

          {form.status === "Graded" && (
            <Input
              label="Final Grade (0–100)"
              type="number"
              min="0"
              max="100"
              placeholder="95"
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!form.subject_code || !form.subject_name} loading={saving}>Save to Database</Button>
          </div>
        </div>
      </Modal>

      {/* ── Import from curriculum modal ─────────────────────────────── */}
      <Modal open={modal === "import"} onClose={() => setModal(null)} title="Import from Curriculum" size="md">
        <div className="p-6">
          <p className="text-xs text-muted-foreground mb-4">Select Year Level and Semester cohorts from the official curriculum to import subjects.</p>

          <div className="grid grid-cols-2 gap-4 mb-5 bg-muted/20 p-3 rounded-lg border border-border/40">
            <Select
              label="Year Level"
              value={importYear}
              onChange={(e) => setImportYear(e.target.value)}
              options={[
                { value: "1", label: "1st Year" },
                { value: "2", label: "2nd Year" },
                { value: "3", label: "3rd Year" },
                { value: "4", label: "4th Year" },
              ]}
            />
            <Select
              label="Semester"
              value={importSem}
              onChange={(e) => setImportSem(e.target.value)}
              options={[
                { value: "First Semester", label: "First Semester" },
                { value: "Second Semester", label: "Second Semester" },
              ]}
            />
          </div>

          {filteredImportItems.length ? (
            <>
              <div className="border border-border rounded-xl overflow-hidden mb-5">
                <div className="overflow-y-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 sticky top-0 text-left border-b border-border">
                      <tr>
                        <th className="px-3.5 py-2 font-semibold text-muted-foreground w-20">Code</th>
                        <th className="px-3.5 py-2 font-semibold text-muted-foreground">Subject</th>
                        <th className="px-3.5 py-2 font-semibold text-muted-foreground text-center w-16">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredImportItems.map((item) => (
                        <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-muted/10">
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground font-medium">{item.subject_code}</td>
                          <td className="px-3.5 py-2.5 text-foreground font-medium">{item.subject_name}</td>
                          <td className="px-3.5 py-2.5 text-center text-muted-foreground font-semibold">{item.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={saving}>Cancel</Button>
                <Button className="flex-1" onClick={() => handleImport(filteredImportItems)} loading={saving}>Import All</Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No subjects found for {importYear === "1" ? "1st" : importYear === "2" ? "2nd" : importYear === "3" ? "3rd" : "4th"} Year - {importSem}.
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete subject?"
        description="This will permanently remove this subject and its grade from Supabase."
        loading={saving}
      />
    </div>
  );
}
