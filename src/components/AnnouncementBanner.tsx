import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "gpf-announcement-2026-wassce";

const AnnouncementBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "dismissed");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div className="border-b border-primary/30 bg-primary/10">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-foreground">
          <span className="font-semibold">2026 WASSCE results are in.</span>{" "}
          <span className="text-muted-foreground">
            Find the university programmes you qualify for with your results.
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/matcher"
            className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
          >
            Match my results
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
