import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AnalyzeShipment from "./pages/AnalyzeShipment";
import ShipmentHistory from "./pages/ShipmentHistory";
import ShipmentDetails from "./pages/ShipmentDetails";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4";

function App() {
  return (
    <BrowserRouter>
      {/* Persistent background video */}
      <video
        className="fixed inset-0 -z-10 h-full w-full object-cover object-bottom"
        muted
        autoPlay
        playsInline
        loop
        preload="auto"
        src={VIDEO_URL}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />

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
