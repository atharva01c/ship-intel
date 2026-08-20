interface RecommendationListProps {
  recommendations: string[];
}

function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="text-left">
      <h2 className="m-0 mb-4 text-base font-medium text-white sm:text-lg">
        Recommendations
      </h2>

      {recommendations.length === 0 ? (
        <p className="text-sm text-[var(--text)]">No recommendations</p>
      ) : (
        <ul className="m-0 grid list-none gap-2.5 p-0">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-[var(--text-h)]"
            >
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-xs font-semibold text-[var(--accent)]">
                {index + 1}
              </span>
              <span className="min-w-0 break-words pt-[2px]">{rec}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecommendationList;
