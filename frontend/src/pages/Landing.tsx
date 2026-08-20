import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      navigate(
        `/analyze?description=${encodeURIComponent(description)}&auto=true`,
      );
    }
  };

  return (
    <div className="viewport-fit flex flex-col items-center justify-center px-5 py-10 text-center sm:px-6">
      {/* Hero content — a fixed 16ch measure holds the headline as a
          three-line typeset block at every width instead of reflowing. */}
      <h1 className="display display-hero max-w-[16ch] text-white">
        Smarter decisions for every shipment.
      </h1>

      {/* Description input */}
      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl">
        <div className="liquid-glass flex items-center gap-2 rounded-full py-2 pl-5 pr-2 sm:gap-3 sm:pl-6">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your shipment..."
            aria-label="Shipment description"
            className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40 sm:text-sm"
          />
          <button
            type="submit"
            aria-label="Analyze shipment"
            className="shrink-0 rounded-full bg-white p-3 text-black transition-transform hover:scale-105"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Subtitle */}
      <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90">
        Monitor shipments in real-time. Get AI-powered risk analysis, smart
        alerts, and proactive recommendations.
      </p>

      {/* CTA buttons */}
      <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
        <Link
          to="/analyze"
          className="liquid-glass flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium text-white transition-all hover:bg-white/10"
        >
          Start Analyzing
        </Link>
        <Link
          to="/dashboard"
          className="flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Landing;
