const STORAGE_KEYS = {
  users: "cep_exam_users",
  schedules: "cep_exam_schedules",
  currentUser: "cep_exam_current_user",
};

const DEPARTMENTS = ["BTech", "BCA", "MCA"];

const state = {
  currentUser: null,
  users: [],
  schedules: [],
  authTab: "login",
  filterDepartment: "all",
};

const elements = {
  authPanel: document.getElementById("authPanel"),
  dashboard: document.getElementById("dashboard"),
  toast: document.getElementById("toast"),
  logoutBtn: document.getElementById("logoutBtn"),
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  signupRole: document.getElementById("signupRole"),
  signupDepartment: document.getElementById("signupDepartment"),
  signupIdentifier: document.getElementById("signupIdentifier"),
  teacherTools: document.getElementById("teacherTools"),
  adminPanel: document.getElementById("adminPanel"),
  scheduleForm: document.getElementById("scheduleForm"),
  resetScheduleBtn: document.getElementById("resetScheduleBtn"),
  scheduleList: document.getElementById("scheduleList"),
  departmentFilter: document.getElementById("departmentFilter"),
  statsGrid: document.getElementById("statsGrid"),
  userList: document.getElementById("userList"),
  dashboardTitle: document.getElementById("dashboardTitle"),
  dashboardSubtitle: document.getElementById("dashboardSubtitle"),
  userName: document.getElementById("userName"),
  userRoleBadge: document.getElementById("userRoleBadge"),
  userMeta: document.getElementById("userMeta"),
};

function bootstrap() {
  seedData();
  loadState();
  bindEvents();
  updateSignupFields();
  renderApp();
}

function seedData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const users = [
      {
        id: crypto.randomUUID(),
        role: "admin",
        name: "CEP Admin",
        email: "admin@cep.edu",
        department: "Administration",
        identifier: "ADMIN-001",
        password: "admin123",
      },
      {
        id: crypto.randomUUID(),
        role: "teacher",
        name: "Meera Joseph",
        email: "teacher@cep.edu",
        department: "BTech",
        identifier: "FAC-101",
        password: "teacher123",
      },
      {
        id: crypto.randomUUID(),
        role: "student",
        name: "Arun Krishna",
        email: "student@cep.edu",
        department: "BCA",
        identifier: "BCA2026-014",
        password: "student123",
      },
    ];

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  if (!localStorage.getItem(STORAGE_KEYS.schedules)) {
    const schedules = [
      {
        id: crypto.randomUUID(),
        department: "BCA",
        examName: "Database Management Systems",
        subjectCode: "BCA402",
        examDate: "2026-04-02",
        startTime: "09:30",
        hall: "Main Block Hall 2",
        invigilator: "Meera Joseph",
        createdBy: "teacher@cep.edu",
        updatedAt: new Date().toISOString(),
        seats: [
          { registerNo: "BCA2026-014", studentName: "Arun Krishna", seatNo: "A12", row: "Row 2" },
          { registerNo: "BCA2026-015", studentName: "Nila Thomas", seatNo: "A13", row: "Row 2" },
          { registerNo: "BCA2026-016", studentName: "Vishnu Raj", seatNo: "A14", row: "Row 2" },
        ],
      },
      {
        id: crypto.randomUUID(),
        department: "BTech",
        examName: "Data Structures",
        subjectCode: "CS204",
        examDate: "2026-04-04",
        startTime: "13:30",
        hall: "Seminar Hall A",
        invigilator: "Deepa Mathew",
        createdBy: "teacher@cep.edu",
        updatedAt: new Date().toISOString(),
        seats: [
          { registerNo: "BTECH2026-021", studentName: "Akhil S", seatNo: "B08", row: "Row 1" },
          { registerNo: "BTECH2026-022", studentName: "Diya K", seatNo: "B09", row: "Row 1" },
        ],
      },
      {
        id: crypto.randomUUID(),
        department: "MCA",
        examName: "Computer Networks",
        subjectCode: "MCA301",
        examDate: "2026-04-06",
        startTime: "10:00",
        hall: "Block C Hall 4",
        invigilator: "Sreelekha R",
        createdBy: "teacher@cep.edu",
        updatedAt: new Date().toISOString(),
        seats: [
          { registerNo: "MCA2026-001", studentName: "Joel Varghese", seatNo: "C02", row: "Row 1" },
          { registerNo: "MCA2026-002", studentName: "Anjana S", seatNo: "C03", row: "Row 1" },
        ],
      },
    ];

    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  }
}

function loadState() {
  state.users = readStorage(STORAGE_KEYS.users);
  state.schedules = readStorage(STORAGE_KEYS.schedules);
  state.currentUser = readCurrentUser();
}

