import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { getShipmentById, deleteShipment } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";

import ShipmentOverview from "../components/ShipmentOverview";
import RiskCard from "../components/RiskCard";
import AlertList from "../components/AlertList";
import RecommendationList from "../components/RecommendationList";
import ShipmentReviewPanel from "../components/ShipmentReviewPanel";
import ShipmentChat from "../components/ShipmentChat";
import ShipmentTimeline from "../components/ShipmentTimeline";

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
      <div className="viewport-fit flex items-center justify-center px-5">
        <p className="text-white/60">Loading shipment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
          <div className="liquid-glass rounded-3xl px-6 py-12 text-center sm:p-12">
            <p className="text-base text-red-400 sm:text-lg">{error}</p>
            <Link
              to="/shipments"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/80 underline transition-colors hover:text-white"
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
      <div>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
          <div className="liquid-glass rounded-3xl px-6 py-12 text-center sm:p-12">
            <p className="text-base text-white/60 sm:text-lg">
              Shipment not found.
            </p>
            <Link
              to="/shipments"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/80 underline transition-colors hover:text-white"
            >
              Back to Shipments
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="animate-rise mb-8 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <Link
              to="/shipments"
              className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-white/50 transition-colors hover:text-white sm:mb-4 sm:min-h-0"
            >
              ← Back to Shipments
            </Link>
            <h1 className="display display-page text-white">
              Shipment Details
            </h1>
            {/* break-all: a 24-char ObjectId has no break opportunities and
                will otherwise push the layout wider than the screen. */}
            <p className="mt-2 break-all text-xs text-white/55 sm:text-sm">
              Shipment ID: {shipment._id}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="flex min-h-11 shrink-0 items-center justify-center self-stretch rounded-full border border-red-500/30 px-5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 sm:self-start"
          >
            Delete Shipment
          </button>
        </div>

        {/* Bento grid — pairs up at lg, where the label/value rows have
            enough width to read as two columns. */}
        <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shipment.needsReview && (
            <div className="lg:col-span-2">
              <ShipmentReviewPanel
                shipment={shipment}
                onReviewed={setShipment}
              />
            </div>
          )}

          <div className="liquid-glass rounded-3xl p-5 sm:p-6">
            <ShipmentOverview shipment={shipment} />
          </div>

          {!shipment.needsReview && (
            <div className="liquid-glass rounded-3xl p-5 sm:p-6">
              <RiskCard
                riskLevel={shipment.riskLevel}
                riskScore={shipment.riskScore}
              />
            </div>
          )}

          <div className="liquid-glass rounded-3xl p-5 sm:p-6">
            <AlertList alerts={shipment.alerts} />
          </div>

          <div className="liquid-glass rounded-3xl p-5 sm:p-6">
            <RecommendationList recommendations={shipment.recommendations} />
          </div>
        </div>

        {/* Below the bento: each block rises in sequence */}
        <div className="stagger">
          {/* Follow-up Q&A, scoped to this shipment */}
          <div className="liquid-glass mt-4 rounded-3xl p-5 sm:p-6">
            <ShipmentChat
              shipmentId={shipment._id}
              initialMessages={shipment.messages ?? []}
            />
          </div>

          {/* Progress timeline */}
          <div className="liquid-glass mt-4 rounded-3xl p-5 sm:p-6">
            <ShipmentTimeline
              shipment={shipment}
              onShipmentChange={setShipment}
            />
          </div>

          {/* Original description */}
          <div className="liquid-glass mt-4 rounded-3xl p-5 sm:p-6">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-white/55">
              Original Description
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {shipment.originalDescription}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShipmentDetails;
