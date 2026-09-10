import { motion } from "framer-motion";
import { ExternalLink, Flame, MapPin } from "@/lib/icons";
import SectionHeader from "./SectionHeader";
import AdinkraFloatLayer from "./AdinkraFloatLayer";

interface FounderStory {
  founders: string;
  company: string;
  place: string;
  year: string;
  role: string;
  tag?: string;
  story: string;
  source?: string;
  sourceLabel?: string;
  founderPhotos: string[];
  logo: string;
}

const logo = (domain: string) => `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

const stories: FounderStory[] = [
  {
    founders: "Patrick Awuah",
    company: "Ashesi University",
    place: "Ghana",
    year: "2002",
    role: "Founder & President",
    tag: "Education",
    story: "Built an institution around ethical, entrepreneurial leadership in Africa, starting with a small first class and scaling through proof and persistence.",
    source: "https://ashesi.edu.gh/about/",
    sourceLabel: "ashesi.edu.gh",
    founderPhotos: ["https://commons.wikimedia.org/wiki/Special:Redirect/file/Patrick%20Awuah%20(Ashesi).jpg"],
    logo: logo("ashesi.edu.gh"),
  },
  {
    founders: "Bright Simons",
    company: "mPedigree",
    place: "Ghana",
    year: "2007",
    role: "Founder & CEO",
    tag: "HealthTech",
    story: "Recognised a traceability problem around counterfeit medicine and built verification technology around tools people already understood.",
    source: "https://mpedigree.com/",
    sourceLabel: "mpedigree.com",
    founderPhotos: ["https://commons.wikimedia.org/wiki/Special:Redirect/file/Bright%20Simons%20-%20TED%20Fellows%20Talk.jpg"],
    logo: logo("mpedigree.com"),
  },
  {
    founders: "Ham Serunjogi & Maijid Moujaled",
    company: "Chipper Cash",
    place: "Uganda / Pan-African",
    year: "2018",
    role: "Co-founders & CEO",
    tag: "FinTech",
    story: "Started from the friction of moving money across African borders and built a financial platform around a problem they understood personally.",
    source: "https://www.chippercash.com/leadership-team-member/ham-serunjogi",
    sourceLabel: "chippercash.com",
    founderPhotos: ["https://i0.wp.com/kikubolane.com/wp-content/uploads/2021/10/Serunjogi-and-Moujaled-Chipper-Cash-Founder-1536x1536-1.jpg?resize=780%2C780&ssl=1"],
    logo: logo("chippercash.com"),
  },
  {
    founders: "Drew Durbin & Lincoln Quirk",
    company: "Wave",
    place: "Senegal / Pan-African",
    year: "2018",
    role: "Co-founders & CEO",
    tag: "FinTech",
    story: "Turned lessons from cross-border transfers into a lower-cost domestic payments network designed around everyday African customers.",
    source: "https://www.wave.com/en/about/",
    sourceLabel: "wave.com",
    founderPhotos: ["https://www.wave.com/img/exec-team/drew-headshot_hu26e580986edb815a810b42dc2193d8ab_653879_400x400_resize_q75_box.b26520ddeabfae69be32b04f93792e0e74838aa20d1b6d6fd1b5828df4e801e6.jpg"],
    logo: logo("wave.com"),
  },
  {
    founders: "Jesse Moore",
    company: "M-KOPA",
    place: "Kenya / Pan-African",
    year: "2010",
    role: "Co-founder & CEO",
    tag: "Clean Energy",
    story: "Combined connected hardware, digital payments and financing so customers could access useful technology without paying the full cost upfront.",
    source: "https://www.m-kopa.com/about",
    sourceLabel: "m-kopa.com",
    founderPhotos: ["https://cdn.prod.website-files.com/66dcaf74c5e6c9bbd1890ab1/66e2e657e9c76c635ea5575d_Jesse%20Moore%20headshot.jpg"],
    logo: logo("m-kopa.com"),
  },
  {
    founders: "Jeremy Johnson & founding team",
    company: "Andela",
    place: "Nigeria / Pan-African",
    year: "2014",
    role: "Co-founder",
    tag: "Tech Education",
    story: "Built a bridge between African software talent and global companies, showing that talent can become infrastructure when opportunity is distributed differently.",
    source: "https://www.andela.com/about",
    sourceLabel: "andela.com",
    founderPhotos: ["https://weetracker.com/wp-content/uploads/2024/01/Jeremy-Johnson-CEO-and-co-founder-of-Andela.jpg"],
    logo: logo("andela.com"),
  },
  {
    founders: "Shola Akinlade & Ezra Olubi",
    company: "Paystack",
    place: "Nigeria",
    year: "2015",
    role: "Co-founders",
    tag: "FinTech",
    story: "Built payment infrastructure that made online payments easier for African businesses to integrate and operate.",
    source: "https://paystack.com/gh/about",
    sourceLabel: "paystack.com",
    founderPhotos: ["https://empowerafrica.com/wp-content/uploads/sites/2/2023/05/9-8.jpg"],
    logo: logo("paystack.com"),
  },
  {
    founders: "Alloysius Attah & Emmanuel O. Addai",
    company: "Farmerline",
    place: "Ghana / Pan-African",
    year: "2013",
    role: "Co-founders",
    tag: "AgriTech",
    story: "Started close to the farmer and used technology to improve access to information, inputs, finance and markets across agricultural communities.",
    source: "https://farmerline.co/our-story/",
    sourceLabel: "farmerline.co",
    founderPhotos: [
      "https://assets.weforum.org/author/image/DkFf8VlFk_B1Smu_guE_1VgNvIybhPiO1LoxfTZEqX8.jpg",
      "https://img.youtube.com/vi/kSKOq-o_WjQ/hqdefault.jpg",
    ],
    logo: logo("farmerline.co"),
  },
  {
    founders: "Alex Bram & founding team",
    company: "Hubtel",
    place: "Ghana",
    year: "2005",
    role: "Co-founder & CEO",
    tag: "Connectivity",
    story: "Started with business messaging as SMSGH and expanded into payments and commerce by continuing to follow the needs of Ghanaian customers.",
    source: "https://news.hubtel.com/smsgh-rebranded-hubtel/",
    sourceLabel: "hubtel.com",
    founderPhotos: ["https://img1.wsimg.com/isteam/ip/9861afbc-87cb-4793-b81d-c1efdd5f7ee7/Alex%20-%202020%20-%201%20copy.jpg"],
    logo: logo("hubtel.com"),
  },
  {
    founders: "Gregory Rockson",
    company: "mPharma",
    place: "Ghana / Pan-African",
    year: "2013",
    role: "Co-founder & CEO",
    tag: "HealthTech",
    story: "Tackled a difficult healthcare supply-chain problem by building technology and operating systems around reliable access to medicines.",
    source: "https://mpharma.com/our-vision/",
    sourceLabel: "mpharma.com",
    founderPhotos: ["https://assets.weforum.org/sf_account/image/responsive_small_PUtQWZHXz8D3osdop9TuV4DWjx2buRqF_jcu_SglcwE.jpg"],
    logo: logo("mpharma.com"),
  },
  {
    founders: "Desmond Koney & founding team",
    company: "Complete Farmer",
    place: "Ghana / West Africa",
    year: "2017",
    role: "Co-founder & CEO",
    tag: "AgriTech",
    story: "Turned firsthand farming experience into a digital agriculture platform connecting growers, buyers and the infrastructure needed to move crops into larger markets.",
    source: "https://www.completefarmer.com/about",
    sourceLabel: "completefarmer.com",
    founderPhotos: ["https://images.squarespace-cdn.com/content/v1/561e4503e4b093c102b5fdb5/3165f121-73ff-487f-95e7-99dc0218056e/CompleteFarmer%2B1%2B-%2BDesmond%2BKoney.png"],
    logo: logo("completefarmer.com"),
  },
  {
    founders: "Jesse Ghansah & Barima Effah",
    company: "Float",
    place: "Ghana / Africa",
    year: "2019",
    role: "Co-founders",
    tag: "FinTech",
    story: "Built financial software around a practical SME problem: managing cash flow, payments and access to working capital without unnecessary complexity.",
    source: "https://www.float.africa/",
    sourceLabel: "float.africa",
    founderPhotos: ["https://eu-images.contentstack.com/v3/assets/blta47798dd33129a0c/blt6121c8495ae822fc/66d22738eaf374419b7ce483/776861-4791.jpg?auto=webp&disable=upscale&format=jpg&quality=80&width=1280"],
    logo: logo("float.africa"),
  },
  {
    founders: "Isaac Sesi",
    company: "Sesi Technologies",
    place: "Ghana / Africa",
    year: "2018",
    role: "Founder & CEO",
    tag: "AgriTech Hardware",
    story: "Turned engineering research into practical agricultural technology, showing how a student-built technical solution can become a real African company.",
    source: "https://sesitechnologies.com/about-us/",
    sourceLabel: "sesitechnologies.com",
    founderPhotos: ["https://africaprize.raeng.org.uk/media/x3mbtecp/2020-isaac-sesi-ghana-headshot-portrait.jpeg"],
    logo: logo("sesitechnologies.com"),
  },
  {
    founders: "Olugbenga Agboola",
    company: "Flutterwave",
    place: "Nigeria / Pan-African",
    year: "2016",
    role: "Founder & CEO",
    tag: "FinTech",
    story: "Built payment infrastructure for businesses operating across fragmented African markets and expanded it into a major pan-African technology company.",
    source: "https://flutterwave.com/us/press-kit?section=people",
    sourceLabel: "flutterwave.com",
    founderPhotos: ["https://rave-services.myflutterwave.com/v1/services/filestack/download/FD6tGKsTK60zI2Hht8uw?resize=1&width=600"],
    logo: logo("flutterwave.com"),
  },
  {
    founders: "Fred Swaniker",
    company: "ALX",
    place: "Ghana / Pan-African",
    year: "2017",
    role: "Founder & CEO",
    tag: "Talent & Education",
    story: "Built a continent-wide talent ecosystem around practical digital skills, leadership and access to work, with a strong emphasis on African builders.",
    source: "https://www.alxafrica.com/leadership/",
    sourceLabel: "alxafrica.com",
    founderPhotos: ["https://www.mckinsey.com/~/media/mckinsey/featured%20insights/middle%20east%20and%20africa/leadership%20lessons%20from%20africas%20trailblazers/fred-swaniker-headshot-868.jpg?cpy=Center&cq=50&mw=767"],
    logo: logo("alxafrica.com"),
  },
  {
    founders: "Sam Moorhouse & Riyanat",
    company: "Turntabl",
    place: "Ghana / UK",
    year: "2019",
    role: "Co-founders",
    tag: "Software Engineering",
    story: "Started by training software engineers in Ghana and grew into an engineering company serving global clients while keeping talent development at its core.",
    source: "https://turntabl.io/company",
    sourceLabel: "turntabl.io",
    founderPhotos: ["https://pbs.twimg.com/media/G0aBPQuXkAA-Otn.jpg"],
    logo: logo("turntabl.io"),
  },
  {
    founders: "Zhou Yahui & Opera team",
    company: "OPay",
    place: "Nigeria / Africa",
    year: "2018",
    role: "Founder / Opera-backed team",
    tag: "FinTech",
    story: "Built a large-scale mobile payments platform around everyday financial services and expanded from Nigeria into a broader emerging-markets fintech business.",
    source: "https://techcrunch.com/2019/07/09/opera-founded-starup-opay-raises-50m-for-mobile-finance-in-nigeria/",
    sourceLabel: "TechCrunch",
    founderPhotos: ["https://p6.itc.cn/images01/20210115/9dee5f36450e44f7b3aafb89cbdcb367.jpeg"],
    logo: logo("opayweb.com"),
  },
  {
    founders: "Patricia Obo-Nai",
    company: "Telecel Ghana",
    place: "Ghana",
    year: "2024",
    role: "Chief Executive Officer",
    tag: "Telecom",
    story: "Leads Telecel Ghana as the company continues the transition from Vodafone Ghana and expands connectivity, digital services and financial inclusion in Ghana.",
    source: "https://telecel.com.gh/explore-telecel/executive-team/",
    sourceLabel: "telecel.com.gh",
    founderPhotos: ["https://www.newsghana.com.gh/wp-content/uploads/2020/11/madam-patricia-obo-nai-chief-executive-officer--696x605.jpg"],
    logo: logo("telecel.com.gh"),
  },
];

const StartupStories = () => (
  <section id="founders" className="py-12 lg:py-24 px-4">
    <AdinkraFloatLayer />
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        badge="African founders"
        title="Meet the people building"
        highlight="Africa's future"
        description="Real companies, real founders and practical lessons from startups and African technology builders, with a strong focus on Ghana."
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
        <Flame className="h-3.5 w-3.5 text-primary" />
        <span>Stories are selected for what students can learn from the journey.</span>
      </div>

      <div className="flex hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
        {stories.map((s, i) => (
          <motion.article
            key={s.company}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 5) * 0.05, duration: 0.3 }}
            className="min-w-[16.5rem] md:min-w-0 bg-background border border-border/70 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-2.5 h-9 mb-3">
              <div className="w-8 h-8 rounded-md bg-white border border-border/60 p-1.5 flex items-center justify-center shrink-0">
                <img src={s.logo} alt={`${s.company} logo`} loading="lazy" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-semibold text-sm text-foreground truncate">{s.company}</span>
            </div>

            <div className={`mb-3 grid gap-2 ${s.founderPhotos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {s.founderPhotos.map((photo, photoIndex) => (
                <div key={`${s.company}-${photoIndex}`} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo}
                    alt={`${s.founders}, ${s.company}${s.founderPhotos.length > 1 ? `, founder photo ${photoIndex + 1}` : ""}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>

            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground text-sm leading-tight">{s.founders}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{s.role}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{s.place}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 line-clamp-3">{s.story}</p>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border/60">
              {s.tag ? <span className="inline-flex rounded-full bg-primary/10 text-primary px-2 py-1 text-[9px] font-semibold">{s.tag}</span> : <span />}
              <span className="text-[10px] text-muted-foreground">{s.year}</span>
            </div>

            {s.source && (
              <a href={s.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-2">
                <ExternalLink className="h-3 w-3" />
                {s.sourceLabel}
              </a>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default StartupStories;