function bindEvents() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authTab = button.dataset.authTab;
      renderAuthTabs();
    });
  });

  elements.signupRole.addEventListener("change", updateSignupFields);
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.signupForm.addEventListener("submit", handleSignup);
  elements.logoutBtn.addEventListener("click", logout);
  elements.scheduleForm.addEventListener("submit", handleScheduleSave);
  elements.resetScheduleBtn.addEventListener("click", resetScheduleForm);
  elements.departmentFilter.addEventListener("change", (event) => {
    state.filterDepartment = event.target.value;
    renderSchedules();
  });
}

function updateSignupFields() {
  const role = elements.signupRole.value;
  const departmentIsAdmin = role === "admin";

  elements.signupDepartment.disabled = departmentIsAdmin;
  elements.signupDepartment.required = !departmentIsAdmin;
  elements.signupDepartment.closest("label").style.opacity = departmentIsAdmin ? "0.55" : "1";

  if (role === "student") {
    elements.signupIdentifier.placeholder = "Example: BCA2026-014";
  } else if (role === "teacher") {
    elements.signupIdentifier.placeholder = "Example: FAC-101";
  } else {
    elements.signupIdentifier.placeholder = "Example: ADMIN-001";
  }
}

function renderAuthTabs() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === state.authTab);
  });

  elements.loginForm.classList.toggle("active", state.authTab === "login");
  elements.signupForm.classList.toggle("active", state.authTab === "signup");
}

function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const role = String(formData.get("role"));
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const user = state.users.find(
    (entry) =>
      entry.role === role &&
      entry.email.toLowerCase() === email &&
      entry.password === password
  );

  if (!user) {
    showToast("Invalid role, email, or password.");
    return;
  }

  state.currentUser = user;
  persistCurrentUser();
  event.target.reset();
  renderApp();
  showToast(`Logged in as ${user.role}.`);
}

function handleSignup(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const role = String(formData.get("role"));
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  const department = role === "admin" ? "Administration" : String(formData.get("department"));
  const identifier = String(formData.get("identifier")).trim();
  const password = String(formData.get("password")).trim();

  if (!name || !email || !identifier || !password) {
    showToast("Please fill in all required fields.");
    return;
  }

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    showToast("An account with this email already exists.");
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    role,
    name,
    email,
    department,
    identifier,
    password,
  };

  state.users.push(user);
  persistUsers();
  event.target.reset();
  state.authTab = "login";
  renderAuthTabs();
  updateSignupFields();
  showToast("Account created successfully. You can log in now.");
}

function logout() {
  state.currentUser = null;
  state.filterDepartment = "all";
  state.authTab = "login";
  localStorage.removeItem(STORAGE_KEYS.currentUser);

  elements.loginForm.reset();
  elements.signupForm.reset();
  elements.scheduleForm.reset();
  elements.scheduleForm.elements.scheduleId.value = "";
  elements.departmentFilter.value = "all";

  renderApp();
  updateSignupFields();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Logged out successfully.");
}

function handleScheduleSave(event) {
  event.preventDefault();

  if (!state.currentUser || state.currentUser.role !== "teacher") {
    showToast("Only teachers can create or edit seating arrangements.");
    return;
  }

  const formData = new FormData(event.target);
  const scheduleId = String(formData.get("scheduleId") || "");
  const seatingText = String(formData.get("seatingText")).trim();
  const seats = parseSeatEntries(seatingText);

  if (!seats.length) {
    showToast("Add at least one valid seat entry.");
    return;
  }

  const schedulePayload = {
    id: scheduleId || crypto.randomUUID(),
    department: String(formData.get("department")),
    examName: String(formData.get("examName")).trim(),
    subjectCode: String(formData.get("subjectCode")).trim(),
    examDate: String(formData.get("examDate")),
    startTime: String(formData.get("startTime")),
    hall: String(formData.get("hall")).trim(),
    invigilator: String(formData.get("invigilator")).trim(),
    createdBy: state.currentUser.email,
    updatedAt: new Date().toISOString(),
    seats,
  };

  const existingIndex = state.schedules.findIndex((schedule) => schedule.id === schedulePayload.id);

  if (existingIndex >= 0) {
    state.schedules[existingIndex] = schedulePayload;
    showToast("Seating arrangement updated.");
  } else {
    state.schedules.unshift(schedulePayload);
    showToast("Seating arrangement published.");
  }

  persistSchedules();
  resetScheduleForm();
  renderStats();
  renderSchedules();
}

function parseSeatEntries(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [registerNo, studentName, seatNo, row] = line.split(",").map((item) => item?.trim());
      if (!registerNo || !studentName || !seatNo || !row) {
        return null;
      }

      return { registerNo, studentName, seatNo, row };
    })
    .filter(Boolean);
}

