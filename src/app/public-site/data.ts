export type NavDropdownItem = { label: string; to: string; desc?: string };
export type SiteRoute = { 
  label: string; 
  to: string; 
  dropdown?: NavDropdownItem[];
};
export type Feature = { eyebrow: string; title: string; description: string; details: string[]; imageLabel: string; imageFile: string };

export const navigation: SiteRoute[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Testimonial", to: "/testimonials" },
  {
    label: "Resources",
    to: "/community#resources",
    dropdown: [
      { label: "Curriculum & Programs", to: "/programs", desc: "BSIT degree tracks & course roadmap" },
      { label: "Community & Events", to: "/community", desc: "Hackathons, workshops & calendar" },
      { label: "Official Contact", to: "/about#contact", desc: "Reach out to chapter officers" },
      { label: "Membership Guide", to: "/community#resources", desc: "Student guide & handbook" },
    ],
  },
];

export const footerGroups = [
  { title: "Organization", links: [{ label: "Home", to: "/" }, { label: "Programs", to: "/programs" }, { label: "Community", to: "/community" }, { label: "About", to: "/about" }] },
  { title: "Resources", links: [{ label: "Events", to: "/community#resources" }, { label: "Gallery", to: "/community#resources" }, { label: "FAQs", to: "/community#resources" }, { label: "Membership guide", to: "/community#resources" }] },
];

export const homePrograms: Feature[] = [
  { eyebrow: "01 · Build", title: "Programming workshops", description: "Hands-on sessions turn classroom concepts into working skills through guided practice, peer collaboration, and project-based learning.", details: ["Web and software development", "Databases and cloud fundamentals", "Cybersecurity and emerging technology"], imageLabel: "Programming workshop image", imageFile: "home-programming-workshop.webp" },
  { eyebrow: "02 · Discover", title: "Seminars and research", description: "Students meet educators, alumni, and practitioners who make complex ideas relevant, practical, and connected to the profession.", details: ["Technical seminars", "Research presentation support", "Industry and alumni conversations"], imageLabel: "Technical seminar image", imageFile: "home-technical-seminar.webp" },
  { eyebrow: "03 · Create", title: "Hackathons and competitions", description: "Focused challenges help members think critically, work across disciplines, and create solutions under real constraints.", details: ["Team-based problem solving", "Project and pitch development", "Inter-school competition preparation"], imageLabel: "Hackathon team image", imageFile: "home-hackathon.webp" },
  { eyebrow: "04 · Lead", title: "Leadership and service", description: "Members learn to organize, communicate, and serve by leading initiatives that strengthen both the chapter and its wider community.", details: ["Student leadership development", "Community technology outreach", "Professional networking"], imageLabel: "Student leadership image", imageFile: "home-leadership.webp" },
];

export const benefits = [
  { icon: "code", title: "Strengthen technical capability", copy: "Practice beyond requirements and learn how ideas become dependable, useful work." },
  { icon: "lead", title: "Develop confident student leaders", copy: "Build judgment, communication, and ownership through meaningful responsibility." },
  { icon: "connect", title: "Build professional connections", copy: "Meet peers, alumni, educators, and practitioners who expand what feels possible." },
  { icon: "impact", title: "Create meaningful community impact", copy: "Use technology, time, and shared knowledge in service of people around you." },
];

export const memberships = [
  { label: "For computing students", title: "Student member", note: "Sign in with your official account credentials to access the portal.", items: ["Chapter activities", "Programming workshops", "Technical seminars", "Community channels", "Member resources", "Competition opportunities"], action: "Sign In to Portal", to: "/login" },
  { label: "For organizations and professionals", title: "Industry & Government Partner", note: "Collaborate with us to drive innovation across public and private sectors.", items: ["IT industry linkages", "Government sector collaborations", "Joint development projects", "Talent & hiring pipelines", "Technical consultations", "Community outreach"], action: "Build a Partnership", to: "/about#contact" },
];

