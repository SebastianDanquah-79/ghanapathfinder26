import { Link } from "@tanstack/react-router";

const paths = [
  { key: "student", title: "I'm a Student", text: "Find universities, programmes, scholarships, internships, skills and career paths across Africa.", href: "/student", action: "Explore as a student" },
  { key: "employer", title: "I'm an Employer", text: "Find African talent, publish opportunities, manage applicants and build your hiring pipeline.", href: "/employer", action: "Open employer portal" },
  { key: "employee", title: "I'm a Professional", text: "Build your professional profile, discover jobs and internships, and connect your skills to opportunity.", href: "/employee", action: "Open professional portal" },
];

const stories = [
  ["Kwame Nkrumah", "Pan-African statesman whose ideas on African unity shaped generations of continental thought."],
  ["Yaa Asantewaa", "Ashanti leader remembered for her role in resisting British colonial rule and defending the Golden Stool."],
  ["Wangari Maathai", "Kenyan environmental and civic leader whose work connected environmental stewardship with community development."],
  ["Nelson Mandela", "South African leader whose life became closely associated with the struggle against apartheid and reconciliation."],
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight">GhanaPathFinder</Link>
          <Link to="/auth" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pb-24 lg:pt-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pan-African opportunity platform</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">Find your path. Connect with Africa.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              GhanaPathFinder helps students, professionals and employers discover education, careers, talent and opportunities across Africa, with Ghana as a major destination.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {paths.map((path) => (
              <Link key={path.key} to={path.href} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{path.key}</p>
                <h2 className="mt-3 text-2xl font-semibold">{path.title}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-muted-foreground">{path.text}</p>
                <span className="mt-6 inline-flex text-sm font-semibold text-primary">{path.action} →</span>
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/home" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Explore GhanaPathFinder</Link>
            <Link to="/africa-leadership" className="rounded-lg border border-border px-5 py-3 text-sm font-semibold">Explore African leadership</Link>
          </div>
        </section>

        <section className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Ghana, connected to Africa</p>
            <h2 className="mt-2 text-3xl font-bold">More than WASSCE</h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              The platform accepts multiple African and international qualifications so people can discover routes into Ghanaian universities and other African opportunities. Ghana remains a core destination, while the platform is designed for the wider continent.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Ghana universities", "International admissions", "Scholarships & funding", "Jobs & internships", "African skills", "Travel & tourism", "African history", "Startup ecosystem"].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-background p-4 text-sm font-medium">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">African stories</p>
          <h2 className="mt-2 text-3xl font-bold">Leaders, builders and people who shaped Africa</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">A knowledge section for learning about African leadership, independence movements, innovators, entrepreneurs and other people who contributed to the continent.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stories.map(([name, text]) => (
              <article key={name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <Link to="/africa-leadership" className="mt-7 inline-flex text-sm font-semibold text-primary">See the African leadership directory →</Link>
        </section>

        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8">
            <h2 className="text-2xl font-bold">Discover Ghana beyond education</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">The Ghana destination layer can connect universities and careers with culture, heritage, tourism, cities and places to visit.</p>
            <Link to="/home" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Start exploring</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
