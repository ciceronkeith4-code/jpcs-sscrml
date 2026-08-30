import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Input, Select, PageHeader, EmptyState, Modal, Alert } from "../../../app/components/ui";
import { CurriculumService } from "../../../services/curriculum.service";
import type { BSITCurriculum } from "../../../types";

const YEAR_LEVELS = ["BSIT 1", "BSIT 2", "BSIT 3", "BSIT 4"] as const;

function getBlockBadge(block: string) {
  const b = (block || "A").toUpperCase().trim();
  if (b === "B") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">BLK B</span>;
  }
  if (b === "AB") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">BLK AB</span>;
  }
  return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">BLK A</span>;
}

function getSubjectBadgeTheme(subjectCode: string) {
  const code = (subjectCode || "").toUpperCase().trim();
  if (code.includes("ITE") || code.includes("ITP") || code.includes("CS")) {
    return "bg-emerald-50 text-emerald-900 border-emerald-300";
  }
  if (code.includes("GEC") || code.includes("THEO") || code.includes("REL") || code.includes("RF")) {
    return "bg-indigo-50 text-indigo-900 border-indigo-200";
  }
  if (code.includes("TRACK") || code.includes("ELECTIVE") || code.includes("IPE")) {
    return "bg-purple-50 text-purple-900 border-purple-200";
  }
  if (code.includes("CAPSTONE") || code.includes("PRACTICUM") || code.includes("128") || code.includes("129")) {
    return "bg-amber-50 text-amber-950 border-amber-300";
  }
  return "bg-sky-50 text-sky-900 border-sky-200";
}

