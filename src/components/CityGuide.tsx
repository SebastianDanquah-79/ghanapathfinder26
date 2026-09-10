import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Wallet, Shield, Users, Home, Loader2 } from "@/lib/icons";
import SectionHeader from "./SectionHeader";

const cities = [
  "Accra", "Kumasi", "Cape Coast", "Tamale", "Takoradi", "Ho", "Sunyani",
  "Koforidua", "Winneba", "Wa", "Bolgatanga", "Navrongo", "Tarkwa",
];

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
      { item: "Rent (shared room)", amount: "GHS 1,400 - 3,500/mo" },
      { item: "Food & groceries", amount: "GHS 1,200 - 2,200/mo" },
      { item: "Transport", amount: "GHS 400 - 900/mo" },
      { item: "Data/Internet", amount: "GHS 200 - 450/mo" },
      { item: "Personal & school needs", amount: "GHS 300 - 700/mo" },
    ],
    neighborhoods: ["Madina", "Haatso", "Legon surroundings", "Adenta", "Dome"],
    moneyTips: ["Ask for the full rent and utility cost before moving in", "Cook regularly instead of buying every meal", "Use trotro and shared taxis for routine trips", "Keep a weekly spending limit", "Set aside an emergency buffer before the semester starts"],
    safetyTips: ["Use well-lit routes at night", "Keep phones and laptops secure in crowded transport", "Save campus and emergency contacts offline", "Visit a new neighbourhood in daylight before renting"],
    networkingTips: ["Join your department association", "Attend career fairs and public lectures", "Build relationships with upperclassmen", "Use Accra's startup and professional events", "Look for internships during breaks"],
  },
  Kumasi: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 900 - 2,200/mo" },
      { item: "Food & groceries", amount: "GHS 900 - 1,700/mo" },
      { item: "Transport", amount: "GHS 250 - 650/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 350/mo" },
      { item: "Personal & school needs", amount: "GHS 250 - 550/mo" },
    ],
    neighborhoods: ["Ayeduase", "Bomso", "Kentinkrono", "Ayigya", "Kotei"],
    moneyTips: ["Compare hostel and private-room prices before paying", "Buy groceries from major markets", "Use shared transport for regular routes", "Cook in batches with roommates", "Budget separately for academic materials"],
    safetyTips: ["Stay on familiar routes after dark", "Secure devices around busy markets", "Travel with friends when exploring unfamiliar areas", "Keep accommodation and campus contacts saved"],
    networkingTips: ["Join engineering, computing and business clubs", "Attend KNUST innovation events", "Connect with alumni through departments", "Look for project teams and hackathons", "Build relationships with lecturers early"],
  },
  "Cape Coast": {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 800 - 1,800/mo" },
      { item: "Food & groceries", amount: "GHS 850 - 1,600/mo" },
      { item: "Transport", amount: "GHS 200 - 500/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Apewosika", "OLA", "Abura", "Science area", "Pedu"],
    moneyTips: ["Check water, electricity and internet costs before renting", "Cook with roommates where possible", "Buy provisions from local markets", "Keep a weekly transport allowance", "Budget for travel home during breaks"],
    safetyTips: ["Be careful around the coast and strong currents", "Use lit routes around student areas", "Secure rooms and electronics", "Avoid unfamiliar areas late at night"],
    networkingTips: ["Join UCC student associations", "Attend education, arts and business events", "Volunteer with local organisations", "Connect with alumni and final-year students"],
  },
  Tamale: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 700 - 1,600/mo" },
      { item: "Food & groceries", amount: "GHS 800 - 1,500/mo" },
      { item: "Transport", amount: "GHS 200 - 500/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Dungu", "Kalpohin", "Vittin", "Gumbihini", "Education Ridge"],
    moneyTips: ["Compare housing close to campus with transport costs", "Buy staples in larger quantities", "Plan for heat-related expenses", "Keep a travel fund for trips south", "Share accommodation where practical"],
    safetyTips: ["Stay hydrated in the heat", "Use trusted transport providers", "Avoid isolated routes after dark", "Keep devices protected from dust and heat"],
    networkingTips: ["Join UDS academic and entrepreneurship groups", "Connect with northern-focused NGOs", "Attend local technology and youth events", "Seek research and community projects"],
  },
  Takoradi: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 900 - 2,200/mo" },
      { item: "Food & groceries", amount: "GHS 900 - 1,700/mo" },
      { item: "Transport", amount: "GHS 250 - 600/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 350/mo" },
      { item: "Personal & school needs", amount: "GHS 250 - 550/mo" },
    ],
    neighborhoods: ["Butumagyebu", "Effiakuma", "Anaji", "Kwesimintsim", "Fijai"],
    moneyTips: ["Compare rent carefully because oil-city costs vary", "Use shared taxis on established routes", "Buy food from markets rather than convenience shops", "Budget for occasional trips into Sekondi-Takoradi", "Keep an emergency transport fund"],
    safetyTips: ["Secure valuables around busy commercial areas", "Be cautious at unpatrolled beaches", "Use known routes after dark", "Keep your accommodation location shared with a trusted person"],
    networkingTips: ["Attend TTU career events", "Explore engineering, maritime and logistics networks", "Seek vacation attachments", "Connect with local employers and alumni"],
  },
  Ho: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 700 - 1,600/mo" },
      { item: "Food & groceries", amount: "GHS 800 - 1,500/mo" },
      { item: "Transport", amount: "GHS 180 - 450/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Ho Bankoe", "Ahoe", "Housing Estate", "Sokode", "Dome"],
    moneyTips: ["Prioritise housing within a manageable commute", "Buy fresh food locally", "Walk where it is practical and safe", "Share household costs with roommates", "Budget for trips outside Ho"],
    safetyTips: ["Use familiar roads at night", "Take care on hilly and rainy routes", "Keep doors and windows secured", "Save campus security contacts"],
    networkingTips: ["Join UHAS or HTU clubs", "Attend health and technology events", "Volunteer in community projects", "Build relationships with local professionals"],
  },
  Sunyani: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 700 - 1,700/mo" },
      { item: "Food & groceries", amount: "GHS 800 - 1,500/mo" },
      { item: "Transport", amount: "GHS 180 - 450/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Fiapre", "Area 4", "Penkwase", "New Dormaa", "Abesim"],
    moneyTips: ["Compare Fiapre housing with transport costs", "Buy staples from markets", "Share household purchases", "Keep a separate academic-materials budget", "Plan for travel during long breaks"],
    safetyTips: ["Use well-lit routes", "Secure phones around transport stations", "Keep accommodation contacts available", "Be careful on rainy-season roads"],
    networkingTips: ["Join UENR academic and energy clubs", "Attend regional business events", "Seek agribusiness and energy projects", "Connect with alumni"],
  },
  Koforidua: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 800 - 1,900/mo" },
      { item: "Food & groceries", amount: "GHS 850 - 1,600/mo" },
      { item: "Transport", amount: "GHS 200 - 500/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Effiduase", "Adweso", "Zongo", "Srodae", "Oyoko"],
    moneyTips: ["Compare rent against daily transport", "Use local markets for provisions", "Plan Accra trips instead of making them impulsively", "Track mobile-money spending", "Keep a small emergency fund"],
    safetyTips: ["Use familiar routes at night", "Take care on the Accra-Koforidua road", "Secure laptops in shared accommodation", "Watch slippery roads during heavy rain"],
    networkingTips: ["Join KTU technology and engineering clubs", "Use proximity to Accra for internships", "Attend Eastern Region business events", "Connect with student entrepreneurs"],
  },
  Winneba: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 750 - 1,700/mo" },
      { item: "Food & groceries", amount: "GHS 800 - 1,500/mo" },
      { item: "Transport", amount: "GHS 180 - 450/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["North Campus area", "South Campus area", "Ateitu", "Gyahadze", "Sir Charles area"],
    moneyTips: ["Compare rooms by distance to your campus", "Cook in groups", "Budget separately for travel to Accra", "Buy provisions in larger quantities", "Keep an emergency buffer"],
    safetyTips: ["Be cautious around the coast", "Use lit paths between student areas", "Secure shared accommodation", "Stay alert during large festival crowds"],
    networkingTips: ["Join UEW student associations", "Explore education and creative communities", "Attend student conferences", "Connect with teaching and research mentors"],
  },
  Wa: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 650 - 1,500/mo" },
      { item: "Food & groceries", amount: "GHS 750 - 1,400/mo" },
      { item: "Transport", amount: "GHS 180 - 400/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Bamahu", "Kpaguri", "Dobile", "Konta", "Kambali"],
    moneyTips: ["Plan long-distance travel in advance", "Buy staples in bulk", "Share household costs", "Keep a larger travel reserve", "Track spending weekly"],
    safetyTips: ["Prepare for heat", "Avoid isolated routes at night", "Keep emergency contacts offline", "Use trusted local transport"],
    networkingTips: ["Join SDD-UBIDS academic and business groups", "Connect with development organisations", "Join entrepreneurship clubs", "Seek district-level internships"],
  },
  Bolgatanga: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 650 - 1,500/mo" },
      { item: "Food & groceries", amount: "GHS 750 - 1,400/mo" },
      { item: "Transport", amount: "GHS 180 - 400/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Sumbrungu", "Zaare", "Tanzui", "Yikene", "Bolga Central"],
    moneyTips: ["Compare accommodation before paying", "Buy produce from local markets", "Share household costs", "Budget for trips outside the region", "Keep an emergency reserve"],
    safetyTips: ["Stay hydrated", "Use trusted transport", "Avoid isolated areas after dark", "Protect devices from dust and heat"],
    networkingTips: ["Join BTU associations", "Connect with development organisations", "Explore health and education projects", "Meet local entrepreneurs"],
  },
  Navrongo: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 650 - 1,500/mo" },
      { item: "Food & groceries", amount: "GHS 750 - 1,400/mo" },
      { item: "Transport", amount: "GHS 180 - 400/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 320/mo" },
      { item: "Personal & school needs", amount: "GHS 220 - 500/mo" },
    ],
    neighborhoods: ["Navrongo campus area", "Manyoro road", "Wuru", "Pungu", "Doba road"],
    moneyTips: ["Compare housing and campus distance", "Buy staples before prices rise during term", "Share cooking and household costs", "Plan regional travel early", "Budget for academic materials"],
    safetyTips: ["Protect yourself from heat and dust", "Travel on familiar routes", "Keep devices secure", "Save campus contacts offline"],
    networkingTips: ["Join CKT-UTAS science and ICT clubs", "Explore research opportunities", "Connect with local health and development organisations", "Attend entrepreneurship activities"],
  },
  Tarkwa: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 900 - 2,200/mo" },
      { item: "Food & groceries", amount: "GHS 900 - 1,700/mo" },
      { item: "Transport", amount: "GHS 220 - 550/mo" },
      { item: "Data/Internet", amount: "GHS 150 - 350/mo" },
      { item: "Personal & school needs", amount: "GHS 250 - 550/mo" },
    ],
    neighborhoods: ["UMaT campus area", "Tarkwa Banso", "Cyanide", "New Atuabo", "Nsuaem road"],
    moneyTips: ["Mining-town housing can vary significantly", "Compare rent before paying a deposit", "Buy produce at local markets", "Budget for fieldwork and academic equipment", "Look for legitimate vacation attachments"],
    safetyTips: ["Avoid unmarked mining areas", "Follow campus and field-safety rules", "Use registered transport", "Take care on wet roads"],
    networkingTips: ["Join UMaT engineering and mining societies", "Attend employer presentations", "Seek legitimate internships and vacation training", "Build relationships with alumni"],
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
    }, 350);
  };

  return (
    <section id="cityguide" className="py-12 lg:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          badge="Student Survival Guide"
          title="What will student life actually cost?"
          highlight="By city"
          description="Planning estimates for 2026 Ghana. Costs vary by neighbourhood, housing type and lifestyle, so use these as a starting point rather than a promise. University tuition is separate and should always be checked against the institution's current fee schedule."
        />

        <div className="mb-6 rounded-xl border border-border bg-glass p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Planning note:</strong> These are realistic monthly living-cost ranges, not official university fees. Tuition, accommodation charges and other academic fees can be substantially higher and differ by programme and institution.
        </div>

        <div className="hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth flex gap-3 mb-7 md:flex-wrap md:justify-center md:overflow-visible md:mx-0 md:px-0">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className={`shrink-0 snap-start px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                city === c ? "bg-primary text-primary-foreground glow-gold" : "bg-glass bg-glass-hover text-muted-foreground"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-1.5" />
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Monthly living budget</h3>
              </div>
              <div className="space-y-2">
                {data.budget.map((b) => (
                  <div key={b.item} className="flex justify-between items-center gap-4 py-3 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{b.item}</span>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">{b.amount}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">A student living independently should plan for roughly GHS 2,000+ per month in lower-cost cities and GHS 3,500+ in higher-cost cities, before tuition and major one-off expenses.</p>
            </div>

            <div className="hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth flex gap-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:mx-0 md:px-0">
              {[
                { icon: Home, title: "Where students live", items: data.neighborhoods },
                { icon: Wallet, title: "How to manage money", items: data.moneyTips },
                { icon: Shield, title: "Staying safe", items: data.safetyTips },
                { icon: Users, title: "Build your network", items: data.networkingTips },
              ].map(({ icon: Icon, title, items }) => (
                <div key={title} className="bg-glass rounded-xl p-5 shrink-0 w-[80vw] max-w-xs snap-start md:w-auto md:max-w-none md:shrink">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">{title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>{item}
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
