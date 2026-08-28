import {
  Home,
  Building2,
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
    id: "study",
    label: "Study",
    icon: Building2,
    href: "/search?kind=university",
    items: [
      { label: "Universities", href: "/search?kind=university", desc: "Every accredited institution" },
      { label: "Programmes", href: "/programmes", desc: "What you study and where" },
      { label: "Compare institutions", href: "/compare", desc: "Side-by-side comparison" },
      { label: "Explore & search", href: "/search", desc: "Search everything" },
    ],
  },
  {
    id: "fund",
    label: "Funding",
    icon: Award,
    href: "/scholarships",
    items: [
      { label: "Scholarships", href: "/scholarships", desc: "Local and international funding" },
      { label: "Scholarship matcher", href: "/matcher", desc: "Find funding you qualify for" },
      { label: "Compare scholarships", href: "/compare-scholarships", desc: "Weigh your options" },
    ],
  },
  {
    id: "career",
    label: "Careers",
    icon: Briefcase,
    href: "/careers",
    items: [
      { label: "Careers", href: "/careers", desc: "Where each path leads" },
      { label: "Skills", href: "/skills", desc: "Free courses and training" },
      { label: "Internships", href: "/internships", desc: "Employers taking interns" },
      { label: "Professional councils", href: "/professional-councils", desc: "Licensing bodies" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    icon: Target,
    href: "/admission-match",
    items: [
      { label: "Admission match", href: "/admission-match", desc: "Check where you qualify" },
      { label: "Applications & deadlines", href: "/applications", desc: "Track every application" },
      { label: "Saved items", href: "/saved", desc: "Your shortlist" },
      { label: "Match preferences", href: "/preferences", desc: "Tune your matches" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    href: "/community",
    items: [
      { label: "Community feed", href: "/community", desc: "Honest student experiences" },
      { label: "Inspiration", href: "/inspiration", desc: "Stories that keep you going" },
      { label: "For parents", href: "/parent", desc: "Follow your child's progress" },
    ],
  },
];

export const accountItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
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
