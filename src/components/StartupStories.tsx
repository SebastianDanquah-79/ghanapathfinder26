import { motion } from "framer-motion";
import { Lightbulb, Rocket, ExternalLink, MapPin } from "lucide-react";
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
}

const stories: FounderStory[] = [
  {
    founders: "Patrick Awuah",
    company: "Ashesi University",
    place: "Ghana",
    year: "2002",
    story:
      "Awuah left a career as a Microsoft engineer in Seattle, returned to Ghana and used his own savings plus early donors to open Ashesi with a first class of 30 students in a rented house in Labone, Accra. The campus in Berekuso came later, funded as the university grew.",
    lesson:
      "You can start small and rented. Thirty students in a borrowed building became one of Africa's most respected universities.",
    source: "https://www.ashesi.edu.gh/about/our-story/",
    sourceLabel: "ashesi.edu.gh",
  },
  {
    founders: "Bright Simons",
    company: "mPedigree",
    place: "Ghana",
    year: "2007",
    story:
      "Simons was working on organic farming traceability when he realised the bigger killer was fake medicine. mPedigree put a scratch-off code on drug packs so any patient could text the code free of charge and get an instant genuine-or-fake reply — built on plain SMS because that was what people already had.",
    lesson:
      "Build on the technology your users already own. SMS beat a beautiful app because everyone had a phone that could text.",
    source: "https://mpedigree.com/",
    sourceLabel: "mpedigree.com",
  },
  {
    founders: "Shola Akinlade & Ezra Olubi",
    company: "Paystack",
    place: "Nigeria",
    year: "2015",
    story:
      "Two Nigerian developers who met at university built a payment API after watching local businesses struggle to accept cards online. They became the first Nigerian company accepted into Y Combinator, and in 2020 Stripe acquired Paystack in a deal reported at over $200 million.",
    lesson:
      "Solve the boring plumbing problem. Payments were unglamorous and everyone needed them.",
    source: "https://stripe.com/newsroom/news/stripe-paystack",
    sourceLabel: "stripe.com",
  },
  {
    founders: "Ham Serunjogi & Maijid Moujaled",
    company: "Chipper Cash",
    place: "Uganda / Ghana",
    year: "2018",
    story:
      "The two met as students at Grinnell College in the US — Ham from Uganda, Maijid from Ghana. Frustrated by how expensive and slow it was to send money home and across African borders, they moved to San Francisco and built a free cross-border transfer app, now used by millions across Africa.",
    lesson:
      "Your own frustration is market research. They built the product they personally needed every month.",
    source: "https://chippercash.com/about",
    sourceLabel: "chippercash.com",
  },
  {
    founders: "Odunayo Eweniyi, Somto Ifezue & Joshua Chibueze",
    company: "PiggyVest",
    place: "Nigeria",
    year: "2016",
    story:
      "The idea came from a tweet: a woman described saving money daily in a wooden piggy bank until she had enough to grow her business. The team — who had already built a jobs site together — turned that habit into an app, launching as Piggybank.ng with automated daily, weekly and monthly savings.",
    lesson:
      "Digitise a habit people already have instead of teaching them a brand new one.",
    source: "https://www.piggyvest.com/about",
    sourceLabel: "piggyvest.com",
  },
  {
    founders: "Rebecca Enonchong",
    company: "AppsTech",
    place: "Cameroon",
    year: "1999",
    story:
      "Enonchong founded AppsTech in Maryland with no outside funding, selling enterprise software services. It grew to serve clients in more than 50 countries, and she went on to become one of the most influential voices backing African tech hubs and founders.",
    lesson:
      "Bootstrapping is a strategy, not a consolation prize. She kept control by growing on revenue.",
    source: "https://www.appstechnologies.com/",
    sourceLabel: "appstechnologies.com",
  },
  {
    founders: "Melanie Perkins & Cliff Obrecht",
    company: "Canva",
    place: "Australia",
    year: "2013",
    story:
      "While teaching design software to students at university in Perth, Perkins saw how long it took people to learn the basics. She and Obrecht first built Fusion Books, an online school-yearbook designer, from her mother's living room. That business funded and proved the idea that became Canva after more than 100 investor rejections.",
    lesson:
      "A narrow first product can fund the big one. Yearbooks paid for the design tool the world now uses.",
    source: "https://www.canva.com/about/",
    sourceLabel: "canva.com",
  },
  {
    founders: "Brian Chesky & Joe Gebbia",
    company: "Airbnb",
    place: "United States",
    year: "2007",
    story:
      "Unable to make rent in San Francisco, the two roommates put three air mattresses on their living-room floor during a sold-out design conference and charged attendees for a bed and breakfast. Three guests paid. Nathan Blecharczyk joined and they later funded the company by selling novelty cereal boxes.",
    lesson:
      "Do the unscalable thing first. Three guests on air mattresses was the whole product test.",
    source: "https://news.airbnb.com/about-us/",
    sourceLabel: "airbnb.com",
  },
  {
    founders: "Jan Koum & Brian Acton",
    company: "WhatsApp",
    place: "United States / Ukraine",
    year: "2009",
    story:
      "Koum grew up in Ukraine and moved to California, where his family relied on food stamps. After both he and Acton were rejected for jobs at Facebook, they built a simple app for status updates that turned into a messenger. Facebook bought it in 2014 for about $19 billion.",
    lesson:
      "Rejection isn't a verdict. Both founders were turned down by the company that later paid billions for their app.",
    source: "https://about.meta.com/company-info/",
    sourceLabel: "about.meta.com",
  },
  {
    founders: "Sara Blakely",
    company: "Spanx",
    place: "United States",
    year: "2000",
    story:
      "Blakely was selling fax machines door to door when she cut the feet off a pair of tights to wear under white trousers. She spent $5,000 of her savings, wrote her own patent application to save legal fees, and personally cold-called hosiery mills until one agreed to make her prototype.",
    lesson:
      "Capital is not the first requirement. Persistence and one working prototype opened the doors.",
    source: "https://spanx.com/pages/about-us",
    sourceLabel: "spanx.com",
  },
  {
    founders: "Mitchell Elegbe",
    company: "Interswitch",
    place: "Nigeria",
    year: "2002",
    story:
      "An electrical engineer who once had a card rejected by a European ATM, Elegbe set out to build the switching infrastructure that lets Nigerian banks and cards talk to each other. Interswitch now processes a huge share of the country's electronic transactions and spun out the Verve card.",
    lesson:
      "Infrastructure is a business. Someone has to build the rails everyone else runs on.",
    source: "https://www.interswitchgroup.com/about-us",
    sourceLabel: "interswitchgroup.com",
  },
  {
    founders: "Fred Swaniker",
    company: "African Leadership Academy & ALU",
    place: "Ghana / Pan-African",
    year: "2008",
    story:
      "Born in Ghana and raised across four African countries, Swaniker started a school in Botswana at 18 when his mother asked him to run it. He later co-founded African Leadership Academy in Johannesburg to train the continent's next generation of leaders, then African Leadership University in Mauritius and Rwanda.",
    lesson:
      "Leadership experience counts before you feel ready. He was running a school as a teenager.",
    source: "https://www.africanleadershipacademy.org/about/",
    sourceLabel: "africanleadershipacademy.org",
  },
];

const StartupStories = () => (
  <section id="founders" className="py-12 lg:py-28 px-4">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        badge="Inspiration"
        title="Real Founder"
        highlight="Stories"
        description="How real companies started — each story links to its source."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((s, i) => (
          <motion.div
            key={s.company}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
            className="bg-glass rounded-xl p-5 card-hover group flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary/80 bg-primary/10 rounded-full px-2.5 py-1">
                {s.year}
              </span>
            </div>

            <h3 className="font-display font-semibold text-foreground text-lg leading-tight">
              {s.company}
            </h3>
            <p className="text-sm text-foreground/70 mt-1">{s.founders}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 mb-3">
              <MapPin className="h-3 w-3 shrink-0" />
              {s.place}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{s.story}</p>

            <div className="pt-4 mt-auto">
              <div className="flex items-start gap-2 pt-3 border-t border-border/50">
                <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-primary/80 italic">{s.lesson}</p>
              </div>
              <a
                href={s.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-3"
              >
                <ExternalLink className="h-3 w-3" />
                Source: {s.sourceLabel}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StartupStories;
