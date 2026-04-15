import { useApp } from "../context/AppContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { dashboard, activity, loading } = useApp();

  return (
    <section className="dashboard-page">
      <header className="dashboard-head">
        <h1>Dashboard</h1>
        <p>Track progress, tasks and collaboration metrics.</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Tasks</span>
          <h2>{loading.dashboard ? "..." : dashboard.totalTasks}</h2>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <h2>{loading.dashboard ? "..." : dashboard.completedTasks}</h2>
        </article>
        <article className="stat-card">
          <span>Pending</span>
          <h2>{loading.dashboard ? "..." : dashboard.pendingTasks}</h2>
        </article>
        <article className="stat-card">
          <span>Members</span>
          <h2>{loading.dashboard ? "..." : dashboard.membersCount}</h2>
        </article>
      </div>

      <article className="activity-card">
        <h3>Recent Activity</h3>
        <ul>
          {activity.length === 0 ? <li>No activity yet.</li> : null}
          {activity.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}