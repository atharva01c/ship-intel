import type { Shipment } from "../types/shipment";
import { riskColor } from "../lib/shipmentColors";

interface RiskCardProps {
  riskLevel: Shipment["riskLevel"];
  riskScore: number;
}

function RiskCard({ riskLevel, riskScore }: RiskCardProps) {
  const color = riskColor[riskLevel];
  const pct = Math.min(Math.max(riskScore, 0), 100);

  return (
    <div className="text-left">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-medium text-white sm:text-lg">
          Risk Assessment
        </h2>
        <span
          className="shrink-0 rounded border px-2.5 py-0.5 text-xs font-semibold sm:text-[13px]"
          style={{ color, borderColor: color }}
        >
          {riskLevel}
        </span>
      </div>

      <div className="mb-2.5 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-[var(--text-h)] sm:text-4xl">
          {riskScore}
        </span>
        <span className="text-sm text-[var(--text)]">/ 100</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--border)]"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk score ${riskScore} of 100, ${riskLevel}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default RiskCard;
