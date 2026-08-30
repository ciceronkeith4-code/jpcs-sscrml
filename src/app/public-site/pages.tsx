import { useState, useEffect } from "react";
import { ArrowDown, Check, Download, ExternalLink, Quote, Code2, ShieldCheck, Database, Cpu } from "lucide-react";
import { AnimatedButton, benefitIcons, FeatureRow, FullWidthCta, ImagePlaceholder, Reveal, SectionHeading, Seo, OfficerPhoto } from "./components";
import { audienceBenefits, benefits, communityAudiences, homePrograms, memberships, officers, programFeatures, seo, values, alumniTestimonials } from "./data";

const departmentStats = [
  {
    value: "100+",
    label: "Students",
    sub: "Enrolled in active curriculum",
  },
  {
    value: "4",
    label: "Specialized Tracks",
    sub: "Software, Cyber, Cloud, & AI",
  },
  {
    value: "Level III",
    label: "PAASCU Accredited",
    sub: "Information Technology (BS IT) program",
  },
  {
    value: "30+",
    label: "Annual Activities",
    sub: "Hackathons, seminars, and talks",
  },
];

const itPillars = [
  {
    icon: Code2,
    title: "Software Engineering",
    desc: "Modern web & mobile development, clean architecture, enterprise frameworks, and agile workflows.",
    tags: ["React", "TypeScript", "Node.js", "Python"],
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & Defense",
    desc: "Network infrastructure security, vulnerability auditing, incident response, and ethical hacking.",
    tags: ["Network Security", "PenTesting", "Cisco", "Linux"],
  },
  {
    icon: Database,
    title: "Cloud & Data Systems",
    desc: "Distributed cloud infrastructure, relational & NoSQL databases, scalable DevOps, and data pipelines.",
    tags: ["AWS", "Docker", "PostgreSQL", "CI/CD"],
  },
  {
    icon: Cpu,
    title: "AI & Systems Innovation",
    desc: "Machine learning integration, IoT solutions, smart automation systems, and applied computing research.",
    tags: ["Machine Learning", "IoT", "Data Science", "API Design"],
  },
];

const featuredProjects = [
  {
    title: "JPCS Student Academic & Grading Portal",
    category: "Web Application",
    desc: "Comprehensive academic tracking, automated Dean's list calculation, and digital student credential verification.",
    badge: "Official Portal",
    tags: ["React", "TypeScript", "Tailwind", "Supabase"],
  },
  {
    title: "Campus Security & RFID Verification Pass",
    category: "Security Systems",
    desc: "Smart digital ID authentication system for computer laboratories, event attendance, and student access.",
    badge: "Active System",
    tags: ["RFID", "QR Code", "Node.js", "IoT"],
  },
  {
    title: "Automated OCR Curriculum Parser",
    category: "AI & Document Vision",
    desc: "Computer vision pipeline extracting student grades directly from university registrar assessment slips.",
    badge: "Capstone Project",
    tags: ["Tesseract.js", "OpenCV", "Vision AI", "RegEx"],
  },
  {
    title: "Sebastinian AlumNet Career Tracker",
    category: "Cloud Platform",
    desc: "Alumni network directory connecting graduating BSIT seniors with alumni in top tech companies for mentorship.",
    badge: "Community Platform",
    tags: ["Next.js", "PostgreSQL", "OAuth2", "Cloud"],
  },
  {
    title: "Cloud Lab Virtual Machine Orchestrator",
    category: "DevOps & Infrastructure",
    desc: "Automated student server environment provisioner for hands-on Linux, Docker, and database laboratory sessions.",
    badge: "Lab System",
    tags: ["Docker", "Linux", "AWS", "DevOps"],
  },
  {
    title: "Recoletos CyberShield Threat Analyzer",
    category: "Cybersecurity",
    desc: "Real-time network vulnerability assessment tool designed for educational security audits and pen-testing labs.",
    badge: "Research Project",
    tags: ["Python", "Wireshark", "SecOps", "PenTesting"],
  },
];

interface IdeFile {
  id: string;
  name: string;
  lang: string;
  code: string;
}

