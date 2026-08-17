import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Building, DollarSign, Globe, Search, Loader2 } from "@/lib/icons";
import SectionHeader from "./SectionHeader";

import { popularMajors, mockCareerData, type CareerData } from "@/data/careers";



const CareerSection = () => {
  const [selectedMajor, setSelectedMajor] = useState("");
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (major: string) => {
    setSelectedMajor(major);
    setLoading(true);
    setTimeout(() => {
      setData(mockCareerData[major] || {
        major,
        roles: ["Business Analyst", "Consultant", "Project Coordinator", "Operations Manager", "Entrepreneur"],
        companies: ["Deloitte Ghana", "PwC Ghana", "KPMG Ghana", "MTN Ghana", "Stanbic Bank"],
        salary: "GHS 2,000 - 8,000/month",
        remote: "Growing remote opportunities in consulting and digital roles.",
        linkedinTip: `Search: '${major} Graduate Ghana'. Join relevant professional associations.`,
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="careers" className="py-12 lg:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          badge="Career Intelligence"
          title="Your Career Path"
          highlight="in Ghana"
          description="Roles, employers and salaries by major."
        />

        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {popularMajors.map((m) => (
            <button
              key={m}
              onClick={() => handleSearch(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMajor === m
                  ? "bg-primary text-primary-foreground glow-gold-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth [&>*]:w-[18rem] [&>*]:shrink-0 [&>*]:snap-start md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0 md:[&>*]:w-auto gap-5"
          >
            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Top 5 Job Roles</h3>
              </div>
              <ul className="space-y-2">
                {data.roles.map((r, i) => (
                  <li key={r} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Top Companies Hiring</h3>
              </div>
              <ul className="space-y-2">
                {data.companies.map((c) => (
                  <li key={c} className="text-sm text-muted-foreground">• {c}</li>
                ))}
              </ul>
            </div>

            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Salary Range</h3>
              </div>
              <p className="text-2xl font-display font-bold text-gradient-gold mb-2">{data.salary}</p>
              <p className="text-xs text-muted-foreground">Average range for entry to mid-level positions in Ghana</p>
            </div>

            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Remote & International</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.remote}</p>
            </div>

            <div className="md:col-span-2 bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">LinkedIn Search Tips</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.linkedinTip}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CareerSection;
