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
  Newspaper,
  Rocket,
  Code2,
  BookMarked,
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

export const globalNavSections: NavSection[] = [
  {
    id: "discover",
    label: "Discover",
    icon: Globe,
    href: "/search",
    items: [
      { label: "Universities", href: "/search?kind=university", desc: "Explore institutions across Africa and beyond" },
      { label: "Scholarships", href: "/scholarships", desc: "Find education funding" },
      { label: "Careers", href: "/careers", desc: "Explore career pathways" },
      { label: "Skills", href: "/skills", desc: "Build relevant skills" },
      { label: "Courses & Research", href: "/skills", desc: "Keep learning and researching" },
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: Briefcase,
    href: "/opportunities",
    items: [
      { label: "Jobs", href: "/opportunities?type=job", desc: "Corporate and professional opportunities" },
      { label: "Internships", href: "/internships", desc: "Find practical experience" },
      { label: "Fellowships", href: "/opportunities?type=fellowship", desc: "Programs and fellowships" },
      { label: "Competitions", href: "/opportunities?type=competition", desc: "Challenges and competitions" },
      { label: "Startup opportunities", href: "/opportunities?type=startup", desc: "Accelerators, grants and startup roles" },
    ],
  },
  {
    id: "feed",
    label: "Feed",
    icon: Newspaper,
    href: "/feed",
    items: [
      { label: "Jobs", href: "/opportunities?type=job" },
      { label: "Education", href: "/feed?category=education" },
      { label: "African Innovation", href: "/feed?category=innovation" },
      { label: "African Startup News", href: "/feed?category=startups" },
      { label: "Technology", href: "/feed?category=technology" },
      { label: "Research", href: "/feed?category=research" },
    ],
  },
  {
    id: "africa",
    label: "Africa",
    icon: Globe,
    href: "/africa",
    items: [
      { label: "Countries", href: "/africa" },
      { label: "Leaders & Government", href: "/africa/leaders" },
      { label: "Universities", href: "/search?kind=university" },
      { label: "Startups", href: "/startup" },
      { label: "Innovation", href: "/feed?category=innovation" },
      { label: "History & Ideas", href: "/africa/history" },
      { label: "Books & Ideas", href: "/books" },
    ],
  },
  {
    id: "career-global",
    label: "Career",
    icon: Briefcase,
    href: "/career",
    items: [
      { label: "My Profile", href: "/dashboard" },
      { label: "CV Builder", href: "/cv" },
      { label: "My Applications", href: "/applications" },
      { label: "Saved Opportunities", href: "/saved" },
      { label: "Career Recommendations", href: "/recommendations" },
    ],
  },
  {
    id: "startup",
    label: "Startup",
    icon: Rocket,
    href: "/startup",
    items: [
      { label: "Startup Directory", href: "/startup" },
      { label: "Startup Jobs", href: "/opportunities?type=startup-job" },
      { label: "Funding", href: "/startup/funding" },
      { label: "Accelerators", href: "/startup/accelerators" },
      { label: "African Startup News", href: "/feed?category=startups" },
    ],
  },
];

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
