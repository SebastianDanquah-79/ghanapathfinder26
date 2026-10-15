import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Award, BookOpen, Briefcase, CheckCircle2, Heart, Lightbulb, RefreshCw, Sparkles, Target, Users } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

type GameType = "venture-builder" | "ai-craft" | "capital-builder" | "academic-strategist" | "impact-builder" | "whole-life" | "general-strategist";
type RiskProfile = "low" | "balanced" | "high";
type Screen = "setup" | "recommendation" | "play" | "outcome" | "result";
type MetricKey = "skills" | "capital" | "network" | "wellbeing" | "execution";
type Metrics = Record<MetricKey, number>;

type Choice = {
  title: string;
  detail: string;
  outcome: string;
  tradeoff: string;
  effects: Partial<Metrics>;
};
type Scenario = { title: string; context: string; prompt: string; choices: Choice[] };
type Alternative = { title: string; tradeoff: string };
type DecisionRecord = {
  round: number;
  scenarioTitle: string;
  chosenTitle: string;
  outcome: string;
  tradeoff: string;
  effects: Partial<Metrics>;
  alternatives: Alternative[];
};
type LifeGameSession = {
  runId?: string;
  goal: string;
  gameType: GameType;
  startingStage: string;
  weeklyHours: number;
  riskProfile: RiskProfile;
  horizonYears: number;
  currentRound: number;
  metrics: Metrics;
  decisions: DecisionRecord[];
  status: "in_progress" | "completed";
};
type LifeGameRow = Tables<"life_game_runs">;

const STORAGE_KEY = "ghanapathfinder-life-game-v1";
const ROUNDS = 6;

const metricNames: Record<MetricKey, string> = {
  skills: "Skills",
  capital: "Financial runway",
  network: "Relationships",
  wellbeing: "Wellbeing",
  execution: "Execution",
};

const goalExamples = [
  "Build a billion-dollar company",
  "Become a world-class AI engineer",
  "Reach financial independence",
  "Earn a first-class degree",
  "Build a high-impact African organisation",
  "Live a healthy, balanced life",
];

const gameMeta: Record<GameType, { title: string; subtitle: string; description: string; skills: string[]; route: string }> = {
  "venture-builder": {
    title: "Venture Builder",
    subtitle: "Build value, ownership and a company that can scale",
    description: "Make founder decisions about customer problems, cash, co-founders, distribution and when to change direction. The simulation rewards customer evidence and sustainable execution, not hype.",
    skills: ["Customer discovery", "Product execution", "Ownership and cash discipline", "Distribution"],
    route: "/build",
  },
  "ai-craft": {
    title: "Skill Architect",
    subtitle: "Turn technical ambition into compounding capability",
    description: "Choose how to learn, build proof of skill, find mentors, gain experience and protect enough time to keep improving. Your strongest asset is useful work that other people can inspect.",
    skills: ["Technical foundations", "Projects and evidence", "Mentorship", "Consistent practice"],
    route: "/skills/",
  },
  "capital-builder": {
    title: "Financial Independence",
    subtitle: "Strengthen your ability to earn, keep and deploy money",
    description: "Navigate earning power, spending, buffers, risk and long-term choices. This is a financial-literacy simulation, not investment advice or a promise of wealth.",
    skills: ["Cash-flow awareness", "Marketable skills", "Risk management", "Long-term planning"],
    route: "/careers/",
  },
  "academic-strategist": {
    title: "Scholarship Strategist",
    subtitle: "Turn study time into options and opportunity",
    description: "Balance deep learning, grades, funding, practical experience and relationships. See how a semester of decisions can create more options later.",
    skills: ["Active recall", "Focused study", "Funding research", "Evidence of ability"],
    route: "/scholarships/",
  },
  "impact-builder": {
    title: "Impact Builder",
    subtitle: "Solve an important problem without losing the plot",
    description: "Choose a community problem, test solutions with real people, build partnerships and create a model that can continue working after the excitement fades.",
    skills: ["Problem selection", "Community trust", "Measurement", "Sustainable delivery"],
    route: "/startups",
  },
  "whole-life": {
    title: "Whole-Life Designer",
    subtitle: "Make progress without sacrificing the person making it",
    description: "Explore trade-offs between ambition, health, relationships, money and meaning. Progress is not only a bigger number; it is a life you can keep living.",
    skills: ["Boundaries", "Health routines", "Relationships", "Sustainable effort"],
    route: "/my-path",
  },
  "general-strategist": {
    title: "Life Strategist",
    subtitle: "Explore a goal, test assumptions and choose your next move",
    description: "A flexible life simulation for a goal that does not fit one category. You will practise setting priorities, seeking evidence and making your next step concrete.",
    skills: ["Clear priorities", "Useful experiments", "People and support", "Consistent action"],
    route: "/my-path",
  },
};

