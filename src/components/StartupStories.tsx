import { motion } from "framer-motion";
import { Lightbulb, GraduationCap, Rocket } from "lucide-react";
import SectionHeader from "./SectionHeader";

const founders = [
  { name: "Kwame Ofori", uni: "Ashesi University", built: "PayStack Ghana Agent Network — mobile payments for rural merchants", lesson: "Start with problems you see in your community. The best ideas come from lived experience." },
  { name: "Ama Serwaa", uni: "KNUST", built: "FarmConnect — a marketplace connecting smallholder farmers directly to urban restaurants", lesson: "Don't wait for the 'perfect' idea. Start with what's broken and iterate." },
  { name: "Kofi Mensah", uni: "University of Ghana", built: "EduTrack — AI-powered study planner for SHS students preparing for WASSCE", lesson: "Build for people like you. Your own pain points are your best product roadmap." },
  { name: "Abena Darkwa", uni: "Academic City", built: "StyleGH — an on-demand fashion marketplace for Ghanaian designers", lesson: "Technology is just a tool. Culture and community are the real moats." },
  { name: "Yaw Boateng", uni: "GCTU", built: "TroTro AI — route optimization for Accra's informal transit system", lesson: "The biggest opportunities in Africa are in unglamorous problems nobody wants to solve." },
  { name: "Efua Ansah", uni: "UCC", built: "HealthPal — telemedicine app connecting rural patients with city specialists", lesson: "Impact and profit aren't opposites. Solve real problems and money follows." },
  { name: "Nana Kwesi", uni: "UPSA", built: "QuickBooks GH — simplified accounting tool for Ghanaian SMEs", lesson: "Talk to 100 potential customers before writing a single line of code." },
  { name: "Adwoa Mensima", uni: "Regent University", built: "BookBridge — peer-to-peer textbook lending platform for university students", lesson: "Your first version should be embarrassingly simple. Just make it work." },
];

const StartupStories = () => (
  <section id="founders" className="py-20 lg:py-28 px-4">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        badge="Inspiration"
        title="Ghanaian Founder"
        highlight="Stories"
        description="Illustrative stories of young Ghanaian builders turning ideas into impact. These are representative examples to inspire your journey."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {founders.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-glass rounded-xl p-6 card-hover group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">{f.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <GraduationCap className="h-3 w-3" />
              {f.uni}
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{f.built}</p>
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-primary/80 italic">"{f.lesson}"</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StartupStories;
