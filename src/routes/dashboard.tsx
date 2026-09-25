import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  // Private, highly interactive dashboard: keep initial auth/data rendering client-side.
  // This avoids SSR execution of browser/session-dependent dashboard code.
  ssr: false,
  component: Dashboard,
});