const pageIdeConfigurations: Record<string, IdeFile[]> = {
  home: [
    {
      id: "chapter",
      name: "chapter.config.ts",
      lang: "typescript",
      code: `import { Chapter, Program } from "@jpcs/sscr-core";

export const sscrChapter = new Chapter({
  institution: "San Sebastian College Recoletos Manila",
  department: "Information Technology (BSIT)",
  organization: "Junior Philippine Computer Society",
  academicYear: "2026-2027",
  status: "Active & Accredited",
  mission: "Empowering Sebastinian IT Leaders through tech innovation"
});`,
    },
    {
      id: "tracks",
      name: "specializations.ts",
      lang: "typescript",
      code: `export const academicTracks = [
  { track: "Software Engineering", focus: "Full-Stack, Clean Architecture & DevOps" },
  { track: "Cybersecurity Defense", focus: "Network Security, Pentesting & Threat Ops" },
  { track: "Cloud & Data Systems", focus: "Distributed Architecture & Cloud Native" },
  { track: "Applied AI Systems",   focus: "Machine Learning, Computer Vision & LLMs" }
];`,
    },
    {
      id: "community",
      name: "community.json",
      lang: "json",
      code: `{
  "chapter": "JPCS - SSCR Manila",
  "membership": "Open to all Sebastinian BSIT students",
  "initiatives": [
    "Technical Hackathons & Project Sprints",
    "Peer-to-Peer Coding Masterclasses",
    "Industry Tech Talks & Mentorship Circles"
  ]
}`,
    },
  ],
  programs: [
    {
      id: "curriculum",
      name: "curriculum.config.ts",
      lang: "typescript",
      code: `import { CourseRoadmap, Degree } from "@sscr/curriculum";

export const bsitProgram = new Degree({
  code: "BSIT-2026",
  name: "Bachelor of Science in Information Technology",
  units: 146,
  specializations: ["Software Engineering", "Cybersecurity", "Cloud & AI"],
  capstoneRequirement: "Production-ready enterprise thesis project"
});`,
    },
    {
      id: "labs",
      name: "hands-on-labs.ts",
      lang: "typescript",
      code: `export const labModules = [
  "Advanced Web & Cloud Native Development",
  "Database Administration & SQL Optimization",
  "Ethical Hacking & Network Defense Simulation",
  "AI Pipeline Integration & Machine Learning"
];`,
    },
    {
      id: "outcomes",
      name: "graduate-outcomes.json",
      lang: "json",
      code: `{
  "employmentRate": "94% within 6 months",
  "keyRoles": [
    "Full-Stack Software Engineer",
    "Cloud Solutions Architect",
    "Cybersecurity Operations Analyst",
    "Data Systems & AI Developer"
  ]
}`,
    },
  ],
  community: [
    {
      id: "network",
      name: "chapter-network.ts",
      lang: "typescript",
      code: `import { JPCSNational, SSCRManila } from "@jpcs/federation";

export const studentCommunity = new SSCRManila.Hub({
  members: "400+ Active BSIT Students",
  partners: ["National JPCS", "Tech Startup Ecosystem", "Alumni Guild"],
  gatherings: "Weekly Code Circles, Sprints & Mentorship"
});`,
    },
    {
      id: "events",
      name: "calendar-2026.ts",
      lang: "typescript",
      code: `export const annualEvents = [
  { event: "Sebastinian CodeCamp", season: "Q1", format: "48h Hackathon" },
  { event: "CyberShield Summit",   season: "Q2", format: "Capture The Flag" },
  { event: "AI & Cloud TechFest",  season: "Q3", format: "Keynotes & Workshops" }
];`,
    },
    {
      id: "involve",
      name: "get-involved.json",
      lang: "json",
      code: `{
  "eligibility": "All enrolled SSCR BSIT students",
  "committees": ["Technical Dev", "Events", "Creatives & Media", "Logistics"],
  "membershipDues": "Free for all regular IT students"
}`,
    },
  ],
  about: [
    {
      id: "mission",
      name: "mission-vision.ts",
      lang: "typescript",
      code: `// San Sebastian College Recoletos Manila
export const charter = {
  institution: "San Sebastian College Recoletos Manila",
  founded: "Augustinian Recollect Tradition",
  coreValues: ["Caritas", "Scientia", "Communitas"],
  itMission: "Developing ethical, innovative and industry-ready tech leaders."
};`,
    },
    {
      id: "leadership",
      name: "officers.config.ts",
      lang: "typescript",
      code: `export const officerCharter = {
  academicYear: "2026 - 2027",
  board: "BSIT Executive Council",
  headquarters: "Information Technology Department",
  adviser: "Department Chairperson & Faculty Board"
};`,
    },
    {
      id: "history",
      name: "history.json",
      lang: "json",
      code: `{
  "milestones": [
    "Established premier JPCS student chapter in Metro Manila",
    "Ranked top collegiate computing society in institutional evaluations",
    "Over 1,200+ IT alumni working worldwide in global tech firms"
  ]
}`,
    },
  ],
  testimonials: [
    {
      id: "alumni",
      name: "alumni-voices.ts",
      lang: "typescript",
      code: `import { Testimonials } from "@jpcs/alumni";

export const stories = [
  {
    author: "Engr. Mark Santos",
    batch: "BSIT Class of 2022",
    role: "Senior Cloud Engineer at Global Fintech",
    quote: "JPCS SSCR shaped not just my coding skills, but my capacity to lead large engineering teams."
  }
];`,
    },
    {
      id: "careers",
      name: "career-impact.ts",
      lang: "typescript",
      code: `export const careerTrajectory = {
  graduatesInTech: "96%",
  topDestinations: ["Enterprise SaaS", "Cloud Consulting", "Cybersecurity SOC", "AI Labs"],
  averageTimeToOffer: "< 45 Days"
};`,
    },
    {
      id: "advice",
      name: "advice-to-students.json",
      lang: "json",
      code: `{
  "topAdvice": [
    "Build real projects outside the classroom",
    "Join JPCS hackathons and collaborative build sprints",
    "Master foundational data structures and clean architecture"
  ]
}`,
    },
  ],
};

