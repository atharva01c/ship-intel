import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AnalyzeShipment from "./pages/AnalyzeShipment";
import ShipmentHistory from "./pages/ShipmentHistory";
import ShipmentDetails from "./pages/ShipmentDetails";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4";

/** True when the OS asks for reduced motion. Kept live so it reacts to changes. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True when the browser reports Data Saver (Android / Chromium).
    A looping background video is exactly what these users opted out of,
    so they get the static gradient backdrop instead. */
function useSaveDataHint() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    setSaveData(connection?.saveData ?? false);
  }, []);

  return saveData;
}

function App() {
  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveDataHint();
  // One static backdrop serves both opt-outs — it's cheaper than the video
  // and needs no motion or streaming to read correctly.
  const useStaticBackdrop = reducedMotion || saveData;

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Persistent background. The video is skipped entirely — not just
          hidden — when reduced motion is requested, so it never downloads
          or plays. object-center keeps the portrait crop sensible on phones. */}
      {useStaticBackdrop ? (
        <div
          className="fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 100%, rgba(34,90,110,0.55) 0%, rgba(0,0,0,0) 60%), radial-gradient(80% 60% at 85% 0%, rgba(192,132,252,0.18) 0%, rgba(0,0,0,0) 70%), #000",
          }}
        />
      ) : (
        <video
          className="fixed inset-0 -z-10 h-full w-full object-cover portrait:object-center landscape:object-bottom"
          muted
          autoPlay
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
          src={VIDEO_URL}
        />
      )}
      <div className="fixed inset-0 -z-10 bg-black/70" />

      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalyzeShipment />} />
        <Route path="/shipments" element={<ShipmentHistory />} />
        <Route path="/shipments/:id" element={<ShipmentDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
