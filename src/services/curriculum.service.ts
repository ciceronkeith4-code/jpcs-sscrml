import { supabase } from "../lib/supabaseClient";
import type { BSITCurriculum } from "../types";

export const OFFICIAL_BSIT_CURRICULUM_SEED: BSITCurriculum[] = [
  // ── BSIT 1 (9 records · 24 Total Units) ──────────────────────────────────
  {
    id: 1,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "A",
    subject_code: "GEC101",
    subject_description: "Understanding the Self",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "7:30-9:00",
    room: "C403",
    student_count: 0,
    faculty: "Dr. Lenn Adolph Arre",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 2,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "A",
    subject_code: "RF1",
    subject_description: "Recoletos Formation 1",
    lec_units: 1,
    lab_units: 0,
    days: "M",
    time: "10:30 - 12:30",
    room: "Smart Class",
    student_count: 0,
    faculty: "Ms. Ana Manzano",
    mode: "-",
    total_units: 1,
  },
  {
    id: 3,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "A",
    subject_code: "ITE101",
    subject_description: "Introduction to Computing",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "1:00 - 2:30",
    room: "C404",
    student_count: 0,
    faculty: "Regine Anicete",
    mode: "FTF / OL",
    total_units: 3,
  },
  {
    id: 4,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "A",
    subject_code: "THEO 101",
    subject_description: "Renewal of Christian Faith",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "2:30 - 4:00",
    room: "Smart Class",
    student_count: 0,
    faculty: "Francis Competente",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 5,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "B",
    subject_code: "ITE102",
    subject_description: "Program Logic Formulation & Computer Prog 1",
    lec_units: 2,
    lab_units: 1,
    days: "M/TH/S",
    time: "8:30 - 10:30",
    room: "CLAB 1 / OL",
    student_count: 0,
    faculty: "Paulo Perminola",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 6,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "B",
    subject_code: "ITP 111",
    subject_description: "Human Computer Interaction",
    lec_units: 2,
    lab_units: 1,
    days: "T/W/F",
    time: "10:30 - 12:30",
    room: "NETLAB",
    student_count: 0,
    faculty: "Rheymard Doneza",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 7,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "B",
    subject_code: "GEC105",
    subject_description: "Mathematics in the Modern World",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "1:00-2:30",
    room: "C401",
    student_count: 0,
    faculty: "Mr. Al John Escobañez",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 8,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "B",
    subject_code: "PHE101",
    subject_description: "Movement Enhancement",
    lec_units: 2,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "2:30-3:30",
    room: "C403",
    student_count: 0,
    faculty: "Dr. Racquel Bayani",
    mode: "FTF",
    total_units: 2,
  },
  {
    id: 9,
    year_level: "BSIT 1",
    revision_status: "REVISED AS OF AUG 23",
    block: "B",
    subject_code: "CWTS1",
    subject_description: "Civic Welfare Training Service 1",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "4:00-5:30",
    room: "Smart Class",
    student_count: 0,
    faculty: "Ms. Mary Grace Depalubos",
    mode: "FTF",
    total_units: 3,
  },

  // ── BSIT 2 (9 records · 24 Total Units) ──────────────────────────────────
  {
    id: 10,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "A",
    subject_code: "GEC 102",
    subject_description: "Readings in Philippine History",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "7:30-9:00",
    room: "SmartClass",
    student_count: 0,
    faculty: "Mr. Romel Jaime",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 11,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "A",
    subject_code: "ITE 104",
    subject_description: "Data Structures & Algorithms",
    lec_units: 2,
    lab_units: 1,
    days: "M/TH",
    time: "9:00 - 12:00",
    room: "CLAB3",
    student_count: 0,
    faculty: "John Paulo Perminola",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 12,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "A",
    subject_code: "ITP 121",
    subject_description: "Platform Technologies",
    lec_units: 2,
    lab_units: 1,
    days: "M/T/W/TH",
    time: "1:00 - 2:30",
    room: "NETLAB",
    student_count: 0,
    faculty: "Frederick Zamora",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 13,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "A",
    subject_code: "PE 103",
    subject_description: "PATHFit 3: Dance",
    lec_units: 2,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "2:30-3:30",
    room: "C402",
    student_count: 0,
    faculty: "Dr. Racquel Bayani",
    mode: "FTF",
    total_units: 2,
  },
  {
    id: 14,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "A",
    subject_code: "ITE 108",
    subject_description: "Quantitative Methods with Modeling & Simulation",
    lec_units: 3,
    lab_units: 0,
    days: "M /TH",
    time: "3:30 - 5:30",
    room: "C407",
    student_count: 0,
    faculty: "Gary Soriano",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 15,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "B",
    subject_code: "THEO 102",
    subject_description: "Christian Morality",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "7:30 - 9:00",
    room: "C403",
    student_count: 0,
    faculty: null,
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 16,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "B",
    subject_code: "RF 104",
    subject_description: "Recoletos Formation 4",
    lec_units: 1,
    lab_units: 0,
    days: "T",
    time: "10:30 -12:30",
    room: "SmartClass",
    student_count: 0,
    faculty: "-",
    mode: "FTF",
    total_units: 1,
  },
  {
    id: 17,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "B",
    subject_code: "IT TRACK1",
    subject_description: "IT Track1 (Cloud Computing)",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "1:00 - 2:30",
    room: "510",
    student_count: 0,
    faculty: "Joselito Carpio",
    mode: "FTF",
    total_units: 3,
  },
  {
    id: 18,
    year_level: "BSIT 2",
    revision_status: "REVISED AS OF AUG 11",
    block: "B",
    subject_code: "ITP 117",
    subject_description: "Object Oriented Programming",
    lec_units: 2,
    lab_units: 1,
    days: "M/TH/S",
    time: "3:00 - 5:00",
    room: "CLAB1",
    student_count: 0,
    faculty: "Gary Soriano",
    mode: "FTF",
    total_units: 3,
  },

  // ── BSIT 3 (9 records · 27 Total Units) ──────────────────────────────────
  {
    id: 19,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "AB",
    subject_code: "ITP128",
    subject_description: "Capstone 1",
    lec_units: 3,
    lab_units: 0,
    days: "F",
    time: "2:00 - 3:00",
    room: "online",
    student_count: 0,
    faculty: "Agnes Bernal",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 20,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "AB",
    subject_code: "IPE3",
    subject_description: "Professional Elective 3 (Cyber Security)",
    lec_units: 3,
    lab_units: 0,
    days: "ST",
    time: "9:00 - 12:00",
    room: "online",
    student_count: 0,
    faculty: "Joselito Carpio",
    mode: "online",
    total_units: 3,
  },
  {
    id: 21,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "AB",
    subject_code: "IPE 2",
    subject_description: "Professional Elective 2 (Data Analytics)",
    lec_units: 3,
    lab_units: 0,
    days: "ST",
    time: "3:00 - 6:00",
    room: "online",
    student_count: 0,
    faculty: "Gary Soriano",
    mode: "online",
    total_units: 3,
  },
  {
    id: 22,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "A",
    subject_code: "GEC104",
    subject_description: "Ethics",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "7:30-9:00",
    room: "C406",
    student_count: 0,
    faculty: "Mr. Francis Competente",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 23,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "A",
    subject_code: "GEC110",
    subject_description: "Art Appreciation",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "9:00-10:30",
    room: "C403",
    student_count: 0,
    faculty: "Mr. John Wilmer Laureano",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 24,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "A",
    subject_code: "REL301",
    subject_description: "The Mysteries of Christian Faith",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "10:30-12:00",
    room: "c406",
    student_count: 0,
    faculty: "Rev Oscar Garcia",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 25,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "A",
    subject_code: "ITP113",
    subject_description: "Information Assurance and Security",
    lec_units: 3,
    lab_units: 0,
    days: "M/T/W/TH",
    time: "1:00 - 2:30",
    room: "510",
    student_count: 0,
    faculty: "Joselito Carpio",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 26,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "A",
    subject_code: "IT TRACK 2",
    subject_description: "IT TRACK 2",
    lec_units: 2,
    lab_units: 1,
    days: "T/W/F",
    time: "2:30 - 4:30",
    room: "NETLAB",
    student_count: 0,
    faculty: "Rheymard Doneza",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 27,
    year_level: "BSIT 3",
    revision_status: "REVISED AS OF AUGUST 23",
    block: "B",
    subject_code: "ITP130",
    subject_description: "Practicum 1",
    lec_units: 3,
    lab_units: 0,
    days: "F",
    time: "1:00 - 3:00",
    room: "consultation",
    student_count: 0,
    faculty: "Agnes Bernal",
    mode: "online",
    total_units: 3,
  },

  // ── BSIT 4 (5 records · 15 Total Units) ──────────────────────────────────
  {
    id: 28,
    year_level: "BSIT 4",
    revision_status: "REVISED AS OF JULY 18",
    block: "AB",
    subject_code: "ITP129",
    subject_description: "Capstone Project 2",
    lec_units: 3,
    lab_units: 0,
    days: "T/W/TH",
    time: "1:00 - 2:00 / Consultation",
    room: "510",
    student_count: 0,
    faculty: "Agnes Bernal",
    mode: "F2F/OL",
    total_units: 3,
  },
  {
    id: 29,
    year_level: "BSIT 4",
    revision_status: "REVISED AS OF JULY 18",
    block: "A",
    subject_code: "ITP131",
    subject_description: "Practicum 2",
    lec_units: 3,
    lab_units: 0,
    days: "F",
    time: "Consultation",
    room: "ONLINE",
    student_count: 0,
    faculty: "Agnes Bernal",
    mode: "OL",
    total_units: 3,
  },
  {
    id: 30,
    year_level: "BSIT 4",
    revision_status: "REVISED AS OF JULY 18",
    block: "B",
    subject_code: "ITP123",
    subject_description: "System Administration & Maintenance",
    lec_units: 2,
    lab_units: 1,
    days: "M/T/W/TH/F",
    time: "9:00 - 10:30",
    room: "NETLAB",
    student_count: 0,
    faculty: "Frederick Zamora",
    mode: "F2F",
    total_units: 3,
  },
  {
    id: 31,
    year_level: "BSIT 4",
    revision_status: "REVISED AS OF JULY 18",
    block: "B",
    subject_code: "IT Track 4",
    subject_description: "IT Track 4 - (Integrative Programming & Technologies)",
    lec_units: 2,
    lab_units: 1,
    days: "M/TH/S",
    time: "10:30-12:30",
    room: "CLAB3",
    student_count: 0,
    faculty: "Paulo Perminola",
    mode: "F2F/OL",
    total_units: 3,
  },
  {
    id: 32,
    year_level: "BSIT 4",
    revision_status: "REVISED AS OF JULY 18",
    block: "B",
    subject_code: "IT Track 5",
    subject_description: "IT Track 5 -",
    lec_units: 3,
    lab_units: 0,
    days: "M/TH/S",
    time: "1:00 - 3:00",
    room: "C407",
    student_count: 0,
    faculty: "Gary Soriano",
    mode: "F2F/OL",
    total_units: 3,
  },
];

