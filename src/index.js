import initScrollReveal from "./scripts/scrollReveal";
import initTiltEffect from "./scripts/tiltAnimation";
import { targetElements, defaultProps } from "./data/scrollRevealConfig";

initScrollReveal(targetElements, defaultProps);
initTiltEffect();

const THEME_KEY = "yyh-theme-preference";
const MESSAGE_KEY = "yyh-guestbook-messages";

function getSmartTheme() {
  const hour = new Date().getHours();
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

  if (prefersDark || hour >= 18 || hour < 6) return "dark";
  if (hour >= 6 && hour < 12) return "blue";
  return "green";
}

function applyTheme(theme, shouldSave = false) {
  const safeTheme = ["dark", "blue", "green"].includes(theme) ? theme : "dark";
  document.documentElement.dataset.theme = safeTheme;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute(
      "content",
      safeTheme === "dark" ? "#1a1a2e" : safeTheme === "blue" ? "#f0f8ff" : "#f0faf5"
    );
  }

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeOption === safeTheme);
  });

  if (shouldSave) {
    localStorage.setItem(THEME_KEY, safeTheme);
  }
}

function initThemeSwitcher() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || getSmartTheme(), false);

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeOption, true);
    });
  });
}

function initArticleFilters() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const cards = Array.from(document.querySelectorAll(".article-card[data-category]"));
  const searchInput = document.getElementById("articleSearch");
  const articleGrid = document.getElementById("articleGrid");
  let currentFilter = "all";

  const emptyState = document.createElement("div");
  emptyState.className = "article-empty";
  emptyState.textContent = "没有找到匹配的文章，请换个关键词或分类试试。";

  function refreshArticles() {
    const keyword = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesFilter = currentFilter === "all" || card.dataset.category === currentFilter;
      const matchesKeyword = !keyword || text.includes(keyword);
      const shouldShow = matchesFilter && matchesKeyword;
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    if (articleGrid) {
      if (!visibleCount && !emptyState.isConnected) articleGrid.appendChild(emptyState);
      if (visibleCount && emptyState.isConnected) emptyState.remove();
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      refreshArticles();
    });
  });

  searchInput?.addEventListener("input", refreshArticles);
  refreshArticles();
}

function initArticleDialog() {
  const dialog = document.getElementById("articleDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  if (!dialog || !dialogTitle) return;

  document.querySelectorAll(".read-more").forEach((button) => {
    button.addEventListener("click", () => {
      dialogTitle.textContent = button.dataset.title || "文章详情";
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    });
  });

  dialog.querySelector(".dialog-close")?.addEventListener("click", () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  });
}

function getMessages() {
  try {
    return JSON.parse(localStorage.getItem(MESSAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem(MESSAGE_KEY, JSON.stringify(messages.slice(0, 8)));
}

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  const messages = getMessages();
  const userMessages = messages
    .map(
      (message) => `
        <div class="message-item">
          <strong>${escapeHtml(message.name)}</strong>
          <p>${escapeHtml(message.content)}</p>
          <span>${message.time} · 待管理员审核</span>
        </div>`
    )
    .join("");

  list.innerHTML = `
    <div class="message-item">
      <strong>管理员回复示例</strong>
      <p>欢迎来到我的个人网站，留言审核通过后会公开显示。</p>
      <span>Admin · pinned</span>
    </div>
    ${userMessages}
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initGuestbook() {
  const form = document.getElementById("messageForm");
  if (!form) return;

  renderMessages();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "访客").trim();
    const content = String(data.get("content") || "").trim();
    if (!content) return;

    const messages = getMessages();
    messages.unshift({
      name: name || "访客",
      content,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
    });
    saveMessages(messages);
    form.reset();
    renderMessages();
  });
}

function initAdminPreview() {
  const form = document.getElementById("adminLoginForm");
  const status = document.getElementById("adminLoginStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const username = String(data.get("username") || "admin").trim() || "admin";
    const fakeToken = `JWT-DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    status.innerHTML = `${escapeHtml(username)} 已模拟登录 · Token 已写入 Redis 设计链路：<code>${fakeToken}</code>`;
  });
}


const USER_KEY = "siiiweb-registered-user";
const SESSION_KEY = "siiiweb-auth-session";

function getRegisteredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function isRegisteredUserLoggedIn() {
  const session = getSession();
  return Boolean(session?.email && session?.token);
}

function setDialogOpen(dialog, open = true) {
  if (!dialog) return;
  if (open) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  } else if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function openProtectedResume() {
  const authDialog = document.getElementById("authDialog");
  const resumeDialog = document.getElementById("resumeDialog");
  if (isRegisteredUserLoggedIn()) {
    setDialogOpen(resumeDialog, true);
  } else {
    setDialogOpen(authDialog, true);
  }
}

function updateProtectedResumeLabels() {
  const session = getSession();
  const label = session?.email ? "查看站主简历" : "注册后看简历";
  document.querySelectorAll("[data-protected-resume]").forEach((button) => {
    if (button.classList.contains("nav-resume-link")) {
      button.textContent = label;
    }
  });
}

function initProtectedResume() {
  const authDialog = document.getElementById("authDialog");
  const resumeDialog = document.getElementById("resumeDialog");
  const form = document.getElementById("resumeAuthForm");
  const status = document.getElementById("authStatus");
  const logout = document.getElementById("resumeLogout");

  document.querySelectorAll("[data-protected-resume]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openProtectedResume();
    });
  });

  document.querySelector("[data-auth-close]")?.addEventListener("click", () => setDialogOpen(authDialog, false));
  document.querySelector("[data-resume-close]")?.addEventListener("click", () => setDialogOpen(resumeDialog, false));

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const action = submitter?.dataset.authAction || "register";
    const data = new FormData(form);
    const name = String(data.get("name") || "注册用户").trim() || "注册用户";
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");

    if (!email || password.length < 6) {
      status.textContent = "请输入有效邮箱和至少 6 位密码。";
      return;
    }

    const registered = getRegisteredUser();
    if (action === "login") {
      if (!registered || registered.email !== email || registered.password !== password) {
        status.textContent = "登录失败：请先注册，或检查邮箱 / 密码是否正确。";
        return;
      }
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify({ name, email, password, createdAt: Date.now() }));
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name: action === "login" ? registered?.name || name : name,
        email,
        token: `USER-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        loginAt: Date.now(),
      })
    );

    status.textContent = "验证成功，正在打开站主完整简历。";
    updateProtectedResumeLabels();
    setDialogOpen(authDialog, false);
    setDialogOpen(resumeDialog, true);
  });

  logout?.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    updateProtectedResumeLabels();
    setDialogOpen(resumeDialog, false);
    setDialogOpen(authDialog, true);
  });

  updateProtectedResumeLabels();
}

initThemeSwitcher();
initArticleFilters();
initArticleDialog();
initGuestbook();
initAdminPreview();
initProtectedResume();
