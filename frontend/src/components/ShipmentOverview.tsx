import type { Shipment } from "../types/shipment";
import { priorityColor } from "../lib/shipmentColors";

interface ShipmentOverviewProps {
  shipment: Shipment;
}

function ShipmentOverview({ shipment }: ShipmentOverviewProps) {
  const { shipmentDetails: details, priority } = shipment;

  return (
    <div className="text-left">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-medium text-white sm:text-lg">
          Shipment Overview
        </h2>
        <span
          className="shrink-0 rounded border px-2.5 py-0.5 text-xs font-semibold sm:text-[13px]"
          style={{
            color: priorityColor[priority],
            borderColor: priorityColor[priority],
          }}
        >
          {priority}
        </span>
      </div>

      <div className="grid gap-3.5">
        <DetailRow label="Origin" value={details.origin} />
        <DetailRow label="Destination" value={details.destination} />
        <DetailRow label="Cargo Type" value={details.cargoType} />
        <DetailRow
          label="Weight"
          value={details.weight != null ? `${details.weight} kg` : null}
        />
        <DetailRow
          label="Delivery Deadline"
          value={
            details.deliveryDeadline != null
              ? `${details.deliveryDeadline}`
              : null
          }
        />
        <DetailRow
          label="Special Requirements"
          value={
            details.specialRequirements.length > 0
              ? details.specialRequirements.join(", ")
              : null
          }
        />
      </div>
    </div>
  );
}

/** Stacks label-over-value on phones; only splits into two columns once
    there's room for a right-aligned value to stay readable. */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-sm font-medium text-[var(--text)] sm:min-w-[150px] sm:shrink-0">
        {label}
      </span>
      <span className="text-sm text-[var(--text-h)] sm:text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default ShipmentOverview;
