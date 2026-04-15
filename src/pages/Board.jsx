import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useApp } from "../context/AppContext";
import List from "../components/List";
import Modal from "../components/Modal";
import { PRIORITIES } from "../utils/constants";
import "./Board.css";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const moveBetweenLists = (sourceTasks, destinationTasks, sourceIndex, destinationIndex) => {
  const sourceClone = Array.from(sourceTasks);
  const destinationClone = Array.from(destinationTasks);
  const [moved] = sourceClone.splice(sourceIndex, 1);
  destinationClone.splice(destinationIndex, 0, moved);
  return { sourceClone, destinationClone, moved };
};

export default function Board() {
  const {
    activeBoardId,
    lists,
    tasks,
    users,
    filteredTasks,
    filteredUsers,
    createList,
    createTask,
    updateTask,
    deleteTask,
    updateList,
    fetchTasks,
    loading,
    error,
    setError
  } = useApp();

  const [listTitle, setListTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localLists, setLocalLists] = useState([]);
  const [localTasksByList, setLocalTasksByList] = useState({});

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedUser: "",
    list: ""
  });

  const visibleUsers = filteredUsers.length > 0 ? filteredUsers : users;
  const visibleTasks = filteredTasks.length > 0 ? filteredTasks : tasks;

  const listMap = useMemo(() => {
    const map = {};
    localLists.forEach((list) => {
      map[list._id] = list;
    });
    return map;
  }, [localLists]);

  useEffect(() => {
    const orderedLists = [...lists].sort((a, b) => (a.position || 0) - (b.position || 0));
    setLocalLists(orderedLists);

    const grouped = {};
    orderedLists.forEach((list) => {
      grouped[list._id] = [];
    });

    visibleTasks.forEach((task) => {
      const listId = task.list?._id || task.list || task.listId;
      if (!grouped[listId]) grouped[listId] = [];
      grouped[listId].push(task);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key] = grouped[key].sort((a, b) => (a.position || 0) - (b.position || 0));
    });

    setLocalTasksByList(grouped);
  }, [lists, visibleTasks]);

  const openCreateTask = (listId) => {
    setSelectedTask(null);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      assignedUser: visibleUsers[0]?._id || "",
      list: listId
    });
    setIsModalOpen(true);
  };

  const openEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      priority: task.priority || "Medium",
      assignedUser: task.assignedUser?._id || task.assignedUser || "",
      list: task.list?._id || task.list || ""
    });
    setIsModalOpen(true);
  };

  const handleCreateList = async (event) => {
    event.preventDefault();
    if (!listTitle.trim() || !activeBoardId) return;

    try {
      await createList({
        title: listTitle.trim(),
        boardId: activeBoardId,
        position: localLists.length
      });
      setListTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    try {
      if (selectedTask) {
        await updateTask(selectedTask._id, {
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate,
          priority: taskForm.priority,
          assignedUser: taskForm.assignedUser,
          list: taskForm.list
        });
      } else {
        await createTask({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate,
          priority: taskForm.priority,
          assignedUser: taskForm.assignedUser,
          boardId: activeBoardId,
          listId: taskForm.list
        });
      }

      await fetchTasks(activeBoardId);
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      await fetchTasks(activeBoardId);
    } catch (err) {
      setError(err.message);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "LIST") {
      if (source.index === destination.index) return;

      const previousLists = [...localLists];
      const reordered = reorder(localLists, source.index, destination.index).map((list, index) => ({
        ...list,
        position: index
      }));
      setLocalLists(reordered);

      try {
        await Promise.all(
          reordered.map((list) => updateList(list._id, { position: list.position }))
        );
      } catch (err) {
        setLocalLists(previousLists);
        setError(err.message);
      }

      return;
    }

    const sourceListId = source.droppableId;
    const destinationListId = destination.droppableId;

    if (!localTasksByList[sourceListId]) return;

    const previousState = { ...localTasksByList };

    if (sourceListId === destinationListId) {
      if (source.index === destination.index) return;

      const reordered = reorder(localTasksByList[sourceListId], source.index, destination.index);
      const optimistic = {
        ...localTasksByList,
        [sourceListId]: reordered.map((task, index) => ({ ...task, position: index }))
      };

      setLocalTasksByList(optimistic);

      try {
        const movedTask = optimistic[sourceListId][destination.index];
        await updateTask(movedTask._id, { list: sourceListId });
      } catch (err) {
        setLocalTasksByList(previousState);
        setError(err.message);
      }

      return;
    }

    const moveResult = moveBetweenLists(
      localTasksByList[sourceListId] || [],
      localTasksByList[destinationListId] || [],
      source.index,
      destination.index
    );

    const optimistic = {
      ...localTasksByList,
      [sourceListId]: moveResult.sourceClone.map((task, index) => ({ ...task, position: index })),
      [destinationListId]: moveResult.destinationClone.map((task, index) => ({
        ...task,
        position: index,
        list: destinationListId
      }))
    };

    setLocalTasksByList(optimistic);

    try {
      await updateTask(moveResult.moved._id, { list: destinationListId });
    } catch (err) {
      setLocalTasksByList(previousState);
      setError(err.message);
    }
  };

  return (
    <section className="board-page">
      <header className="board-head">
        <h1>Board</h1>
        <p>Manage tasks across dynamic lists.</p>
      </header>

      <form className="create-list-form" onSubmit={handleCreateList}>
        <input
          type="text"
          placeholder="Create new list"
          value={listTitle}
          onChange={(event) => setListTitle(event.target.value)}
        />
        <button type="submit">+ Add List</button>
      </form>

      {error ? <p className="board-error">{error}</p> : null}
      {loading.lists || loading.tasks ? <p className="board-loading">Loading board data...</p> : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              className="board-grid"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {localLists.map((list, index) => (
                <Draggable draggableId={list._id} index={index} key={list._id}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`list-draggable ${snapshot.isDragging ? "dragging-list" : ""}`}
                    >
                      <List
                        list={listMap[list._id] || list}
                        tasks={localTasksByList[list._id] || []}
                        users={visibleUsers}
                        allLists={localLists}
                        onAddTask={openCreateTask}
                        onEditTask={openEditTask}
                        onDeleteTask={handleDeleteTask}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        isOpen={isModalOpen}
        title={selectedTask ? "Edit Task" : "Create Task"}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
      >
        <form className="task-form" onSubmit={handleTaskSubmit}>
          <label>
            Title
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>

          <label>
            Description
            <textarea
              required
              value={taskForm.description}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>

          <label>
            Due Date
            <input
              type="date"
              required
              value={taskForm.dueDate}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
          </label>

          <label>
            Priority
            <select
              value={taskForm.priority}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, priority: event.target.value }))
              }
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label>
            Assign User
            <select
              value={taskForm.assignedUser}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, assignedUser: event.target.value }))
              }
              required
            >
              {visibleUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Select List
            <select
              value={taskForm.list}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, list: event.target.value }))}
              required
            >
              {localLists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.title}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="submit-task-btn">
            {selectedTask ? "Update Task" : "Create Task"}
          </button>
        </form>
      </Modal>
    </section>
  );
}