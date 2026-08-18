import type { Shipment } from "../types/shipment";

interface RiskCardProps {
  riskLevel: Shipment["riskLevel"];
  riskScore: number;
}

const riskColor: Record<Shipment["riskLevel"], string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

function RiskCard({ riskLevel, riskScore }: RiskCardProps) {
  const color = riskColor[riskLevel];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Risk Assessment</h2>
        <span style={{ ...styles.badge, color, borderColor: color }}>
          {riskLevel}
        </span>
      </div>

      <div style={styles.scoreRow}>
        <span style={styles.scoreValue}>{riskScore}</span>
        <span style={styles.scoreMax}>/ 100</span>
      </div>

      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${Math.min(Math.max(riskScore, 0), 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 24,
    textAlign: "left",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 18,
  },
  badge: {
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 4,
    padding: "2px 10px",
  },
  scoreRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "var(--text-h)",
  },
  scoreMax: {
    fontSize: 14,
    color: "var(--text)",
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "var(--border)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
};

export default RiskCard;
