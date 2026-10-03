import { createFileRoute } from "@tanstack/react-router";
import CareerMarketplace from "@/pages/CareerMarketplace";

export const Route = createFileRoute("/career-marketplace")({
  component: CareerMarketplace,
});
