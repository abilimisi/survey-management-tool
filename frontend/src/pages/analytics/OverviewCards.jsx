import "./OverviewCards.css";

export default function OverviewCards({ data }) {
  if (!data) return null;

  const cards = [
    {
      title: "Total Hits",
      value: data.total_hits,
      color: "blue",
      icon: "👥",
    },
    {
      title: "Completes",
      value: data.completes,
      color: "green",
      icon: "✅",
    },
    {
      title: "Terminates",
      value: data.terminates,
      color: "red",
      icon: "❌",
    },
    {
      title: "Quota Full",
      value: data.quota_full,
      color: "orange",
      icon: "📊",
    },
    {
      title: "Security",
      value: data.security_terminates,
      color: "purple",
      icon: "🔒",
    },
    {
      title: "IR %",
      value: `${data.ir}%`,
      color: "cyan",
      icon: "📈",
    },
  ];

  return (
    <div className="overview-grid">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`overview-card ${card.color}`}
        >
          <div className="overview-icon">{card.icon}</div>

          <div className="overview-text">
            <h4>{card.title}</h4>

            <h2>{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}