import { createFileRoute } from "@tanstack/react-router";
import MyPath from "@/pages/MyPath";
import WorldClassPathLayer from "@/components/WorldClassPathLayer";
import OpportunityGraph from "@/components/OpportunityGraph";

function MyPathRoute() {
  return (
    <>
      <MyPath />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pb-24 md:pb-12">
        <WorldClassPathLayer />
        <OpportunityGraph
          goal=""
          routes={[]}
          savedCounts={{ university: 0, scholarship: 0, internship: 0 }}
        />
      </div>
    </>
  );
}

export const Route = createFileRoute("/my-path")({
  component: MyPathRoute,
});
