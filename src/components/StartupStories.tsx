import { motion } from "framer-motion";
import { Lightbulb, Rocket, ExternalLink, MapPin } from "@/lib/icons";
import SectionHeader from "./SectionHeader";

interface FounderStory {
  founders: string;
  company: string;
  place: string;
  year: string;
  story: string;
  lesson: string;
  source: string;
  sourceLabel: string;
  founderPhoto: string;
  logo: string;
}

const stories: FounderStory[] = [
  {
    founders: "Ham Serunjogi & Maijid Moujaled",
    company: "Chipper Cash",
    place: "Uganda / Ghana",
    year: "2018",
    story: "The founders started Chipper after experiencing how expensive and difficult cross-border money movement could be for Africans. They built a product around a problem they personally understood and grew it into a major African fintech.",
    lesson: "Your own frustration can be market research. Start with a problem you understand deeply.",
    source: "https://www.chippercash.com/leadership-team-member/ham-serunjogi",
    sourceLabel: "chippercash.com",
    founderPhoto: "https://cdn.prod.website-files.com/63c81b0c3ad92959b9062d4b/63c81b0c3ad92998ba062d77_ham.png",
    logo: "https://www.chippercash.com/favicon.ico",
  },
  {
    founders: "Olugbenga 'GB' Agboola",
    company: "Flutterwave",
    place: "Nigeria / Pan-African",
    year: "2016",
    story: "Agboola and a team of finance and technology veterans built payment infrastructure to make it easier for businesses to accept and move money across Africa. The company started by solving difficult payment integration problems for businesses and expanded from there.",
    lesson: "Infrastructure can become the foundation for thousands of other businesses.",
    source: "https://flutterwave.com/us/blog/keep-going",
    sourceLabel: "flutterwave.com",
    founderPhoto: "https://v12.flutterwave.com/wp-content/uploads/2020/06/Olugbenga-Agboola-the-New-Flutterwave-CEO-TechCabal-1.jpg",
    logo: "https://flutterwave.com/favicon.ico",
  },
  {
    founders: "Drew Durbin & Lincoln Quirk",
    company: "Wave",
    place: "Senegal / Pan-African",
    year: "2018",
    story: "The co-founders first built Sendwave to solve expensive international transfers to Africa. They then turned their attention to domestic payments, creating Wave around the mission of making digital finance dramatically more affordable.",
    lesson: "A second company can grow from a deeper problem discovered while solving the first one.",
    source: "https://www.wave.com/en/about/",
    sourceLabel: "wave.com",
    founderPhoto: "https://www.wave.com/img/exec-team/drew-headshot_hu26e580986edb815a810b42dc2193d8ab_653879_400x400_resize_q75_box.b26520ddeabfae69be32b04f93792e0e74838aa20d1b6d6fd1b5828df4e801e6.jpg",
    logo: "https://www.wave.com/favicon.ico",
  },
  {
    founders: "Jesse Moore & M-KOPA founding team",
    company: "M-KOPA",
    place: "Kenya / Ghana / Pan-African",
    year: "2010",
    story: "M-KOPA started from a simple infrastructure insight: combine digital micropayments with connected devices so people could access products they could not afford upfront. The company later expanded into smartphones and digital financial services across several African markets, including Ghana.",
    lesson: "Hardware, software, data and distribution can combine into a powerful African business model.",
    source: "https://www.m-kopa.com/about",
    sourceLabel: "m-kopa.com",
    founderPhoto: "https://cdn.prod.website-files.com/66dcaf74c5e6c9bbd1890ab1/66e2e657e9c76c635ea5575d_Jesse%20Moore%20headshot.jpg",
    logo: "https://www.m-kopa.com/favicon.ico",
  },
  {
    founders: "Jeremy Johnson, Iyinoluwa Aboyeji & founding team",
    company: "Andela",
    place: "Nigeria / Pan-African",
    year: "2014",
    story: "Andela began in Lagos with a simple premise: brilliant people exist everywhere, but opportunity is not distributed equally. The founding team built a talent model around training African technologists and connecting them with global companies.",
    lesson: "Talent is an infrastructure problem too. Build the bridge between ability and opportunity.",
    source: "https://www.andela.com/about",
    sourceLabel: "andela.com",
    founderPhoto: "https://cdn.prod.website-files.com/68d70d46269e8933e5f35eee/697dc536de00430cfdd68016_Timg1.png",
    logo: "https://www.andela.com/favicon.ico",
  },
  {
    founders: "Shola Akinlade & Ezra Olubi",
    company: "Paystack",
    place: "Nigeria",
    year: "2015",
    story: "Two Nigerian developers built payment infrastructure after seeing local businesses struggle to accept payments online. Their product focused on making the difficult plumbing of online payments easier for businesses to integrate.",
    lesson: "The unglamorous infrastructure underneath a market can be one of its biggest opportunities.",
    source: "https://stripe.com/newsroom/news/stripe-paystack",
    sourceLabel: "stripe.com",
    founderPhoto: "https://www.paystack.com/favicon.ico",
    logo: "https://paystack.com/favicon.ico",
  },
  {
    founders: "Bright Simons",
    company: "mPedigree",
    place: "Ghana",
    year: "2007",
    story: "Simons worked on traceability and recognised a much bigger problem in counterfeit medicine. mPedigree used simple verification technology so people could check medicine authenticity using tools they already had.",
    lesson: "The best technology is sometimes the technology your users already know how to use.",
    source: "https://mpedigree.com/",
    sourceLabel: "mpedigree.com",
    founderPhoto: "https://mpedigree.com/favicon.ico",
    logo: "https://mpedigree.com/favicon.ico",
  },
  {
    founders: "Patrick Awuah",
    company: "Ashesi University",
    place: "Ghana",
    year: "2002",
    story: "Awuah left a career as a Microsoft engineer and returned to Ghana to build an institution focused on developing ethical, entrepreneurial leaders. Ashesi started small and grew into a globally recognised African university.",
    lesson: "A serious institution can begin with a small first cohort. Scale can come after proof.",
    source: "https://www.ashesi.edu.gh/about/our-story/",
    sourceLabel: "ashesi.edu.gh",
    founderPhoto: "https://www.ashesi.edu.gh/favicon.ico",
    logo: "https://www.ashesi.edu.gh/favicon.ico",
  },
];

