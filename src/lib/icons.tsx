/**
 * Non-SVG icon set.
 *
 * The site no longer renders SVG icon graphics. Every icon below is a plain
 * text glyph / CSS element rendered inside a span, so it inherits colour and
 * sizing from the same utility classes the old icon components used.
 *
 * The single exception is `BrandLogoIcon`, the official GhanaPathFinder
 * graduation-cap logo mark, which is intentionally kept as-is.
 */
import { GraduationCap as LucideGraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export const BrandLogoIcon = LucideGraduationCap;

export type IconProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  size?: number | string;
  strokeWidth?: number;
} as const;

const makeIcon = (glyph: string, displayName: string) => {
  const Icon = ({ className, style, size, strokeWidth: _sw, ...rest }: IconProps) => (
    <span
      aria-hidden="true"
      {...rest}
      style={size ? { ...style, width: size, height: size } : style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none select-none [font-size:0.95em] [font-family:inherit]",
        className,
      )}
    >
      {glyph}
    </span>
  );
  Icon.displayName = displayName;
  return Icon;
} as const;

const glyphs = {
  AlertTriangle: "!",
  ArrowDown: "\u2193",
  ArrowLeft: "\u2190",
  ArrowRight: "\u2192",
  Award: "\u2605",
  BadgeCheck: "\u2713",
  BarChart3: "\u2261",
  Bell: "\u25CF",
  BookMarked: "\u25AE",
  BookOpen: "\u25AD",
  Bookmark: "\u2661",
  BookmarkCheck: "\u2665",
  Briefcase: "\u25A4",
  Building: "\u25A6",
  Building2: "\u25A6",
  CalendarClock: "\u25F7",
  CalendarDays: "\u25A7",
  Check: "\u2713",
  CheckCircle2: "\u2713",
  ChevronDown: "\u25BE",
  ChevronLeft: "\u2039",
  ChevronRight: "\u203A",
  ChevronUp: "\u25B4",
  Circle: "\u25CB",
  ClipboardList: "\u2263",
  Code: "\u2039\u203A",
  Compass: "\u25C8",
  Copy: "\u29C9",
  Database: "\u25A5",
  DollarSign: "\u20B5",
  Dot: "\u2022",
  Download: "\u2913",
  ExternalLink: "\u2197",
  Eye: "\u25C9",
  Filter: "\u2637",
  Flag: "\u2691",
  Flame: "\u25B2",
  Globe: "\u25CE",
  GraduationCap: "\u25B0",
  GripVertical: "\u22EE",
  Home: "\u2302",
  Info: "i",
  LayoutDashboard: "\u229E",
  Lightbulb: "\u273A",
  Link2: "\u26AD",
  Linkedin: "in",
  Loader2: "\u25CC",
  LogOut: "\u21AA",
  Mail: "\u2709",
  MapPin: "\u25C6",
  Menu: "\u2630",
  MessageCircle: "\u25D6",
  Moon: "\u263E",
  MoreHorizontal: "\u22EF",
  PanelLeft: "\u25E7",
  Phone: "\u260E",
  Plus: "+",
  Quote: "\u201C",
  RefreshCw: "\u21BB",
  Rocket: "\u27A4",
  Scale: "\u2696",
  Search: "\u26B2",
  Share2: "\u21AA",
  Shield: "\u26CA",
  ShieldCheck: "\u2713",
  SlidersHorizontal: "\u2632",
  Sparkles: "\u2726",
  Sun: "\u263C",
  Sunrise: "\u2600",
  Target: "\u25CE",
  Trash2: "\u2717",
  Upload: "\u2911",
  UserCheck: "\u2713",
  Users: "\u25CD",
  Wallet: "\u25AC",
  WifiOff: "\u2298",
  X: "\u2715",
} as const;