const scenarios: Record<GameType, Scenario[]> = {
  "venture-builder": [
    { title: "Your first year: pick the real problem", context: "You have ambition, limited time and no proof yet that people will pay. Your first choice decides what you learn next.", prompt: "What do you do first?", choices: [
      { title: "Interview 10 potential customers", detail: "Listen for a repeated, expensive problem before writing much code.", outcome: "You learn which problem hurts enough to deserve a solution, and begin building trust with possible customers.", tradeoff: "Progress looks slower because you are learning before building.", effects: { skills: 7, network: 6, execution: 6, capital: 3 } },
      { title: "Build the full product immediately", detail: "Make a polished product based on your original vision.", outcome: "You practise building, but you may discover too late that the market wanted something different.", tradeoff: "More product work now, less customer evidence and more cash at risk.", effects: { skills: 5, execution: 3, capital: -7, wellbeing: -2 } },
      { title: "Keep your income and test on evenings", detail: "Protect your runway while validating one narrow idea after classes or work.", outcome: "You buy yourself time to learn without needing the idea to pay for your life immediately.", tradeoff: "The pace is slower and your schedule needs discipline.", effects: { capital: 7, skills: 3, execution: 4, wellbeing: 1 } },
    ] },
    { title: "The first customer", context: "A potential customer has a messy workflow. They could become your first real user, but their request is not exactly your original idea.", prompt: "How do you respond?", choices: [
      { title: "Solve one painful workflow manually first", detail: "Offer a small, measurable result before automating everything.", outcome: "You gain direct evidence of value and can learn what deserves to be automated.", tradeoff: "Some work is manual and difficult to scale at the start.", effects: { network: 6, capital: 5, execution: 7, skills: 4 } },
      { title: "Refuse to change the vision", detail: "Keep the roadmap pure and hope customers eventually understand.", outcome: "Your product stays focused on your current theory, but feedback may arrive too late.", tradeoff: "You protect focus but accept a higher risk of building the wrong thing.", effects: { skills: 3, capital: -4, network: -3, execution: -1 } },
      { title: "Custom-build every request", detail: "Say yes to every feature to win the account.", outcome: "You may earn early revenue, but each customer can pull you in a different direction.", tradeoff: "Short-term cash can create long-term complexity.", effects: { capital: 6, network: 3, execution: 2, wellbeing: -4 } },
    ] },
    { title: "Runway gets real", context: "Your savings are shrinking. Growth is not guaranteed, and you must decide what money should do for the company.", prompt: "Which move fits your situation?", choices: [
      { title: "Set a strict runway and revenue milestone", detail: "Define what must be true before you spend more or hire.", outcome: "You make the survival conditions visible and can change course before an emergency.", tradeoff: "You may say no to exciting opportunities that do not meet the milestone.", effects: { capital: 8, execution: 6, wellbeing: 2, skills: 2 } },
      { title: "Raise money before proving demand", detail: "Spend time pitching a big story to investors.", outcome: "Fundraising could add time, but without evidence it can consume your focus without changing the customer problem.", tradeoff: "Potential capital comes with dilution, pressure and uncertain timing.", effects: { network: 5, capital: -2, execution: -2, wellbeing: -3 } },
      { title: "Spend personal savings to accelerate", detail: "Put more of your own money into development and launch.", outcome: "You can move faster if the bet works, but the downside now reaches beyond the company.", tradeoff: "Speed increases while your personal safety margin shrinks.", effects: { execution: 5, skills: 3, capital: -9, wellbeing: -4 } },
    ] },
    { title: "Choose your team", context: "Work is growing. You cannot do everything yourself, but the wrong partnership can be costly.", prompt: "What do you do?", choices: [
      { title: "Run a small trial project with a potential co-founder", detail: "Test how you resolve disagreement and deliver before sharing ownership.", outcome: "You collect evidence about trust, speed and working style before making a permanent commitment.", tradeoff: "It takes time to evaluate fit and agree on expectations.", effects: { network: 7, skills: 3, execution: 5 } },
      { title: "Choose your closest friend immediately", detail: "Prioritise familiarity and excitement over complementary skills.", outcome: "The relationship may be supportive, but friendship alone does not establish role fit or commitment.", tradeoff: "An untested partnership can turn unclear responsibilities into conflict.", effects: { network: 4, execution: 1, wellbeing: -2 } },
      { title: "Stay solo and document repeatable work", detail: "Make the process reliable before adding people.", outcome: "You build operating discipline and discover which tasks should be delegated first.", tradeoff: "Growth may be capped by your own available hours.", effects: { skills: 5, execution: 6, capital: 2, network: -2 } },
    ] },
    { title: "How will customers find you?", context: "Your product works for a few people. You need a repeatable way to reach more of the right people.", prompt: "Choose your growth experiment.", choices: [
      { title: "Build a useful niche community", detail: "Teach, share results and earn trust among a specific group.", outcome: "You learn customer language and create a channel that can compound over time.", tradeoff: "Audience trust takes consistent effort and does not grow overnight.", effects: { network: 8, skills: 3, execution: 5, capital: 2 } },
      { title: "Pay for broad advertising immediately", detail: "Buy reach before understanding which message converts.", outcome: "You get data quickly, but weak targeting can burn money without producing learning.", tradeoff: "You exchange cash for speed without knowing whether the economics work.", effects: { skills: 2, execution: 3, capital: -7, network: 1 } },
      { title: "Expand into several markets at once", detail: "Add features and chase every possible customer segment.", outcome: "You create more possibilities, but also more support, product and focus demands.", tradeoff: "Breadth can dilute the one thing that already works.", effects: { skills: 3, network: 2, execution: -2, wellbeing: -4 } },
    ] },
    { title: "A difficult quarter", context: "The numbers are below your hopes. You can defend your original plan, learn from the evidence or pause to protect yourself.", prompt: "What is your next move?", choices: [
      { title: "Review evidence and run a focused pivot", detail: "Talk to users, identify the failed assumption and test one alternative.", outcome: "You turn the setback into information and give the next experiment a clear reason to exist.", tradeoff: "You may need to let go of work you were proud of.", effects: { skills: 7, execution: 7, capital: 3, wellbeing: 1 } },
      { title: "Double down without changing the plan", detail: "Assume the result is only a temporary setback.", outcome: "Extra effort may help if the core assumption is right, but you have not resolved the evidence gap.", tradeoff: "Persistence becomes expensive when it ignores information.", effects: { execution: 3, capital: -6, wellbeing: -5 } },
      { title: "Pause, protect runway and reassess", detail: "Reduce commitments and set a date to decide with clearer evidence.", outcome: "You regain room to think and preserve options for a better-informed next attempt.", tradeoff: "Momentum slows and you must communicate the change honestly.", effects: { capital: 6, wellbeing: 5, skills: 2, execution: -2 } },
    ] },
  ],
  "ai-craft": [
    { title: "Choose your learning engine", context: "AI is moving quickly. You have limited hours and many tempting tutorials.", prompt: "What will you optimise for?", choices: [
      { title: "Learn foundations and build a small project", detail: "Pair core concepts with code you can explain and improve.", outcome: "You gain reusable understanding and a project that exposes what you still need to learn.", tradeoff: "Progress feels less flashy than copying advanced demos.", effects: { skills: 8, execution: 6, wellbeing: 1 } },
      { title: "Collect certificates and courses first", detail: "Finish many courses before attempting a project.", outcome: "You gain exposure to topics, but completion alone may not prove you can build independently.", tradeoff: "More study time can pass without strong evidence of skill.", effects: { skills: 3, execution: 2, capital: -1 } },
      { title: "Jump straight into the trendiest model", detail: "Copy a complex demo without understanding its dependencies.", outcome: "You may see a quick result and discover exciting tools, but debugging becomes harder when you do not understand the pieces.", tradeoff: "Fast initial progress can leave fragile foundations.", effects: { skills: 2, execution: 4, wellbeing: -2 } },
    ] },
    { title: "Prove you can do the work", context: "A recruiter, mentor or customer asks what you have actually built.", prompt: "Which evidence do you create?", choices: [
      { title: "Ship a documented end-to-end project", detail: "Write the problem, decisions, tests, limitations and demo.", outcome: "Other people can inspect your reasoning instead of guessing from a list of tools.", tradeoff: "Polishing and documenting takes time you could spend on another tutorial.", effects: { skills: 6, execution: 8, network: 3 } },
      { title: "Make a flashy demo with no testing", detail: "Optimise for the first impression only.", outcome: "The demo attracts attention, but hidden failure cases may weaken trust.", tradeoff: "Appearance improves faster than reliability.", effects: { execution: 4, network: 3, skills: 1 } },
      { title: "Wait until you feel fully ready", detail: "Keep learning privately until the work feels perfect.", outcome: "You can deepen knowledge, but you miss feedback that would show what to improve.", tradeoff: "You avoid public mistakes but also avoid useful signals.", effects: { skills: 3, network: -3, execution: -2 } },
    ] },
    { title: "Find better feedback", context: "You have hit a difficult technical concept and repeating the same notes is not helping.", prompt: "How do you unblock yourself?", choices: [
      { title: "Break it down, test an example and explain it", detail: "Create a tiny experiment, predict the output and check your reasoning.", outcome: "You isolate the misconception and build a mental model you can reuse.", tradeoff: "One small problem may take longer than skimming another lesson.", effects: { skills: 8, execution: 4, wellbeing: 1 } },
      { title: "Reread the same explanation repeatedly", detail: "Keep the same method and hope it eventually clicks.", outcome: "Familiarity increases, but the missing step may remain hidden.", tradeoff: "Time is spent without enough new feedback.", effects: { skills: 1, execution: -1, wellbeing: -1 } },
      { title: "Ask a focused question in a technical community", detail: "Share a minimal example and describe what you expected.", outcome: "You practise communicating technical problems and may receive a new explanation.", tradeoff: "You need patience and must verify the answer yourself.", effects: { skills: 5, network: 6, execution: 3 } },
    ] },
    { title: "Choose your first experience", context: "You can take on a small practical project, wait for a prestigious opportunity, or join people solving real problems.", prompt: "Which route creates the strongest next step?", choices: [
      { title: "Build for a real user or organisation", detail: "Agree on a small outcome and gather feedback.", outcome: "You learn constraints that tutorials rarely include and gain a concrete story about your work.", tradeoff: "Real users create real deadlines and ambiguity.", effects: { skills: 6, network: 5, execution: 7 } },
      { title: "Apply only to famous companies", detail: "Wait for one high-status opening before trying elsewhere.", outcome: "You practise applications, but the narrow search can delay experience and feedback.", tradeoff: "Prestige filters out useful stepping stones.", effects: { network: 1, execution: 2, wellbeing: -2 } },
      { title: "Join a peer build group", detail: "Work with others, review code and ship together.", outcome: "You gain accountability and learn how engineering decisions affect teammates.", tradeoff: "You need to select collaborators carefully and agree on ownership.", effects: { skills: 4, network: 7, execution: 5 } },
    ] },
    { title: "Your attention gets fragmented", context: "New tools arrive every week. Your unfinished projects are competing with your ambition.", prompt: "What do you do?", choices: [
      { title: "Finish one project before changing tools", detail: "Set a clear definition of done and test it against a real use case.", outcome: "You turn scattered learning into finished evidence and a stronger feedback loop.", tradeoff: "You miss some new trends while finishing.", effects: { skills: 5, execution: 8, wellbeing: 2 } },
      { title: "Switch to a new stack again", detail: "Chase the tool that is currently getting attention.", outcome: "You explore more technology, but repeated switching slows compounding skill.", tradeoff: "Novelty replaces depth and completion.", effects: { skills: 2, execution: -4, wellbeing: -2 } },
      { title: "Reduce the project and ship a small version", detail: "Cut scope until you can finish within a week.", outcome: "You practise prioritising the core value and create something others can test.", tradeoff: "The first version will not include every feature you imagined.", effects: { execution: 7, skills: 4, wellbeing: 2 } },
    ] },
    { title: "Turn skill into opportunity", context: "You have some evidence of ability, but the next step is not obvious.", prompt: "How do you move forward?", choices: [
      { title: "Publish the work and ask three people for feedback", detail: "Make your project understandable and invite specific critique.", outcome: "You create visible proof and a practical route to mentorship or collaboration.", tradeoff: "You must be open about limitations and unfinished areas.", effects: { network: 7, execution: 5, skills: 3 } },
      { title: "Keep everything private until it is perfect", detail: "Wait until no one can find a flaw.", outcome: "You retain control of the presentation, but feedback and opportunity arrive more slowly.", tradeoff: "Perfection becomes a moving deadline.", effects: { skills: 2, execution: -2, network: -4 } },
      { title: "Apply for a stretch role and learn the gaps", detail: "Use real requirements to choose the next skills to practise.", outcome: "You receive a stronger signal about what the market values and what you need next.", tradeoff: "Rejection is possible and applications take effort.", effects: { skills: 4, network: 3, execution: 4 } },
    ] },
  ],
  "capital-builder": [
    { title: "Build a stable base", context: "Your income and expenses are not yet predictable. Big goals are difficult when every surprise becomes an emergency.", prompt: "What do you do first?", choices: [
      { title: "Map cash flow and build a realistic buffer", detail: "Understand essential spending and set a manageable first savings target.", outcome: "You make your current position clearer and give unexpected expenses less power over your choices.", tradeoff: "Some exciting spending and opportunities may need to wait.", effects: { capital: 8, execution: 5, wellbeing: 3 } },
      { title: "Chase a high-risk shortcut", detail: "Put your hopes on a fast win before building a base.", outcome: "A lucky result is possible, but the plan depends on uncertain outcomes you do not control.", tradeoff: "Potential upside comes with a chance of losing money you may need.", effects: { capital: -8, wellbeing: -3, execution: 2 } },
      { title: "Invest in one marketable skill", detail: "Choose a skill that can realistically improve your earning options.", outcome: "You build earning power while learning how long the skill takes to pay off.", tradeoff: "The payoff takes practice and may not arrive immediately.", effects: { skills: 7, execution: 5, capital: -2 } },
    ] },
    { title: "Increase earning power", context: "Your budget is tight, but cutting every small pleasure will not necessarily solve an income problem.", prompt: "What is your next move?", choices: [
      { title: "Improve a skill and pursue better-paid work", detail: "Use job requirements and feedback to choose what to learn.", outcome: "You address the income side and create a path to test whether employers or clients value the skill.", tradeoff: "Training and applications take time before results appear.", effects: { skills: 7, network: 3, execution: 6 } },
      { title: "Cut every non-essential expense", detail: "Reduce costs as far as possible without checking sustainability.", outcome: "Spending falls quickly, but an overly strict plan may be difficult to maintain.", tradeoff: "Cost control helps until it harms health, relationships or work capacity.", effects: { capital: 5, wellbeing: -4, execution: 2 } },
      { title: "Try several side hustles at once", detail: "Start many income experiments at the same time.", outcome: "You expose yourself to different possibilities, but each receives less focused effort.", tradeoff: "More activity can mean less proof that any one offer works.", effects: { skills: 2, network: 3, execution: -2, wellbeing: -3 } },
    ] },
    { title: "A financial surprise arrives", context: "An unexpected expense appears just as you are making progress.", prompt: "How do you respond?", choices: [
      { title: "Use a planned buffer and review the budget", detail: "Protect essential needs and update the plan using real numbers.", outcome: "You handle the surprise without pretending the original plan still fits.", tradeoff: "A goal may need a more realistic timeline.", effects: { capital: 5, execution: 5, wellbeing: 3 } },
      { title: "Borrow without calculating repayment", detail: "Solve the immediate pressure and think about repayment later.", outcome: "The immediate problem may ease, but repayment uncertainty can create future pressure.", tradeoff: "Speed now can transfer stress into the next months.", effects: { capital: -6, wellbeing: -4, execution: 1 } },
      { title: "Pause the goal and ask for informed help", detail: "Seek trusted advice and check available support before committing.", outcome: "You create more options and reduce the chance of making a rushed decision alone.", tradeoff: "Asking for support can feel uncomfortable and take time.", effects: { network: 4, wellbeing: 4, execution: 2 } },
    ] },
    { title: "Choose your risk rules", context: "You are hearing confident claims about an opportunity. Evidence and incentives are not fully clear.", prompt: "What is your rule?", choices: [
      { title: "Understand the downside before committing", detail: "Check how loss, fees, liquidity and time could affect your plan.", outcome: "You practise evaluating risk before acting and avoid treating confidence as evidence.", tradeoff: "You may miss some fast-moving opportunities.", effects: { skills: 5, capital: 4, execution: 3 } },
      { title: "Follow the crowd before the price moves", detail: "Act because people around you expect a quick gain.", outcome: "You get experience making a decision quickly, but you have not established whether the risk is suitable.", tradeoff: "Social pressure can obscure the actual downside.", effects: { capital: -7, network: 2, wellbeing: -3 } },
      { title: "Keep learning and wait until the decision is clear", detail: "Set a deadline to research rather than procrastinating indefinitely.", outcome: "You gain time to compare credible information and decide with clearer assumptions.", tradeoff: "Research must lead to a decision, not endless delay.", effects: { skills: 4, execution: 2, wellbeing: 1 } },
    ] },
    { title: "Lifestyle grows with income", context: "You earn a little more. Friends, advertising and convenience pull you toward higher spending.", prompt: "What habit do you build?", choices: [
      { title: "Decide saving and spending rules in advance", detail: "Choose a balanced plan that still leaves room for real life.", outcome: "You turn good intentions into a repeatable system instead of a monthly debate.", tradeoff: "You will sometimes say no to an impulse.", effects: { capital: 7, execution: 5, wellbeing: 1 } },
      { title: "Upgrade everything immediately", detail: "Treat higher income as permission to raise every expense.", outcome: "Daily comfort may improve, but your cost base rises with it.", tradeoff: "More income can disappear without creating more freedom.", effects: { wellbeing: 3, capital: -5, execution: -1 } },
      { title: "Save so aggressively that rest disappears", detail: "Try to hit the financial goal as fast as possible.", outcome: "Your savings may rise for a period, but a plan that removes recovery can become fragile.", tradeoff: "A bigger buffer is less useful if the process is not sustainable.", effects: { capital: 8, wellbeing: -7, network: -3 } },
    ] },
    { title: "Review what freedom means", context: "You have made progress. The next financial decision should support a life, not replace one.", prompt: "What will you optimise next?", choices: [
      { title: "Set a clear definition of enough and review the plan", detail: "Tie money goals to security, time, choices and the people you care about.", outcome: "You make the target more useful and can measure whether your plan is creating the freedom you wanted.", tradeoff: "Your definition may not impress people who only compare numbers.", effects: { wellbeing: 5, execution: 4, capital: 3 } },
      { title: "Increase the target every time you get closer", detail: "Use comparison and status to keep raising the number.", outcome: "Ambition stays high, but the finish line can move faster than your satisfaction.", tradeoff: "There is no natural stopping point without chosen priorities.", effects: { execution: 4, capital: 2, wellbeing: -5 } },
      { title: "Use some progress to strengthen relationships and health", detail: "Invest time in the people and routines that make freedom valuable.", outcome: "You expand the definition of success beyond a financial score.", tradeoff: "Some money milestones may take longer.", effects: { wellbeing: 7, network: 5, execution: 1 } },
    ] },
  ],
  "academic-strategist": [
    { title: "Your semester starts", context: "Several courses feel difficult. Rereading is comfortable, but it does not always show whether you can retrieve or apply the ideas.", prompt: "Which study system do you choose?", choices: [
      { title: "Use active recall and spaced practice", detail: "Close the notes, solve questions, check mistakes and revisit them later.", outcome: "You get direct evidence of what you understand and where you need a smaller explanation.", tradeoff: "Practice feels harder than passively recognising familiar notes.", effects: { skills: 8, execution: 6, wellbeing: 1 } },
      { title: "Reread every note repeatedly", detail: "Prioritise familiarity and neat summaries.", outcome: "You remember the layout of the notes, but gaps may remain hidden until a test.", tradeoff: "Time spent can exceed the learning gained.", effects: { skills: 2, execution: 1, wellbeing: -1 } },
      { title: "Study only when an exam is close", detail: "Use urgency to force attention.", outcome: "Short bursts may cover material, but there is less time to recover from misunderstandings.", tradeoff: "Stress rises and forgetting may be faster.", effects: { skills: 3, execution: 2, wellbeing: -4 } },
    ] },
    { title: "A difficult concept blocks you", context: "One topic is still confusing after your first attempt. You need a different kind of feedback.", prompt: "What is your next move?", choices: [
      { title: "Solve a tiny example and explain each step", detail: "Find the exact line where your prediction stops matching the result.", outcome: "You isolate the misconception and build understanding you can use on new problems.", tradeoff: "It takes patience to work from a small example.", effects: { skills: 8, execution: 4 } },
      { title: "Memorise the worked solution", detail: "Learn the pattern without checking why the steps work.", outcome: "You may reproduce familiar questions, but small changes can make the method fail.", tradeoff: "Short-term recall replaces flexible understanding.", effects: { skills: 2, execution: 2 } },
      { title: "Ask a lecturer or study partner a specific question", detail: "Show your attempt and point to the step you cannot explain.", outcome: "You use feedback more efficiently and build a learning relationship.", tradeoff: "You need to prepare the question instead of asking vaguely.", effects: { skills: 5, network: 5, execution: 3 } },
    ] },
    { title: "Funding and opportunity", context: "Scholarships, internships and university opportunities ask for different documents and have different deadlines.", prompt: "How do you organise the search?", choices: [
      { title: "Build a verified deadline and eligibility tracker", detail: "Check official sources and separate confirmed requirements from assumptions.", outcome: "You spend more effort on realistic applications and are less likely to miss a deadline.", tradeoff: "Research and document gathering happen before the application feels exciting.", effects: { execution: 7, skills: 3, capital: 3 } },
      { title: "Apply broadly using the same generic form", detail: "Maximise application count without checking fit carefully.", outcome: "You gain practice, but weak eligibility matches and generic submissions may waste effort.", tradeoff: "More submissions do not guarantee more qualified applications.", effects: { execution: 3, skills: 1, wellbeing: -2 } },
      { title: "Wait for someone to tell you which scholarship to apply for", detail: "Avoid the search because it looks complicated.", outcome: "You avoid some research effort, but your options depend on who happens to inform you.", tradeoff: "Hidden opportunities may pass by.", effects: { wellbeing: 1, execution: -3, network: -1 } },
    ] },
    { title: "Beyond the classroom", context: "Your grades matter, but you also need evidence of ability and people who can help you learn.", prompt: "What do you add to your semester?", choices: [
      { title: "Build one project or portfolio proof", detail: "Apply a course idea to a concrete problem and write down what you learned.", outcome: "You connect academic learning to visible skill and can discuss your work with others.", tradeoff: "You must keep the project small enough to protect core study.", effects: { skills: 5, execution: 6, network: 2 } },
      { title: "Join several clubs and committees", detail: "Explore widely and meet people across campus.", outcome: "You broaden your relationships and interests, but too many commitments may compete with study.", tradeoff: "Participation needs boundaries to remain useful.", effects: { network: 7, wellbeing: 2, execution: -2 } },
      { title: "Focus only on grades and avoid everyone", detail: "Remove all outside commitments.", outcome: "Your study time becomes easier to protect, but you may miss feedback, support and practical opportunities.", tradeoff: "Academic focus can become isolation if not balanced.", effects: { skills: 5, execution: 4, network: -4, wellbeing: -2 } },
    ] },
    { title: "Mid-semester pressure", context: "Assignments, group work and exams begin to overlap. Your calendar is full.", prompt: "How do you respond?", choices: [
      { title: "Prioritise by deadline and learning value", detail: "Break work into small blocks and ask early when instructions are unclear.", outcome: "You reduce avoidable surprises and can spend deeper effort on the most demanding material.", tradeoff: "You must resist low-value distractions.", effects: { execution: 7, skills: 4, wellbeing: 2 } },
      { title: "Say yes to every extra request", detail: "Try to please everyone and work late to catch up.", outcome: "People may appreciate your help, but your own core work becomes harder to protect.", tradeoff: "Being available all the time is not the same as being reliable.", effects: { network: 3, wellbeing: -6, execution: -2 } },
      { title: "Drop the hardest course work until later", detail: "Finish easy tasks first to feel productive.", outcome: "Small tasks disappear, but the hardest learning problem has less time for feedback and repair.", tradeoff: "Avoidance often moves pressure into the final week.", effects: { execution: 1, skills: -2, wellbeing: -2 } },
    ] },
    { title: "Convert this semester into options", context: "The semester is ending. You need to decide how to use your results, experience and feedback.", prompt: "What next?", choices: [
      { title: "Review errors, results and next-term gaps", detail: "Create a specific plan from evidence, not only from how hard the semester felt.", outcome: "You identify what worked and can make the next plan more precise.", tradeoff: "Looking honestly at errors can be uncomfortable.", effects: { skills: 6, execution: 5, wellbeing: 2 } },
      { title: "Focus on the grade and forget the process", detail: "Move on without checking how you learned.", outcome: "You celebrate or recover from the result, but the same avoidable weaknesses may return.", tradeoff: "A result alone does not show which methods should change.", effects: { wellbeing: 2, skills: 1, execution: 1 } },
      { title: "Share your work and ask for a recommendation", detail: "Make it easy for a lecturer, supervisor or mentor to see your contribution.", outcome: "You make your work visible and build relationships that may support a future application.", tradeoff: "You need to give people time and concrete evidence.", effects: { network: 6, execution: 4, skills: 2 } },
    ] },
  ],
  "impact-builder": [
    { title: "Choose a problem worth solving", context: "You want to improve something in your community, but the biggest-looking problem is not always the best place to begin.", prompt: "How do you choose?", choices: [
      { title: "Listen to people affected by the problem", detail: "Interview a small, diverse group and map the pain they describe.", outcome: "You begin with lived experience and can test whether you understand the real issue.", tradeoff: "Listening may challenge your favourite solution.", effects: { network: 7, skills: 5, execution: 4 } },
      { title: "Choose the most impressive idea first", detail: "Start with the solution that looks most ambitious publicly.", outcome: "You can attract attention early, but the idea may not fit the community's priorities.", tradeoff: "Visibility arrives before evidence of need.", effects: { network: 3, execution: 2, capital: -3 } },
      { title: "Study the issue for months before speaking to users", detail: "Try to become an expert before testing your assumptions.", outcome: "You develop context, but your understanding remains second-hand until you engage people directly.", tradeoff: "Research needs a clear point when it turns into a test.", effects: { skills: 6, execution: -2, network: -2 } },
    ] },
    { title: "Design the first pilot", context: "You understand the problem better. You now need to test a solution with limited money and time.", prompt: "What do you launch?", choices: [
      { title: "Run a small pilot with a measurable result", detail: "Serve a defined group and measure one outcome before expanding.", outcome: "You learn whether the intervention changes anything useful and what delivery really costs.", tradeoff: "The pilot reaches fewer people at first.", effects: { skills: 5, execution: 8, capital: 2, network: 3 } },
      { title: "Launch nationally to maximise reach", detail: "Seek scale before proving the delivery model.", outcome: "A successful launch could reach many, but unclear delivery and measurement can waste scarce resources.", tradeoff: "Scale makes early errors more expensive.", effects: { network: 4, execution: 2, capital: -7, wellbeing: -3 } },
      { title: "Build a polished campaign before testing", detail: "Prioritise awareness and visuals.", outcome: "You may make the problem visible, but awareness alone does not show that lives improved.", tradeoff: "A strong story can hide weak outcome evidence.", effects: { network: 5, skills: 2, execution: 1 } },
    ] },
    { title: "Earn trust and partnerships", context: "You need people who understand local realities and can help deliver the work.", prompt: "How do you build support?", choices: [
      { title: "Co-design with local partners", detail: "Agree on responsibilities, credit, safeguards and how feedback changes the work.", outcome: "Partners have a reason to contribute and can challenge assumptions early.", tradeoff: "Shared decisions may take longer than command-and-control.", effects: { network: 8, skills: 3, execution: 4 } },
      { title: "Keep decisions central to yourself", detail: "Move quickly and retain control over every detail.", outcome: "Decisions are fast, but the project becomes dependent on one person and local insight may be missed.", tradeoff: "Control today can reduce resilience tomorrow.", effects: { execution: 4, network: -4, wellbeing: -2 } },
      { title: "Ask a sponsor for money before agreeing on delivery", detail: "Secure funding first and define the work later.", outcome: "You may get resources, but unclear commitments can create pressure to deliver the wrong outcome.", tradeoff: "Funding is useful only when it fits the mission and capability.", effects: { capital: 4, network: 2, execution: -2 } },
    ] },
    { title: "Measure what matters", context: "People praise the project, but you do not yet know whether it is producing lasting improvement.", prompt: "What evidence do you track?", choices: [
      { title: "Measure outcomes and costs honestly", detail: "Track who benefits, who does not, what changed and what delivery required.", outcome: "You can improve what works and be transparent about what is still uncertain.", tradeoff: "The results may be less flattering than the original story.", effects: { skills: 7, execution: 5, capital: 2 } },
      { title: "Report only attendance and publicity", detail: "Use easy-to-count activity as proof of impact.", outcome: "You can show that activity occurred, but the evidence may not establish that the situation improved.", tradeoff: "Vanity metrics can hide ineffective delivery.", effects: { network: 3, execution: 2, skills: -1 } },
      { title: "Wait until you have perfect data", detail: "Avoid sharing results until every uncertainty is resolved.", outcome: "You protect against overclaiming, but useful learning is delayed.", tradeoff: "Transparency can include uncertainty rather than hide it.", effects: { skills: 3, execution: -2, network: -2 } },
    ] },
    { title: "Protect the work from founder burnout", context: "The project depends heavily on you. Demand is growing, and your energy is shrinking.", prompt: "What needs to change?", choices: [
      { title: "Document the work and train another owner", detail: "Create repeatable processes and share decision-making.", outcome: "The mission becomes less dependent on your constant availability.", tradeoff: "Training others requires patience and trust.", effects: { network: 5, execution: 6, wellbeing: 4 } },
      { title: "Work harder and remain indispensable", detail: "Take on every urgent task personally.", outcome: "Immediate problems may be solved, but the project becomes fragile if you cannot continue at that pace.", tradeoff: "Personal exhaustion becomes an operational risk.", effects: { execution: 3, wellbeing: -8, network: -2 } },
      { title: "Reduce scope to protect quality", detail: "Pause lower-impact work and focus on the strongest intervention.", outcome: "You protect core delivery and give the team room to learn from the work that matters most.", tradeoff: "Some attractive side projects must wait.", effects: { execution: 5, wellbeing: 4, capital: 2 } },
    ] },
    { title: "Decide how the impact continues", context: "Your pilot has taught you something. The next phase must fit the evidence and the resources available.", prompt: "Which path do you take?", choices: [
      { title: "Expand only after the model works reliably", detail: "Set a clear quality bar, cost model and partner plan for expansion.", outcome: "You can grow with a stronger understanding of what has to remain true.", tradeoff: "Expansion is slower and requires saying no to some demand.", effects: { skills: 4, capital: 4, execution: 6 } },
      { title: "Replicate the project everywhere immediately", detail: "Use early enthusiasm as proof that the model will travel.", outcome: "Reach could grow rapidly, but differences between communities may undermine delivery.", tradeoff: "Replication requires adaptation, not only copying.", effects: { network: 5, capital: -5, execution: 1 } },
      { title: "Publish the learning and invite other teams to adapt it", detail: "Share evidence, limitations and reusable tools.", outcome: "Other people can learn from the work and adapt it beyond your own capacity.", tradeoff: "You share credit and cannot control every adaptation.", effects: { skills: 4, network: 7, execution: 4 } },
    ] },
  ],
  "whole-life": [
    { title: "Define a success you can live with", context: "You have several ambitions. Chasing all of them at maximum speed is not a plan.", prompt: "What do you prioritise?", choices: [
      { title: "Choose one main goal and two protected life priorities", detail: "Decide what matters this season and what must not be sacrificed.", outcome: "You give your effort a clear direction while protecting relationships or health.", tradeoff: "Some good goals will wait their turn.", effects: { execution: 6, wellbeing: 5, skills: 2 } },
      { title: "Try to maximise every goal at once", detail: "Fill your week with the most ambitious version of every plan.", outcome: "You may make visible progress briefly, but competing commitments can exhaust your capacity.", tradeoff: "An overloaded plan has no room for surprises.", effects: { execution: 3, wellbeing: -6, network: -2 } },
      { title: "Avoid choosing until you feel certain", detail: "Keep every option open and delay commitment.", outcome: "You protect flexibility, but your days can pass without enough progress to learn what fits.", tradeoff: "Not choosing is still a choice about how time gets used.", effects: { wellbeing: 1, execution: -4, skills: -1 } },
    ] },
    { title: "Energy is a real resource", context: "Your plan requires more hours than you consistently have. You are tired and basic routines are slipping.", prompt: "What do you change?", choices: [
      { title: "Build a realistic sleep, movement and focus routine", detail: "Protect the basics and schedule demanding work in suitable blocks.", outcome: "You create a more repeatable foundation for learning, work and relationships.", tradeoff: "You may have to reduce short-term output to recover capacity.", effects: { wellbeing: 8, execution: 4, skills: 2 } },
      { title: "Use late nights to catch up every day", detail: "Treat rest as time you can always borrow from.", outcome: "You may finish some tasks quickly, but repeated recovery debt can make the whole plan unstable.", tradeoff: "A temporary push becomes harmful when it has no end date.", effects: { execution: 3, wellbeing: -8, skills: 1 } },
      { title: "Drop every difficult goal", detail: "Remove pressure without choosing a smaller alternative.", outcome: "Immediate pressure falls, but important goals may remain unresolved.", tradeoff: "Rest works best alongside an intentional next step.", effects: { wellbeing: 4, execution: -3, skills: -1 } },
    ] },
    { title: "Relationships need attention too", context: "Someone important feels that your ambitions leave little room for them.", prompt: "How do you respond?", choices: [
      { title: "Have an honest conversation and agree on time", detail: "Listen, explain your constraints and make a realistic commitment.", outcome: "You turn a vague conflict into a conversation about needs and boundaries.", tradeoff: "You may discover the other person needs something different than expected.", effects: { network: 8, wellbeing: 4, execution: 1 } },
      { title: "Assume they will understand later", detail: "Avoid the uncomfortable conversation and keep working.", outcome: "You protect the current schedule, but unresolved feelings may grow.", tradeoff: "Silence can cost trust over time.", effects: { execution: 2, network: -6, wellbeing: -3 } },
      { title: "Cancel your own ambitions to avoid conflict", detail: "Say yes to everything someone asks of you.", outcome: "Conflict may ease briefly, but unclear boundaries can create resentment.", tradeoff: "Caring for others does not require erasing your own needs.", effects: { network: 3, wellbeing: -3, execution: -3 } },
    ] },
    { title: "Handle comparison and distraction", context: "Other people appear ahead of you. Your attention keeps moving toward their milestones.", prompt: "What helps you move forward?", choices: [
      { title: "Measure your own weekly actions and learning", detail: "Use a private scoreboard tied to your chosen goal.", outcome: "You return attention to actions you can control and review whether the plan works.", tradeoff: "Progress may look less impressive than public comparison.", effects: { execution: 7, wellbeing: 3, skills: 2 } },
      { title: "Copy someone else's full life plan", detail: "Use their routine without checking whether it fits your constraints.", outcome: "You gain structure quickly, but a plan built for different resources may not be sustainable.", tradeoff: "Borrowing ideas works better than copying context.", effects: { execution: 2, wellbeing: -2, skills: 1 } },
      { title: "Avoid every person who seems more successful", detail: "Reduce exposure to protect confidence.", outcome: "Some comparison pressure falls, but you may also cut off useful mentors and peers.", tradeoff: "Boundaries should protect attention without cutting off support.", effects: { wellbeing: 3, network: -4, execution: 1 } },
    ] },
    { title: "An unexpected responsibility appears", context: "Family, health or work suddenly needs more attention, so your original schedule no longer fits.", prompt: "How do you adapt?", choices: [
      { title: "Reduce scope and keep the essential habit", detail: "Choose a minimum version of the goal that fits this season.", outcome: "You preserve continuity without pretending your available time has not changed.", tradeoff: "The timeline extends while the responsibility is handled.", effects: { wellbeing: 5, execution: 5, skills: 2 } },
      { title: "Pretend nothing has changed", detail: "Keep the plan and try to absorb all new work.", outcome: "You preserve the plan on paper, but the gap between expectation and capacity grows.", tradeoff: "Rigidity can turn a difficult season into a long setback.", effects: { execution: 1, wellbeing: -7, network: -2 } },
      { title: "Ask for help and renegotiate commitments", detail: "Tell affected people what is changing and discuss support.", outcome: "You share the load and build a more realistic agreement with people around you.", tradeoff: "Not every request will be accepted immediately.", effects: { network: 6, wellbeing: 5, execution: 3 } },
    ] },
    { title: "Review the life you are building", context: "You have learned more about your values and limits. The next season should reflect that learning.", prompt: "What do you do next?", choices: [
      { title: "Review what gave meaning and what depleted you", detail: "Use evidence from your weeks to adjust the next 90 days.", outcome: "You make the next plan more personal and less dependent on generic ideas of success.", tradeoff: "Some ambitions may need a different route or timeline.", effects: { wellbeing: 7, execution: 5, skills: 2 } },
      { title: "Raise every target because you made progress", detail: "Treat any improvement as a reason to work harder.", outcome: "You keep ambition high, but you risk recreating the same imbalance.", tradeoff: "More is not always better when costs are hidden.", effects: { execution: 4, skills: 2, wellbeing: -5 } },
      { title: "Keep the same routines without reviewing them", detail: "Avoid changing a plan that now feels familiar.", outcome: "Familiarity creates stability, but ineffective routines can continue unnoticed.", tradeoff: "A good system still needs occasional evidence-based adjustment.", effects: { wellbeing: 1, execution: 1, skills: -1 } },
    ] },
  ],
  "general-strategist": [
    { title: "Turn the goal into evidence", context: "You have a goal, but it is still too broad to guide your calendar.", prompt: "What is your first move?", choices: [
      { title: "Define a measurable 90-day milestone", detail: "Make the next step small enough to test and clear enough to review.", outcome: "Your goal becomes actionable and you can learn whether the route is realistic.", tradeoff: "You need to say no to work that does not support the milestone.", effects: { execution: 7, skills: 3, wellbeing: 2 } },
      { title: "Create a ten-year plan in detail", detail: "Try to map every step before you begin.", outcome: "You think about the long term, but many assumptions will change before the plan is complete.", tradeoff: "Planning can become a substitute for gathering evidence.", effects: { skills: 3, execution: -2, wellbeing: -1 } },
      { title: "Wait for inspiration", detail: "Keep the goal flexible and act when motivation appears.", outcome: "You stay open to ideas, but progress depends heavily on how you feel each day.", tradeoff: "Motivation is unreliable as the only operating system.", effects: { wellbeing: 1, execution: -4 } },
    ] },
    { title: "Find your biggest constraint", context: "You cannot improve everything at once. One missing resource may be blocking most progress.", prompt: "Where do you look?", choices: [
      { title: "Identify the bottleneck and test one fix", detail: "Ask what, if improved, would make several other steps easier.", outcome: "You direct effort toward the current limiting factor instead of scattering it.", tradeoff: "You may discover that the problem is less exciting than the solution.", effects: { skills: 6, execution: 6 } },
      { title: "Work longer on every part of the plan", detail: "Add effort instead of examining the system.", outcome: "More time may produce progress, but it may not resolve the actual bottleneck.", tradeoff: "Extra hours have an opportunity cost.", effects: { execution: 3, wellbeing: -4, skills: 1 } },
      { title: "Buy tools before understanding the need", detail: "Try to solve uncertainty with more resources.", outcome: "Tools can help, but they cannot replace a clear problem definition.", tradeoff: "Spending can create a feeling of action without a tested result.", effects: { capital: -4, execution: 1, skills: 1 } },
    ] },
    { title: "Choose people and feedback", context: "You have reached the edge of what you can see alone.", prompt: "What do you do?", choices: [
      { title: "Find two people who will challenge your assumptions", detail: "Ask for specific feedback and test what they say.", outcome: "You broaden your perspective and have a better chance of seeing a blind spot.", tradeoff: "Good feedback may be uncomfortable or contradictory.", effects: { network: 7, skills: 4, execution: 3 } },
      { title: "Ask only people who already agree with you", detail: "Use reassurance to protect confidence.", outcome: "You feel supported, but the most important assumptions remain untested.", tradeoff: "Comfort is not the same as evidence.", effects: { network: 3, skills: -1, execution: 1 } },
      { title: "Keep the whole plan private", detail: "Avoid sharing until the outcome is guaranteed.", outcome: "You protect privacy, but you also delay collaboration and external feedback.", tradeoff: "Some uncertainty can only be reduced by testing with other people.", effects: { skills: 2, network: -4, execution: -1 } },
    ] },
    { title: "A tempting opportunity appears", context: "A new opportunity looks exciting but would pull time away from your current priority.", prompt: "How do you decide?", choices: [
      { title: "Compare it against your current goal and capacity", detail: "Set a rule for what must be true before you switch.", outcome: "You can explain the trade-off and avoid confusing novelty with strategic fit.", tradeoff: "You may decline a good opportunity that does not fit this season.", effects: { skills: 4, execution: 5, wellbeing: 2 } },
      { title: "Say yes immediately", detail: "Treat every opportunity as too valuable to miss.", outcome: "You expand your exposure, but your attention becomes harder to direct.", tradeoff: "Every yes spends time that belongs to something else.", effects: { network: 4, execution: -3, wellbeing: -2 } },
      { title: "Reject every unfamiliar opportunity", detail: "Protect the plan by avoiding uncertainty.", outcome: "You maintain focus, but may miss evidence that could improve your direction.", tradeoff: "Focus and openness both require deliberate boundaries.", effects: { execution: 3, network: -2, skills: -1 } },
    ] },
    { title: "The plan meets reality", context: "Your first attempt produces mixed results. You need to decide what the evidence means.", prompt: "What happens next?", choices: [
      { title: "Run a review and adapt the next attempt", detail: "Separate what you controlled from what you assumed.", outcome: "You turn imperfect results into a better next experiment.", tradeoff: "Changing course means acknowledging that a first idea was incomplete.", effects: { skills: 7, execution: 6, wellbeing: 2 } },
      { title: "Repeat the same plan with more effort", detail: "Assume persistence alone will fix the result.", outcome: "Additional effort can help if execution was the issue, but the underlying assumption may still be wrong.", tradeoff: "Persistence without review can compound mistakes.", effects: { execution: 3, capital: -2, wellbeing: -3 } },
      { title: "Abandon the goal entirely", detail: "Treat one difficult result as proof the goal is wrong.", outcome: "You escape the current problem quickly, but lose a chance to distinguish a poor route from a poor goal.", tradeoff: "A change of direction should be informed, not only reactive.", effects: { wellbeing: 2, execution: -3, skills: -1 } },
    ] },
    { title: "Choose the next 90 days", context: "You now have more evidence about the goal, your resources and the people who can help.", prompt: "Which operating rule will you use?", choices: [
      { title: "Pick one milestone, one habit and one review date", detail: "Make progress observable and set a date to update the plan.", outcome: "You create a repeatable cycle of action, feedback and adjustment.", tradeoff: "The scoreboard will expose when a commitment has not been kept.", effects: { execution: 7, skills: 3, wellbeing: 3 } },
      { title: "Keep many goals open without ranking them", detail: "Avoid the discomfort of choosing priorities.", outcome: "You preserve options but can struggle to decide where each hour should go.", tradeoff: "An unranked list often hides the real opportunity cost.", effects: { skills: 1, execution: -3, wellbeing: -1 } },
      { title: "Focus only on the final outcome", detail: "Ignore process measures and wait to see the result.", outcome: "The destination remains clear, but you have fewer signals to help correct the route early.", tradeoff: "Results may arrive long after a bad process began.", effects: { execution: 2, skills: 1 } },
    ] },
  ],
};

