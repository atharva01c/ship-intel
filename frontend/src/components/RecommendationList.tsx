interface RecommendationListProps {
  recommendations: string[];
}

function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Recommendations</h2>

      {recommendations.length === 0 ? (
        <p style={styles.empty}>No recommendations</p>
      ) : (
        <ul style={styles.list}>
          {recommendations.map((rec, index) => (
            <li key={index} style={styles.item}>
              <span style={styles.bullet}>{index + 1}</span>
              <span>{rec}</span>
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
  bullet: {
    flexShrink: 0,
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: "var(--accent-bg)",
    color: "var(--accent)",
    fontWeight: 600,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default RecommendationList;
