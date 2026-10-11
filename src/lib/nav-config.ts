import {
  Home,
  BookOpen,
  Award,
  Briefcase,
  Users,
  Target,
  Search,
  Sparkles,
  CalendarDays,
  Bookmark,
  LayoutDashboard,
  SlidersHorizontal,
  Lightbulb,
  Shield,
  Info,
  Globe,
  MessageCircle,
  GraduationCap,
  Rocket,
  Building2,
} from "@/lib/icons";

export interface NavItem {
  label: string;
  href: string;
  desc?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: "feed",
    label: "Feed",
    icon: Home,
    href: "/for-you",
    items: [
      { label: "For You", href: "/for-you", desc: "Study, work, news and community in one feed" },
      { label: "Stories", href: "/stories", desc: "Read the latest stories in the platform" },
      { label: "Daily Drop", href: "/daily-drop", desc: "A quick view of new stories" },
      { label: "Africa Now", href: "/africa-now", desc: "Current Africa coverage" },
      { label: "Live Africa", href: "/live-africa", desc: "Explore live and current Africa updates" },
    ],
  },
  {
    id: "study",
    label: "Study",
    icon: GraduationCap,
    href: "/admission-match",
    items: [
      { label: "University directory", href: "/search?kind=university", desc: "Explore institutions and programmes" },
      { label: "Programmes", href: "/programmes/", desc: "Compare study options" },
      { label: "Admission match", href: "/admission-match", desc: "Check possible qualification pathways" },
      { label: "Study destinations", href: "/study-destinations", desc: "Explore routes into study" },
      { label: "Scholarships", href: "/scholarships/", desc: "Find funding opportunities" },
      { label: "Applications and deadlines", href: "/applications", desc: "Keep your application pipeline organised" },
    ],
  },
  {
    id: "work",
    label: "Work",
    icon: Briefcase,
    href: "/jobs",
    items: [
      { label: "Jobs", href: "/jobs", desc: "Explore jobs and remote work" },
      { label: "Internships", href: "/internships/", desc: "Find early-career experience" },
      { label: "Career paths", href: "/careers/", desc: "Explore roles and required skills" },
      { label: "Skills", href: "/skills/", desc: "Build job-relevant skills" },
      { label: "Companies", href: "/companies", desc: "Discover companies operating in Africa" },
      { label: "Professional profiles", href: "/people", desc: "Find people who opted into discovery" },
    ],
  },
  {
    id: "build",
    label: "Build",
    icon: Rocket,
    href: "/build",
    items: [
      { label: "Build your startup", href: "/build", desc: "Resources for starting and growing a business" },
      { label: "Startup directory", href: "/startups", desc: "Explore African startups" },
      { label: "Founder opportunities", href: "/opportunities", desc: "Find grants, accelerators and support" },
      { label: "Hire from Africa", href: "/hire-from-africa", desc: "Explore African talent and hiring" },
    ],
  },
  {
    id: "network",
    label: "Network",
    icon: Users,
    href: "/community",
    items: [
      { label: "Student community", href: "/community", desc: "Share and learn from student experiences" },
      { label: "Connect", href: "/connect", desc: "Explore community and connection features" },
      { label: "People building Africa", href: "/people", desc: "Discover opted-in professional profiles" },
      { label: "Inspiration", href: "/inspiration", desc: "Learn from people's journeys" },
      { label: "International community", href: "/international-community", desc: "Information for cross-border study" },
    ],
  },
  {
    id: "learning-studio",
    label: "Learning Studio",
    icon: BookOpen,
    href: "/ask-africa",
    items: [
      { label: "AI study coach", href: "/ask-africa", desc: "Ask questions and get guided explanations from current platform information" },
      { label: "Build my learning plan", href: "/my-path", desc: "Turn a goal into manageable study and career steps" },
      { label: "Explore skills", href: "/skills/", desc: "Find skills and learning routes for your next step" },
      { label: "Career pathways", href: "/careers/", desc: "Connect learning to possible careers" },
    ],
  },
  {
    id: "ai-coach",
    label: "AI & My Path",
    icon: Sparkles,
    href: "/ask-africa",
    items: [
      { label: "Ask Africa AI", href: "/ask-africa", desc: "Explore education, careers, startups and opportunities with AI" },
      { label: "My Path", href: "/my-path", desc: "Turn goals into practical next steps" },
      { label: "Scholarship matcher", href: "/matcher", desc: "Narrow down funding options" },
      { label: "Saved items", href: "/saved", desc: "Return to opportunities you kept" },
    ],
  },
];

