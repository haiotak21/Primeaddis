"use client";

import { Button } from "@/components/ui/button";

export default function SocialShareButtons({
  propertyUrl,
  title,
  description,
}: {
  propertyUrl: string;
  title: string;
  description: string;
}) {
  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title,
        text: description,
        url: propertyUrl,
      });
    } else {
      window.open(propertyUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <span className="text-xs text-muted-foreground">
        Share this property:
      </span>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              propertyUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            Facebook
          </a>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              propertyUrl
            )}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            Twitter
          </a>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
              propertyUrl
            )}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            LinkedIn
          </a>
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleNativeShare}
        >
          Native Share
        </Button>
      </div>
    </div>
  );
}
