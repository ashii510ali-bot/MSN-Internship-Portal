import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import InternTaskAssignment from "../../components/projectManager/InternTaskAssignment";

import {
  Search,
  Plus,
  FolderKanban,
  Pencil,
  Trash2,
  Eye,
  X,
  CalendarDays,
  Users,
  UserRound,
  AlertCircle,
  CheckCircle2,
  Copy,
  ListTodo,
  Check,
  Clock3,
  ArrowUpDown,
  MoreHorizontal,
  CircleDot,
} from "lucide-react";

// ============================================================
// API URLS
// ============================================================

const PROJECTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/projects-tasks";

const COHORTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/cohorts";

const MENTORS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/auth/mentors";

const TODO_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/todos";

// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
  name: "",
  description: "",
  cohortId: "",
  mentorId: "",
  priority: "Medium",
  status: "Planning",
  progress: 0,
  deadline: "",
};

const emptyTodoForm = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  status: "Pending",
};

// ============================================================
// OVERDUE CHECK
// ============================================================

const isProjectOverdue = (deadline, status) => {
  if (!deadline || status === "Completed") {
    return false;
  }

  return (
    new Date(deadline) <
    new Date(new Date().toISOString().split("T")[0])
  );
};

// ============================================================
// TODO OVERDUE CHECK
// ============================================================

const isTodoOverdue = (dueDate, status, completed) => {
  if (
    !dueDate ||
    status === "Completed" ||
    completed === true
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================
// DATE FOR INPUT
// ============================================================

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date).substring(0, 10);
  }

  return parsedDate.toISOString().substring(0, 10);
};

// ============================================================
// PRIORITY WEIGHT
// ============================================================

const priorityWeight = {
  High: 3,
  Medium: 2,
  Low: 1,
};

// ============================================================
// COMPONENT
// ============================================================

