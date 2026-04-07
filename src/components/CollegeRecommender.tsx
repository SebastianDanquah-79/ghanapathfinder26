import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import ShareButtons from "./ShareButtons";

const majors = ["Computer Science", "Medicine", "Engineering", "Business", "Law", "Education", "Nursing", "Pharmacy", "Architecture", "Agriculture", "Arts & Humanities", "Economics", "Accounting", "Communication Studies"];
const regions = ["Accra", "Kumasi", "Cape Coast", "Sunyani", "Tamale", "Ho", "Wa", "Any Region"];
const preferences = ["Public Only", "Private Only", "No Preference"];

const CollegeRecommender = () => {
  const [form, setForm] = useState({ name: "", major: "", aggregate: "", career: "", region: "", preference: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setShowShare(false);

    // Simulated AI response with typewriter effect
    const mockResult = generateMockRecommendation(form);
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockResult.length) {
        setResult((prev) => prev + mockResult[i]);
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
        setShowShare(true);
      }
    }, 8);
  };

  return (
    <section id="recommender" className="py-20 lg:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="AI-Powered"
          title="Find Your Perfect"
          highlight="University Match"
          description="Tell us about yourself and our AI will recommend the top 3 universities in Ghana that fit you best."
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-glass rounded-2xl p-6 sm:p-8 space-y-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kwame Asante"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Intended Major</label>
              <select
                required
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select major</option>
                {majors.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">WASSCE Aggregate</label>
              <input
                required
                type="number"
                min={6}
                max={54}
                value={form.aggregate}
                onChange={(e) => setForm({ ...form, aggregate: e.target.value })}
                placeholder="e.g. 12"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Career Goal</label>
              <input
                required
                value={form.career}
                onChange={(e) => setForm({ ...form, career: e.target.value })}
                placeholder="Software Engineer, Doctor..."
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Region</label>
              <select
                required
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select region</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">University Preference</label>
              <select
                required
                value={form.preference}
                onChange={(e) => setForm({ ...form, preference: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select preference</option>
                {preferences.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Get My Recommendations</>
            )}
          </button>
        </motion.form>

        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-lg text-foreground">
                Recommendations for {form.name}
              </h3>
            </div>
            <div className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${loading ? "typewriter-cursor" : ""}`}>
              {result}
            </div>
            {showShare && (
              <div className="mt-6 pt-6 border-t border-border">
                <ShareButtons studentName={form.name} resultRef={resultRef} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

function generateMockRecommendation(form: { name: string; major: string; aggregate: string; career: string; region: string; preference: string }) {
  return `🎓 Top 3 University Matches for ${form.name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥇 #1 — University of Ghana (UG), Legon
📍 Accra | Public University
📚 Program: BSc ${form.major}
📊 Required Aggregate: 6-12 | Your Aggregate: ${form.aggregate}
💰 Tuition: GHS 1,500 - 5,000/year
🎯 Match Confidence: 94%

Why it fits you: UG's ${form.major} program is one of the most respected in West Africa. With your aggregate of ${form.aggregate} and career goal of becoming a ${form.career}, UG offers strong industry connections, research opportunities, and an alumni network that spans the globe. The campus in Legon is vibrant with countless student organizations to build your network.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥈 #2 — KNUST, Kumasi
📍 Kumasi | Public University
📚 Program: BSc ${form.major}
📊 Required Aggregate: 6-14 | Your Aggregate: ${form.aggregate}
💰 Tuition: GHS 1,500 - 4,500/year
🎯 Match Confidence: 89%

Why it fits you: KNUST is Ghana's premier STEM university. Their ${form.major} department has state-of-the-art facilities and strong ties to industry. The Kumasi tech ecosystem is growing rapidly, giving you real-world experience even before graduation. Perfect for someone aiming to become a ${form.career}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥉 #3 — Ashesi University
📍 Berekuso, Greater Accra | Private University
📚 Program: BSc ${form.major}
📊 Required Aggregate: 6-12 | Your Aggregate: ${form.aggregate}
💰 Tuition: GHS 25,000 - 45,000/year (scholarships available)
🎯 Match Confidence: 85%

Why it fits you: Ashesi is Africa's #1 liberal arts university with a focus on ethical leadership and innovation. Their ${form.major} program combines technical skills with critical thinking. With generous financial aid covering up to 100% of tuition, it's more accessible than you think. The entrepreneurial culture makes it ideal if you want to eventually build something as a ${form.career}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Pro Tips:
• Apply early — deadlines are usually December-February
• Prepare for entrance exams at UG and KNUST
• Check scholarship portals monthly
• Visit campuses if possible before making your final decision

Your future in Ghana is bright, ${form.name}! 🇬🇭✨`;
}

export default CollegeRecommender;
