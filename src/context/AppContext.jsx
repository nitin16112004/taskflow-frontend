import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AppContext = createContext(null);

const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
};

const getTaskId = (taskOrId) => {
  if (!taskOrId) return "";
  if (typeof taskOrId === "string") return taskOrId;
  return taskOrId._id || taskOrId.id || taskOrId.taskId || "";
};

const normalizeTask = (task) => {
  if (!task) return task;
  return {
    ...task,
    _id: task._id || task.id || task.taskId
  };
};

export function AppProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [authUser, setAuthUser] = useState(getStoredUser());
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState("");
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    membersCount: 0
  });

  const [activity, setActivity] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState({
    auth: false,
    app: false,
    boards: false,
    lists: false,
    tasks: false,
    users: false,
    dashboard: false
  });

  const isAuthenticated = Boolean(token);

  const setLoadingKey = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const pushActivity = (message) => {
    setActivity((prev) => [message, ...prev].slice(0, 25));
  };

  const applyAuth = (payload) => {
    if (!payload?.token) return;
    const user = {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status
    };
    sessionStorage.setItem("token", payload.token);
    sessionStorage.setItem("authUser", JSON.stringify(user));
    setToken(payload.token);
    setAuthUser(user);
  };

  const clearAppState = () => {
    setBoards([]);
    setActiveBoardId("");
    setLists([]);
    setTasks([]);
    setUsers([]);
    setDashboard({
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      membersCount: 0
    });
    setActivity([]);
    setGlobalSearch("");
    setError("");
  };

  const login = useCallback(async (credentials) => {
    setLoadingKey("auth", true);
    setError("");
    try {
      const data = await api.login(credentials);
      applyAuth(data);
      return data;
    } finally {
      setLoadingKey("auth", false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoadingKey("auth", true);
    setError("");
    try {
      const data = await api.register(payload);
      applyAuth(data);
      return data;
    } finally {
      setLoadingKey("auth", false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authUser");
    setToken("");
    setAuthUser(null);
    clearAppState();
  }, []);

  const fetchBoards = useCallback(async () => {
    setLoadingKey("boards", true);
    try {
      const data = await api.getBoards();
      const boardList = Array.isArray(data) ? data : [];
      setBoards(boardList);
      if (boardList.length === 0) setActiveBoardId("");
      else {
        setActiveBoardId((prev) => {
          if (prev && boardList.some((b) => b._id === prev)) return prev;
          return boardList[0]._id;
        });
      }
      return boardList;
    } finally {
      setLoadingKey("boards", false);
    }
  }, []);

  const fetchLists = useCallback(async (boardId) => {
    if (!boardId) {
      setLists([]);
      return [];
    }
    setLoadingKey("lists", true);
    try {
      const data = await api.getLists(boardId);
      const listData = Array.isArray(data) ? data : [];
      setLists(listData.sort((a, b) => (a.position || 0) - (b.position || 0)));
      return listData;
    } finally {
      setLoadingKey("lists", false);
    }
  }, []);

  const fetchTasks = useCallback(async (boardId) => {
    setLoadingKey("tasks", true);
    try {
      const query = boardId ? `boardId=${boardId}` : "";
      const data = await api.getTasks(query);
      const mapped = (Array.isArray(data) ? data : []).map(normalizeTask);
      setTasks(mapped);
      return mapped;
    } finally {
      setLoadingKey("tasks", false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingKey("users", true);
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
      return data;
    } finally {
      setLoadingKey("users", false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoadingKey("dashboard", true);
    try {
      const data = await api.getDashboard();
      setDashboard({
        totalTasks: data.totalTasks || 0,
        completedTasks: data.completedTasks || 0,
        pendingTasks: data.pendingTasks || 0,
        membersCount: data.membersCount || 0
      });
      return data;
    } finally {
      setLoadingKey("dashboard", false);
    }
  }, []);

  const refreshBoardData = useCallback(
    async (boardId) => {
      if (!boardId) return;
      await Promise.all([fetchLists(boardId), fetchTasks(boardId)]);
    },
    [fetchLists, fetchTasks]
  );

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingKey("app", true);
    setError("");
    try {
      const boardList = await fetchBoards();
      const boardId = activeBoardId || boardList[0]?._id || "";
      await Promise.all([fetchUsers(), fetchDashboard()]);
      if (boardId) await refreshBoardData(boardId);
      else {
        setLists([]);
        setTasks([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingKey("app", false);
    }
  }, [isAuthenticated, fetchBoards, activeBoardId, fetchUsers, fetchDashboard, refreshBoardData]);

  const createBoard = useCallback(
    async (payload) => {
      const created = await api.createBoard(payload);
      await fetchBoards();
      pushActivity(`Board '${created.name}' created.`);
      return created;
    },
    [fetchBoards]
  );

  const createList = useCallback(
    async (payload) => {
      const created = await api.createList(payload);
      await fetchLists(payload.boardId);
      pushActivity(`List '${created.title}' created.`);
      return created;
    },
    [fetchLists]
  );

  const updateList = useCallback(
    async (listId, payload) => {
      const updated = await api.updateList(listId, payload);
      if (activeBoardId) await fetchLists(activeBoardId);
      pushActivity("List updated.");
      return updated;
    },
    [activeBoardId, fetchLists]
  );

  const deleteList = useCallback(
    async (listId) => {
      await api.deleteList(listId);
      if (activeBoardId) await Promise.all([fetchLists(activeBoardId), fetchTasks(activeBoardId)]);
      pushActivity("List deleted.");
    },
    [activeBoardId, fetchLists, fetchTasks]
  );

  const createTask = useCallback(
    async (payload) => {
      const created = await api.createTask(payload);
      if (payload.boardId) await fetchTasks(payload.boardId);
      await fetchDashboard();
      pushActivity(`Task '${created.title}' created.`);
      return created;
    },
    [fetchTasks, fetchDashboard]
  );

  const updateTask = useCallback(
    async (taskOrId, payload) => {
      const taskId = getTaskId(taskOrId);
      if (!taskId) throw new Error("Invalid task id");
      const updated = await api.updateTask(taskId, payload);
      if (activeBoardId) await fetchTasks(activeBoardId);
      await fetchDashboard();
      pushActivity(`Task '${updated.title}' updated.`);
      return updated;
    },
    [activeBoardId, fetchTasks, fetchDashboard]
  );

  const deleteTask = useCallback(
    async (taskOrId) => {
      const taskId = getTaskId(taskOrId);
      if (!taskId) throw new Error("Invalid task id");
      await api.deleteTask(taskId);
      if (activeBoardId) await fetchTasks(activeBoardId);
      await fetchDashboard();
      pushActivity("Task deleted.");
    },
    [activeBoardId, fetchTasks, fetchDashboard]
  );

  const moveTask = useCallback(
    async (taskOrId, destinationListId) => {
      const taskId = getTaskId(taskOrId);
      if (!taskId) throw new Error("Invalid task id");
      await api.moveTask(taskId, destinationListId, 0);
      if (activeBoardId) await fetchTasks(activeBoardId);
      const targetList = lists.find((list) => list._id === destinationListId);
      pushActivity(`Task moved to '${targetList?.title || "list"}'.`);
    },
    [activeBoardId, fetchTasks, lists]
  );

  const createUser = useCallback(
    async (payload) => {
      const created = await api.createUser(payload);
      if (activeBoardId && created?._id) {
        try {
          await api.addBoardMember(activeBoardId, created._id);
        } catch {}
      }
      await fetchUsers();
      await fetchDashboard();
      pushActivity(`Member '${created.name}' added.`);
      return created;
    },
    [activeBoardId, fetchUsers, fetchDashboard]
  );

  const updateUser = useCallback(
    async (userId, payload) => {
      const updated = await api.updateUser(userId, payload);
      await fetchUsers();
      pushActivity("Member updated.");
      return updated;
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (userId) => {
      await api.deleteUser(userId);
      await fetchUsers();
      await fetchDashboard();
      pushActivity("Member deleted.");
    },
    [fetchUsers, fetchDashboard]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  const filteredTasks = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((task) => {
      const assignee = task.assignedUser?.name || "";
      return (
        String(task.title || "").toLowerCase().includes(q) ||
        String(task.description || "").toLowerCase().includes(q) ||
        String(task.priority || "").toLowerCase().includes(q) ||
        String(assignee).toLowerCase().includes(q)
      );
    });
  }, [tasks, globalSearch]);

  const filteredUsers = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        String(user.name || "").toLowerCase().includes(q) ||
        String(user.email || "").toLowerCase().includes(q) ||
        String(user.role || "").toLowerCase().includes(q)
    );
  }, [users, globalSearch]);

  useEffect(() => {
    if (isAuthenticated) refreshAll();
  }, [isAuthenticated, refreshAll]);

  useEffect(() => {
    if (!isAuthenticated || !activeBoardId) return;
    refreshBoardData(activeBoardId);
  }, [isAuthenticated, activeBoardId, refreshBoardData]);

  const value = useMemo(
    () => ({
      token,
      authUser,
      isAuthenticated,
      theme,
      boards,
      activeBoardId,
      lists,
      tasks,
      users,
      filteredTasks,
      filteredUsers,
      dashboard,
      activity,
      loading,
      error,
      globalSearch,
      setGlobalSearch,
      setError,
      setActiveBoardId,
      login,
      register,
      logout,
      refreshAll,
      fetchBoards,
      fetchLists,
      fetchTasks,
      fetchUsers,
      fetchDashboard,
      createBoard,
      createList,
      updateList,
      deleteList,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      createUser,
      updateUser,
      deleteUser,
      toggleTheme
    }),
    [
      token,
      authUser,
      isAuthenticated,
      theme,
      boards,
      activeBoardId,
      lists,
      tasks,
      users,
      filteredTasks,
      filteredUsers,
      dashboard,
      activity,
      loading,
      error,
      globalSearch,
      login,
      register,
      logout,
      refreshAll,
      fetchBoards,
      fetchLists,
      fetchTasks,
      fetchUsers,
      fetchDashboard,
      createBoard,
      createList,
      updateList,
      deleteList,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      createUser,
      updateUser,
      deleteUser,
      toggleTheme
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}