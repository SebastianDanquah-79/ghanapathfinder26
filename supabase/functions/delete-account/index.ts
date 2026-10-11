import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ghanapathfinder.com",
  "https://www.ghanapathfinder.com",
]);

function headersFor(origin: string | null) {
  const allowed = origin && (
    allowedOrigins.has(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.startsWith("http://localhost:")
  );
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "https://ghanapathfinder.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

function json(status: number, body: Record<string, unknown>, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (request: Request) => {
  const headers = headersFor(request.headers.get("origin"));
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." }, headers);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json(401, { error: "Sign in again before deleting your account." }, headers);
  }

  let body: { confirmation?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "A confirmation is required." }, headers);
  }
  if (body.confirmation !== "DELETE") {
    return json(400, { error: "Type DELETE to confirm account deletion." }, headers);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Account deletion function is missing required Supabase environment settings.");
    return json(500, { error: "Account deletion is not configured. Please contact support." }, headers);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return json(401, { error: "Your session has expired. Sign in again before deleting your account." }, headers);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Remove user-owned Storage objects through the Storage API so physical files are deleted too.
    const { data: files, error: filesError } = await admin.rpc("list_account_storage_objects", {
      _user_id: authData.user.id,
    });
    if (filesError) throw filesError;

    const grouped = new Map<string, string[]>();
    for (const item of (files ?? []) as Array<{ bucket_id: string; name: string }>) {
      if (!item.bucket_id || !item.name) continue;
      const names = grouped.get(item.bucket_id) ?? [];
      names.push(item.name);
      grouped.set(item.bucket_id, names);
    }
    for (const [bucket, names] of grouped) {
      for (let i = 0; i < names.length; i += 100) {
        const { error } = await admin.storage.from(bucket).remove(names.slice(i, i + 100));
        if (error) throw error;
      }
    }

    // This database function cleans legacy user rows and deletes the auth user in one transaction.
    const { error: deletionError } = await admin.rpc("delete_account_completely", {
      _user_id: authData.user.id,
    });
    if (deletionError) throw deletionError;

    return json(200, { success: true }, headers);
  } catch (error) {
    console.error("Safe account deletion failed", error);
    return json(500, {
      error: "Account deletion did not complete. Uploaded media may already have been removed. Contact support before retrying so the account state can be checked.",
    }, headers);
  }
});