function inferGameType(goal: string): GameType {
  const value = goal.toLowerCase();
  if (/billion|unicorn|startup|founder|build a company|business owner/.test(value)) return "venture-builder";
  if (/ai|machine learning|robot|software|computer|engineer|developer|technology/.test(value)) return "ai-craft";
  if (/financial independence|wealth|money|financial freedom|retire early/.test(value)) return "capital-builder";
  if (/university|scholarship|first-class|grade|gpa|academic|exam|study/.test(value)) return "academic-strategist";
  if (/africa|community|impact|nonprofit|social change|help people/.test(value)) return "impact-builder";
  if (/health|relationship|family|balanced|happiness|peace|wellbeing|well-being/.test(value)) return "whole-life";
  return "general-strategist";
}

function initialMetrics(stage: string): Metrics {
  const skills = stage === "Secondary school / recent graduate" ? 18 : stage === "University student" ? 28 : stage === "Early-career professional" ? 42 : stage === "Experienced professional" ? 58 : 36;
  const capital = stage === "Experienced professional" ? 45 : stage === "Early-career professional" ? 32 : stage === "Early-stage founder" ? 22 : 18;
  const network = stage === "Experienced professional" ? 42 : stage === "Early-career professional" ? 30 : 20;
  return { skills, capital, network, wellbeing: 68, execution: 24 };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function rowToSession(row: LifeGameRow): LifeGameSession {
  return {
    runId: row.id,
    goal: row.goal,
    gameType: row.game_type as GameType,
    startingStage: row.starting_stage,
    weeklyHours: row.weekly_hours,
    riskProfile: row.risk_profile as RiskProfile,
    horizonYears: row.time_horizon_years,
    currentRound: row.current_round,
    metrics: row.metrics as unknown as Metrics,
    decisions: row.decisions as unknown as DecisionRecord[],
    status: row.status === "completed" ? "completed" : "in_progress",
  };
}

function safeSession(value: unknown): LifeGameSession | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<LifeGameSession>;
  if (!candidate.goal || !candidate.gameType || !candidate.metrics || !Array.isArray(candidate.decisions)) return null;
  if (!gameMeta[candidate.gameType as GameType]) return null;
  return candidate as LifeGameSession;
}

