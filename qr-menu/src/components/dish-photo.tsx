import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function DishPhoto({
  src,
  alt,
  className,
  iconSize = 20,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  iconSize?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("object-cover bg-[var(--qr-card-bg,_#f4f4f5)]", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[var(--qr-card-bg,_#f4f4f5)] text-[var(--qr-muted,_#a1a1aa)]",
        className,
      )}
      aria-hidden
    >
      <UtensilsCrossed style={{ width: iconSize, height: iconSize }} />
    </div>
  );
}
