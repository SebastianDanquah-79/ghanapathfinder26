import { createFileRoute } from "@tanstack/react-router";
import People from "@/pages/People";
export const Route = createFileRoute("/people")({ component: People });
