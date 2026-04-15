import { useMemo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import "./Card.css";

export default function Card({ task, users, lists, onEdit, onDelete, index }) {
  const assignee = useMemo(() => {
    const assignedId = task.assignedUser?._id || task.assignedUser;
    return users.find((user) => user._id === assignedId);
  }, [task, users]);

  const listId = task.list?._id || task.list;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <article
          className={`task-card ${snapshot.isDragging ? "dragging-task" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task-top">
            <h4>{task.title}</h4>
            <span className={`priority ${String(task.priority || "").toLowerCase()}`}>
              {task.priority || "Medium"}
            </span>
          </div>

          <p className="task-desc">{task.description || "-"}</p>

          <div className="task-meta">
            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</span>
            <div className="task-assignee">
              <span className="task-avatar">
                {(assignee?.name || "U")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span>{assignee?.name || "Unassigned"}</span>
            </div>
          </div>

          <div className="task-actions">
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onDelete(task._id)}>Delete</button>
            <select value={listId || ""} disabled>
              {lists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.title}
                </option>
              ))}
            </select>
          </div>
        </article>
      )}
    </Draggable>
  );
}