import { createFileRoute } from "@tanstack/react-router";
import NewsHub from "@/pages/NewsHub";

export const Route = createFileRoute("/global-news")({
  component: () => (
    <NewsHub
      title="Global News"
      subtitle="Ghanaian and international reporting from across the world, including the latest news from Ghana."
      mode="global"
    />
  ),
});
