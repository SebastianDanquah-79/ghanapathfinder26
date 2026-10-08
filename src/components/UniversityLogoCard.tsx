import BrandLogo from "@/components/BrandLogo";
import { MapPin } from "@/lib/icons";

interface UniversityLogoCardProps {
  name: string;
  location?: string | null | undefined;
  websiteUrl?: string | null | undefined;
  logoUrl?: string | null | undefined;
  logoSize?: number;
  /** Shows a small link that opens the campus on Google Maps. Turn off when the card sits inside another link. */
  showMapLink?: boolean;
  className?: string;
}

const mapsUrl = (name: string, location?: string | null) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, location, "Ghana"].filter(Boolean).join(", "))}`;

export default function UniversityLogoCard({
  name,
  location,
  websiteUrl,
  logoUrl,
  logoSize = 72,
  showMapLink = true,
  className = "",
}: UniversityLogoCardProps) {
  return (
    <div className={`relative flex h-32 items-center justify-center rounded-lg bg-secondary/40 ${className}`}>
      <BrandLogo name={name} websiteUrl={websiteUrl} logoUrl={logoUrl} size={logoSize} />
      {showMapLink && (
        <a
          href={mapsUrl(name, location)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${name} on Google Maps`}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <MapPin className="h-3 w-3" />
          Map
        </a>
      )}
    </div>
  );
}
