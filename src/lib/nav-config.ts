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
    id: "fund",
    label: "Funding",
    icon: Award,
    href: "/scholarships",
    items: [
      { label: "Scholarships", href: "/scholarships", desc: "Find funding for your future" },
      { label: "Scholarship matcher", href: "/matcher", desc: "Find your best matches" },
      { label: "Compare scholarships", href: "/compare-scholarships", desc: "Choose the right opportunity" },
    ],
  },
  {
    id: "career",
    label: "Careers",
    icon: Briefcase,
    href: "/careers",
    items: [
      { label: "Careers", href: "/careers", desc: "See where your path leads" },
      { label: "Career Path", href: "/career-path", desc: "Turn ambition into a plan" },
      { label: "Skills", href: "/skills", desc: "Build skills that pay off" },
      { label: "Internships", href: "/internships", desc: "Get experience that counts" },
      { label: "Professional councils", href: "/professional-councils", desc: "Know the rules before you choose" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    icon: Target,
    href: "/my-path",
    items: [
      { label: "My Path", href: "/my-path", desc: "Turn your goal into a plan" },
      { label: "Admission match", href: "/admission-match", desc: "See what fits your results" },
      { label: "Applications & deadlines", href: "/applications", desc: "Never miss your next step" },
      { label: "Saved items", href: "/saved", desc: "Keep your best options close" },
      { label: "Match preferences", href: "/preferences", desc: "Make every match more personal" },
    ],
  },
  {
    id: "discover",
    label: "Discover",
    icon: Globe,
    href: "/for-you",
    items: [
      { label: "For You", href: "/for-you", desc: "Your Africa discovery feed" },
      { label: "Opportunity Radar", href: "/opportunities", desc: "Jobs, scholarships and opportunities" },
      { label: "Africa", href: "/africa", desc: "Discover countries, news and opportunities" },
      { label: "Jobs", href: "/jobs", desc: "Work opportunities and careers" },
      { label: "My Africa", href: "/my-africa", desc: "Your personal Africa map" },
      { label: "Ask Africa", href: "/ask-africa", desc: "Ask the AI discovery assistant" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    href: "/community",
    items: [
      { label: "Community feed", href: "/community", desc: "Learn from people like you" },
      { label: "Inspiration", href: "/inspiration", desc: "Meet people building big things" },
      { label: "For parents", href: "/parent", desc: "Support the journey with confidence" },
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
      { label: "Applications", href: "/applications" },
      { label: "Skills", href: "/skills/" },
      { label: "Career path", href: "/career-path" },
    ]},
  ],
  employer: [
    { id: "hiring", label: "Hiring", icon: Building2, href: "/opportunities", items: [
      { label: "Opportunities", href: "/opportunities" },
      { label: "Applicants and people", href: "/people" },
      { label: "Applications", href: "/applications" },
      { label: "Organisation community", href: "/community" },
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
    { id: "study-destinations", label: "Study in Ghana", icon: Globe, href: "/international-community", items: [
      { label: "Study destinations and community", href: "/international-community" },
      { label: "Admission matching", href: "/admission-match" },
      { label: "Programmes", href: "/programmes/" },
      { label: "Scholarships", href: "/scholarships/" },
      { label: "Applications", href: "/applications" },
    ]},
  ],
};

export function getNavSectionsForRole(role: string | null | undefined): NavSection[] {
  return portalNavSections[role ?? ""] ?? [];
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
    { label: "Applications", href: "/applications" },
    { label: "Change portal", href: "/?switchRole=1" },
  ],
  employer: [
    { label: "Employer dashboard", href: "/dashboard" },
    { label: "Organisation profile", href: "/onboarding?role=employer" },
    { label: "Opportunities", href: "/opportunities" },
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
  return portalAccountItems[role ?? ""] ?? accountItems;
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
