import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Wallet, Shield, Users, Home, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const cities = [
  "Accra",
  "Kumasi",
  "Cape Coast",
  "Tamale",
  "Takoradi",
  "Ho",
  "Sunyani",
  "Koforidua",
  "Winneba",
  "Wa",
  "Bolgatanga",
  "Navrongo",
  "Tarkwa",
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
  Tamale: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 150 - 350/mo" },
      { item: "Food", amount: "GHS 280 - 480/mo" },
      { item: "Transport", amount: "GHS 60 - 150/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 70 - 130/mo" },
    ],
    neighborhoods: ["Dungu (near UDS Nyankpala route)", "Kalpohin", "Vittin", "Gumbihini", "Education Ridge"],
    moneyTips: ["One of Ghana's cheapest student cities", "Buy grains and staples at Aboabo Market", "Motorbike (okada) is the cheapest way around", "Share accommodation to cut rent further"],
    safetyTips: ["Wear a helmet if you use okada", "Dress modestly in respect of local customs", "Carry water — the harmattan and heat are intense", "Avoid unfamiliar routes after dark"],
    networkingTips: ["UDS has strong agriculture and development networks", "Volunteer with northern-focused NGOs", "Join the students' representative council", "Attend Tamale tech and youth hub events"],
  },
  Takoradi: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 250 - 550/mo" },
      { item: "Food", amount: "GHS 350 - 600/mo" },
      { item: "Transport", amount: "GHS 100 - 220/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 120/mo" },
      { item: "Miscellaneous", amount: "GHS 90 - 160/mo" },
    ],
    neighborhoods: ["Butumagyebu (near TTU)", "Effiakuma", "Anaji", "Kwesimintsim", "Fijai"],
    moneyTips: ["Oil-city prices are higher — budget weekly", "Market Circle has the best food prices", "Use shared taxis on fixed routes", "Look for part-time work in hospitality"],
    safetyTips: ["Keep valuables secure around Market Circle", "Be careful swimming at unpatrolled beaches", "Travel in groups at night", "Save your hostel's location offline"],
    networkingTips: ["Oil, gas and engineering employers recruit locally", "Attend Takoradi Technical University career fairs", "Connect with maritime and logistics professionals", "Join engineering student associations early"],
  },
  Ho: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 150 - 350/mo" },
      { item: "Food", amount: "GHS 280 - 480/mo" },
      { item: "Transport", amount: "GHS 60 - 150/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 70 - 130/mo" },
    ],
    neighborhoods: ["Ho Bankoe", "Dome (near HTU)", "Ahoe", "Housing Estate", "Sokode (near UHAS route)"],
    moneyTips: ["Very affordable town living", "Buy fresh produce at Ho Central Market", "Walking distance housing saves transport money", "Split data bundles with roommates"],
    safetyTips: ["Ho is calm and generally safe", "Be cautious on hilly roads at night", "Keep hostel doors locked", "Watch out during rainy-season flooding"],
    networkingTips: ["UHAS builds strong health-sector connections", "Join Volta Region youth and health networks", "Volunteer at district health facilities", "Attend HTU innovation events"],
  },
  Sunyani: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 150 - 380/mo" },
      { item: "Food", amount: "GHS 280 - 500/mo" },
      { item: "Transport", amount: "GHS 60 - 150/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 70 - 130/mo" },
    ],
    neighborhoods: ["Fiapre (near UENR)", "Area 4", "Penkwase", "New Dormaa", "Abesim"],
    moneyTips: ["Food is cheap in the Bono breadbasket", "Buy in bulk from Sunyani Market", "Shared taxis to Fiapre are inexpensive", "Avoid weekend impulse spending"],
    safetyTips: ["Quiet, low-crime city overall", "Use lit routes between Fiapre and town", "Keep phone secure in trotro stations", "Note the campus security number"],
    networkingTips: ["UENR is strong in energy and natural resources", "Connect with cocoa and agribusiness employers", "Join renewable-energy student clubs", "Attend regional agric fairs"],
  },
  Koforidua: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 180 - 420/mo" },
      { item: "Food", amount: "GHS 300 - 520/mo" },
      { item: "Transport", amount: "GHS 70 - 170/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 110/mo" },
      { item: "Miscellaneous", amount: "GHS 80 - 140/mo" },
    ],
    neighborhoods: ["Effiduase", "Adweso", "Zongo (budget)", "Oyoko (near AAMUSTED/KTU routes)", "Srodae"],
    moneyTips: ["Close to Accra without Accra prices", "Buy at the Thursday market for the best deals", "Share transport to Accra for weekend trips", "Track your mobile money spending"],
    safetyTips: ["Generally safe and walkable", "Care on the Accra–Koforidua road at night", "Secure laptops in shared hostels", "Watch for slippery roads in the rainy season"],
    networkingTips: ["KTU has active engineering and IT clubs", "Proximity to Accra makes internships easier", "Join Eastern Region youth business groups", "Attend Koforidua tech meetups"],
  },
  Winneba: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 160 - 380/mo" },
      { item: "Food", amount: "GHS 280 - 500/mo" },
      { item: "Transport", amount: "GHS 60 - 150/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 70 - 130/mo" },
    ],
    neighborhoods: ["North Campus area", "South Campus area", "Sir Charles Beach side", "Ateitu", "Gyahadze"],
    moneyTips: ["Small-town costs keep budgets low", "Fresh fish at the landing beach is cheap", "Walk or cycle between campuses", "Split cooking gas with housemates"],
    safetyTips: ["Be careful with strong sea currents", "Stay alert during Aboakyir festival crowds", "Use lit paths between campuses", "Lock rooms in shared compounds"],
    networkingTips: ["UEW is Ghana's education-training hub", "Join teaching practice networks early", "Connect with sports and creative-arts programmes", "Build relationships with mentor lecturers"],
  },
  Wa: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 130 - 320/mo" },
      { item: "Food", amount: "GHS 260 - 460/mo" },
      { item: "Transport", amount: "GHS 50 - 130/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 60 - 120/mo" },
    ],
    neighborhoods: ["Bamahu (near SDD-UBIDS)", "Kpaguri", "Dobile", "Konta", "Kambali"],
    moneyTips: ["Among the lowest living costs in Ghana", "Buy staples at Wa Central Market", "Bicycles are common and cheap", "Plan for higher travel costs to the south"],
    safetyTips: ["Prepare for extreme heat — hydrate", "Avoid long night journeys on rural roads", "Respect local customs and dress codes", "Keep emergency contacts saved offline"],
    networkingTips: ["SDD-UBIDS focuses on business and development", "Volunteer with Upper West NGOs", "Join entrepreneurship clubs", "Connect with district assembly internships"],
  },
  Bolgatanga: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 130 - 320/mo" },
      { item: "Food", amount: "GHS 260 - 460/mo" },
      { item: "Transport", amount: "GHS 50 - 130/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 60 - 120/mo" },
    ],
    neighborhoods: ["Sumbrungu", "Zaare", "Tanzui", "Yikene", "Bolga Central"],
    moneyTips: ["Low rents keep monthly costs down", "Bolga Market is great for cheap produce", "Crafts and basket weaving offer side income", "Share okada fares with classmates"],
    safetyTips: ["Hydrate and shield from the sun", "Be cautious travelling near border routes", "Use trusted okada riders", "Avoid isolated areas at night"],
    networkingTips: ["Strong development and NGO presence", "Join BTU student associations", "Volunteer on health and education projects", "Connect with regional artisan businesses"],
  },
  Tarkwa: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 200 - 480/mo" },
      { item: "Food", amount: "GHS 320 - 560/mo" },
      { item: "Transport", amount: "GHS 70 - 160/mo" },
      { item: "Data/Internet", amount: "GHS 60 - 120/mo" },
      { item: "Miscellaneous", amount: "GHS 80 - 160/mo" },
    ],
    neighborhoods: ["UMaT campus area", "Tarkwa Banso", "Cyanide", "New Atuabo", "Nsuaem road"],
    moneyTips: ["Mining town prices are higher than nearby towns — compare rents early", "Share taxis to campus with coursemates", "Buy produce at Tarkwa Market rather than campus shops", "Look out for paid mining vacation attachments"],
    safetyTips: ["Avoid galamsey/mining pits and unmarked sites", "Roads get slippery in the heavy rains — travel early", "Use registered taxis at night", "Follow lab and field safety rules strictly"],
    networkingTips: ["UMaT is Ghana's hub for mining and engineering", "Network with Goldfields and AngloGold engineers", "Join the student chapters of mining/geo societies", "Target internships with mining service companies"],
  },
  Navrongo: {
    budget: [
      { item: "Rent (shared room)", amount: "GHS 120 - 300/mo" },
      { item: "Food", amount: "GHS 250 - 450/mo" },
      { item: "Transport", amount: "GHS 50 - 120/mo" },
      { item: "Data/Internet", amount: "GHS 50 - 100/mo" },
      { item: "Miscellaneous", amount: "GHS 60 - 110/mo" },
    ],
    neighborhoods: ["Navrongo campus area (C.K. Tedam University)", "Manyoro road", "Wuru", "Pungu", "Doba road"],
    moneyTips: ["Very cheap student town", "Cook in groups to save on gas", "Buy in bulk before term starts", "Budget ahead for travel to Accra/Kumasi"],
    safetyTips: ["Heat and dust are the main hazards", "Travel in daylight on rural roads", "Keep devices dust-protected", "Save campus security contacts"],
    networkingTips: ["CKT-UTAS is strong in applied sciences", "Link with Navrongo Health Research Centre", "Join science and ICT student clubs", "Seek research assistant opportunities"],
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
          description="Cost of living and student life by city."
        />

        <div className="hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth flex gap-3 mb-7 md:flex-wrap md:justify-center md:overflow-visible md:mx-0 md:px-0">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className={`shrink-0 snap-start px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
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

            <div className="hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth flex gap-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:mx-0 md:px-0">
              {[
                { icon: Home, title: "Best Neighborhoods", items: data.neighborhoods },
                { icon: Wallet, title: "Money Management", items: data.moneyTips },
                { icon: Shield, title: "Safety Tips", items: data.safetyTips },
                { icon: Users, title: "Networking & Social", items: data.networkingTips },
              ].map(({ icon: Icon, title, items }) => (
                <div key={title} className="bg-glass rounded-xl p-5 shrink-0 w-[80vw] max-w-xs snap-start md:w-auto md:max-w-none md:shrink">
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
