(function () {
  "use strict";

  const API_BASE = "http://127.0.0.1:8000";
  const MEANING_URL = `${API_BASE}/v1/vocab/meaning`;
  const HEALTH_URL = `${API_BASE}/health`;

  const elements = {
    chatList: document.getElementById("chatList"),
    messages: document.getElementById("messages"),
    welcome: document.getElementById("welcome"),
    inputForm: document.getElementById("inputForm"),
    messageInput: document.getElementById("messageInput"),
    btnSend: document.getElementById("btnSend"),
    btnNewChat: document.getElementById("btnNewChat"),
    apiStatus: document.getElementById("apiStatus"),
  };

  let chats = [];
  let currentChatId = null;

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

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
    const { word, meaning_text, memory_trick, examples = [], synonyms = [] } = data;
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

  elements.btnNewChat.addEventListener("click", newChat);

  loadChats();
  if (chats.length === 0) newChat();
  else {
    currentChatId = chats[0].id;
    switchChat(currentChatId);
  }
  renderChatList();
  checkApi();
  setInterval(checkApi, 15000);
})();
