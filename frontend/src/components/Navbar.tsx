import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";


const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analyze", href: "/analyze" },
  { label: "Shipments", href: "/shipments" },
];



function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();



  return (
    <nav className="sticky top-0 z-20 px-6 py-4">
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white">shipInteL</span>
        </Link>

        {/* Right: Nav links */}
        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}

              onClick={(e) => {
                e.preventDefault();
                navigate(link.href);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
