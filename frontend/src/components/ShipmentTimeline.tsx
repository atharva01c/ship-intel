import { useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";

import {
  updateTimelineEventStatus,
  addTimelineEvent,
  deleteTimelineEvent,
} from "../services/shipmentApi";
import type { Shipment, TimelineEvent, TimelineEventStatus } from "../types/shipment";

interface ShipmentTimelineProps {
  shipment: Shipment;
  /** Called with the updated shipment after any timeline mutation. */
  onShipmentChange: (shipment: Shipment) => void;
}

const statusColor: Record<TimelineEventStatus, string> = {
  pending: "rgba(255,255,255,0.3)",
  "in-progress": "#f59e0b",
  completed: "#22c55e",
};

/**
 * Vertical milestone timeline for one shipment. Checkpoints sit on a
 * shared vertical line; custom user-defined timepoints are visually
 * distinct from the seeded defaults and are the only deletable ones.
 */
function ShipmentTimeline({ shipment, onShipmentChange }: ShipmentTimelineProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Documents created before this feature may have no timeline at all.
  const events = shipment.timeline ?? [];

  const handleStatusChange = async (
    event: TimelineEvent,
    status: TimelineEventStatus,
  ) => {
    if (status === event.status) return;

    setError("");
    setBusyEventId(event.id);

    try {
      const updated = await updateTimelineEventStatus(
        shipment._id,
        event.id,
        status,
      );
      onShipmentChange(updated);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update the event.");
      } else {
        setError("Failed to update the event.");
      }
    } finally {
      setBusyEventId(null);
    }
  };

  const handleAdd = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    const label = newLabel.trim();
    if (!label) {
      setError("Please enter a label for the new timepoint.");
      return;
    }

    setError("");
    setAdding(true);

    try {
      const updated = await addTimelineEvent(shipment._id, label, newNotes.trim());
      onShipmentChange(updated);
      setNewLabel("");
      setNewNotes("");
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to add the timepoint.");
      } else {
        setError("Failed to add the timepoint.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (event: TimelineEvent) => {
    setError("");
    setBusyEventId(event.id);

    try {
      const updated = await deleteTimelineEvent(shipment._id, event.id);
      onShipmentChange(updated);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to delete the timepoint.");
      } else {
        setError("Failed to delete the timepoint.");
      }
    } finally {
      setBusyEventId(null);
    }
  };

  return (
    <div className="text-left">
      <h2 className="m-0 mb-5 text-base font-medium text-white sm:text-lg">
        Shipment Timeline
      </h2>

      <ol className="relative m-0 grid list-none gap-6 p-0">
        {/* The connecting line — runs behind every checkpoint dot. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[7px] w-px bg-white/15"
        />

        {events.map((event) => {
          const color = statusColor[event.status];
          const busy = busyEventId === event.id;

          return (
            <li
              key={event.id}
              className="relative grid grid-cols-[auto_1fr] items-start gap-4"
            >
              {/* Checkpoint dot */}
              <span
                aria-hidden="true"
                className={`z-10 mt-1.5 h-[15px] w-[15px] rounded-full border-2 ${
                  event.isCustom ? "border-dashed" : ""
                }`}
                style={{
                  borderColor: color,
                  backgroundColor:
                    event.status === "pending" ? "#0a0a0a" : color,
                }}
              />

              <div
                className={`rounded-2xl border px-4 py-3 ${
                  event.isCustom
                    ? "border-dashed border-white/25 bg-black/10"
                    : "border-white/10 bg-black/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="m-0 text-sm font-medium text-white">
                      {event.label}
                    </p>
                    {event.isCustom && (
                      <span className="shrink-0 rounded-full border border-white/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Status toggle */}
                    <select
                      value={event.status}
                      disabled={busy}
                      onChange={(e) =>
                        handleStatusChange(event, e.target.value as TimelineEventStatus)
                      }
                      aria-label={`Status of ${event.label}`}
                      className="cursor-pointer rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium outline-none transition-colors"
                      style={{ color, borderColor: color }}
                    >
                      <option value="pending" className="bg-neutral-900 text-white/70">
                        Pending
                      </option>
                      <option
                        value="in-progress"
                        className="bg-neutral-900 text-white/70"
                      >
                        In progress
                      </option>
                      <option value="completed" className="bg-neutral-900 text-white/70">
                        Completed
                      </option>
                    </select>

                    {event.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        disabled={busy}
                        aria-label={`Delete ${event.label}`}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-red-400/40 text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {event.notes && (
                  <p className="mb-0 mt-1.5 break-words text-xs text-white/50">
                    {event.notes}
                  </p>
                )}

                {event.status === "completed" && event.timestamp && (
                  <p className="mb-0 mt-1 text-[11px] text-white/30">
                    Completed{" "}
                    {new Date(event.timestamp).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Add custom timepoint */}
      <form onSubmit={handleAdd} className="mt-6">
        <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
          <label
            htmlFor="timeline-label"
            className="text-xs font-medium uppercase tracking-widest text-white/40"
          >
            Add Timepoint
          </label>
          <input
            id="timeline-label"
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label, e.g. Warehouse scan"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30 focus:ring-1 focus:ring-white/20"
          />
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30 focus:ring-1 focus:ring-white/20"
          />
          <button
            type="submit"
            disabled={adding || !newLabel.trim()}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default ShipmentTimeline;
