(() => {
  "use strict";

  const STORAGE_KEY = "jadwal_pm_v2";

  const NAV_ITEMS = [
    "Dashboard",
    "Projects",
    "Schedule",
    "Tasks",
    "Reports",
    "Files",
    "Costs",
    "Analytics",
    "Risks",
    "Resources",
    "Settings"
  ];

  const PHASE_NAMES = [
    "Initiation",
    "Design",
    "Procurement",
    "Construction",
    "Testing & Commissioning",
    "Handover",
    "Custom phase"
  ];

  const TASK_STATUSES = ["Not Started", "In Progress", "Review", "Blocked", "Done"];
  const PROJECT_STATUSES = ["Planning", "Active", "On Hold", "Completed", "Closed"];

  const ICONS = {
    Dashboard: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z",
    Projects: "M3 7h18M5 7V5h14v2m-1 4H6l-2 8h16l-2-8Z",
    Schedule: "M7 3v4m10-4v4M4 9h16M5 5h14v16H5V5Z",
    Tasks: "m9 11 3 3L22 4M3 6h11M3 12h4M3 18h11",
    Reports: "M7 3h7l5 5v13H7V3Zm7 0v6h5M10 14h6M10 18h6",
    Files: "M4 4h7l2 3h7v13H4V4Z",
    Costs: "M12 2v20m5-16H9.5a3.5 3.5 0 0 0 0 7H15a3.5 3.5 0 0 1 0 7H6",
    Analytics: "M4 19V5m5 14V9m5 10V3m5 16v-7",
    Risks: "M12 3 2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 10h7l2-7Z",
    Resources: "M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 10v-2a3 3 0 0 0-2-2.83",
    Settings: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm8-3.5a8 8 0 0 1-.1 1.2l2 1.5-2 3.5-2.4-1a8 8 0 0 1-2 1.2l-.3 2.6H9l-.3-2.6a8 8 0 0 1-2-1.2l-2.4 1-2-3.5 2-1.5A8 8 0 0 1 4.2 12c0-.4 0-.8.1-1.2l-2-1.5 2-3.5 2.4 1a8 8 0 0 1 2-1.2L9 3h4.4l.3 2.6a8 8 0 0 1 2 1.2l2.4-1 2 3.5-2 1.5c.1.4.1.8.1 1.2Z"
  };

  let state;
  let currentPage = "Dashboard";
  let activeRegister = "rfis";
  let activeModal = null;

  function init() {
    state = normalizeState(loadState());
    saveState();
    bindGlobalEvents();
    renderApp();
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function safeText(selector, value) {
    const element = qs(selector);
    if (element) element.textContent = value;
  }

  function safeHtml(selector, value) {
    const element = qs(selector);
    if (element) element.innerHTML = value;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, (char) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function uid() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function money(value) {
    return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function percent(value) {
    return `${Math.round(Number(value) || 0)}%`;
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : createSeedState();
    } catch (error) {
      console.warn("Failed to load Jadwal PM data. Resetting local state.", error);
      return createSeedState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save Jadwal PM data.", error);
      showToast("Unable to save. Browser storage may be full.");
    }
  }

  function createSeedState() {
    const projectId = uid();
    const phaseRows = [
      ["Initiation", "2026-01-05", "2026-02-05", 100, "Done"],
      ["Design", "2026-02-06", "2026-04-15", 82, "In Progress"],
      ["Procurement", "2026-03-20", "2026-07-10", 64, "In Progress"],
      ["Construction", "2026-04-01", "2026-10-30", 42, "In Progress"],
      ["Testing & Commissioning", "2026-10-01", "2026-11-25", 12, "Not Started"],
      ["Handover", "2026-11-26", "2026-12-20", 0, "Not Started"]
    ];

    const project = {
      id: projectId,
      name: "Riyadh Metro Depot",
      client: "RCRC",
      location: "Riyadh",
      type: "Infrastructure",
      start: "2026-01-05",
      end: "2026-12-20",
      budget: 184000000,
      manager: "M. Nasser",
      status: "Active",
      description: "Depot civil, MEP, testing, and handover control package.",
      phases: phaseRows.map((row) => ({
        id: uid(),
        name: row[0],
        start: row[1],
        end: row[2],
        progress: row[3],
        status: row[4],
        notes: "Baseline phase"
      })),
      tasks: [
        {
          id: uid(),
          name: "Approve enabling works method statement",
          phase: "Initiation",
          assigned: "HSE Lead",
          start: "2026-01-10",
          due: "2026-01-22",
          progress: 100,
          priority: "High",
          status: "Done",
          notes: "Closed"
        },
        {
          id: uid(),
          name: "Issue IFC mechanical coordination drawings",
          phase: "Design",
          assigned: "MEP Lead",
          start: "2026-03-02",
          due: "2026-05-18",
          progress: 68,
          priority: "High",
          status: "In Progress",
          notes: "Consultant comments pending"
        },
        {
          id: uid(),
          name: "Procure chillers and primary pumps",
          phase: "Procurement",
          assigned: "Procurement",
          start: "2026-04-01",
          due: "2026-06-18",
          progress: 45,
          priority: "Critical",
          status: "Blocked",
          notes: "Vendor technical clarification"
        }
      ],
      reports: [
        {
          id: uid(),
          date: "2026-05-10",
          weather: "Clear, 34C",
          manpower: "146",
          equipment: "Cranes 2, loaders 4",
          completed: "Cable tray installation and pump room blockwork.",
          issues: "Late approval for embedded plates.",
          photos: "Photo placeholders only"
        }
      ],
      files: [
        {
          id: uid(),
          name: "MEP Coordination Basement L02",
          discipline: "MEP",
          revision: "C",
          status: "Submitted",
          submitted: "2026-05-03",
          approved: "",
          notes: "Awaiting consultant response"
        }
      ],
      costs: [
        { id: uid(), package: "Civil Works", budget: 76000000, actual: 53000000, forecast: 74000000, notes: "Within allowance" },
        { id: uid(), package: "Mechanical", budget: 42000000, actual: 29000000, forecast: 45500000, notes: "Chiller package pressure" }
      ],
      rfis: [
        { id: uid(), title: "RFI-1027 Chilled water tie-in", status: "Open", owner: "MEP Lead", due: "2026-05-18", notes: "Requires designer response" }
      ],
      submittals: [
        { id: uid(), title: "Fire alarm shop drawings", status: "Pending", owner: "Systems", due: "2026-05-20", notes: "Under consultant review" }
      ],
      risks: [
        { id: uid(), title: "Long-lead chiller delivery", status: "Open", impact: "High", owner: "Procurement", due: "2026-06-01", notes: "Expedite vendor approval" }
      ]
    };

    return { activeProjectId: projectId, projects: [project] };
  }

  function normalizeState(input) {
    const next = input && typeof input === "object" ? input : createSeedState();
    if (!Array.isArray(next.projects)) next.projects = [];

    next.projects.forEach((project) => {
      project.id = project.id || uid();
      project.name = project.name || "Untitled Project";
      project.status = project.status || "Planning";
      project.phases = Array.isArray(project.phases) ? project.phases : [];
      project.tasks = Array.isArray(project.tasks) ? project.tasks : [];
      project.reports = Array.isArray(project.reports) ? project.reports : [];
      project.files = Array.isArray(project.files) ? project.files : [];
      project.costs = Array.isArray(project.costs) ? project.costs : [];
      project.rfis = Array.isArray(project.rfis) ? project.rfis : [];
      project.submittals = Array.isArray(project.submittals) ? project.submittals : [];
      project.risks = Array.isArray(project.risks) ? project.risks : [];
    });

    if (!next.activeProjectId && next.projects[0]) {
      next.activeProjectId = next.projects[0].id;
    }

    if (next.activeProjectId && !next.projects.some((project) => project.id === next.activeProjectId)) {
      next.activeProjectId = next.projects[0] ? next.projects[0].id : "";
    }

    return next;
  }

  function activeProject() {
    return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0] || null;
  }

  function getProject(projectId) {
    return state.projects.find((project) => project.id === projectId) || null;
  }

  function allTasks() {
    return state.projects.flatMap((project) => {
      return project.tasks.map((task) => ({ ...task, projectId: project.id, projectName: project.name }));
    });
  }

  function allRecords(type) {
    return state.projects.flatMap((project) => {
      return (project[type] || []).map((record) => ({ ...record, projectId: project.id, projectName: project.name }));
    });
  }

  function projectProgress(project) {
    if (!project) return 0;
    if (project.phases.length) {
      return project.phases.reduce((sum, phase) => sum + Number(phase.progress || 0), 0) / project.phases.length;
    }
    if (project.tasks.length) {
      return project.tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / project.tasks.length;
    }
    return 0;
  }

  function metrics() {
    const tasks = allTasks();
    const costs = allRecords("costs");
    const budget = costs.reduce((sum, item) => sum + Number(item.budget || 0), 0);
    const actual = costs.reduce((sum, item) => sum + Number(item.actual || 0), 0);
    const overallProgress = state.projects.length
      ? state.projects.reduce((sum, project) => sum + projectProgress(project), 0) / state.projects.length
      : 0;
    const delayedTasks = tasks.filter((task) => {
      if (!task.due || task.status === "Done" || task.status === "Closed") return false;
      return new Date(task.due) < new Date(todayIso());
    }).length;
    const openRfis = allRecords("rfis").filter((record) => record.status !== "Closed").length;
    const pendingSubmittals = allRecords("submittals").filter((record) => !["Approved", "Closed"].includes(record.status)).length;
    const openRisks = allRecords("risks").filter((record) => record.status !== "Closed").length;
    const health = Math.max(0, Math.min(100, overallProgress - openRisks * 4 - delayedTasks * 2));

    return {
      activeProjects: state.projects.filter((project) => !["Completed", "Closed"].includes(project.status)).length,
      overallProgress,
      delayedTasks,
      budgetActual: budget ? (actual / budget) * 100 : 0,
      openRfis,
      pendingSubmittals,
      openRisks,
      health
    };
  }

  function renderApp() {
    renderNav();
    renderProjectSelector();
    renderShellStats();

    const pages = {
      Dashboard: renderDashboard,
      Projects: renderProjectsPage,
      Schedule: renderSchedulePage,
      Tasks: renderTasksPage,
      Reports: renderReportsPage,
      Files: renderFilesPage,
      Costs: renderCostsPage,
      Analytics: renderAnalyticsPage,
      Risks: renderRisksPage,
      Resources: renderResourcesPage,
      Settings: renderSettingsPage
    };

    const renderer = pages[currentPage] || renderDashboard;
    renderer();
  }

  function renderNav() {
    safeHtml("#navList", NAV_ITEMS.map((item) => {
      return `
        <button class="nav-item ${currentPage === item ? "active" : ""}" data-page="${item}" type="button">
          ${svgIcon(ICONS[item])}
          <span>${item}</span>
        </button>
      `;
    }).join(""));
  }

  function renderProjectSelector() {
    const selector = qs("#projectSelector");
    if (!selector) return;

    if (!state.projects.length) {
      selector.innerHTML = `<option value="">No projects yet</option>`;
      return;
    }

    selector.innerHTML = state.projects.map((project) => {
      return `<option value="${project.id}" ${project.id === state.activeProjectId ? "selected" : ""}>${escapeHtml(project.name)}</option>`;
    }).join("");
  }

  function renderShellStats() {
    const data = metrics();
    const openItems = data.openRfis + data.pendingSubmittals + data.openRisks;
    safeText("#workspaceCount", `${data.activeProjects} active projects`);
    safeText("#portfolioHealth", percent(data.health));
    safeText("#portfolioInsight", openItems ? `${openItems} open coordination items need attention.` : "Portfolio is clear of open coordination items.");
    safeText("#notificationBadge", String(openItems));
    safeText("#todayChip", new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }));

    const healthBar = qs("#portfolioHealthBar");
    if (healthBar) healthBar.style.width = percent(data.health);
  }

  function pageHeading(title, subtitle, actions = "") {
    return `
      <section class="page-heading">
        <div>
          <div class="breadcrumb">${currentPage} / Jadwal PM</div>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <div class="heading-actions">
          ${actions}
          <button class="primary-button" data-action="project:new" type="button">New Project</button>
        </div>
      </section>
    `;
  }

  function renderDashboard() {
    const data = metrics();
    const project = activeProject();
    const portfolioValue = state.projects.reduce((sum, item) => sum + Number(item.budget || 0), 0);

    safeHtml("#appMain", `
      ${pageHeading("Engineering Delivery Command Center", "Live local MVP for projects, phases, tasks, reports, drawings, costs, RFIs, submittals, and risks.")}
      <section class="control-strip">
        <div class="stat-card"><span>Portfolio Value</span><strong>SAR ${money(portfolioValue)}</strong></div>
        <div class="stat-card"><span>Active Project</span><strong>${escapeHtml(project ? project.name : "None")}</strong></div>
        <div class="stat-card"><span>Budget vs Actual</span><strong>${percent(data.budgetActual)}</strong></div>
        <div class="stat-card"><span>Open Decisions</span><strong class="danger">${data.openRfis + data.pendingSubmittals + data.openRisks}</strong></div>
      </section>
      ${renderKpis(data)}
      <section class="dashboard-grid">
        <article class="panel panel-wide">
          <div class="panel-head"><div><h3>Projects Overview</h3><p>Saved projects update this table automatically</p></div><button class="text-button" data-route="Projects" type="button">Manage</button></div>
          ${renderProjectsTable(state.projects.slice(0, 6))}
        </article>
        <article class="panel">
          <div class="panel-head"><div><h3>Recent Reports</h3><p>Daily reports for the active project</p></div><button class="text-button" data-action="report:new" type="button">Add</button></div>
          ${renderRecentReports(project)}
        </article>
        <article class="panel">
          <div class="panel-head"><div><h3>Task Status</h3><p>All saved tasks</p></div></div>
          ${renderStatusBars()}
        </article>
        <article class="panel">
          <div class="panel-head"><div><h3>Cost Overview</h3><p>Current project packages</p></div></div>
          ${renderCostCards(project)}
        </article>
      </section>
    `);
  }

  function renderKpis(data) {
    const items = [
      ["Active Projects", data.activeProjects, "good"],
      ["Overall Progress", percent(data.overallProgress), "good"],
      ["Delayed Tasks", data.delayedTasks, data.delayedTasks ? "danger" : "good"],
      ["Budget vs Actual", percent(data.budgetActual), data.budgetActual > 100 ? "warning" : "good"],
      ["Open RFIs", data.openRfis, data.openRfis ? "warning" : "good"],
      ["Pending Submittals", data.pendingSubmittals, data.pendingSubmittals ? "warning" : "good"],
      ["Open Risks", data.openRisks, data.openRisks ? "danger" : "good"]
    ];

    return `
      <section class="kpi-grid">
        ${items.map(([label, value, tone]) => `
          <article class="kpi-card ${tone}">
            <div class="kpi-top"><div class="kpi-icon">${escapeHtml(label[0])}</div></div>
            <span class="kpi-label">${escapeHtml(label)}</span>
            <div class="kpi-value"><strong>${escapeHtml(value)}</strong></div>
            <span class="kpi-trend ${tone}">localStorage live</span>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderProjectsPage() {
    const project = activeProject();
    safeHtml("#appMain", `
      ${pageHeading("Projects", "Create projects, select the active project, and manage phases.", `<button class="secondary-button" data-action="phase:new" type="button">Add Phase</button>`)}
      <section class="panel panel-full">
        <div class="panel-head"><div><h3>Project Register</h3><p>${state.projects.length} saved projects</p></div></div>
        ${renderProjectsTable(state.projects)}
      </section>
      <section class="panel panel-full">
        <div class="panel-head"><div><h3>Phases - ${escapeHtml(project ? project.name : "No project")}</h3><p>Baseline phases and custom phases</p></div><button class="primary-button" data-action="phase:new" type="button">Add Phase</button></div>
        ${renderPhasesTable(project)}
      </section>
    `);
  }

  function renderProjectsTable(projects) {
    if (!projects.length) return emptyState("No projects yet");

    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Project</th><th>Client</th><th>Location</th><th>Progress</th><th>Status</th><th>Budget</th><th>Manager</th><th>Actions</th></tr></thead>
          <tbody>
            ${projects.map((project) => `
              <tr>
                <td><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.type || "")}</small></td>
                <td>${escapeHtml(project.client || "")}</td>
                <td>${escapeHtml(project.location || "")}</td>
                <td><strong>${percent(projectProgress(project))}</strong><div class="track"><span class="fill" style="width:${percent(projectProgress(project))}"></span></div></td>
                <td>${pill(project.status)}</td>
                <td>SAR ${money(project.budget)}</td>
                <td>${escapeHtml(project.manager || "")}</td>
                <td class="row-actions">
                  <button class="linkish" data-action="project:select" data-id="${project.id}" type="button">Select</button>
                  <button class="linkish" data-action="project:edit" data-id="${project.id}" type="button">Edit</button>
                  <button class="linkish danger" data-action="project:delete" data-id="${project.id}" type="button">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPhasesTable(project) {
    if (!project) return emptyState("Create or select a project first");
    if (!project.phases.length) return emptyState("No phases yet");

    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Phase</th><th>Start</th><th>End</th><th>Progress</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            ${project.phases.map((phase) => `
              <tr>
                <td><strong>${escapeHtml(phase.name)}</strong></td>
                <td>${escapeHtml(phase.start || "")}</td>
                <td>${escapeHtml(phase.end || "")}</td>
                <td>${percent(phase.progress)}<div class="track"><span class="fill" style="width:${percent(phase.progress)}"></span></div></td>
                <td>${pill(phase.status)}</td>
                <td>${escapeHtml(phase.notes || "")}</td>
                <td>
                  <button class="linkish" data-action="phase:edit" data-id="${phase.id}" type="button">Edit</button>
                  <button class="linkish danger" data-action="phase:delete" data-id="${phase.id}" type="button">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTasksPage() {
    const project = activeProject();
    safeHtml("#appMain", `
      ${pageHeading("Tasks / WBS", "Add tasks under phases and track them in Kanban.", `<button class="secondary-button" data-action="task:new" type="button">Add Task</button>`)}
      ${project ? renderKanban(project) : emptyState("Create or select a project first")}
    `);
  }

  function renderKanban(project) {
    return `
      <section class="kanban">
        ${TASK_STATUSES.map((status) => {
          const tasks = project.tasks.filter((task) => task.status === status);
          return `
            <div class="kanban-col">
              <h3>${escapeHtml(status)}<span>${tasks.length}</span></h3>
              ${tasks.length ? tasks.map(renderTaskCard).join("") : `<p class="mini-copy">No tasks</p>`}
            </div>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderTaskCard(task) {
    return `
      <div class="task-card">
        <strong>${escapeHtml(task.name)}</strong>
        <p>${escapeHtml(task.phase || "No phase")} - ${escapeHtml(task.assigned || "Unassigned")}</p>
        ${pill(task.priority || "Normal")} ${pill(task.status)}
        <div class="track"><span class="fill" style="width:${percent(task.progress)}"></span></div>
        <p>Due ${escapeHtml(task.due || "-")}</p>
        <button class="linkish" data-action="task:edit" data-id="${task.id}" type="button">Edit</button>
        <button class="linkish danger" data-action="task:delete" data-id="${task.id}" type="button">Delete</button>
      </div>
    `;
  }

  function renderSchedulePage() {
    const project = activeProject();
    safeHtml("#appMain", `
      ${pageHeading("Schedule", "Simple static Gantt view. Bars are calculated from task start and due dates.", `<button class="secondary-button" data-action="task:new" type="button">Add Task</button>`)}
      <section class="panel panel-full">
        <div class="panel-head"><div><h3>${escapeHtml(project ? project.name : "No project")} Schedule</h3><p>Milestones and planned vs actual placeholder</p></div><span class="panel-meta">No chart library</span></div>
        ${project ? renderGantt(project.tasks) : emptyState("Create or select a project first")}
        <p class="form-note">Planned vs actual placeholder: future iteration can store baseline dates and compare variance per task.</p>
      </section>
    `);
  }

  function renderGantt(tasks) {
    if (!tasks.length) return emptyState("No tasks in schedule");

    const dates = tasks.flatMap((task) => [task.start, task.due]).filter(Boolean).map((date) => new Date(date));
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const spanDays = Math.max(1, (max - min) / 86400000);

    return `
      <div class="gantt">
        ${tasks.map((task) => {
          const start = task.start ? new Date(task.start) : min;
          const end = task.due ? new Date(task.due) : start;
          const left = Math.max(0, ((start - min) / 86400000 / spanDays) * 100);
          const width = Math.max(2, ((end - start) / 86400000 / spanDays) * 100);
          const className = task.status === "Blocked" ? "blocked" : task.status === "Done" ? "done" : "";
          return `
            <div class="gantt-row">
              <div class="gantt-label"><strong>${escapeHtml(task.name)}</strong><br><small>${escapeHtml(task.phase || "")} - ${escapeHtml(task.assigned || "")}</small></div>
              <div class="gantt-track">
                <span class="gantt-bar ${className}" style="left:${left}%;width:${width}%">${percent(task.progress)}</span>
                ${width <= 3 ? `<span class="milestone" style="left:${left}%"></span>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderReportsPage() {
    renderRegisterPage("reports", "Daily Reports", "Create daily site reports for the selected project.", reportColumns(), "report:new");
  }

  function renderFilesPage() {
    renderRegisterPage("files", "Files & Drawings", "Track drawing metadata without uploading files yet.", fileColumns(), "file:new");
  }

  function renderCostsPage() {
    renderRegisterPage("costs", "Costs", "Track package budgets, actuals, forecasts, and variance.", costColumns(), "cost:new");
  }

  function renderRisksPage() {
    const labels = { rfis: "RFI Register", submittals: "Submittals Register", risks: "Risk Register" };
    const project = activeProject();

    safeHtml("#appMain", `
      ${pageHeading("RFIs / Submittals / Risks", "Manage simple project registers with add, edit, and delete.", `<button class="secondary-button" data-action="register:new" type="button">Add Record</button>`)}
      <div class="tabs">
        ${Object.keys(labels).map((key) => `<button class="tab-button ${activeRegister === key ? "active" : ""}" data-register-tab="${key}" type="button">${labels[key]}</button>`).join("")}
      </div>
      <section class="panel panel-full">
        <div class="panel-head"><div><h3>${labels[activeRegister]}</h3><p>${project ? escapeHtml(project.name) : "No project selected"}</p></div><button class="primary-button" data-action="register:new" type="button">Add Record</button></div>
        ${project ? renderGenericTable(project[activeRegister], registerColumns(activeRegister), activeRegister) : emptyState("Create or select a project first")}
      </section>
    `);
  }

  function renderRegisterPage(type, title, subtitle, columns, action) {
    const project = activeProject();
    safeHtml("#appMain", `
      ${pageHeading(title, subtitle, `<button class="secondary-button" data-action="${action}" type="button">Add</button>`)}
      <section class="panel panel-full">
        <div class="panel-head"><div><h3>${escapeHtml(title)} Register</h3><p>${project ? escapeHtml(project.name) : "No project selected"}</p></div><button class="primary-button" data-action="${action}" type="button">Add</button></div>
        ${project ? renderGenericTable(project[type], columns, type) : emptyState("Create or select a project first")}
      </section>
    `);
  }

  function renderGenericTable(rows, columns, type) {
    if (!rows || !rows.length) return emptyState("No records yet");

    return `
      <div class="table-wrap">
        <table>
          <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}<th>Actions</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                ${columns.map((column) => `<td>${escapeHtml(valueForColumn(row, column.key))}</td>`).join("")}
                <td>
                  <button class="linkish" data-action="record:edit" data-type="${type}" data-id="${row.id}" type="button">Edit</button>
                  <button class="linkish danger" data-action="record:delete" data-type="${type}" data-id="${row.id}" type="button">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function valueForColumn(row, key) {
    if (key === "variance") return money(Number(row.forecast || 0) - Number(row.budget || 0));
    if (["budget", "actual", "forecast"].includes(key)) return money(row[key]);
    return row[key] || "";
  }

  function renderAnalyticsPage() {
    const data = metrics();
    safeHtml("#appMain", `
      ${pageHeading("Analytics Hub", "KPIs are calculated dynamically from saved localStorage data.")}
      ${renderKpis(data)}
      <section class="summary-grid">
        <div class="panel"><h3>Workload</h3>${renderStatusBars()}</div>
        <div class="panel"><h3>Cost Health</h3>${renderCostCards(activeProject())}</div>
        <div class="panel"><h3>Register Health</h3><p>Open RFIs: ${data.openRfis}</p><p>Pending submittals: ${data.pendingSubmittals}</p><p>Open risks: ${data.openRisks}</p></div>
      </section>
    `);
  }

  function renderResourcesPage() {
    safeHtml("#appMain", `${pageHeading("Resources", "Resource planning placeholder for the MVP.")}${emptyState("Resource module is ready for manpower and equipment planning.")}`);
  }

  function renderSettingsPage() {
    safeHtml("#appMain", `
      ${pageHeading("Settings", "Local browser settings and data controls.")}
      <section class="panel">
        <h3>Local Data</h3>
        <p class="form-note">This MVP stores all records in localStorage on this browser using key: ${STORAGE_KEY}.</p>
        <button class="danger-button" data-action="data:reset" type="button">Reset demo data</button>
      </section>
    `);
  }

  function renderRecentReports(project) {
    const rows = project ? project.reports.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5) : [];
    if (!rows.length) return emptyState("No reports yet");

    return `
      <div class="activity-list">
        ${rows.map((report) => `
          <div class="activity-item">
            <span class="activity-icon">R</span>
            <div><strong>${escapeHtml(report.date || "No date")}</strong><p>${escapeHtml(report.completed || "")}</p><small>${escapeHtml(report.issues || "")}</small></div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderStatusBars() {
    const tasks = allTasks();
    const total = tasks.length || 1;

    return `
      <div class="status-chart">
        ${TASK_STATUSES.map((status) => {
          const count = tasks.filter((task) => task.status === status).length;
          return `
            <div class="status-item">
              <strong>${escapeHtml(status)}</strong><span>${count}</span>
              <div class="track"><span class="fill" style="width:${(count / total) * 100}%"></span></div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderCostCards(project) {
    const rows = project ? project.costs : [];
    if (!rows.length) return emptyState("No costs yet");

    return `
      <div class="cost-chart">
        ${rows.slice(0, 4).map((item) => {
          const width = Math.min(100, (Number(item.actual || 0) / Math.max(1, Number(item.budget || 0))) * 100);
          return `
            <div class="cost-card">
              <div><span>${escapeHtml(item.package || "Package")}</span><strong>SAR ${money(item.actual)}</strong></div>
              <div class="track"><span class="fill" style="width:${width}%"></span></div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function emptyState(title) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>Create data with the action buttons above. Everything is saved in this browser.</span></div>`;
  }

  function pill(value) {
    const label = String(value || "Open");
    const good = ["Done", "Completed", "Approved", "Closed", "Low"].includes(label);
    const risk = ["Blocked", "High", "Critical", "At Risk", "Open"].includes(label);
    const className = good ? "good" : risk ? "risk" : "watch";
    return `<span class="pill ${className}">${escapeHtml(label)}</span>`;
  }

  function svgIcon(path) {
    return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"></path></svg>`;
  }

  function bindGlobalEvents() {
    document.addEventListener("click", handleDocumentClick);

    const selector = qs("#projectSelector");
    if (selector) {
      selector.addEventListener("change", (event) => {
        state.activeProjectId = event.target.value;
        saveState();
        renderApp();
      });
    }

    const modalForm = qs("#modalForm");
    if (modalForm) {
      modalForm.addEventListener("submit", handleModalSubmit);
    }
  }

  function handleDocumentClick(event) {
    const navButton = event.target.closest("[data-page]");
    if (navButton) {
      currentPage = navButton.dataset.page;
      renderApp();
      return;
    }

    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      currentPage = routeButton.dataset.route;
      renderApp();
      return;
    }

    const registerTab = event.target.closest("[data-register-tab]");
    if (registerTab) {
      activeRegister = registerTab.dataset.registerTab;
      renderApp();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton);
    }
  }

  function handleAction(button) {
    const action = button.dataset.action;
    const id = button.dataset.id;
    const type = button.dataset.type;

    if (action === "project:new") return openProjectModal();
    if (action === "project:edit") return openProjectModal(id);
    if (action === "project:select") return selectProject(id);
    if (action === "project:delete") return deleteProject(id);

    if (action === "phase:new") return openPhaseModal();
    if (action === "phase:edit") return openPhaseModal(id);
    if (action === "phase:delete") return deleteChildRecord("phases", id);

    if (action === "task:new") return openTaskModal();
    if (action === "task:edit") return openTaskModal(id);
    if (action === "task:delete") return deleteChildRecord("tasks", id);

    if (action === "report:new") return openRecordModal("reports");
    if (action === "file:new") return openRecordModal("files");
    if (action === "cost:new") return openRecordModal("costs");
    if (action === "register:new") return openRecordModal(activeRegister);
    if (action === "record:edit") return openRecordModal(type, id);
    if (action === "record:delete") return deleteChildRecord(type, id);

    if (action === "modal:close" || action === "closeModal") return closeModal();
    if (action === "data:reset") return resetData();
  }

  function selectProject(id) {
    if (!getProject(id)) return;
    state.activeProjectId = id;
    saveState();
    showToast("Active project selected");
    renderApp();
  }

  function activeProjectOrToast() {
    const project = activeProject();
    if (!project) {
      showToast("Create a project first");
      return null;
    }
    return project;
  }

  function openProjectModal(id) {
    const existing = id ? getProject(id) : null;
    openModal({
      title: existing ? "Edit Project" : "New Project",
      mode: "project",
      id,
      fields: [
        field("name", "Project name", "text", { required: true }),
        field("client", "Client / owner"),
        field("location", "Location"),
        field("type", "Project type"),
        field("start", "Start date", "date"),
        field("end", "End date", "date"),
        field("budget", "Budget", "number"),
        field("manager", "Project manager"),
        field("status", "Status", "select", { options: PROJECT_STATUSES }),
        field("description", "Description", "textarea", { full: true })
      ],
      values: existing || { status: "Planning" }
    });
  }

  function openPhaseModal(id) {
    const project = activeProjectOrToast();
    if (!project) return;
    const existing = id ? project.phases.find((item) => item.id === id) : null;
    openModal({
      title: existing ? "Edit Phase" : "Add Phase",
      mode: "phase",
      id,
      fields: [
        field("name", "Phase", "select", { options: PHASE_NAMES }),
        field("start", "Start date", "date"),
        field("end", "End date", "date"),
        field("progress", "Progress %", "number"),
        field("status", "Status", "select", { options: TASK_STATUSES }),
        field("notes", "Notes", "textarea", { full: true })
      ],
      values: existing || { name: "Initiation", progress: 0, status: "Not Started" }
    });
  }

  function openTaskModal(id) {
    const project = activeProjectOrToast();
    if (!project) return;
    const existing = id ? project.tasks.find((item) => item.id === id) : null;
    const phaseOptions = project.phases.map((phase) => phase.name);
    if (!phaseOptions.length) phaseOptions.push("Initiation");

    openModal({
      title: existing ? "Edit Task" : "Add Task",
      mode: "task",
      id,
      fields: [
        field("name", "Task name", "text", { required: true }),
        field("phase", "Phase", "select", { options: [...phaseOptions, "Custom phase"] }),
        field("assigned", "Assigned to"),
        field("start", "Start date", "date"),
        field("due", "Due date", "date"),
        field("progress", "Progress %", "number"),
        field("priority", "Priority", "select", { options: ["Low", "Normal", "High", "Critical"] }),
        field("status", "Status", "select", { options: TASK_STATUSES }),
        field("notes", "Notes", "textarea", { full: true })
      ],
      values: existing || { phase: phaseOptions[0], priority: "Normal", progress: 0, status: "Not Started" }
    });
  }

  function openRecordModal(type, id) {
    const project = activeProjectOrToast();
    if (!project) return;
    const existing = id ? (project[type] || []).find((item) => item.id === id) : null;
    const config = recordConfig(type);
    if (!config) return;

    openModal({
      title: `${existing ? "Edit" : "Add"} ${config.title}`,
      mode: "record",
      type,
      id,
      fields: config.fields,
      values: existing || config.defaults || {}
    });
  }

  function openModal(config) {
    const backdrop = qs("#modalBackdrop");
    const title = qs("#modalTitle");
    const form = qs("#modalForm");
    if (!backdrop || !title || !form) {
      console.error("Modal elements are missing from the page.");
      return;
    }

    activeModal = config;
    title.textContent = config.title;
    form.innerHTML = `
      ${config.fields.map((item) => renderField(item, config.values || {})).join("")}
      <div class="form-actions">
        <button class="secondary-button" type="button" data-action="modal:close">Cancel</button>
        <button class="primary-button" type="submit">Save</button>
      </div>
    `;
    backdrop.hidden = false;
  }

  function closeModal() {
    const backdrop = qs("#modalBackdrop");
    if (backdrop) backdrop.hidden = true;
    activeModal = null;
  }

  function handleModalSubmit(event) {
    event.preventDefault();
    if (!activeModal) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (activeModal.mode === "project") saveProjectFromModal(data);
    if (activeModal.mode === "phase") savePhaseFromModal(data);
    if (activeModal.mode === "task") saveTaskFromModal(data);
    if (activeModal.mode === "record") saveRecordFromModal(data);

    saveState();
    closeModal();
    showToast("Saved successfully");
    renderApp();
  }

  function saveProjectFromModal(data) {
    data.budget = Number(data.budget || 0);
    if (activeModal.id) {
      const project = getProject(activeModal.id);
      if (project) Object.assign(project, data);
      return;
    }

    const project = {
      id: uid(),
      ...data,
      phases: PHASE_NAMES.filter((name) => name !== "Custom phase").map((name) => ({
        id: uid(),
        name,
        start: data.start || "",
        end: data.end || "",
        progress: 0,
        status: "Not Started",
        notes: ""
      })),
      tasks: [],
      reports: [],
      files: [],
      costs: [],
      rfis: [],
      submittals: [],
      risks: []
    };

    state.projects.push(project);
    state.activeProjectId = project.id;
  }

  function savePhaseFromModal(data) {
    const project = activeProject();
    if (!project) return;
    data.progress = Number(data.progress || 0);

    if (activeModal.id) {
      const phase = project.phases.find((item) => item.id === activeModal.id);
      if (phase) Object.assign(phase, data);
      return;
    }

    project.phases.push({ id: uid(), ...data });
  }

  function saveTaskFromModal(data) {
    const project = activeProject();
    if (!project) return;
    data.progress = Number(data.progress || 0);

    if (activeModal.id) {
      const task = project.tasks.find((item) => item.id === activeModal.id);
      if (task) Object.assign(task, data);
      return;
    }

    project.tasks.push({ id: uid(), ...data });
  }

  function saveRecordFromModal(data) {
    const project = activeProject();
    if (!project || !activeModal.type) return;
    const type = activeModal.type;

    ["budget", "actual", "forecast"].forEach((key) => {
      if (key in data) data[key] = Number(data[key] || 0);
    });

    if (activeModal.id) {
      const record = project[type].find((item) => item.id === activeModal.id);
      if (record) Object.assign(record, data);
      return;
    }

    project[type].push({ id: uid(), ...data });
  }

  function deleteProject(id) {
    state.projects = state.projects.filter((project) => project.id !== id);
    if (state.activeProjectId === id) {
      state.activeProjectId = state.projects[0] ? state.projects[0].id : "";
    }
    saveState();
    showToast("Project deleted");
    renderApp();
  }

  function deleteChildRecord(type, id) {
    const project = activeProject();
    if (!project || !Array.isArray(project[type])) return;
    project[type] = project[type].filter((item) => item.id !== id);
    saveState();
    showToast("Deleted");
    renderApp();
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    state = createSeedState();
    saveState();
    showToast("Demo data reset");
    renderApp();
  }

  function field(name, label, type = "text", options = {}) {
    return { name, label, type, ...options };
  }

  function renderField(item, values) {
    const value = values[item.name] ?? "";
    const required = item.required ? "required" : "";
    const full = item.full ? " full" : "";
    let control = "";

    if (item.type === "textarea") {
      control = `<textarea name="${item.name}" ${required}>${escapeHtml(value)}</textarea>`;
    } else if (item.type === "select") {
      control = `<select name="${item.name}" ${required}>${(item.options || []).map((option) => `<option value="${escapeHtml(option)}" ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
    } else {
      control = `<input name="${item.name}" type="${item.type || "text"}" value="${escapeHtml(value)}" ${required}>`;
    }

    return `<div class="form-field${full}"><label>${escapeHtml(item.label)}</label>${control}</div>`;
  }

  function recordConfig(type) {
    const configs = {
      reports: {
        title: "Daily Report",
        defaults: { date: todayIso() },
        fields: [
          field("date", "Date", "date"),
          field("weather", "Weather"),
          field("manpower", "Manpower"),
          field("equipment", "Equipment"),
          field("completed", "Work completed", "textarea", { full: true }),
          field("issues", "Issues / delays", "textarea", { full: true }),
          field("photos", "Photos placeholder")
        ]
      },
      files: {
        title: "Drawing",
        fields: [
          field("name", "Drawing name", "text", { required: true }),
          field("discipline", "Discipline"),
          field("revision", "Revision"),
          field("status", "Status", "select", { options: ["Draft", "Submitted", "Approved", "Rejected", "Superseded"] }),
          field("submitted", "Submitted date", "date"),
          field("approved", "Approved date", "date"),
          field("notes", "Notes", "textarea", { full: true })
        ]
      },
      costs: {
        title: "Cost Item",
        fields: [
          field("package", "Package", "text", { required: true }),
          field("budget", "Budget", "number"),
          field("actual", "Actual cost", "number"),
          field("forecast", "Forecast cost", "number"),
          field("notes", "Notes", "textarea", { full: true })
        ]
      },
      rfis: {
        title: "RFI",
        defaults: { status: "Open" },
        fields: [
          field("title", "RFI title", "text", { required: true }),
          field("status", "Status", "select", { options: ["Open", "Answered", "Closed"] }),
          field("owner", "Owner"),
          field("due", "Due date", "date"),
          field("notes", "Notes", "textarea", { full: true })
        ]
      },
      submittals: {
        title: "Submittal",
        defaults: { status: "Pending" },
        fields: [
          field("title", "Submittal title", "text", { required: true }),
          field("status", "Status", "select", { options: ["Pending", "Approved", "Rejected", "Closed"] }),
          field("owner", "Owner"),
          field("due", "Due date", "date"),
          field("notes", "Notes", "textarea", { full: true })
        ]
      },
      risks: {
        title: "Risk",
        defaults: { status: "Open", impact: "Medium" },
        fields: [
          field("title", "Risk title", "text", { required: true }),
          field("status", "Status", "select", { options: ["Open", "Mitigating", "Closed"] }),
          field("impact", "Impact", "select", { options: ["Low", "Medium", "High", "Critical"] }),
          field("owner", "Owner"),
          field("due", "Due date", "date"),
          field("notes", "Notes", "textarea", { full: true })
        ]
      }
    };

    return configs[type] || null;
  }

  function reportColumns() {
    return [
      { key: "date", label: "Date" },
      { key: "weather", label: "Weather" },
      { key: "manpower", label: "Manpower" },
      { key: "equipment", label: "Equipment" },
      { key: "completed", label: "Work completed" },
      { key: "issues", label: "Issues / delays" }
    ];
  }

  function fileColumns() {
    return [
      { key: "name", label: "Drawing name" },
      { key: "discipline", label: "Discipline" },
      { key: "revision", label: "Revision" },
      { key: "status", label: "Status" },
      { key: "submitted", label: "Submitted" },
      { key: "approved", label: "Approved" },
      { key: "notes", label: "Notes" }
    ];
  }

  function costColumns() {
    return [
      { key: "package", label: "Package" },
      { key: "budget", label: "Budget" },
      { key: "actual", label: "Actual" },
      { key: "forecast", label: "Forecast" },
      { key: "variance", label: "Variance" },
      { key: "notes", label: "Notes" }
    ];
  }

  function registerColumns(type) {
    if (type === "risks") {
      return [
        { key: "title", label: "Risk" },
        { key: "status", label: "Status" },
        { key: "impact", label: "Impact" },
        { key: "owner", label: "Owner" },
        { key: "due", label: "Due" },
        { key: "notes", label: "Notes" }
      ];
    }

    return [
      { key: "title", label: type === "rfis" ? "RFI" : "Submittal" },
      { key: "status", label: "Status" },
      { key: "owner", label: "Owner" },
      { key: "due", label: "Due" },
      { key: "notes", label: "Notes" }
    ];
  }

  function showToast(message) {
    const stack = qs("#toastStack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    stack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
