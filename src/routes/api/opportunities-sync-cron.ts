import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/opportunities-sync-cron")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env["CRON_SECRET"];
        const authorization = request.headers.get("authorization");
        if (!cronSecret || authorization !== "Bearer " + cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"];
        const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!supabaseUrl || !serviceRoleKey) {
          return Response.json({ ok: false, error: "The opportunity sync service is not configured." }, { status: 503 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        try {
          const response = await fetch(
            supabaseUrl.replace(/\/$/, "") + "/functions/v1/sync-opportunities",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: serviceRoleKey,
                Authorization: "Bearer " + serviceRoleKey,
              },
              signal: controller.signal,
              cache: "no-store",
            },
          );
          const payload = await response.json().catch(() => ({ error: "The sync service returned an invalid response." }));
          return Response.json(
            { ok: response.ok && payload?.ok !== false, sync: payload, run_at: new Date().toISOString() },
            { status: response.ok ? 200 : 502, headers: { "Cache-Control": "no-store" } },
          );
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : "Opportunity sync failed." },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  },
});