export const programFeatures: Feature[] = [
  { 
    eyebrow: "01 · PRACTICAL CODE", 
    title: "Hands-on Software Workshops", 
    description: "Master modern full-stack development, database architecture, and production deployments through rigorous code-along labs.", 
    details: ["Full-Stack Web & Mobile", "Cloud Infrastructure & APIs", "Database Engineering", "DevOps & CI/CD Workflows"], 
    imageLabel: "Hands-on coding workshop", 
    imageFile: "programs-workshop.webp" 
  },
  { 
    eyebrow: "02 · INDUSTRY PERSPECTIVE", 
    title: "Technical Masterclasses & Talks", 
    description: "Learn directly from tech leads, cybersecurity architects, and alumni delivering real-world enterprise perspectives.", 
    details: ["Enterprise Tech Architecture", "Cybersecurity & Threat Defense", "Alumni Engineering Journeys", "Career & Technical Roadmaps"], 
    imageLabel: "Technical seminar speaker", 
    imageFile: "programs-seminar.webp" 
  },
  { 
    eyebrow: "03 · COMPETITIVE SPRINT", 
    title: "Hackathons & Innovation Sprints", 
    description: "Build functional software products in rapid, high-intensity hackathons designed to sharpen agility and team execution.", 
    details: ["Rapid Product Prototyping", "Inter-Collegiate Hackathons", "Executive Pitch & Demo Day", "Agile Team Execution"], 
    imageLabel: "Hackathon collaboration", 
    imageFile: "programs-hackathon.webp" 
  },
  { 
    eyebrow: "04 · RESEARCH & SYSTEMS", 
    title: "Applied Computing & Capstones", 
    description: "Transform ambitious technical concepts into verified research publications, patents, and production-ready systems.", 
    details: ["System Architecture Design", "Applied AI & Data Research", "Peer Code Reviews", "Prototype Verification"], 
    imageLabel: "Student research", 
    imageFile: "programs-research.webp" 
  },
  { 
    eyebrow: "05 · EXECUTIVE LEADERSHIP", 
    title: "Student Leadership Laboratory", 
    description: "Develop executive ownership, strategic communication, and team leadership through accredited chapter governance.", 
    details: ["Project & Resource Operations", "Cross-Functional Management", "Technical Chapter Governance", "Public Speaking & Advocacy"], 
    imageLabel: "Student officers planning", 
    imageFile: "programs-leadership.webp" 
  },
  { 
    eyebrow: "06 · CAREER LINKAGES", 
    title: "Industry Linkages & Hiring Pipelines", 
    description: "Direct bridges to leading software firms, corporate partners, and hiring pipelines for internships and careers.", 
    details: ["Direct Corporate Pipelines", "Technical Mock Interviews", "Portfolio & Resume Audits", "Industry Mentorship Networks"], 
    imageLabel: "Professional networking", 
    imageFile: "programs-networking.webp" 
  },
];

export const audienceBenefits = [
  { title: "For students", items: ["Practical experience", "Technical confidence", "Portfolio development", "Leadership opportunities", "Professional connections"] },
  { title: "For partners", items: ["Student engagement", "Community visibility", "Talent connections", "Event collaboration", "Knowledge sharing"] },
  { title: "For the college", items: ["Stronger involvement", "External recognition", "Competitive participation", "Technology leadership", "Community impact"] },
];

export const communityAudiences = [
  { eyebrow: "Students", title: "Learn, collaborate, and build with confidence.", description: "A welcoming place to practice, ask better questions, find collaborators, and prepare for the opportunities ahead.", items: ["Technical workshops", "Student project support", "Competitions", "Study and peer communities", "Career preparation", "Learning resources"], imageLabel: "Students collaborating image", imageFile: "community-students.webp" },
  { eyebrow: "Officers", title: "Lead programs that create meaningful student experiences.", description: "Chapter leadership gives students a real setting for serving others while developing judgment, systems thinking, and accountability.", items: ["Event planning", "Team coordination", "Project management", "Communication", "Partnership development", "Leadership mentoring"], imageLabel: "Officers planning an event image", imageFile: "community-officers.webp" },
  { eyebrow: "Partners and alumni", title: "Strong alliances in IT industry and Government sectors.", description: "Forging valuable bridges with IT industry giants and government agencies to support digital transformation, career pipelines, and tech service programs.", items: ["IT Industry collaborations", "Government sector partnerships", "Student internships", "Project sponsorships", "Technical advisory", "Alumni engagement"], imageLabel: "Alumni and partner collaboration image", imageFile: "community-partners.webp" },
];

