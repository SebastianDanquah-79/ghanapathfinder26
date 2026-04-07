import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, GraduationCap, Building2 } from "lucide-react";
import { universities } from "@/data/universities";
import SectionHeader from "./SectionHeader";

const UniversityDirectory = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Public" | "Private">("All");

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.location.toLowerCase().includes(search.toLowerCase()) ||
        u.topPrograms.some((p) => p.toLowerCase().includes(search.toLowerCase()));
      const matchType = typeFilter === "All" || u.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  return (
    <section id="universities" className="py-20 lg:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Directory"
          title="Ghana University"
          highlight="Directory"
          description="Explore every major university in Ghana. Search by name, program, or location."
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search universities, programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Public", "Private"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((u, i) => (
            <motion.div
              key={u.shortName}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="bg-glass rounded-xl p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">{u.shortName}</h3>
                  <p className="text-xs text-muted-foreground">{u.name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  u.type === "Public" ? "bg-ghana-green/20 text-ghana-green" : "bg-primary/20 text-primary"
                }`}>
                  {u.type}
                </span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                <MapPin className="h-3.5 w-3.5" />
                <span>{u.location}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {u.topPrograms.slice(0, 3).map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Aggregate: {u.admissionAggregate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">{u.tuitionRange}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{u.campusVibe}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityDirectory;
