import { createFileRoute } from "@tanstack/react-router";
import MyPath from "@/pages/MyPath";

export const Route = createFileRoute("/my-path")({
  component: MyPath,
});
