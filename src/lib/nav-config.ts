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
      { label: "Universities", href: "/search?kind=university", desc: "Find your campus" },
      { label: "Programmes", href: "/programmes", desc: "Choose what to study" },
      { label: "Compare institutions", href: "/compare", desc: "See the difference" },
      { label: "Explore & search", href: "/search", desc: "Find what fits" },
    ],
  },
  {
    id: "fund",
    label: "Funding",
    icon: Award,
    href: "/scholarships",
    items: [
      { label: "Scholarships", href: "/scholarships", desc: "Find funding" },
      { label: "Scholarship matcher", href: "/matcher", desc: "Match your profile" },
      { label: "Compare scholarships", href: "/compare-scholarships", desc: "Choose wisely" },
    ],
  },
  {
    id: "career",
    label: "Careers",
    icon: Briefcase,
    href: "/careers",
    items: [
      { label: "Careers", href: "/careers", desc: "See where it leads" },
      { label: "Career Path", href: "/career-path", desc: "Map your next moves" },
      { label: "Skills", href: "/skills", desc: "Build useful skills" },
      { label: "Internships", href: "/internships", desc: "Get real experience" },
      { label: "Professional councils", href: "/professional-councils", desc: "Know the rules" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    icon: Target,
    href: "/admission-match",
    items: [
      { label: "Admission match", href: "/admission-match", desc: "See your options" },
      { label: "Applications & deadlines", href: "/applications", desc: "Stay on track" },
      { label: "Saved items", href: "/saved", desc: "Keep your shortlist" },
      { label: "Match preferences", href: "/preferences", desc: "Make matches personal" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    href: "/community",
    items: [
      { label: "Community feed", href: "/community", desc: "Learn from students" },
      { label: "Inspiration", href: "/inspiration", desc: "Meet people building" },
      { label: "For parents", href: "/parent", desc: "Follow the journey" },
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
