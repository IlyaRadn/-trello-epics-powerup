/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — always-visible "Duck Epics" card-back section. Everything inline
 * (Trello does not open t.popup from a card-back-section iframe).
 *
 * Auth: our own OAuth — open Trello's authorize page in a real window,
 * capture the token via postMessage from views/auth-return.html, store it
 * member-private. "+ Sub-task" creates a new card (needs token); "🔗 Привязать"
 * links an existing board card (no auth).
 */
(function () {
  var t = TrelloPowerUp.iframe({ appKey: Epic.APP_KEY, appName: Epic.APP_NAME });
  var root;
  var busy = false;
  var LIMIT = 30;
  var MEMBER_AVATARS = {}; // memberId -> avatarUrl (from REST, cached across renders)
  var lastRendered = null; // id of the card we last rendered for (navigation watch)
  var painted = false; // once painted, re-renders keep old content (no "Загрузка" flicker)
  var DBG = {};
  function debugFooter() {
    if (!root) return;
    var el = document.createElement('p');
    el.className = 'small muted';
    el.style.cssText = 'opacity:.5;margin-top:10px;font-family:monospace';
    el.textContent = 'DBG v24 · card ' + String(DBG.card).slice(-5) + ' · sub=' + (!!DBG.sub) +
      ' · parent=' + (DBG.parent ? String(DBG.parent).slice(-5) : '—') +
      ' · token=' + (DBG.token ? 'yes' : 'no') + ' · avatars=' + Object.keys(MEMBER_AVATARS).length;
    root.appendChild(el);
  }

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }
  function authed() { return Epic.getToken(t).then(function (tok) { return !!tok; }).catch(function () { return false; }); }

  // The connector bakes the card id into our iframe URL (?c=…). It's the reliable
  // card id (t.card() can go stale when Trello reuses the iframe across cards).
  function ctxCardId() {
    var m = location.search.match(/[?&]c=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function openCard(url, id) { t.showCard(id); }

  // Paint only if we're still on the same card (guards against a slow async
  // render landing after the user navigated to another card).
  function safePaint(cardId, s, icon) {
    return t.card('id').then(function (cur) {
      if (!busy && cur && cur.id === cardId) { paintParent(cardId, s, icon); fit(); }
    });
  }

  // ---- rich sub-task row (name + checklist + due + column + assignees) ----
  var MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
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
  function subRow(it) {
    var meta = '';
    if (it.checkItems) meta += '<span class="pill ' + (it.checkItemsChecked === it.checkItems ? 'done' : '') + '">☑ ' + it.checkItemsChecked + '/' + it.checkItems + '</span>';
    if (it.due) meta += '<span class="pill ' + (it.dueComplete ? 'done' : '') + '">🕐 ' + fmtDate(it.due) + '</span>';
    meta += '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span>';
    var avs = (it.members || []).slice(0, 4).map(avatarHtml).join('');
    var inner = '<div class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</div>' +
      '<div class="meta">' + meta + (avs ? '<span class="avs">' + avs + '</span>' : '') + '</div>';
    if (it.archived) {
      // Not a <button> (it holds its own action buttons).
      return '<div class="sub archived" data-id="' + it.id + '">' + inner +
        '<div class="actions" style="margin-top:6px">' +
        '<button class="btn" data-open="' + Views.esc(it.url || '') + '">Open in new tab</button>' +
        '<button class="btn" data-unarch="' + it.id + '">Unarchive</button></div></div>';
    }
    return '<button class="sub" data-id="' + it.id + '" data-url="' + Views.esc(it.url || '') + '">' + inner + '</button>';
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
    if (!painted) root.innerHTML = '<p class="muted small">Загрузка…</p>';
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
      root.innerHTML = '<p class="small" style="color:#bf2600">Ошибка: ' + Views.esc(e && e.message) + '</p>';
      fit();
    });
  }

  function backBar() { return '<div class="actions" style="margin-bottom:6px"><button class="btn" id="cx">← Назад</button></div>'; }
  function wireBack() { var b = document.getElementById('cx'); if (b) b.addEventListener('click', render); }

  // ---------- unlinked ----------
  function renderNone(cardId) {
    root.innerHTML =
      '<p class="muted small">Эта карточка не связана.</p>' +
      '<div class="actions">' +
      '<button class="btn primary" id="mk">Make Subscription</button>' +
      '<button class="btn" id="at">Attach to Subscription</button></div>';
    document.getElementById('mk').addEventListener('click', function () { Epic.makeSubscription(t, cardId).then(render); });
    document.getElementById('at').addEventListener('click', function () { showAttach(cardId); });
    debugFooter();
  }

  function showAttach(cardId) {
    busy = true;
    Promise.all([Epic.listSubscriptions(t), t.cards('id', 'name')]).then(function (r) {
      var subs = r[0].filter(function (id) { return id !== cardId; });
      var nameOf = {}; r[1].forEach(function (x) { nameOf[x.id] = x.name; });
      root.innerHTML = backBar() + (subs.length
        ? '<p class="small muted">Выберите Subscription:</p><div class="list">' +
          subs.map(function (id) { return '<button class="item" data-id="' + id + '"><span class="name">' + Views.esc(nameOf[id] || '(card)') + '</span></button>'; }).join('') + '</div>'
        : '<p class="muted small">На доске ещё нет Subscription.</p>');
      wireBack();
      root.querySelectorAll('.list .item').forEach(function (el) {
        el.addEventListener('click', function () { Epic.setParent(t, cardId, el.getAttribute('data-id')).then(render).catch(function () { render(); }); });
      });
      fit();
    });
  }

  // ---------- subscription (parent) ----------
  function renderParent(cardId) {
    return Promise.all([Epic.getChildren(t, cardId), Epic.getIcon(t, cardId), t.lists('id', 'name')]).then(function (pre) {
      var childIds = pre[0], icon = pre[1], lists = pre[2];
      // Stage 1 — minimal fields (fast): show the list immediately.
      return t.cards('id', 'name', 'idList', 'closed', 'url').then(function (active) {
        var have = {}; active.forEach(function (c) { have[c.id] = 1; });
        var missingIds = childIds.filter(function (id) { return !have[id]; });
        // Fetch ONLY the archived sub-tasks by id (fast), not the whole board archive.
        var archP = missingIds.length ? Epic.fetchArchivedByIds(t, missingIds) : Promise.resolve({});
        return archP.then(function (arch) {
          return Epic.computeStats(t, cardId, { activeCards: active, lists: lists, archivedById: arch }).then(function (s) {
            return safePaint(cardId, s, icon).then(function () {
              // Stage 2 — enrich with due/checklist/members + avatar URLs (REST) in the background.
              Promise.all([
                t.cards('id', 'name', 'idList', 'closed', 'url', 'due', 'dueComplete', 'badges', 'members'),
                // Fetch board members (avatar URLs) once per iframe, then reuse.
                Object.keys(MEMBER_AVATARS).length ? Promise.resolve({}) : t.board('id').then(function (b) { return Epic.fetchMembers(t, b.id); }),
              ]).then(function (rr) {
                var rich = rr[0], members = rr[1];
                Object.keys(members).forEach(function (id) { if (members[id].avatarUrl) MEMBER_AVATARS[id] = members[id].avatarUrl; });
                return Epic.computeStats(t, cardId, { activeCards: rich, lists: lists, archivedById: arch });
              }).then(function (s2) { return safePaint(cardId, s2, icon); }).catch(function () {});
            });
          });
        });
      });
    });
  }

  function paintParent(cardId, s, icon) {
    var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
    var body;
    if (!s.total) {
      body = '<p class="muted small">Пока нет подзадач — «+ Sub-task» создаст новую, «🔗 Привязать» добавит существующую.</p>';
    } else {
      // Group active sub-tasks by column (status); archived go to their own group.
      var groups = {}, order = [], archived = [];
      s.items.forEach(function (it) {
        if (it.archived) { archived.push(it); return; }
        if (!groups[it.list]) { groups[it.list] = []; order.push(it.list); }
        groups[it.list].push(it);
      });
      body = order.map(function (ln) {
        return '<div class="grp"><div class="grp-h">' + Views.esc(ln) + ' <span class="grp-n">' + groups[ln].length + '</span></div>' +
          '<div class="list">' + groups[ln].map(subRow).join('') + '</div></div>';
      }).join('');
      if (archived.length) {
        body += '<div class="grp"><div class="grp-h">📦 Архив <span class="grp-n">' + archived.length + '</span></div>' +
          '<div class="list">' + archived.map(subRow).join('') + '</div></div>';
      }
    }
    root.innerHTML =
      '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
      '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
      '<button class="btn primary" id="new">+ Sub-task</button>' +
      '<button class="btn" id="link">🔗 Привязать</button>' +
      '<button class="btn" id="un">Unmark</button></div>' + body;

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
    document.getElementById('link').addEventListener('click', function () { showLinkExisting(cardId); });
    document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
    debugFooter();
  }

  function showCreateForm(cardId) {
    busy = true;
    Promise.all([t.card('idList'), t.lists('id', 'name'), authed()]).then(function (r) {
      var cur = r[0], lists = r[1], isAuthed = r[2];
      var opts = lists.map(function (l) { return '<option value="' + l.id + '"' + (l.id === cur.idList ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>'; }).join('');
      root.innerHTML = backBar() +
        (isAuthed ? '' :
          '<p class="small" style="color:#974f0c;margin:0 0 6px">Создание новой карточки требует однократной авторизации Trello.</p>' +
          '<div class="actions" style="margin-bottom:8px"><button class="btn primary" id="auth">Authorize</button></div>') +
        '<label>Название новой подзадачи</label><input type="text" id="nm" placeholder="SUB - ..." autocomplete="off">' +
        '<label>Колонка</label><select id="ls">' + opts + '</select>' +
        '<div class="actions"><button class="btn primary" id="cr" disabled>Создать</button></div>' +
        '<p class="small muted" id="msg"></p>';
      wireBack();
      var au = document.getElementById('auth');
      if (au) au.addEventListener('click', function () { au.textContent = 'Открываю окно Trello…'; au.disabled = true; doAuthorize(function () { showCreateForm(cardId); }); });
      var nm = document.getElementById('nm'), cr = document.getElementById('cr');
      nm.addEventListener('input', function () { cr.disabled = !nm.value.trim() || !isAuthed; });
      if (isAuthed) nm.focus();
      cr.addEventListener('click', function () {
        cr.disabled = true; document.getElementById('msg').textContent = 'Создаю…';
        Epic.createSubtask(t, { name: nm.value.trim(), idList: document.getElementById('ls').value, parentId: cardId })
          .then(render)
          .catch(function (e) { document.getElementById('msg').textContent = (e.message === 'auth') ? 'Сначала Authorize.' : 'Ошибка: ' + e.message; cr.disabled = false; });
      });
      fit();
    });
  }

  function showLinkExisting(parentId) {
    busy = true;
    root.innerHTML = '<p class="muted small">Загрузка карточек…</p>';
    Promise.all([t.cards('id', 'name', 'idList'), t.lists('id', 'name'), Epic.getChildren(t, parentId)]).then(function (r) {
      var cards = r[0], lists = r[1], existing = r[2];
      var listName = {}; lists.forEach(function (l) { listName[l.id] = l.name; });
      var taken = {}; existing.forEach(function (id) { taken[id] = 1; }); taken[parentId] = 1;
      var candidates = cards.filter(function (c) { return !taken[c.id]; });

      function rowHtml(list) {
        var html = list.slice(0, LIMIT).map(function (c) {
          return '<button class="item" data-id="' + c.id + '"><span class="name">' + Views.esc(c.name) + '</span><span class="pill">' + Views.esc(listName[c.idList] || '') + '</span></button>';
        }).join('');
        if (list.length > LIMIT) html += '<p class="muted small">…показаны первые ' + LIMIT + '. Уточните поиском.</p>';
        return html || '<p class="muted small">Ничего не найдено.</p>';
      }
      function bind() {
        root.querySelectorAll('#cand .item').forEach(function (el) {
          el.addEventListener('click', function () { Epic.setParent(t, el.getAttribute('data-id'), parentId).then(render).catch(function () { render(); }); });
        });
      }

      root.innerHTML = backBar() +
        '<label>Привязать существующую карточку</label>' +
        '<input type="text" id="flt" placeholder="Поиск по названию…" autocomplete="off">' +
        '<div class="list" id="cand">' + rowHtml(candidates) + '</div>';
      wireBack(); bind();
      var flt = document.getElementById('flt');
      flt.addEventListener('input', function () {
        var q = flt.value.toLowerCase();
        document.getElementById('cand').innerHTML = rowHtml(candidates.filter(function (c) { return (c.name || '').toLowerCase().indexOf(q) >= 0; }));
        bind(); fit();
      });
      flt.focus();
      fit();
    });
  }

  function showIconPicker(cardId) {
    busy = true;
    var grid = Epic.ICON_PALETTE.map(function (e) { return '<button data-e="' + e + '">' + e + '</button>'; }).join('');
    root.innerHTML = backBar() + '<p class="small muted">Значок Subscription:</p><div class="grid">' + grid + '</div>';
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
      root.innerHTML =
        '<button class="item" data-url="' + Views.esc((p && p.url) || '') + '"><span>' + icon + '</span>' +
        '<span class="name">' + Views.esc(p ? p.name : '(archived)') + '</span>' +
        '<span class="pill">Subscription</span></button>' +
        '<div class="actions"><button class="btn danger" id="de">Detach</button></div>';
      root.querySelector('.item').addEventListener('click', function () { openCard(root.querySelector('.item').getAttribute('data-url'), parentId); });
      document.getElementById('de').addEventListener('click', function () { Epic.detach(t, cardId).then(render); });
      debugFooter();
    });
  }

  t.render(function () { if (!busy) render(); });
  render();
})();
