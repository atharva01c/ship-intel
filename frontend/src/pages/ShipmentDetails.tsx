import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { getShipmentById, deleteShipment } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";

import ShipmentOverview from "../components/ShipmentOverview";
import RiskCard from "../components/RiskCard";
import AlertList from "../components/AlertList";
import RecommendationList from "../components/RecommendationList";

function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShipment = async () => {
      if (!id) {
        setError("Shipment ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getShipmentById(id);
        setShipment(data);
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Failed to load shipment.");
        } else {
          setError("Failed to load shipment.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this shipment?",
    );
    if (!confirmed) return;

    try {
      await deleteShipment(id);
      navigate("/shipments");
    } catch (error) {
      console.error(error);
      setError("Failed to delete shipment.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white/60">Loading shipment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="liquid-glass rounded-3xl p-12 text-center">
            <p className="text-lg text-red-400">{error}</p>
            <Link
              to="/shipments"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 underline transition-colors hover:text-white"
            >
              Back to Shipments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-black">
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="liquid-glass rounded-3xl p-12 text-center">
            <p className="text-lg text-white/60">Shipment not found.</p>
            <Link
              to="/shipments"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 underline transition-colors hover:text-white"
            >
              Back to Shipments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/shipments"
              className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
            >
              ← Back to Shipments
            </Link>
            <h1
              className="text-4xl font-normal tracking-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Shipment Details
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Shipment ID: {shipment._id}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="self-start rounded-full border border-red-500/30 px-5 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Delete Shipment
          </button>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Overview card */}
          <div
            className="liquid-glass rounded-3xl p-6"
          >
            <ShipmentOverview shipment={shipment} />
          </div>

          {/* Risk card */}
          <div
            className="liquid-glass rounded-3xl p-6"
          >
            <RiskCard
              riskLevel={shipment.riskLevel}
              riskScore={shipment.riskScore}
            />
          </div>

          {/* Alerts card */}
          <div
            className="liquid-glass rounded-3xl p-6"
          >
            <AlertList alerts={shipment.alerts} />
          </div>

          {/* Recommendations card */}
          <div
            className="liquid-glass rounded-3xl p-6"
          >
            <RecommendationList recommendations={shipment.recommendations} />
          </div>
        </div>

        {/* Original description */}
        <div
          className="liquid-glass mt-4 rounded-3xl p-6"
        >
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">
            Original Description
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            {shipment.originalDescription}
          </p>
        </div>
      </main>
    </div>
  );
}

export default ShipmentDetails;
