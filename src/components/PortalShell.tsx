import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type PortalShellProps = { eyebrow: string; title: string; description: string; children: ReactNode };

export default function PortalShell({ eyebrow, title, description, children }: PortalShellProps) {
  return <main className="min-h-dvh bg-[#FAF6EC] text-[#151428]">
    <div className="border-b border-[#151428]/10 bg-[#151428] text-[#FAF6EC]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-semibold tracking-tight">GhanaPathFinder</Link>
        <nav className="flex items-center gap-4 text-sm text-[#FAF6EC]/75">
          <Link to="/search">Explore</Link><Link to="/profile">Profile</Link><Link to="/notifications">Notifications</Link>
        </nav>
      </div>
    </div>
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <p className="text-sm font-medium text-[#006B3F]">{eyebrow}</p>
      <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#151428]/65">{description}</p>
      <div className="mt-10">{children}</div>
    </div>
  </main>;
}
