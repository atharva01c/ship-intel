import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route changes mount a brand-new page — arriving mid-scroll is
 * disorienting (wayfinding: "where am I?"). Snap to top on every
 * navigation. Instant, not smooth: the new page's own entrance
 * animation provides the continuity.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
