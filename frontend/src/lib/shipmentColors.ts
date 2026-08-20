import type { Shipment } from "../types/shipment";

/** Risk scale: green → amber → orange → red. */
export const riskColor: Record<Shipment["riskLevel"], string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

export const priorityColor: Record<Shipment["priority"], string> = {
  Low: "rgba(255,255,255,0.45)",
  Normal: "#c084fc",
  High: "#f59e0b",
  Urgent: "#ef4444",
};
