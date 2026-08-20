import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { getShipments, deleteShipment } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";
import { riskColor, priorityColor } from "../lib/shipmentColors";
import ShipmentCard from "../components/ShipmentCard";

function ShipmentHistory() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to load shipments.");
      } else {
        setError("Failed to load shipments.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this shipment?",
    );
    if (!confirmed) return;

    try {
      await deleteShipment(id);
      setShipments((current) => current.filter((s) => s._id !== id));
    } catch (error) {
      console.error(error);
      setError("Failed to delete shipment.");
    }
  };

  if (loading) {
    return (
      <div className="viewport-fit flex items-center justify-center px-5">
        <p className="text-white/60">Loading shipments…</p>
      </div>
    );
  }

  return (
    <div>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="display display-page text-white">Shipments</h1>
          <p className="mt-3 text-sm text-white/50 sm:mt-4 sm:text-base">
            All analyzed shipments in one place.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {shipments.length === 0 ? (
          <div className="liquid-glass rounded-3xl px-6 py-12 text-center sm:p-12">
            <p className="text-base text-white/60 sm:text-lg">
              No shipments yet.
            </p>
            <Link
              to="/analyze"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/80 underline transition-colors hover:text-white"
            >
              Analyze your first shipment
            </Link>
          </div>
        ) : (
          /* One glass panel at every width — cards inside it on phones,
             the full table from md up. */
          <div className="liquid-glass rounded-3xl p-4 sm:p-6">
            {/* Phones: stacked cards, every column intact, no sideways scroll. */}
            <ul className="grid list-none gap-3 p-0 md:hidden">
              {shipments.map((s) => (
                <ShipmentCard
                  key={s._id}
                  shipment={s}
                  onDelete={handleDelete}
                />
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
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => {
                    const { origin, destination, cargoType, weight } =
                      s.shipmentDetails;
                    return (
                      <tr
                        key={s._id}
                        className="border-b border-white/5 transition-colors hover:bg-white/5"
                      >
                        <td className="py-4 pr-4">
                          {origin || "—"} → {destination || "—"}
                        </td>
                        <td className="py-4 pr-4 text-white/70">
                          {cargoType || "—"}
                        </td>
                        <td className="py-4 pr-4 text-white/70">
                          {weight !== null ? `${weight} kg` : "—"}
                        </td>
                        <td className="py-4 pr-4">
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
                        <td className="py-4 pr-4">
                          <span
                            className="text-xs font-medium"
                            style={{ color: priorityColor[s.priority] }}
                          >
                            {s.priority}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/shipments/${s._id}`}
                              className="text-sm text-white/60 transition-colors hover:text-white"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(s._id)}
                              className="text-sm text-red-400/60 transition-colors hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ShipmentHistory;
