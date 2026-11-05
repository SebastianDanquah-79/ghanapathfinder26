import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Output, generateText } from "ai";
import { z } from "zod";
import { checkApiRateLimit, rateLimitResponse, readJsonBody } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = 7 * 1024 * 1024;
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

type ScanBody = { documentDataUrl?: unknown; imageDataUrl?: unknown };

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
          global: { headers: { Authorization: "Bearer " + token } },
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
          body = (await readJsonBody(request, MAX_REQUEST_BYTES)) as ScanBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(
            tooLarge ? "The file is too large. Choose a PDF under 5 MB or a compressed photo." : "A valid file request is required.",
            { status: tooLarge ? 413 : 400 },
          );
        }

        // imageDataUrl is accepted temporarily for clients still running the previous scanner UI.
        const documentDataUrl = typeof body?.documentDataUrl === "string"
          ? body.documentDataUrl
          : typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";
        const match = documentDataUrl.match(/^data:(application\/pdf|image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/);
        if (!match) return new Response("Upload a PDF, JPG, PNG or WebP file.", { status: 415 });

        const mimeType = match[1]!;
        const encoded = match[2]!;
        if (mimeType !== "application/pdf" && !imageTypes.includes(mimeType as (typeof imageTypes)[number])) {
          return new Response("This file format is not supported.", { status: 415 });
        }

        const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
        const bytes = Math.floor((encoded.length * 3) / 4) - padding;
        if (bytes <= 0 || bytes > MAX_DOCUMENT_BYTES) {
          return new Response("Choose a PDF under 5 MB or a compressed photo.", { status: 413 });
        }

        if (!process.env["OPENAI_API_KEY"]) {
          return new Response("WASSCE scanning is not configured. The site administrator must connect the AI service.", { status: 503 });
        }

        try {
          const documentPart = mimeType === "application/pdf"
            ? {
                type: "file" as const,
                data: documentDataUrl,
                mediaType: "application/pdf",
                filename: "wassce-results.pdf",
              }
            : { type: "image" as const, image: documentDataUrl };

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
                    "It may be headed WASSCE, West African Senior School Certificate Examination, or West African Examinations Council (WAEC).",
                    "Read the subject table carefully, including small print. If the file is a PDF, inspect the page containing the subject and grade table.",
                    "Only extract subject names and the printed grades A1, B2, B3, C4, C5, C6, D7, E8 or F9.",
                    "Do not infer, guess, correct or fill in a missing grade. Set grade to null and explain the uncertainty when a row is unclear.",
                    "Do not extract the candidate's name, index number, date of birth, school code, serial number, or other personal identifiers.",
                    "Set isWassceStatement to false only when there is no reasonable evidence that the file contains a WASSCE result statement.",
                    "Preserve subject names as printed. Confidence is your confidence in reading that subject-grade pair, from 0 to 1.",
                    "Return every visible subject row, up to 30. A human will review every row before any result is saved.",
                  ].join(" "),
                },
                documentPart,
              ],
            }],
            maxOutputTokens: 2_000,
          });

          const extracted = result.output;
          if (!extracted || !extracted.results.length) {
            return Response.json({
              error: "No subject grades could be read from this file. Try the original PDF or a sharper, well-lit photo showing the full subject table. You can also enter your grades manually.",
            }, { status: 422 });
          }

          const visibleRows = extracted.results.filter((row) => row.subject.trim()).slice(0, 30);
          if (!visibleRows.length) {
            return Response.json({
              error: "The file was received, but no subject rows were recognized. Try a clearer copy or enter your grades manually.",
            }, { status: 422 });
          }

          const notes = [
            extracted.notes,
            !extracted.isWassceStatement ? "The document type was uncertain. Verify every subject and grade against the original statement before saving." : null,
          ].filter(Boolean).join(" ");

          // The file is processed in memory only. It is never uploaded to Supabase Storage
          // or written to the application's database.
          return Response.json({
            examYear: extracted.examYear,
            results: visibleRows,
            notes: notes || null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const normalized = message.toLowerCase();
          console.error("WAEC vision extraction failed", {
            name: error instanceof Error ? error.name : "UnknownError",
            message: message.slice(0, 400),
          });

          if (/insufficient_quota|billing|quota/.test(normalized)) {
            return Response.json({
              error: "The result scanner's AI service has reached its usage limit. Please enter your grades manually for now.",
            }, { status: 503 });
          }
          if (/rate_limit|too many requests|429/.test(normalized)) {
            return Response.json({
              error: "The scanner is temporarily busy. Wait a minute and try again.",
            }, { status: 503 });
          }
          if (/invalid_api_key|incorrect api key|authentication|401/.test(normalized)) {
            return Response.json({
              error: "The result scanner is temporarily unavailable. The site administrator needs to check its AI connection.",
            }, { status: 503 });
          }
          if (/timeout|timed out|deadline/.test(normalized)) {
            return Response.json({
              error: "Reading this file took too long. Try the original PDF or a clearer photo.",
            }, { status: 504 });
          }
          return Response.json({
            error: "We received your file, but could not extract the grades. Try the original PDF or a brighter, sharper photo, or enter your grades manually.",
          }, { status: 502 });
        }
      },
    },
  },
});
