/**
 * Single source of truth for year-round opportunity categories.
 * Each category reads only real records: published rows in `opportunities`,
 * matching rows in the existing `internships` table, or verified courses in
 * `skill_providers`. Nothing here is sample data.
 */
export type OpportunityGroup = "careers" | "skills" | "build" | "community";

export interface OpportunityCategory {
  slug: string;
  label: string;
  group: OpportunityGroup;
  description: string;
  /** Values of internships.opportunity_type that also belong here. */
  internshipTypes?: string[];
  /** Also list verified courses from skill_providers. */
  includeCourses?: boolean;
}

export const OPPORTUNITY_GROUPS: Record<OpportunityGroup, { label: string; description: string }> = {
  careers: { label: "Careers and work", description: "Paid work, placements and early-career programmes." },
  skills: { label: "Skills and learning", description: "Courses and certifications you can take now." },
  build: { label: "Build and fund", description: "Startups, funding, accelerators and competitions." },
  community: { label: "Community and research", description: "Events, research roles and volunteering." },
};

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  { slug: "job", label: "Jobs", group: "careers", description: "Open roles at employers in Ghana and across Africa." },
  { slug: "internship", label: "Internships", group: "careers", description: "Short paid or unpaid work placements for students and graduates.", internshipTypes: ["Internship", "Clinical placement"] },
  { slug: "attachment", label: "Attachments", group: "careers", description: "Industrial attachment placements required by many programmes.", internshipTypes: ["Attachment"] },
  { slug: "apprenticeship", label: "Apprenticeships", group: "careers", description: "Learn a trade on the job with a qualified master or employer." },
  { slug: "national-service", label: "National Service", group: "careers", description: "Postings and service placements for tertiary graduates." },
  { slug: "graduate-trainee", label: "Graduate Trainee", group: "careers", description: "Structured programmes for recent graduates.", internshipTypes: ["Graduate programme", "Training programme"] },
  { slug: "remote", label: "Remote Work", group: "careers", description: "Roles you can do from anywhere in Ghana." },
  { slug: "freelance", label: "Freelance", group: "careers", description: "Project-based and contract work." },
  { slug: "fellowship", label: "Fellowships", group: "careers", description: "Funded leadership, research and professional fellowships." },
  { slug: "work-abroad", label: "Work Abroad", group: "careers", description: "Verified international work and mobility programmes." },
  { slug: "course", label: "Free Courses", group: "skills", description: "Courses from recognised providers.", includeCourses: true },
  { slug: "certification", label: "Certifications", group: "skills", description: "Industry certifications employers recognise." },
  { slug: "startup", label: "Startups", group: "build", description: "African startups building in the open." },
  { slug: "startup-job", label: "Startup Jobs", group: "build", description: "Roles at early-stage companies." },
  { slug: "funding", label: "Funding", group: "build", description: "Grants, prizes and early-stage funding for founders." },
  { slug: "accelerator", label: "Accelerators", group: "build", description: "Time-bound programmes that help startups grow." },
  { slug: "incubator", label: "Incubators", group: "build", description: "Workspaces and support for early ideas." },
  { slug: "hackathon", label: "Hackathons", group: "build", description: "Build something in days, often with prizes." },
  { slug: "competition", label: "Competitions", group: "build", description: "Academic, business and innovation competitions with prizes." },
  { slug: "event", label: "Events", group: "community", description: "Career fairs, meetups and campus events." },
  { slug: "research", label: "Research", group: "community", description: "Research assistant roles and lab opportunities." },
  { slug: "volunteer", label: "Volunteering", group: "community", description: "Give time, build experience." },
];

export const getCategory = (slug: string) => OPPORTUNITY_CATEGORIES.find((c) => c.slug === slug);
