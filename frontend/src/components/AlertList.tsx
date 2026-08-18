interface AlertListProps {
  alerts: string[];
}

function AlertList({ alerts }: AlertListProps) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Alerts</h2>

      {alerts.length === 0 ? (
        <p style={styles.empty}>No alerts</p>
      ) : (
        <ul style={styles.list}>
          {alerts.map((alert, index) => (
            <li key={index} style={styles.item}>
              <span style={styles.dot} />
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      )}
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
  title: {
    margin: "0 0 16px",
    fontSize: 18,
  },
  empty: {
    color: "var(--text)",
    fontSize: 14,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: 10,
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: "var(--text-h)",
  },
  dot: {
    flexShrink: 0,
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#ef4444",
  },
};

export default AlertList;
