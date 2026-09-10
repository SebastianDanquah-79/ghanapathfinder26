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
}

const point: Record<WASSCEGrade, number> = { A1: 1, B2: 2, B3: 3, C4: 4, C5: 5, C6: 6, D7: 7, E8: 8, F9: 9 };

const bad = (grade?: string) => !!grade && ["D7", "E8", "F9"].includes(grade);
const failed = (grade?: string) => grade === "F9";

export function buildAlternativePathways(input: PathwayInput): AlternativePathway[] {
  const routes: AlternativePathway[] = [];
  const destination = input.destination.trim() || "your chosen career";
  const englishBad = bad(input.english);
  const mathsBad = bad(input.mathematics);
  const scienceBad = bad(input.science);

  if (failed(input.english) || failed(input.mathematics)) {
    routes.push({
      title: "Repair the missing foundation first",
      duration: "About 1–2 years, depending on the route",
      route: [
        "Identify the exact subjects blocking your preferred programme",
        "Use a recognised remedial, resit or access route to improve the required subject",
        "Recheck university requirements after the new result",
        `Re-enter the ${destination} pathway when the required credit is secured`,
      ],
      whyItWorks: "A weak WASSCE result is a constraint on a particular entry point, not a permanent career verdict. Improving the blocking subject can reopen routes that are currently unavailable.",
      caution: "The exact resit, remedial and access rules vary by institution and programme. GhanaPathFinder should show the current official requirement before calling a route available.",
    });
  }

  if (englishBad || mathsBad || scienceBad) {
    routes.push({
      title: "Access → diploma/HND → degree",
      duration: "Typically 3–6+ years after SHS, depending on entry level and programme",
      route: [
        "Find an accredited access, certificate, diploma or HND route whose published requirements you meet",
        "Complete the foundational qualification and build a strong academic record",
        "Top up or progress into a related degree where the institution accepts the qualification",
        `Move toward ${destination} through the closest accredited programme`,
      ],
      whyItWorks: "Ghana has tertiary pathways that do not all begin with direct Level 100 degree admission. For example, technical-university HND and access routes can provide a bridge where direct degree entry is not available.",
      caution: "A diploma or HND is not automatically a degree bridge. Progression depends on the receiving institution, programme alignment and current admission rules.",
    });
  }

  routes.push({
    title: "Related programme → specialise later",
    duration: "Usually 4–7+ years",
    route: [
      `Choose a closely related programme that your current grades can support`,
      "Build projects, internships, certifications and relevant work experience",
      "Use electives, professional qualifications or postgraduate study to specialise",
      `Transition into ${destination} when the required academic or professional bridge is complete`,
    ],
    whyItWorks: "Careers are broader than degree titles. A person can enter a field through an adjacent discipline and specialise later when the new qualification and experience satisfy the target role.",
    caution: "Regulated careers such as medicine, nursing, law and some engineering roles have professional licensing requirements that cannot simply be bypassed by experience.",
  });

  routes.push({
    title: "Work + study progression",
    duration: "Often 4–8+ years, with flexibility to earn while studying",
    route: [
      "Enter a realistic entry-level, technician or support role connected to the destination",
      "Study part-time, by distance or through an approved progression programme",
      "Accumulate evidence of competence: projects, experience, professional certificates and qualifications",
      `Step upward until your role matches ${destination}`,
    ],
    whyItWorks: "Real careers are not always linear. Work experience can become part of the bridge while formal study catches up, especially in technology, business and technical fields.",
    caution: "This route is not a substitute for mandatory licences or accredited qualifications in regulated professions.",
  });

  return routes.slice(0, 4);
}

export function pathwaySignal(input: PathwayInput): string | null {
  const grades = [input.english, input.mathematics, input.science].filter(Boolean) as WASSCEGrade[];
  if (!grades.length) return null;
  const blocked = grades.filter((g) => point[g] > 6);
  if (!blocked.length) return "Your entered core grades do not currently show a D7/E8/F9 barrier.";
  return `You entered ${blocked.join(", ")} in one or more core subjects. That can close some direct-entry programmes, but it does not mean the destination itself is closed.`;
}
