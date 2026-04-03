"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getGemShareUrl } from "@/lib/gemShareUrl";
import {
  ensureShareImageReady,
  isShareImageReady,
} from "@/lib/shareImageReady";

interface ShareFileData {
  file: File;
  text?: string;
}

interface GemShareActionsProps {
  seed: string;
  gemTypeName: string;
  rarityName: string;
  getShareFile?: () => Promise<ShareFileData | null>;
}

function getTweetText(seed: string, gemTypeName: string, rarityName: string) {
  return `Check out ${seed}'s gem — a ${rarityName} ${gemTypeName}! What's yours? 💎`;
}

function XShareButton({
  href,
  onClick,
}: {
  href: string;
  onClick?: () => void;
}) {
  return (
    <Button
      render={(props) => (
        <a {...props} href={href} target="_blank" rel="noopener noreferrer" />
      )}
      nativeButton={false}
      onClick={onClick}
    >
      Post on X
    </Button>
  );
}

function CopyLinkButton({ gemUrl }: { gemUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(gemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopyLink}>{copied ? "Copied!" : "Copy link"}</Button>
  );
}

function NativeShareButton({
  title,
  gemUrl,
  getShareFile,
}: {
  title: string;
  gemUrl: string;
  getShareFile?: () => Promise<ShareFileData | null>;
}) {
  const handleNativeShare = async () => {
    try {
      const shareFileData = getShareFile ? await getShareFile() : null;

      if (
        shareFileData &&
        navigator.canShare?.({ files: [shareFileData.file] })
      ) {
        await navigator.share({
          files: [shareFileData.file],
          title,
          text: shareFileData.text,
          url: gemUrl,
        });
        return;
      }

      await navigator.share({
        title,
        url: gemUrl,
      });
    } catch {
      // User cancelled or share failed.
    }
  };

  return <Button onClick={handleNativeShare}>Share</Button>;
}

export function GemShareActions({
  seed,
  gemTypeName,
  rarityName,
  getShareFile,
}: GemShareActionsProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const [preparingShare, setPreparingShare] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const gemUrl = getGemShareUrl(seed);
  const tweetText = getTweetText(seed, gemTypeName, rarityName);
  const nativeShareTitle = `${rarityName} ${gemTypeName}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gemUrl)}`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    setShareReady(isShareImageReady(seed));
    setPreparingShare(false);
    setShareError(null);
  }, [seed]);

  const handlePrepareShare = async () => {
    setPreparingShare(true);
    setShareError(null);

    try {
      await ensureShareImageReady(seed);
      setShareReady(true);
    } catch {
      setShareError("Could not prepare the share image. Please try again.");
    } finally {
      setPreparingShare(false);
    }
  };

  const handleGetShareFile = getShareFile
    ? async () => {
        const shareFileData = await getShareFile();

        if (!shareFileData) {
          return null;
        }

        return {
          ...shareFileData,
          text: shareFileData.text ?? tweetText,
        };
      }
    : undefined;

  return shareReady ? (
    <div className="flex flex-wrap justify-center gap-2">
      <XShareButton href={xShareUrl} />
      <CopyLinkButton gemUrl={gemUrl} />
      {canNativeShare && (
        <NativeShareButton
          title={nativeShareTitle}
          gemUrl={gemUrl}
          getShareFile={handleGetShareFile}
        />
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handlePrepareShare} disabled={preparingShare}>
        {preparingShare ? "Preparing share image..." : "Prepare share"}
      </Button>
      {shareError && (
        <p className="text-xs text-red-500 dark:text-red-400">{shareError}</p>
      )}
    </div>
  );
}