function HeroCodeCard({ pageType = "home" }: { pageType?: string }) {
  const files = pageIdeConfigurations[pageType] || pageIdeConfigurations.home;
  const [activeTab, setActiveTab] = useState(files[0].id);
  const [charCount, setCharCount] = useState(0);

  // Sync activeTab if pageType changes
  useEffect(() => {
    setActiveTab(files[0].id);
  }, [pageType]);

  const currentFile = files.find((f) => f.id === activeTab) ?? files[0];

  useEffect(() => {
    setCharCount(0);
    const interval = setInterval(() => {
      setCharCount((prev) => {
        if (prev < currentFile.code.length) {
          return prev + 2; // smooth typing pace
        }
        clearInterval(interval);
        return prev;
      });
    }, 18);

    return () => clearInterval(interval);
  }, [activeTab, currentFile.code, pageType]);

  const displayedText = currentFile.code.slice(0, charCount);
  const lines = displayedText.split("\n");

  return (
    <div className="w-full rounded-2xl bg-[#0b101b] text-slate-200 shadow-2xl border border-slate-800/90 overflow-hidden font-mono text-xs select-none">
      {/* IDE Editor Top Bar */}
      <div className="bg-[#070b13] border-b border-slate-800/80 flex items-center justify-between px-2 sm:px-3 pt-2 gap-2 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full pb-1">
          {files.map((f) => {
            const isActive = f.id === activeTab;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveTab(f.id)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-t-md transition-colors border-t-2 shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#0b101b] text-amber-400 border-amber-500 font-medium"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-slate-500 hidden sm:block pb-1 shrink-0">
          {currentFile.lang}
        </div>
      </div>

      {/* Editor Body with Line Numbers & Typing Area */}
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-4 min-h-[220px] bg-[#0b101b] overflow-x-auto text-[11.5px] leading-relaxed">
        {/* Line Numbers */}
        <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/60 font-mono text-[11px] shrink-0">
          {Array.from({ length: Math.max(lines.length, 8) }).map((_, idx) => (
            <div key={idx} className="leading-relaxed">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code View with Blinking Cursor */}
        <pre className="font-mono text-slate-300 whitespace-pre overflow-x-auto scrollbar-none flex-1 leading-relaxed">
          <code>
            {lines.map((line, lIdx) => (
              <div key={lIdx} className="leading-relaxed">
                {/* Minimal clean syntax highlighting */}
                {line.split(/(import|from|export|const|new|return|true|false|\[|\]|\{|\}|"[^"]*")/g).map((chunk, cIdx) => {
                  if (["import", "from", "export", "const", "new", "return"].includes(chunk)) {
                    return <span key={cIdx} className="text-rose-400">{chunk}</span>;
                  }
                  if (chunk.startsWith('"') && chunk.endsWith('"')) {
                    return <span key={cIdx} className="text-emerald-300">{chunk}</span>;
                  }
                  if (chunk.startsWith("//")) {
                    return <span key={cIdx} className="text-slate-500 italic">{chunk}</span>;
                  }
                  return <span key={cIdx} className="text-slate-200">{chunk}</span>;
                })}
                {lIdx === lines.length - 1 && charCount < currentFile.code.length && (
                  <span className="inline-block w-2 h-3.5 bg-amber-400 align-middle ml-0.5 animate-pulse" />
                )}
                {lIdx === lines.length - 1 && charCount >= currentFile.code.length && (
                  <span className="inline-block w-2 h-3.5 bg-amber-400/50 align-middle ml-0.5 animate-pulse" />
                )}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* IDE Status Bar */}
      <div className="bg-[#070b13] border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">UTF-8</span>
          <span className="text-slate-400">{currentFile.lang.toUpperCase()}</span>
          <span className="text-emerald-400">Ln {lines.length}, Col {lines[lines.length - 1]?.length || 1}</span>
        </div>
        <div className="text-slate-400">JPCS · SSCR Manila</div>
      </div>
    </div>
  );
}

function PageHero({
  eyebrow,
  title,
  copy,
  primary,
  primaryTo,
  secondary,
  secondaryTo,
  home = false,
  pageType = "home",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  primary: string;
  primaryTo: string;
  secondary?: string;
  secondaryTo?: string;
  home?: boolean;
  imageLabel?: string;
  imageFile?: string;
  pageType?: "home" | "programs" | "community" | "about" | "testimonials";
}) {
  return (
    <section className={`site-page-hero${home ? " site-page-hero--home" : ""}`}>
      <div className="site-shell">
        <Reveal className="site-page-hero__copy w-full min-w-0">
          <div className="text-[#800000] text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase mb-3 leading-snug">
            {eyebrow}
          </div>
          <h1 className="text-slate-900 font-black tracking-tight text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15]">
            {title}
          </h1>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base mt-3 max-w-xl">
            {copy}
          </p>
          <div className="site-page-hero__actions">
            <AnimatedButton to={primaryTo}>{primary}</AnimatedButton>
            {secondary && secondaryTo && <AnimatedButton to={secondaryTo} variant="outline">{secondary}</AnimatedButton>}
          </div>
        </Reveal>
        <Reveal className="site-page-hero__visual w-full min-w-0" delay={0.12}>
          <HeroCodeCard pageType={pageType} />
        </Reveal>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Seo {...seo.home} />
      <PageHero
        home
        eyebrow="San Sebastian College Recoletos Manila · IT Department"
        title="Empowering Future Computing Professionals & Tech Innovators"
        copy="The IT Department of SSCR Manila, in partnership with the Junior Philippine Computer Society, builds elite technical skills, leadership, and impactful real-world software solutions."
        primary="Sign In to Portal"
        primaryTo="/login"
        secondary="Explore Programs & Curriculum"
        secondaryTo="/programs"
      />

      {/* ── Key Department Statistics Banner ──────────────────────── */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="site-shell">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-slate-200">
            {departmentStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.05} className="md:px-8 first:pl-0 last:pr-0">
                <p className="text-4xl sm:text-5xl font-black text-[#800000] tracking-tight leading-none">
                  {stat.value}
                </p>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-2.5">
                  {stat.label}
                </h4>
                <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                  {stat.sub}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── IT Specialization Pillars & Tech Stack Grid ──────────────── */}
      <section className="site-section" id="page-intro">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Specialization Pillars"
            title="Comprehensive IT disciplines aligned with industry demands."
            copy="Students gain deep theoretical mastery combined with hands-on development in computer laboratories and collaborative sprints."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {itPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={idx * 0.06} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="size-11 rounded-xl bg-[#800000]/10 text-[#800000] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {pillar.tags.join(" · ")}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Student Innovation & Capstone Showcase (Automatic Slider) ──────────────────── */}
      <section className="site-section bg-slate-50/70 border-y border-slate-200/80 overflow-hidden">
        <div className="site-shell mb-8">
          <SectionHeading
            eyebrow="Innovation & Capstone Spotlight"
            title="Real systems engineered by SSCR Manila IT students."
            copy="From academic portals to embedded IoT and document intelligence, discover what our undergraduates build."
          />
        </div>

        {/* Automatic Infinite Sliding Track without < > buttons */}
        <div className="capstone-marquee-container">
          <div className="capstone-marquee-track">
            {[...featuredProjects, ...featuredProjects].map((proj, idx) => (
              <div
                key={`${proj.title}-${idx}`}
                className="w-[330px] sm:w-[380px] shrink-0 p-7 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between select-none group min-h-[260px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#800000] tracking-wide">{proj.category}</span>
                    <span className="text-xs text-slate-400 font-medium tracking-normal">{proj.badge}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug mt-3.5 group-hover:text-[#800000] transition-colors">{proj.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-2.5 text-justify">{proj.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100/90 text-slate-600 group-hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Department Narrative (Beyond the Syllabus) ────────────────── */}
      <section className="site-section bg-white border-b border-slate-200">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#800000]">Beyond the syllabus</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2 leading-[1.12]">
              A computing education designed for real-world impact.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed text-justify">
              Classroom theory gains meaning when tested through real software projects, active leadership, and professional networking. The IT Department of SSCR Manila bridges the gap between academic foundations and modern tech industry practices.
            </p>
          </div>

          {/* 3 Pillars / Impact Cards - Clean & Modern, No Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Reveal delay={0.04} className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-50/80 transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-[#800000]">01 / FOUNDATION</span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">Applied Engineering</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Move beyond rote theory into building scalable production code, enterprise databases, and verified security architectures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-mono text-slate-500">
                CORE CAPSTONE & LABS
              </div>
            </Reveal>

            <Reveal delay={0.08} className="p-7 rounded-2xl bg-[#1c2b3a] text-white flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">02 / LEADERSHIP</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Student-Led Agency</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
                  Take ownership through JPCS committees, organizing collegiate hackathons, peer tech workshops, and community outreach.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-amber-300/80">
                JPCS CHAPTER EMPOWERMENT
              </div>
            </Reveal>

            <Reveal delay={0.12} className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-50/80 transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-[#800000]">03 / CAREER</span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">Industry Readiness</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Connect with alumni tech leaders, industry partners, and tech startup pipelines to transition seamlessly into IT careers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-mono text-slate-500">
                ALUMNI & PARTNERSHIP NETWORK
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Leadership Story & Quote ─────────────────────────────── */}
      <section className="site-section site-story">
        <div className="site-shell site-story__grid">
          <Reveal>
            <ImagePlaceholder label="Department adviser or president portrait" file="home-adviser-portrait.webp" />
          </Reveal>
          <Reveal className="site-story__quote" delay={0.08}>
            <Quote aria-hidden="true" />
            <blockquote>
              “The IT Department should be the place where students discover that they are capable of more—because they have people beside them, meaningful work in front of them, and room to lead.”
            </blockquote>
            <p>
              <strong>Keith Czimonne Anderson Ciceron</strong>
              <span>Current BSIT President · JPCS SSCR Manila</span>
            </p>
            <AnimatedButton to="/about" variant="text">Meet our leadership council</AnimatedButton>
          </Reveal>
        </div>
      </section>

      {/* ── Membership & Contributor Tiers ─────────────────────────── */}
      <section className="site-section site-membership">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Participate & Collaborate"
            title="Choose how you would like to take part."
            copy="Join our active community of learners, developers, and student leaders."
          />
          <div className="site-membership__grid">
            {memberships.map((option, index) => (
              <Reveal className={`site-membership-card${index ? " is-dark" : ""}`} delay={index * 0.08} key={option.title}>
                <span className="site-eyebrow">{option.label}</span>
                <h3>{option.title}</h3>
                <p>{option.note}</p>
                <ul>
                  {option.items.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <AnimatedButton to={option.to} variant={index ? "light" : "primary"}>
                  {option.action}
                </AnimatedButton>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ProgramsPage() {
  return (
    <>
      <Seo {...seo.programs} />
      <PageHero
        pageType="programs"
        eyebrow="IT Department programs"
        title="Move beyond theory and start building real technical capability."
        copy="IT Department programs give computing students opportunities to learn, lead, collaborate, compete, and create."
        primary="View upcoming activities"
        primaryTo="/community#resources"
      />
      <section className="site-section site-intro" id="page-intro">
        <div className="site-shell site-intro__grid">
          <SectionHeading eyebrow="Practice with purpose" title="Practical experiences designed around the needs of computing students." />
          <Reveal>
            <p>Classroom foundations matter. The IT Department adds the situations that make them usable: working with a team, explaining a decision, responding to feedback, and carrying an idea through to a thoughtful result.</p>
            <AnimatedButton to="/community" variant="text">See who takes part</AnimatedButton>
          </Reveal>
        </div>
      </section>

      {/* ── Clean Text-Only Programs Grid (No Placeholder Images) ─────────────── */}
      <section className="py-12 md:py-16 bg-white border-y border-slate-200">
        <div className="site-shell">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {programFeatures.map((feature, index) => (
              <Reveal
                key={feature.title}
                delay={index * 0.05}
                className="p-8 sm:p-10 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#800000] uppercase block">
                    {feature.eyebrow}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/80">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2">
                        <Check className="size-4 text-[#800000] shrink-0" aria-hidden="true" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section site-audiences">
        <div className="site-shell">
          <SectionHeading eyebrow="Shared value" title="Programs that strengthen students, partners, and the college community." />
          <div className="site-audiences__grid">
            {audienceBenefits.map((audience, index) => (
              <Reveal className="site-audience-card" delay={index * 0.06} key={audience.title}>
                <span>0{index + 1}</span>
                <h3>{audience.title}</h3>
                <ul>
                  {audience.items.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function CommunityPage() {
  return (
    <>
      <Seo {...seo.community} />
      <PageHero
        pageType="community"
        eyebrow="The IT Department community"
        title="A stronger computing community, built around every student."
        copy="The IT Department brings students, officers, educators, alumni, and industry partners together through shared learning and meaningful experiences."
        primary="Sign In to Portal"
        primaryTo="/login"
      />

      <section className="site-section site-community-overview" id="page-intro"><div className="site-shell"><SectionHeading eyebrow="Many perspectives, one chapter" title="One organization. Different opportunities for every member of the community." />
        <div className="site-community-overview__grid"><Reveal><span>01</span><h3>Students</h3><p>Learn with peers, build experience, and find the confidence to contribute.</p></Reveal><Reveal delay={0.06}><span>02</span><h3>Officers</h3><p>Turn service and responsibility into leadership that lasts beyond one event.</p></Reveal><Reveal delay={0.12}><span>03</span><h3>Partners and alumni</h3><p>Share insight, create access, and stay connected to the next generation.</p></Reveal></div>
      </div></section>
      <section className="site-section site-community-groups"><div className="site-shell">{communityAudiences.map((audience, index) => <article className={`site-community-group${index % 2 ? " is-reversed" : ""}`} key={audience.title}><Reveal className="site-community-group__visual"><ImagePlaceholder label={audience.imageLabel} file={audience.imageFile} /></Reveal><Reveal className="site-community-group__copy" delay={0.08}><span className="site-eyebrow">{audience.eyebrow}</span><h2>{audience.title}</h2><p>{audience.description}</p><div className="site-community-group__list">{audience.items.map((item) => <span key={item}><Check aria-hidden="true" />{item}</span>)}</div></Reveal></article>)}</div></section>
      <section className="site-section site-learning" id="resources"><div className="site-shell site-learning__grid"><Reveal><span className="site-eyebrow">Shared learning</span><h2>Speak the same language of innovation, leadership, and service.</h2><p>The IT Department creates a connected technology community by giving students, educators, alumni, and partners a shared place to exchange knowledge and build things that matter.</p><a className="site-resource-link" href="/JPCS-membership-guide-placeholder.md" download><Download aria-hidden="true" /><span>View IT Department resources<small>Placeholder guide · replace when official details are available</small></span><ExternalLink aria-hidden="true" /></a></Reveal><Reveal delay={0.1}><ImagePlaceholder label="Shared learning and resources image" file="community-resources.webp" /></Reveal></div></section>
    </>
  );
}

function OfficerOrgChart() {
  const president = officers.find((o) => o.role === "President")!;
  const vp = officers.find((o) => o.role === "Vice President")!;
  const secretary = officers.find((o) => o.role === "Secretary")!;
  const treasurer = officers.find((o) => o.role === "Treasurer")!;
  const auditor = officers.find((o) => o.role === "Auditor")!;
  const pro = officers.find((o) => o.role === "P.R.O.")!;
  const techHead = officers.find((o) => o.role === "Technical Head")!;
  const contentManager = officers.find((o) => o.role === "Content Manager")!;
  const sportsHead = officers.find((o) => o.role === "Head of Sports")!;
  const yearReps = officers.filter((o) => o.role.includes("Representative"));

  const renderTreeCard = (officer: typeof officers[0], isMain = false) => {
    const formalPhoto = officer.profile_photo;
    const casualPhoto = (officer as any).action_photo;
    const hasBothPhotos = Boolean(formalPhoto && casualPhoto && formalPhoto !== casualPhoto);
    const primaryPhoto = formalPhoto || casualPhoto;

    return (
      <div
        key={officer.name}
        className={`bg-white/95 backdrop-blur-xs rounded-xl border transition-all text-center flex flex-col items-center justify-between p-2.5 shadow-sm hover:shadow-md group/card ${
          isMain
            ? "w-52 border-[#800000]/50 ring-2 ring-[#800000]/15"
            : "w-36 border-slate-200/90 hover:border-slate-300"
        }`}
      >
        <div className="flex flex-col items-center w-full">
          {/* Avatar Container with Formal -> Casual Smooth Hover Crossfade */}
          <div
            className={`relative rounded-lg overflow-hidden border bg-slate-100 shrink-0 mb-1.5 cursor-pointer ${
              isMain ? "size-20 border-[#800000]/30 shadow-xs" : "size-16 border-slate-200"
            }`}
          >
            {primaryPhoto ? (
              <>
                <img
                  src={primaryPhoto}
                  alt={`${officer.name} formal`}
                  className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 ${
                    hasBothPhotos ? "group-hover/card:opacity-0" : ""
                  }`}
                  loading="lazy"
                />
                {hasBothPhotos && (
                  <img
                    src={casualPhoto}
                    alt={`${officer.name} casual`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/card:opacity-100 transition-all duration-500 ease-out group-hover/card:scale-105"
                    loading="lazy"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-slate-400">
                IT
              </div>
            )}
          </div>

          <span
            className={`text-[9.5px] font-mono font-bold uppercase block leading-tight ${
              isMain ? "text-[#800000]" : "text-slate-500"
            }`}
          >
            {officer.role}
          </span>
          <h4 className="text-[11.5px] font-bold text-slate-900 leading-tight mt-0.5 max-w-[130px] truncate">
            {officer.name}
          </h4>
        </div>
        <p className="text-[9.5px] text-slate-400 mt-0.5">{officer.course}</p>
      </div>
    );
  };

  const renderMobileOfficerCard = (officer: typeof officers[0], isMain = false) => {
    const formalPhoto = officer.profile_photo;
    const casualPhoto = (officer as any).action_photo;
    const hasBothPhotos = Boolean(formalPhoto && casualPhoto && formalPhoto !== casualPhoto);
    const primaryPhoto = formalPhoto || casualPhoto;

    return (
      <div
        key={officer.name}
        className={`bg-white/95 backdrop-blur-xs rounded-2xl border transition-all text-center flex flex-col items-center justify-between p-3.5 shadow-2xs hover:shadow-md ${
          isMain
            ? "border-[#800000]/40 ring-2 ring-[#800000]/10 w-full max-w-sm"
            : "border-slate-200 w-full"
        }`}
      >
        <div className="flex flex-col items-center w-full">
          <div
            className={`relative rounded-xl overflow-hidden border bg-slate-100 shrink-0 mb-2 ${
              isMain ? "size-24 border-[#800000]/30 shadow-xs" : "size-20 border-slate-200"
            }`}
          >
            {primaryPhoto ? (
              <>
                <img
                  src={primaryPhoto}
                  alt={`${officer.name} formal`}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    hasBothPhotos ? "group-hover:opacity-0" : ""
                  }`}
                  loading="lazy"
                />
                {hasBothPhotos && (
                  <img
                    src={casualPhoto}
                    alt={`${officer.name} casual`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-all duration-500"
                    loading="lazy"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-slate-400">
                IT
              </div>
            )}
          </div>

          <span
            className={`text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider block ${
              isMain ? "text-[#800000] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 mb-1" : "text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mb-1"
            }`}
          >
            {officer.role}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mt-0.5 text-center px-1">
            {officer.name}
          </h4>
        </div>
        <p className="text-[10.5px] text-slate-500 font-medium mt-1">{officer.course}</p>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto py-4 relative flex flex-col items-center justify-center">
      {/* Big Watermark Background Text */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0 text-center"
      >
        <span 
          className="text-[clamp(4.2rem,12vw,10.5rem)] font-black tracking-tight uppercase whitespace-nowrap leading-none bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(148, 163, 184, 0.32) 0%, rgba(186, 196, 210, 0.28) 32%, rgba(245, 180, 80, 0.28) 68%, rgba(245, 158, 11, 0.35) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          BSIT OFFICERS
        </span>
      </div>

      {/* ── Mobile & Tablet Stacked View (100% Readable, No Clipping) ── */}
      <div className="lg:hidden w-full flex flex-col items-center gap-6 relative z-1 py-2">
        {/* Tier 1: President */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="mb-3 text-center">
            <span className="text-xs font-mono font-black tracking-wider text-[#800000] uppercase block">
              SAN SEBASTIAN COLLEGE RECOLETOS MANILA
            </span>
            <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
              Information Technology Department
            </span>
          </div>
          {renderMobileOfficerCard(president, true)}
        </div>

        {/* Tier 2: Executive Officers */}
        <div className="w-full">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block text-center mb-2.5">
            Executive Board
          </span>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
            {renderMobileOfficerCard(vp)}
            {renderMobileOfficerCard(secretary)}
            {renderMobileOfficerCard(treasurer)}
            {renderMobileOfficerCard(auditor)}
          </div>
        </div>

        {/* Tier 3: Operations & Technical Team */}
        <div className="w-full">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block text-center mb-2.5">
            Department Committee Heads
          </span>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
            {[pro, techHead, contentManager, sportsHead].map((off) =>
              renderMobileOfficerCard(off)
            )}
          </div>
        </div>

        {/* Tier 4: Year Level Representatives */}
        <div className="w-full">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block text-center mb-2.5">
            Year Level Representatives
          </span>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
            {yearReps.map((off) => renderMobileOfficerCard(off))}
          </div>
        </div>
      </div>

      {/* ── Desktop & Laptop Tree Hierarchy Board (Full View) ────────── */}
      <div className="hidden lg:flex min-w-[900px] flex-col items-center justify-center select-none relative z-1 my-auto">
        {/* Tier 1: President */}
        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <span className="text-sm sm:text-base font-mono font-extrabold tracking-wider text-[#800000] uppercase block">
              SAN SEBASTIAN COLLEGE RECOLETOS MANILA
            </span>
            <span className="text-xs sm:text-sm font-semibold text-amber-700 block mt-0.5 tracking-normal">
              Information Technology Department
            </span>
          </div>
          {renderTreeCard(president, true)}
          <div className="w-px h-8 bg-amber-900/20" />
        </div>

        {/* Tier 2: Vice President & Secretary */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[320px] h-px bg-amber-900/20" />
          <div className="flex justify-between w-[320px]">
            <div className="w-px h-6 bg-amber-900/20" />
            <div className="w-px h-6 bg-amber-900/20" />
          </div>
          <div className="flex justify-center gap-12 w-full">
            {renderTreeCard(vp)}
            {renderTreeCard(secretary)}
          </div>
          <div className="w-px h-8 bg-amber-900/20 mt-0" />
        </div>

        {/* Tier 3: Operations & Technical Team */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[880px] h-px bg-amber-900/20" />
          <div className="flex justify-between w-[880px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-px h-6 bg-amber-900/20" />
            ))}
          </div>
          <div className="flex justify-center gap-4 w-full">
            {[treasurer, auditor, pro, techHead, contentManager, sportsHead].map((off) =>
              renderTreeCard(off)
            )}
          </div>
          <div className="w-px h-8 bg-amber-900/20 mt-0" />
        </div>

        {/* Tier 4: Year Level Representatives */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[660px] h-px bg-amber-900/20" />
          <div className="flex justify-between w-[660px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-px h-6 bg-amber-900/20" />
            ))}
          </div>
          <div className="flex justify-center gap-6 w-full">
            {yearReps.map((off) => renderTreeCard(off))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <>
      <Seo {...seo.about} />
      <PageHero
        pageType="about"
        eyebrow="About the department"
        title="A student community built to help future computing professionals thrive."
        copy="The IT Department of SSCR Manila creates opportunities for students to strengthen technical skills, develop leadership, build meaningful connections, and serve the wider community."
        primary="Sign In to Portal"
        primaryTo="/login"
      />

      {/* ── Clean Unified Mission & Vision with Editorial Divider ── */}
      <section className="py-12 md:py-16 bg-white border-y border-slate-200" id="page-intro">
        <div className="site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 lg:divide-x lg:divide-slate-200 items-start">
            {/* Mission Column */}
            <Reveal className="flex flex-col justify-start h-full lg:pr-16">
              <span className="text-xs font-mono font-bold tracking-widest text-[#800000] uppercase block">
                01 · OUR MISSION
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-4 min-h-[5.5rem] flex items-start">
                Develop capable, ethical, innovative, and service-oriented computing leaders.
              </h3>
              <p 
                className="text-base text-slate-600 leading-relaxed mt-5"
                style={{ textAlign: "justify", textJustify: "inter-word" }}
              >
                We bridge classroom foundations and practical software engineering through student-led technical workshops, peer mentorship, applied research, and hands-on laboratory sprints.
              </p>
            </Reveal>

            {/* Vision Column */}
            <Reveal delay={0.08} className="flex flex-col justify-start h-full lg:pl-16 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-200">
              <span className="text-xs font-mono font-bold tracking-widest text-[#800000] uppercase block">
                02 · OUR VISION
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-4 min-h-[5.5rem] flex items-start">
                Become the premier collegiate technology community across the academic sphere.
              </h3>
              <p 
                className="text-base text-slate-600 leading-relaxed mt-5"
                style={{ textAlign: "justify", textJustify: "inter-word" }}
              >
                A dynamic student chapter recognized for technical excellence, transformative open-source contributions, and empowering computing graduates who thrive in enterprise engineering environments.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="site-section site-team">
        <div className="site-shell">
          <SectionHeading align="center" eyebrow="Organizational Structure" title="IT Department Officer Hierarchy" copy="San Sebastian College Recoletos Manila · Information Technology Department Officers (S.Y. 2026 - 2027)" />
          
          {/* Relative wrapper allowing pushpin to overflow safely above the box without clipping */}
          <div className="relative mt-8">
            {/* Single Pushpin Icon on Top-Right Corner */}
            <div className="absolute -top-5 right-2 sm:right-4 z-30 pointer-events-none drop-shadow-md">
              <img src="/pin.png" alt="Pinned board" className="size-10 sm:size-12 object-contain rotate-[-10deg]" />
            </div>

            <div className="org-chart-master-box !mt-0">
              <OfficerOrgChart />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TestimonialsPage() {
  return (
    <>
      <Seo {...seo.testimonials} />
      <PageHero
        pageType="testimonials"
        eyebrow="Alumni Stories"
        title="Voices of the Department Legacy"
        copy="Hear directly from the alumni students and student leaders who shaped the IT Department of SSCR Manila. Learn how their experiences in the department helped them launch successful careers in the tech industry."
        primary="Join the Department Today"
        primaryTo="/login"
      />

      <section className="site-section site-testimonials" id="page-intro">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Our Legacy"
            title="Real Stories, Real Impact"
            copy="IT Department alumni share how leadership, technical bootcamps, and a strong professional community gave them the tools to thrive after graduation."
          />
          <div className="site-testimonials__grid">
            {alumniTestimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} className="site-testimonial-card" delay={index * 0.08}>
                <div className="site-testimonial-card__top">
                  <div className="site-testimonial-card__quote-icon">
                    <Quote aria-hidden="true" />
                  </div>
                  <blockquote className="site-testimonial-card__quote">
                    “{testimonial.quote}”
                  </blockquote>
                </div>
                <div className="site-testimonial-card__author">
                  <div className="site-testimonial-card__avatar">
                    <img 
                      src={testimonial.imageFile} 
                      alt={testimonial.name} 
                      onError={(e) => {
                        e.currentTarget.src = "/jpcs-logo.png";
                      }} 
                    />
                  </div>
                  <div className="site-testimonial-card__meta">
                    <h3 className="site-testimonial-card__name">{testimonial.name}</h3>
                    <p className="site-testimonial-card__role">{testimonial.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
