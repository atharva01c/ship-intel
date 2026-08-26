import { useState } from "react";
import axios from "axios";

import { updateTimelineEventStatus } from "../services/shipmentApi";
import type { Shipment, TimelineEvent, TimelineEventStatus } from "../types/shipment";

interface ShipmentTimelineProps {
  shipment: Shipment;
  /** Called with the updated shipment after a status change. */
  onShipmentChange: (shipment: Shipment) => void;
}

const statusColor: Record<TimelineEventStatus, string> = {
  pending: "rgba(255,255,255,0.3)",
  "in-progress": "#f59e0b",
  completed: "#22c55e",
};

/** Vertical milestone timeline for one shipment. Checkpoints sit on a
    shared vertical line; each has a status dropdown. */
function ShipmentTimeline({ shipment, onShipmentChange }: ShipmentTimelineProps) {
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
              {/* Checkpoint dot — color cross-fades on status change */}
              <span
                aria-hidden="true"
                className="z-10 mt-1.5 h-[15px] w-[15px] rounded-full border-2 transition-colors duration-300"
                style={{
                  borderColor: color,
                  backgroundColor:
                    event.status === "pending" ? "#0a0a0a" : color,
                }}
              />

              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 text-sm font-medium text-white">
                    {event.label}
                  </p>

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
                </div>

                {event.status === "completed" && event.timestamp && (
                  <p className="mb-0 mt-1 text-[11px] text-white/50">
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

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default ShipmentTimeline;
