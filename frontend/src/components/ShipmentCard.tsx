import { Link } from "react-router-dom";
import type { Shipment } from "../types/shipment";
import { riskColor, priorityColor } from "../lib/shipmentColors";

interface ShipmentCardProps {
  shipment: Shipment;
  /** Omit to hide the delete action (the dashboard preview is read-only). */
  onDelete?: (id: string) => void;
}

/**
 * The phone-width form of a shipment table row. Carries every column the
 * table has — including Weight and Priority — so narrow screens lose no data
 * and never need to scroll sideways.
 */
function ShipmentCard({ shipment, onDelete }: ShipmentCardProps) {
  const { origin, destination, cargoType, weight } = shipment.shipmentDetails;

  const meta = [cargoType, weight !== null ? `${weight} kg` : null].filter(
    Boolean,
  );

  return (
    /* A darker fill than its glass parent, so the row reads as recessed and
       white text stays legible even over a bright video frame. A white tint
       here would lighten the backdrop and fight its own text. */
    <li className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-sm font-medium text-white">
        {origin || "—"} <span className="text-white/40">→</span>{" "}
        {destination || "—"}
      </p>

      {meta.length > 0 && (
        <p className="mt-1 text-xs text-white/65">{meta.join(" · ")}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${riskColor[shipment.riskLevel]}20`,
            color: riskColor[shipment.riskLevel],
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: riskColor[shipment.riskLevel] }}
          />
          {shipment.riskLevel}
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: priorityColor[shipment.priority] }}
        >
          {shipment.priority} priority
        </span>
      </div>

      {/* Filled pills rather than bare text — over glass-on-glass, unfilled
          labels read as low-contrast and don't look tappable. */}
      <div className="mt-4 flex items-center gap-2">
        <Link
          to={`/shipments/${shipment._id}`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/15 bg-white/12 text-sm font-medium text-white transition-colors hover:bg-white/20 active:scale-[0.97]"
        >
          View details
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(shipment._id)}
            className="flex min-h-11 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 px-5 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/30 hover:text-red-100 active:scale-[0.97]"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

export default ShipmentCard;
