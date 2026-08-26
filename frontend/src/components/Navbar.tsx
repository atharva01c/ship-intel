import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, LayoutDashboard, Sparkles, Package } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", href: "/analyze", icon: Sparkles },
  { label: "Shipments", href: "/shipments", icon: Package },
];

/**
 * Measures the active link inside its container so a single pill can glide
 * behind whichever tab is current — one continuous element rather than
 * independently fading backgrounds. Returns null until first layout, so
 * the pill *mounts* in place instead of sliding in from nowhere.
 */
function useActivePill(pathname: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const active = container?.querySelector<HTMLElement>(
        '[data-active="true"]',
      );

      if (!container || !active) {
        setPill(null);
        return;
      }

      setPill({ x: active.offsetLeft, width: active.offsetWidth });
    };

    // Fonts swapping in can change link widths — re-measure once settled.
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  return { containerRef, pill };
}

// Settle without overshoot — the critically damped feel. Width eases too:
// it only changes between tabs of different label lengths, on a tiny
// isolated element, so the off-compositor cost is negligible.
const PILL_TRANSITION =
  "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1)";

function Navbar() {
  const { pathname } = useLocation();
  const current = NAV_LINKS.find((link) => link.href === pathname);
  const top = useActivePill(pathname);
  const dock = useActivePill(pathname);

  return (
    <>
      {/* Top bar: brand on every screen, full links from md up. */}
      <nav className="sticky top-0 z-20 px-4 py-3 sm:px-6 sm:py-4">
        <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full px-4 py-2.5 sm:px-6 sm:py-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-full"
          >
            <Globe className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            <span className="text-base font-semibold text-white sm:text-lg">
              ShipIntel
            </span>
          </Link>

          {/* relative: the pill positions against this strip */}
          <div
            ref={top.containerRef}
            className="relative hidden items-center gap-2 md:flex"
          >
            {top.pill && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-full bg-white/[0.13]"
                style={{
                  transform: `translateX(${top.pill.x}px)`,
                  width: top.pill.width,
                  transition: PILL_TRANSITION,
                }}
              />
            )}
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active}
                  /* relative: paints above the absolutely positioned pill */
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile: name the section, so the bar carries information
              rather than empty space beside the logo. */}
          {current && (
            <span className="truncate text-[11px] font-medium uppercase tracking-widest text-white/55 md:hidden">
              {current.label}
            </span>
          )}
        </div>
      </nav>

      {/* Bottom dock: the same glass pill, re-docked to the thumb zone. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div
          ref={dock.containerRef}
          className="liquid-glass mx-auto flex max-w-sm items-stretch gap-1 rounded-full p-1.5"
        >
          {dock.pill && (
            <span
              aria-hidden="true"
              className="absolute inset-y-1.5 left-0 rounded-full bg-white/[0.13]"
              style={{
                transform: `translateX(${dock.pill.x}px)`,
                width: dock.pill.width,
                transition: PILL_TRANSITION,
              }}
            />
          )}
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium leading-none transition-colors ${
                  active ? "text-white" : "text-white/60 hover:text-white/90"
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
