import { createFileRoute } from "@tanstack/react-router";
import InternationalCommunity from "@/pages/InternationalCommunity";

export const Route = createFileRoute("/study-destinations")({
  component: InternationalCommunity,
});