function effectEntries(effects: Partial<Metrics>): Array<[MetricKey, number]> {
  return (Object.keys(metricNames) as MetricKey[])
    .map((key) => [key, effects[key] ?? 0] as [MetricKey, number])
    .filter((entry) => entry[1] !== 0);
}

function outcomeLabel(metrics: Metrics): { title: string; body: string } {
  if (metrics.wellbeing < 35) return { title: "Your pace is becoming fragile", body: "The simulation shows that effort is outpacing recovery. In real life, protect your health and support system before adding more commitments." };
  if (metrics.capital < 25) return { title: "Your runway needs protection", body: "Money or time resources are becoming a constraint. Reduce avoidable risk and design a smaller experiment you can afford to complete." };
  if (metrics.skills >= 65 && metrics.execution >= 60) return { title: "You are building compounding capability", body: "Your choices favour learning and delivery. Keep turning each cycle into something finished, tested and useful to others." };
  if (metrics.network < 30) return { title: "Your plan is too isolated", body: "The simulation suggests your route depends heavily on solo effort. Add feedback, peers, mentors or people who can challenge your assumptions." };
  if (metrics.execution >= 60) return { title: "Your strongest asset is follow-through", body: "You favour visible action. Keep checking whether the work is producing the outcome you wanted, rather than measuring busyness alone." };
  return { title: "Your next advantage is consistency", body: "The next step is not a bigger dream. Choose a small repeatable action, get feedback and update the plan with evidence." };
}

