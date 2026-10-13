/**
 * Expanded applied-skills catalogue.
 *
 * These are practice-oriented skills mapped to the official documentation of
 * each tool. They are catalogue discovery items, not certifications or claims
 * that a learner has achieved proficiency. The labels are generated from
 * reviewed tool/practice pairs; the page deduplicates by normalized skill ID.
 *
 * Tool documentation is linked directly where possible. ESCO remains a useful
 * open classification reference for future source-backed crosswalks:
 * https://esco.ec.europa.eu/en/use-esco
 */

import type { Skill, SkillCategory, LearningResource } from "./skillsMap";

type Tool = { name: string; category: SkillCategory; docs: string; provider: string };

const languages: Tool[] = [
  { name: "Python", category: "technical", docs: "https://docs.python.org/3/", provider: "Python" },
  { name: "TypeScript", category: "technical", docs: "https://www.typescriptlang.org/docs/", provider: "TypeScript" },
  { name: "JavaScript", category: "technical", docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", provider: "MDN Web Docs" },
  { name: "Java", category: "technical", docs: "https://dev.java/learn/", provider: "Oracle / dev.java" },
  { name: "C++", category: "technical", docs: "https://en.cppreference.com/w/", provider: "cppreference" },
  { name: "C", category: "technical", docs: "https://en.cppreference.com/w/c", provider: "cppreference" },
  { name: "C#", category: "technical", docs: "https://learn.microsoft.com/en-us/dotnet/csharp/", provider: "Microsoft Learn" },
  { name: "Go", category: "technical", docs: "https://go.dev/doc/", provider: "Go" },
  { name: "Rust", category: "technical", docs: "https://doc.rust-lang.org/book/", provider: "The Rust Project" },
  { name: "PHP", category: "technical", docs: "https://www.php.net/manual/en/", provider: "PHP" },
  { name: "Ruby", category: "technical", docs: "https://www.ruby-lang.org/en/documentation/", provider: "Ruby" },
  { name: "Swift", category: "technical", docs: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/", provider: "Swift" },
  { name: "Kotlin", category: "technical", docs: "https://kotlinlang.org/docs/home.html", provider: "Kotlin" },
  { name: "Dart", category: "technical", docs: "https://dart.dev/guides", provider: "Dart" },
  { name: "R", category: "technical", docs: "https://cran.r-project.org/manuals.html", provider: "The R Project" },
  { name: "Julia", category: "technical", docs: "https://docs.julialang.org/en/v1/", provider: "Julia" },
  { name: "MATLAB", category: "technical", docs: "https://www.mathworks.com/help/matlab/", provider: "MathWorks" },
  { name: "Bash", category: "technical", docs: "https://www.gnu.org/software/bash/manual/", provider: "GNU" },
  { name: "PowerShell", category: "technical", docs: "https://learn.microsoft.com/en-us/powershell/", provider: "Microsoft Learn" },
  { name: "SQL", category: "technical", docs: "https://www.postgresql.org/docs/current/tutorial.html", provider: "PostgreSQL" },
  { name: "HTML", category: "technical", docs: "https://developer.mozilla.org/en-US/docs/Web/HTML", provider: "MDN Web Docs" },
  { name: "CSS", category: "technical", docs: "https://developer.mozilla.org/en-US/docs/Web/CSS", provider: "MDN Web Docs" },
  { name: "React", category: "technical", docs: "https://react.dev/learn", provider: "React" },
  { name: "Next.js", category: "technical", docs: "https://nextjs.org/docs", provider: "Vercel" },
  { name: "Vue", category: "technical", docs: "https://vuejs.org/guide/introduction.html", provider: "Vue" },
  { name: "Angular", category: "technical", docs: "https://angular.dev/overview", provider: "Angular" },
  { name: "Svelte", category: "technical", docs: "https://svelte.dev/docs", provider: "Svelte" },
  { name: "Node.js", category: "technical", docs: "https://nodejs.org/en/learn", provider: "Node.js" },
  { name: "Express", category: "technical", docs: "https://expressjs.com/", provider: "Express" },
  { name: "FastAPI", category: "technical", docs: "https://fastapi.tiangolo.com/", provider: "FastAPI" },
  { name: "Django", category: "technical", docs: "https://docs.djangoproject.com/en/stable/", provider: "Django" },
  { name: "Flask", category: "technical", docs: "https://flask.palletsprojects.com/", provider: "Pallets" },
  { name: "Spring Boot", category: "technical", docs: "https://docs.spring.io/spring-boot/index.html", provider: "Spring" },
  { name: ".NET", category: "technical", docs: "https://learn.microsoft.com/en-us/dotnet/", provider: "Microsoft Learn" },
  { name: "Flutter", category: "technical", docs: "https://docs.flutter.dev/", provider: "Flutter" },
  { name: "React Native", category: "technical", docs: "https://reactnative.dev/docs/getting-started", provider: "React Native" },
  { name: "Android", category: "technical", docs: "https://developer.android.com/develop", provider: "Android Developers" },
  { name: "iOS", category: "technical", docs: "https://developer.apple.com/tutorials/", provider: "Apple Developer" },
  { name: "GraphQL", category: "technical", docs: "https://graphql.org/learn/", provider: "GraphQL Foundation" },
  { name: "REST APIs", category: "technical", docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP", provider: "MDN Web Docs" },
];

const softwarePractices = [
  ["environment setup", "Set up a reproducible development environment and document the required versions."],
  ["idiomatic implementation", "Use the tool's established conventions to keep implementations readable and maintainable."],
  ["debugging", "Isolate faults with a repeatable debugging process, clear hypotheses and minimal reproductions."],
  ["unit testing", "Write focused unit tests for normal, boundary and invalid inputs."],
  ["integration testing", "Test the behaviour of components when connected to their real dependencies."],
  ["test automation", "Automate repeatable checks so changes can be validated consistently."],
  ["error handling", "Handle expected failures explicitly and return useful, safe error information."],
  ["profiling", "Measure runtime behaviour to locate the actual bottleneck before changing the design."],
  ["performance tuning", "Improve latency and resource use while checking that correctness remains intact."],
  ["secure implementation", "Apply secure defaults, least privilege and input validation to reduce avoidable risk."],
  ["dependency management", "Pin, update and audit dependencies while keeping reproducible project builds."],
  ["build and packaging", "Create repeatable builds and packages that can be installed or deployed reliably."],
  ["continuous integration", "Run formatting, tests and build checks automatically for every meaningful change."],
  ["logging and observability", "Record actionable events and measurements without leaking secrets or personal data."],
  ["technical documentation", "Write setup instructions, API notes and examples that another developer can follow."],
  ["code review", "Review changes for correctness, maintainability, security and test coverage."],
  ["API integration", "Connect to external services with explicit contracts, timeouts and failure handling."],
  ["data validation", "Validate external and user-supplied values before they enter trusted application logic."],
  ["refactoring", "Restructure implementation safely while using tests to preserve expected behaviour."],
  ["accessibility and usability", "Check keyboard use, error feedback and interaction patterns that affect real users."],
  ["concurrency", "Identify shared state and coordinate parallel work without creating race conditions."],
  ["memory and resource management", "Understand lifetime, allocation and cleanup to avoid leaks and resource exhaustion."],
  ["version control workflow", "Use small, understandable commits and branches so changes can be reviewed and reverted."],
  ["release and rollback planning", "Plan a reversible release and verify the system after deployment."],
  ["edge-case analysis", "Turn assumptions into explicit tests for unusual but valid conditions."],
  ["configuration management", "Separate configuration from code and keep secrets out of source control."],
  ["migration planning", "Change data structures and interfaces in compatible, testable steps."],
  ["architecture and modularity", "Separate responsibilities so a change in one area does not destabilize unrelated features."],
];

const dataTools: Tool[] = [
  { name: "Pandas", category: "technical", docs: "https://pandas.pydata.org/docs/", provider: "Pandas" },
  { name: "NumPy", category: "technical", docs: "https://numpy.org/doc/", provider: "NumPy" },
  { name: "Polars", category: "technical", docs: "https://docs.pola.rs/", provider: "Polars" },
  { name: "Apache Spark", category: "technical", docs: "https://spark.apache.org/docs/latest/", provider: "Apache Spark" },
  { name: "Apache Kafka", category: "technical", docs: "https://kafka.apache.org/documentation/", provider: "Apache Kafka" },
  { name: "Apache Airflow", category: "technical", docs: "https://airflow.apache.org/docs/", provider: "Apache Airflow" },
  { name: "dbt", category: "technical", docs: "https://docs.getdbt.com/", provider: "dbt Labs" },
  { name: "Snowflake", category: "technical", docs: "https://docs.snowflake.com/", provider: "Snowflake" },
  { name: "Databricks", category: "technical", docs: "https://docs.databricks.com/", provider: "Databricks" },
  { name: "Power BI", category: "tools", docs: "https://learn.microsoft.com/en-us/power-bi/", provider: "Microsoft Learn" },
  { name: "Tableau", category: "tools", docs: "https://help.tableau.com/", provider: "Tableau" },
  { name: "Looker Studio", category: "tools", docs: "https://support.google.com/looker-studio/", provider: "Google" },
  { name: "Excel", category: "tools", docs: "https://support.microsoft.com/excel", provider: "Microsoft Support" },
  { name: "Google Sheets", category: "tools", docs: "https://support.google.com/docs/topic/9054603", provider: "Google" },
  { name: "PostgreSQL", category: "technical", docs: "https://www.postgresql.org/docs/current/", provider: "PostgreSQL" },
  { name: "MySQL", category: "technical", docs: "https://dev.mysql.com/doc/", provider: "Oracle" },
  { name: "SQLite", category: "technical", docs: "https://www.sqlite.org/docs.html", provider: "SQLite" },
  { name: "MongoDB", category: "technical", docs: "https://www.mongodb.com/docs/", provider: "MongoDB" },
  { name: "Redis", category: "technical", docs: "https://redis.io/docs/latest/", provider: "Redis" },
  { name: "DuckDB", category: "technical", docs: "https://duckdb.org/docs/", provider: "DuckDB" },
  { name: "PyTorch", category: "advanced", docs: "https://pytorch.org/docs/stable/index.html", provider: "PyTorch" },
  { name: "TensorFlow", category: "advanced", docs: "https://www.tensorflow.org/guide", provider: "TensorFlow" },
  { name: "scikit-learn", category: "advanced", docs: "https://scikit-learn.org/stable/user_guide.html", provider: "scikit-learn" },
  { name: "OpenCV", category: "advanced", docs: "https://docs.opencv.org/", provider: "OpenCV" },
  { name: "Hugging Face Transformers", category: "advanced", docs: "https://huggingface.co/docs/transformers/", provider: "Hugging Face" },
  { name: "Jupyter", category: "tools", docs: "https://docs.jupyter.org/", provider: "Project Jupyter" },
  { name: "Apache Superset", category: "tools", docs: "https://superset.apache.org/docs/intro", provider: "Apache Superset" },
  { name: "Metabase", category: "tools", docs: "https://www.metabase.com/docs/latest/", provider: "Metabase" },
  { name: "QGIS", category: "tools", docs: "https://docs.qgis.org/latest/en/docs/", provider: "QGIS" },
  { name: "PostGIS", category: "technical", docs: "https://postgis.net/documentation/", provider: "PostGIS" },
];

const dataPractices = [
  ["data ingestion", "Design reliable ingestion from files, APIs or source systems, with clear handling for missing and late data."],
  ["data cleaning", "Detect and resolve invalid values, duplicates and inconsistent formats while preserving traceability."],
  ["schema design", "Define explicit schemas, keys, data types and constraints that match the problem being solved."],
  ["transformation pipelines", "Build transformations that are testable, repeatable and safe to rerun."],
  ["query optimisation", "Use query plans, filtering and suitable data structures to reduce unnecessary work."],
  ["data quality checks", "Test completeness, uniqueness, validity and consistency before data is used for decisions."],
  ["exploratory analysis", "Use summaries and focused visualisations to understand distributions, outliers and relationships."],
  ["statistical interpretation", "Choose summaries and tests appropriate to the question, sample and assumptions."],
  ["dashboard design", "Communicate a small set of meaningful measures with legible and accessible visualisations."],
  ["report reproducibility", "Keep analytical steps, parameters and source data documented so results can be reproduced."],
  ["time-series analysis", "Handle time zones, gaps, seasonality and temporal aggregation carefully."],
  ["geospatial analysis", "Work with coordinate systems, spatial joins and geometric operations without confusing locations."],
  ["feature engineering", "Create input variables that capture relevant patterns while avoiding leakage from future data."],
  ["model evaluation", "Select evaluation measures that match the task and inspect performance across relevant slices."],
  ["pipeline monitoring", "Track run failures, data freshness, volume changes and quality regressions."],
  ["data access controls", "Apply permission boundaries and minimise the exposure of sensitive or restricted datasets."],
  ["backup and recovery", "Plan backups and test restoring the data needed to resume work."],
  ["metadata and lineage", "Record where datasets came from, how they changed and which outputs depend on them."],
  ["incremental processing", "Process only new or changed records when this is safe and improves efficiency."],
  ["export and interoperability", "Exchange data using documented formats, stable identifiers and explicit encodings."],
];

const infrastructureTools: Tool[] = [
  { name: "Docker", category: "tools", docs: "https://docs.docker.com/", provider: "Docker" },
  { name: "Kubernetes", category: "advanced", docs: "https://kubernetes.io/docs/home/", provider: "Kubernetes" },
  { name: "Terraform", category: "advanced", docs: "https://developer.hashicorp.com/terraform/docs", provider: "HashiCorp" },
  { name: "Ansible", category: "tools", docs: "https://docs.ansible.com/", provider: "Ansible" },
  { name: "Linux", category: "technical", docs: "https://www.kernel.org/doc/html/latest/", provider: "Linux Kernel" },
  { name: "Git", category: "tools", docs: "https://git-scm.com/doc", provider: "Git" },
  { name: "GitHub Actions", category: "tools", docs: "https://docs.github.com/en/actions", provider: "GitHub" },
  { name: "GitLab CI/CD", category: "tools", docs: "https://docs.gitlab.com/ee/ci/", provider: "GitLab" },
  { name: "Jenkins", category: "tools", docs: "https://www.jenkins.io/doc/", provider: "Jenkins" },
  { name: "AWS", category: "advanced", docs: "https://docs.aws.amazon.com/", provider: "Amazon Web Services" },
  { name: "Microsoft Azure", category: "advanced", docs: "https://learn.microsoft.com/en-us/azure/", provider: "Microsoft Learn" },
  { name: "Google Cloud", category: "advanced", docs: "https://cloud.google.com/docs", provider: "Google Cloud" },
  { name: "Vercel", category: "tools", docs: "https://vercel.com/docs", provider: "Vercel" },
  { name: "Supabase", category: "tools", docs: "https://supabase.com/docs", provider: "Supabase" },
  { name: "Firebase", category: "tools", docs: "https://firebase.google.com/docs", provider: "Firebase" },
  { name: "Prometheus", category: "advanced", docs: "https://prometheus.io/docs/introduction/overview/", provider: "Prometheus" },
  { name: "Grafana", category: "tools", docs: "https://grafana.com/docs/", provider: "Grafana Labs" },
  { name: "Nginx", category: "tools", docs: "https://nginx.org/en/docs/", provider: "Nginx" },
  { name: "Cloudflare", category: "tools", docs: "https://developers.cloudflare.com/", provider: "Cloudflare" },
  { name: "OpenTelemetry", category: "advanced", docs: "https://opentelemetry.io/docs/", provider: "OpenTelemetry" },
];

const infrastructurePractices = [
  ["installation and configuration", "Install and configure the tool with reproducible steps and explicit environment settings."],
  ["deployment automation", "Automate safe, repeatable deployment steps and validate the resulting service."],
  ["security configuration", "Restrict permissions, protect secrets and enable security controls appropriate to the service."],
  ["monitoring and alerting", "Define useful health indicators, actionable alerts and a response path for failures."],
  ["incident troubleshooting", "Use logs, metrics and recent changes to investigate service incidents systematically."],
  ["backup and restore", "Document recovery objectives and verify that backups can actually be restored."],
  ["capacity planning", "Estimate resource needs from expected workload, growth and observed utilisation."],
  ["network configuration", "Configure routing, name resolution, firewall rules and service connectivity for the intended topology."],
  ["identity and access management", "Use least-privilege roles, short-lived access and clear ownership for system permissions."],
  ["cost and resource optimisation", "Identify unused or oversized resources using measured usage rather than guesses."],
  ["high availability", "Reduce single points of failure and test the recovery behaviour expected by the design."],
  ["secrets management", "Store and rotate credentials securely without placing them in code, logs or client bundles."],
  ["versioning and rollback", "Version configuration and keep a tested route back to the last known-good release."],
  ["infrastructure as code", "Express repeatable infrastructure changes as reviewed, versioned configuration."],
  ["service reliability", "Define service-level indicators and improve reliability using observed failure patterns."],
  ["compliance evidence", "Record configuration and access evidence needed for a practical operational review."],
  ["resource isolation", "Separate workloads and permissions to limit interference and contain failures."],
  ["load and resilience testing", "Exercise realistic demand and controlled failures to discover system limits."],
  ["documentation and runbooks", "Write operational steps that a teammate can use during routine maintenance and incidents."],
  ["change management", "Review, stage and communicate changes that could affect a running service."],
];

const professionalTools: Tool[] = [
  { name: "Figma", category: "tools", docs: "https://help.figma.com/", provider: "Figma" },
  { name: "Canva", category: "tools", docs: "https://www.canva.com/help/", provider: "Canva" },
  { name: "Notion", category: "tools", docs: "https://www.notion.so/help", provider: "Notion" },
  { name: "Jira", category: "tools", docs: "https://support.atlassian.com/jira-software-cloud/", provider: "Atlassian" },
  { name: "Confluence", category: "tools", docs: "https://support.atlassian.com/confluence-cloud/", provider: "Atlassian" },
  { name: "Salesforce", category: "industry", docs: "https://trailhead.salesforce.com/", provider: "Salesforce Trailhead" },
  { name: "HubSpot", category: "tools", docs: "https://knowledge.hubspot.com/", provider: "HubSpot" },
  { name: "QuickBooks", category: "tools", docs: "https://quickbooks.intuit.com/learn-support/", provider: "Intuit" },
  { name: "PowerPoint", category: "tools", docs: "https://support.microsoft.com/powerpoint", provider: "Microsoft Support" },
  { name: "Word", category: "tools", docs: "https://support.microsoft.com/word", provider: "Microsoft Support" },
  { name: "SharePoint", category: "tools", docs: "https://learn.microsoft.com/en-us/sharepoint/", provider: "Microsoft Learn" },
  { name: "Microsoft Teams", category: "tools", docs: "https://support.microsoft.com/teams", provider: "Microsoft Support" },
  { name: "Google Workspace", category: "tools", docs: "https://support.google.com/a/users/", provider: "Google" },
  { name: "Miro", category: "tools", docs: "https://help.miro.com/", provider: "Miro" },
  { name: "Adobe Photoshop", category: "tools", docs: "https://helpx.adobe.com/photoshop/user-guide.html", provider: "Adobe" },
  { name: "Adobe Illustrator", category: "tools", docs: "https://helpx.adobe.com/illustrator/user-guide.html", provider: "Adobe" },
  { name: "Blender", category: "tools", docs: "https://docs.blender.org/manual/en/latest/", provider: "Blender" },
  { name: "AutoCAD", category: "tools", docs: "https://help.autodesk.com/view/ACD/2025/ENU/", provider: "Autodesk" },
  { name: "FreeCAD", category: "tools", docs: "https://wiki.freecad.org/Getting_started", provider: "FreeCAD" },
  { name: "LaTeX", category: "tools", docs: "https://www.latex-project.org/help/documentation/", provider: "LaTeX Project" },
];

const professionalPractices = [
  ["workflow setup", "Set up a consistent workspace and document the steps needed to repeat the process."],
  ["template design", "Create reusable templates that keep recurring work consistent and reduce manual errors."],
  ["structured data entry", "Use consistent fields, validation and naming conventions so records remain searchable."],
  ["quality assurance", "Check outputs against explicit requirements before sharing or publishing them."],
  ["review and feedback", "Use clear review criteria and incorporate feedback without losing track of decisions."],
  ["collaborative handoff", "Package files, notes and decisions so another person can continue the work efficiently."],
  ["accessibility checks", "Check readability, contrast, keyboard access and alternative text where relevant."],
  ["version history", "Use revision history to understand changes, compare versions and recover previous work."],
  ["automation of routine tasks", "Identify repetitive steps and automate them only when the result remains auditable."],
  ["reporting and communication", "Present the result, assumptions and limitations clearly for the intended audience."],
  ["data protection", "Share only necessary information and apply the permissions appropriate to the audience."],
  ["cross-format export", "Export in accessible, widely supported formats and verify the output after conversion."],
  ["project organisation", "Keep related assets, tasks, owners and milestones organised in a way others can follow."],
  ["decision documentation", "Record important choices, relevant evidence and unresolved trade-offs."],
  ["standard operating procedures", "Document recurring work as concise steps with clear ownership and checks."],
  ["workflow measurement", "Track turnaround time, rework and bottlenecks to improve the workflow."],
];

const slug = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const resource = (tool: Tool): LearningResource => ({
  title: `${tool.name} official documentation`,
  provider: tool.provider,
  url: tool.docs,
  type: "Docs",
  cost: "Free",
});

function buildSkills(tools: Tool[], practices: Array<[string, string]>, categoryOverride?: SkillCategory): Skill[] {
  return tools.flatMap((tool) =>
    practices.map(([practice, detail]) => {
      const name = `${tool.name} ${practice}`;
      return {
        id: `applied-${slug(name)}`,
        name,
        summary: `${detail} Applied to ${tool.name}.`,
        why: `This applied competency helps make ${tool.name} useful in real projects, team handoffs and maintainable work.`,
        resources: [resource(tool)],
        category: categoryOverride ?? tool.category,
      } satisfies Skill;
    }),
  );
}

export const EXPANDED_SKILLS: Skill[] = [
  ...buildSkills(languages, softwarePractices),
  ...buildSkills(dataTools, dataPractices),
  ...buildSkills(infrastructureTools, infrastructurePractices),
  ...buildSkills(professionalTools, professionalPractices),
];

export const EXPANDED_SKILLS_SOURCE = "Tool creators' official documentation pages linked per skill; general skill taxonomy reference: https://esco.ec.europa.eu/en/use-esco";