function ProjectsTasks() {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [projects, setProjects] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [todos, setTodos] = useState([]);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todoSaving, setTodoSaving] = useState(false);

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [deadlineFilter, setDeadlineFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // ----------------------------------------------------------
  // MODALS
  // ----------------------------------------------------------

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);

  // ----------------------------------------------------------
  // DELETE TARGET
  // ----------------------------------------------------------

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ----------------------------------------------------------
  // SELECTED / EDITING
  // ----------------------------------------------------------

  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [form, setForm] = useState(emptyForm);

  // ----------------------------------------------------------
  // TASK
  // ----------------------------------------------------------

  const [taskTitle, setTaskTitle] = useState("");

  // ----------------------------------------------------------
  // TO-DO
  // ----------------------------------------------------------

  const [todoForm, setTodoForm] =
    useState(emptyTodoForm);

  const [todoFilter, setTodoFilter] =
    useState("All");

  const [todoSearch, setTodoSearch] =
    useState("");

  // ----------------------------------------------------------
  // TOAST
  // ----------------------------------------------------------

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ==========================================================
  // TOAST
  // ==========================================================

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "success",
        message: "",
      });
    }, 3000);
  };

  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  const loadProjects = async () => {
    try {
      const response =
        await axios.get(PROJECTS_API_URL);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.projects ||
          [];

      setProjects(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load projects error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to load projects."
      );
    }
  };

  // ==========================================================
  // LOAD COHORTS
  // ==========================================================

  const loadCohorts = async () => {
    try {
      const response =
        await axios.get(COHORTS_API_URL);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.cohorts ||
          [];

      setCohorts(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load cohorts error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to load cohorts."
      );
    }
  };

  // ==========================================================
  // LOAD MENTORS
  // ==========================================================

  const loadMentors = async () => {
    try {
      const response =
        await axios.get(MENTORS_API_URL);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.mentors ||
          response.data?.data ||
          [];

      setMentors(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load mentors error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to load mentors."
      );
    }
  };

  // ==========================================================
  // LOAD TODOS
  // ==========================================================

  const loadTodos = async () => {
    try {
      const response =
        await axios.get(TODO_API_URL);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.todos ||
          [];

      setTodos(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Load todos error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to load to-do list."
      );
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);

      await Promise.all([
        loadProjects(),
        loadCohorts(),
        loadMentors(),
        loadTodos(),
      ]);

      setLoading(false);
    };

    loadPageData();
  }, []);

  // ==========================================================
  // FILTERED PROJECTS
  // ==========================================================

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name
          ?.toLowerCase()
          .includes(query) ||
        project.description
          ?.toLowerCase()
          .includes(query) ||
        project.cohortName
          ?.toLowerCase()
          .includes(query) ||
        project.mentorName
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        project.priority === priorityFilter;

      const overdue = isProjectOverdue(
        project.deadline,
        project.status
      );

      const matchesDeadline =
        deadlineFilter === "All" ||
        (deadlineFilter === "Overdue" &&
          overdue) ||
        (deadlineFilter === "Active" &&
          project.status !== "Completed" &&
          !overdue) ||
        (deadlineFilter === "Completed" &&
          project.status === "Completed");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDeadline
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "Name A-Z") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "Progress") {
        return (
          Number(b.progress || 0) -
          Number(a.progress || 0)
        );
      }

      if (sortBy === "Priority") {
        return (
          (priorityWeight[b.priority] || 0) -
          (priorityWeight[a.priority] || 0)
        );
      }

      if (sortBy === "Deadline") {
        return (
          new Date(
            a.deadline || "9999-12-31"
          ) -
          new Date(
            b.deadline || "9999-12-31"
          )
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });
  }, [
    projects,
    search,
    statusFilter,
    priorityFilter,
    deadlineFilter,
    sortBy,
  ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    return {
      total: projects.length,

      inProgress: projects.filter(
        (item) =>
          item.status === "In Progress"
      ).length,

      planning: projects.filter(
        (item) =>
          item.status === "Planning"
      ).length,

      completed: projects.filter(
        (item) =>
          item.status === "Completed"
      ).length,

      overdue: projects.filter((item) =>
        isProjectOverdue(
          item.deadline,
          item.status
        )
      ).length,
    };
  }, [projects]);

  // ==========================================================
  // TODO STATS
  // ==========================================================

  const todoStats = useMemo(() => {
    const completed = todos.filter(
      (todo) =>
        todo.status === "Completed" ||
        todo.completed === true
    ).length;

    const inProgress = todos.filter(
      (todo) =>
        todo.status === "In Progress"
    ).length;

    const pending = todos.filter(
      (todo) =>
        todo.status === "Pending" &&
        todo.completed !== true
    ).length;

    const overdue = todos.filter(
      (todo) =>
        isTodoOverdue(
          todo.dueDate,
          todo.status,
          todo.completed
        )
    ).length;

    return {
      total: todos.length,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [todos]);

  // ==========================================================
  // FILTERED TODOS
  // ==========================================================

  const filteredTodos = useMemo(() => {
    const query =
      todoSearch.toLowerCase().trim();

    return todos
      .filter((todo) => {
        const completed =
          todo.status === "Completed" ||
          todo.completed === true;

        const matchesSearch =
          !query ||
          todo.title
            ?.toLowerCase()
            .includes(query) ||
          todo.description
            ?.toLowerCase()
            .includes(query);

        const overdue = isTodoOverdue(
          todo.dueDate,
          todo.status,
          todo.completed
        );

        const matchesFilter =
          todoFilter === "All" ||
          (todoFilter === "Pending" &&
            todo.status === "Pending" &&
            !completed) ||
          (todoFilter === "In Progress" &&
            todo.status === "In Progress") ||
          (todoFilter === "Completed" &&
            completed) ||
          (todoFilter === "Overdue" &&
            overdue);

        return (
          matchesSearch &&
          matchesFilter
        );
      })
      .sort((a, b) => {
        return (
          new Date(
            a.dueDate || "9999-12-31"
          ) -
          new Date(
            b.dueDate || "9999-12-31"
          )
        );
      });
  }, [
    todos,
    todoSearch,
    todoFilter,
  ]);

  // ==========================================================
  // UPCOMING DEADLINES
  // ==========================================================

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...projects]
      .filter((project) => {
        if (
          !project.deadline ||
          project.status === "Completed"
        ) {
          return false;
        }

        const deadline =
          new Date(project.deadline);

        deadline.setHours(0, 0, 0, 0);

        return deadline >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline) -
          new Date(b.deadline)
      )
      .slice(0, 5);
  }, [projects]);

  // ==========================================================
  // OPEN ADD MODAL
  // ==========================================================

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditModal = (project) => {
    setEditingId(
      project.id || project._id
    );

    setForm({
      name: project.name || "",
      description:
        project.description || "",
      cohortId:
        project.cohortId || "",
      mentorId:
        project.mentorId || "",
      priority:
        project.priority || "Medium",
      status:
        project.status || "Planning",
      progress:
        Number(project.progress || 0),
      deadline: formatDateForInput(
        project.deadline
      ),
    });

    setShowDetails(false);
    setShowModal(true);
  };

  // ==========================================================
  // OPEN DETAILS
  // ==========================================================

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setTaskTitle("");
    setShowDetails(true);
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "progress"
          ? Number(value)
          : value,
    }));
  };

  // ==========================================================
  // CREATE / UPDATE PROJECT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.deadline
    ) {
      showToast(
        "error",
        "Please complete project name and deadline."
      );

      return;
    }

    const cohort = cohorts.find(
      (item) =>
        String(
          item.id || item._id
        ) ===
        String(form.cohortId)
    );

    const mentor = mentors.find(
      (item) =>
        String(
          item.id || item._id
        ) ===
        String(form.mentorId)
    );

    const payload = {
      name: form.name.trim(),
      description:
        form.description.trim(),
      cohortId: form.cohortId,
      mentorId: form.mentorId,
      cohortName:
        cohort?.name ||
        form.cohortName ||
        "Unassigned",
      mentorName:
        mentor?.name ||
        form.mentorName ||
        "Unassigned",
      priority: form.priority,
      status: form.status,
      progress: Number(
        form.progress
      ),
      deadline: form.deadline,
    };

    try {
      setSaving(true);

      if (editingId) {
        const response =
          await axios.put(
            `${PROJECTS_API_URL}/${editingId}`,
            payload
          );

        const updatedProject =
          response.data?.data;

        if (!updatedProject) {
          throw new Error(
            "Updated project data was not returned."
          );
        }

        setProjects((previous) =>
          previous.map((project) =>
            String(
              project.id ||
                project._id
            ) ===
            String(editingId)
              ? updatedProject
              : project
          )
        );

        if (
          selectedProject &&
          String(
            selectedProject.id ||
              selectedProject._id
          ) ===
            String(editingId)
        ) {
          setSelectedProject(
            updatedProject
          );
        }

        showToast(
          "success",
          "Project updated successfully."
        );
      } else {
        const response =
          await axios.post(
            PROJECTS_API_URL,
            payload
          );

        const newProject =
          response.data?.data;

        if (!newProject) {
          throw new Error(
            "Created project data was not returned."
          );
        }

        setProjects((previous) => [
          newProject,
          ...previous,
        ]);

        showToast(
          "success",
          "Project created successfully."
        );
      }

      setShowModal(false);
      setForm({ ...emptyForm });
      setEditingId(null);
    } catch (error) {
      console.error(
        "Save project error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE PROJECT
  // ==========================================================

  const handleDelete = (project) => {
    setDeleteTarget({
      type: "project",
      project,
      name: project.name,
    });

    setShowDeleteModal(true);
  };

  // ==========================================================
  // DUPLICATE PROJECT
  // ==========================================================

  const handleDuplicate = async (
    project
  ) => {
    try {
      const deadline =
        formatDateForInput(
          project.deadline
        );

      if (!deadline) {
        showToast(
          "error",
          "This project does not have a valid deadline."
        );

        return;
      }

      const payload = {
        name: `${project.name} Copy`,
        description:
          project.description || "",
        cohortId:
          project.cohortId || "",
        mentorId:
          project.mentorId || "",
        cohortName:
          project.cohortName ||
          "Unassigned",
        mentorName:
          project.mentorName ||
          "Unassigned",
        priority:
          project.priority ||
          "Medium",
        status: "Planning",
        progress: 0,
        deadline,
        tasks: [],
      };

      const response =
        await axios.post(
          PROJECTS_API_URL,
          payload
        );

      const duplicate =
        response.data?.data;

      if (!duplicate) {
        throw new Error(
          "Duplicated project data was not returned."
        );
      }

      setProjects((previous) => [
        duplicate,
        ...previous,
      ]);

      showToast(
        "success",
        "Project duplicated successfully."
      );
    } catch (error) {
      console.error(
        "Duplicate project error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to duplicate project."
      );
    }
  };

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const updateProjectStatus = async (
    status
  ) => {
    if (!selectedProject) {
      return;
    }

    const projectId =
      selectedProject.id ||
      selectedProject._id;

    try {
      const response =
        await axios.put(
          `${PROJECTS_API_URL}/${projectId}`,
          { status }
        );

      const updatedProject =
        response.data?.data;

      if (!updatedProject) {
        throw new Error(
          "Updated project data was not returned."
        );
      }

      setProjects((previous) =>
        previous.map((project) =>
          String(
            project.id ||
              project._id
          ) === String(projectId)
            ? updatedProject
            : project
        )
      );

      setSelectedProject(
        updatedProject
      );

      showToast(
        "success",
        `Project status updated to "${status}".`
      );
    } catch (error) {
      console.error(
        "Update project status error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to update project status."
      );
    }
  };

  // ==========================================================
  // ADD TASK
  // ==========================================================

  const addProjectTask = async () => {
    if (!selectedProject) {
      return;
    }

    const newTaskTitle =
      taskTitle.trim();

    if (!newTaskTitle) {
      showToast(
        "error",
        "Please enter a task title."
      );

      return;
    }

    const projectId =
      selectedProject.id ||
      selectedProject._id;

    try {
      const response =
        await axios.post(
          `${PROJECTS_API_URL}/${projectId}/tasks`,
          {
            title: newTaskTitle,
          }
        );

      const updatedProject =
        response.data?.data;

      if (!updatedProject) {
        throw new Error(
          "Updated project data was not returned."
        );
      }

      setProjects((previous) =>
        previous.map((project) =>
          String(
            project.id ||
              project._id
          ) === String(projectId)
            ? updatedProject
            : project
        )
      );

      setSelectedProject(
        updatedProject
      );

      setTaskTitle("");

      showToast(
        "success",
        `Task "${newTaskTitle}" added successfully.`
      );
    } catch (error) {
      console.error(
        "Add task error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to add task."
      );
    }
  };

  // ==========================================================
  // TOGGLE TASK
  // ==========================================================

  const toggleProjectTask = async (
    taskId
  ) => {
    if (!selectedProject) {
      return;
    }

    const projectId =
      selectedProject.id ||
      selectedProject._id;

    try {
      const response =
        await axios.put(
          `${PROJECTS_API_URL}/${projectId}/tasks/${taskId}`,
          {}
        );

      const updatedProject =
        response.data?.data;

      if (!updatedProject) {
        throw new Error(
          "Updated project data was not returned."
        );
      }

      setProjects((previous) =>
        previous.map((project) =>
          String(
            project.id ||
              project._id
          ) === String(projectId)
            ? updatedProject
            : project
        )
      );

      setSelectedProject(
        updatedProject
      );

      const updatedTask = (
        updatedProject.tasks || []
      ).find(
        (task) =>
          String(
            task.id ||
              task._id
          ) === String(taskId)
      );

      const completed =
        updatedTask?.status ===
          "Completed" ||
        updatedTask?.completed ===
          true;

      showToast(
        "success",
        completed
          ? "Task marked as completed."
          : "Task marked as pending."
      );
    } catch (error) {
      console.error(
        "Toggle task error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to update task."
      );
    }
  };

  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const deleteProjectTask = (
    taskId
  ) => {
    if (!selectedProject) {
      return;
    }

    const task = (
      selectedProject.tasks || []
    ).find(
      (item) =>
        String(
          item.id ||
            item._id
        ) === String(taskId)
    );

    setDeleteTarget({
      type: "task",
      taskId,
      project: selectedProject,
      name:
        task?.title ||
        "this task",
    });

    setShowDeleteModal(true);
  };

  // ==========================================================
  // CONFIRM DELETE
  // ==========================================================

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      if (
        deleteTarget.type ===
        "project"
      ) {
        const project =
          deleteTarget.project;

        const projectId =
          project.id ||
          project._id;

        await axios.delete(
          `${PROJECTS_API_URL}/${projectId}`
        );

        setProjects((previous) =>
          previous.filter(
            (item) =>
              String(
                item.id ||
                  item._id
              ) !==
              String(projectId)
          )
        );

        if (
          selectedProject &&
          String(
            selectedProject.id ||
              selectedProject._id
          ) ===
            String(projectId)
        ) {
          setSelectedProject(null);
          setShowDetails(false);
        }

        showToast(
          "success",
          `Project "${project.name}" deleted successfully.`
        );
      }

      if (
        deleteTarget.type ===
        "task"
      ) {
        const project =
          deleteTarget.project;

        const projectId =
          project.id ||
          project._id;

        const response =
          await axios.delete(
            `${PROJECTS_API_URL}/${projectId}/tasks/${deleteTarget.taskId}`
          );

        const updatedProject =
          response.data?.data;

        if (!updatedProject) {
          throw new Error(
            "Updated project data was not returned."
          );
        }

        setProjects((previous) =>
          previous.map((item) =>
            String(
              item.id ||
                item._id
            ) === String(projectId)
              ? updatedProject
              : item
          )
        );

        setSelectedProject(
          updatedProject
        );

        showToast(
          "success",
          `Task "${deleteTarget.name}" deleted successfully.`
        );
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Delete operation failed."
      );

      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ==========================================================
  // OPEN TODO FORM
  // ==========================================================

  const openTodoForm = () => {
    setTodoForm({
      ...emptyTodoForm,
    });

    setShowTodoForm(true);
  };

  // ==========================================================
  // ADD TODO
  // ==========================================================

  const addTodo = async () => {
    if (!todoForm.title.trim()) {
      showToast(
        "error",
        "Please enter a to-do title."
      );

      return;
    }

    try {
      setTodoSaving(true);

      await axios.post(
        TODO_API_URL,
        {
          title:
            todoForm.title.trim(),

          description:
            todoForm.description.trim(),

          priority:
            todoForm.priority,

          dueDate:
            todoForm.dueDate || null,

          status:
            todoForm.status,

          completed:
            todoForm.status ===
            "Completed",
        }
      );

      await loadTodos();

      setTodoForm({
        ...emptyTodoForm,
      });

      setShowTodoForm(false);

      showToast(
        "success",
        "To-do added successfully."
      );
    } catch (error) {
      console.error(
        "Add todo error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to add to-do."
      );
    } finally {
      setTodoSaving(false);
    }
  };

  // ==========================================================
  // TOGGLE TODO
  // ==========================================================

  const toggleTodo = async (
    todoId
  ) => {
    try {
      await axios.put(
        `${TODO_API_URL}/${todoId}/toggle`
      );

      await loadTodos();

      showToast(
        "success",
        "To-do status updated."
      );
    } catch (error) {
      console.error(
        "Toggle todo error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to update to-do."
      );
    }
  };

  // ==========================================================
  // DELETE TODO
  // ==========================================================

  const deleteTodo = async (
    todoId
  ) => {
    try {
      await axios.delete(
        `${TODO_API_URL}/${todoId}`
      );

      await loadTodos();

      showToast(
        "success",
        "To-do deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete todo error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to delete to-do."
      );
    }
  };

  // ==========================================================
  // TODO FORM CHANGE
  // ==========================================================

  const handleTodoChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setTodoForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (
    status
  ) => {
    if (status === "Completed") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (
      status === "In Progress"
    ) {
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    }

    return "border-red-200 bg-red-50 text-red-700";
  };

  // ==========================================================
  // PRIORITY CLASS
  // ==========================================================

  const getPriorityClass = (
    priority
  ) => {
    if (priority === "High") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (priority === "Medium") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-blue-200 bg-blue-50 text-blue-700";
  };

  // ==========================================================
  // TODO PRIORITY CLASS
  // ==========================================================

  const getTodoPriorityClass = (
    priority
  ) => {
    if (priority === "High") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (priority === "Medium") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-blue-200 bg-blue-50 text-blue-700";
  };

  // ==========================================================
  // INPUT
  // ==========================================================

  const inputClass =
    "h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#172033] outline-none transition-all duration-200 placeholder:text-[#64748B] hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[70vh] max-w-[1600px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />

            <p className="mt-4 text-sm font-bold text-[#64748B]">
              Loading projects...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F3F6FB] px-3 py-4 text-[#172033] sm:px-5 lg:px-6">

      {/* ======================================================
          INTERN TASK ASSIGNMENT
          Added during integration: this is where work created
          here is handed to a specific intern and enters the
          submission -> mentor review workflow.
      ====================================================== */}

      <InternTaskAssignment />

      <style>{`
        .gradient-border-wrap {
          position: relative;
          padding: 1.5px;
          border-radius: 1rem;
          background: linear-gradient(
            90deg,
            #2563EB,
            #22D3EE,
            #DC2626,
            #2563EB
          );
          background-size: 300% 300%;
          animation: gradientBorderMove 6s ease infinite;
          box-shadow:
            0 8px 26px rgba(15, 23, 42, 0.06);
          transition:
            transform 300ms ease,
            box-shadow 300ms ease,
            filter 300ms ease;
        }

        .gradient-border-wrap:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 38px rgba(15, 23, 42, 0.11);
          filter: saturate(1.08);
        }

        .gradient-border-inner {
          height: 100%;
          border-radius: calc(1rem - 1.5px);
          background: #FFFFFF;
        }

        .section-gradient-border {
          position: relative;
          padding: 1px;
          border-radius: 1rem;
          background: linear-gradient(
            90deg,
            #2563EB,
            #22D3EE,
            #DC2626
          );
          background-size: 220% 100%;
          animation: sectionBorderMove 7s ease infinite;
        }

        .section-gradient-inner {
          border-radius: calc(1rem - 1px);
          background: #FFFFFF;
        }

        @keyframes gradientBorderMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes sectionBorderMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .project-toast {
          animation: toastSlideIn 300ms ease-out;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* ================================================== */}
        {/* TOAST */}
        {/* ================================================== */}

        {toast.show && (
          <div className="fixed right-5 top-5 z-[100]">
            <div
              className={`project-toast flex min-w-[320px] max-w-[420px] items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.15)] ${
                toast.type === "success"
                  ? "border-blue-100"
                  : "border-red-100"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  toast.type === "success"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`text-xs font-black uppercase tracking-wider ${
                    toast.type === "success"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {toast.type === "success"
                    ? "Success"
                    : "Error"}
                </p>

                <p className="mt-0.5 text-sm font-bold text-[#64748B]">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setToast({
                    show: false,
                    type: "success",
                    message: "",
                  })
                }
                className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-slate-100 hover:text-[#172033]"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="section-gradient-border">
          <div className="section-gradient-inner rounded-[calc(1rem-1px)] p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3D8] to-[#DC2626]" />

                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB]">
                    Project Manager
                  </p>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#172033] sm:text-4xl">
                  Projects & Tasks
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
                  Create, organize and monitor
                  projects, tasks, progress and
                  deadlines from one workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-black text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_16px_35px_rgba(37,99,235,0.24)] active:scale-95"
              >
                <Plus size={18} />
                Create Project
              </button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <section className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {[
            {
              title: "Total Projects",
              value: stats.total,
              icon: FolderKanban,
            },
            {
              title: "In Progress",
              value: stats.inProgress,
              icon: CircleDot,
            },
            {
              title: "Planning",
              value: stats.planning,
              icon: Clock3,
            },
            {
              title: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
            },
            {
              title: "Overdue",
              value: stats.overdue,
              icon: AlertCircle,
            },
          ].map(
            ({
              title,
              value,
              icon: Icon,
            }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      {title}
                    </p>

                    <p className="mt-2 text-3xl font-black leading-none text-[#172033]">
                      {value}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            )
          )}
        </section>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

          <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_180px_180px]">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search projects, cohorts, mentors..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Planning">
                Planning
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="Low">
                Low Priority
              </option>
            </select>

            <select
              value={deadlineFilter}
              onChange={(event) =>
                setDeadlineFilter(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="All">
                All Projects
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Overdue">
                Overdue
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <div className="relative">
              <ArrowUpDown
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
                className={`${inputClass} pl-10`}
              >
                <option value="Newest">
                  Newest First
                </option>

                <option value="Name A-Z">
                  Name A-Z
                </option>

                <option value="Deadline">
                  Deadline
                </option>

                <option value="Progress">
                  Progress
                </option>

                <option value="Priority">
                  Priority
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* PROJECT CARDS */}
        {/* ================================================== */}

        <section>
          {filteredProjects.length > 0 ? (
            <div className="grid items-stretch gap-5 lg:grid-cols-2 2xl:grid-cols-3">

              {filteredProjects.map(
                (project) => {
                  const tasks =
                    project.tasks || [];

                  const completedTasks =
                    tasks.filter(
                      (task) =>
                        task.status ===
                          "Completed" ||
                        task.completed === true
                    ).length;

                  const pendingTasks =
                    tasks.length -
                    completedTasks;

                  const overdue =
                    isProjectOverdue(
                      project.deadline,
                      project.status
                    );

                  const projectKey =
                    project.id ||
                    project._id;

                  return (
                    <article
                      key={projectKey}
                      className="gradient-border-wrap group flex min-h-[560px] h-full"
                    >
                      <div className="gradient-border-inner flex h-full w-full flex-col overflow-hidden">

                        <div className="flex h-full flex-col p-5">

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                                <FolderKanban size={20} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                                  Project
                                </p>

                                <h2 className="truncate text-lg font-black text-[#172033] group-hover:text-[#2563EB]">
                                  {project.name}
                                </h2>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getPriorityClass(
                                project.priority
                              )}`}
                            >
                              {project.priority ||
                                "Medium"}
                            </span>
                          </div>

                          <p className="mt-4 min-h-[48px] text-sm leading-6 text-[#64748B]">
                            {project.description ||
                              "No project description provided."}
                          </p>

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="min-w-0 rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3">
                              <div className="flex items-center gap-2 text-[#64748B]">
                                <Users size={15} />

                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  Cohort
                                </span>
                              </div>

                              <p className="mt-1 truncate text-sm font-bold text-[#172033]">
                                {project.cohortName ||
                                  "Unassigned"}
                              </p>
                            </div>

                            <div className="min-w-0 rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3">
                              <div className="flex items-center gap-2 text-[#64748B]">
                                <UserRound size={15} />

                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  Mentor
                                </span>
                              </div>

                              <p className="mt-1 truncate text-sm font-bold text-[#172033]">
                                {project.mentorName ||
                                  "Unassigned"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5">

                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                                Project Progress
                              </span>

                              <span className="text-sm font-black text-[#172033]">
                                {project.progress ||
                                  0}
                                %
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444] transition-all duration-500"
                                style={{
                                  width: `${
                                    project.progress ||
                                    0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="flex min-w-0 items-center gap-2 text-xs text-[#64748B]">
                              <CalendarDays
                                size={14}
                                className={
                                  overdue
                                    ? "shrink-0 text-[#DC2626]"
                                    : "shrink-0 text-[#2563EB]"
                                }
                              />

                              <span
                                className={
                                  overdue
                                    ? "truncate font-bold text-[#DC2626]"
                                    : "truncate"
                                }
                              >
                                {formatDate(
                                  project.deadline
                                )}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openProjectDetails(
                                  project
                                )
                              }
                              className="flex min-w-0 items-center justify-end gap-2 text-xs font-bold text-[#64748B] transition hover:text-[#2563EB]"
                            >
                              <ListTodo
                                size={15}
                                className="shrink-0 text-[#2563EB]"
                              />

                              <span className="truncate">
                                {completedTasks}/
                                {tasks.length}{" "}
                                Tasks
                              </span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openProjectDetails(
                                project
                              )
                            }
                            className="mt-4 flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
                                <ListTodo size={17} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-black text-[#172033]">
                                  Project Tasks
                                </p>

                                <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
                                  {tasks.length ===
                                  0
                                    ? "No tasks yet"
                                    : `${completedTasks} completed • ${pendingTasks} pending`}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-xs font-black text-[#2563EB]">
                              Manage
                            </span>
                          </button>

                          <div className="flex-1" />

                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">

                            <div className="flex min-w-0 items-center gap-2">

                              <span
                                className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${getStatusClass(
                                  project.status
                                )}`}
                              >
                                {project.status ||
                                  "Planning"}
                              </span>

                              {overdue && (
                                <span className="flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[#DC2626]">
                                  <AlertCircle size={12} />
                                  Overdue
                                </span>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-1">

                              <button
                                type="button"
                                title="View Details"
                                onClick={() =>
                                  openProjectDetails(
                                    project
                                  )
                                }
                                className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563EB]"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                title="Edit Project"
                                onClick={() =>
                                  openEditModal(
                                    project
                                  )
                                }
                                className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-[#0891B2]"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                title="Duplicate Project"
                                onClick={() =>
                                  handleDuplicate(
                                    project
                                  )
                                }
                                className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563EB]"
                              >
                                <Copy size={16} />
                              </button>

                              <button
                                type="button"
                                title="Delete Project"
                                onClick={() =>
                                  handleDelete(
                                    project
                                  )
                                }
                                className="rounded-lg border border-red-100 bg-white p-2 text-[#DC2626] transition hover:border-red-300 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                <FolderKanban size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-[#172033]">
                No projects found
              </h3>

              <p className="mt-2 text-sm text-[#64748B]">
                Create a project or change
                your filters.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
              >
                Create First Project
              </button>
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* TODO + UPCOMING DEADLINES */}
        {/* ================================================== */}

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

          {/* ================================================= */}
          {/* MY TO-DO LIST */}
          {/* ================================================= */}

          <div className="gradient-border-wrap">
            <div className="gradient-border-inner">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                        <ListTodo size={19} />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                          Personal Workspace
                        </p>

                        <h2 className="text-xl font-black text-[#172033]">
                          My To-Do List
                        </h2>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-[#64748B]">
                      Manage your personal project-manager work items.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openTodoForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1D4ED8]"
                  >
                    <Plus size={17} />
                    Add To-Do
                  </button>
                </div>

                {/* TODO STATS */}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <div className="rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-black text-[#172033]">
                      {todoStats.total}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      Pending
                    </p>

                    <p className="mt-1 text-xl font-black text-[#172033]">
                      {todoStats.pending}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700">
                      In Progress
                    </p>

                    <p className="mt-1 text-xl font-black text-[#172033]">
                      {todoStats.inProgress}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      Completed
                    </p>

                    <p className="mt-1 text-xl font-black text-[#172033]">
                      {todoStats.completed}
                    </p>
                  </div>
                </div>

                {/* ADD TODO FORM */}

                {showTodoForm && (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">

                    <div className="grid gap-3 md:grid-cols-2">

                      <label className="md:col-span-2">
                        <span className="mb-2 block text-xs font-bold text-[#64748B]">
                          To-Do Title *
                        </span>

                        <input
                          name="title"
                          value={
                            todoForm.title
                          }
                          onChange={
                            handleTodoChange
                          }
                          placeholder="e.g. Review team progress"
                          className={
                            inputClass
                          }
                        />
                      </label>

                      <label className="md:col-span-2">
                        <span className="mb-2 block text-xs font-bold text-[#64748B]">
                          Description
                        </span>

                        <textarea
                          name="description"
                          value={
                            todoForm.description
                          }
                          onChange={
                            handleTodoChange
                          }
                          rows="2"
                          placeholder="Add a short note..."
                          className={`${inputClass} h-auto resize-none py-3`}
                        />
                      </label>

                      <label>
                        <span className="mb-2 block text-xs font-bold text-[#64748B]">
                          Priority
                        </span>

                        <select
                          name="priority"
                          value={
                            todoForm.priority
                          }
                          onChange={
                            handleTodoChange
                          }
                          className={
                            inputClass
                          }
                        >
                          <option value="High">
                            High
                          </option>

                          <option value="Medium">
                            Medium
                          </option>

                          <option value="Low">
                            Low
                          </option>
                        </select>
                      </label>

                      <label>
                        <span className="mb-2 block text-xs font-bold text-[#64748B]">
                          Due Date
                        </span>

                        <input
                          type="date"
                          name="dueDate"
                          value={
                            todoForm.dueDate
                          }
                          onChange={
                            handleTodoChange
                          }
                          className={
                            inputClass
                          }
                        />
                      </label>

                      <label>
                        <span className="mb-2 block text-xs font-bold text-[#64748B]">
                          Status
                        </span>

                        <select
                          name="status"
                          value={
                            todoForm.status
                          }
                          onChange={
                            handleTodoChange
                          }
                          className={
                            inputClass
                          }
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Completed">
                            Completed
                          </option>
                        </select>
                      </label>

                      <div className="flex items-end gap-2">

                        <button
                          type="button"
                          onClick={() => {
                            setShowTodoForm(
                              false
                            );

                            setTodoForm({
                              ...emptyTodoForm,
                            });
                          }}
                          className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#64748B] transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            todoSaving
                          }
                          onClick={
                            addTodo
                          }
                          className="h-11 flex-1 rounded-xl bg-[#2563EB] px-4 text-sm font-black text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {todoSaving
                            ? "Saving..."
                            : "Add To-Do"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TODO FILTERS */}

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px]">

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                    />

                    <input
                      value={
                        todoSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setTodoSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search to-dos..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>

                  <select
                    value={
                      todoFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setTodoFilter(
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="All">
                      All To-Dos
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Overdue">
                      Overdue
                    </option>
                  </select>
                </div>

                {/* TODO LIST */}

                <div className="mt-4 space-y-2">

                  {filteredTodos.length >
                  0 ? (
                    filteredTodos.map(
                      (todo) => {
                        const todoId =
                          todo.id ||
                          todo._id;

                        const completed =
                          todo.status ===
                            "Completed" ||
                          todo.completed ===
                            true;

                        const overdue =
                          isTodoOverdue(
                            todo.dueDate,
                            todo.status,
                            todo.completed
                          );

                        return (
                          <div
                            key={todoId}
                            className={`group flex items-center gap-3 rounded-xl border p-3 transition ${
                              completed
                                ? "border-blue-100 bg-blue-50/50"
                                : overdue
                                ? "border-red-100 bg-red-50/40"
                                : "border-[#E2E8F0] bg-white hover:border-blue-200 hover:shadow-sm"
                            }`}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                toggleTodo(
                                  todoId
                                )
                              }
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                completed
                                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                                  : "border-slate-300 bg-white text-transparent hover:border-blue-500"
                              }`}
                            >
                              <Check size={15} />
                            </button>

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <p
                                  className={`text-sm font-bold ${
                                    completed
                                      ? "text-[#64748B] line-through"
                                      : "text-[#172033]"
                                  }`}
                                >
                                  {
                                    todo.title
                                  }
                                </p>

                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${getTodoPriorityClass(
                                    todo.priority
                                  )}`}
                                >
                                  {
                                    todo.priority
                                  }
                                </span>
                              </div>

                              {todo.description && (
                                <p className="mt-1 truncate text-xs text-[#64748B]">
                                  {
                                    todo.description
                                  }
                                </p>
                              )}

                              <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[#64748B]">

                                {todo.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <CalendarDays
                                      size={
                                        12
                                      }
                                    />

                                    {formatDate(
                                      todo.dueDate
                                    )}
                                  </span>
                                )}

                                <span
                                  className={
                                    completed
                                      ? "font-bold text-blue-600"
                                      : todo.status ===
                                        "In Progress"
                                      ? "font-bold text-cyan-600"
                                      : overdue
                                      ? "font-bold text-red-600"
                                      : "font-bold text-amber-600"
                                  }
                                >
                                  {overdue &&
                                  !completed
                                    ? "Overdue"
                                    : todo.status}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                deleteTodo(
                                  todoId
                                )
                              }
                              title="Delete To-Do"
                              className="rounded-lg p-2 text-[#64748B] transition hover:bg-red-50 hover:text-[#DC2626]"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#E2E8F0] p-8 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[#64748B]">
                        <ListTodo
                          size={24}
                        />
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#64748B]">
                        No to-dos found
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Add a personal management item to start your list.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* UPCOMING DEADLINES */}
          {/* ================================================= */}

          <div className="gradient-border-wrap">
            <div className="gradient-border-inner">

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#DC2626]">
                    <CalendarDays
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DC2626]">
                      Project Planning
                    </p>

                    <h2 className="text-xl font-black text-[#172033]">
                      Upcoming Deadlines
                    </h2>
                  </div>
                </div>

                <p className="mt-2 text-sm text-[#64748B]">
                  Your next active project deadlines.
                </p>

                <div className="mt-5 space-y-3">

                  {upcomingDeadlines.length >
                  0 ? (
                    upcomingDeadlines.map(
                      (project) => {
                        const overdue =
                          isProjectOverdue(
                            project.deadline,
                            project.status
                          );

                        return (
                          <button
                            type="button"
                            key={
                              project.id ||
                              project._id
                            }
                            onClick={() =>
                              openProjectDetails(
                                project
                              )
                            }
                            className="w-full rounded-xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-[#172033]">
                                  {
                                    project.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#64748B]">
                                  {project.progress ||
                                    0}
                                  % complete
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase ${
                                  overdue
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }`}
                              >
                                {overdue
                                  ? "Overdue"
                                  : "Upcoming"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">

                              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                <CalendarDays
                                  size={
                                    14
                                  }
                                  className={
                                    overdue
                                      ? "text-[#DC2626]"
                                      : "text-[#2563EB]"
                                  }
                                />

                                <span
                                  className={
                                    overdue
                                      ? "font-bold text-[#DC2626]"
                                      : "font-bold text-[#172033]"
                                  }
                                >
                                  {formatDate(
                                    project.deadline
                                  )}
                                </span>
                              </div>

                              <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                                View
                              </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444]"
                                style={{
                                  width: `${
                                    project.progress ||
                                    0
                                  }%`,
                                }}
                              />
                            </div>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#E2E8F0] p-8 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                        <CheckCircle2
                          size={24}
                        />
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#64748B]">
                        No upcoming deadlines
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Your active projects are currently on track.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================== */}
      {/* DELETE MODAL */}
      {/* ==================================================== */}

      {showDeleteModal &&
        deleteTarget && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteTarget(null);
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

              <div className="p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#DC2626]">
                    <Trash2 size={22} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DC2626]">
                      Delete Confirmation
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#172033]">
                      {deleteTarget.type ===
                      "project"
                        ? "Delete Project?"
                        : "Delete Task?"}
                    </h2>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-[#64748B]">
                    Are you sure you want
                    to delete{" "}
                    <span className="font-black text-[#172033]">
                      "{deleteTarget.name}"
                    </span>
                    ?

                    <span className="mt-1 block text-xs text-[#64748B]">
                      This action cannot be
                      undone.
                    </span>
                  </p>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(
                        false
                      );
                      setDeleteTarget(null);
                    }}
                    className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      confirmDelete
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-black text-white transition hover:bg-[#B91C1C]"
                  >
                    <Trash2 size={16} />

                    {deleteTarget.type ===
                    "project"
                      ? "Delete Project"
                      : "Delete Task"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ==================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.20)]">

            <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">
                  Project Workspace
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  {editingId
                    ? "Edit Project"
                    : "Create New Project"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 p-5 sm:grid-cols-2"
            >

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Project Name *
                </span>

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Learning Management System"
                  className={inputClass}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Cohort
                </span>

                <select
                  name="cohortId"
                  value={
                    form.cohortId
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Select cohort
                  </option>

                  {cohorts.map(
                    (cohort) => (
                      <option
                        key={
                          cohort.id ||
                          cohort._id
                        }
                        value={
                          cohort.id ||
                          cohort._id
                        }
                      >
                        {
                          cohort.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Mentor
                </span>

                <select
                  name="mentorId"
                  value={
                    form.mentorId
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Select mentor
                  </option>

                  {mentors.map(
                    (mentor) => (
                      <option
                        key={
                          mentor.id ||
                          mentor._id
                        }
                        value={
                          mentor.id ||
                          mentor._id
                        }
                      >
                        {
                          mentor.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Priority
                </span>

                <select
                  name="priority"
                  value={
                    form.priority
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Status
                </span>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="Planning">
                    Planning
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Progress:{" "}
                  {form.progress}%
                </span>

                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={
                    form.progress
                  }
                  onChange={
                    handleChange
                  }
                  className="mt-3 w-full accent-blue-600"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Deadline *
                </span>

                <input
                  type="date"
                  name="deadline"
                  value={
                    form.deadline
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-[#64748B]">
                  Project Description
                </span>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  placeholder="Describe the project objectives, requirements and expected outcome..."
                  className={`${inputClass} h-auto resize-none py-3`}
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DETAILS MODAL */}
      {/* ==================================================== */}

      {showDetails &&
        selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

            <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">

              <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

              <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] p-5">

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">
                    Project Details
                  </p>

                  <h2 className="mt-1 truncate text-2xl font-black text-[#172033]">
                    {
                      selectedProject.name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Created{" "}
                    {formatDate(
                      selectedProject.createdAt
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        selectedProject
                      )
                    }
                    className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-[#2563EB] transition hover:bg-blue-100"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(
                        false
                      )
                    }
                    className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626]"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1.5fr_1fr]">

                {/* LEFT */}

                <div className="space-y-5">

                  <section className="rounded-2xl border border-[#E2E8F0] bg-slate-50/60 p-5">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="font-black text-[#172033]">
                        Project Overview
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${getStatusClass(
                          selectedProject.status
                        )}`}
                      >
                        {
                          selectedProject.status
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#64748B]">
                      {selectedProject.description ||
                        "No project description provided."}
                    </p>
                  </section>

                  <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                          Overall Progress
                        </p>

                        <p className="mt-1 text-3xl font-black text-[#172033]">
                          {selectedProject.progress ||
                            0}
                          %
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                        <FolderKanban size={21} />
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444] transition-all duration-500"
                        style={{
                          width: `${
                            selectedProject.progress ||
                            0
                          }%`,
                        }}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <div className="flex items-center gap-2">

                          <h3 className="font-black text-[#172033]">
                            Project Tasks
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-[#2563EB]">
                            {
                              (
                                selectedProject.tasks ||
                                []
                              ).length
                            }
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[#64748B]">
                          Add, complete and manage
                          project tasks.
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                        <ListTodo size={20} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">

                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            size={15}
                            className="text-[#2563EB]"
                          />

                          <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                            Completed
                          </span>
                        </div>

                        <p className="mt-1 text-xl font-black text-[#172033]">
                          {
                            (
                              selectedProject.tasks ||
                              []
                            ).filter(
                              (task) =>
                                task.status ===
                                  "Completed" ||
                                task.completed ===
                                  true
                            ).length
                          }
                        </p>
                      </div>

                      <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">

                        <div className="flex items-center gap-2">
                          <Clock3
                            size={15}
                            className="text-[#DC2626]"
                          />

                          <span className="text-[10px] font-black uppercase tracking-wider text-[#DC2626]">
                            Pending
                          </span>
                        </div>

                        <p className="mt-1 text-xl font-black text-[#172033]">
                          {
                            (
                              selectedProject.tasks ||
                              []
                            ).filter(
                              (task) =>
                                task.status !==
                                  "Completed" &&
                                task.completed !==
                                  true
                            ).length
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-3">

                      <div className="flex gap-2">

                        <input
                          value={
                            taskTitle
                          }
                          onChange={(
                            event
                          ) =>
                            setTaskTitle(
                              event
                                .target
                                .value
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();
                              addProjectTask();
                            }
                          }}
                          placeholder="Enter task title..."
                          className={`${inputClass} bg-white`}
                        />

                        <button
                          type="button"
                          onClick={
                            addProjectTask
                          }
                          className="shrink-0 rounded-xl bg-[#2563EB] px-4 text-sm font-black text-white transition hover:bg-[#1D4ED8]"
                        >
                          <span className="flex items-center gap-2">
                            <Plus size={16} />
                            Add
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">

                      {(
                        selectedProject.tasks ||
                        []
                      ).map((task) => {

                        const taskId =
                          task.id ||
                          task._id;

                        const completed =
                          task.status ===
                            "Completed" ||
                          task.completed ===
                            true;

                        return (
                          <div
                            key={
                              taskId
                            }
                            className={`group flex items-center gap-3 rounded-xl border p-3 transition ${
                              completed
                                ? "border-blue-100 bg-blue-50/50"
                                : "border-slate-100 bg-slate-50/70 hover:border-blue-100 hover:bg-white"
                            }`}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                toggleProjectTask(
                                  taskId
                                )
                              }
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                completed
                                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                                  : "border-slate-300 bg-white text-transparent hover:border-blue-500"
                              }`}
                            >
                              <Check size={15} />
                            </button>

                            <div className="min-w-0 flex-1">

                              <p
                                className={`truncate text-sm font-bold ${
                                  completed
                                    ? "text-[#64748B] line-through"
                                    : "text-[#172033]"
                                }`}
                              >
                                {
                                  task.title
                                }
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${
                                  completed
                                    ? "border-blue-200 bg-blue-50 text-blue-600"
                                    : "border-red-200 bg-red-50 text-red-600"
                                }`}
                              >
                                {completed
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                deleteProjectTask(
                                  taskId
                                )
                              }
                              className="rounded-lg p-2 text-[#64748B] transition hover:bg-red-50 hover:text-[#DC2626]"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}

                      {(
                        selectedProject.tasks ||
                        []
                      ).length ===
                        0 && (
                        <div className="rounded-xl border border-dashed border-[#E2E8F0] p-8 text-center">

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[#64748B]">
                            <ListTodo size={24} />
                          </div>

                          <p className="mt-3 text-sm font-bold text-[#64748B]">
                            No tasks yet
                          </p>

                          <p className="mt-1 text-xs text-[#64748B]">
                            Add your first task
                            above.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* RIGHT */}

                <div className="space-y-5">

                  <section className="rounded-2xl border border-[#E2E8F0] bg-slate-50/60 p-5">

                    <h3 className="font-black text-[#172033]">
                      Project Information
                    </h3>

                    <div className="mt-4 space-y-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#2563EB]">
                          <Users size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                            Cohort
                          </p>

                          <p className="truncate text-sm font-bold text-[#172033]">
                            {selectedProject.cohortName ||
                              "Unassigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-[#0891B2]">
                          <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                            Mentor
                          </p>

                          <p className="truncate text-sm font-bold text-[#172033]">
                            {selectedProject.mentorName ||
                              "Unassigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-[#DC2626]">
                          <CalendarDays size={17} />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                            Deadline
                          </p>

                          <p
                            className={`text-sm font-bold ${
                              isProjectOverdue(
                                selectedProject.deadline,
                                selectedProject.status
                              )
                                ? "text-[#DC2626]"
                                : "text-[#172033]"
                            }`}
                          >
                            {formatDate(
                              selectedProject.deadline
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

                    <div className="flex items-center justify-between">

                      <h3 className="font-black text-[#172033]">
                        Quick Status
                      </h3>

                      <MoreHorizontal
                        size={18}
                        className="text-[#64748B]"
                      />
                    </div>

                    <div className="mt-4 grid gap-2">

                      {[
                        "Planning",
                        "In Progress",
                        "Completed",
                      ].map(
                        (status) => (
                          <button
                            key={
                              status
                            }
                            type="button"
                            onClick={() =>
                              updateProjectStatus(
                                status
                              )
                            }
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                              selectedProject.status ===
                              status
                                ? getStatusClass(
                                    status
                                  )
                                : "border-slate-100 bg-slate-50 text-[#64748B] hover:border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            {status}

                            {selectedProject.status ===
                              status && (
                              <Check size={16} />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                          Task Completion
                        </p>

                        <p className="mt-1 text-2xl font-black text-[#172033]">
                          {
                            (
                              selectedProject.tasks ||
                              []
                            ).filter(
                              (task) =>
                                task.status ===
                                  "Completed" ||
                                task.completed ===
                                  true
                            ).length
                          }
                          /
                          {
                            (
                              selectedProject.tasks ||
                              []
                            ).length
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          Tasks completed
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444] transition-all duration-500"
                        style={{
                          width: `${
                            (
                              selectedProject.tasks ||
                              []
                            ).length ===
                            0
                              ? 0
                              : (
                                  (
                                    selectedProject.tasks ||
                                    []
                                  ).filter(
                                    (task) =>
                                      task.status ===
                                        "Completed" ||
                                      task.completed ===
                                        true
                                  ).length /
                                  (
                                    selectedProject.tasks ||
                                    []
                                  ).length
                                ) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </section>

                  <div className="flex items-center gap-2 px-1 text-xs text-[#64748B]">
                    <Clock3 size={13} />

                    Last updated{" "}
                    {formatDate(
                      selectedProject.updatedAt ||
                        selectedProject.createdAt
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default ProjectsTasks;