const LOCAL_STORAGE_KEY = "jpcs_bsit_curriculum_cache";

export class CurriculumService {
  private static getLocalCache(): BSITCurriculum[] {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            revision_status: (item.revision_status || "").replace(/^OK\s*[-–—:]*\s*/i, "").trim(),
          }));
        }
      }
    } catch {}
    return OFFICIAL_BSIT_CURRICULUM_SEED;
  }

  private static setLocalCache(items: BSITCurriculum[]) {
    try {
      const normalized = items.map((item) => ({
        ...item,
        revision_status: (item.revision_status || "").replace(/^OK\s*[-–—:]*\s*/i, "").trim(),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new Event("sscr_store_synced"));
    } catch {}
  }

  /**
   * Fetches all curriculum items from Supabase `bsit_curriculum` table.
   * If table is not yet seeded in Supabase, auto-seeds the official 32 records.
   */
  static async fetchCurriculum(yearLevel?: string): Promise<BSITCurriculum[]> {
    try {
      let query = supabase.from("bsit_curriculum").select("*").order("id", { ascending: true });
      if (yearLevel && yearLevel !== "all") {
        query = query.eq("year_level", yearLevel);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const normalized = data.map((item: any) => ({
          ...item,
          revision_status: (item.revision_status || "").replace(/^OK\s*[-–—:]*\s*/i, "").trim(),
        })) as BSITCurriculum[];
        this.setLocalCache(normalized);
        return normalized;
      }

      // If Supabase table is empty or error, attempt seed if empty
      if (!error && (!data || data.length === 0)) {
        await this.seedOfficialCurriculum();
        return this.getLocalCache();
      }
    } catch (err) {
      console.warn("Supabase fetchCurriculum notice:", err);
    }

    // Fallback to local cache / official seed
    const all = this.getLocalCache();
    if (yearLevel && yearLevel !== "all") {
      return all.filter((item) => item.year_level === yearLevel);
    }
    return all;
  }

  /**
   * Seeds the official 32 BSIT records into Supabase `bsit_curriculum`
   */
  static async seedOfficialCurriculum(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("bsit_curriculum")
        .upsert(OFFICIAL_BSIT_CURRICULUM_SEED, { onConflict: "id" });

      if (!error) {
        this.setLocalCache(OFFICIAL_BSIT_CURRICULUM_SEED);
        return true;
      }
    } catch (err) {
      console.warn("Supabase seedOfficialCurriculum notice:", err);
    }
    return false;
  }

  /**
   * Creates a new curriculum subject in Supabase
   */
  static async createSubject(subject: Omit<BSITCurriculum, "id">): Promise<BSITCurriculum> {
    const total_units = (Number(subject.lec_units) || 0) + (Number(subject.lab_units) || 0);
    const newSubjectData = {
      ...subject,
      total_units,
      student_count: Number(subject.student_count) || 0,
      lec_units: Number(subject.lec_units) || 0,
      lab_units: Number(subject.lab_units) || 0,
    };

    try {
      const { data, error } = await supabase
        .from("bsit_curriculum")
        .insert([newSubjectData])
        .select()
        .single();

      if (!error && data) {
        const local = this.getLocalCache();
        this.setLocalCache([...local, data as BSITCurriculum]);
        return data as BSITCurriculum;
      }
    } catch (err) {
      console.warn("Supabase createSubject notice:", err);
    }

    // Fallback
    const local = this.getLocalCache();
    const newId = local.length > 0 ? Math.max(...local.map((i) => i.id)) + 1 : 1;
    const fallbackItem: BSITCurriculum = {
      id: newId,
      ...newSubjectData,
    };
    this.setLocalCache([...local, fallbackItem]);
    return fallbackItem;
  }

  /**
   * Updates an existing curriculum subject in Supabase
   */
  static async updateSubject(id: number, updates: Partial<BSITCurriculum>): Promise<boolean> {
    const lec = updates.lec_units !== undefined ? Number(updates.lec_units) : undefined;
    const lab = updates.lab_units !== undefined ? Number(updates.lab_units) : undefined;
    
    const computedUpdates = { ...updates };
    if (lec !== undefined || lab !== undefined) {
      const current = this.getLocalCache().find((i) => i.id === id);
      const finalLec = lec !== undefined ? lec : current?.lec_units || 0;
      const finalLab = lab !== undefined ? lab : current?.lab_units || 0;
      computedUpdates.total_units = finalLec + finalLab;
    }

    try {
      const { error } = await supabase
        .from("bsit_curriculum")
        .update(computedUpdates)
        .eq("id", id);

      if (!error) {
        const local = this.getLocalCache().map((i) => (i.id === id ? { ...i, ...computedUpdates } : i));
        this.setLocalCache(local);
        return true;
      }
    } catch (err) {
      console.warn("Supabase updateSubject notice:", err);
    }

    // Fallback
    const local = this.getLocalCache().map((i) => (i.id === id ? { ...i, ...computedUpdates } : i));
    this.setLocalCache(local);
    return true;
  }

  /**
   * Deletes a subject from Supabase `bsit_curriculum`
   */
  static async deleteSubject(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("bsit_curriculum").delete().eq("id", id);
      if (!error) {
        const local = this.getLocalCache().filter((i) => i.id !== id);
        this.setLocalCache(local);
        return true;
      }
    } catch (err) {
      console.warn("Supabase deleteSubject notice:", err);
    }

    const local = this.getLocalCache().filter((i) => i.id !== id);
    this.setLocalCache(local);
    return true;
  }

  /**
   * Helper utility for grouping display strings: separates using ' / ' strictly
   */
  static formatDisplayGroup(items: (string | null | undefined)[]): string {
    return items
      .filter((item): item is string => Boolean(item && item.trim()))
      .map((item) => item.trim())
      .join(" / ");
  }

  /**
   * Calculate totals dynamically from a list of curriculum items
   */
  static calculateTotals(items: BSITCurriculum[]) {
    const totalLecUnits = items.reduce((sum, item) => sum + (Number(item.lec_units) || 0), 0);
    const totalLabUnits = items.reduce((sum, item) => sum + (Number(item.lab_units) || 0), 0);
    const totalUnits = items.reduce((sum, item) => sum + (Number(item.total_units) || (Number(item.lec_units) + Number(item.lab_units)) || 0), 0);
    return {
      totalLecUnits,
      totalLabUnits,
      totalUnits,
      totalSubjects: items.length,
    };
  }
}
