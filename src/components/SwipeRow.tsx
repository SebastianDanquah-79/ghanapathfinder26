import type { ReactNode } from "react";

/**
 * Mobile: horizontally swipeable card row (snap, smooth touch scroll).
 * Desktop: plain vertical list — unchanged layout.
 */
const SwipeRow = ({
  children,
  count = 0,
  hint = "Swipe for more →",
}: {
  children: ReactNode;
  count?: number;
  hint?: string;
}) => (
  <div>
    <div className="hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth md:overflow-visible md:mx-0 md:px-0">
      <ul className="flex gap-3 [&>li]:shrink-0 [&>li]:w-[15rem] [&>li]:snap-start md:flex-col md:gap-2 md:[&>li]:w-full">
        {children}
      </ul>
    </div>
    {count > 1 && <p className="mt-2 text-xs text-muted-foreground md:hidden">{hint}</p>}
  </div>
);

export default SwipeRow;
