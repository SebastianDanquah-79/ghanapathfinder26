import AskPanel from "@/components/AskPanel";
import Navbar from "@/components/Navbar";

const AskAfrica = () => {
  const suggestions = [
    "Find AI opportunities in Africa.",
    "What Ghanaian startups work in fintech?",
    "Find African robotics companies.",
    "What African research institutions work on AI?",
    "What events are happening in Accra?",
  ];
  return <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12"><Navbar/><main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <header className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">AI discovery</p><h1 className="mt-2 text-3xl font-bold">Ask Africa</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Ask questions about African education, work, companies, startups, research and opportunities. The assistant should use available platform context and clearly signal uncertainty.</p></header>
    <AskPanel query="Africa education, careers, startups, companies, research, opportunities, culture and discovery" items={[]} suggestions={suggestions}/>
  </main></div>;
};
export default AskAfrica;
