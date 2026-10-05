import Image from "next/image";
import type { PublicationImage as PublicationImageData } from "@/lib/publication/types";

type PublicationImageProps = {
  readonly image?: PublicationImageData;
  readonly variant: "hero" | "card";
};

export function PublicationImage({
  image,
  variant,
}: PublicationImageProps) {
  const className =
    variant === "hero"
      ? "hero-image publication-image"
      : "article-image publication-image";

  if (!image) {
    return (
      <div
        className={`${className} image-ocean`}
        aria-hidden="true"
      >
        {variant === "card" && (
          <span className="image-caption">Editorial image</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <Image
        className="publication-image-element"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        unoptimized
      />
    </div>
  );
}