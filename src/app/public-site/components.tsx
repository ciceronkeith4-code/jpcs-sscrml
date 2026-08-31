import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, ChevronUp, Code2, HeartHandshake, Menu, Network, Scale, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { footerGroups, navigation, type Feature } from "./data";
import "./site.css";

gsap.registerPlugin(ScrollTrigger);

type SeoData = { title: string; description: string; path: string };

export function Seo({ title, description, path }: SeoData) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (match) element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", `https://example.com${path}`);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://example.com${path}`;
  }, [description, path, title]);
  return null;
}

export function RollingText({ children }: { children: string }) {
  return <span className="site-rolling" aria-label={children}><span aria-hidden="true">{children}</span><span aria-hidden="true">{children}</span></span>;
}

export function SiteLink({ to, className, children, onClick }: { to: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return <Link to={to} className={className} onClick={onClick}>{children}</Link>;
}

export function AnimatedButton({ to, children, variant = "primary", className = "" }: { to: string; children: string; variant?: "primary" | "outline" | "light" | "dark" | "text"; className?: string }) {
  return (
    <motion.div className={`site-button-wrap ${className}`} whileTap={{ scale: 0.98 }}>
      <SiteLink to={to} className={`site-button site-button--${variant}`}>
        <RollingText>{children}</RollingText><ArrowRight aria-hidden="true" />
      </SiteLink>
    </motion.div>
  );
}

function Logo() {
  return (
    <SiteLink to="/" className="site-logo">
      <img src="/sscr-logo.png" width="48" height="48" alt="SSCR Logo" />
      <img src="/jpcs-logo.png" width="48" height="48" alt="JPCS Logo" />
      <span>
        <strong className="logo-text-full">IT DEPARTMENT OF SSCR MANILA</strong>
        <strong className="logo-text-short">JPCS</strong>
        <small>JPCS | SSCR MANILA CHAPTER</small>
      </span>
    </SiteLink>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduce ? 0.15 : 0.68, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function ImagePlaceholder({ label, file, className = "", priority = false }: { label: string; file: string; className?: string; priority?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (reduce || !frame.current || hasError) return;
    const context = gsap.context(() => {
      const inner = frame.current?.querySelector(".site-image-placeholder__inner");
      if (!inner) return;
      gsap.fromTo(inner, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: 0.7 } });
    }, frame);
    return () => context.revert();
  }, [reduce, hasError]);

  return (
    <div ref={frame} className={`site-image-placeholder ${hasError ? "is-fallback" : "has-image"} ${className}`} role="img" aria-label={label} data-priority={priority || undefined}>
      {!hasError && (
        <img 
          src={`/images/${file}`} 
          alt={label} 
          className="site-image-placeholder__img" 
          loading={priority ? "eager" : "lazy"}
          onError={() => setHasError(true)} 
        />
      )}
      {hasError && (
        <>
          <div className="site-image-placeholder__inner" />
          <span className="relative z-0">{label}</span>
          <small className="relative z-0">Replace with /images/{file}</small>
        </>
      )}
    </div>
  );
}


export function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return (
    <Reveal className={`site-section-heading site-section-heading--${align}`}>
      <span className="site-eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}
    </Reveal>
  );
}

export function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  return (
    <article className={`site-feature-row${index % 2 ? " is-reversed" : ""}`}>
      <Reveal className="site-feature-row__visual"><ImagePlaceholder label={feature.imageLabel} file={feature.imageFile} /></Reveal>
      <Reveal className="site-feature-row__copy" delay={0.08}>
        <span className="site-eyebrow">{feature.eyebrow}</span><h3>{feature.title}</h3><p>{feature.description}</p>
        <ul>{feature.details.map((detail) => <li key={detail}><Check aria-hidden="true" />{detail}</li>)}</ul>
      </Reveal>
    </article>
  );
}

export const benefitIcons = { code: Code2, lead: Users, connect: Network, impact: HeartHandshake } as const;

