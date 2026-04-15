import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import Table from "../components/Table";
import "./TableView.css";

export default function TableView() {
  const { filteredTasks, lists, users } = useApp();
  const [sortBy, setSortBy] = useState("dueDate");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const rows = useMemo(() => {
    let result = [...filteredTasks];

    if (priorityFilter !== "All") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "title") return String(a.title).localeCompare(String(b.title));
      if (sortBy === "priority") return String(a.priority).localeCompare(String(b.priority));
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });

    return result;
  }, [filteredTasks, sortBy, priorityFilter]);

  const columns = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    {
      key: "list",
      label: "List",
      render: (task) => {
        const listId = task.list?._id || task.list || task.listId;
        return lists.find((list) => list._id === listId)?.title || "-";
      }
    },
    { key: "priority", label: "Priority" },
    {
      key: "dueDate",
      label: "Due Date",
      render: (task) => (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-")
    },
    {
      key: "assignedUser",
      label: "Assigned User",
      render: (task) => {
        const assignedId = task.assignedUser?._id || task.assignedUser;
        return users.find((user) => user._id === assignedId)?.name || "-";
      }
    }
  ];

  return (
    <section className="table-page">
      <header className="table-head">
        <h1>Table View</h1>
        <p>Review tasks in a sortable table.</p>
      </header>

      <div className="table-filters">
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="title">Sort by Title</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      <Table columns={columns} rows={rows} />
    </section>
  );
}