import { supabase } from "@/integrations/supabase/client";

export const COMMUNITY_BUCKET = "community-images";
export const MAX_IMAGES = 4;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const validateImage = (file: File): string | null => {
  if (!ALLOWED.includes(file.type)) return `${file.name}: only JPG, PNG, WEBP or GIF images.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be under 5 MB.`;
  return null;
};

/** Upload photos into the signed-in user's own folder. Returns storage paths. */
export const uploadCommunityImages = async (userId: string, files: File[]): Promise<string[]> => {
  const paths: string[] = [];
  for (const file of files) {
    const problem = validateImage(file);
    if (problem) throw new Error(problem);
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${userId}/${crypto.randomUUID()}.${ext || "jpg"}`;
    const { error } = await supabase.storage
      .from(COMMUNITY_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
};

export const removeCommunityImages = async (paths: string[]) => {
  if (!paths.length) return;
  await supabase.storage.from(COMMUNITY_BUCKET).remove(paths);
};

/** Signed URLs for a batch of storage paths (bucket is private). */
export const signCommunityImages = async (
  paths: string[],
  expiresIn = 60 * 60,
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return map;
  const { data, error } = await supabase.storage
    .from(COMMUNITY_BUCKET)
    .createSignedUrls(unique, expiresIn);
  if (error) return map;
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  }
  return map;
};
