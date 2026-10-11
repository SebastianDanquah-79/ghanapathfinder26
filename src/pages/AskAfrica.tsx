import { useQuery } from "@tanstack/react-query";
import AskPanel from "@/components/AskPanel";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const AskAfrica = () => {
  const q = useQuery({
    queryKey: ["ask-africa-context"],
    queryFn: async () => {
      const [op, startups, companies, news] = await Promise.all([
        supabase.from("opportunities").select("id,title,company_name,organisation,country,category,description,apply_url,source_url").or("is_active.eq.true,published.eq.true").order("posted_at",{ascending:false}).limit(8),
        supabase.from("african_startups").select("id,company_name,country,city,sector,stage,official_url,source_url").order("last_verified_at",{ascending:false}).limit(6),
        supabase.from("companies").select("id,name,country,location,sector,description,website_url,careers_url").eq("verified",true).order("last_verified_at",{ascending:false}).limit(6),
        supabase.from("news_articles").select("id,title,excerpt,country_code,category,original_url,source_name").order("published_at",{ascending:false}).limit(6),
      ]);
      if (op.error) throw op.error;
      if (startups.error) throw startups.error;
      if (companies.error) throw companies.error;
      if (news.error) throw news.error;
      return [
        ...(op.data??[]).map(x=>({kind:"opportunity",title:x.title,subtitle:[x.company_name||x.organisation,x.country,x.category].filter(Boolean).join(" · "),blurb:x.description,to:x.apply_url||x.source_url})),
        ...(startups.data??[]).map(x=>({kind:"startup",title:x.company_name,subtitle:[x.sector,x.country,x.city,x.stage].filter(Boolean).join(" · "),to:x.official_url||x.source_url})),
        ...(companies.data??[]).map(x=>({kind:"company",title:x.name,subtitle:[x.sector,x.location].filter(Boolean).join(" · "),blurb:x.description,to:x.website_url||x.careers_url})),
        ...(news.data??[]).map(x=>({kind:"news",title:x.title,subtitle:[x.category,x.country_code,x.source_name].filter(Boolean).join(" · "),blurb:x.excerpt,to:x.original_url})),
      ];
    },
    staleTime: 300000,
  });
  const suggestions = [
    "Teach me a difficult computer science concept step by step, with an example.",
    "Quiz me on a topic one question at a time and explain my mistakes.",
    "Build a realistic 7-day revision plan for my subjects and available study time.",
    "Turn these notes or a topic into simple flashcards for active recall.",
    "Help me compare university and scholarship options using official sources.",
    "Help me plan my next application steps and deadlines.",
  ];
  return <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12"><Navbar/><main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <header className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Study, plan and grow</p><h1 className="mt-2 text-3xl font-bold">Your AI study and path coach</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Learn difficult topics step by step, practise with quizzes, make revision plans, and explore admissions, scholarships, careers and African opportunities. Platform listings provide context, not a guarantee. Confirm important requirements with official sources.</p></header>
    <AskPanel query="Study coach: explain school and university topics, computing and STEM concepts, revision planning, admissions, scholarships, careers and African opportunities" items={q.data??[]} suggestions={suggestions}/>
  </main></div>;
};
export default AskAfrica;
