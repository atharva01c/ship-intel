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
    <div className="flex min-h-screen flex-col items-center justify-center px-6  pb-14 text-center">
      {/* Hero content */}
      <h1
        className="whitespace-nowrap text-7xl font-normal tracking-tight text-white md:text-8xl"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {" "}
        Smarter decisions for every shipment.
      </h1>{" "}
      {/* Description input */}
      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl">
        <div className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your shipment..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
          />{" "}
          <button
            type="submit"
            className="rounded-full bg-white p-3 text-black transition-transform hover:scale-105"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
      {/* Subtitle */}
      <p className="mt-6 max-w-md px-4 text-sm leading-relaxed text-white">
        Monitor shipments in real-time. Get AI-powered risk analysis, smart
        alerts, and proactive recommendations before issues arise.
      </p>
      {/* CTA buttons */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          to="/analyze"
          className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:scale-102"
        >
          Start Analyzing
        </Link>
        <Link
          to="/dashboard"
          className="rounded-full px-8 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Landing;
