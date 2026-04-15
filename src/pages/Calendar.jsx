import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import "./Calendar.css";

export default function Calendar() {
  const { filteredTasks, users } = useApp();
  const [selectedDate, setSelectedDate] = useState("");
  const [hoveredDate, setHoveredDate] = useState("");

  const tasksByDate = useMemo(() => {
    const grouped = {};
    filteredTasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = new Date(task.dueDate).toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const selectedTasks = selectedDate ? tasksByDate[selectedDate] || [] : [];

  return (
    <section className="calendar-page">
      <header className="calendar-head">
        <h1>Calendar</h1>
        <p>{monthLabel}</p>
      </header>

      <div className="calendar-grid">
        {days.map((day) => {
          const date = new Date(year, month, day);
          const dateKey = date.toDateString();
          const hasTasks = Boolean(tasksByDate[dateKey]?.length);
          const dayTasks = tasksByDate[dateKey] || [];
          const isHovered = hoveredDate === dateKey;

          return (
            <button
              key={dateKey}
              className={`calendar-cell ${hasTasks ? "has-tasks" : ""} ${
                selectedDate === dateKey ? "selected" : ""
              }`}
              onClick={() => setSelectedDate(dateKey)}
              onMouseEnter={() => setHoveredDate(dateKey)}
              onMouseLeave={() => setHoveredDate("")}
            >
              <span className="calendar-day">{day}</span>
              {hasTasks ? <span className="task-dot">{dayTasks.length}</span> : null}

              {isHovered && hasTasks ? (
                <div className="calendar-tooltip">
                  <ul>
                    {dayTasks.slice(0, 3).map((task) => {
                      const assignedId = task.assignedUser?._id || task.assignedUser;
                      const assignedName =
                        task.assignedUser?.name ||
                        users.find((u) => u._id === assignedId)?.name ||
                        "Unassigned";

                      return (
                        <li key={task._id}>
                          <strong>{task.title}</strong>
                          <span className={`tooltip-priority ${String(task.priority || "").toLowerCase()}`}>
                            {task.priority || "Medium"}
                          </span>
                          <small>{assignedName}</small>
                        </li>
                      );
                    })}
                    {dayTasks.length > 3 ? <li className="tooltip-more">+{dayTasks.length - 3} more...</li> : null}
                  </ul>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <article className="selected-date-card">
        <h3>
          {selectedDate ? `Tasks on ${new Date(selectedDate).toLocaleDateString()}` : "Select a date"}
        </h3>
        <ul>
          {selectedDate && selectedTasks.length === 0 ? <li>No tasks on selected date.</li> : null}
          {selectedTasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> — {task.priority}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}