import { createFileRoute } from "@tanstack/react-router";
import MyPath from "@/pages/MyPath";
import WorldClassPathLayer from "@/components/WorldClassPathLayer";

function MyPathRoute() {
  return (
    <>
      <MyPath />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <WorldClassPathLayer />
      </div>
    </>
  );
}

export const Route = createFileRoute("/my-path")({
  component: MyPathRoute,
});
