interface AlertListProps {
  alerts: string[];
}

function AlertList({ alerts }: AlertListProps) {
  return (
    <div className="text-left">
      <h2 className="m-0 mb-4 text-base font-medium text-white sm:text-lg">
        Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-sm text-[var(--text)]">No alerts</p>
      ) : (
        <ul className="m-0 grid list-none gap-2.5 p-0">
          {alerts.map((alert, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-[var(--text-h)]"
            >
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
              <span className="min-w-0 break-words">{alert}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertList;
