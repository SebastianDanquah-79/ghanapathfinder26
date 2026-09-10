export type WASSCEGrade = "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "E8" | "F9";

export interface PathwayInput {
  destination: string;
  english?: WASSCEGrade | "";
  mathematics?: WASSCEGrade | "";
  science?: WASSCEGrade | "";
}

export interface AlternativePathway {
  title: string;
  duration: string;
  route: string[];
  whyItWorks: string;
  caution: string;
  institution?: string;
  officialUrl?: string;
  verified?: boolean;
  eligibility?: string;
}

const point: Record<WASSCEGrade, number> = { A1: 1, B2: 2, B3: 3, C4: 4, C5: 5, C6: 6, D7: 7, E8: 8, F9: 9 };
const bad = (grade?: string) => !!grade && ["D7", "E8", "F9"].includes(grade);
const failed = (grade?: string) => grade === "F9";
const passAtLeastD7 = (grade?: WASSCEGrade | "") => !!grade && point[grade] <= 7;
const credit = (grade?: WASSCEGrade | "") => !!grade && point[grade] <= 6;

const verified = (path: Omit<AlternativePathway, "verified">): AlternativePathway => ({
  ...path,
  verified: true,
});

export function buildAlternativePathways(input: PathwayInput): AlternativePathway[] {
  const routes: AlternativePathway[] = [];
  const destination = input.destination.trim() || "your chosen career";
  const englishBad = bad(input.english);
  const mathsBad = bad(input.mathematics);
  const scienceBad = bad(input.science);

  if (failed(input.english) || failed(input.mathematics)) {
    routes.push({
      title: "Repair the blocking subject first",
      duration: "Usually 1–2+ years, depending on the route and resit cycle",
      route: [
        "Identify the exact subject and grade required by the target programme",
        "Use an approved resit, remedial or access option that accepts your current result",
        "Improve the blocking subject and re-check the target programme's current admission requirements",
        `Return to the ${destination} pathway when the required qualification is secured`,
      ],
      whyItWorks: "A weak WASSCE result can block a particular entry point without permanently defining the destination. The first step is repairing the qualification that the target programme actually requires.",
      caution: "GhanaPathFinder should never label a resit or remedial route as guaranteed admission. The receiving institution's current published rules always control.",
    });
  }

  // GCTU publishes diploma entry at A1–D7 in core and relevant electives, while its
  // top-up route accepts relevant HND/equivalent diplomas from recognized institutions.
  // Therefore this route is surfaced only when English and Mathematics are at least D7.
  if (passAtLeastD7(input.english) && passAtLeastD7(input.mathematics)) {
    routes.push(verified({
      title: "GCTU diploma → degree/top-up",
      duration: "Often 3–6+ years depending on diploma, degree and placement",
      institution: "Ghana Communication Technology University (GCTU)",
      officialUrl: "https://site.gctu.edu.gh/2026-2027-admissions",
      eligibility: "GCTU's published diploma requirement allows WASSCE A1–D7 in the required core/elective subjects. Relevant HND/equivalent diploma holders may be placed at Level 200 or 300 for top-up, subject to assessment.",
      route: [
        "Check whether your full WASSCE profile satisfies the chosen GCTU diploma",
        "Complete the relevant diploma and build a strong academic record",
        "Progress to a related degree/top-up route where GCTU's current rules permit it",
        `Continue toward ${destination} through the closest relevant specialisation`,
      ],
      whyItWorks: "GCTU explicitly publishes both diploma entry and progression routes for relevant HND/equivalent qualifications, creating a real alternative to direct degree entry.",
      caution: "This is not a universal workaround. The diploma must accept your complete subject profile, and the later top-up must be relevant and approved.",
    }));
  }

  // Accra Technical University publishes HND entry with D7-or-better passes in English,
  // Mathematics and the required core/electives, plus later BTech top-up for relevant HND holders.
  if (passAtLeastD7(input.english) && passAtLeastD7(input.mathematics)) {
    routes.push(verified({
      title: "ATU HND → BTech top-up",
      duration: "Typically 3 years HND + subsequent top-up, depending on programme",
      institution: "Accra Technical University (ATU)",
      officialUrl: "https://atu.edu.gh/entry-requirements-for-higher-national-diploma-hnd-programmes-3-years/",
      eligibility: "ATU's published HND requirements include six passes, with English Language and Core Mathematics among the required passes, plus relevant electives; departmental requirements also apply.",
      route: [
        "Check the target HND department against your complete WASSCE subjects",
        "Complete the relevant HND and maintain the required classification",
        "Apply for a relevant BTech top-up when eligible",
        `Use the combined qualification and experience to move toward ${destination}`,
      ],
      whyItWorks: "Technical-university progression can create a longer but legitimate academic route into technical careers.",
      caution: "ATU's published rules still require the relevant subjects and departmental requirements. A D7 alone does not guarantee HND admission.",
    }));
  }

  // These routes are age-dependent, so they are shown as long-term options rather than
  // pretending a school leaver can immediately use a mature route.
  if (input.english === "E8" && input.mathematics === "E8") {
    routes.push(verified({
      title: "Later mature-access route",
      duration: "A long-term route, because mature admission is age/work-experience dependent",
      institution: "University of Ghana / UPSA / other institutions with published mature routes",
      officialUrl: "https://admissions.ug.edu.gh/node/34",
      eligibility: "University of Ghana publishes a mature route requiring at least E8 in six subjects including English and Mathematics, followed by its official Access Course and entrance examination. Other institutions have their own age and work-experience conditions.",
      route: [
        "Build qualifications and relevant experience after SHS",
        "When you meet the institution's age and other mature-entry requirements, complete the official access course",
        "Pass the required entrance examination",
        `Enter an approved programme and continue toward ${destination}`,
      ],
      whyItWorks: "Mature admission is a genuine second-chance route, but it is a future option rather than an immediate post-SHS shortcut.",
      caution: "Mature admission has strict age, work-experience and examination requirements that vary by university. It should never be presented as immediate admission for a school leaver.",
    }));
  }

  // A related programme is intentionally retained because the destination can be broader
  // than a single degree title. This is a planning route, not a claimed admissions rule.
  routes.push({
    title: "Related programme → specialise later",
    duration: "Usually 4–7+ years",
    route: [
      `Choose a closely related programme that your current grades can support`,
      "Build projects, internships, certifications and relevant experience",
      "Use electives, professional qualifications or postgraduate study to specialise",
      `Transition into ${destination} when the required academic or professional bridge is complete`,
    ],
    whyItWorks: "Careers are broader than degree titles. Adjacent study plus strong skills and experience can open routes into many technology, business and technical careers.",
    caution: "This is a career-planning route, not a promise of admission. Regulated professions still require their prescribed qualifications and licences.",
  });

  if (englishBad || mathsBad || scienceBad) {
    routes.push({
      title: "Work + study progression",
      duration: "Often 4–8+ years",
      route: [
        "Enter a realistic entry-level, technician or support role connected to the destination when eligible",
        "Study part-time, by distance or through an approved progression programme",
        "Accumulate evidence of competence through projects, experience, certificates and formal qualifications",
        `Step upward until your role matches ${destination}`,
      ],
      whyItWorks: "Real careers are not always linear. In technology and technical fields especially, experience and formal study can develop together.",
      caution: "Work experience does not replace mandatory academic or professional licensing requirements.",
    });
  }

  return routes.slice(0, 5);
}

export function pathwaySignal(input: PathwayInput): string | null {
  const grades = [input.english, input.mathematics, input.science].filter(Boolean) as WASSCEGrade[];
  if (!grades.length) return null;
  const blocked = grades.filter((g) => point[g] > 6);
  if (!blocked.length) return "Your entered core grades do not currently show a D7/E8/F9 barrier.";
  return `You entered ${blocked.join(", ")} in one or more core subjects. That can close some direct-entry programmes, but it does not mean the destination itself is closed.`;
}
