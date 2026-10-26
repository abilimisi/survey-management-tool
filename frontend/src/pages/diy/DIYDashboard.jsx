import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Studies", value: "0", description: "All your studies" },
  { label: "In Review", value: "0", description: "Awaiting approval" },
  { label: "In Fieldwork", value: "0", description: "Currently collecting responses" },
  { label: "Completed", value: "0", description: "Finished studies" },
];

function DIYDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>PANELSPHERE DIY</p>
          <h1 style={styles.heading}>Study Dashboard</h1>
          <p style={styles.subtitle}>
            Create studies, define your audience, and monitor your research.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => navigate("/diy/studies/create")}
        >
          + Create Study
        </button>
      </header>

      <section style={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.label} style={styles.statCard}>
            <p style={styles.statLabel}>{stat.label}</p>
            <h2 style={styles.statValue}>{stat.value}</h2>
            <p style={styles.statDescription}>{stat.description}</p>
          </article>
        ))}
      </section>

      <section style={styles.section}>
        <div>
          <h2 style={styles.sectionHeading}>Your Studies</h2>
          <p style={styles.subtitle}>
            Your submitted and ongoing research projects will appear here.
          </p>
        </div>

        <div style={styles.emptyState}>
          <div style={styles.icon}>📋</div>
          <h3>No studies yet</h3>
          <p>
            Create your first study to start planning your research.
          </p>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate("/diy/studies/create")}
          >
            Create Your First Study
          </button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: "28px",
    maxWidth: "1400px",
    margin: "0 auto",
    color: "#1f2937",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    marginBottom: "8px",
  },
  heading: {
    fontSize: "28px",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
    lineHeight: 1.6,
  },
  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "22px",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "0 0 14px",
  },
  statValue: {
    fontSize: "30px",
    margin: "0 0 8px",
  },
  statDescription: {
    color: "#9ca3af",
    fontSize: "12px",
    margin: 0,
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
  },
  sectionHeading: {
    fontSize: "20px",
    margin: "0 0 8px",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 16px",
    color: "#6b7280",
  },
  icon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
};

export default DIYDashboard;