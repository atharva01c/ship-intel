import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { analyzeShipment } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";
import { Sparkles, ArrowUpRight } from "lucide-react";

import ShipmentOverview from "../components/ShipmentOverview";
import RiskCard from "../components/RiskCard";
import AlertList from "../components/AlertList";
import RecommendationList from "../components/RecommendationList";
import ShipmentReviewPanel from "../components/ShipmentReviewPanel";

function AnalyzeShipment() {
  const [searchParams] = useSearchParams();
  const [description, setDescription] = useState("");

  useEffect(() => {
    const desc = searchParams.get("description");
    const auto = searchParams.get("auto");
    if (desc) {
      const decoded = decodeURIComponent(desc);
      setDescription(decoded);
      if (auto === "true" && decoded.trim()) {
        setLoading(true);
        analyzeShipment(decoded)
          .then((data) => {
            setShipment(data.shipment);
          })
          .catch((err) => {
            console.error(err);
            if (axios.isAxiosError(err)) {
              setError(err.response?.data?.message || "Failed to analyze shipment.");
            } else {
              setError("Failed to analyze shipment.");
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [searchParams]);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description.trim()) {
      setError("Please enter a shipment description.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShipment(null);

      const data = await analyzeShipment(description);
      setShipment(data.shipment);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to analyze shipment.");
      } else {
        setError("Failed to analyze shipment.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="display display-page text-white">Analyze</h1>
          <p className="mt-3 text-sm text-white/50 sm:mt-4 sm:text-base">
            Describe your shipment and get AI-powered risk analysis.
          </p>
        </div>

        {/* Input form */}
        {!shipment && (
          <div className="animate-rise mx-auto max-w-3xl">
            {/* Narrower than the results bento — a lone textarea stretched
                across the full content width reads badly. */}
            <form onSubmit={handleSubmit}>
              <div className="liquid-glass rounded-3xl p-5 sm:p-6 md:p-8">
                <label
                  htmlFor="shipment-desc"
                  className="mb-3 block text-xs font-medium uppercase tracking-widest text-white/55"
                >
                  Shipment Description
                </label>
                <textarea
                  id="shipment-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your shipment… e.g. 'Fragile electronics from Shanghai to Rotterdam, 500kg, needs temperature control'"
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:ring-1 focus:ring-white/20 sm:text-sm"
                />

                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

                {/* Stacks on phones — the helper text and the button collide
                    when they share a row at narrow widths. */}
                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-xs text-white/50">
                    AI analyzes risk, alerts, and provides smart
                    recommendations.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white/5 px-6 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:bg-transparent sm:py-2.5"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Results — same bento grid as the details page */}
        {shipment && (
          <div className="animate-rise mt-8">
            <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Low-confidence extraction: hold risk results until the user
                  verifies the extracted details. */}
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
                <RecommendationList
                  recommendations={shipment.recommendations}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setShipment(null);
                  setDescription("");
                  setError("");
                }}
                className="liquid-glass min-h-14 flex-1 rounded-full px-6 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                Analyze Another Shipment
              </button>
              {!shipment.needsReview && (
                <Link
                  to={`/shipments/${shipment._id}`}
                  className="liquid-glass group flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white/80 transition-colors hover:text-white"
                >
                  View Full Details
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AnalyzeShipment;
