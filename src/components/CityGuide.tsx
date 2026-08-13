import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Wallet, Shield, Users, Home, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const cities = ["Accra", "Kumasi", "Cape Coast"];

interface CityData {
  budget: { item: string; amount: string }[];
  neighborhoods: string[];
  moneyTips: string[];
  safetyTips: string[];
  networkingTips: string[];
}

const cityData: Record<string, CityData> = {
  Accra: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 300 - 600/mo" },
      { item: "Food", amount: "GHS 400 - 700/mo" },
      { item: "Transport", amount: "GHS 150 - 300/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 150/mo" },
      { item: "Miscellaneous", amount: "GHS 100 - 200/mo" },
    ],
    neighborhoods: ["Madina (near UG)", "Haatso (affordable, connected)", "Legon surroundings", "Adenta (quiet, spacious)", "Dome (budget-friendly)"],
    moneyTips: ["Open a mobile money account immediately", "Cook at home — waakye from vendors is cheap but adds up", "Use trotro over Uber for daily commute", "Budget weekly, not monthly"],
    safetyTips: ["Avoid walking alone late at night in unfamiliar areas", "Keep valuables hidden on trotros", "Save emergency contacts offline", "Learn your neighborhood within the first week"],
    networkingTips: ["Join your department's student association", "Attend campus events and career fairs", "Find a study group early", "Connect with upperclassmen for guidance", "Join tech/business communities like DevCongress or GhanaThink"],
  },
  Kumasi: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 200 - 450/mo" },
      { item: "Food", amount: "GHS 350 - 600/mo" },
      { item: "Transport", amount: "GHS 100 - 250/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 120/mo" },
      { item: "Miscellaneous", amount: "GHS 80 - 150/mo" },
    ],
    neighborhoods: ["Ayeduase (KNUST area)", "Bomso (student hub)", "Kentinkrono", "Ayigya (budget-friendly)", "Kotei"],
    moneyTips: ["Kumasi is cheaper than Accra — take advantage", "Buy groceries from Kejetia Market for best prices", "Shared taxis (dropping) are cheaper than private rides", "Join a susu (savings group) with classmates"],
    safetyTips: ["Stick to well-lit campus routes at night", "Keep your phone secure in crowded markets", "Travel in groups when exploring new areas", "Know the KNUST security hotline"],
    networkingTips: ["KNUST has the strongest engineering community in Ghana", "Join hackathons at the KNUST Fab Lab", "Attend Kumasi Hive events", "Connect with alumni through departmental associations"],
  },
  "Cape Coast": {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 180 - 400/mo" },
      { item: "Food", amount: "GHS 300 - 500/mo" },
      { item: "Transport", amount: "GHS 80 - 200/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 70 - 130/mo" },
    ],
    neighborhoods: ["OLA (near UCC)", "Apewosika (popular student area)", "Science area", "Abura (affordable)", "Pedu"],
    moneyTips: ["Cape Coast is the most affordable university city", "Buy provisions from the Cape Coast Market", "Shared rooms near campus are the best value", "Cook with friends to split costs"],
    safetyTips: ["The beach is beautiful but swim carefully — strong currents", "Campus and surroundings are generally safe", "Stay aware during festivals (Fetu Afahye)", "Keep doors locked in off-campus housing"],
    networkingTips: ["UCC has a strong education and arts community", "Join the SRC and its sub-committees", "Cape Coast has a growing creative arts scene", "Volunteer with local NGOs for experience"],
  },
};

const CityGuide = () => {
  const [city, setCity] = useState("");
  const [data, setData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (c: string) => {
    setCity(c);
    setLoading(true);
    setTimeout(() => {
      setData(cityData[c] || null);
      setLoading(false);
    }, 800);
  };

  const icons = [
    { icon: Wallet, label: "Monthly Budget", key: "budget" },
    { icon: Home, label: "Best Neighborhoods", key: "neighborhoods" },
    { icon: Wallet, label: "Money Tips", key: "moneyTips" },
    { icon: Shield, label: "Safety Tips", key: "safetyTips" },
    { icon: Users, label: "Networking", key: "networkingTips" },
  ];

  return (
    <section id="cityguide" className="py-12 lg:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          badge="Survival Guide"
          title="Student City"
          highlight="Guide"
          description="Everything you need to know about living alone as a student in Ghana's top university cities."
        />

        <div className="flex justify-center gap-3 mb-7">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                city === c
                  ? "bg-primary text-primary-foreground glow-gold"
                  : "bg-glass bg-glass-hover text-muted-foreground"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-1.5" />
              {c}
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
            className="space-y-5"
          >
            {/* Budget Table */}
            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Monthly Budget Breakdown</h3>
              </div>
              <div className="space-y-2">
                {data.budget.map((b) => (
                  <div key={b.item} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{b.item}</span>
                    <span className="text-sm font-semibold text-foreground">{b.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: Home, title: "Best Neighborhoods", items: data.neighborhoods },
                { icon: Wallet, title: "Money Management", items: data.moneyTips },
                { icon: Shield, title: "Safety Tips", items: data.safetyTips },
                { icon: Users, title: "Networking & Social", items: data.networkingTips },
              ].map(({ icon: Icon, title, items }) => (
                <div key={title} className="bg-glass rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">{title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CityGuide;
