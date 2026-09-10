import { createFileRoute } from "@tanstack/react-router";
import CareerPath from "@/pages/CareerPath";

export const Route = createFileRoute("/career-path")({
  component: CareerPath,
});
