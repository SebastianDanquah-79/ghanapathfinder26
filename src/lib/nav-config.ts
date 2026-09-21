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
      { label: "Universities", href: "/search?kind=university", desc: "Find where you belong" },
      { label: "Programmes", href: "/programmes", desc: "Choose your direction" },
      { label: "Compare institutions", href: "/compare", desc: "Compare what matters" },
      { label: "Explore & search", href: "/search", desc: "Discover your options" },
    ],
  },
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