export const AlertTriangle = makeIcon(glyphs.AlertTriangle, "AlertTriangle");
export const ArrowDown = makeIcon(glyphs.ArrowDown, "ArrowDown");
export const ArrowLeft = makeIcon(glyphs.ArrowLeft, "ArrowLeft");
export const ArrowRight = makeIcon(glyphs.ArrowRight, "ArrowRight");
export const Award = makeIcon(glyphs.Award, "Award");
export const BadgeCheck = makeIcon(glyphs.BadgeCheck, "BadgeCheck");
export const BarChart3 = makeIcon(glyphs.BarChart3, "BarChart3");
export const Bell = makeIcon(glyphs.Bell, "Bell");
export const BookMarked = makeIcon(glyphs.BookMarked, "BookMarked");
export const BookOpen = makeIcon(glyphs.BookOpen, "BookOpen");
export const Bookmark = makeIcon(glyphs.Bookmark, "Bookmark");
export const BookmarkCheck = makeIcon(glyphs.BookmarkCheck, "BookmarkCheck");
export const Briefcase = makeIcon(glyphs.Briefcase, "Briefcase");
export const Building = makeIcon(glyphs.Building, "Building");
export const Building2 = makeIcon(glyphs.Building2, "Building2");
export const CalendarClock = makeIcon(glyphs.CalendarClock, "CalendarClock");
export const CalendarDays = makeIcon(glyphs.CalendarDays, "CalendarDays");
export const Check = makeIcon(glyphs.Check, "Check");
export const CheckCircle2 = makeIcon(glyphs.CheckCircle2, "CheckCircle2");
export const ChevronDown = makeIcon(glyphs.ChevronDown, "ChevronDown");
export const ChevronLeft = makeIcon(glyphs.ChevronLeft, "ChevronLeft");
export const ChevronRight = makeIcon(glyphs.ChevronRight, "ChevronRight");
export const ChevronUp = makeIcon(glyphs.ChevronUp, "ChevronUp");
export const Circle = makeIcon(glyphs.Circle, "Circle");
export const ClipboardList = makeIcon(glyphs.ClipboardList, "ClipboardList");
export const Code = makeIcon(glyphs.Code, "Code");
export const Compass = makeIcon(glyphs.Compass, "Compass");
export const Copy = makeIcon(glyphs.Copy, "Copy");
export const Database = makeIcon(glyphs.Database, "Database");
export const DollarSign = makeIcon(glyphs.DollarSign, "DollarSign");
export const Dot = makeIcon(glyphs.Dot, "Dot");
export const Download = makeIcon(glyphs.Download, "Download");
export const ExternalLink = makeIcon(glyphs.ExternalLink, "ExternalLink");
export const Eye = makeIcon(glyphs.Eye, "Eye");
export const Filter = makeIcon(glyphs.Filter, "Filter");
export const Flag = makeIcon(glyphs.Flag, "Flag");
export const Flame = makeIcon(glyphs.Flame, "Flame");
export const Globe = makeIcon(glyphs.Globe, "Globe");
export const GraduationCap = makeIcon(glyphs.GraduationCap, "GraduationCap");
export const GripVertical = makeIcon(glyphs.GripVertical, "GripVertical");
export const Home = makeIcon(glyphs.Home, "Home");
export const Info = makeIcon(glyphs.Info, "Info");
export const LayoutDashboard = makeIcon(glyphs.LayoutDashboard, "LayoutDashboard");
export const Lightbulb = makeIcon(glyphs.Lightbulb, "Lightbulb");
export const Link2 = makeIcon(glyphs.Link2, "Link2");
export const Linkedin = makeIcon(glyphs.Linkedin, "Linkedin");
export const Loader2 = makeIcon(glyphs.Loader2, "Loader2");
export const LogOut = makeIcon(glyphs.LogOut, "LogOut");
export const Mail = makeIcon(glyphs.Mail, "Mail");
export const MapPin = makeIcon(glyphs.MapPin, "MapPin");
export const Menu = makeIcon(glyphs.Menu, "Menu");
export const MessageCircle = makeIcon(glyphs.MessageCircle, "MessageCircle");
export const Moon = makeIcon(glyphs.Moon, "Moon");
export const MoreHorizontal = makeIcon(glyphs.MoreHorizontal, "MoreHorizontal");
export const PanelLeft = makeIcon(glyphs.PanelLeft, "PanelLeft");
export const Phone = makeIcon(glyphs.Phone, "Phone");
export const Plus = makeIcon(glyphs.Plus, "Plus");
export const Quote = makeIcon(glyphs.Quote, "Quote");
export const RefreshCw = makeIcon(glyphs.RefreshCw, "RefreshCw");
export const Rocket = makeIcon(glyphs.Rocket, "Rocket");
export const Scale = makeIcon(glyphs.Scale, "Scale");
export const Search = makeIcon(glyphs.Search, "Search");
export const Share2 = makeIcon(glyphs.Share2, "Share2");
export const Shield = makeIcon(glyphs.Shield, "Shield");
export const ShieldCheck = makeIcon(glyphs.ShieldCheck, "ShieldCheck");
export const SlidersHorizontal = makeIcon(glyphs.SlidersHorizontal, "SlidersHorizontal");
export const Sparkles = makeIcon(glyphs.Sparkles, "Sparkles");
export const Sun = makeIcon(glyphs.Sun, "Sun");
export const Sunrise = makeIcon(glyphs.Sunrise, "Sunrise");
export const Target = makeIcon(glyphs.Target, "Target");
export const Trash2 = makeIcon(glyphs.Trash2, "Trash2");
export const Upload = makeIcon(glyphs.Upload, "Upload");
export const UserCheck = makeIcon(glyphs.UserCheck, "UserCheck");
export const Users = makeIcon(glyphs.Users, "Users");
export const Wallet = makeIcon(glyphs.Wallet, "Wallet");
export const WifiOff = makeIcon(glyphs.WifiOff, "WifiOff");
export const X = makeIcon(glyphs.X, "X");