export function CurriculumManager() {
  const [items, setItems] = useState<BSITCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("BSIT 1");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BSITCurriculum | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form Fields
  const [formYear, setFormYear] = useState("BSIT 1");
  const [formBlock, setFormBlock] = useState("A");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLec, setFormLec] = useState(3);
  const [formLab, setFormLab] = useState(0);
  const [formDays, setFormDays] = useState("M/T/W/TH");
  const [formTime, setFormTime] = useState("7:30-9:00");
  const [formRoom, setFormRoom] = useState("C403");
  const [formFaculty, setFormFaculty] = useState("");
  const [formMode, setFormMode] = useState("FTF");
  const [formRevision, setFormRevision] = useState("REVISED AS OF AUG 23");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await CurriculumService.fetchCurriculum();
      setItems(res);
    } catch (err) {
      console.error("Failed to load curriculum items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    window.addEventListener("sscr_store_synced", loadData);
    return () => window.removeEventListener("sscr_store_synced", loadData);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormYear(yearFilter !== "all" ? yearFilter : "BSIT 1");
    setFormBlock("A");
    setFormCode("");
    setFormDesc("");
    setFormLec(3);
    setFormLab(0);
    setFormDays("M/T/W/TH");
    setFormTime("8:00 - 9:30");
    setFormRoom("C401");
    setFormFaculty("");
    setFormMode("FTF");
    
    // Auto-fill revision status based on year
    const matched = items.find((i) => i.year_level === (yearFilter !== "all" ? yearFilter : "BSIT 1"));
    const rev = matched?.revision_status ? matched.revision_status.replace(/^OK\s*[-–—:]*\s*/i, "").trim() : "REVISED AS OF AUG 23";
    setFormRevision(rev);
    setModalOpen(true);
  };

  const openEditModal = (item: BSITCurriculum) => {
    setEditingItem(item);
    setFormYear(item.year_level);
    setFormBlock(item.block);
    setFormCode(item.subject_code);
    setFormDesc(item.subject_description);
    setFormLec(item.lec_units);
    setFormLab(item.lab_units);
    setFormDays(item.days);
    setFormTime(item.time);
    setFormRoom(item.room);
    setFormFaculty(item.faculty || "");
    setFormMode(item.mode);
    setFormRevision(item.revision_status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      year_level: formYear,
      revision_status: formRevision,
      block: formBlock,
      subject_code: formCode.trim(),
      subject_description: formDesc.trim(),
      lec_units: Number(formLec) || 0,
      lab_units: Number(formLab) || 0,
      days: formDays.trim(),
      time: formTime.trim(),
      room: formRoom.trim(),
      student_count: 0,
      faculty: formFaculty.trim() || null,
      mode: formMode.trim(),
      total_units: (Number(formLec) || 0) + (Number(formLab) || 0),
    };

    if (editingItem) {
      await CurriculumService.updateSubject(editingItem.id, payload);
      setToast(`Updated subject ${payload.subject_code} successfully!`);
    } else {
      await CurriculumService.createSubject(payload);
      setToast(`Added subject ${payload.subject_code} to ${payload.year_level}!`);
    }

    setModalOpen(false);
    void loadData();
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: number) => {
    await CurriculumService.deleteSubject(id);
    setDeletingId(null);
    setToast("Subject deleted successfully!");
    void loadData();
    setTimeout(() => setToast(null), 3000);
  };

  // Filter items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesYear = yearFilter === "all" || item.year_level === yearFilter;
      const matchesBlock = blockFilter === "all" || item.block.toUpperCase() === blockFilter.toUpperCase();
      const matchesMode =
        modeFilter === "all" ||
        (modeFilter === "FTF" && (item.mode === "FTF" || item.mode === "F2F")) ||
        (modeFilter === "ONLINE" && (item.mode.toLowerCase().includes("online") || item.mode.toLowerCase() === "ol")) ||
        (modeFilter === "HYBRID" && item.mode.includes("/"));

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.subject_code.toLowerCase().includes(q) ||
        item.subject_description.toLowerCase().includes(q) ||
        (item.faculty && item.faculty.toLowerCase().includes(q)) ||
        item.room.toLowerCase().includes(q);

      return matchesYear && matchesBlock && matchesMode && matchesSearch;
    });
  }, [items, yearFilter, blockFilter, modeFilter, search]);

  const activeTotals = useMemo(() => {
    return CurriculumService.calculateTotals(filtered);
  }, [filtered]);

  const activeRevision = useMemo(() => {
    if (yearFilter === "all") return "ALL YEARS VIEW";
    const matched = items.find((i) => i.year_level === yearFilter);
    const raw = matched?.revision_status || "REVISED";
    return raw.replace(/^OK\s*[-–—:]*\s*/i, "").trim();
  }, [items, yearFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Curriculum & Schedule Management"
          subtitle="Manage official BSIT curriculum subjects, lecture/lab units, schedules, rooms, and faculty."
        />
        <Button onClick={openAddModal} className="bg-[#800000] text-white font-bold shrink-0 shadow-xs cursor-pointer">
          + Add Curriculum Subject
        </Button>
      </div>

      {toast && <Alert variant="success">{toast}</Alert>}

      {/* Year Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Filter Year:</span>
        <button
          onClick={() => setYearFilter("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            yearFilter === "all" ? "bg-[#800000] text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Years ({items.length})
        </button>
        {YEAR_LEVELS.map((y) => {
          const count = items.filter((i) => i.year_level === y).length;
          return (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                yearFilter === y ? "bg-[#800000] text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {y} ({count})
            </button>
          );
        })}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Revision Status</span>
          <p className="text-xs font-black text-slate-900 truncate mt-0.5">{activeRevision}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Subjects</span>
          <p className="text-lg font-black text-slate-900">{activeTotals.totalSubjects}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Lec / Lab Units</span>
          <p className="text-lg font-black text-slate-900">{activeTotals.totalLecUnits} / {activeTotals.totalLabUnits}</p>
        </div>
        <div className="bg-[#800000]/5 p-3 rounded-xl border border-[#800000]/20">
          <span className="text-[10px] font-bold uppercase text-[#800000]">Total Enrolled Units</span>
          <p className="text-lg font-black text-[#800000]">{activeTotals.totalUnits} Units</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, title, faculty, or room..."
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#800000]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Block:</span>
          <Select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            options={[
              { value: "all", label: "All Blocks" },
              { value: "A", label: "Block A" },
              { value: "B", label: "Block B" },
              { value: "AB", label: "Block AB" },
            ]}
            className="w-36 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Mode:</span>
          <Select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Modes" },
              { value: "FTF", label: "Face to Face" },
              { value: "ONLINE", label: "Online" },
              { value: "HYBRID", label: "Hybrid (FTF / OL)" },
            ]}
            className="w-40 text-xs"
          />
        </div>
      </div>

      {/* Management Table */}
      <Card className="p-4 overflow-hidden border border-slate-200 rounded-2xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading curriculum data from Supabase...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider bg-slate-50/60">
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3">Block</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Subject Description</th>
                  <th className="py-3 px-2 text-center">Lec</th>
                  <th className="py-3 px-2 text-center">Lab</th>
                  <th className="py-3 px-2 text-center">Units</th>
                  <th className="py-3 px-3">Schedule</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Faculty</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const theme = getSubjectBadgeTheme(item.subject_code);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-600">{item.year_level}</td>
                      <td className="py-3 px-3 whitespace-nowrap">{getBlockBadge(item.block)}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-mono font-black ${theme}`}>
                          {item.subject_code}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 max-w-xs">{item.subject_description}</td>
                      <td className="py-3 px-2 text-center text-slate-600">{item.lec_units}</td>
                      <td className="py-3 px-2 text-center text-slate-600">{item.lab_units}</td>
                      <td className="py-3 px-2 text-center font-black text-[#800000]">{item.total_units}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">{item.days} · {item.time}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-700">{item.room}</td>
                      <td className="py-3 px-3 text-slate-800">{item.faculty || "—"}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-bold">{item.mode}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="xs" onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50 font-bold">
                            Edit
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => setDeletingId(item.id)} className="text-red-600 hover:bg-red-50 font-bold">
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
        ) : (
          <EmptyState title="No curriculum subjects found matching active filters." />
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Subject: ${editingItem.subject_code}` : "Add Curriculum Subject"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year Level</label>
              <Select
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                options={YEAR_LEVELS.map((y) => ({ value: y, label: y }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Block Section</label>
              <Select
                value={formBlock}
                onChange={(e) => setFormBlock(e.target.value)}
                options={[
                  { value: "A", label: "Block A" },
                  { value: "B", label: "Block B" },
                  { value: "AB", label: "Block AB" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
              <Input required value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="ITP 121" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Description</label>
              <Input required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Platform Technologies" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lec Units</label>
              <Input type="number" min="0" max="6" value={formLec} onChange={(e) => setFormLec(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lab Units</label>
              <Input type="number" min="0" max="6" value={formLab} onChange={(e) => setFormLab(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Units</label>
              <Input readOnly value={formLec + formLab} className="bg-slate-50 font-black text-[#800000]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Days / Schedule</label>
              <Input required value={formDays} onChange={(e) => setFormDays(e.target.value)} placeholder="M/T/W/TH" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <Input required value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="1:00 - 2:30" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room</label>
              <Input required value={formRoom} onChange={(e) => setFormRoom(e.target.value)} placeholder="NETLAB" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
              <Input required value={formMode} onChange={(e) => setFormMode(e.target.value)} placeholder="FTF" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty In-Charge</label>
              <Input value={formFaculty} onChange={(e) => setFormFaculty(e.target.value)} placeholder="Instructor name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Revision Status Text</label>
            <Input value={formRevision} onChange={(e) => setFormRevision(e.target.value)} placeholder="REVISED AS OF AUG 23" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#800000] text-white font-bold">
              {editingItem ? "Save Changes" : "Add Subject"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove this subject from the official BSIT curriculum? This action will sync immediately to Supabase.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button onClick={() => deletingId && void handleDelete(deletingId)} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Delete Subject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
