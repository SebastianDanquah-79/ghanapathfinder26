import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Output, generateText } from "ai";
import { z } from "zod";
import { checkApiRateLimit, rateLimitResponse, readJsonBody } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"] as const;

const scanSchema = z.object({
  isWassceStatement: z.boolean(),
  examYear: z.string().nullable(),
  results: z.array(z.object({
    subject: z.string().min(1).max(80),
    grade: z.enum(grades).nullable(),
    confidence: z.number().min(0).max(1),
    issue: z.string().nullable(),
  })).max(30),
  notes: z.string().nullable(),
});

type ScanBody = { imageDataUrl?: unknown };

export const Route = createFileRoute("/api/waec-scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "waec-scan", 4, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token || token.split(".").length !== 3) {
          return new Response("Sign in to scan your own WASSCE statement.", { status: 401 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"];
        const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!supabaseUrl || !supabaseKey) {
          return new Response("The student data service is not configured.", { status: 503 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claimsData?.claims?.sub;
        if (claimsError || typeof userId !== "string") {
          return new Response("Your session has expired. Sign in again and retry.", { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("account_role,role")
          .eq("id", userId)
          .maybeSingle();
        if (profileError) {
          console.error("WAEC scan profile check failed", profileError.message);
          return new Response("Your student profile could not be checked. Please retry.", { status: 503 });
        }
        if ((profile?.account_role ?? profile?.role) !== "student") {
          return new Response("WAEC result scanning is available in a student portal. Select the Student portal first.", { status: 403 });
        }

        let body: ScanBody;
        try {
          body = (await readJsonBody(request, 3 * 1024 * 1024)) as ScanBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(
            tooLarge ? "The image is too large. Choose a compressed photo under 2 MB." : "A valid image request is required.",
            { status: tooLarge ? 413 : 400 },
          );
        }

        const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
        const match = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/);
        if (!match) return new Response("Upload a JPG, PNG or WebP image.", { status: 415 });

        const mimeType = match[1]!;
        if (!imageTypes.includes(mimeType as (typeof imageTypes)[number])) {
          return new Response("This image format is not supported.", { status: 415 });
        }
        const encoded = match[2]!;
        const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
        const bytes = Math.floor((encoded.length * 3) / 4) - padding;
        if (bytes <= 0 || bytes > MAX_IMAGE_BYTES) {
          return new Response("Choose a compressed photo under 2 MB.", { status: 413 });
        }

        if (!process.env["OPENAI_API_KEY"]) {
          return new Response("WAEC scanning is not configured. Add OPENAI_API_KEY to the Vercel project environment variables.", { status: 503 });
        }

        try {
          const result = await generateText({
            model: createOpenAIResponsesModel(process.env["OPENAI_WAEC_MODEL"] || process.env["OPENAI_MODEL"]),
            output: Output.object({ schema: scanSchema }),
            messages: [{
              role: "user",
              content: [
                {
                  type: "text",
                  text: [
                    "Read this student's Ghana WASSCE statement of results.",
                    "Only extract subject names and the printed grades A1, B2, B3, C4, C5, C6, D7, E8 or F9.",
                    "Do not infer, guess, correct or fill in a missing grade. Set grade to null and explain the uncertainty when a row is unclear.",
                    "Do not extract the candidate's name, index number, date of birth, school code, serial number, or other personal identifiers.",
                    "Set isWassceStatement to false if this is not clearly a WASSCE result statement.",
                    "Preserve subject names as printed. Confidence is your confidence in reading that subject-grade pair, from 0 to 1.",
                    "Return at most 30 subject rows. A human will review every row before any result is saved.",
                  ].join(" "),
                },
                { type: "image", image: imageDataUrl },
              ],
            }],
            maxOutputTokens: 1_600,
          });

          const extracted = result.output;
          if (!extracted || !extracted.isWassceStatement) {
            return Response.json({ error: "This image does not appear to be a readable WASSCE statement. Try a clearer, well-lit photo with all subject rows visible." }, { status: 422 });
          }
          if (!extracted.results.length) {
            return Response.json({ error: "No subject grades could be read. Try a sharper photo or enter the grades manually." }, { status: 422 });
          }

          // The image is processed in memory only. It is never uploaded to Supabase
          // Storage or written to the application's database.
          return Response.json({
            examYear: extracted.examYear,
            results: extracted.results,
            notes: extracted.notes,
          });
        } catch (error) {
          console.error("WAEC vision extraction failed", error instanceof Error ? error.message : "Unknown error");
          return new Response("The result slip could not be read right now. Please retry or enter your grades manually.", { status: 502 });
        }
      },
    },
  },
});
