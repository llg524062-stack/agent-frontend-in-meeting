/* In-meeting 需求演示 - 全部数据为 mock，零后端依赖 */
(function () {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  /* ============ 全局状态 ============ */
  const state = {
    view: "meeting",
    askEnabled: false,
    guideClosed: false,
    kbSelected: [],
    webSearch: false,
    notes: [],
    currentShare: null,
    shareScopes: ["音频", "转译文本", "实时翻译", "总结", "笔记"],
    loggedIn: false,
    shareChatOpen: false,
    entMember: "all"
  };

  const VIEW_NAMES = {
    meeting: "会议开始录音",
    home: "首页 · 会议列表",
    share: "分享链接 · Ask",
    enterprise: "企业会议管理",
    about: "需求清单与规则"
  };

  /* ============ Mock 数据 ============ */
  const KB_FILES = [
    { id: "f1", name: "Q3 产品规划.docx", type: "DOC", meta: "更新于 11-20" },
    { id: "f2", name: "会中笔记功能 PRD.md", type: "MD", meta: "更新于 11-18" },
    { id: "f3", name: "用户访谈记录.pdf", type: "PDF", meta: "更新于 11-15" },
    { id: "f4", name: "竞品分析.xlsx", type: "XLS", meta: "更新于 11-12" },
    { id: "f5", name: "分享链路设计稿.pdf", type: "PDF", meta: "更新于 11-10" },
    { id: "f6", name: "Ask 能力技术方案.md", type: "MD", meta: "更新于 11-08" }
  ];

  const MEETINGS = [
    { id: "m1", title: "Q3 产品复盘会 · 会中记录", time: "2026-11-20 14:00", dur: "48 分钟", tags: ["转写", "总结", "笔记"], noteCount: 6 },
    { id: "m2", title: "客户需求沟通 · 制造业专场", time: "2026-11-18 10:30", dur: "35 分钟", tags: ["转写", "笔记"], noteCount: 4 },
    { id: "m3", title: "分享链路方案评审", time: "2026-11-15 16:00", dur: "62 分钟", tags: ["转写", "总结", "实时翻译", "笔记"], noteCount: 9 },
    { id: "m4", title: "周例会 · 产品组", time: "2026-11-12 09:30", dur: "28 分钟", tags: ["转写"], noteCount: 0 }
  ];

  const ENT_MEMBERS = [
    { id: "e1", name: "陈思远", initial: "陈", count: 6 },
    { id: "e2", name: "李欣", initial: "李", count: 4 },
    { id: "e3", name: "王文博", initial: "王", count: 5 },
    { id: "e4", name: "赵敏", initial: "赵", count: 3 }
  ];

  const ENT_MEETINGS = [
    { id: "em1", title: "Q3 产品复盘会", owner: "陈思远", time: "11-20 14:00", transcript: true, note: true, notes: [
      { t: "00:01:12", x: "用户反馈会中记录太碎，希望整块输入、换行自动带时间戳。" },
      { t: "00:03:40", x: "分享链接要加 ask，但必须先登录才能提问。" },
      { t: "00:12:08", x: "知识库文件弹窗需要全选功能。" }
    ] },
    { id: "em2", title: "制造业客户沟通", owner: "李欣", time: "11-18 10:30", transcript: true, note: true, notes: [
      { t: "00:02:05", x: "客户关注数据私有化部署与权限隔离。" },
      { t: "00:08:33", x: "下一步安排 POC，预计下周出方案。" }
    ] },
    { id: "em3", title: "分享链路方案评审", owner: "王文博", time: "11-15 16:00", transcript: true, note: true, notes: [
      { t: "00:05:20", x: "ask 检索范围：无转译文本时，按实时翻译 → 总结优先级。" },
      { t: "00:09:10", x: "无转译、实时翻译、总结、笔记时不暴露 ask 入口。" },
      { t: "00:15:45", x: "企业管理员需要能查看下属所有会议数据，含笔记。" }
    ] },
    { id: "em4", title: "团队周例会", owner: "赵敏", time: "11-12 09:30", transcript: true, note: false, notes: [] },
    { id: "em5", title: "竞品分析讨论", owner: "陈思远", time: "11-10 15:00", transcript: false, note: false, notes: [] }
  ];

  const SHARE_CONTENT = [
    { key: "音频", title: "音频", desc: "分享会议录音文件，支持在线播放" },
    { key: "转译文本", title: "转译文本", desc: "分享语音转文字的完整文本" },
    { key: "实时翻译", title: "实时翻译", desc: "分享会议实时翻译内容" },
    { key: "总结", title: "总结 - Q3 产品复盘", desc: "分享 AI 智能总结文本" },
    { key: "笔记", title: "笔记 - 6 条会中记录", desc: "分享会议过程中实时记录的关键笔记", isNote: true }
  ];

  const SHARE_PANELS = {
    "总结": () => `<article class="sp-panel"><h2>会议总结</h2><p class="sp-lead">由 AI 基于本次会议生成，仅供参考</p>
      <p>本次复盘聚焦会中记录与分享链路两大类需求。会中侧重点是让笔记记录更连贯（整块输入、换行生成时间戳）、实时提问更主动（引导气泡可编辑）、知识库引用更便捷（文件全选）。分享侧重点是新增笔记模块，并引入需登录的 ask 能力，明确了检索范围优先级与入口显隐规则。</p>
      <p class="sp-disclaimer" style="color:var(--muted);font-size:11px">内容由 AI 生成，仅供参考</p></article>`,
    "转译文本": () => `<article class="sp-panel"><h2>转译文本</h2><p class="sp-lead">语音转文字完整记录</p>
      <p class="sp-quote">发言者A：我们先看一下 Q3 的整体情况。</p><p>Let's review the overall Q3 performance first.</p>
      <p class="sp-quote">发言者B：用户希望笔记像备忘录一样，换行就带一个时间戳。</p><p>Users want notes to work like a memo, with a timestamp per line.</p></article>`,
    "实时翻译": () => `<article class="sp-panel"><h2>实时翻译</h2><p class="sp-lead">会中双语实时翻译记录</p>
      <p class="sp-quote">用户反馈最多的是记录太碎。</p><p>The most common feedback is that the records are too fragmented.</p>
      <p class="sp-quote">分享链接里要加上 ask 能力。</p><p>We need to add ask capability to the share link.</p></article>`,
    "笔记": () => `<article class="sp-panel"><h2>会中笔记</h2><p class="sp-lead">分享者在录音过程中记下的要点，按时间戳排列；小智会把这些笔记与总结、转译一起作为回答依据。</p>
      <ol>
        <li><strong>00:01:12</strong> 用户反馈会中记录太碎，希望整块输入、换行自动带时间戳。</li>
        <li><strong>00:03:40</strong> 分享链接要加 ask，但必须先登录才能提问。</li>
        <li><strong>00:05:20</strong> ask 检索范围：无转译文本时按实时翻译 → 总结优先级。</li>
        <li><strong>00:09:10</strong> 无转译、实时翻译、总结、笔记时不暴露 ask 入口。</li>
        <li><strong>00:12:08</strong> 知识库文件弹窗需要全选功能。</li>
        <li><strong>00:15:45</strong> 企业管理员需查看下属所有会议数据，含笔记。</li>
      </ol>
      <p class="sp-note-meta">共 6 条 · 录音中记录</p></article>`
  };

  const SP_RAG_SCOPES = ["转译文本", "总结", "笔记"]; // 可进检索范围的分享内容

  /* ============ Toast ============ */
  function toast(msg) {
    const wrap = $("#toast-wrap");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  /* ============ 导航 ============ */
  function switchView(view) {
    state.view = view;
    $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
    $$(".view").forEach(v => v.classList.remove("active"));
    const target = $("#view-" + view);
    if (target) target.classList.add("active");
    $("#crumb-current").textContent = VIEW_NAMES[view] || "";
    const order = ["meeting", "home", "share", "enterprise"];
    const idx = order.indexOf(view);
    $("#scope-tag").textContent = idx >= 0 ? `场景 ${idx + 1} / 4` : "需求说明";
    $(".view-wrap").scrollTop = 0;
    if (view === "share") renderShareView();
    if (view === "enterprise") renderEnterprise();
  }

  $$(".nav-item").forEach(n => n.addEventListener("click", () => switchView(n.dataset.view)));

  /* ============ 需求1.1: 实时提问引导气泡 ============ */
  const REALTIME_QA = {
    "用户对会中笔记提出了哪些具体要求？": "会议中提到 3 点：① 记录方式从「一条条新增」改为整块输入，换行自动生成时间戳；② 共享时笔记能作为可检索内容；③ 企业管理员查看下属会议时要包含笔记。",
    "分享链接 ask 需要哪些登录规则？": "ask 入口对所有访客可见，但点击提问时若未登录，会先弹出登录引导；登录成功后才发送问题。另外，若无任何文字内容则不暴露 ask 入口。",
    "ask 的检索范围优先级是什么？": "默认检索范围为转译文本、总结、笔记；当没有转译文本时，按「实时翻译 → 总结」的优先级取用；若四者都没有，则不暴露 ask 入口。"
  };
  function aiAnswer(q) {
    for (const k in REALTIME_QA) if (q.includes(k.slice(0, 8)) || k.includes(q.slice(0, 6))) return REALTIME_QA[k];
    return `已收到你的问题「${q}」。基于本场会议的实时转译与笔记：本次讨论集中在会中笔记交互优化（整块输入 + 时间戳）、引导气泡可编辑发送、知识库全选，以及分享后的 ask 能力（登录引导 + 检索优先级）。`;
  }
  function appendAskChat(role, text) {
    const box = $("#ask-chat");
    const el = document.createElement("div");
    el.className = "chat-msg " + role;
    el.innerHTML = role === "ai" ? text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") : text;
    box.appendChild(el);
    $("#ask-body").scrollTop = $("#ask-body").scrollHeight;
  }
  $("#gb-send").addEventListener("click", () => {
    const q = $("#gb-edit").textContent.trim();
    if (!q) { toast("请先输入或确认问题"); return; }
    appendAskChat("user", q);
    setTimeout(() => appendAskChat("ai", aiAnswer(q)), 500);
    $("#guide-bubble").classList.add("hidden");
    state.guideClosed = true;
    state.lastQuestion = q;
    toast("已发送给小智");
  });
  $("#gb-close").addEventListener("click", () => {
    $("#guide-bubble").classList.add("hidden");
    state.guideClosed = true;
    toast("已关闭引导气泡，下次提问将覆盖显示");
  });
  // 下一次提问重新出现（覆盖）
  $("#ask-send").addEventListener("click", () => {
    const t = $("#ask-input");
    const q = t.value.trim();
    if (!q) return;
    appendAskChat("user", q);
    setTimeout(() => appendAskChat("ai", aiAnswer(q)), 500);
    t.value = "";
    t.style.height = "auto";
    if (state.guideClosed) {
      $("#guide-bubble").classList.remove("hidden");
      $("#gb-edit").textContent = q;
      state.guideClosed = false;
    }
  });
  $("#ask-input").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 90) + "px";
  });
  $("#ask-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#ask-send").click(); }
  });
  $("#ask-toggle-btn").addEventListener("click", function () {
    state.askEnabled = !state.askEnabled;
    this.classList.toggle("on", state.askEnabled);
    $("#ask-mode-hint").textContent = state.askEnabled ? "实时提问已开启" : "快速回答";
    toast(state.askEnabled ? "实时提问已开启，引导气泡已就绪" : "实时提问已关闭");
    if (state.askEnabled) $("#guide-bubble").classList.remove("hidden");
  });
  $("#web-btn").addEventListener("click", function () {
    state.webSearch = !state.webSearch;
    this.classList.toggle("on", state.webSearch);
    toast(state.webSearch ? "联网搜索已开启" : "联网搜索已关闭");
  });

  /* ============ 需求1.2: 知识库文件全选 ============ */
  const kbTreeList = $("#kb-tree-list");
  kbTreeList.innerHTML = `
    <div class="kb-tree-item active" data-folder="all">全部文件</div>
    <div class="kb-tree-item" data-folder="prod">产品文档</div>
    <div class="kb-tree-item child" data-folder="prod">需求文档</div>
    <div class="kb-tree-item" data-folder="meet">会议资料</div>`;
  $$(".kb-tree-item", kbTreeList).forEach(t => t.addEventListener("click", () => {
    $$(".kb-tree-item", kbTreeList).forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    renderKbFiles(t.dataset.folder);
  }));
  function renderKbFiles() {
    const list = $("#kb-file-list");
    list.innerHTML = KB_FILES.map(f => `
      <label class="kb-file">
        <input type="checkbox" value="${f.id}" ${state.kbSelected.includes(f.id) ? "checked" : ""} />
        <span class="checkbox-ui"></span>
        <span class="fico">${f.type}</span>
        <span class="fname">${f.name}</span>
        <span class="fmeta">${f.meta}</span>
      </label>`).join("");
    $$(".kb-file input", list).forEach(cb => cb.addEventListener("change", syncKbSelection));
    syncCheckAll("#kb-check-all", $$(".kb-file input", list));
  }
  function syncKbSelection() {
    state.kbSelected = $$(".kb-file input:checked", $("#kb-file-list")).map(c => c.value);
    $("#kb-selected-tip").textContent = `已选 ${state.kbSelected.length} 个文件`;
    syncCheckAll("#kb-check-all", $$(".kb-file input", $("#kb-file-list")));
  }
  function syncCheckAll(allSel, items) {
    const all = $(allSel);
    if (!all) return;
    all.checked = items.length > 0 && items.every(i => i.checked);
    all.indeterminate = items.some(i => i.checked) && !all.checked;
  }
  $("#kb-check-all").addEventListener("change", function () {
    $$(".kb-file input", $("#kb-file-list")).forEach(cb => { cb.checked = this.checked; });
    syncKbSelection();
    toast(this.checked ? "已全选当前目录文件" : "已取消全选");
  });
  $("#kb-btn").addEventListener("click", () => {
    renderKbFiles();
    $("#kb-selected-tip").textContent = `已选 ${state.kbSelected.length} 个文件`;
    openModal("kb-modal");
  });
  $("#kb-confirm").addEventListener("click", () => {
    $("#kb-count").textContent = state.kbSelected.length;
    $("#kb-count").style.display = state.kbSelected.length ? "" : "none";
    closeModal("kb-modal");
    toast(`已选择 ${state.kbSelected.length} 个知识库文件`);
  });

  /* ============ 需求1.3: 写下笔记（整块 + 换行时间戳）============ */
  $("#notes-input").addEventListener("input", function () {
    const lines = this.value.split("\n").filter(l => l.trim());
    state.notes = lines.map((text, i) => ({ t: noteTime(i), text: text.trim() }));
    renderNotes();
  });
  function noteTime(i) {
    // mock 时间戳：以 00:12:36 为基准，每条 +18 秒
    const base = 12 * 60 + 36 + i * 18;
    const m = String(Math.floor(base / 60)).padStart(2, "0");
    const s = String(base % 60).padStart(2, "0");
    return `00:${m}:${s}`;
  }
  function renderNotes() {
    const list = $("#notes-list");
    $("#notes-count").textContent = `${state.notes.length} 条记录`;
    if (!state.notes.length) {
      list.innerHTML = `<div class="note-empty">每行笔记将自动生成一个时间戳，按记录顺序排列</div>`;
      return;
    }
    list.innerHTML = state.notes.map(n => `<div class="note-item"><span class="nt">${n.t}</span><span>${escapeHtml(n.text)}</span></div>`).join("");
  }

  /* ============ 需求2.1-a: 首页会议列表 + 分享配置 ============ */
  function renderMeetings() {
    $("#meeting-list").innerHTML = MEETINGS.map(m => `
      <div class="meeting-row">
        <span class="m-row-ico"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></span>
        <div class="m-row-main">
          <div class="m-row-title">${m.title}</div>
          <div class="m-row-meta"><span>${m.time}</span><span>时长 ${m.dur}</span></div>
        </div>
        <div class="m-row-badges">${m.tags.map(t => `<span class="mini-badge ${t === "笔记" ? "note" : ""}">${t}</span>`).join("")}</div>
        <button class="m-row-action" data-id="${m.id}">分享</button>
      </div>`).join("");
    $$(".m-row-action", $("#meeting-list")).forEach(b => b.addEventListener("click", () => openShareConfig(b.dataset.id)));
  }
  $("#new-share-btn").addEventListener("click", () => openShareConfig("m1"));

  let shareConfigSelected = [];
  function openShareConfig(meetingId) {
    state.currentShare = MEETINGS.find(m => m.id === meetingId) || MEETINGS[0];
    shareConfigSelected = SHARE_CONTENT.map(s => s.key);
    renderShareConfigOptions();
    openModal("share-modal");
  }
  function renderShareConfigOptions() {
    $("#share-scope-list").innerHTML = SHARE_CONTENT.map(s => `
      <label class="sc-card ${shareConfigSelected.includes(s.key) ? "checked" : ""}">
        <input type="checkbox" value="${s.key}" ${shareConfigSelected.includes(s.key) ? "checked" : ""} />
        <span class="checkbox-ui"></span>
        <span class="sc-card-copy">
          <strong class="${s.isNote ? "note-label" : ""}">${s.title}</strong>
          <small>${s.desc}</small>
        </span>
      </label>`).join("");
    $$(".sc-card input", $("#share-scope-list")).forEach(cb => cb.addEventListener("change", () => {
      if (cb.checked && !shareConfigSelected.includes(cb.value)) shareConfigSelected.push(cb.value);
      if (!cb.checked) shareConfigSelected = shareConfigSelected.filter(x => x !== cb.value);
      cb.closest(".sc-card").classList.toggle("checked", cb.checked);
      syncCheckAll("#share-check-all", $$(".sc-card input", $("#share-scope-list")));
    }));
    syncCheckAll("#share-check-all", $$(".sc-card input", $("#share-scope-list")));
  }
  $("#share-check-all").addEventListener("change", function () {
    $$(".sc-card input", $("#share-scope-list")).forEach(cb => {
      cb.checked = this.checked;
      cb.closest(".sc-card").classList.toggle("checked", this.checked);
    });
    shareConfigSelected = this.checked ? SHARE_CONTENT.map(s => s.key) : [];
    toast(this.checked ? "已全选分享内容" : "已取消全选");
  });
  $("#share-submit").addEventListener("click", () => {
    if (!shareConfigSelected.length) { toast("请至少选择一项要分享的内容"); return; }
    state.shareScopes = shareConfigSelected.slice();
    const link = "https://www.100wiser.com/share/" + Math.random().toString(36).slice(2, 10);
    $("#share-link-value").value = link;
    closeModal("share-modal");
    openModal("link-modal");
    toast("分享链接已生成");
  });
  $("#copy-link-btn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#share-link-value").value); toast("链接已复制"); }
    catch (e) { toast("复制失败，请手动复制"); }
  });
  $("#open-share-btn").addEventListener("click", () => {
    closeModal("link-modal");
    switchView("share");
    toast("已进入分享链接演示");
  });

  /* ============ 需求2.1-b: 分享链接 Ask ============ */
  function ragScopes() {
    // 规则：无转译文本时，检索优先级 实时翻译 → 总结；笔记始终可检索
    const s = state.shareScopes;
    const set = new Set();
    if (s.includes("转译文本")) set.add("转译文本");
    else {
      if (s.includes("实时翻译")) set.add("实时翻译");
      else if (s.includes("总结")) set.add("总结");
    }
    if (s.includes("笔记")) set.add("笔记");
    return Array.from(set);
  }
  function canAsk() {
    // 无转译、实时翻译、总结、笔记 → 不暴露 ask 入口
    return ["转译文本", "实时翻译", "总结", "笔记"].some(x => state.shareScopes.includes(x));
  }
  function renderShareView() {
    // 配置条
    $("#scs-opts").innerHTML = SHARE_CONTENT.map(s => `
      <label class="scs-opt ${state.shareScopes.includes(s.key) ? "checked" : ""}">
        <input type="checkbox" value="${s.key}" ${state.shareScopes.includes(s.key) ? "checked" : ""} /> ${s.key}
      </label>`).join("");
    $$(".scs-opt input", $("#scs-opts")).forEach(cb => cb.addEventListener("change", () => {
      if (cb.checked && !state.shareScopes.includes(cb.value)) state.shareScopes.push(cb.value);
      if (!cb.checked) state.shareScopes = state.shareScopes.filter(x => x !== cb.value);
      cb.closest(".scs-opt").classList.toggle("checked", cb.checked);
      renderShareView();
    }));

    const scopes = ragScopes();
    const askable = canAsk();
    const status = $("#scs-status");
    status.classList.toggle("warn", !askable);
    status.innerHTML = askable
      ? `当前分享内容：<b>${state.shareScopes.join("、") || "无"}</b>　·　小智检索范围：<b>${scopes.join(" → ") || "无"}</b>`
      : `当前仅分享「${state.shareScopes.join("、") || "无"}」，没有转译文本 / 实时翻译 / 总结 / 笔记，<b>不暴露 ask 入口</b>。`;

    // tabs：仅展示已分享的内容类型
    const tabKeys = SHARE_CONTENT.filter(s => state.shareScopes.includes(s.key)).map(s => s.key);
    $("#share-tabs").innerHTML = tabKeys.map((k, i) => `<div class="share-tab ${i === 0 ? "active" : ""}" data-key="${k}">${k === "笔记" ? "会中笔记" : k}</div>`).join("");
    if (tabKeys.length) {
      renderSharePanel(tabKeys[0]);
      $$(".share-tab", $("#share-tabs")).forEach(t => t.addEventListener("click", () => {
        $$(".share-tab", $("#share-tabs")).forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        renderSharePanel(t.dataset.key);
      }));
    } else {
      $("#share-body").innerHTML = `<div class="sp-empty-inner"><p>本场分享只开放了录音，没有包含「转译文本」「总结」与「笔记」，暂无文字内容可查看。</p><small>小智只能基于转译文本、实时翻译、总结与笔记回答，因此本场无法提问</small></div>`;
    }

    // ask 入口显隐
    const askWrap = $("#sp-ask");
    askWrap.style.display = askable ? "" : "none";
    askWrap.classList.toggle("no-scope", scopes.length === 0);
    $("#sp-chat-sub").textContent = scopes.length ? "基于本场分享内容回答" : "本场未分享文字内容";
    $("#sp-ask-input").placeholder = scopes.length ? "问问小智：这场会讲了什么？" : "本场未分享文字内容，小智无法回答";
  }
  function renderSharePanel(key) {
    const fn = SHARE_PANELS[key];
    $("#share-body").innerHTML = fn ? fn() : `<article class="sp-panel"><h2>${key}</h2><p class="sp-lead">已分享「${key}」内容</p><p>（演示数据）本场会议包含 ${key} 相关内容，可供访问者查看。</p></article>`;
  }

  $("#sp-ask-logo").addEventListener("click", () => {
    if (!canAsk()) { toast("本场未分享可检索的文字内容"); return; }
    if (!state.loggedIn) { openLogin("share"); return; }
    state.shareChatOpen = !state.shareChatOpen;
    $("#sp-chat").hidden = !state.shareChatOpen;
    if (state.shareChatOpen && !$("#sp-chat-body").children.length) {
      appendSpMsg("ai", greetingText());
    }
  });
  $("#sp-ask-input").addEventListener("click", () => {
    if (!state.loggedIn) { openLogin("share"); return; }
    $("#sp-chat").hidden = false;
    state.shareChatOpen = true;
    $("#sp-chat-text").focus();
  });
  $("#sp-chat-min").addEventListener("click", () => {
    $("#sp-chat").hidden = true;
    state.shareChatOpen = false;
  });
  function greetingText() {
    const scopes = ragScopes();
    if (!scopes.length) return "我是小智。这次分享没有开放可检索的文字内容，暂时回答不了具体问题。";
    return `我是小智，已经把这场分享读完了。\n本场可检索范围：${scopes.join("、")}。人物、动机、待办、笔记里的要点都可以直接问。`;
  }
  function appendSpMsg(role, text) {
    const box = $("#sp-chat-body");
    const el = document.createElement("div");
    el.className = "sp-msg " + role;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }
  const SP_REPLIES = [
    { keys: ["讲了什么", "内容", "总结", "概括"], text: "本次会议聚焦两块需求：会中侧把笔记改成整块输入、换行生成时间戳，并让引导气泡可编辑后发送；分享侧新增笔记模块，并引入需登录的 ask 能力。" },
    { keys: ["笔记", "记了什么", "要点"], text: "本场共 6 条会中笔记：整块输入与时间戳、ask 登录引导、检索优先级（实时翻译→总结）、无内容不暴露入口、知识库全选、企业管理员查看下属会议含笔记。" },
    { keys: ["下一步", "待办", "行动"], text: "会议提到的下一步：梳理 ask 检索范围优先级规则、补齐企业管理员查看下属笔记的权限、在分享配置中开放笔记模块。" },
    { keys: ["登录", "规则"], text: "ask 入口对所有人可见，但点击提问时若未登录会先弹登录引导；登录成功后才发送问题。若无任何可检索文字内容，则不暴露 ask 入口。" },
    { keys: ["优先级", "检索范围"], text: "默认检索转译文本、总结、笔记；无转译文本时按「实时翻译 → 总结」优先级；四者都无则不暴露 ask 入口。" }
  ];
  function spReply(q) {
    const scopes = ragScopes();
    if (!scopes.length) return "这次分享没有勾选「转译文本」「实时翻译」「总结」「笔记」，小智检索不到这场会的文字内容，回答不了具体问题。\n\n可以让分享者在「分享配置」里勾选相关文字内容后重新生成链接。";
    for (const r of SP_REPLIES) if (r.keys.some(k => q.includes(k))) return r.text + `\n\n（依据：${scopes.join("、")}）`;
    return `关于「${q}」，基于本场已分享的内容（${scopes.join("、")}）：这次会议主要讨论了会中笔记交互优化与分享后 ask 能力，包含登录引导、检索优先级和入口显隐规则。`;
  }
  $("#sp-chat-form").addEventListener("submit", e => {
    e.preventDefault();
    if (!state.loggedIn) { openLogin("share"); return; }
    const input = $("#sp-chat-text");
    const q = input.value.trim();
    if (!q) return;
    appendSpMsg("user", q);
    input.value = "";
    setTimeout(() => appendSpMsg("ai", spReply(q)), 450);
  });
  $$("#sp-chat-chips button").forEach(b => b.addEventListener("click", () => {
    if (!state.loggedIn) { openLogin("share"); return; }
    $("#sp-chat-text").value = b.textContent;
    $("#sp-chat-form").dispatchEvent(new Event("submit", { cancelable: true }));
  }));

  /* ============ 登录引导 ============ */
  let loginMode = "personal", loginTab = "phone";
  function openLogin() {
    const wm = $("#login-wm");
    if (!wm.dataset.built) { wm.dataset.built = "1"; wm.textContent = "百智 WiseNote 欢迎登录 新用户自动注册 ".repeat(40); }
    openModal("login-modal");
    syncLoginBtn();
  }
  $$("#login-seg button").forEach(b => b.addEventListener("click", () => {
    loginMode = b.dataset.mode;
    $$("#login-seg button").forEach(x => x.classList.toggle("active", x === b));
    $("#login-pane-personal").hidden = loginMode !== "personal";
    $("#login-pane-enterprise").hidden = loginMode !== "enterprise";
  }));
  $$(".login-tabs button").forEach(b => b.addEventListener("click", () => {
    loginTab = b.dataset.tab;
    $$(".login-tabs button").forEach(x => x.classList.toggle("active", x === b));
    const acc = $("#login-account");
    acc.placeholder = loginTab === "phone" ? "请输入手机号" : "请输入邮箱";
    acc.maxLength = loginTab === "phone" ? 11 : 60;
    acc.value = "";
    syncLoginBtn();
  }));
  function accountValid() {
    const v = $("#login-account").value.trim();
    return loginTab === "phone" ? /^1\d{10}$/.test(v) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function syncLoginBtn() {
    const codeOk = $("#login-code").value.trim().length >= 4;
    const agree = $("#login-agree").checked;
    $("#login-submit").disabled = !(accountValid() && codeOk && agree);
  }
  $("#login-account").addEventListener("input", syncLoginBtn);
  $("#login-code").addEventListener("input", syncLoginBtn);
  $("#login-agree").addEventListener("change", syncLoginBtn);
  $("#code-btn").addEventListener("click", () => toast("验证码已发送（演示：任意 4 位以上即可）"));
  $("#login-submit").addEventListener("click", () => {
    state.loggedIn = true;
    closeModal("login-modal");
    $("#sp-ask-input").removeAttribute("readonly");
    $("#sp-chat").hidden = false;
    state.shareChatOpen = true;
    if (!$("#sp-chat-body").children.length) appendSpMsg("ai", greetingText());
    toast("登录成功，现在可以向小智提问了");
  });
  $("#login-corp-next").addEventListener("click", () => {
    const v = $("#login-corp").value.trim();
    if (!v) { toast("请输入企业代码"); return; }
    state.loggedIn = true;
    closeModal("login-modal");
    $("#sp-chat").hidden = false;
    state.shareChatOpen = true;
    if (!$("#sp-chat-body").children.length) appendSpMsg("ai", greetingText());
    toast("企业登录成功，现在可以向小智提问了");
  });

  /* ============ 需求2.2: 企业会议管理 ============ */
  function renderEnterprise() {
    $("#ent-members").innerHTML = `
      <div class="ent-member ${state.entMember === "all" ? "active" : ""}" data-id="all"><span class="mav">全</span>全部下属<span class="mcnt">18</span></div>
      ${ENT_MEMBERS.map(m => `<div class="ent-member ${state.entMember === m.id ? "active" : ""}" data-id="${m.id}"><span class="mav">${m.initial}</span>${m.name}<span class="mcnt">${m.count}</span></div>`).join("")}`;
    $$(".ent-member", $("#ent-members")).forEach(el => el.addEventListener("click", () => {
      state.entMember = el.dataset.id;
      renderEnterprise();
    }));

    const member = ENT_MEMBERS.find(m => m.id === state.entMember);
    $("#ent-filter-info").textContent = member ? `当前查看：${member.name} 的会议` : "当前查看：全部下属";
    const rows = member ? ENT_MEETINGS.filter(m => m.owner === member.name) : ENT_MEETINGS;
    $("#ent-table-body").innerHTML = rows.map(m => `
      <tr>
        <td><strong>${m.title}</strong></td>
        <td>${m.owner}</td>
        <td>${m.time}</td>
        <td class="${m.transcript ? "tbl-yes" : "tbl-no"}">${m.transcript ? "有" : "无"}</td>
        <td class="${m.note ? "tbl-yes" : "tbl-no"}">${m.note ? `有 · ${m.notes.length} 条` : "无"}</td>
        <td>${m.note ? `<span class="tbl-link" data-id="${m.id}">查看笔记</span>` : `<span class="tbl-no">—</span>`}</td>
      </tr>`).join("");
    $$(".tbl-link", $("#ent-table-body")).forEach(el => el.addEventListener("click", () => openEntNotes(el.dataset.id)));
  }
  function openEntNotes(id) {
    const m = ENT_MEETINGS.find(x => x.id === id);
    if (!m) return;
    $("#ent-note-title").textContent = `${m.title} · 会中笔记`;
    $("#ent-note-body").innerHTML = `<p class="mini-dim" style="margin-top:0">所属员工：${m.owner}　·　共 ${m.notes.length} 条记录</p>` +
      m.notes.map(n => `<div class="ent-note-item"><span class="nt">${n.t}</span><span class="tx">${escapeHtml(n.x)}</span></div>`).join("");
    openModal("ent-note-modal");
  }

  /* ============ 需求清单 ============ */
  function renderAbout() {
    const cards = [
      { status: "已实现", title: "1.1 实时提问 · 引导气泡", items: [
        "引导气泡支持手动修改问题后点击「智能回答」发送给模型",
        "引导气泡不默认消失，支持本人手动关闭",
        "下一次提问时引导气泡覆盖显示新问题"
      ], rule: "入口：会中录音页 → 小智面板 → 开启「实时提问」开关" },
      { status: "已实现", title: "1.2 知识库文件 · 全选", items: [
        "选择知识库文件弹窗新增「全选」复选框",
        "全选/取消全选联动文件列表，回填已选数量"
      ], rule: "入口：小智面板底部工具栏 →「知识库」" },
      { status: "已实现", title: "1.3 写下笔记 · 整块输入", items: [
        "由「一条条新增」改为整块文本输入（类似备忘录）",
        "换行即在前方产生新时间戳，按行聚合成多条记录"
      ], rule: "入口：小智面板 →「写下笔记」区域" },
      { status: "已实现", title: "2.1-a 分享配置 · 笔记模块", items: [
        "分享内容新增「笔记」：标题「笔记 - XX 条会中记录」",
        "灰色引导文案：分享会议过程中实时记录的关键笔记",
        "支持全选，笔记可被小智检索"
      ], rule: "入口：首页会议列表 →「分享」→ 分享配置弹窗" },
      { status: "已实现", title: "2.1-b 分享链接 · Ask", items: [
        "分享链接增加 ask，需先引导登录，登录成功才能提问",
        "无转译文本时检索优先级：实时翻译 → 总结",
        "无转译文本、实时翻译、总结、笔记时不暴露 ask 入口"
      ], rule: "入口：分享链接演示 → 底部 ask 条；勾选内容可切换验证规则" },
      { status: "已实现", title: "2.2 企业会议 · 下属数据", items: [
        "企业管理员可查看下属所有员工的会议数据",
        "包含会中笔记，支持按成员筛选、展开笔记明细"
      ], rule: "入口：企业会议管理 → 左侧组织成员 →「查看笔记」" }
    ];
    $("#about-grid").innerHTML = cards.map(c => `
      <div class="about-card">
        <div class="about-card-head"><h3>${c.title}</h3><span class="about-status">${c.status}</span></div>
        <ul>${c.items.map(i => `<li>${i}</li>`).join("")}</ul>
        <div class="about-rule">${c.rule}</div>
      </div>`).join("");
  }

  /* ============ 弹窗通用 ============ */
  function openModal(id) { $("#" + id).hidden = false; }
  function closeModal(id) { $("#" + id).hidden = true; }
  $$("[data-close]").forEach(b => b.addEventListener("click", () => closeModal(b.dataset.close)));
  $$(".modal-mask").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.hidden = true; }));

  /* ============ 工具 ============ */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ============ 波形动画 ============ */
  const wave = $("#wave");
  for (let i = 0; i < 60; i++) {
    const bar = document.createElement("span");
    bar.style.animationDelay = (i * 0.03) + "s";
    bar.style.animationDuration = (0.8 + (i % 5) * 0.12) + "s";
    wave.appendChild(bar);
  }

  /* ============ 重置 ============ */
  $("#reset-btn").addEventListener("click", () => {
    state.loggedIn = false;
    state.shareChatOpen = false;
    state.shareScopes = ["音频", "转译文本", "实时翻译", "总结", "笔记"];
    state.notes = [];
    state.kbSelected = [];
    state.guideClosed = false;
    state.entMember = "all";
    $("#notes-input").value = "";
    $("#ask-chat").innerHTML = "";
    $("#sp-chat-body").innerHTML = "";
    $("#sp-chat").hidden = true;
    $("#guide-bubble").classList.remove("hidden");
    $("#gb-edit").textContent = "这场会里，用户对会中笔记提出了哪些具体要求？";
    $("#kb-count").textContent = "0";
    $("#kb-count").style.display = "none";
    renderNotes();
    renderMeetings();
    renderShareView();
    renderEnterprise();
    toast("演示数据已重置");
  });

  /* ============ 初始化 ============ */
  renderKbFiles();
  renderNotes();
  renderMeetings();
  renderEnterprise();
  renderAbout();
  renderShareView();
  $("#kb-count").style.display = "none";
})();
