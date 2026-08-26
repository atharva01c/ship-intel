import type { Shipment } from "../types/shipment";
import { riskColor } from "../lib/shipmentColors";

interface RiskBadgeProps {
  level: Shipment["riskLevel"];
  needsReview?: boolean;
}

/**
 * The status pill shown in lists. Shipments held for review were never
 * scored — their default "Low / 0" fields would misrepresent them, so
 * they wear a neutral amber badge until risk is calculated.
 */
function RiskBadge({ level, needsReview = false }: RiskBadgeProps) {
  if (needsReview) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/40 px-2 py-0.5 text-xs font-medium text-[#f59e0b]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
        Needs review
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${riskColor[level]}20`,
        color: riskColor[level],
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: riskColor[level] }}
      />
      {level}
    </span>
  );
}

export default RiskBadge;
