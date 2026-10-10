import { MapPinned, ExternalLink } from "lucide-react";

interface CampusMapProps {
  name: string;
  location?: string | null | undefined;
  placeId?: string | null | undefined;
}

const CampusMap = ({ name, location }: CampusMapProps) => {
  const searchQuery = [name, location, "Ghana"].filter(Boolean).join(", ");
  const encoded = encodeURIComponent(searchQuery);
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encoded}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold">Campus location</h2>
      <div className="border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-background text-primary">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{name}</p>
            {location && <p className="mt-1 text-sm text-muted-foreground">{location}, Ghana</p>}
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Open the campus in an interactive map to inspect nearby roads, landmarks and surrounding areas. No Google Maps API key is required for the OpenStreetMap option.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-primary"
          >
            <MapPinned className="h-4 w-4" aria-hidden="true" />
            OpenStreetMap
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Google Maps
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Map search: © OpenStreetMap contributors. Verify the exact campus entrance before travelling.
        </p>
      </div>
    </section>
  );
};

export default CampusMap;
