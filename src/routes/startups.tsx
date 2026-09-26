import { createFileRoute } from "@tanstack/react-router";
import Startups from "@/pages/Startups";
export const Route = createFileRoute("/startups")({ component: Startups });
