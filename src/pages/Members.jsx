import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import Table from "../components/Table";
import "./Members.css";

export default function Members() {
  const {
    filteredUsers,
    tasks,
    createUser,
    updateUser,
    deleteUser,
    loading,
    error,
    setError
  } = useApp();

  const [search, setSearch] = useState("");
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });

  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ role: "member", status: "Active" });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return filteredUsers
      .filter(
        (member) =>
          String(member.name || "").toLowerCase().includes(q) ||
          String(member.email || "").toLowerCase().includes(q) ||
          String(member.role || "").toLowerCase().includes(q)
      )
      .map((member) => {
        const count = tasks.filter((task) => {
          const assigned = task.assignedUser?._id || task.assignedUser;
          return assigned === member._id;
        }).length;

        return { ...member, tasksCount: count };
      });
  }, [filteredUsers, tasks, search]);

  const columns = [
    {
      key: "member",
      label: "Member",
      render: (member) => (
        <div className="member-cell">
          <span className="member-avatar">
            {String(member.name || "U")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div>
            <p>{member.name}</p>
            <small>{member.email}</small>
          </div>
        </div>
      )
    },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (member) => (
        <span className={`status-badge ${String(member.status || "").toLowerCase()}`}>
          {member.status || "Active"}
        </span>
      )
    },
    { key: "tasksCount", label: "Tasks" }
  ];

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) return;
    try {
      await createUser(newMember);
      setNewMember({ name: "", email: "", password: "", role: "member" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartEdit = (member) => {
    setEditingId(member._id);
    setEditForm({
      role: member.role || "member",
      status: member.status || "Active"
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateUser(editingId, editForm);
      setEditingId("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="members-page">
      <header className="members-head">
        <h1>Members</h1>
        <p>Manage workspace users.</p>
      </header>

      <div className="members-controls">
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={newMember.name}
          onChange={(event) => setNewMember((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          type="email"
          placeholder="Email"
          value={newMember.email}
          onChange={(event) => setNewMember((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          value={newMember.password}
          onChange={(event) =>
            setNewMember((prev) => ({ ...prev, password: event.target.value }))
          }
        />
        <select
          value={newMember.role}
          onChange={(event) => setNewMember((prev) => ({ ...prev, role: event.target.value }))}
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={handleAddMember}>+ Add Member</button>
      </div>

      {loading.users ? <p className="members-loading">Loading users...</p> : null}
      {error ? <p className="members-error">{error}</p> : null}

      <Table
        columns={columns}
        rows={rows}
        renderActions={(member) => (
          <div className="row-actions">
            <button onClick={() => handleStartEdit(member)}>Edit</button>
            <button onClick={() => handleDelete(member._id)}>Delete</button>
          </div>
        )}
      />

      {editingId ? (
        <div className="edit-panel">
          <h4>Edit Member</h4>
          <div className="edit-grid">
            <select
              value={editForm.role}
              onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>

            <select
              value={editForm.status}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button onClick={handleSaveEdit}>Save</button>
            <button
              onClick={() => {
                setEditingId("");
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}