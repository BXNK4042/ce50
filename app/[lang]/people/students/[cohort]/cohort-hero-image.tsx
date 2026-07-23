"use client";

export function CohortHeroImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        (e.currentTarget as HTMLElement).style.display = "none";
      }}
      className="absolute inset-0 w-full h-full object-cover z-0"
      style={{
        objectPosition: "50% 55%",
        maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
      }}
    />
  );
}
