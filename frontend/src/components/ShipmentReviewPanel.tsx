import { useState } from "react";
import axios from "axios";
import { TriangleAlert } from "lucide-react";

import { reviewShipment } from "../services/shipmentApi";
import type { Shipment } from "../types/shipment";

interface ShipmentReviewPanelProps {
  shipment: Shipment;
  /** Called with the updated shipment once details are confirmed and
      risk has been recalculated by the backend. */
  onReviewed: (shipment: Shipment) => void;
}

/**
 * Shown when the AI extraction came back below the confidence threshold.
 * Renders a warning banner (with the AI's own reasons) plus an editable
 * form over every extracted field. Confirming sends the verified details
 * to PATCH /shipments/:id/review, which runs the risk engine.
 */
function ShipmentReviewPanel({ shipment, onReviewed }: ShipmentReviewPanelProps) {
  const [origin, setOrigin] = useState(shipment.shipmentDetails.origin ?? "");
  const [destination, setDestination] = useState(
    shipment.shipmentDetails.destination ?? "",
  );
  const [cargoType, setCargoType] = useState(
    shipment.shipmentDetails.cargoType ?? "",
  );
  const [weight, setWeight] = useState(
    shipment.shipmentDetails.weight != null
      ? String(shipment.shipmentDetails.weight)
      : "",
  );
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    shipment.shipmentDetails.deliveryDeadline != null
      ? String(shipment.shipmentDetails.deliveryDeadline)
      : "",
  );
  const [specialRequirements, setSpecialRequirements] = useState(
    shipment.shipmentDetails.specialRequirements.join(", "),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedWeight = weight.trim();
    if (trimmedWeight && (!Number.isFinite(Number(trimmedWeight)) || Number(trimmedWeight) <= 0)) {
      setError("Weight must be a positive number.");
      return;
    }

    const trimmedDeadline = deliveryDeadline.trim();
    if (
      trimmedDeadline &&
      (!Number.isInteger(Number(trimmedDeadline)) || Number(trimmedDeadline) <= 0)
    ) {
      setError("Delivery deadline must be a positive whole number of days.");
      return;
    }

    try {
      setSaving(true);

      // Empty strings mean "unknown", not empty text — send null so the
      // backend stores null exactly like the extraction would have.
      const toNullIfEmpty = (value: string) => (value.trim() ? value.trim() : null);

      const data = await reviewShipment(shipment._id, {
        origin: toNullIfEmpty(origin),
        destination: toNullIfEmpty(destination),
        cargoType: toNullIfEmpty(cargoType),
        weight: trimmedWeight ? Number(trimmedWeight) : null,
        deliveryDeadline: trimmedDeadline ? Number(trimmedDeadline) : null,
        specialRequirements: specialRequirements
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      });

      onReviewed(data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to confirm details.");
      } else {
        setError("Failed to confirm details.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-5 sm:p-6">
      {/* Warning banner */}
      <div className="mb-5 rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-[#f59e0b]">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          Low confidence — please verify extracted details
        </p>
        {shipment.confidence != null && (
          <p className="mt-1.5 text-xs text-white/60">
            AI extraction confidence: {shipment.confidence}/100
          </p>
        )}
        {shipment.confidenceReasons.length > 0 && (
          <ul className="mt-2 grid list-none gap-1 p-0">
            {shipment.confidenceReasons.map((reason) => (
              <li key={reason} className="text-xs text-white/50">
                · {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleConfirm}>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">
          Verify Extracted Details
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewField label="Origin" value={origin} onChange={setOrigin} placeholder="e.g. Mumbai" />
          <ReviewField
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="e.g. Rotterdam"
          />
          <ReviewField
            label="Cargo Type"
            value={cargoType}
            onChange={setCargoType}
            placeholder="e.g. Electronics"
          />
          <ReviewField
            label="Weight (kg)"
            value={weight}
            onChange={setWeight}
            placeholder="e.g. 500"
            inputMode="decimal"
          />
          <ReviewField
            label="Delivery Deadline (days)"
            value={deliveryDeadline}
            onChange={setDeliveryDeadline}
            placeholder="e.g. 7"
            inputMode="numeric"
          />
          <ReviewField
            label="Special Requirements"
            value={specialRequirements}
            onChange={setSpecialRequirements}
            placeholder="Comma separated, e.g. Fragile, Temperature control"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/12 px-6 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:w-auto"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Confirming…
            </>
          ) : (
            "Confirm & Calculate Risk"
          )}
        </button>
      </form>
    </div>
  );
}

/** Labeled input matching the app's recessed-field styling. */
function ReviewField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-white/50">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30 focus:ring-1 focus:ring-white/20"
      />
    </label>
  );
}

export default ShipmentReviewPanel;
