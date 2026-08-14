import { createFileRoute } from "@tanstack/react-router";
import Saved from "@/pages/Saved";

export const Route = createFileRoute("/saved")({
  component: Saved,
});
