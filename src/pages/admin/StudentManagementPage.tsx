import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Modal, Select, Input, PageHeader, SearchInput, EmptyState, Alert, Badge } from "../../app/components/ui";
import { getAllUsers, deleteUser, isUserOnline, updateProfile } from "../../store";
import { OFFICER_POSITIONS, type User } from "../../types";
import { GoogleSheetsAuthService } from "../../services/googleSheets.service";

type YearFilter = "all" | "1" | "2" | "3" | "4";
type SortOption = "year_asc" | "year_desc" | "name_asc" | "email_asc";

export function StudentManagementPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editNo, setEditNo] = useState("");
  const [editCourse, setEditCourse] = useState("BSIT");
  const [editYear, setEditYear] = useState("1");
  const [editOfficerPos, setEditOfficerPos] = useState("None");
  const [savingEdit, setSavingEdit] = useState(false);

  const [officerFilter, setOfficerFilter] = useState<"all" | "officers_only">("all");
  const [selectedYear, setSelectedYear] = useState<YearFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("year_asc");
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  const loadUsers = async () => {
    try {
      await GoogleSheetsAuthService.fetchAccounts();
    } catch (err) {
      console.warn("Google Sheets fetch in StudentManagement error:", err);
    }
    setUsers(getAllUsers());
  };


  useEffect(() => {
    let active = true;
    void loadUsers();

    // Auto-sync every 10 seconds to reflect spreadsheet edits live
    const interval = setInterval(() => {
      if (active) void loadUsers();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleSyncSheet = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
    setToast("Successfully synced live data from Google Spreadsheet!");
    setTimeout(() => setToast(null), 3000);
  };

  const openEditModal = (student: User) => {
    setEditingStudent(student);
    setEditName(student.full_name || "");
    setEditNo(student.student_number || "");
    setEditCourse(student.course || "BSIT");
    setEditYear(String(student.year_level || "1"));
    setEditOfficerPos(student.officer_position && student.officer_position !== "" ? student.officer_position : "None");
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSavingEdit(true);

    try {
      const posValue = editOfficerPos === "None" ? "" : editOfficerPos;
      updateProfile(editingStudent.id, {
        full_name: editName.trim(),
        student_number: editNo.trim(),
        course: editCourse.trim(),
        year_level: editYear,
        officer_position: posValue,
        email: editingStudent.email,
      });

      setUsers(getAllUsers());
      setEditingStudent(null);
      setToast(`Successfully updated details for ${editName.trim()}.`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to update student details.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOfficerChange = async (userId: string, position: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const newPositionValue = position === "None" ? "" : position;

    setUsers((current) =>
      current.map((u) => (u.id === userId ? { ...u, officer_position: newPositionValue } : u))
    );
    setErrorMsg(null);

    updateProfile(userId, {
      officer_position: newPositionValue,
      email: targetUser.email,
      student_number: targetUser.student_number,
      full_name: targetUser.full_name,
      course: targetUser.course,
      year_level: targetUser.year_level,
    });
    setToast(`Updated officer position for ${targetUser.full_name} to "${position === "None" ? "Standard Member" : position}".`);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const res = users.filter((u) => {
      const matchesSearch = !debouncedSearch || [u.full_name, u.student_number, u.course, u.email, u.officer_position || "", u.role || ""].some((v) => v.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesOfficer = officerFilter === "all" || (u.officer_position && u.officer_position !== "None" && u.officer_position !== "");
      const matchesYear = selectedYear === "all" || String(u.year_level || "1") === selectedYear;
      return matchesSearch && matchesOfficer && matchesYear;
    });

    return [...res].sort((a, b) => {
      if (sortBy === "year_asc") {
        const yA = Number(a.year_level) || 1;
        const yB = Number(b.year_level) || 1;
        if (yA !== yB) return yA - yB;
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "year_desc") {
        const yA = Number(a.year_level) || 1;
        const yB = Number(b.year_level) || 1;
        if (yA !== yB) return yB - yA;
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "name_asc") {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "email_asc") {
        return a.email.localeCompare(b.email);
      }
      return 0;
    });
  }, [users, debouncedSearch, officerFilter, selectedYear, sortBy]);

  const handleDelete = () => {
    if (!deleting) return;
    deleteUser(deleting);
    setUsers(getAllUsers());
    setDeleting(null);
  };

  const officerOptions = OFFICER_POSITIONS.map((pos) => ({
    value: pos,
    label: pos === "None" ? "Member (No Officer Role)" : pos,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        subtitle={`Directory of verified SSCR IT students & designated officers (${users.length} total students enrolled).`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncSheet}
            loading={refreshing}
            className="flex items-center gap-2 font-bold"
          >
            <svg className="size-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Google Sheet
          </Button>
        }
      />

      {toast && (
        <Alert variant="success" onClose={() => setToast(null)} className="animate-in fade-in duration-200">
          {toast}
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="error" onClose={() => setErrorMsg(null)} className="animate-in fade-in duration-200">
          {errorMsg}
        </Alert>
      )}

      {/* Year Filter Buttons and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {(["all", "1", "2", "3", "4"] as const).map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === yr
                  ? "bg-[#800000] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {yr === "all" ? "All Years" : yr === "1" ? "1st Year" : yr === "2" ? "2nd Year" : yr === "3" ? "3rd Year" : "4th Year"}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />
          <button
            onClick={() => setOfficerFilter((f) => (f === "all" ? "officers_only" : "all"))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              officerFilter === "officers_only"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            ★ Officers Only
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="w-full md:w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search name, ID, email..."
              className="w-full"
            />
          </div>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            options={[
              { value: "year_asc", label: "Year (1 → 4)" },
              { value: "year_desc", label: "Year (4 → 1)" },
              { value: "name_asc", label: "Name (A → Z)" },
              { value: "email_asc", label: "Email (A → Z)" },
            ]}
            className="w-36 text-xs"
          />
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 rounded-2xl">
        {filtered.length > 0 ? (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-5 py-3.5">Student / ID</th>
                    <th className="text-center text-xs font-bold text-slate-600 uppercase px-4 py-3.5">Year Level</th>
                    <th className="text-center text-xs font-bold text-slate-600 uppercase px-4 py-3.5">Program</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3.5">Officer Assignment</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const currentPos = u.officer_position && u.officer_position !== "" ? u.officer_position : "None";
                    const yearStr = String(u.year_level || "1");
                    return (
                      <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-xs text-slate-500 font-mono">{u.student_number || "No Student ID"} · {u.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            yearStr === "1" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            yearStr === "2" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                            yearStr === "3" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {yearStr === "1" ? "1st Year" : yearStr === "2" ? "2nd Year" : yearStr === "3" ? "3rd Year" : `${yearStr}th Year`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-bold text-xs text-slate-700">{u.course || "BSIT"}</span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[220px]">
                          <Select
                            value={currentPos}
                            onChange={(e) => handleOfficerChange(u.id, e.target.value)}
                            options={officerOptions}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="xs" onClick={() => openEditModal(u)} className="text-blue-600 hover:bg-blue-50 font-bold">
                              Edit
                            </Button>
                            <Button variant="ghost" size="xs" onClick={() => setDeleting(u.id)} className="text-rose-600 hover:bg-rose-50">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((u) => {
                const currentPos = u.officer_position && u.officer_position !== "" ? u.officer_position : "None";
                const yearStr = String(u.year_level || "1");
                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.student_number || "No ID"} · {u.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        yearStr === "1" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        yearStr === "2" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                        yearStr === "3" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {yearStr === "1" ? "1st Year" : yearStr === "2" ? "2nd Year" : yearStr === "3" ? "3rd Year" : `${yearStr}th Year`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Officer Role</label>
                      <Select
                        value={currentPos}
                        onChange={(e) => handleOfficerChange(u.id, e.target.value)}
                        options={officerOptions}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-600">{u.course || "BSIT"}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="xs" onClick={() => openEditModal(u)} className="text-blue-600 hover:bg-blue-50 font-bold">
                          Edit
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setDeleting(u.id)} className="text-rose-600 hover:bg-rose-50">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState title="No students found" description="No students match your active search or year level filter." />
        )}
      </Card>

      {/* Edit Student Modal */}
      <Modal open={!!editingStudent} onClose={() => setEditingStudent(null)} title="Edit Student Information" size="md">
        {editingStudent && (
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-700">Student Account:</p>
              <p className="text-slate-500 font-mono">{editingStudent.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Last Name, First Name Middle Name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Number / ID</label>
                <Input
                  required
                  value={editNo}
                  onChange={(e) => setEditNo(e.target.value)}
                  placeholder="2026-4007"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program / Course</label>
                <Select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  options={[
                    { value: "BSIT", label: "BSIT - Information Technology" },
                    { value: "BSCS", label: "BSCS - Computer Science" },
                    { value: "BSEMC", label: "BSEMC - Entertainment & Multimedia" },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year Level</label>
                <Select
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  options={[
                    { value: "1", label: "1st Year (Freshman)" },
                    { value: "2", label: "2nd Year (Sophomore)" },
                    { value: "3", label: "3rd Year (Junior)" },
                    { value: "4", label: "4th Year (Senior)" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer Position</label>
                <Select
                  value={editOfficerPos}
                  onChange={(e) => setEditOfficerPos(e.target.value)}
                  options={officerOptions}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={savingEdit} className="bg-[#800000] text-white hover:bg-[#660000] font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Student Account" size="sm">
        <p className="text-xs text-slate-600 mb-4">Are you sure you want to delete this student record? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 font-bold">Confirm Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
