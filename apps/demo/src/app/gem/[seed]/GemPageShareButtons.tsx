"use client";

import {
  CopyLinkButton,
  NativeShareButton,
  XShareButton,
} from "@/components/GemGenerator";

interface Props {
  seed: string;
  gemTypeName: string;
  rarityName: string;
}

export function GemPageShareButtons({ seed, gemTypeName, rarityName }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <XShareButton
        seed={seed}
        gemTypeName={gemTypeName}
        rarityName={rarityName}
      />

      <CopyLinkButton seed={seed} />

      <NativeShareButton
        seed={seed}
        gemTypeName={gemTypeName}
        rarityName={rarityName}
      />
    </div>
  );
}
