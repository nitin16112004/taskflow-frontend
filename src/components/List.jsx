import { Droppable } from "@hello-pangea/dnd";
import Card from "./Card";
import "./List.css";

export default function List({
  list,
  tasks,
  users,
  allLists,
  onAddTask,
  onEditTask,
  onDeleteTask,
  dragHandleProps
}) {
  return (
    <section className="list-column">
      <header className="list-head" {...dragHandleProps}>
        <h3>{list.title}</h3>
        <span>{tasks.length}</span>
      </header>

      <button className="list-add-btn" onClick={() => onAddTask(list._id)}>
        + Add Task
      </button>

      <Droppable droppableId={list._id} type="TASK">
        {(provided, snapshot) => (
          <div
            className={`list-tasks ${snapshot.isDraggingOver ? "drag-over" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Card
                key={task._id}
                index={index}
                task={task}
                users={users}
                lists={allLists}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}