const StartupStories = () => (
  <section id="founders" className="py-12 lg:py-28 px-4">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        badge="African inspiration"
        title="The people behind"
        highlight="African companies"
        description="Real founders, real companies and the problems they chose to solve. Founder photos and company marks are sourced from the companies' own websites."
      />

      <div className="flex hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth [&>*]:w-[19rem] [&>*]:shrink-0 [&>*]:snap-start md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:mx-0 md:px-0 md:[&>*]:w-auto gap-5">
        {stories.map((s, i) => (
          <motion.article
            key={s.company}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
            className="bg-glass rounded-xl overflow-hidden card-hover group flex flex-col"
          >
            <div className="relative h-44 bg-muted overflow-hidden">
              <img src={s.founderPhoto} alt={`${s.founders} of ${s.company}`} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute left-4 bottom-4 flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-white p-1.5 shadow-sm flex items-center justify-center">
                  <img src={s.logo} alt={`${s.company} logo`} loading="lazy" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-medium text-white bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1">{s.year}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display font-semibold text-foreground text-lg leading-tight">{s.company}</h3>
              <p className="text-sm text-foreground/70 mt-1">{s.founders}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 mb-3"><MapPin className="h-3 w-3 shrink-0" />{s.place}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.story}</p>

              <div className="pt-4 mt-auto">
                <div className="flex items-start gap-2 pt-3 border-t border-border/50">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary/80 italic">{s.lesson}</p>
                </div>
                <a href={s.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-3">
                  <ExternalLink className="h-3 w-3" /> Source: {s.sourceLabel}
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default StartupStories;