export const values: Feature[] = [
  { eyebrow: "Practice", title: "Developing capable professionals", description: "Students deserve opportunities to transform technical knowledge into practical ability.", details: ["Curiosity made useful", "Strong foundations", "Responsible technical practice"], imageLabel: "Students presenting a technical project image", imageFile: "about-capability.webp" },
  { eyebrow: "Responsibility", title: "Supporting student leaders", description: "Leadership should be learned through service, responsibility, and meaningful experience.", details: ["Listen before leading", "Own the outcome", "Make space for others"], imageLabel: "Student leader facilitating a meeting image", imageFile: "about-leadership.webp" },
  { eyebrow: "Belonging", title: "Creating inclusive communities", description: "Every computing student should feel welcome, supported, and encouraged to participate.", details: ["Welcoming entry points", "Peer support", "Shared success"], imageLabel: "Inclusive student community image", imageFile: "about-community.webp" },
  { eyebrow: "Connection", title: "Industry & Government Alliance", description: "Building strong partnerships in the IT industry and government sector to expand student horizons, opportunities, and public-sector tech initiatives.", details: ["IT industry mentorship", "Government sector integration", "Joint tech initiatives"], imageLabel: "Industry and government collaboration image", imageFile: "about-industry.webp" },
  { eyebrow: "Service", title: "Serving through technology", description: "Technology is most meaningful when it improves communities and creates opportunities.", details: ["Human-centered solutions", "Community partnership", "Ethical contribution"], imageLabel: "Technology community outreach image", imageFile: "about-service.webp" },
];

export const officers = [
  { name: "Keith Czimonne Anderson Ciceron", role: "President", course: "BSIT · 4th Year", responsibility: "Sets the department direction, leads student initiatives, and supports every team.", profile_photo: "/officers/ciceron_profile.png", action_photo: "/officers/ciceron_action.jpg" },
  { name: "Karl Tristan Benedicto", role: "Vice President", course: "BSIT · 4th Year", responsibility: "Coordinates academic programs and strengthens internal officer collaboration.", profile_photo: "/officers/benedicto_profile.png", action_photo: "/officers/benedicto_action.jpg" },
  { name: "Andrei Baguisa", role: "Secretary", course: "BSIT · 3rd Year", responsibility: "Keeps department communications, schedules, and official records dependable.", profile_photo: "/officers/baguisa_profile.jpg", action_photo: "/officers/baguisa_action.jpg" },
  { name: "Kenneth Gregorio", role: "Treasurer", course: "BSIT · 4th Year", responsibility: "Stewards department funds, budget planning, and resources with clarity and care.", profile_photo: "/officers/gregorio_formal.PNG", action_photo: "/officers/gregorio_casual.png" },
  { name: "Khemuel Timkang", role: "Auditor", course: "BSIT · 4th Year", responsibility: "Maintains transparency and conducts audits for all department activities.", profile_photo: "/officers/timkang_profile.jpg", action_photo: "/officers/timkang_action.jpg" },
  { name: "Von Dimaculangan", role: "P.R.O.", course: "BSIT · 4th Year", responsibility: "Manages public relations, announcements, and external communications.", profile_photo: "/officers/dimaculangan_formal.png", action_photo: "/officers/dimaculangan_casual.jpeg" },
  { name: "John Carl Arche", role: "Technical Head", course: "BSIT · 4th Year", responsibility: "Directs technical workshops, hands-on bootcamps, and developer support.", profile_photo: "/officers/arche_profile.png", action_photo: "/officers/arche_action.jpg" },
  { name: "Lance Alvarez Ceasar", role: "Content Manager", course: "BSIT · 4th Year", responsibility: "Curates, edits, and designs creative digital media content for the department.", profile_photo: "/officers/lance_formal.png", action_photo: "/officers/lance_casual.png" },
  { name: "JD Pagkatipunan", role: "Head of Sports", course: "BSIT · 4th Year", responsibility: "Organizes sports fests, computing e-sports, and physical fitness activities.", profile_photo: "/officers/pagkatipunan_profile.jpg", action_photo: "/officers/pagkatipunan_action.jpg" },
  { name: "Rick Paolo Suero", role: "4th Yr Representative", course: "BSIT · 4th Year", responsibility: "Represents the senior class, assisting fourth-year students with graduation requirements.", profile_photo: "/officers/suero_profile.jpg", action_photo: "/officers/suero_action.jpg" },
  { name: "Kenneth Fernandez", role: "3rd Yr Representative", course: "BSIT · 3rd Year", responsibility: "Coordinates with third-year class sections for department events and workshops.", profile_photo: "/officers/fernandez_profile.jpg", action_photo: "/officers/fernandez_action.jpg" },
  { name: "Ruth Geras", role: "2nd Yr Representative", course: "BSIT · 2nd Year", responsibility: "Coordinates with second-year class sections and supports peer learning circles.", profile_photo: "/officers/geras_profile.jpg", action_photo: "/officers/geras_action.jpg" },
  { name: "Jam Ciceron", role: "1st Yr Representative", course: "BSIT · 1st Year", responsibility: "Assists incoming freshmen in adjusting to the IT department community.", profile_photo: "/officers/morales_profile.png", action_photo: "/officers/morales_action.png" },
];

