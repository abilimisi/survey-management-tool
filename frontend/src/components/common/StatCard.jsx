function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h3>{value}</h3>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

export default StatCard;