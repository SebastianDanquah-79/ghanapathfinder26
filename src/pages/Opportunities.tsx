import Navbar from "@/components/Navbar";

export default function Opportunities() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Opportunity hub</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Jobs, internships and opportunities</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Explore opportunities across Ghana, Africa and the world.
        </p>
      </main>
    </div>
  );
}
