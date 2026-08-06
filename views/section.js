/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — always-visible "Duck Epics" card-back section. Everything inline
 * (Trello does not open t.popup from a card-back-section iframe).
 *
 * Auth: our own OAuth — open Trello's authorize page in a real window,
 * capture the token via postMessage from views/auth-return.html, store it
 * member-private. "+ Sub-task" creates a new card (needs token); "🔗 Link"
 * links an existing board card (no auth).
 */
(function () {
  var t = TrelloPowerUp.iframe({ appKey: Epic.APP_KEY, appName: Epic.APP_NAME });
  var VERSION = 'v64'; // shown in the unlinked view to confirm which connector version is loaded
  var root;
  var busy = false;
  var LIMIT = 30;
  var MEMBER_AVATARS = {}; // memberId -> avatarUrl (from REST, cached across renders)
  var lastRendered = null; // id of the card we last rendered for (navigation watch)
  var painted = false; // once painted, re-renders keep old content (no "Loading" flicker)
  var expandedList = false; // subscription list: collapsed to 10 vs "view all"
  var lastPaint = null; // {cardId,s,icon} so the toggle can repaint without refetch
  var STATUS_LISTS = []; // [{id,name}] workflow columns shown as move targets
  var ALL_LISTS = [];    // [{id,name}] every board list (for the ⚙ config)
  var DRAG_ID = null;    // id of the sub-task currently being dragged
  var DONE_LIST_ID = null; // id of the «Completed Tasks» list (for the ✓ toggle)
  var collapsedGroups = {}; // group key -> true when the user collapsed that column
  var LINKS = {};           // cardId -> custom link URL (board-shared)
  var lastSelfWrite = 0; // timestamp of our last optimistic REST write (move/due) — used
                         // to suppress Trello's t.render churn that would otherwise rebuild
                         // the DOM mid-interaction (e.g. close a just-opened date picker).
  var DBG = {};
  function debugFooter() { /* debug readout disabled; re-enable if diagnosing */ }

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }
  function authed() { return Epic.getToken(t).then(function (tok) { return !!tok; }).catch(function () { return false; }); }

  // The connector bakes the card id into our iframe URL (?c=…). It's the reliable
  // card id (t.card() can go stale when Trello reuses the iframe across cards).
  function ctxCardId() {
    var m = location.search.match(/[?&]c=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function openCard(url, id) { t.showCard(id); }

  // Optimistic column move: repaint instantly from the in-memory stats, then fire
  // the REST move in the background. No refetch on success (that was the 1-min lag);
  // revert to the true state only if the move fails.
  function moveOptimistic(cardId, toListId) {
    var lp = lastPaint;
    if (!lp || !lp.s) {
      Epic.moveCard(t, cardId, toListId).then(render)
        .catch(function (err) { if (err && err.message === 'auth') doAuthorize(render); });
      return;
    }
    var toName = '';
    ALL_LISTS.forEach(function (l) { if (l.id === toListId) toName = l.name; });
    var s = lp.s, moved = false;
    s.items.forEach(function (it) {
      if (it.id === cardId && !it.archived) {
        it.listId = toListId; it.list = toName; it.done = Epic.DONE_LIST_RE.test(toName || '');
        moved = true;
      }
    });
    if (moved) s.done = s.items.filter(function (it) { return it.done; }).length;
    paintParent(lp.cardId, s, lp.icon); fit();
    lastSelfWrite = Date.now();
    Epic.moveCard(t, cardId, toListId).then(function () { lastSelfWrite = Date.now(); }).catch(function (err) {
      render(); // failed — resync to the real board state
      if (err && err.message === 'auth') doAuthorize(render);
    });
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // ISO date -> yyyy-mm-dd (local) for a native <input type=date> value.
  function isoToInputVal(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // yyyy-mm-dd (from the date input) -> ISO, keeping the original time-of-day if any.
  function inputValToIso(val, currentISO) {
    if (!val) return '';
    var p = val.split('-');
    var base = currentISO ? new Date(currentISO) : null;
    var hh = (base && !isNaN(base.getTime())) ? base.getHours() : 12;
    var mm = (base && !isNaN(base.getTime())) ? base.getMinutes() : 0;
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), hh, mm).toISOString();
  }

  // Optimistic due update: repaint instantly, PUT in the background, revert on error.
  function applyDue(cardId, iso) {
    var lp = lastPaint;
    if (lp && lp.s) {
      lp.s.items.forEach(function (it) { if (it.id === cardId) { it.due = iso || null; if (!iso) it.dueComplete = false; } });
      paintParent(lp.cardId, lp.s, lp.icon); fit();
    }
    lastSelfWrite = Date.now();
    Epic.setDue(t, cardId, iso).then(function () { lastSelfWrite = Date.now(); })
      .catch(function (err) { render(); if (err && err.message === 'auth') doAuthorize(render); });
  }

  // Paint only if we're still on the same card (guards against a slow async
  // render landing after the user navigated to another card).
  function safePaint(cardId, s, icon) {
    return t.card('id').then(function (cur) {
      if (!busy && cur && cur.id === cardId) { paintParent(cardId, s, icon); fit(); }
    });
  }

  // ---- rich sub-task row (name + checklist + due + column + assignees) ----
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(iso) { try { var d = new Date(iso); return d.getDate() + ' ' + MON[d.getMonth()]; } catch (e) { return ''; } }
  function hue(id) { var h = 0, str = String(id); for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h % 360; }
  function avatarHtml(m) {
    var name = Views.esc(m.fullName || m.username || '');
    var ini = Views.esc(((m.initials || (m.fullName || m.username || '?')) + '').slice(0, 2).toUpperCase());
    // Real Trello avatar photo when present; initials circle otherwise (or on load error).
    var base = m.avatarUrl || MEMBER_AVATARS[m.id] || (m.avatarHash ? 'https://trello-members.s3.amazonaws.com/' + m.id + '/' + m.avatarHash : '');
    var src = base ? (/\.(png|jpe?g|gif)$/i.test(base) ? base : base + '/50.png') : '';
    var img = src ? '<img src="' + Views.esc(src) + '" onerror="this.remove()" alt="">' : '';
    return '<span class="av" title="' + name + '" style="background:hsl(' + hue(m.id) + ',55%,52%)">' + ini + img + '</span>';
  }
  // Full board members (names + avatars) for the picker / create form — always fresh
  // (reliable). Row avatars use the small avatar cache separately.
  function membersReady() {
    return t.board('id').then(function (b) { return Epic.fetchMembers(t, b.id); });
  }

  function colSelect(it) {
    var opts = STATUS_LISTS.map(function (l) { return '<option value="' + l.id + '"' + (l.id === it.listId ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>'; }).join('');
    if (it.listId && !STATUS_LISTS.some(function (l) { return l.id === it.listId; })) {
      opts = '<option value="' + it.listId + '" selected>' + Views.esc(it.list) + '</option>' + opts;
    }
    return '<select class="move' + (it.done ? ' done' : '') + '" data-id="' + it.id + '" title="Move to column">' + opts + '</select>';
  }
  function subRow(it) {
    var avs = (it.members || []).slice(0, 3).map(avatarHtml).join('');
    var nameHtml = '<div class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</div>';

    // ---- archived row: name / list pill / [Open][Unarchive] — the "even" reference layout ----
    if (it.archived) {
      var achips = '';
      if (it.due) achips += '<span class="pill ' + (it.dueComplete ? 'done' : '') + '">🕐 ' + fmtDate(it.due) + '</span>';
      if (it.checkItems) achips += '<span class="pill ' + (it.checkItemsChecked === it.checkItems ? 'done' : '') + '">☑ ' + it.checkItemsChecked + '/' + it.checkItems + '</span>';
      achips += '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span>';
      return '<div class="sub archived" data-id="' + it.id + '">' + nameHtml +
        '<div class="meta"><span class="chips">' + achips + '</span></div>' +
        '<div class="actions" style="margin-top:6px">' +
        '<button class="btn" data-open="' + Views.esc(it.url || '') + '">Open in new tab</button>' +
        '<button class="btn" data-unarch="' + it.id + '">Unarchive</button></div></div>';
    }

    // ---- active row: SAME vertical scheme as archive ----
    // line 1: ✓ done-toggle + name (+ avatar pinned right)   line 2: chips   line 3: status
    var dueLabel = it.due ? '🕐 ' + fmtDate(it.due) : '📅 date';
    // A transparent native date input overlays the pill; its calendar-picker-indicator
    // is stretched to fill it (see CSS), so a direct click on the pill opens the native
    // date picker — works inside Trello's cross-origin iframe where showPicker() is blocked.
    var dueVal = isoToInputVal(it.due);
    var chips = '<span class="pill due-edit' + (it.dueComplete ? ' done' : '') + dueClass(it) + (it.due ? '' : ' empty') + '" title="Change date">' +
      dueLabel +
      '<input type="date" class="due-ovl" data-due-id="' + it.id + '" data-due="' + (it.due || '') + '"' + (dueVal ? ' value="' + dueVal + '"' : '') + '></span>';
    if (it.checkItems) chips += '<span class="pill ' + (it.checkItemsChecked === it.checkItems ? 'done' : '') + '">☑ ' + it.checkItemsChecked + '/' + it.checkItems + '</span>';

    var check = '<span class="check' + (it.done ? ' on' : '') + '" data-id="' + it.id + '" title="' + (it.done ? 'Mark as not done' : 'Mark as done') + '"></span>';
    var avsCell = '<span class="avs avs-edit" data-id="' + it.id + '" title="Assignee">' + (avs || '<span class="av-add">+</span>') + '</span>';
    var link = LINKS[it.id] || '';
    var linkBtns = link
      ? '<button class="linkbtn has" data-openlink="' + Views.esc(link) + '" title="' + Views.esc(link) + '">🔗</button>' +
        '<button class="linkbtn" data-editlink="' + it.id + '" title="Edit link">✎</button>'
      : '<button class="linkbtn" data-editlink="' + it.id + '" title="Add link">🔗</button>';
    var inner =
      '<div class="toprow">' + check + nameHtml + linkBtns + avsCell + '</div>' +
      '<div class="meta"><span class="chips">' + chips + '</span></div>' +
      '<div class="ctl">' + colSelect(it) + '</div>';
    // A <div> (not <button>) so the inline <select> works; draggable for column moves.
    return '<div class="sub" draggable="true" data-id="' + it.id + '" data-url="' + Views.esc(it.url || '') + '">' + inner + '</div>';
  }

  // Deadline flavour: overdue = red, soon (<48h) = amber.
  function dueClassRaw(due, dueComplete) {
    if (!due || dueComplete) return '';
    var ts = new Date(due).getTime();
    if (isNaN(ts)) return '';
    var now = Date.now();
    if (ts < now) return ' overdue';
    if (ts - now < 48 * 3600 * 1000) return ' soon';
    return '';
  }
  function dueClass(it) { return it.done ? '' : dueClassRaw(it.due, it.dueComplete); }

  // Trello label colour → inline background/foreground.
  function labelStyle(c) {
    var base = c ? String(c).split('_')[0] : '';
    var bg = { green: '#61bd4f', yellow: '#f2d600', orange: '#ff9f1a', red: '#eb5a46', purple: '#c377e0', blue: '#0079bf', sky: '#00c2e0', lime: '#51e898', pink: '#ff78cb', black: '#344563' }[base] || '#b3bac5';
    var dark = { yellow: 1, lime: 1, sky: 1 }[base];
    return 'background:' + bg + ';color:' + (dark ? '#172b4d' : '#fff');
  }
  function firstOpenListId() {
    for (var i = 0; i < STATUS_LISTS.length; i++) { if (STATUS_LISTS[i].id !== DONE_LIST_ID) return STATUS_LISTS[i].id; }
    return null;
  }

  function doAuthorize(onDone) {
    var ret = location.href.replace(/[^/]*$/, '') + 'auth-return.html';
    var u = 'https://trello.com/1/authorize?expiration=never&scope=read,write&name=Duck%20Epics' +
      '&response_type=token&key=' + encodeURIComponent(Epic.APP_KEY) +
      '&return_url=' + encodeURIComponent(ret) + '&callback_method=fragment';
    window.open(u, 'duckauth', 'width=500,height=760');
    function handler(e) {
      if (e && e.data && e.data.duckToken) {
        window.removeEventListener('message', handler);
        Epic.setToken(t, e.data.duckToken).then(function () { if (onDone) onDone(); });
      }
    }
    window.addEventListener('message', handler);
  }

  function render() {
    busy = false;
    root = document.getElementById('root');
    if (!painted) root.innerHTML = '<p class="muted small">Loading…</p>';
    var cid = ctxCardId();
    var cardP = cid ? Promise.resolve(cid) : t.card('id').then(function (c) { return c.id; });
    return cardP.then(function (cardId) {
      lastRendered = cardId;
      return Promise.all([Epic.isSubscription(t, cardId), Epic.getParent(t, cardId), Epic.getToken(t)]).then(function (r) {
        DBG = { card: cardId, sub: r[0], parent: r[1], token: !!r[2] };
        if (r[0]) return renderParent(cardId);
        if (r[1]) return renderChild(cardId, r[1]);
        return renderNone(cardId);
      });
    }).then(function () { painted = true; fit(); }).catch(function (e) {
      root.innerHTML = '<p class="small" style="color:#bf2600">Error: ' + Views.esc(e && e.message) + '</p>';
      fit();
    });
  }

  function backBar() { return '<div class="actions" style="margin-bottom:6px"><button class="btn" id="cx">← Back</button></div>'; }
  function wireBack() { var b = document.getElementById('cx'); if (b) b.addEventListener('click', render); }

  // ---------- unlinked ----------
  function renderNone(cardId) {
    root.innerHTML =
      '<p class="muted small">This card is not linked.</p>' +
      '<div class="actions">' +
      '<button class="btn primary" id="mk">Make Subscription</button>' +
      '<button class="btn" id="at">Attach to Subscription</button></div>' +
      '<p class="small muted" id="mkmsg" style="margin-top:6px">' + VERSION + '</p>';
    var mk = document.getElementById('mk');
    mk.addEventListener('click', function () {
      mk.disabled = true; document.getElementById('mkmsg').textContent = 'Working… (' + VERSION + ')';
      Epic.makeSubscription(t, cardId).then(render)
        .catch(function (e) { mk.disabled = false; document.getElementById('mkmsg').textContent = 'Error: ' + (e && e.message || e) + ' (' + VERSION + ')'; });
    });
    document.getElementById('at').addEventListener('click', function () { showAttach(cardId); });
    debugFooter();
  }

  function showAttach(cardId) {
    busy = true;
    Promise.all([Epic.listSubscriptions(t), t.cards('id', 'name')]).then(function (r) {
      var subs = r[0].filter(function (id) { return id !== cardId; });
      var nameOf = {}; r[1].forEach(function (x) { nameOf[x.id] = x.name; });
      root.innerHTML = backBar() + (subs.length
        ? '<p class="small muted">Choose a Subscription:</p><div class="list">' +
          subs.map(function (id) { return '<button class="item" data-id="' + id + '"><span class="name">' + Views.esc(nameOf[id] || '(card)') + '</span></button>'; }).join('') + '</div>'
        : '<p class="muted small">No Subscriptions on this board yet.</p>');
      wireBack();
      root.querySelectorAll('.list .item').forEach(function (el) {
        el.addEventListener('click', function () { Epic.setParent(t, cardId, el.getAttribute('data-id')).then(render).catch(function () { render(); }); });
      });
      fit();
    });
  }

  // ---------- subscription (parent) ----------
  function renderParent(cardId) {
    return Promise.all([Epic.getChildren(t, cardId), Epic.getIcon(t, cardId), t.lists('id', 'name'), Epic.getStatusLists(t), Epic.getCollapsed(t), Epic.getLinks(t, cardId), Epic.getMembersCache(t)]).then(function (pre) {
      var childIds = pre[0], icon = pre[1], lists = pre[2], statusCfg = pre[3];
      collapsedGroups = pre[4] || {};
      LINKS = pre[5] || {};
      var mcache = pre[6];
      // Warm avatars from the small cache so photos show on the FIRST paint (no REST wait).
      if (mcache && mcache.avatars) {
        Object.keys(mcache.avatars).forEach(function (id) { MEMBER_AVATARS[id] = mcache.avatars[id]; });
      }
      ALL_LISTS = lists;
      DONE_LIST_ID = Epic.findDoneListId(lists);
      // Status columns = configured subset, or (default) all lists except the «Подписка»/Subscription parent lists.
      STATUS_LISTS = lists.filter(function (l) { return statusCfg ? statusCfg.indexOf(l.id) >= 0 : !/подписк/i.test(l.name); });
      // ONE rich cards fetch (client-cached, fast) — no second pass. Pass childIds so
      // computeStats doesn't re-read pluginData.
      return t.cards('id', 'name', 'idList', 'closed', 'url', 'due', 'dueComplete', 'badges', 'members').then(function (active) {
        var have = {}; active.forEach(function (c) { have[c.id] = 1; });
        var missingIds = childIds.filter(function (id) { return !have[id]; });
        // Resolve missing sub-tasks by id in ONE pass: which are archived (still exist) and
        // which are confirmed DELETED (HTTP 404). Falls back to {} when unauthorized.
        var archP = missingIds.length ? Epic.resolveMissing(t, missingIds) : Promise.resolve({ archived: {}, dead: [] });
        return archP.then(function (res) {
          var arch = res.archived || {};
          // Self-heal: drop ONLY ids that Trello confirmed deleted (404). Cards missing due to
          // a transient/network error are never in `dead`, so a fetch failure can't mass-prune.
          if (res.dead && res.dead.length) {
            lastSelfWrite = Date.now();
            Epic.pruneChildren(t, cardId, res.dead).catch(function () {});
          }
          return Epic.computeStats(t, cardId, { childIds: childIds, activeCards: active, lists: lists, archivedById: arch }).then(function (s) {
            return safePaint(cardId, s, icon).then(function () {
              // Refresh the members cache via REST only when it's missing or stale (>30 min);
              // otherwise avatars already came from the cache above — no per-open REST.
              var stale = !mcache || !mcache.ts || (Date.now() - mcache.ts > 1800000);
              if (stale) {
                t.board('id').then(function (b) { return Epic.refreshMembers(t, b.id); }).then(function (map) {
                  var added = false;
                  Object.keys(map).forEach(function (id) { if (map[id].avatarUrl && MEMBER_AVATARS[id] !== map[id].avatarUrl) { MEMBER_AVATARS[id] = map[id].avatarUrl; added = true; } });
                  if (added) safePaint(cardId, s, icon);
                }).catch(function () {});
              }
            });
          });
        });
      });
    });
  }

  // Collapsible group header (click to toggle). `key` is the list id (or 'archived').
  function grpHead(key, label, count, collapsed) {
    return '<div class="grp-h" data-key="' + Views.esc(String(key)) + '">' +
      '<span class="grp-caret">' + (collapsed ? '▶' : '▼') + '</span>' +
      Views.esc(label) + ' <span class="grp-n">' + count + '</span></div>';
  }

  function paintParent(cardId, s, icon) {
    lastPaint = { cardId: cardId, s: s, icon: icon };
    var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
    var body;
    if (!s.total) {
      body = '<p class="muted small">No sub-tasks yet — "+ Sub-task" creates one, "🔗 Link" adds an existing card.</p>';
    } else {
      // Group active sub-tasks by column (status); archived go to their own group.
      var groups = {}, order = [], archived = [];
      s.items.forEach(function (it) {
        if (it.archived) { archived.push(it); return; }
        if (!groups[it.list]) { groups[it.list] = []; order.push(it.list); }
        groups[it.list].push(it);
      });
      // Newest first inside every group (Trello id embeds the creation time).
      order.forEach(function (ln) { groups[ln].sort(function (a, b) { return creationTs(b.id) - creationTs(a.id); }); });
      archived.sort(function (a, b) { return creationTs(b.id) - creationTs(a.id); });
      // Collapse the active list to the first 10 rows unless "view all" is on.
      var CAP = 10;
      var activeCount = order.reduce(function (n, ln) { return n + groups[ln].length; }, 0);
      var shown = 0;
      body = order.map(function (ln) {
        var lid = groups[ln][0] ? groups[ln][0].listId : '';
        var key = lid || ln;
        var head = grpHead(key, ln, groups[ln].length, !!collapsedGroups[key]);
        if (collapsedGroups[key]) return '<div class="grp" data-list="' + lid + '">' + head + '</div>';
        var take = expandedList ? groups[ln] : groups[ln].slice(0, Math.max(0, CAP - shown));
        shown += take.length;
        var rows = take.length ? '<div class="list">' + take.map(subRow).join('') + '</div>' : '';
        return '<div class="grp" data-list="' + lid + '">' + head + rows + '</div>';
      }).join('');
      if (activeCount > CAP) {
        body += '<div class="actions" style="margin-top:10px"><button class="btn" id="toggleList">' +
          (expandedList ? 'Show fewer children' : 'View all children (' + activeCount + ')') + '</button></div>';
      }
      if (archived.length) {
        var ac = !!collapsedGroups.archived;
        body += '<div class="grp">' + grpHead('archived', '📦 Archived', archived.length, ac) +
          (ac ? '' : '<div class="list">' + archived.map(subRow).join('') + '</div>') + '</div>';
      }
    }
    root.innerHTML =
      '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
      '<div class="toolbar"><button class="iconbtn" id="ic" title="Icon">' + icon + '</button>' +
      '<button class="btn primary" id="new">+ Sub-task</button>' +
      '<button class="btn" id="attach">+ Existing</button>' +
      '<button class="btn' + (LINKS[cardId] ? ' has-link' : '') + '" id="link" title="' + (LINKS[cardId] ? Views.esc(LINKS[cardId]) : 'Add a link (e.g. client site)') + '">🔗 Link</button>' +
      '<button class="btn" id="un">Unmark</button>' +
      '<button class="iconbtn" id="cols" title="Configure columns">⚙</button></div>' + body;

    // Collapse / expand a column group by clicking its header.
    root.querySelectorAll('.grp-h[data-key]').forEach(function (h) {
      h.addEventListener('click', function (e) {
        e.stopPropagation();
        var k = h.getAttribute('data-key');
        if (collapsedGroups[k]) delete collapsedGroups[k]; else collapsedGroups[k] = true;
        lastSelfWrite = Date.now();
        Epic.setCollapsed(t, collapsedGroups); // persist (member-private)
        paintParent(lastPaint.cardId, lastPaint.s, lastPaint.icon);
      });
    });
    root.querySelectorAll('.sub').forEach(function (el) {
      if (el.classList.contains('archived')) return; // archived rows use their own buttons
      el.addEventListener('click', function () { openCard(el.getAttribute('data-url'), el.getAttribute('data-id')); });
    });
    root.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); var u = b.getAttribute('data-open'); if (u) window.open(u, '_blank'); });
    });
    root.querySelectorAll('[data-unarch]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        b.disabled = true; b.textContent = '…';
        Epic.unarchiveCard(t, b.getAttribute('data-unarch')).then(render)
          .catch(function () { b.disabled = false; b.textContent = 'Unarchive'; });
      });
    });
    document.getElementById('ic').addEventListener('click', function () { showIconPicker(cardId); });
    document.getElementById('new').addEventListener('click', function () { showCreateForm(cardId); });
    document.getElementById('attach').addEventListener('click', function () { showLinkExisting(cardId); });
    document.getElementById('link').addEventListener('click', function () { showLinkEditor(cardId); });
    document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
    document.getElementById('cols').addEventListener('click', function () { showColumnsConfig(cardId); });
    var tg = document.getElementById('toggleList');
    if (tg) tg.addEventListener('click', function () { expandedList = !expandedList; paintParent(lastPaint.cardId, lastPaint.s, lastPaint.icon); });
    // ✓ toggle: mark done (move to Completed Tasks) or reopen (first open status list).
    root.querySelectorAll('.check').forEach(function (el) {
      el.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = el.getAttribute('data-id');
        var target = el.classList.contains('on') ? firstOpenListId() : DONE_LIST_ID;
        if (target) moveOptimistic(id, target);
      });
    });
    // Click the avatar cell to assign/unassign a member (inline picker).
    root.querySelectorAll('.avs-edit').forEach(function (el) {
      el.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      el.addEventListener('click', function (e) { e.stopPropagation(); showMemberPicker(el.getAttribute('data-id')); });
    });
    // Link button: open the saved URL, or open the editor.
    root.querySelectorAll('[data-openlink]').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); var u = b.getAttribute('data-openlink'); if (u) window.open(u, '_blank'); });
    });
    root.querySelectorAll('[data-editlink]').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); showLinkEditor(b.getAttribute('data-editlink')); });
    });
    // Inline due-date editing: the transparent overlay input opens the native picker
    // on a direct click; on change we save optimistically.
    root.querySelectorAll('.due-ovl').forEach(function (inp) {
      inp.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      inp.addEventListener('click', function (e) { e.stopPropagation(); });
      inp.addEventListener('change', function (e) {
        e.stopPropagation();
        applyDue(inp.getAttribute('data-due-id'), inputValToIso(inp.value, inp.getAttribute('data-due')));
      });
    });
    // Move-to-column dropdown on each active row.
    root.querySelectorAll('select.move').forEach(function (sel) {
      sel.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      sel.addEventListener('click', function (e) { e.stopPropagation(); });
      sel.addEventListener('change', function (e) {
        e.stopPropagation();
        moveOptimistic(sel.getAttribute('data-id'), sel.value);
      });
    });
    // Drag a sub-task onto a column group to change its status.
    root.querySelectorAll('.sub[draggable="true"]').forEach(function (el) {
      el.addEventListener('dragstart', function (e) {
        DRAG_ID = el.getAttribute('data-id'); el.classList.add('dragging');
        if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', DRAG_ID); }
      });
      el.addEventListener('dragend', function () {
        el.classList.remove('dragging'); DRAG_ID = null;
        root.querySelectorAll('.grp').forEach(function (g) { g.classList.remove('drop-hover'); });
      });
    });
    root.querySelectorAll('.grp[data-list]').forEach(function (g) {
      g.addEventListener('dragover', function (e) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; g.classList.add('drop-hover'); });
      g.addEventListener('dragleave', function (e) { if (!g.contains(e.relatedTarget)) g.classList.remove('drop-hover'); });
      g.addEventListener('drop', function (e) {
        e.preventDefault(); g.classList.remove('drop-hover');
        var to = g.getAttribute('data-list'), id = DRAG_ID;
        if (id && to) moveOptimistic(id, to);
      });
    });
    debugFooter();
  }

  function showColumnsConfig(cardId) {
    busy = true;
    var current = {}; STATUS_LISTS.forEach(function (l) { current[l.id] = 1; });
    var rows = ALL_LISTS.map(function (l) {
      return '<label><input type="checkbox" value="' + l.id + '"' + (current[l.id] ? ' checked' : '') + '> ' + Views.esc(l.name) + '</label>';
    }).join('');
    root.innerHTML = backBar() +
      '<p class="small muted">Check the status columns — sub-tasks can only be moved into these:</p>' +
      '<div class="cols">' + rows + '</div>' +
      '<div class="actions"><button class="btn primary" id="save">Save</button></div>';
    wireBack();
    document.getElementById('save').addEventListener('click', function () {
      var ids = [];
      root.querySelectorAll('.cols input:checked').forEach(function (c) { ids.push(c.value); });
      Epic.setStatusLists(t, ids).then(render);
    });
    fit();
  }

  // Inline member picker: toggle board members on a sub-task (assign/unassign).
  function showMemberPicker(cardId) {
    busy = true;
    var item = null;
    if (lastPaint && lastPaint.s) lastPaint.s.items.forEach(function (it) { if (it.id === cardId) item = it; });
    var assigned = {}; (item && item.members ? item.members : []).forEach(function (m) { assigned[m.id] = 1; });
    var changed = false;
    root.innerHTML = backBar() + '<p class="muted small">Loading members…</p>';
    document.getElementById('cx').addEventListener('click', function () { changed ? render() : backToList(cardId); });
    membersReady().then(function (map) {
      var members = Object.keys(map).map(function (id) { return map[id]; });
      members.sort(function (a, b2) { return (a.fullName || a.username || '').localeCompare(b2.fullName || b2.username || ''); });
      root.innerHTML = backBar() +
        '<label>Assignees</label>' +
        '<input type="text" id="mflt" placeholder="Search by name…" autocomplete="off">' +
        '<div class="list" id="mlist"></div>';
      document.getElementById('cx').addEventListener('click', function () { changed ? render() : backToList(cardId); });
      var flt = document.getElementById('mflt');
      // Rebuild only the list (the search box stays, keeping focus/value on input).
      function paintList() {
        var q = flt.value.toLowerCase();
        var shown = members.filter(function (m) { return ((m.fullName || '') + ' ' + (m.username || '')).toLowerCase().indexOf(q) >= 0; });
        document.getElementById('mlist').innerHTML = shown.map(function (m) {
          return '<button class="item member' + (assigned[m.id] ? ' selected' : '') + '" data-id="' + m.id + '">' +
            avatarHtml(m) + '<span class="name">' + Views.esc(m.fullName || m.username || m.id) + '</span>' +
            '<span class="pill done mchk"' + (assigned[m.id] ? '' : ' style="visibility:hidden"') + '>✓</span></button>';
        }).join('') || '<p class="muted small">No one found.</p>';
        root.querySelectorAll('.member').forEach(function (el) {
          el.addEventListener('click', function () {
            var id = el.getAttribute('data-id');
            var now = !assigned[id];
            assigned[id] = now ? 1 : 0; changed = true;
            lastSelfWrite = Date.now();
            (now ? Epic.addMember(t, cardId, id) : Epic.removeMember(t, cardId, id))
              .then(function () { lastSelfWrite = Date.now(); })
              .catch(function (err) { if (err && err.message === 'auth') doAuthorize(function () {}); });
            el.classList.toggle('selected', now);
            var chk = el.querySelector('.mchk'); if (chk) chk.style.visibility = now ? 'visible' : 'hidden';
          });
        });
        fit();
      }
      flt.addEventListener('input', paintList);
      flt.focus();
      paintList();
    }).catch(function () {
      root.innerHTML = backBar() + '<p class="small" style="color:#bf2600">Failed to load members.</p>';
      document.getElementById('cx').addEventListener('click', function () { render(); });
      fit();
    });
  }
  // Return to the list without a full refetch when nothing changed.
  function backToList(cardId) {
    busy = false;
    if (lastPaint && lastPaint.s) { paintParent(lastPaint.cardId, lastPaint.s, lastPaint.icon); fit(); }
    else render();
  }

  function normalizeUrl(u) { u = (u || '').trim(); if (!u) return ''; if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = 'https://' + u; return u; }

  // Inline editor for a sub-task's custom link (add / edit / open / delete).
  function showLinkEditor(cardId) {
    busy = true;
    var cur = LINKS[cardId] || '';
    root.innerHTML = backBar() +
      '<label>Link</label>' +
      '<input type="text" id="lnk" placeholder="https://…" autocomplete="off">' +
      '<div class="actions" style="margin-top:10px">' +
      '<button class="btn primary" id="lopen">Open ↗</button>' +
      '<button class="btn" id="lsave">Save</button>' +
      (cur ? '<button class="btn danger" id="ldel">Delete</button>' : '') +
      '</div><p class="small muted" id="lmsg"></p>';
    wireBack();
    var inp = document.getElementById('lnk');
    inp.value = cur; inp.focus();
    function saveAnd(url, done) {
      LINKS[cardId] = url; if (!url) delete LINKS[cardId];
      lastSelfWrite = Date.now();
      var parentId = (lastPaint && lastPaint.cardId) || null;
      Epic.setLink(t, parentId, cardId, url)
        .then(function () { return url ? Epic.linkToDesc(t, cardId, url) : null; })
        .then(done).catch(done);
    }
    document.getElementById('lopen').addEventListener('click', function () {
      var v = normalizeUrl(inp.value);
      if (!v) { document.getElementById('lmsg').textContent = 'Enter a URL first.'; return; }
      saveAnd(v, function () { window.open(v, '_blank'); backToList(cardId); });
    });
    document.getElementById('lsave').addEventListener('click', function () {
      var v = normalizeUrl(inp.value);
      saveAnd(v, function () { backToList(cardId); });
    });
    var del = document.getElementById('ldel');
    if (del) del.addEventListener('click', function () { saveAnd('', function () { backToList(cardId); }); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('lsave').click(); });
    fit();
  }

  function showCreateForm(cardId) {
    busy = true;
    Promise.all([t.card('idList'), t.lists('id', 'name'), authed(), t.board('id')]).then(function (r) {
      var cur = r[0], lists = r[1], isAuthed = r[2], boardId = r[3].id;
      var opts = lists.map(function (l) { return '<option value="' + l.id + '"' + (l.id === cur.idList ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>'; }).join('');
      root.innerHTML = backBar() +
        (isAuthed ? '' :
          '<p class="small" style="color:#974f0c;margin:0 0 6px">Creating a new card requires a one-time Trello authorization.</p>' +
          '<div class="actions" style="margin-bottom:8px"><button class="btn primary" id="auth">Authorize</button></div>') +
        '<label>New sub-task name</label><input type="text" id="nm" placeholder="SUB - ..." autocomplete="off">' +
        '<label>Column</label><select id="ls">' + opts + '</select>' +
        '<label>Due date</label><input type="date" id="due">' +
        '<label>Link</label><input type="text" id="lk" placeholder="https://…" autocomplete="off">' +
        '<label>Assignees</label>' +
        '<input type="text" id="memflt" placeholder="Search members…" autocomplete="off"' + (isAuthed ? '' : ' disabled') + '>' +
        '<div class="list memlist" id="mem"></div>' +
        '<div class="actions"><button class="btn primary" id="cr" disabled>Create</button></div>' +
        '<p class="small muted" id="msg"></p>';
      wireBack();
      var au = document.getElementById('auth');
      if (au) au.addEventListener('click', function () { au.textContent = 'Opening Trello window…'; au.disabled = true; doAuthorize(function () { showCreateForm(cardId); }); });
      var nm = document.getElementById('nm'), cr = document.getElementById('cr');
      nm.addEventListener('input', function () { cr.disabled = !nm.value.trim() || !isAuthed; });
      if (isAuthed) nm.focus();

      // Assignee picker (search + toggle list).
      var selected = {}, allMembers = [], memflt = document.getElementById('memflt');
      function paintMem() {
        var q = memflt.value.toLowerCase();
        var shown = allMembers.filter(function (m) { return ((m.fullName || '') + ' ' + (m.username || '')).toLowerCase().indexOf(q) >= 0; });
        document.getElementById('mem').innerHTML = shown.map(function (m) {
          return '<button class="item member' + (selected[m.id] ? ' selected' : '') + '" data-id="' + m.id + '">' +
            avatarHtml(m) + '<span class="name">' + Views.esc(m.fullName || m.username || m.id) + '</span>' +
            '<span class="pill done mchk"' + (selected[m.id] ? '' : ' style="visibility:hidden"') + '>✓</span></button>';
        }).join('') || '<p class="muted small" style="padding:4px 2px">No members.</p>';
        document.getElementById('mem').querySelectorAll('.member').forEach(function (el) {
          el.addEventListener('click', function () {
            var id = el.getAttribute('data-id');
            if (selected[id]) delete selected[id]; else selected[id] = 1;
            el.classList.toggle('selected', !!selected[id]);
            var chk = el.querySelector('.mchk'); if (chk) chk.style.visibility = selected[id] ? 'visible' : 'hidden';
          });
        });
        fit();
      }
      if (isAuthed) {
        membersReady().then(function (map) {
          allMembers = Object.keys(map).map(function (id) { return map[id]; });
          allMembers.sort(function (a, b) { return (a.fullName || a.username || '').localeCompare(b.fullName || b.username || ''); });
          paintMem();
        });
        memflt.addEventListener('input', paintMem);
      }

      cr.addEventListener('click', function () {
        cr.disabled = true; document.getElementById('msg').textContent = 'Creating…';
        Epic.createSubtask(t, {
          name: nm.value.trim(),
          idList: document.getElementById('ls').value,
          parentId: cardId,
          due: inputValToIso(document.getElementById('due').value, null),
          link: normalizeUrl(document.getElementById('lk').value),
          idMembers: Object.keys(selected),
        }).then(render)
          .catch(function (e) { document.getElementById('msg').textContent = (e.message === 'auth') ? 'Authorize first.' : 'Error: ' + e.message; cr.disabled = false; });
      });
      fit();
    });
  }

  // Trello object ids embed the creation time (first 8 hex chars = unix seconds).
  function creationTs(id) { return parseInt(String(id).substring(0, 8), 16) || 0; }

  function showLinkExisting(parentId) {
    busy = true;
    var PAGE = 10, shownN = PAGE, added = 0;
    var listName = {}, taken = {}, allCandidates = [], current = [], loadedFull = false;

    // Panel shell is painted immediately; cards fill in without blocking.
    root.innerHTML = backBar() +
      '<label>Link existing cards</label>' +
      '<p class="small muted" style="margin:-2px 0 6px">Click a card to add it as a sub-task. Keep adding, then ← Back.</p>' +
      '<input type="text" id="flt" placeholder="Search by name…" autocomplete="off">' +
      '<div class="filters">' +
      '<select id="colf"><option value="">All columns</option></select>' +
      '<select id="sortf">' +
      '<option value="new">Newest first</option>' +
      '<option value="act">By activity</option>' +
      '<option value="old">Oldest first</option>' +
      '<option value="name">Alphabetical</option>' +
      '</select></div>' +
      '<p class="small" id="lnkmsg" style="color:var(--green);min-height:16px;margin:2px 0"></p>' +
      '<div class="list" id="cand"><p class="muted small">Loading cards…</p></div>';
    wireBack();
    var flt = document.getElementById('flt');
    var colf = document.getElementById('colf');
    var sortf = document.getElementById('sortf');

    function paint() {
      var html = current.slice(0, shownN).map(function (c) {
        return '<button class="item" data-id="' + c.id + '"><span class="name">' + Views.esc(c.name) + '</span><span class="pill">' + Views.esc(listName[c.idList] || '') + '</span></button>';
      }).join('') || '<p class="muted small">' + (loadedFull ? 'Nothing found.' : 'Loading cards…') + '</p>';
      if (current.length > shownN) {
        html += '<div class="actions" style="margin-top:8px"><button class="btn" id="more">Show more (' + (current.length - shownN) + ')</button></div>';
      }
      if (!loadedFull) html += '<p class="small muted" style="margin-top:6px">Loading the rest of the cards…</p>';
      document.getElementById('cand').innerHTML = html;
      root.querySelectorAll('#cand .item').forEach(function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-id');
          el.disabled = true; el.style.opacity = '.5';
          lastSelfWrite = Date.now(); // stay in the panel (busy=true already guards t.render)
          Epic.setParent(t, id, parentId).then(function () {
            added++;
            allCandidates = allCandidates.filter(function (c) { return c.id !== id; });
            current = current.filter(function (c) { return c.id !== id; });
            var msg = document.getElementById('lnkmsg'); if (msg) msg.textContent = '✓ Added ' + added + ' — back when done';
            paint();
          }).catch(function () { el.disabled = false; el.style.opacity = ''; });
        });
      });
      var m = document.getElementById('more');
      if (m) m.addEventListener('click', function () { shownN += PAGE; paint(); });
      fit();
    }
    function applyFilter() {
      var q = flt.value.toLowerCase(), col = colf.value, mode = sortf.value;
      var arr = allCandidates.filter(function (c) {
        if (col && c.idList !== col) return false;
        return (c.name || '').toLowerCase().indexOf(q) >= 0;
      });
      arr.sort(function (a, b) {
        if (mode === 'old') return creationTs(a.id) - creationTs(b.id);
        if (mode === 'name') return (a.name || '').localeCompare(b.name || '');
        if (mode === 'act') return (new Date(b.dateLastActivity || 0)).getTime() - (new Date(a.dateLastActivity || 0)).getTime();
        return creationTs(b.id) - creationTs(a.id); // 'new' (default)
      });
      current = arr; shownN = PAGE; paint();
    }
    function rebuild(cards) { allCandidates = cards.filter(function (c) { return !taken[c.id]; }); applyFilter(); }

    flt.addEventListener('input', applyFilter);
    colf.addEventListener('change', applyFilter);
    sortf.addEventListener('change', applyFilter);
    flt.focus();

    // Stage 1 (fast): lists + children + client-cached cards → instant, usable list.
    Promise.all([t.lists('id', 'name'), Epic.getChildren(t, parentId), t.cards('id', 'name', 'idList', 'dateLastActivity')]).then(function (r) {
      r[0].forEach(function (l) { listName[l.id] = l.name; });
      // Populate the column filter with the board's lists.
      colf.innerHTML = '<option value="">All columns</option>' + r[0].map(function (l) { return '<option value="' + l.id + '">' + Views.esc(l.name) + '</option>'; }).join('');
      r[1].forEach(function (id) { taken[id] = 1; }); taken[parentId] = 1;
      rebuild(r[2] || []);
      // Stage 2 (background): full board via REST → merge in, keeping the search box focus.
      t.board('id').then(function (b) { return Epic.fetchBoardCards(t, b.id); }).then(function (full) {
        loadedFull = true;
        if (full && full.length) rebuild(full); else paint();
      }).catch(function () { loadedFull = true; paint(); });
    });
  }

  function showIconPicker(cardId) {
    busy = true;
    var grid = Epic.ICON_PALETTE.map(function (e) { return '<button data-e="' + e + '">' + e + '</button>'; }).join('');
    root.innerHTML = backBar() + '<p class="small muted">Subscription icon:</p><div class="grid">' + grid + '</div>';
    wireBack();
    root.querySelectorAll('.grid button').forEach(function (b) {
      b.addEventListener('click', function () { Epic.setIcon(t, cardId, b.getAttribute('data-e')).then(render); });
    });
    fit();
  }

  // ---------- sub-task (child) ----------
  function renderChild(cardId, parentId) {
    return Promise.all([Epic.getIcon(t, parentId), t.cards('id', 'name', 'url')]).then(function (r) {
      var icon = r[0], cards = r[1];
      var p = cards.filter(function (x) { return x.id === parentId; })[0];
      var name = p ? p.name : '(archived)', url = (p && p.url) || '';
      paintChild(cardId, parentId, icon, name, url, null); // fast paint
      // Enrich with the parent Subscription's date / assignees / labels (REST).
      Epic.fetchCardDetail(t, parentId).then(function (d) {
        if (d) paintChild(cardId, parentId, icon, d.name || name, d.url || url, d);
      }).catch(function () {});
    });
  }

  function paintChild(cardId, parentId, icon, name, url, d) {
    var extra = '';
    if (d) {
      var chips = '';
      (d.labels || []).forEach(function (l) {
        chips += '<span class="label" style="' + labelStyle(l.color) + '">' + (Views.esc(l.name || '') || '&nbsp;&nbsp;') + '</span>';
      });
      if (d.due) chips += '<span class="pill' + (d.dueComplete ? ' done' : '') + dueClassRaw(d.due, d.dueComplete) + '">🕐 ' + fmtDate(d.due) + '</span>';
      var avs = (d.members || []).slice(0, 4).map(avatarHtml).join('');
      if (chips || avs) extra = '<div class="childmeta">' + chips + (avs ? '<span class="avs">' + avs + '</span>' : '') + '</div>';
    }
    root.innerHTML =
      '<p class="small muted">Parent Subscription:</p>' +
      '<button class="item" data-url="' + Views.esc(url) + '"><span>' + icon + '</span>' +
      '<span class="name">' + Views.esc(name) + '</span>' +
      '<span class="pill">Subscription</span></button>' +
      extra +
      '<div class="actions" style="margin-top:10px"><button class="btn danger" id="de">Detach</button></div>';
    root.querySelector('.item').addEventListener('click', function () { openCard(url, parentId); });
    document.getElementById('de').addEventListener('click', function () { Epic.detach(t, cardId).then(render); });
    fit();
  }

  var renderTimer = null;
  t.render(function () {
    if (busy) return;
    // Skip the re-render triggered by our own optimistic write (move/due): the UI is
    // already updated, and rebuilding now would close an open date picker / feel slow.
    if (Date.now() - lastSelfWrite < 2500) return;
    // Debounce bursts of board changes into a single re-render.
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () { if (!busy) render(); }, 120);
  });
  render();
})();
