import { createFileRoute } from "@tanstack/react-router";
import NewsHub from "@/pages/NewsHub";

export const Route = createFileRoute("/global-news")({
  component: () => (
    <NewsHub
      title="Global News"
      subtitle="International reporting outside the African regional feed, separated from Africa Now and Ghana coverage."
      mode="global"
    />
  ),
});
