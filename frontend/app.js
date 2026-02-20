(function () {
  "use strict";

  const API_BASE = (typeof window !== "undefined" && window.API_BASE_OVERRIDE)
    || (typeof window !== "undefined" && (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:")
      ? "http://127.0.0.1:8000"
      : "https://wordnation.onrender.com");
  const MEANING_URL = `${API_BASE}/v1/vocab/meaning`;
  const DAILY_URL = `${API_BASE}/v1/vocab/daily`;
  const HEALTH_URL = `${API_BASE}/health`;

  // ============ DOM Elements ============
  const elements = {
    // Pages
    homePage: document.getElementById("homePage"),
    chatsPage: document.getElementById("chatsPage"),
    
    // Sidebar
    navHome: document.getElementById("navHome"),
    navChats: document.getElementById("navChats"),
    btnThemeToggle: document.getElementById("btnThemeToggle"),
    btnNewChat: document.getElementById("btnNewChat"),
    chatList: document.getElementById("chatList"),
    apiStatus: document.getElementById("apiStatus"),
    
    // Home page
    wordForm: document.getElementById("wordForm"),
    wordInput: document.getElementById("wordInput"),
    wordResult: document.getElementById("wordResult"),
    dailyVocabContainer: document.getElementById("dailyVocabContainer"),
    
    // Chat page
    messages: document.getElementById("messages"),
    welcome: document.getElementById("welcome"),
    inputForm: document.getElementById("inputForm"),
    messageInput: document.getElementById("messageInput"),
    btnSend: document.getElementById("btnSend"),
  };

  // ============ State ============
  let chats = [];
  let currentChatId = null;

  // ============ Theme Management ============
  function initTheme() {
    const savedTheme = localStorage.getItem("vocab-tutor-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === null ? prefersDark : savedTheme === "dark";
    
    setTheme(isDark ? "dark" : "light");
  }

  function setTheme(theme) {
    const isDark = theme === "dark";
    const html = document.documentElement;
    
    if (isDark) {
      html.classList.remove("light-mode");
    } else {
      html.classList.add("light-mode");
    }
    
    localStorage.setItem("vocab-tutor-theme", theme);
    updateThemeIcons(isDark);
  }

  function updateThemeIcons(isDark) {
    const sunIcon = elements.btnThemeToggle.querySelector(".icon-sun");
    const moonIcon = elements.btnThemeToggle.querySelector(".icon-moon");
    
    if (isDark) {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    } else {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    }
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = !html.classList.contains("light-mode");
    setTheme(isDark ? "light" : "dark");
  }

  // ============ Page Navigation ============
  function switchPage(pageName) {
    elements.homePage.style.display = pageName === "home" ? "flex" : "none";
    elements.chatsPage.style.display = pageName === "chats" ? "flex" : "none";
    
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.page === pageName);
    });
    
    if (pageName === "chats" && chats.length === 0) {
      newChat();
    }
  }

  // ============ UUID Generation ============
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ============ LocalStorage ============
  function loadChats() {
    try {
      const raw = localStorage.getItem("vocab-tutor-chats");
      if (raw) chats = JSON.parse(raw);
      else chats = [];
    } catch (_) {
      chats = [];
    }
  }

  function saveChats() {
    localStorage.setItem("vocab-tutor-chats", JSON.stringify(chats));
  }

  // ============ API Health Check ============
  function checkApi() {
    fetch(HEALTH_URL, { method: "GET" })
      .then((r) => {
        elements.apiStatus.textContent = "API: connected";
        elements.apiStatus.classList.add("ok");
        elements.apiStatus.classList.remove("err");
      })
      .catch(() => {
        elements.apiStatus.textContent = "API: disconnected";
        elements.apiStatus.classList.add("err");
        elements.apiStatus.classList.remove("ok");
      });
  }

  // ============ Chat Management ============
  function renderChatList() {
    elements.chatList.innerHTML = "";
    chats.forEach((chat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-item" + (chat.id === currentChatId ? " active" : "");
      btn.textContent = chat.title || "New chat";
      btn.dataset.id = chat.id;
      btn.addEventListener("click", () => switchChat(chat.id));
      elements.chatList.appendChild(btn);
    });
  }

  function getCurrentChat() {
    if (!currentChatId) return null;
    return chats.find((c) => c.id === currentChatId) || null;
  }

  function switchChat(id) {
    currentChatId = id;
    renderChatList();
    const chat = getCurrentChat();
    if (!chat) return;
    elements.welcome.style.display = "none";
    elements.messages.innerHTML = "";
    chat.messages.forEach((msg) => appendMessageEl(msg, false));
  }

  function newChat() {
    const id = uuid();
    const chat = { id, title: "New chat", messages: [] };
    chats.unshift(chat);
    if (chats.length > 50) chats.pop();
    saveChats();
    currentChatId = id;
    renderChatList();
    elements.welcome.style.display = "block";
    elements.messages.innerHTML = "";
    elements.messages.appendChild(elements.welcome);
  }

  function ensureChat() {
    if (!currentChatId) {
      newChat();
    }
    return getCurrentChat();
  }

  function updateChatTitle(word) {
    const chat = getCurrentChat();
    if (!chat || (chat.title && chat.title !== "New chat")) return;
    chat.title = word.length > 28 ? word.slice(0, 25) + "…" : word;
    saveChats();
    renderChatList();
  }

  // ============ Message Rendering ============
  function hideWelcome() {
    if (elements.welcome.parentNode) elements.welcome.remove();
  }

  function appendMessageEl(msg, scroll = true) {
    hideWelcome();
    const wrap = document.createElement("div");
    wrap.className = "message " + (msg.role === "user" ? "user" : "bot");
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = msg.role === "user" ? "U" : "V";
    const body = document.createElement("div");
    body.className = "message-body";
    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = msg.role === "user" ? "You" : "Vocab Tutor";
    const content = document.createElement("div");
    content.className = "message-content";
    if (msg.role === "user") {
      content.textContent = msg.text;
    } else if (msg.error) {
      content.innerHTML = '<div class="error-bubble">' + escapeHtml(msg.text) + "</div>";
    } else {
      content.innerHTML = formatBotMessage(msg.data);
    }
    body.appendChild(label);
    body.appendChild(content);
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    elements.messages.appendChild(wrap);
    if (scroll) elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function formatBotMessage(data) {
    if (!data) return "";
    const { word, meaning_text, memory_trick, examples = [], synonyms = [], antonyms = [] } = data;
    let html = '<div class="word-title">' + escapeHtml(word || "") + "</div>";
    if (meaning_text) html += "<p>" + escapeHtml(meaning_text) + "</p>";
    if (memory_trick) {
      html += '<div class="section"><div class="section-title">Memory trick</div>';
      html += '<p class="memory-trick">' + escapeHtml(memory_trick) + "</p></div>";
    }
    if (examples.length) {
      html += '<div class="section"><div class="section-title">Examples</div><ul>';
      examples.forEach((ex) => {
        html += "<li>" + escapeHtml(ex) + "</li>";
      });
      html += "</ul></div>";
    }
    if (synonyms.length) {
      html += '<div class="section"><div class="section-title">Synonyms</div><ul>';
      synonyms.forEach((s) => {
        html += "<li>" + escapeHtml(s) + "</li>";
      });
      html += "</ul></div>";
    }
    if (antonyms.length) {
      html += '<div class="section"><div class="section-title">Antonyms</div><ul>';
      antonyms.forEach((a) => {
        html += "<li>" + escapeHtml(a) + "</li>";
      });
      html += "</ul></div>";
    }
    return html;
  }

  function addTypingIndicator() {
    const wrap = document.createElement("div");
    wrap.className = "message bot";
    wrap.id = "typing-indicator";
    wrap.innerHTML =
      '<div class="message-avatar">V</div><div class="message-body"><div class="message-label">Vocab Tutor</div><div class="message-content"><div class="typing"><span></span><span></span><span></span></div></div></div>';
    elements.messages.appendChild(wrap);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function setLoading(loading) {
    elements.btnSend.disabled = loading;
  }

  // ============ Word Lookup ============
  async function sendWord(word) {
    word = word.trim();
    if (!word) return;
    const chat = ensureChat();
    if (!chat) return;

    const userMsg = { role: "user", text: word };
    chat.messages.push(userMsg);
    appendMessageEl(userMsg);
    updateChatTitle(word);

    setLoading(true);
    addTypingIndicator();

    try {
      const res = await fetch(MEANING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json().catch(() => ({}));
      removeTypingIndicator();
      if (!res.ok) {
        const botMsg = { role: "bot", error: true, text: data.detail || "Request failed." };
        chat.messages.push(botMsg);
        appendMessageEl(botMsg);
      } else {
        const botMsg = { role: "bot", data };
        chat.messages.push(botMsg);
        appendMessageEl(botMsg);
      }
    } catch (err) {
      removeTypingIndicator();
      const botMsg = { role: "bot", error: true, text: "Could not reach API. Is the server running?" };
      chat.messages.push(botMsg);
      appendMessageEl(botMsg);
    } finally {
      setLoading(false);
      saveChats();
    }
  }

  // ============ Home Page - Word Lookup ============
  async function searchWord() {
    const word = elements.wordInput.value.trim();
    if (!word) return;

    elements.wordResult.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="loading-spinner"></div><p>Loading...</p></div>';
    elements.wordResult.style.display = "block";

    try {
      const res = await fetch(MEANING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        elements.wordResult.innerHTML = '<div class="error-bubble">' + escapeHtml(data.detail || "Request failed.") + "</div>";
      } else {
        elements.wordResult.innerHTML = formatBotMessage(data);
      }
    } catch (err) {
      elements.wordResult.innerHTML = '<div class="error-bubble">Could not reach API. Is the server running?</div>';
    }
  }

  // ============ Daily Vocab ============
  async function loadDailyVocab() {
    try {
      const res = await fetch(DAILY_URL, { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.words) {
        elements.dailyVocabContainer.innerHTML = '<p class="error-bubble">Failed to load daily vocab.</p>';
        return;
      }

      elements.dailyVocabContainer.innerHTML = "";
      data.words.forEach((word) => {
        const card = document.createElement("div");
        card.className = "vocab-card";
        card.innerHTML = `
          <div class="vocab-word">${escapeHtml(word.word)}</div>
          <div class="vocab-meaning">${escapeHtml(word.meaning_text || "")}</div>
        `;
        card.addEventListener("click", () => {
          elements.wordInput.value = word.word;
          searchWord();
        });
        elements.dailyVocabContainer.appendChild(card);
      });
    } catch (err) {
      elements.dailyVocabContainer.innerHTML = '<p class="error-bubble">Could not reach API.</p>';
    }
  }

  // ============ Event Listeners ============
  elements.btnThemeToggle.addEventListener("click", toggleTheme);

  elements.navHome.addEventListener("click", () => switchPage("home"));
  elements.navChats.addEventListener("click", () => switchPage("chats"));

  elements.wordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchWord();
  });

  elements.wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      searchWord();
    }
  });

  elements.inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = elements.messageInput.value.trim();
    if (!value) return;
    sendWord(value);
    elements.messageInput.value = "";
    elements.messageInput.style.height = "auto";
  });

  elements.messageInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 160) + "px";
  });

  elements.messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      elements.inputForm.requestSubmit();
    }
  });

  elements.btnNewChat.addEventListener("click", () => {
    newChat();
    switchPage("chats");
  });

  // ============ Initialization ============
  function init() {
    initTheme();
    loadChats();
    switchPage("home");
    loadDailyVocab();
    checkApi();
    setInterval(checkApi, 15000);
  }

  init();
})();
