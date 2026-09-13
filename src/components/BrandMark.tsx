import { BrandLogoIcon } from "@/lib/icons";

/**
 * The GhanaPathFinder logo mark: graduation cap.
 */
const BrandMark = ({ className = "h-7 w-7", priority = false }: { className?: string; priority?: boolean }) => (
  <BrandLogoIcon
    aria-label="GhanaPathFinder logo"
    className={className}
    {...(priority ? {} : { "aria-hidden": "true" })}
  />
);

export default BrandMark;
