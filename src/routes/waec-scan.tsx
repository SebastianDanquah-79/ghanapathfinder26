import { createFileRoute } from "@tanstack/react-router";
import WaecScan from "@/pages/WaecScan";

export const Route = createFileRoute("/waec-scan")({
  component: WaecScan,
});
