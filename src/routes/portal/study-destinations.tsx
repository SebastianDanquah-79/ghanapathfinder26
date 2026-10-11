import { createFileRoute } from "@tanstack/react-router";
import InternationalCommunity from "@/pages/InternationalCommunity";

export const Route = createFileRoute("/portal/study-destinations")({
  component: InternationalCommunity,
});
