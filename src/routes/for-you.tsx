import { createFileRoute } from "@tanstack/react-router";
import ForYou from "@/pages/ForYou";

export const Route = createFileRoute("/for-you")({
  component: ForYou,
});
