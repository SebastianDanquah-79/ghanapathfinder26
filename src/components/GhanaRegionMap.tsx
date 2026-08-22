/**
 * Stylised, interactive map of Ghana's 16 regions.
 * Shapes are schematic (not survey-accurate) and exist purely to let students
 * browse opportunities by region on touch and desktop.
 */
interface Props {
  counts: Record<string, number>;
  selected: string;
  onSelect: (region: string) => void;
}

interface RegionShape {
  name: string;
  short: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SHAPES: RegionShape[] = [
  { name: "Upper West", short: "UW", x: 38, y: 18, w: 74, h: 66 },
  { name: "Upper East", short: "UE", x: 116, y: 18, w: 84, h: 46 },
  { name: "North East", short: "NE", x: 204, y: 18, w: 60, h: 66 },
  { name: "Savannah", short: "SV", x: 30, y: 88, w: 116, h: 70 },
  { name: "Northern", short: "NR", x: 150, y: 68, w: 114, h: 90 },
  { name: "Bono", short: "BO", x: 26, y: 162, w: 82, h: 54 },
  { name: "Bono East", short: "BE", x: 112, y: 162, w: 86, h: 54 },
  { name: "Oti", short: "OT", x: 202, y: 162, w: 62, h: 88 },
  { name: "Ahafo", short: "AH", x: 30, y: 220, w: 66, h: 50 },
  { name: "Ashanti", short: "AS", x: 100, y: 220, w: 98, h: 66 },
  { name: "Volta", short: "VR", x: 202, y: 254, w: 62, h: 82 },
  { name: "Western North", short: "WN", x: 32, y: 274, w: 64, h: 66 },
  { name: "Eastern", short: "ER", x: 138, y: 290, w: 60, h: 62 },
  { name: "Western", short: "WR", x: 40, y: 344, w: 86, h: 48 },
  { name: "Central", short: "CR", x: 100, y: 290, w: 34, h: 100 },
  { name: "Greater Accra", short: "GA", x: 196, y: 340, w: 68, h: 46 },
];

const GhanaRegionMap = ({ counts, selected, onSelect }: Props) => {
  const nationwide = counts["Nationwide"] ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_1fr] items-start">
      <svg
        viewBox="0 0 300 410"
        role="img"
        aria-label="Map of Ghana's regions , select a region to filter opportunities"
        className="w-full max-w-[320px] mx-auto"
      >
        {SHAPES.map((r) => {
          const count = counts[r.name] ?? 0;
          const active = selected === r.name;
          return (
            <g
              key={r.name}
              role="button"
              tabIndex={0}
              aria-label={`${r.name}, ${count} employers`}
              onClick={() => onSelect(active ? "All" : r.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(active ? "All" : r.name);
                }
              }}
              className="cursor-pointer outline-hidden"
            >
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={10}
                className={
                  active
                    ? "fill-primary stroke-primary"
                    : count > 0
                      ? "fill-primary/20 stroke-border hover:fill-primary/35"
                      : "fill-secondary stroke-border"
                }
                strokeWidth={1.5}
              />
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2 - 1}
                textAnchor="middle"
                className={`text-[11px] font-semibold ${active ? "fill-primary-foreground" : "fill-foreground"}`}
              >
                {r.short}
              </text>
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2 + 12}
                textAnchor="middle"
                className={`text-[10px] ${active ? "fill-primary-foreground" : "fill-muted-foreground"}`}
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>

      <div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelect("All")}
            className={`rounded-full px-3 py-1.5 text-xs ${
              selected === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All of Ghana
          </button>
          {SHAPES.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => onSelect(selected === r.name ? "All" : r.name)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                selected === r.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.name} ({counts[r.name] ?? 0})
            </button>
          ))}
        </div>
        {nationwide > 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {nationwide} employers recruit nationwide and appear under every region.
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Region shapes are schematic and used only for navigation.
        </p>
      </div>
    </div>
  );
};

export default GhanaRegionMap;
