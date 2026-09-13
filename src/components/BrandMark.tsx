import logo from "@/assets/ghanapathfinder-logo.png";

/**
 * The GhanaPathFinder logo mark: a graduation cap over a gold path.
 */
const BrandMark = ({ className = "h-7 w-7", priority = false }: { className?: string; priority?: boolean }) => (
  <img
    src={logo}
    alt="GhanaPathFinder logo"
    width={816}
    height={816}
    {...(priority ? {} : { loading: "lazy" as const })}
    className={`${className} object-contain`}
  />
);

export default BrandMark;
