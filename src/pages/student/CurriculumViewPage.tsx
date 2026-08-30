import React, { useState, useEffect, useMemo } from "react";
import { Card, PageHeader, EmptyState, Badge } from "../../app/components/ui";
import { CurriculumService } from "../../services/curriculum.service";
import type { BSITCurriculum, User } from "../../types";

const YEAR_TABS = ["BSIT 1", "BSIT 2", "BSIT 3", "BSIT 4"] as const;

function getBlockBadge(block: string) {
  const b = (block || "A").toUpperCase().trim();
  if (b === "B") {
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-purple-50 text-purple-800 border border-purple-200">BLK B</span>;
  }
  if (b === "AB") {
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200">BLK AB</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">BLK A</span>;
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

function getModeBadge(mode: string) {
  const m = (mode || "-").trim();
  if (m === "FTF" || m === "F2F") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Face to Face (FTF)</span>;
  }
  if (m.toLowerCase().includes("online") || m.toLowerCase() === "ol") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">Online</span>;
  }
  if (m.includes("/")) {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">Hybrid (FTF / OL)</span>;
  }
  return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{m || "—"}</span>;
}

export function CurriculumViewPage({ user }: { user?: User }) {
  const [selectedYear, setSelectedYear] = useState<string>("BSIT 1");
  const [curriculum, setCurriculum] = useState<BSITCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await CurriculumService.fetchCurriculum();
      setCurriculum(data);
    } catch (err) {
      console.error("Failed to load curriculum", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    window.addEventListener("sscr_store_synced", loadData);
    return () => window.removeEventListener("sscr_store_synced", loadData);
  }, []);

  // Filter items based on active year, search, block, and mode
  const yearItems = useMemo(() => {
    return curriculum.filter((item) => item.year_level === selectedYear);
  }, [curriculum, selectedYear]);

  // Current revision status for the selected year
  const activeRevisionStatus = useMemo(() => {
    const matched = yearItems[0];
    const raw = matched?.revision_status || "REVISED";
    return raw.replace(/^OK\s*[-–—:]*\s*/i, "").trim();
  }, [yearItems]);

  const filteredItems = useMemo(() => {
    return yearItems.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.subject_code.toLowerCase().includes(q) ||
        item.subject_description.toLowerCase().includes(q) ||
        (item.faculty && item.faculty.toLowerCase().includes(q)) ||
        item.room.toLowerCase().includes(q);

      const matchesBlock = blockFilter === "all" || item.block.toUpperCase() === blockFilter.toUpperCase();

      const matchesMode =
        modeFilter === "all" ||
        (modeFilter === "FTF" && (item.mode === "FTF" || item.mode === "F2F")) ||
        (modeFilter === "ONLINE" && (item.mode.toLowerCase().includes("online") || item.mode.toLowerCase() === "ol")) ||
        (modeFilter === "HYBRID" && item.mode.includes("/"));

      return matchesSearch && matchesBlock && matchesMode;
    });
  }, [yearItems, search, blockFilter, modeFilter]);

  // Dynamic calculations from database records
  const yearTotals = useMemo(() => {
    return CurriculumService.calculateTotals(yearItems);
  }, [yearItems]);

  const filteredTotals = useMemo(() => {
    return CurriculumService.calculateTotals(filteredItems);
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeader
            title="BSIT Curriculum & Schedule"
            subtitle="Official San Sebastian College Recoletos Manila BSIT Academic Program Schedule."
          />
        </div>
      </div>

      {/* ── Year Level Selector Tabs ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Year Level:</span>
        {YEAR_TABS.map((year) => {
          const isSelected = selectedYear === year;
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-2xs ${
                isSelected
                  ? "bg-[#800000] text-white ring-2 ring-[#800000]/20 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* ── Revision Banner & Dynamic Unit Summary Cards ───────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revision Information Card */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revision Status</span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate">{activeRevisionStatus}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">{selectedYear} Official Schedule</span>
        </Card>

        {/* Total Lecture Units */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lecture Units</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{yearTotals.totalLecUnits} <span className="text-xs font-normal text-slate-500">units</span></p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Theoretical & classroom instruction</span>
        </Card>

        {/* Total Lab Units */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Laboratory Units</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{yearTotals.totalLabUnits} <span className="text-xs font-normal text-slate-500">units</span></p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Hands-on lab / NetLab practice</span>
        </Card>

        {/* Total Units Overall */}
        <Card className="p-4 bg-white border-2 border-[#800000]/30 rounded-2xl shadow-xs bg-[#800000]/2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#800000]">Total Enrolled Units</span>
            <span className="text-[10px] font-black bg-[#800000] text-white px-2 py-0.5 rounded-full">{yearTotals.totalSubjects} Subjects</span>
          </div>
          <p className="text-3xl font-black text-[#800000] mt-1">{yearTotals.totalUnits} <span className="text-xs font-bold text-slate-600">Total Units</span></p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Full Semester Load</span>
        </Card>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject code, course title, faculty, or room..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 focus:border-[#800000]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Block:</span>
            <div className="relative">
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="text-xs font-semibold pl-3.5 pr-8 py-2 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#800000] cursor-pointer shadow-2xs transition-colors"
              >
                <option value="all">All Blocks (A, B, AB)</option>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="AB">Block AB</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Mode:</span>
            <div className="relative">
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="text-xs font-semibold pl-3.5 pr-8 py-2 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#800000] cursor-pointer shadow-2xs transition-colors"
              >
                <option value="all">All Delivery Modes</option>
                <option value="FTF">Face-to-Face (FTF)</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid (FTF / OL)</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Curriculum Schedule Table (Desktop & Laptop) ───────────── */}
      <Card className="overflow-hidden border border-slate-200 rounded-2xl shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            <div className="inline-block size-6 border-2 border-[#800000] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading {selectedYear} official curriculum schedule...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            {/* Desktop Academic Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Block</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Subject Description</th>
                    <th className="py-3.5 px-3 text-center">Lec</th>
                    <th className="py-3.5 px-3 text-center">Lab</th>
                    <th className="py-3.5 px-3 text-center">Total</th>
                    <th className="py-3.5 px-4">Schedule / Days</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Room</th>
                    <th className="py-3.5 px-4">Faculty</th>
                    <th className="py-3.5 px-4 text-center">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const theme = getSubjectBadgeTheme(item.subject_code);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">{getBlockBadge(item.block)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-mono font-black border ${theme}`}>
                            {item.subject_code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {item.subject_description}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-slate-600">{item.lec_units}</td>
                        <td className="py-3.5 px-3 text-center font-semibold text-slate-600">{item.lab_units}</td>
                        <td className="py-3.5 px-3 text-center font-black text-[#800000]">{item.total_units}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">{item.days}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{item.time}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">{item.room}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{item.faculty || "—"}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">{getModeBadge(item.mode)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-black text-slate-900">
                    <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-slate-500">
                      Total for {selectedYear}:
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{filteredTotals.totalLecUnits}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{filteredTotals.totalLabUnits}</td>
                    <td className="py-3 px-3 text-center font-black text-[#800000] text-sm">{filteredTotals.totalUnits} Units</td>
                    <td colSpan={5} className="py-3 px-4 text-slate-400 text-right text-[11px] font-normal">
                      {filteredTotals.totalSubjects} subjects displayed
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile & Tablet Card Layout */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const theme = getSubjectBadgeTheme(item.subject_code);
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getBlockBadge(item.block)}
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-mono font-black border ${theme}`}>
                            {item.subject_code}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight mt-1">{item.subject_description}</h4>
                      </div>
                      <span className="text-xs font-black text-[#800000] bg-[#800000]/10 px-2 py-1 rounded-lg shrink-0">
                        {item.total_units} Units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Days / Schedule</span>
                        <p className="font-mono font-bold text-slate-800">{item.days} · {item.time}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Room</span>
                        <p className="font-bold text-slate-800">{item.room}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty</span>
                        <p className="font-semibold text-slate-800 truncate">{item.faculty || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Mode</span>
                        <div className="mt-0.5">{getModeBadge(item.mode)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="p-4 bg-slate-50 text-center text-xs font-black text-slate-800">
                Total for {selectedYear}: <span className="text-[#800000] text-sm">{filteredTotals.totalUnits} Units</span> ({filteredTotals.totalSubjects} Subjects)
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No Curriculum Subjects Found"
            description="No subjects match your active search keyword, block, or delivery mode filter."
          />
        )}
      </Card>
    </div>
  );
}
