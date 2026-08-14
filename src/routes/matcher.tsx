import { createFileRoute } from "@tanstack/react-router";
import Matcher from "@/pages/Matcher";

export const Route = createFileRoute("/matcher")({
  component: Matcher,
});
