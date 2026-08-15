import { motion } from "framer-motion";
import { Users, Eye, Sparkles, UserCheck } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useUsageStats } from "@/hooks/useUsageStats";

const ImpactSection = () => {
  const { data } = useUsageStats();

  const stats = [
    { icon: Users, label: "Students with GhanaPath accounts", value: data?.students ?? 0 },
    { icon: UserCheck, label: "Students actively using GhanaPath", value: data?.active_students ?? 0 },
    { icon: Eye, label: "Website visits (unique sessions)", value: data?.website_visits ?? 0 },
    { icon: Sparkles, label: "Recommendation runs", value: data?.recommendation_runs ?? 0 },
  ];

  return (
    <section id="impact" className="py-12 lg:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          badge="GhanaPath Impact"
          title="People who have used"
          highlight="GhanaPath so far"
          description="Live, verified numbers counted from real activity. Aggregate only — no student is ever identified."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-glass rounded-xl p-4 sm:p-5 text-center min-w-0"
            >
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                {Number(s.value).toLocaleString("en-GB")}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Updated automatically as students use GhanaPath.
        </p>
      </div>
    </section>
  );
};

export default ImpactSection;
