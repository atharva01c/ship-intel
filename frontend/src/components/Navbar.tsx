import { Link, useLocation } from "react-router-dom";
import { Globe, LayoutDashboard, Sparkles, Package } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", href: "/analyze", icon: Sparkles },
  { label: "Shipments", href: "/shipments", icon: Package },
];

function Navbar() {
  const { pathname } = useLocation();
  const current = NAV_LINKS.find((link) => link.href === pathname);

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
              shipInteL
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile: name the section, so the bar carries information
              rather than empty space beside the logo. */}
          {current && (
            <span className="truncate text-[11px] font-medium uppercase tracking-widest text-white/40 md:hidden">
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
        <div className="liquid-glass mx-auto flex max-w-sm items-stretch gap-1 rounded-full p-1.5">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium leading-none transition-colors ${
                  active ? "bg-white/12 text-white" : "text-white/55"
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
