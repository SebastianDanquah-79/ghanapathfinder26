export interface JourneyInput {
  fullName?: string | null;
  targetCareer?: string | null;
  school?: string | null;
  region?: string | null;
  interests?: string[];
  onboarded?: boolean;
  resultsCount: number;
  aggregate: number | null;
  savedUniversities: number;
  savedScholarships: number;
  savedCareers: number;
  checklistTotal: number;
  checklistDone: number;
  deadlines: number;
}

export interface Milestone {
  key: string;
  label: string;
  done: boolean;
  hint: string;
  href: string;
}

export const buildMilestones = (d: JourneyInput): Milestone[] => [
  {
    key: "profile",
    label: "Complete your profile",
    done: !!(d.fullName && d.school && d.region),
    hint: "Tell us your school and region so recommendations fit you.",
    href: "/onboarding",
  },
  {
    key: "career",
    label: "Set a career goal",
    done: !!d.targetCareer,
    hint: "Pick a target career to unlock matched programmes.",
    href: "/onboarding",
  },
  {
    key: "results",
    label: "Add your WASSCE results",
    done: d.resultsCount >= 6,
    hint: "Add at least six subjects to calculate your aggregate.",
    href: "/onboarding",
  },
  {
    key: "university",
    label: "Save a university",
    done: d.savedUniversities > 0,
    hint: "Shortlist schools you would be proud to attend.",
    href: "/#universities",
  },
  {
    key: "scholarship",
    label: "Save a scholarship",
    done: d.savedScholarships > 0,
    hint: "Funding is easier when you start early.",
    href: "/scholarships",
  },
  {
    key: "deadline",
    label: "Track a deadline",
    done: d.deadlines > 0,
    hint: "Add one application deadline so nothing slips past you.",
    href: "/scholarships",
  },
  {
    key: "checklist",
    label: "Start your application checklist",
    done: d.checklistTotal > 0,
    hint: "Break your application into small, doable tasks.",
    href: "/dashboard",
  },
  {
    key: "checklist-progress",
    label: "Finish 3 checklist tasks",
    done: d.checklistDone >= 3,
    hint: "Tick off three tasks to build real momentum.",
    href: "/dashboard",
  },
];

export interface NextStep {
  title: string;
  body: string;
  href: string;
  cta: string;
}

export const getNextStep = (d: JourneyInput, milestones: Milestone[]): NextStep => {
  const pending = milestones.find((m) => !m.done);
  if (pending) {
    return {
      title: pending.label,
      body: pending.hint,
      href: pending.href,
      cta: "Take me there",
    };
  }
  return {
    title: `Research entry requirements for your top ${d.savedUniversities > 1 ? "universities" : "university"}`,
    body: "You have the basics in place. Compare your shortlist and confirm what each school asks for.",
    href: "/compare",
    cta: "Compare my schools",
  };
};

/** Activity-aware encouragement lines — no guilt, no filler. */
export const getSmartMessages = (d: JourneyInput): string[] => {
  const msgs: string[] = [];
  const firstName = d.fullName?.split(" ")[0];




  if (d.savedScholarships > 0) {
    msgs.push(
      `You've shortlisted ${d.savedScholarships} scholarship${d.savedScholarships === 1 ? "" : "s"} that fit your profile. Keep exploring.`,
    );
  }
  if (d.savedUniversities > 0) {
    msgs.push(
      `${d.savedUniversities} universit${d.savedUniversities === 1 ? "y is" : "ies are"} on your shortlist. Your options are growing.`,
    );
  }
  if (d.aggregate !== null) {
    msgs.push(`Your aggregate of ${d.aggregate} is on record — now we can match you to programmes you actually qualify for.`);
  }
  if (d.targetCareer) {
    msgs.push(`${firstName ? firstName + ", y" : "Y"}our path towards ${d.targetCareer} starts with the small steps you take today.`);
  }
  if (d.deadlines > 0) {
    msgs.push(`You're tracking ${d.deadlines} deadline${d.deadlines === 1 ? "" : "s"}. Being organised is half the application.`);
  }
  if (!msgs.length) {
    msgs.push("You're at the very beginning, and that is exactly where every graduate once stood.");
  }
  return msgs;
};

const DAILY_MESSAGES = [
  "Admission is not given to the smartest student. It is given to the one who prepared.",
  "One honest hour of work today is worth a week of worrying about tomorrow.",
  "Scholarships are won by people who applied. Be one of them.",
  "Your results describe where you are, not how far you can go.",
  "Ask the question you're afraid to ask. It usually costs nothing and changes everything.",
  "Small consistent steps beat one big burst of effort you can't repeat.",
  "The student who starts the application in August is calmer in November.",
  "Being unsure is normal. Staying still is the only real risk.",
  "You don't need the whole plan today — just the next honest step.",
  "Every professional you admire was once a student with more questions than answers.",
  "Progress you can't see is still progress. Keep records, keep going.",
  "Choosing a course you love makes the hard semesters survivable.",
  "Your background sets your starting point, not your ceiling.",
  "Write the essay badly first. You can only edit words that exist.",
  "Someone in Ghana got that scholarship last year. There is no reason it can't be you.",
];

export const getDailyMessage = (seed = 0) => {
  const day = Math.floor(Date.now() / 86_400_000);
  return DAILY_MESSAGES[(day + seed) % DAILY_MESSAGES.length];
};

export interface Story {
  name: string;
  role: string;
  region: string;
  quote: string;
  lesson: string;
}

export const stories: Story[] = [
  {
    name: "Ama",
    role: "Medical student, University of Ghana",
    region: "Central Region",
    quote:
      "I missed my first-choice programme by two points. Instead of sitting at home, I re-sat two subjects, worked at a pharmacy and reapplied. I started one year later than my friends — and finished with them.",
    lesson: "A delay is not a denial. Re-sits and second attempts are normal paths, not failures.",
  },
  {
    name: "Kwame",
    role: "Software engineer, Accra",
    region: "Ashanti Region",
    quote:
      "My family could not pay hostel fees, so I stayed with an uncle and learned to code on a borrowed laptop at night. My first paid project came from a church website I built for free.",
    lesson: "Free work you do well becomes the portfolio that gets you paid work.",
  },
  {
    name: "Efua",
    role: "MasterCard Foundation scholar, Ashesi University",
    region: "Volta Region",
    quote:
      "I applied to eleven scholarships. Nine said no, one never replied, and one changed my life. I kept every application in a notebook so I could reuse my essays.",
    lesson: "Apply widely and reuse your work. Rejection is part of the arithmetic.",
  },
  {
    name: "Yaw",
    role: "Agribusiness founder, Tamale",
    region: "Northern Region",
    quote:
      "I studied agriculture because it was what I got, not what I wanted. Three years in, I realised the smallholder farmers around me had no way to reach buyers. That became my business.",
    lesson: "The course you 'settled for' can still hand you an opportunity nobody else can see.",
  },
  {
    name: "Adjoa",
    role: "Nurse and part-time student, Kumasi",
    region: "Ashanti Region",
    quote:
      "I work shifts and study on my off days. Some weeks I only manage two hours of reading. I stopped comparing my speed to people with no job.",
    lesson: "Compare your progress to your own last month, not to someone else's timeline.",
  },
  {
    name: "Kojo",
    role: "Final-year engineering student, KNUST",
    region: "Greater Accra",
    quote:
      "I emailed a lecturer asking how to prepare for the programme before I even got admission. He replied with a reading list. That email is why my first year was easier.",
    lesson: "Reaching out early costs nothing and quietly puts you ahead.",
  },
];
