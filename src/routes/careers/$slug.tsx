import { createFileRoute } from "@tanstack/react-router";
import CareerDetail from "@/pages/CareerDetail";

export const Route = createFileRoute("/careers/$slug")({
  component: CareerDetail,
});
