import { useQuery } from "@tanstack/react-query";
import { signCommunityImages } from "@/lib/communityImages";

/** Signed URLs for every photo in a feed (the community bucket is private). */
export const useSignedCommunityImages = (paths: string[]) => {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  return useQuery({
    queryKey: ["community-image-urls", key],
    enabled: key.length > 0,
    queryFn: () => signCommunityImages(key),
    staleTime: 45 * 60 * 1000,
  });
};