const portalNavSections: Record<string, NavSection[]> = {
  student: [
    { id: "study", label: "Study", icon: GraduationCap, href: "/admission-match", items: [
      { label: "Admission matches", href: "/admission-match" },
      { label: "University search", href: "/search?kind=university" },
      { label: "Programmes", href: "/programmes/" },
      { label: "Scholarships", href: "/scholarships/" },
      { label: "Scholarship matcher", href: "/matcher" },
    ]},
    { id: "student-plan", label: "My Plan", icon: Target, href: "/my-path", items: [
      { label: "My Path", href: "/my-path" },
      { label: "Applications and deadlines", href: "/applications" },
      { label: "Saved items", href: "/saved" },
    ]},
    { id: "student-career", label: "Careers", icon: Briefcase, href: "/careers", items: [
      { label: "Career paths", href: "/careers/" },
      { label: "Skills", href: "/skills/" },
      { label: "Internships", href: "/internships/" },
    ]},
  ],
  employee: [
    { id: "work", label: "Work", icon: Briefcase, href: "/jobs", items: [
      { label: "Find jobs", href: "/jobs" },
      { label: "Opportunities", href: "/opportunities" },
      { label: "Career profile", href: "/onboarding?role=employee" },
      { label: "Skills", href: "/skills/" },
      { label: "Career path", href: "/career-path" },
    ]},
  ],
  employer: [
    { id: "hiring", label: "Hiring", icon: Building2, href: "/portal/employer#post-opportunity", items: [
      { label: "Post an opportunity", href: "/portal/employer#post-opportunity" },
      { label: "Review your submissions", href: "/portal/employer#your-submissions" },
      { label: "Find candidates", href: "/people" },
      { label: "Organisation profile", href: "/onboarding?role=employer" },
    ]},
  ],
  startup_founder: [
    { id: "startup", label: "Startup", icon: Rocket, href: "/build", items: [
      { label: "Build your startup", href: "/build" },
      { label: "Startup directory", href: "/startups" },
      { label: "Founder opportunities", href: "/opportunities" },
      { label: "Founder community", href: "/community" },
      { label: "Find collaborators", href: "/people" },
    ]},
  ],
  international_student: [
    { id: "study-destinations", label: "Study in Ghana", icon: Globe, href: "/portal/study-destinations", items: [
      { label: "Study destinations", href: "/portal/study-destinations" },
      { label: "Qualification pathways", href: "/admission-match" },
      { label: "Programmes", href: "/programmes/" },
      { label: "Scholarships", href: "/scholarships/" },
      { label: "Embassy and visa information", href: "/international-community" },
      { label: "Applications", href: "/applications" },
    ]},
  ],
};

function normalizePortalRole(role: string | null | undefined): string {
  if (role === "founder") return "startup_founder";
  if (role === "international-student") return "international_student";
  return role ?? "";
}

export function getNavSectionsForRole(role: string | null | undefined): NavSection[] {
  return portalNavSections[normalizePortalRole(role)] ?? [];
}

const portalAccountItems: Record<string, NavItem[]> = {
  student: [
    { label: "Student dashboard", href: "/dashboard" },
    { label: "Student profile", href: "/onboarding?role=student" },
    { label: "My Path", href: "/my-path" },
    { label: "Saved items", href: "/saved" },
    { label: "Applications", href: "/applications" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
  employee: [
    { label: "Career dashboard", href: "/dashboard" },
    { label: "Professional profile", href: "/onboarding?role=employee" },
    { label: "Find jobs", href: "/jobs" },
    { label: "Career opportunities", href: "/opportunities" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
  employer: [
    { label: "Employer dashboard", href: "/dashboard" },
    { label: "Organisation profile", href: "/onboarding?role=employer" },
    { label: "Post an opportunity", href: "/portal/employer#post-opportunity" },
    { label: "Applicants", href: "/people" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
  startup_founder: [
    { label: "Startup Founder Dashboard", href: "/dashboard" },
    { label: "Startup profile", href: "/onboarding?role=startup_founder" },
    { label: "Build your startup", href: "/build" },
    { label: "Founder opportunities", href: "/opportunities" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
  international_student: [
    { label: "International student dashboard", href: "/dashboard" },
    { label: "Study profile", href: "/onboarding?role=international_student" },
    { label: "Admission matching", href: "/admission-match" },
    { label: "Applications", href: "/applications" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
};

export function getAccountItemsForRole(role: string | null | undefined): NavItem[] {
  return portalAccountItems[normalizePortalRole(role)] ?? accountItems;
}

export const accountItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Path", href: "/my-path" },
  { label: "Saved items", href: "/saved" },
  { label: "Applications", href: "/applications" },
  { label: "Match preferences", href: "/preferences" },
];

export const aboutItems: NavItem[] = [
  { label: "About GhanaPathFinder", href: "/about" },
  { label: "References & sources", href: "/references" },
  { label: "Contact", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export const navIcons = {
  Home,
  BookOpen,
  Search,
  Sparkles,
  CalendarDays,
  Bookmark,
  LayoutDashboard,
  SlidersHorizontal,
  Lightbulb,
  Shield,
  Info,
  Globe,
  MessageCircle,
  GraduationCap,
};
