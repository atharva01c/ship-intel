import type { Shipment } from "../types/shipment";

interface ShipmentOverviewProps {
  shipment: Shipment;
}

const priorityColor: Record<Shipment["priority"], string> = {
  Low: "var(--text)",
  Normal: "var(--accent)",
  High: "#f59e0b",
  Urgent: "#ef4444",
};

function ShipmentOverview({ shipment }: ShipmentOverviewProps) {
  const { shipmentDetails: details, priority } = shipment;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Shipment Overview</h2>
        <span
          style={{
            ...styles.badge,
            color: priorityColor[priority],
            borderColor: priorityColor[priority],
          }}
        >
          {priority}
        </span>
      </div>

      <div style={styles.grid}>
        <DetailRow label="Origin" value={details.origin} />
        <DetailRow label="Destination" value={details.destination} />
        <DetailRow label="Cargo Type" value={details.cargoType} />
        <DetailRow
          label="Weight"
          value={details.weight != null ? `${details.weight} kg` : null}
        />
        <DetailRow
          label="Delivery Deadline"
          value={details.deliveryDeadline != null ? `${details.deliveryDeadline}` : null}
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value ?? "—"}</span>
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
    marginBottom: 20,
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
  grid: {
    display: "grid",
    gap: 14,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  label: {
    color: "var(--text)",
    fontSize: 14,
    fontWeight: 500,
    minWidth: 150,
  },
  value: {
    color: "var(--text-h)",
    fontSize: 14,
    textAlign: "right",
  },
};

export default ShipmentOverview;
