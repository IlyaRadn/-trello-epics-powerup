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

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }
  function authed() { return Epic.getToken(t).then(function (tok) { return !!tok; }).catch(function () { return false; }); }

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
    root.innerHTML = '<p class="muted small">Загрузка…</p>';
    return t.card('id').then(function (c) {
      var cardId = c.id;
      return Promise.all([Epic.isSubscription(t, cardId), Epic.getParent(t, cardId)]).then(function (r) {
        if (r[0]) return renderParent(cardId);
        if (r[1]) return renderChild(cardId, r[1]);
        return renderNone(cardId);
      });
    }).then(fit).catch(function (e) {
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
    // Fetch cards/lists once; only hit REST for archived if a child is missing
    // from the active set (big speed win on large boards).
    return Promise.all([t.cards('id', 'name', 'idList', 'closed'), t.lists('id', 'name'), Epic.getChildren(t, cardId), Epic.getIcon(t, cardId)])
      .then(function (r0) {
        var active = r0[0], lists = r0[1], childIds = r0[2], icon = r0[3];
        var have = {}; active.forEach(function (c) { have[c.id] = 1; });
        var missing = childIds.some(function (id) { return !have[id]; });
        var archP = missing ? t.board('id').then(function (b) { return Epic.fetchArchived(t, b.id); }) : Promise.resolve({});
        return archP.then(function (arch) {
          return Epic.computeStats(t, cardId, { activeCards: active, lists: lists, archivedById: arch }).then(function (s) { return [s, icon]; });
        });
      })
      .then(function (r) {
        var s = r[0], icon = r[1];
        var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
        var rows = s.items.map(function (it) {
          return '<button class="item ' + (it.archived ? 'archived' : '') + '" data-id="' + it.id + '">' +
            '<span class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</span>' +
            '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span></button>';
        }).join('');
        if (!s.total) rows = '<p class="muted small">Пока нет подзадач — «+ Sub-task» создаст новую, «🔗 Привязать» добавит существующую.</p>';

        root.innerHTML =
          '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
          '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
          '<button class="btn primary" id="new">+ Sub-task</button>' +
          '<button class="btn" id="link">🔗 Привязать</button>' +
          '<button class="btn" id="un">Unmark</button></div>' +
          '<div class="list">' + rows + '</div>';

        root.querySelectorAll('.list .item').forEach(function (el) {
          el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
        });
        document.getElementById('ic').addEventListener('click', function () { showIconPicker(cardId); });
        document.getElementById('new').addEventListener('click', function () { showCreateForm(cardId); });
        document.getElementById('link').addEventListener('click', function () { showLinkExisting(cardId); });
        document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
      });
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
    return Promise.all([Epic.getIcon(t, parentId), t.cards('id', 'name')]).then(function (r) {
      var icon = r[0], cards = r[1];
      var p = cards.filter(function (x) { return x.id === parentId; })[0];
      root.innerHTML =
        '<button class="item" data-id="' + parentId + '"><span>' + icon + '</span>' +
        '<span class="name">' + Views.esc(p ? p.name : '(archived)') + '</span>' +
        '<span class="pill">Subscription</span></button>' +
        '<div class="actions"><button class="btn danger" id="de">Detach</button></div>';
      root.querySelector('.item').addEventListener('click', function () { t.showCard(parentId); });
      document.getElementById('de').addEventListener('click', function () { Epic.detach(t, cardId).then(render); });
    });
  }

  t.render(function () { if (!busy) render(); });
  render();
})();
