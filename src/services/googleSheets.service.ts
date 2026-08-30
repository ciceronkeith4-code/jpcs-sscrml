import type { User } from "../types";

const ACCOUNTS_CACHE_KEY = "jpcs_sheets_accounts_cache";

export interface GoogleSheetUser {
  student_number: string;
  full_name: string;
  email: string;
  year_level: string;
  role: "student" | "admin" | "faculty";
  course: string;
  officer_position?: string;
}

export class GoogleSheetsAuthService {
  public static readonly DEFAULT_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR22p6kyXl9DwGKl_7tcpo5NncSSA6T6f2J4hdXtTj142jztWT0tf_iMg471-DsFAih8zTWZcAOfLgX/pub?output=csv";

  private static getApiUrl(): string {
    const rawUrl =
      (import.meta.env.VITE_GOOGLE_SHEETS_ACCOUNTS_URL as string) ||
      localStorage.getItem("jpcs_sheets_url") ||
      this.DEFAULT_CSV_URL;

    if (!rawUrl) return this.DEFAULT_CSV_URL;

    // Automatically transform standard Google Sheet HTML/edit URLs to CSV export format
    if (rawUrl.includes("docs.google.com/spreadsheets/d/")) {
      if (rawUrl.includes("/pubhtml")) {
        return rawUrl.replace("/pubhtml", "/pub?output=csv");
      }
      const match = rawUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1] && !rawUrl.includes("/pub?output=csv")) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv`;
      }
    }

    return rawUrl;
  }

  /**
   * Set Google Sheets URL manually
   */
  static setApiUrl(url: string) {
    if (url) {
      localStorage.setItem("jpcs_sheets_url", url.trim());
    }
  }

  /**
   * Helper to parse CSV lines taking quoted commas into account
   */
  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cell.trim().replace(/^"|"$/g, ""));
        cell = "";
      } else {
        cell += char;
      }
    }
    result.push(cell.trim().replace(/^"|"$/g, ""));
    return result;
  }

  /**
   * Helper to parse CSV text from Google Sheets Masterlist
   */
  private static parseCsvAccounts(csvText: string): GoogleSheetUser[] {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    let nameCol = 1;
    let emailCol = 2;
    let numCol = 0;
    let yearCol = -1;
    let roleCol = -1;
    let currentYear = "1";

    const accounts: GoogleSheetUser[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineStr = lines[i];
      const upperStr = lineStr.toUpperCase();

      // Detect year level headers in spreadsheet
      if (
        upperStr.includes("4TH YEAR") ||
        upperStr.includes("4TH YR") ||
        upperStr.includes("FOURTH YEAR") ||
        upperStr.includes("YEAR 4") ||
        upperStr.includes("BSIT 4") ||
        upperStr.includes("BSIT-4") ||
        upperStr.includes("BSIT 4A") ||
        upperStr.includes("BSIT 4B") ||
        upperStr.includes("BSIT-4A") ||
        upperStr.includes("BSIT-4B")
      ) {
        currentYear = "4";
        continue;
      }
      if (
        upperStr.includes("3RD YEAR") ||
        upperStr.includes("3RD YR") ||
        upperStr.includes("THIRD YEAR") ||
        upperStr.includes("YEAR 3") ||
        upperStr.includes("BSIT 3") ||
        upperStr.includes("BSIT-3") ||
        upperStr.includes("BSIT 3A") ||
        upperStr.includes("BSIT 3B") ||
        upperStr.includes("BSIT-3A") ||
        upperStr.includes("BSIT-3B")
      ) {
        currentYear = "3";
        continue;
      }
      if (
        upperStr.includes("2ND YEAR") ||
        upperStr.includes("2ND YR") ||
        upperStr.includes("SECOND YEAR") ||
        upperStr.includes("YEAR 2") ||
        upperStr.includes("BSIT 2") ||
        upperStr.includes("BSIT-2") ||
        upperStr.includes("BSIT 2A") ||
        upperStr.includes("BSIT 2B") ||
        upperStr.includes("BSIT-2A") ||
        upperStr.includes("BSIT-2B")
      ) {
        currentYear = "2";
        continue;
      }
      if (
        upperStr.includes("1ST YEAR") ||
        upperStr.includes("1ST YR") ||
        upperStr.includes("FIRST YEAR") ||
        upperStr.includes("YEAR 1") ||
        upperStr.includes("BSIT 1") ||
        upperStr.includes("BSIT-1") ||
        upperStr.includes("BSIT 1A") ||
        upperStr.includes("BSIT 1B") ||
        upperStr.includes("BSIT-1A") ||
        upperStr.includes("BSIT-1B")
      ) {
        currentYear = "1";
        continue;
      }

      // Check header row column positions dynamically (only if row is not student data containing @)
      if (!lineStr.includes("@")) {
        const colsUpper = this.parseCsvLine(lineStr).map((c) => c.toUpperCase());
        const eIdx = colsUpper.findIndex((c) => c.includes("EMAIL") || c === "SSCR EMAIL");
        if (eIdx !== -1) {
          emailCol = eIdx;
          const nIdx = colsUpper.findIndex((c) => c.includes("NAME") && !c.includes("EMAIL"));
          if (nIdx !== -1) nameCol = nIdx;
          const noIdx = colsUpper.findIndex((c) => c === "NO." || c === "NO" || c.includes("STUDENT NUMBER") || c.includes("STUDENT NO"));
          if (noIdx !== -1) numCol = noIdx;
          const yIdx = colsUpper.findIndex((c) => c === "YEAR" || c === "YR" || c.includes("YEAR LEVEL") || c.includes("SECTION"));
          if (yIdx !== -1) yearCol = yIdx;
          const rIdx = colsUpper.findIndex((c) => c.includes("ROLE") || c === "POSITION");
          if (rIdx !== -1) roleCol = rIdx;
          continue;
        }
      }

      const cols = this.parseCsvLine(lineStr);
      const email = (cols[emailCol] || "").toLowerCase().trim();
      if (!email || !email.includes("@")) continue;

      const rawName = (cols[nameCol] || "").trim();
      const rawNo = (cols[numCol] || "").trim();
      const rawRole = (roleCol !== -1 && cols[roleCol] ? cols[roleCol] : "").trim();
      const upperRole = rawRole.toUpperCase();

      // Extract year level from section/year column or currentYear context
      let studentYear = currentYear;
      if (yearCol !== -1 && cols[yearCol] && cols[yearCol].trim()) {
        const val = cols[yearCol].trim().toUpperCase();
        if (val.includes("4") || val.includes("FOUR")) studentYear = "4";
        else if (val.includes("3") || val.includes("THREE")) studentYear = "3";
        else if (val.includes("2") || val.includes("TWO")) studentYear = "2";
        else if (val.includes("1") || val.includes("ONE")) studentYear = "1";
        else {
          const extractedDigits = val.replace(/\D/g, "");
          if (extractedDigits) studentYear = extractedDigits;
        }
      }

      // Check if student number or name has year indicator
      if (!studentYear || studentYear === "1") {
        if (/^202\d-4/i.test(rawNo) || /^4\d{3}/.test(rawNo) || /^4-/i.test(rawNo)) {
          studentYear = "4";
        } else if (/^202\d-3/i.test(rawNo) || /^3\d{3}/.test(rawNo) || /^3-/i.test(rawNo)) {
          studentYear = "3";
        } else if (/^202\d-2/i.test(rawNo) || /^2\d{3}/.test(rawNo) || /^2-/i.test(rawNo)) {
          studentYear = "2";
        }
      }

      // Format Student Number (e.g. 2026-4007 or explicit student number)
      let studentNumber = rawNo;
      if (!studentNumber || /^\d{1,3}$/.test(studentNumber)) {
        const rowNumber = parseInt(studentNumber || "1", 10) || (accounts.length + 1);
        const paddedNo = String(rowNumber).padStart(3, "0");
        studentNumber = `2026-${studentYear}${paddedNo}`;
      }

      const isAdmin = email.includes("admin") || rawName.toLowerCase().includes("admin");
      const isFaculty = upperRole.includes("FACULTY") || upperRole.includes("INSTRUCTOR") || upperRole.includes("TEACHER");
      const role: "student" | "admin" | "faculty" = isAdmin ? "admin" : isFaculty ? "faculty" : "student";

      // By default, no student from the spreadsheet is an officer until assigned by Admin
      const officer_position = "None";

      accounts.push({
        student_number: studentNumber,
        full_name: rawName || email.split("@")[0],
        email,
        year_level: studentYear,
        role,
        course: "BSIT",
        officer_position,
      });
    }

    return accounts;
  }

  /**
   * Fetches official student/user masterlist from Google Sheets
   */
  static async fetchAccounts(): Promise<User[]> {
    const url = this.getApiUrl();

    // Check cached accounts first for offline / instant render
    const cachedRaw = localStorage.getItem(ACCOUNTS_CACHE_KEY);
    let cachedAccounts: User[] = [];
    if (cachedRaw) {
      try {
        cachedAccounts = JSON.parse(cachedRaw);
      } catch {
        // ignore parse error
      }
    }

    try {
      const fetchUrl = url.includes("?") ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
      const response = await fetch(fetchUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from Google Sheets (HTTP ${response.status})`);
      }

      const text = await response.text();

      // Check if response is HTML redirect or CSV
      if (text.trim().toLowerCase().startsWith("<!doctype html") || text.includes("<html")) {
        if (url !== this.DEFAULT_CSV_URL) {
          const fallbackRes = await fetch(`${this.DEFAULT_CSV_URL}&_t=${Date.now()}`, { cache: "no-store" });
          if (fallbackRes.ok) {
            const fallbackText = await fallbackRes.text();
            if (!fallbackText.trim().toLowerCase().startsWith("<!doctype html")) {
              const parsed = this.parseCsvAccounts(fallbackText);
              const users: User[] = parsed.map((acc, idx) => ({
                id: `gs_${acc.email.replace(/[^a-z0-9]/gi, "_")}_${idx}`,
                uid: `gs_${acc.email.replace(/[^a-z0-9]/gi, "_")}_${idx}`,
                full_name: acc.full_name,
                student_number: acc.student_number,
                course: acc.course,
                year_level: acc.year_level,
                role: acc.role,
                email: acc.email,
                verified: true,
                status: "active",
                mustChangePassword: false,
                officer_position: acc.officer_position || "None",
              }));
              localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(users));
              return users;
            }
          }
        }
        if (cachedAccounts.length > 0) return cachedAccounts;
        throw new Error("Access denied by Google Sheets. Ensure sheet is published to web.");
      }

      const parsedAccounts = this.parseCsvAccounts(text);
      const users: User[] = parsedAccounts.map((acc, idx) => ({
        id: `gs_${acc.email.replace(/[^a-z0-9]/gi, "_")}_${idx}`,
        uid: `gs_${acc.email.replace(/[^a-z0-9]/gi, "_")}_${idx}`,
        full_name: acc.full_name,
        student_number: acc.student_number,
        course: acc.course,
        year_level: acc.year_level,
        role: acc.role,
        email: acc.email,
        verified: true,
        status: "active",
        mustChangePassword: false,
        officer_position: acc.officer_position || "None",
      }));

      // Cache accounts
      localStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(users));
      return users;
    } catch (err) {
      console.warn("Error fetching accounts from Google Sheets, using cache if available:", err);
      if (cachedAccounts.length > 0) {
        return cachedAccounts;
      }
      throw err;
    }
  }

  /**
   * Searches the Google Sheets masterlist for a user by email
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = await this.fetchAccounts();
    const found = accounts.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
    return found || null;
  }
}