function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("site-menu-open");
    const timer = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus(), 40);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("site-menu-open");
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [close, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={panel} className="site-mobile-menu" id="site-mobile-menu" role="dialog" aria-modal="true" aria-label="Site navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          <div className="site-mobile-menu__top"><Logo /><button type="button" onClick={close} aria-label="Close menu"><X /></button></div>
          <nav aria-label="Mobile navigation" className="space-y-1.5 my-auto py-3 w-full">
            {navigation.map((item, index) => {
              if (item.dropdown) {
                return (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05 }}>
                    <button
                      type="button"
                      onClick={() => setMobileDropdownOpen((prev) => !prev)}
                      className="site-mobile-nav-item justify-between group"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="nav-num">0{index + 1}</span>
                        <span className="nav-text group-hover:text-amber-200 transition-colors">{item.label}</span>
                      </span>
                      <ChevronDown className={`size-6 text-white/80 transition-transform duration-200 shrink-0 ${mobileDropdownOpen ? "rotate-180 text-amber-300" : ""}`} />
                    </button>
                    {mobileDropdownOpen && (
                      <div className="pl-9 pb-2 pt-1 space-y-1 border-l-2 border-white/25 ml-3 my-1">
                        {item.dropdown.map((sub) => (
                          <SiteLink
                            key={sub.label}
                            to={sub.to}
                            onClick={close}
                            className="site-mobile-sublink"
                          >
                            <span>{sub.label}</span>
                          </SiteLink>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              }

              return (
                <motion.div key={item.to} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05 }}>
                  <SiteLink to={item.to} onClick={close} className="site-mobile-nav-item group">
                    <span className="nav-num">0{index + 1}</span>
                    <span className="nav-text group-hover:text-amber-200 transition-colors">{item.label}</span>
                  </SiteLink>
                </motion.div>
              );
            })}
          </nav>
          <div className="site-mobile-menu__bottom pt-4 border-t border-white/15 w-full">
            <div className="w-full space-y-2">
              <Link
                to="/login"
                onClick={close}
                style={{ backgroundColor: "#ffffff", color: "#800000" }}
                className="site-mobile-login-btn active:scale-98 transition-transform"
              >
                <span style={{ color: "#800000", fontWeight: 900 }}>MEMBER LOGIN &amp; PORTAL</span>
                <ArrowRight className="size-4 shrink-0" style={{ color: "#800000" }} />
              </Link>
              <p className="text-[11px] text-white/70 text-center">Official email: jpcssscrmnl@gmail.com</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-shell site-header__inner">
          <Logo />
          <nav className="site-nav" aria-label="Main navigation">
            {navigation.map((item) => {
              if (item.dropdown) {
                return (
                  <div
                    key={item.label}
                    ref={dropdownRef}
                    className="relative group py-2"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 font-semibold text-[0.86rem] text-slate-700 hover:text-[#800000] transition-colors cursor-pointer py-1"
                      aria-expanded={dropdownOpen}
                    >
                      <RollingText>{item.label}</RollingText>
                      <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#800000]" : ""}`} />
                    </button>

                    {/* Dropdown Menu Box */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-64 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden"
                        >
                          <div className="space-y-1">
                            {item.dropdown.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.to}
                                onClick={() => setDropdownOpen(false)}
                                className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item"
                              >
                                <span className="block text-xs font-bold text-slate-800 group-hover/item:text-[#800000] transition-colors">
                                  {sub.label}
                                </span>
                                {sub.desc && (
                                  <span className="block text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                                    {sub.desc}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => (isActive && !item.to.includes("#") ? "is-active" : undefined)}
                >
                  <RollingText>{item.label}</RollingText>
                </NavLink>
              );
            })}
          </nav>
          <div className="site-header__actions">
            <AnimatedButton to="/login">LOGIN</AnimatedButton>
          </div>
          <button className="site-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="site-mobile-menu" aria-label="Open menu"><Menu /></button>
        </div>
      </header>
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
    </>
  );
}

export function LegalModal({
  activeTab,
  onClose,
  onTabChange,
}: {
  activeTab: "privacy" | "terms";
  onClose: () => void;
  onTabChange: (tab: "privacy" | "terms") => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Plain White Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {activeTab === "privacy" ? "Privacy Policy" : "Terms & System Ownership"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                JPCS · San Sebastian College - Recoletos Manila Chapter
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Clean Navigation Tabs */}
          <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-bold bg-slate-50">
            <button
              type="button"
              onClick={() => onTabChange("privacy")}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === "privacy"
                  ? "border-[#800000] text-[#800000]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onTabChange("terms")}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === "terms"
                  ? "border-[#800000] text-[#800000]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Terms of Service & Ownership
            </button>
          </div>

          {/* Plain White Simple Text Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white scrollbar-thin scrollbar-thumb-slate-200">
            {activeTab === "privacy" ? (
              <>
                <p className="text-slate-500 text-xs pb-2 border-b border-slate-100">
                  This privacy policy describes how student records are protected in compliance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
                </p>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">1. Information We Collect</h3>
                  <p>
                    When accessing the JPCS Academic Portal, the system processes student identification details including Full Name, Student Number, Official Institutional Email (@sscrmnl.edu.ph), Degree Program (BSIT), and Academic Year Level.
                  </p>
                  <p>
                    For curriculum roadmapping and grade point average (GPA) calculation, the system securely stores semester enrollments, course blocks, credit units, classroom schedules, and numerical course grades.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">2. Purpose of Data Processing</h3>
                  <p>
                    All collected information is used solely for portal authentication, academic tracking, grade point average computation, honors and medal eligibility projection, and official organization officer directory display.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">3. Confidentiality & Security Safeguards</h3>
                  <p>
                    Student records are strictly confidential. We do not sell, rent, or disclose student records to external commercial entities or advertisers. All network communications are protected via SSL/TLS encryption, and database access is restricted through automated Row-Level Security (RLS) policies.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">4. Student Rights & Contact Information</h3>
                  <p>
                    Under RA 10173, students retain the right to access their stored academic records, rectify erroneous entries, or request profile updates. For inquiries or data assistance, contact us at <a href="mailto:jpcssscrmnl@gmail.com" className="text-[#800000] font-semibold underline hover:text-[#500000]">jpcssscrmnl@gmail.com</a>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-500 text-xs pb-2 border-b border-slate-100">
                  Terms and intellectual property ownership governing the official platform of the Junior Philippine Computer Society – SSCR Manila Chapter.
                </p>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">1. System Ownership & Development</h3>
                  <p>
                    This platform and academic portal was conceived, designed, and developed by <strong className="text-slate-900 font-bold">Keith Czimonne Anderson Ciceron</strong> (Former President & Lead Developer, JPCS San Sebastian College - Recoletos Manila Chapter).
                  </p>
                  <p>
                    The source code, database architecture, design systems, algorithms, curriculum engines, and user interfaces are the proprietary intellectual property and operational system of the <strong className="text-slate-900 font-bold">Junior Philippine Computer Society (JPCS) - San Sebastian College - Recoletos Manila Chapter</strong> in collaboration with the <strong className="text-slate-900 font-bold">SSCR Manila IT Department</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">2. Institutional Trademarks</h3>
                  <p>
                    All college logos, institutional seals, academic degree curriculums, and departmental insignias of <strong className="text-slate-900 font-bold">San Sebastian College - Recoletos Manila</strong> remain the exclusive property of the institution, utilized under recognized collegiate organization administration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">3. Permitted Use & Security Rules</h3>
                  <p>
                    Access to this platform is authorized for enrolled students, faculty members, and student leaders for educational planning, academic scheduling, organization participation, and departmental announcements. Users agree not to attempt unauthorized scraping, database tampering, credential harvesting, or reverse engineering.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">4. Academic Advisory Disclaimer</h3>
                  <p>
                    Grade simulations, prerequisite assessments, and honors projections in this portal represent planning tools aligned with the July 18 / Aug 23 departmental curriculum standards. Official transcripts, certifications, and permanent scholastic evaluations remain under the sole jurisdiction of the <strong className="text-slate-900 font-bold">SSCR Manila Office of the Registrar</strong>.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Simple Footer Bar */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>San Sebastian College - Recoletos Manila</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function Footer() {
  const [legalModalTab, setLegalModalTab] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="site-footer" id="contact">
        <div className="site-shell">
          <div className="site-footer__top">
            <div className="site-footer__brand">
              <Logo />
              <p>A student-led technology community developing future computing professionals through learning, leadership, innovation, and service.</p>
            </div>
            {footerGroups.map((group) => (
              <div className="site-footer__group" key={group.title}>
                <h3>{group.title}</h3>
                {group.links.map((link) => (
                  <SiteLink to={link.to} key={link.label}>
                    {link.label}
                  </SiteLink>
                ))}
              </div>
            ))}
            <div className="site-footer__group">
              <h3>Contact</h3>
              <a href="mailto:jpcssscrmnl@gmail.com">jpcssscrmnl@gmail.com</a>
              <span className="text-slate-300">JPCS SSCR Manila Chapter</span>
              <span>San Sebastian College Recoletos Manila</span>
            </div>
          </div>

          <div className="site-footer__bottom">
            <div className="site-footer__bottom-left">
              <span>© {new Date().getFullYear()} JPCS SSCR Manila</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-medium">Designed and Developed by Former President Keith Ciceron</span>
            </div>
            <div className="site-footer__bottom-right">
              <button
                type="button"
                onClick={() => setLegalModalTab("privacy")}
                className="site-footer__legal-btn"
              >
                Privacy Policy
              </button>
              <span className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => setLegalModalTab("terms")}
                className="site-footer__legal-btn"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
              >
                <ChevronUp />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {legalModalTab && (
        <LegalModal
          activeTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
          onTabChange={(tab) => setLegalModalTab(tab)}
        />
      )}
    </>
  );
}

export function IntroPreloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds loading duration
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 180);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="site-intro-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-intro-content">
        <motion.div
          className="site-intro-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.div
          className="site-intro-logos"
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", gap: "16px", marginBlock: "2rem 1.5rem" }}
        >
          <img src="/sscr-logo.png" alt="SSCR Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
          <img src="/jpcs-logo.png" alt="JPCS Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
        </motion.div>
        <motion.div
          className="site-intro-titles"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2>IT Department of SSCR Manila</h2>
          <p>JPCS | SSCR Manila Chapter</p>
        </motion.div>
        <div className="site-intro-progress">
          <div className="site-intro-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button className="site-intro-skip" type="button" onClick={onComplete}>
        Skip Intro →
      </button>
    </motion.div>
  );
}

export function PublicSiteLayout() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      else window.scrollTo({ top: 0, behavior: "auto" });
    }, 20);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname, reduce]);

  return (
    <div className="public-site">
      <AnimatePresence>
        {showIntro && <IntroPreloader onComplete={handleIntroComplete} />}
      </AnimatePresence>
      <a className="site-skip" href="#site-main">Skip to content</a><Header />
      <AnimatePresence mode="wait">
        <motion.main id="site-main" key={location.pathname} initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
export function FullWidthCta({ eyebrow, title, copy, action, to }: { eyebrow: string; title: string; copy?: string; action: string; to: string; imageFile?: string }) {
  return (
    <section className="site-cta-banner">
      <div className="site-cta-banner__container site-shell">
        {/* Large Watermark Text */}
        <div aria-hidden="true" className="site-cta-banner__watermark">
          <span>YOU'RE NEXT!</span>
        </div>

        {/* Centered Content */}
        <Reveal className="site-cta-banner__content">
          <h2 className="site-cta-banner__title">{title}</h2>
          {copy ? (
            <p className="site-cta-banner__copy">{copy}</p>
          ) : (
            <p className="site-cta-banner__copy">
              Take the next step, gain meaningful experience, and grow professionally with{" "}
              <strong>JPCS · SSCR Manila</strong>.
            </p>
          )}
          <div className="site-cta-banner__action">
            <AnimatedButton to={to} variant="primary">
              {action}
            </AnimatedButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function OfficerSvgAvatar({ type, index }: { type: "formal" | "casual"; index: number }) {
  const gradients = [
    { formal: ["#0f172a", "#1e293b"], casual: ["#8b1e24", "#d97706"] },
    { formal: ["#1c2b3a", "#2a3b50"], casual: ["#db2777", "#f59e0b"] },
    { formal: ["#09090b", "#27272a"], casual: ["#059669", "#10b981"] },
    { formal: ["#1e1b4b", "#312e81"], casual: ["#7c3aed", "#a78bfa"] },
  ];
  const theme = gradients[index % gradients.length];
  const bgGrad = type === "formal" ? theme.formal : theme.casual;

  return (
    <svg className="w-full h-full object-cover" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${type}-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bgGrad[0]} />
          <stop offset="100%" stopColor={bgGrad[1]} />
        </linearGradient>
        <filter id={`shadow-${type}-${index}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      <rect width="200" height="250" fill={`url(#bg-${type}-${index})`} />
      
      {type === "formal" ? (
        <>
          <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="0" y1="150" x2="200" y2="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="160" cy="60" r="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        </>
      ) : (
        <>
          <circle cx="40" cy="180" r="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M150 40 L170 60 M170 40 L150 60" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
        </>
      )}

      <g filter={`url(#shadow-${type}-${index})`}>
        {type === "formal" ? (
          <>
            <path d="M30 250 C30 195, 65 160, 100 160 C135 160, 170 195, 170 250 Z" fill="#1e293b" />
            <path d="M45 250 C45 205, 70 170, 100 170 C130 170, 155 205, 155 250 Z" fill="#0f172a" />
            <path d="M80 165 L100 205 L120 165 Z" fill="#ffffff" />
            <path d="M95 180 L105 180 L107 225 L100 235 L93 225 Z" fill="#991b1b" />
            <path d="M85 130 C85 130, 85 168, 100 168 C115 168, 115 130, 115 130 Z" fill="#e2e8f0" />
            <circle cx="100" cy="98" r="30" fill="#e2e8f0" />
            <path d="M68 98 C68 68, 132 68, 132 98 C132 92, 120 84, 100 84 C80 84, 68 92, 68 98 Z" fill="#1e293b" />
          </>
        ) : (
          <>
            <path d="M30 250 C30 200, 65 175, 100 175 C135 175, 170 200, 170 250 Z" fill="#3f3f46" />
            <path d="M78 175 C78 195, 122 195, 122 175 Z" fill="#d4d4d8" />
            <path d="M80 175 C80 191, 120 191, 120 175 Z" fill="#e4e4e7" />
            <path d="M85 135 C85 135, 85 180, 100 180 C115 180, 115 135, 115 135 Z" fill="#f4f4f5" />
            <circle cx="100" cy="103" r="30" fill="#f4f4f5" />
            <path d="M68 103 C68 73, 132 73, 132 103 C132 96, 122 88, 100 88 C78 88, 68 96, 68 103 Z" fill="#27272a" />
            <path d="M66 103 C66 65, 134 65, 134 103" stroke="#f59e0b" strokeWidth="5" fill="none" />
            <rect x="61" y="93" width="9" height="19" rx="3" fill="#f59e0b" />
            <rect x="130" y="93" width="9" height="19" rx="3" fill="#f59e0b" />
          </>
        )}
      </g>
    </svg>
  );
}

export function OfficerPhoto({
  name,
  role,
  profilePhoto,
  actionPhoto,
  index
}: {
  name: string;
  role: string;
  profilePhoto?: string;
  actionPhoto?: string;
  index: number;
}) {
  const [isActive, setIsActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.setProperty("--mx", x.toString());
    cardRef.current.style.setProperty("--my", y.toString());
  };

  const handleMouseLeave = () => {
    setIsActive(false);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--mx", "0");
      cardRef.current.style.setProperty("--my", "0");
    }
  };

  const handleTouch = (e: React.MouseEvent) => {
    // Touch/click toggles state
    setIsActive((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsActive((prev) => !prev);
    }
  };

  useEffect(() => {
    if (profilePhoto) {
      const img1 = new Image();
      img1.src = profilePhoto;
    }
    if (actionPhoto) {
      const img2 = new Image();
      img2.src = actionPhoto;
    }
  }, [profilePhoto, actionPhoto]);

  useEffect(() => {
    if (reduce) return;

    const checkMobileAndObserve = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (!isMobile || !cardRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsActive(true);
            } else {
              setIsActive(false);
            }
          });
        },
        {
          rootMargin: "-30% 0px -30% 0px",
          threshold: 0.2,
        }
      );

      observer.observe(cardRef.current);
      return observer;
    };

    const observerInstance = checkMobileAndObserve();

    return () => {
      if (observerInstance) observerInstance.disconnect();
    };
  }, [reduce]);

  const hasRealImages = !!(profilePhoto && actionPhoto);

  return (
    <div
      ref={cardRef}
      className={`officer-photo-container ${isActive ? "is-active" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouch}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${name}, ${role}. Press Enter or Space to toggle between formal and casual portraits.`}
    >
      <div className="officer-photo-frame">
        <div className="officer-photo-layer officer-photo-layer--formal">
          {hasRealImages ? (
            <img
              src={profilePhoto}
              alt={`${name} formal portrait`}
              className="officer-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <OfficerSvgAvatar type="formal" index={index} />
          )}
        </div>

        <div className="officer-photo-layer officer-photo-layer--casual">
          {hasRealImages ? (
            <img
              src={actionPhoto}
              alt={`${name} casual portrait`}
              className="officer-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <OfficerSvgAvatar type="casual" index={index} />
          )}
        </div>

        <div className="officer-photo-shine" />
        <div className="officer-photo-glow" />
      </div>
    </div>
  );
}

