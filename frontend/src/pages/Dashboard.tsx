import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Package, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

import { getShipments } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";
import { riskColor, priorityColor } from "../lib/shipmentColors";
import ShipmentCard from "../components/ShipmentCard";

function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getShipments();
        setShipments(data);
      } catch (err) {
        console.error(err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load dashboard.");
        } else {
          setError("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalShipments = shipments.length;
  const highRisk = shipments.filter(
    (s) => s.riskLevel === "High" || s.riskLevel === "Critical",
  ).length;
  const avgScore =
    totalShipments > 0
      ? Math.round(
          shipments.reduce((sum, s) => sum + s.riskScore, 0) / totalShipments,
        )
      : 0;
  const recentShipments = shipments.slice(0, 5);

  if (loading) {
    return (
      <div className="viewport-fit flex items-center justify-center px-5">
        <p className="text-white/60">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="display display-page text-white">Dashboard</h1>
          <p className="mt-3 text-sm text-white/50 sm:mt-4 sm:text-base">
            Real-time overview of your shipment monitoring activity.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Stats row - spans full width */}
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-white/60" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                Overview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-5 pt-2 sm:grid-cols-4 sm:gap-7 sm:pl-1 sm:pt-3">
              <StatBlock label="Total" value={totalShipments.toString()} />
              <StatBlock
                label="High Risk"
                value={highRisk.toString()}
                accent={highRisk > 0 ? "#f97316" : undefined}
              />
              <StatBlock label="Avg Score" value={`${avgScore}`} />
              <StatBlock
                label="Recent"
                value={recentShipments.length.toString()}
              />
            </div>
          </div>

          {/* Quick action card */}
          <div className="liquid-glass group rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-white/60" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                Quick Action
              </span>
            </div>
            <h3 className="mb-2 text-xl font-medium tracking-tight text-white">
              Analyze Shipment
            </h3>
            <p className="mb-4 text-sm text-white/50">
              Get AI-powered risk analysis for your next shipment.
            </p>
            <Link
              to="/analyze"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white/80 transition-colors hover:text-white sm:min-h-0"
            >
              Start Now
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Recent shipments - spans full width */}
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 md:col-span-3">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <div className="flex min-w-0 items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 text-white/60" />
                <span className="truncate text-xs font-medium uppercase tracking-widest text-white/40">
                  Recent Shipments
                </span>
              </div>
              <Link
                to="/shipments"
                className="shrink-0 text-sm text-white/60 transition-colors hover:text-white"
              >
                View All
              </Link>
            </div>

            {recentShipments.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/40">
                No shipments yet.{" "}
                <Link
                  to="/analyze"
                  className="text-white/80 underline hover:text-white"
                >
                  Analyze your first shipment
                </Link>
              </p>
            ) : (
              <>
                {/* Phones: stacked cards, every column intact, no sideways scroll. */}
                <ul className="grid list-none gap-3 p-0 md:hidden">
                  {recentShipments.map((s) => (
                    <ShipmentCard key={s._id} shipment={s} />
                  ))}
                </ul>

                {/* md and up: the full table. */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40">
                        <th className="pb-3 pr-4 font-medium">Route</th>
                        <th className="pb-3 pr-4 font-medium">Cargo</th>
                        <th className="pb-3 pr-4 font-medium">Weight</th>
                        <th className="pb-3 pr-4 font-medium">Risk</th>
                        <th className="pb-3 pr-4 font-medium">Priority</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentShipments.map((s) => {
                        const { origin, destination, cargoType, weight } =
                          s.shipmentDetails;
                        return (
                          <tr
                            key={s._id}
                            className="border-b border-white/5 transition-colors hover:bg-white/5"
                          >
                            <td className="py-3 pr-4">
                              {origin || "—"} → {destination || "—"}
                            </td>
                            <td className="py-3 pr-4 text-white/70">
                              {cargoType || "—"}
                            </td>
                            <td className="py-3 pr-4 text-white/70">
                              {weight !== null ? `${weight} kg` : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: `${riskColor[s.riskLevel]}20`,
                                  color: riskColor[s.riskLevel],
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: riskColor[s.riskLevel],
                                  }}
                                />
                                {s.riskLevel}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className="text-xs font-medium"
                                style={{ color: priorityColor[s.priority] }}
                              >
                                {s.priority}
                              </span>
                            </td>
                            <td className="py-3">
                              <Link
                                to={`/shipments/${s._id}`}
                                className="text-sm text-white/60 transition-colors hover:text-white"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-white/40 sm:text-xs">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ color: accent || "white" }}
      >
        {value}
      </p>
    </div>
  );
}

export default Dashboard;