function resetScheduleForm() {
  elements.scheduleForm.reset();
  elements.scheduleForm.elements.scheduleId.value = "";
}

function renderApp() {
  renderAuthTabs();

  const isLoggedIn = Boolean(state.currentUser);
  elements.authPanel.classList.toggle("hidden", isLoggedIn);
  elements.dashboard.classList.toggle("hidden", !isLoggedIn);
  elements.logoutBtn.classList.toggle("hidden", !isLoggedIn);

  if (!isLoggedIn) {
    elements.adminPanel.classList.add("hidden");
    elements.teacherTools.classList.add("hidden");
    return;
  }

  const { role, name, department, identifier } = state.currentUser;
  elements.teacherTools.classList.toggle("hidden", role !== "teacher");
  elements.adminPanel.classList.toggle("hidden", role !== "admin");
  elements.userRoleBadge.textContent = role.toUpperCase();
  elements.userName.textContent = name;
  elements.userMeta.textContent = role === "student" ? `${department} | ${identifier}` : `${department} | ${state.currentUser.email}`;

  if (role === "teacher") {
    elements.dashboardTitle.textContent = `Welcome, ${name}`;
    elements.dashboardSubtitle.textContent =
      "Create, publish, and edit seating arrangements for BTech, BCA, and MCA exams.";
  } else if (role === "student") {
    elements.dashboardTitle.textContent = `Welcome, ${name}`;
    elements.dashboardSubtitle.textContent =
      "View seating arrangements for your department and see your own allotted seat when it is available.";
  } else {
    elements.dashboardTitle.textContent = `Welcome, ${name}`;
    elements.dashboardSubtitle.textContent =
      "Track registered portal users and published seating schedules across departments.";
  }

  renderStats();
  renderUsers();
  renderSchedules();
}