function thirtyDayMission(session: LifeGameSession): string[] {
  const common = [
    "Write your goal in one sentence and define one measurable result for the next 30 days.",
    "Schedule four weekly review sessions. Record what you tried, what happened and what you will change.",
  ];
  if (session.gameType === "venture-builder") return [
    "Speak with 10 potential customers about one painful problem. Do not pitch first; record their actual workflow and words.",
    "Build the smallest test of value and ask at least three people to use it or commit to a next step.",
    ...common,
  ];
  if (session.gameType === "ai-craft") return [
    "Choose one skill gap from your goal and practise it in four focused sessions each week.",
    "Ship one small project with a README, tests or example inputs, known limitations and a demo.",
    ...common,
  ];
  if (session.gameType === "capital-builder") return [
    "Write down current income, essential costs, debts and upcoming obligations using real numbers.",
    "Choose one earning-power experiment and one manageable money habit. Avoid committing money you cannot afford to lose.",
    ...common,
  ];
  if (session.gameType === "academic-strategist") return [
    "Create a weekly course plan with active-recall questions and spaced reviews for the hardest two topics.",
    "Complete one timed self-test, analyse every error and ask for help on the exact step you cannot explain.",
    ...common,
  ];
  if (session.gameType === "impact-builder") return [
    "Talk with five people affected by the problem and document what they say they need, including disagreements.",
    "Design a low-cost pilot with one outcome measure and a clear way to collect feedback safely.",
    ...common,
  ];
  if (session.gameType === "whole-life") return [
    "Choose one sustainable routine that supports energy, such as a consistent wind-down time or scheduled movement.",
    "Have one honest conversation about a relationship, responsibility or boundary that deserves attention.",
    ...common,
  ];
  return [
    "Identify the most important assumption behind your goal and design one low-cost test for it.",
    "Ask two people with relevant experience to challenge the plan, then make one evidence-based adjustment.",
    ...common,
  ];
}

