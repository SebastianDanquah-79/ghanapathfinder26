import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Building, DollarSign, Globe, Search, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const popularMajors = [
  "Computer Science",
  "Medicine",
  "Engineering",
  "Business",
  "Law",
  "Nursing",
  "Accounting",
  "Architecture",
  "Pharmacy",
  "Agriculture",
  "Education",
  "Economics",
  "Marketing",
  "Psychology",
  "Journalism & Media",
  "Hospitality & Tourism",
  "Data Science & Statistics",
  "Banking & Finance",
  "Public Health",
  "Human Resource Management",
  "Environmental Science",
  "Fashion & Creative Arts",
];


interface CareerData {
  major: string;
  roles: string[];
  companies: string[];
  salary: string;
  remote: string;
  linkedinTip: string;
}

const mockCareerData: Record<string, CareerData> = {
  "Computer Science": {
    major: "Computer Science",
    roles: ["Software Developer", "Data Analyst", "IT Consultant", "Cybersecurity Specialist", "Mobile App Developer"],
    companies: ["MTN Ghana", "Vodafone Ghana", "Hubtel", "Turntabl", "Andela Ghana"],
    salary: "GHS 2,500 - 12,000/month",
    remote: "High remote potential — many international companies hire Ghanaian devs. Check Andela, Toptal, and Turing.",
    linkedinTip: "Use keywords: 'Software Developer Ghana', 'Junior Developer Accra'. Join 'Tech in Ghana' groups.",
  },
  "Medicine": {
    major: "Medicine",
    roles: ["Medical Officer", "Specialist Doctor", "Public Health Officer", "Medical Researcher", "Hospital Administrator"],
    companies: ["Korle Bu Teaching Hospital", "Komfo Anokye", "Ridge Hospital", "37 Military Hospital", "Nyaho Medical Centre"],
    salary: "GHS 4,000 - 18,000/month",
    remote: "Limited remote, but telemedicine is growing. Consider WHO and NGO opportunities for international work.",
    linkedinTip: "Follow Ghana Health Service, WHO Ghana. Use: 'Medical Officer Ghana', 'Public Health Specialist'.",
  },
  "Engineering": {
    major: "Engineering",
    roles: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Project Manager", "Quality Assurance Engineer"],
    companies: ["Ghana Highway Authority", "Jospong Group", "McDan Group", "SinoHydro Ghana", "AECOM Ghana"],
    salary: "GHS 3,000 - 10,000/month",
    remote: "Project-based international opportunities available. Mining companies offer competitive packages.",
    linkedinTip: "Search: 'Graduate Engineer Ghana', 'Engineering Internship Accra'. Follow Ghana Institution of Engineers.",
  },
  "Business": {
    major: "Business",
    roles: ["Business Development Officer", "Operations Manager", "Supply Chain Analyst", "Management Trainee", "Entrepreneur"],
    companies: ["Unilever Ghana", "Guinness Ghana", "Melcom", "Jumia Ghana", "Kasapreko"],
    salary: "GHS 2,000 - 9,000/month",
    remote: "Hybrid roles common in sales, e-commerce and consulting.",
    linkedinTip: "Search: 'Management Trainee Ghana', 'Business Development Accra'. Follow major FMCG employers.",
  },
  "Law": {
    major: "Law",
    roles: ["Legal Practitioner", "Corporate Counsel", "Compliance Officer", "Legal Researcher", "State Attorney"],
    companies: ["Bentsi-Enchill Letsa & Ankomah", "AB & David Africa", "ENSafrica Ghana", "Attorney-General's Department", "Bank of Ghana"],
    salary: "GHS 3,000 - 15,000/month",
    remote: "Mostly in-person; compliance and contract review roles can be remote.",
    linkedinTip: "Search: 'Legal Officer Ghana', 'Compliance Accra'. Follow the Ghana Bar Association.",
  },
  "Nursing": {
    major: "Nursing",
    roles: ["Registered General Nurse", "Midwife", "Public Health Nurse", "ICU Nurse", "Nurse Educator"],
    companies: ["Ghana Health Service", "Korle Bu Teaching Hospital", "Komfo Anokye", "Nyaho Medical Centre", "CHAG facilities"],
    salary: "GHS 2,200 - 6,500/month",
    remote: "Clinical work is on-site; UK, Canada and Gulf recruitment for Ghanaian nurses is strong.",
    linkedinTip: "Search: 'Registered Nurse Ghana', 'Midwife vacancy'. Follow Ghana Registered Nurses & Midwives Association.",
  },
  "Accounting": {
    major: "Accounting",
    roles: ["Audit Associate", "Tax Consultant", "Financial Accountant", "Internal Auditor", "Finance Manager"],
    companies: ["PwC Ghana", "Deloitte Ghana", "KPMG Ghana", "EY Ghana", "Ghana Revenue Authority"],
    salary: "GHS 2,500 - 12,000/month",
    remote: "Bookkeeping and outsourced finance roles increasingly remote.",
    linkedinTip: "Search: 'Audit Associate Ghana', 'Accountant Accra'. Pursue ICAG/ACCA and say so on your profile.",
  },
  "Architecture": {
    major: "Architecture",
    roles: ["Architectural Assistant", "Project Architect", "Urban Designer", "BIM Coordinator", "Interior Designer"],
    companies: ["ACP Architects", "Mobius Architecture", "Devtraco", "Goldkey Properties", "Architectural & Engineering Services Ltd"],
    salary: "GHS 2,500 - 9,000/month",
    remote: "Design and BIM work supports remote collaboration with foreign studios.",
    linkedinTip: "Post a portfolio. Search: 'Architectural Assistant Ghana'. Follow the Ghana Institute of Architects.",
  },
  "Pharmacy": {
    major: "Pharmacy",
    roles: ["Community Pharmacist", "Hospital Pharmacist", "Regulatory Affairs Officer", "Medical Sales Representative", "Quality Control Analyst"],
    companies: ["Ernest Chemists", "Kinapharma", "Danadams Pharmaceuticals", "Food and Drugs Authority", "Ghana Health Service"],
    salary: "GHS 3,500 - 11,000/month",
    remote: "Mostly on-site; regulatory and pharmacovigilance roles can be hybrid.",
    linkedinTip: "Search: 'Pharmacist Ghana', 'Regulatory Affairs Accra'. Follow the Pharmaceutical Society of Ghana.",
  },
  "Agriculture": {
    major: "Agriculture",
    roles: ["Agronomist", "Agribusiness Officer", "Extension Officer", "Farm Manager", "Value Chain Specialist"],
    companies: ["COCOBOD", "Ministry of Food and Agriculture", "Wienco Ghana", "Yara Ghana", "Blue Skies"],
    salary: "GHS 2,000 - 8,000/month",
    remote: "Field-based, but agri-data and advisory roles offer hybrid options.",
    linkedinTip: "Search: 'Agronomist Ghana', 'Agribusiness Officer'. Follow AGRA and MoFA.",
  },
  "Education": {
    major: "Education",
    roles: ["Teacher", "Curriculum Developer", "Education Officer", "School Administrator", "EdTech Content Creator"],
    companies: ["Ghana Education Service", "Tema International School", "Galaxy International School", "NaCCA", "Rising Academies"],
    salary: "GHS 1,800 - 6,500/month",
    remote: "Online tutoring and EdTech content roles are growing fast.",
    linkedinTip: "Search: 'Teacher Ghana', 'Curriculum Developer'. Showcase lesson materials on your profile.",
  },
  "Economics": {
    major: "Economics",
    roles: ["Economic Analyst", "Research Officer", "Policy Analyst", "Risk Analyst", "Development Consultant"],
    companies: ["Bank of Ghana", "Ministry of Finance", "IMANI Ghana", "World Bank Ghana", "Databank"],
    salary: "GHS 3,000 - 12,000/month",
    remote: "Research and consulting roles often hybrid or fully remote.",
    linkedinTip: "Search: 'Economic Analyst Ghana', 'Research Officer'. Publish short data write-ups.",
  },
  "Marketing": {
    major: "Marketing",
    roles: ["Digital Marketing Executive", "Brand Manager", "Social Media Manager", "Market Research Analyst", "Sales Executive"],
    companies: ["MTN Ghana", "Unilever Ghana", "Origin8", "Jumia Ghana", "Guinness Ghana"],
    salary: "GHS 2,000 - 9,000/month",
    remote: "Very high — digital marketing is one of the easiest remote entries.",
    linkedinTip: "Search: 'Digital Marketing Ghana'. Get Google/Meta certifications and show campaign results.",
  },
  "Psychology": {
    major: "Psychology",
    roles: ["Clinical Psychologist", "Counsellor", "HR Officer", "Behavioural Researcher", "School Counsellor"],
    companies: ["Accra Psychiatric Hospital", "Ghana Health Service", "Pioneer Health", "NGOs and schools", "Corporate HR teams"],
    salary: "GHS 2,000 - 8,000/month",
    remote: "Teletherapy and research roles increasingly remote.",
    linkedinTip: "Search: 'Counsellor Ghana', 'HR Officer Accra'. Note supervised practice hours.",
  },
  "Journalism & Media": {
    major: "Journalism & Media",
    roles: ["Reporter", "Content Producer", "Communications Officer", "Video Editor", "Social Media Journalist"],
    companies: ["Multimedia Group", "Citi FM/Citi TV", "Graphic Communications", "GBC", "JoyNews"],
    salary: "GHS 1,800 - 7,000/month",
    remote: "Freelance writing, editing and content production travel well internationally.",
    linkedinTip: "Link published work. Search: 'Content Producer Ghana', 'Communications Officer'.",
  },
  "Hospitality & Tourism": {
    major: "Hospitality & Tourism",
    roles: ["Hotel Operations Trainee", "Events Manager", "Tour Consultant", "Guest Relations Officer", "Food & Beverage Supervisor"],
    companies: ["Kempinski Gold Coast", "Labadi Beach Hotel", "Movenpick Ambassador", "Ghana Tourism Authority", "Tour operators"],
    salary: "GHS 1,800 - 7,000/month",
    remote: "On-site by nature; travel planning and sales roles can be remote.",
    linkedinTip: "Search: 'Hospitality Ghana', 'Events Coordinator Accra'. Highlight languages you speak.",
  },
  "Data Science & Statistics": {
    major: "Data Science & Statistics",
    roles: ["Data Analyst", "Data Scientist", "Business Intelligence Analyst", "Monitoring & Evaluation Officer", "Statistician"],
    companies: ["Ghana Statistical Service", "MTN Ghana", "Stanbic Bank", "Zeepay", "World Bank / UN agencies"],
    salary: "GHS 3,000 - 15,000/month",
    remote: "Very high — global remote demand for analysts and data engineers.",
    linkedinTip: "Show SQL/Python projects. Search: 'Data Analyst Ghana', 'M&E Officer'.",
  },
  "Banking & Finance": {
    major: "Banking & Finance",
    roles: ["Relationship Officer", "Credit Analyst", "Treasury Analyst", "Investment Analyst", "Risk Officer"],
    companies: ["GCB Bank", "Ecobank Ghana", "Stanbic Bank", "Absa Ghana", "Databank"],
    salary: "GHS 2,500 - 12,000/month",
    remote: "Mostly on-site; fintech roles offer hybrid arrangements.",
    linkedinTip: "Search: 'Graduate Trainee Bank Ghana', 'Credit Analyst'. Mention CFA/ACCA progress.",
  },
  "Public Health": {
    major: "Public Health",
    roles: ["Public Health Officer", "Epidemiologist", "Health Programme Coordinator", "M&E Specialist", "Health Promotion Officer"],
    companies: ["Ghana Health Service", "WHO Ghana", "UNICEF Ghana", "Noguchi Memorial Institute", "PATH / JHPIEGO"],
    salary: "GHS 2,500 - 10,000/month",
    remote: "Hybrid common in programme management and data roles.",
    linkedinTip: "Search: 'Public Health Officer Ghana', 'M&E Specialist'. Follow WHO and UNICEF Ghana.",
  },
  "Human Resource Management": {
    major: "Human Resource Management",
    roles: ["HR Officer", "Recruitment Specialist", "Learning & Development Officer", "Payroll Administrator", "HR Business Partner"],
    companies: ["MTN Ghana", "Newmont Ghana", "Tullow Ghana", "Ecobank Ghana", "Nestlé Ghana"],
    salary: "GHS 2,200 - 10,000/month",
    remote: "Recruitment and HR operations roles are often hybrid.",
    linkedinTip: "Search: 'HR Officer Ghana', 'Recruiter Accra'. Mention CIHRM Ghana membership.",
  },
  "Environmental Science": {
    major: "Environmental Science",
    roles: ["Environmental Officer", "EIA Consultant", "Sustainability Analyst", "Water Quality Officer", "Climate Programme Officer"],
    companies: ["Environmental Protection Agency", "Newmont Ghana", "Water Resources Commission", "SGS Ghana", "Conservation NGOs"],
    salary: "GHS 2,500 - 9,000/month",
    remote: "Field plus office; ESG reporting roles can be remote.",
    linkedinTip: "Search: 'Environmental Officer Ghana', 'Sustainability Analyst'. Highlight GIS skills.",
  },
  "Fashion & Creative Arts": {
    major: "Fashion & Creative Arts",
    roles: ["Fashion Designer", "Graphic Designer", "Product Photographer", "Creative Director", "Textile Entrepreneur"],
    companies: ["Christie Brown", "Studio 189", "Chocolate Clothing", "Ad agencies (Origin8, Global Media Alliance)", "Own label"],
    salary: "GHS 1,500 - 10,000/month",
    remote: "Design and digital creative work sells well online and abroad.",
    linkedinTip: "Portfolio first — Behance/Instagram links. Search: 'Graphic Designer Ghana'.",
  },
};


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