function renderStats() {
  const cards = buildStatsForRole();

  elements.statsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <p class="eyebrow">${card.label}</p>
          <h4>${card.value}</h4>
          <p>${card.note}</p>
        </article>
      `
    )
    .join("");
}

function buildStatsForRole() {
  const user = state.currentUser;
  if (!user) {
    return [];
  }

  const totalSeats = state.schedules.reduce((sum, schedule) => sum + schedule.seats.length, 0);
  const baseCards = [
    {
      label: "Departments",
      value: DEPARTMENTS.length,
      note: "BTech, BCA, and MCA are supported.",
    },
    {
      label: "Schedules",
      value: state.schedules.length,
      note: "Published exam seating arrangements.",
    },
  ];

  if (user.role === "teacher") {
    return [
      ...baseCards,
      {
        label: "Managed By You",
        value: state.schedules.filter((schedule) => schedule.createdBy === user.email).length,
        note: "Schedules created or last updated using your teacher account.",
      },
      {
        label: "Seat Entries",
        value: totalSeats,
        note: "Total allocated seats across all published exams.",
      },
    ];
  }

  if (user.role === "student") {
    const mySchedules = getVisibleSchedules();
    const ownSeatCount = state.schedules.filter((schedule) => findStudentSeat(schedule, user)).length;

    return [
      ...baseCards,
      {
        label: "Visible Exams",
        value: mySchedules.length,
        note: "Department schedules available for you to view.",
      },
      {
        label: "My Seat Entries",
        value: ownSeatCount,
        note: "Published exams where your register number is already assigned.",
      },
    ];
  }

  return [
    ...baseCards,
    {
      label: "Registered Users",
      value: state.users.length,
      note: "Admin, teacher, and student accounts.",
    },
    {
      label: "Students",
      value: state.users.filter((entry) => entry.role === "student").length,
      note: "Students who can view seating arrangements.",
    },
  ];
}

function renderUsers() {
  if (!state.currentUser || state.currentUser.role !== "admin") {
    elements.userList.innerHTML = "";
    return;
  }

  elements.userList.innerHTML = state.users
    .slice()
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))
    .map(
      (user) => `
        <article class="user-card">
          <div class="user-card-head">
            <div>
              <p class="eyebrow">${user.role}</p>
              <h3>${user.name}</h3>
              <p>${user.email}</p>
            </div>
            <span class="tag">${user.department}</span>
          </div>
          <p><strong>ID:</strong> ${user.identifier}</p>
        </article>
      `
    )
    .join("");
}

function renderSchedules() {
  if (!state.currentUser) {
    elements.scheduleList.innerHTML = "";
    return;
  }

  const schedules = getVisibleSchedules()
    .filter(
      (schedule) =>
        state.filterDepartment === "all" || schedule.department === state.filterDepartment
    )
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  if (!schedules.length) {
    elements.scheduleList.innerHTML = `
      <div class="empty-state">
        <h3>No schedules found</h3>
        <p>No seating arrangements match the current filter or user access.</p>
      </div>
    `;
    return;
  }

  elements.scheduleList.innerHTML = schedules
    .map((schedule) => renderScheduleCard(schedule, state.currentUser))
    .join("");

  if (state.currentUser.role === "teacher") {
    elements.scheduleList.querySelectorAll("[data-edit-schedule]").forEach((button) => {
      button.addEventListener("click", () => populateScheduleForm(button.dataset.editSchedule));
    });

    elements.scheduleList.querySelectorAll("[data-delete-schedule]").forEach((button) => {
      button.addEventListener("click", () => deleteSchedule(button.dataset.deleteSchedule));
    });
  }
}

function getVisibleSchedules() {
  const user = state.currentUser;
  if (!user) {
    return [];
  }

  if (user.role === "student") {
    return state.schedules.filter((schedule) => schedule.department === user.department);
  }

  return [...state.schedules];
}

function findStudentSeat(schedule, user) {
  if (!user || user.role !== "student") {
    return null;
  }

  return schedule.seats.find(
    (seat) => seat.registerNo.toLowerCase() === user.identifier.toLowerCase()
  ) || null;
}

function renderScheduleCard(schedule, user) {
  const studentSeat = findStudentSeat(schedule, user);
  const visibleSeats = user.role === "student" ? (studentSeat ? [studentSeat] : schedule.seats) : schedule.seats;
  const seatMarkup = visibleSeats
    .filter(Boolean)
    .map(
      (seat) => `
        <div class="seat-chip">
          <div>
            <strong>${seat.studentName}</strong>
            <span>${seat.registerNo}</span>
          </div>
          <div>
            <strong>${seat.seatNo}</strong>
            <span>${seat.row}</span>
          </div>
        </div>
      `
    )
    .join("");

  return `
    <article class="schedule-card">
      <header>
        <div>
          <p class="eyebrow">${schedule.department}</p>
          <h3>${schedule.examName}</h3>
          <p>${schedule.subjectCode}</p>
        </div>
        <span class="tag">${schedule.hall}</span>
      </header>

      <div class="schedule-meta">
        <span class="meta-chip">Date: ${formatDate(schedule.examDate)}</span>
        <span class="meta-chip">Time: ${formatTime(schedule.startTime)}</span>
        <span class="meta-chip">Invigilator: ${schedule.invigilator}</span>
        <span class="meta-chip">Seats: ${schedule.seats.length}</span>
      </div>

      <p>
        ${
          user.role === "student"
            ? studentSeat
              ? "Your allotted seat for this exam is shown below."
              : "Your department can view this arrangement. Your personal seat is not assigned yet, so the published seating list is shown below."
            : `Last updated by ${schedule.createdBy}. Only teachers can edit or delete this arrangement.`
        }
      </p>

      <div class="seat-grid">${seatMarkup}</div>

      ${
        user.role === "teacher"
          ? `
            <div class="schedule-actions">
              <button class="secondary-btn" type="button" data-edit-schedule="${schedule.id}">Edit</button>
              <button class="secondary-btn danger-btn" type="button" data-delete-schedule="${schedule.id}">Delete</button>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function populateScheduleForm(scheduleId) {
  if (!state.currentUser || state.currentUser.role !== "teacher") {
    return;
  }

  const schedule = state.schedules.find((entry) => entry.id === scheduleId);
  if (!schedule) {
    return;
  }

  const form = elements.scheduleForm.elements;
  form.scheduleId.value = schedule.id;
  form.department.value = schedule.department;
  form.examName.value = schedule.examName;
  form.subjectCode.value = schedule.subjectCode;
  form.examDate.value = schedule.examDate;
  form.startTime.value = schedule.startTime;
  form.hall.value = schedule.hall;
  form.invigilator.value = schedule.invigilator;
  form.seatingText.value = schedule.seats
    .map((seat) => `${seat.registerNo}, ${seat.studentName}, ${seat.seatNo}, ${seat.row}`)
    .join("\n");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteSchedule(scheduleId) {
  if (!state.currentUser || state.currentUser.role !== "teacher") {
    showToast("Only teachers can delete seating arrangements.");
    return;
  }

  state.schedules = state.schedules.filter((entry) => entry.id !== scheduleId);
  persistSchedules();
  renderStats();
  renderSchedules();
  showToast("Seating arrangement removed.");
}

function persistUsers() {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(state.users));
}

function persistSchedules() {
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(state.schedules));
}

function persistCurrentUser() {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(state.currentUser));
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    console.error(`Could not read storage key ${key}`, error);
    return [];
  }
}

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || "null");
  } catch (error) {
    console.error("Could not read current user", error);
    return null;
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  const [hours, minutes] = value.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes)).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2600);
}

bootstrap();