export const seo = {
  home: { title: "IT DEPARTMENT OF SSCR MANILA | Empowering Future Computing Professionals", description: "IT DEPARTMENT OF SSCR MANILA is a student-led community for technical learning, leadership, innovation, professional connection, and service.", path: "/" },
  programs: { title: "Programs | IT DEPARTMENT OF SSCR MANILA", description: "Explore programming workshops, seminars, competitions, research, leadership, and networking programs from the IT DEPARTMENT OF SSCR MANILA.", path: "/programs" },
  community: { title: "Community | IT DEPARTMENT OF SSCR MANILA", description: "Discover how the IT Department connects students, officers, educators, alumni, and technology partners through shared learning and service.", path: "/community" },
  about: { title: "About | IT DEPARTMENT OF SSCR MANILA", description: "Learn why the IT Department of SSCR Manila exists and how it develops capable, ethical, innovative, service-oriented computing professionals.", path: "/about" },
  testimonials: { title: "Testimonials | IT DEPARTMENT OF SSCR MANILA", description: "Read inspiring stories and experiences from the IT DEPARTMENT OF SSCR MANILA alumni and student leaders.", path: "/testimonials" },
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  imageFile: string;
};

export const alumniTestimonials: Testimonial[] = [
  {
    name: "Jaison Quiaem",
    role: "Former President (2023 - 2025) · Assistant Instructor",
    quote: "Leading the IT Department from 2023 to 2025 was a transformative journey. Establishing hands-on technical bootcamps, student mentorship circles, and inter-collegiate linkages taught us how to lead with vision and purpose. The collaborative culture we fostered continues to inspire computing students to build with confidence.",
    imageFile: "/officers/jaison_quiaem.png"
  },
  {
    name: "Kyle Dizon",
    role: "Former BSIT Student · AI Software Engineer Radenta",
    quote: "The IT Department provided the perfect sandbox to push theoretical knowledge into high-impact software engineering. The hackathons, peer code reviews, and industry seminars gave me the exact skills and technical rigor needed to excel in building real-world enterprise systems.",
    imageFile: "/officers/kyle_dizon.jpg"
  },
  {
    name: "Kevin Casas",
    role: "Former BSIT Student · AI Software Engineer Radenta",
    quote: "Being part of this community elevated my entire academic and technical journey. Working side-by-side with passionate peers on complex systems and student capstones sharpened my problem-solving ability and instilled in me the discipline to continuously master cutting-edge software solutions.",
    imageFile: "/officers/kevin_casas.jpg"
  },
  {
    name: "Dillon Valenzuela",
    role: "Former BSIT Student · Fresh Graduate",
    quote: "What sets the IT Department apart is its dedication to practical execution and peer-to-peer collaboration. The technical workshops and real-world project sprints helped me master modern architectures and build systems that make a tangible industry impact.",
    imageFile: "/officers/dillon_valenzuela.jpg"
  }
];
