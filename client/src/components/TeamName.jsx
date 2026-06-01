import "flag-icons/css/flag-icons.min.css";

export default function TeamName({ team, variant = "full" }) {
  if (!team) {
    return <span className="text-gray-400">TBD</span>;
  }

  if (team.isPlaceholder) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-300 text-[10px] font-bold text-white">
          W
        </span>
        <span className="text-xs font-semibold">{team.name}</span>
      </div>
    );
  }

  const flag = team.flagCode ? (
    <span className={`fi fi-${team.flagCode} rounded-sm shrink-0`} />
  ) : null;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {flag}
        <span className="text-xs font-bold">{team.fifaCode}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {flag}
      <span className="font-medium">{team.name}</span>
    </div>
  );
}