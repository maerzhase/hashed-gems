import { getGemSiteUrl } from "@/lib/gemAssetUrl";

export function getGemShareUrl(seed: string): string {
  return `${getGemSiteUrl()}/gem/${encodeURIComponent(seed)}`;
}