function makePayload(session: LifeGameSession) {
  return {
    goal: session.goal,
    game_type: session.gameType,
    starting_stage: session.startingStage,
    weekly_hours: session.weeklyHours,
    risk_profile: session.riskProfile,
    time_horizon_years: session.horizonYears,
    current_round: session.currentRound,
    metrics: session.metrics as unknown as Json,
    decisions: session.decisions as unknown as Json,
    status: session.status,
    updated_at: new Date().toISOString(),
  };
}

const LifeGame = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState("");
  const [stage, setStage] = useState("University student");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("balanced");
  const [horizonYears, setHorizonYears] = useState(5);
  const [screen, setScreen] = useState<Screen>("setup");
  const [session, setSession] = useState<LifeGameSession | null>(null);
  const [localSavedSession, setLocalSavedSession] = useState<LifeGameSession | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<DecisionRecord | null>(null);

  const cloudRun = useQuery({
    queryKey: ["life-game-latest-run", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_game_runs")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "in_progress")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 10_000,
  });

  useEffect(() => {
    try {
      const saved = safeSession(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null"));
      if (saved) setLocalSavedSession(saved);
    } catch {
      // An unavailable or malformed local save should not stop the game.
    } finally {
      setStorageReady(true);
    }
  }, []);

  const recommendedType = useMemo(() => inferGameType(goal.trim()), [goal]);
  const recommendedGame = gameMeta[recommendedType];
  const activeSession = session;
  const activeScenarios = activeSession ? scenarios[activeSession.gameType] : [];
  const currentScenario = activeSession && activeSession.currentRound < ROUNDS ? activeScenarios[activeSession.currentRound] : null;
  const resultProfile = activeSession ? outcomeLabel(activeSession.metrics) : null;
  const mission = activeSession ? thirtyDayMission(activeSession) : [];

  const persistSession = async (candidate: LifeGameSession): Promise<LifeGameSession> => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
    } catch {
      // Keep playing even when browser storage is unavailable.
    }
    setLocalSavedSession(candidate);
    if (!user) return candidate;

    try {
      if (candidate.runId) {
        const { error } = await supabase
          .from("life_game_runs")
          .update(makePayload(candidate))
          .eq("id", candidate.runId)
          .eq("user_id", user.id);
        if (error) throw error;
        void cloudRun.refetch();
        return candidate;
      }
      const { data, error } = await supabase
        .from("life_game_runs")
        .insert({ ...makePayload(candidate), user_id: user.id })
        .select("id")
        .single();
      if (error) throw error;
      const saved = { ...candidate, runId: data.id };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // Cloud save succeeded; no action needed when local storage is unavailable.
      }
      setLocalSavedSession(saved);
      void cloudRun.refetch();
      return saved;
    } catch (error) {
      console.error("Life game cloud save failed", error);
      toast.error("Progress is on this device, but cloud sync failed. You can keep playing.");
      return candidate;
    }
  };

  const startRecommendedGame = async () => {
    if (goal.trim().length < 5) {
      toast.error("Describe your goal in at least five characters.");
      return;
    }
    const next: LifeGameSession = {
      goal: goal.trim(),
      gameType: recommendedType,
      startingStage: stage,
      weeklyHours,
      riskProfile,
      horizonYears,
      currentRound: 0,
      metrics: initialMetrics(stage),
      decisions: [],
      status: "in_progress",
    };
    setSaving(true);
    const saved = await persistSession(next);
    setSession(saved);
    setScreen("play");
    setSaving(false);
    setSelectedOutcome(null);
  };

  const resumeSession = (saved: LifeGameSession) => {
    setSession(saved);
    setGoal(saved.goal);
    setStage(saved.startingStage);
    setWeeklyHours(saved.weeklyHours);
    setRiskProfile(saved.riskProfile);
    setHorizonYears(saved.horizonYears);
    setScreen(saved.status === "completed" ? "result" : "play");
    setSelectedOutcome(null);
  };

  const resumeCloudSession = () => {
    if (!cloudRun.data) return;
    resumeSession(rowToSession(cloudRun.data as LifeGameRow));
  };

  const chooseOption = async (choice: Choice) => {
    if (!activeSession || !currentScenario || saving) return;
    const nextRound = activeSession.currentRound + 1;
    const updatedMetrics: Metrics = { ...activeSession.metrics };
    const actualEffects: Partial<Metrics> = {};
    (Object.keys(metricNames) as MetricKey[]).forEach((key) => {
      let effect = choice.effects[key] ?? 0;
      if ((key === "skills" || key === "execution") && effect > 0 && activeSession.weeklyHours >= 20) effect += activeSession.weeklyHours >= 30 ? 2 : 1;
      if (key === "wellbeing" && activeSession.weeklyHours >= 30) effect -= 2;
      if (key === "capital" && effect < 0 && activeSession.riskProfile === "high") effect -= 2;
      if (key === "capital" && effect < 0 && activeSession.riskProfile === "low") effect = Math.min(0, effect + 1);
      actualEffects[key] = effect;
      updatedMetrics[key] = clamp(updatedMetrics[key] + effect);
      actualEffects[key] = updatedMetrics[key] - activeSession.metrics[key];
    });
    const record: DecisionRecord = {
      round: nextRound,
      scenarioTitle: currentScenario.title,
      chosenTitle: choice.title,
      outcome: choice.outcome,
      tradeoff: choice.tradeoff,
      effects: actualEffects,
      alternatives: currentScenario.choices.filter((item) => item.title !== choice.title).map((item) => ({ title: item.title, tradeoff: item.tradeoff })),
    };
    const next: LifeGameSession = {
      ...activeSession,
      currentRound: nextRound,
      metrics: updatedMetrics,
      decisions: [...activeSession.decisions, record],
      status: nextRound >= ROUNDS ? "completed" : "in_progress",
    };
    setSaving(true);
    const saved = await persistSession(next);
    setSession(saved);
    setSelectedOutcome(record);
    setScreen("outcome");
    setSaving(false);
  };

  const continueAfterOutcome = () => {
    if (!session) return;
    setScreen(session.status === "completed" ? "result" : "play");
    setSelectedOutcome(null);
  };

  const beginAnother = () => {
    setSession(null);
    setSelectedOutcome(null);
    setScreen("setup");
    setGoal("");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-5">
        <section className="rounded-2xl border border-border bg-glass p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GhanaPathFinder Games</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Play your life. Test your next move.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Choose a goal. Get a simulation matched to it. Make difficult decisions, see the trade-offs and leave with a practical next step for real life.</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4 lg:max-w-xs">
              <p className="text-sm font-semibold text-foreground">Not just points and badges</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Every choice updates your skills, runway, relationships, wellbeing and execution. Your result is a reflection tool, not a prediction of your future.</p>
            </div>
          </div>
        </section>

        {screen === "setup" && (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-2xl border border-border bg-glass p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-semibold">1. Define the life you want to build</h2></div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">What is your goal?</span>
                  <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} maxLength={220} placeholder="Describe a real goal in your own words. Example: I want to build an AI company that solves a costly problem for factories." className="w-full resize-y rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <span className="mt-1 block text-right text-xs text-muted-foreground">{goal.length}/220</span>
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {goalExamples.map((example) => (
                    <button key={example} type="button" onClick={() => setGoal(example)} className="min-h-10 rounded-full border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5">
                      {example}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">Where are you starting?</span><select value={stage} onChange={(event) => setStage(event.target.value)} className="min-h-12 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"><option>Secondary school / recent graduate</option><option>University student</option><option>Early-career professional</option><option>Experienced professional</option><option>Early-stage founder</option></select></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">Time you can invest weekly</span><select value={weeklyHours} onChange={(event) => setWeeklyHours(Number(event.target.value))} className="min-h-12 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"><option value={5}>5 hours</option><option value={10}>10 hours</option><option value={15}>15 hours</option><option value={20}>20 hours</option><option value={30}>30 hours</option><option value={40}>40 hours</option></select></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">Your preferred risk style</span><select value={riskProfile} onChange={(event) => setRiskProfile(event.target.value as RiskProfile)} className="min-h-12 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"><option value="low">Protect stability first</option><option value="balanced">Balanced risk and progress</option><option value="high">Comfortable with uncertainty</option></select></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted-foreground">Simulation time horizon</span><select value={horizonYears} onChange={(event) => setHorizonYears(Number(event.target.value))} className="min-h-12 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"><option value={1}>1 year</option><option value={3}>3 years</option><option value={5}>5 years</option><option value={10}>10 years</option></select></label>
                </div>
                <button type="button" disabled={goal.trim().length < 5} onClick={() => setScreen("recommendation")} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                  Recommend my game <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <aside className="rounded-2xl border border-border bg-secondary/20 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How the game works</p>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Target className="h-4 w-4" /></span><div><p className="text-sm font-semibold">Your goal sets the scenario</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The game recommends a style of simulation based on the ambition you enter.</p></div></div>
                  <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-semibold">You decide what happens next</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Six rounds put you in realistic trade-offs. There is no single perfect choice.</p></div></div>
                  <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /></span><div><p className="text-sm font-semibold">Finish with a real-world mission</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your decision history becomes a 30-day action plan you can start working on.</p></div></div>
                </div>
              </aside>
            </section>

            {storageReady && (localSavedSession || cloudRun.data) && (
              <section className="rounded-2xl border border-border bg-glass p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><h2 className="font-semibold text-foreground">Continue a saved life</h2><p className="mt-1 text-sm text-muted-foreground">Pick up where you left off. A signed-in game can sync across devices; guest progress stays in this browser.</p></div>
                  <div className="flex flex-wrap gap-2">
                    {cloudRun.data && <button type="button" onClick={resumeCloudSession} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Resume cloud save</button>}
                    {localSavedSession && <button type="button" onClick={() => resumeSession(localSavedSession)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground">Resume this device</button>}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {screen === "recommendation" && (
          <section className="mx-auto max-w-4xl rounded-2xl border border-border bg-glass p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your recommended game</p>
            <div className="mt-3 flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></div>
              <div className="min-w-0"><h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{recommendedGame.title}</h2><p className="mt-1 text-sm font-medium text-muted-foreground">{recommendedGame.subtitle}</p></div>
            </div>
            <p className="mt-5 text-sm leading-6 text-foreground">{recommendedGame.description}</p>
            <div className="mt-5 rounded-xl border border-border bg-secondary/35 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your game brief</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{goal.trim()}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stage} · {weeklyHours} hours per week · {riskProfile === "low" ? "stability-first risk" : riskProfile === "high" ? "higher risk tolerance" : "balanced risk"} · {horizonYears}-year scenario</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">What you will practise</p><div className="mt-3 flex flex-wrap gap-2">{recommendedGame.skills.map((skill) => <span key={skill} className="rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground">{skill}</span>)}</div></div>
              <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">How you will be scored</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Five changing indicators: skills, financial runway, relationships, wellbeing and execution. They are game mechanics, not objective measurements of your real worth.</p></div>
            </div>
            {recommendedType === "venture-builder" && /billion/.test(goal.toLowerCase()) && <p className="mt-4 rounded-xl border border-border bg-secondary/30 p-3 text-xs leading-5 text-muted-foreground">A billion-dollar outcome is extremely rare and cannot be guaranteed by a game. This simulation focuses on the choices that can improve your ability to create value, learn from customers and build scalable ownership.</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setScreen("setup")} className="min-h-12 rounded-xl border border-border px-5 text-sm font-semibold text-foreground">Edit goal</button>
              <button type="button" disabled={saving} onClick={() => void startRecommendedGame()} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Preparing your game..." : "Start simulation"} <ArrowRight className="h-4 w-4" /></button>
            </div>
          </section>
        )}

        {screen === "play" && activeSession && currentScenario && (
          <>
            <section className="rounded-2xl border border-border bg-glass p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{gameMeta[activeSession.gameType].title} · Round {activeSession.currentRound + 1} of {ROUNDS}</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">{currentScenario.title}</h2></div>
                <button type="button" onClick={beginAnother} className="min-h-10 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground">Exit game</button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: (activeSession.currentRound / ROUNDS * 100) + "%" }} /></div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{currentScenario.context}</p>
              <p className="mt-3 text-base font-semibold text-foreground">{currentScenario.prompt}</p>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="space-y-3">
                {currentScenario.choices.map((choice, index) => (
                  <button key={choice.title} type="button" disabled={saving} onClick={() => void chooseOption(choice)} className="group w-full rounded-2xl border border-border bg-glass p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] disabled:cursor-wait disabled:opacity-60 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-sm font-semibold text-foreground">{String.fromCharCode(65 + index)}</span>
                      <div className="min-w-0 flex-1"><h3 className="text-base font-semibold text-foreground">{choice.title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{choice.detail}</p><p className="mt-3 text-xs leading-5 text-foreground/80"><span className="font-semibold">Trade-off:</span> {choice.tradeoff}</p><div className="mt-3 flex flex-wrap gap-2">{effectEntries(choice.effects).map(([key, value]) => <span key={key} className={"rounded-full px-2.5 py-1 text-[11px] font-medium " + (value > 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>{metricNames[key]} {value > 0 ? "+" : ""}{value}</span>)}</div></div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
                {saving && <p aria-live="polite" className="text-sm text-muted-foreground">Saving this decision...</p>}
              </div>
              <aside className="h-fit rounded-2xl border border-border bg-secondary/20 p-4">
                <h3 className="text-sm font-semibold">Your current indicators</h3>
                <p className="mt-1 text-xs text-muted-foreground">Game scores from 0 to 100</p>
                <div className="mt-4 space-y-4">
                  {(Object.keys(metricNames) as MetricKey[]).map((key) => <div key={key}><div className="flex items-center justify-between gap-2 text-xs"><span className="text-muted-foreground">{metricNames[key]}</span><span className="font-semibold text-foreground">{activeSession.metrics[key]}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: activeSession.metrics[key] + "%" }} /></div></div>)}
                </div>
                <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{activeSession.weeklyHours} hours a week is your planned commitment. Bigger effort can help, but the game also models the cost of risk and overwork.</p>
              </aside>
            </section>
          </>
        )}

        {screen === "outcome" && activeSession && selectedOutcome && (
          <section className="mx-auto max-w-4xl rounded-2xl border border-border bg-glass p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Decision recorded · Round {selectedOutcome.round}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">{selectedOutcome.chosenTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-foreground">{selectedOutcome.outcome}</p>
            <div className="mt-4 rounded-xl border border-border bg-secondary/35 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">The cost of this choice</p><p className="mt-2 text-sm leading-5 text-foreground">{selectedOutcome.tradeoff}</p></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Your indicators changed</p><div className="mt-3 space-y-2">{effectEntries(selectedOutcome.effects).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{metricNames[key]}</span><span className={"font-semibold " + (value > 0 ? "text-emerald-700 dark:text-emerald-300" : value < 0 ? "text-rose-700 dark:text-rose-300" : "text-foreground")}>{value > 0 ? "+" : ""}{value}</span></div>)}</div></div>
              <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Another route was possible</p><div className="mt-3 space-y-3">{selectedOutcome.alternatives.map((alternative) => <div key={alternative.title}><p className="text-xs font-semibold text-foreground">{alternative.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{alternative.tradeoff}</p></div>)}</div></div>
            </div>
            <button type="button" onClick={continueAfterOutcome} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground sm:w-auto">{activeSession.status === "completed" ? "Review my life path" : "Continue to next decision"} <ArrowRight className="h-4 w-4" /></button>
          </section>
        )}

        {screen === "result" && activeSession && resultProfile && (
          <>
            <section className="rounded-2xl border border-border bg-glass p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Simulation complete · {activeSession.horizonYears}-year horizon</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Your choices created a path. Now decide what to do with it.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Goal: {activeSession.goal}</p>
              <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4"><h3 className="text-lg font-semibold text-foreground">{resultProfile.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{resultProfile.body}</p></div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">These are illustrative game mechanics, not a forecast. Real outcomes depend on context, choices you did not model, luck, other people and changing circumstances.</p>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-border bg-glass p-5">
                <h3 className="font-display text-xl font-semibold">Your final indicators</h3>
                <div className="mt-4 space-y-4">{(Object.keys(metricNames) as MetricKey[]).map((key) => <div key={key}><div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{metricNames[key]}</span><span className="font-semibold text-foreground">{activeSession.metrics[key]}/100</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: activeSession.metrics[key] + "%" }} /></div></div>)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-glass p-5">
                <h3 className="font-display text-xl font-semibold">Your 30-day real-life mission</h3>
                <p className="mt-1 text-sm text-muted-foreground">Use your next four weeks to turn the game into evidence.</p>
                <ol className="mt-4 space-y-3">{mission.map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><p className="pt-1 text-sm leading-5 text-foreground">{item}</p></li>)}</ol>
                <p className="mt-4 rounded-xl border border-border bg-secondary/30 p-3 text-xs leading-5 text-muted-foreground">Time budget: about {activeSession.weeklyHours * 4} focused hours across 30 days. Adjust it to fit your health, study, work and family responsibilities.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-glass p-5 sm:p-6">
              <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h3 className="font-display text-xl font-semibold">The decisions that brought you here</h3></div>
              <div className="mt-4 space-y-3">{activeSession.decisions.map((decision) => <article key={decision.round} className="rounded-xl border border-border p-4"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-semibold">{decision.round}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">{decision.scenarioTitle}</p><h4 className="mt-1 text-sm font-semibold text-foreground">{decision.chosenTitle}</h4><p className="mt-2 text-sm leading-5 text-muted-foreground">{decision.outcome}</p><p className="mt-2 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Trade-off:</span> {decision.tradeoff}</p></div></div></article>)}</div>
            </section>

            <section className="rounded-2xl border border-border bg-secondary/25 p-5">
              <div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><h3 className="text-base font-semibold text-foreground">Take the next move outside the game</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">Open the section that helps you do the next real action. The game is only useful if it changes what you test, learn or do.</p><div className="mt-4 flex flex-wrap gap-2"><Link to={gameMeta[activeSession.gameType].route} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Continue your path <ArrowRight className="h-4 w-4" /></Link><Link to="/my-path" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground">Open My Path</Link></div></div></div>
            </section>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={beginAnother} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"><RefreshCw className="h-4 w-4" /> Play a new life scenario</button>
              <button type="button" onClick={() => { setSession(null); setScreen("recommendation"); setSelectedOutcome(null); }} className="min-h-12 rounded-xl border border-border px-5 text-sm font-semibold text-foreground">Replay this goal</button>
            </div>
          </>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/20 p-4"><Target className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Choose intentionally</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Every yes uses time that belongs to something else. Make the trade-off visible.</p></div>
          <div className="rounded-xl border border-border bg-secondary/20 p-4"><Users className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Bring people into the plan</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Feedback, trusted relationships and collaboration can change what is possible.</p></div>
          <div className="rounded-xl border border-border bg-secondary/20 p-4"><Heart className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Protect the person playing</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The goal is to make a life you value, not just to maximise a score.</p></div>
        </section>
      </main>
    </div>
  );
};

export default LifeGame;
