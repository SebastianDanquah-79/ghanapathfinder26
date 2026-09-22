import { createFileRoute } from "@tanstack/react-router";
import { EmployerDirectory } from "@/pages/Directories";
export const Route = createFileRoute("/employee-directory")({ component: EmployerDirectory });
