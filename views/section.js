/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — always-visible "Duck Epics" card-back section. Everything inline
 * (Trello does not open t.popup from a card-back-section iframe).
 *
 * Primary "+ Sub-task" = link an EXISTING board card (no auth, board pluginData).
 * "Создать новую" = create a card via REST (needs authorize; secondary).
 */
(function () {
  var t = TrelloPowerUp.iframe({ appKey: Epic.APP_KEY, appName: Epic.APP_NAME });
  var root;
  var busy = false;
  var LIMIT = 30;

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }
  function authed() {
    try { return t.getRestApi().isAuthorized().catch(function () { return false; }); }
    catch (e) { return Promise.resolve(false); }
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
      if (!subs.length) {
        root.innerHTML = '<p class="muted small">На доске ещё нет Subscription.</p><div class="actions"><button class="btn" id="bk">Назад</button></div>';
      } else {
        root.innerHTML = '<p class="small muted">Выберите Subscription:</p><div class="list">' +
          subs.map(function (id) { return '<button class="item" data-id="' + id + '"><span class="name">' + Views.esc(nameOf[id] || '(card)') + '</span></button>'; }).join('') +
          '</div><div class="actions"><button class="btn" id="bk">Отмена</button></div>';
        root.querySelectorAll('.item').forEach(function (el) {
          el.addEventListener('click', function () { Epic.setParent(t, cardId, el.getAttribute('data-id')).then(render).catch(function () { render(); }); });
        });
      }
      document.getElementById('bk').addEventListener('click', render);
      fit();
    });
  }

  // ---------- subscription (parent) ----------
  function renderParent(cardId) {
    return t.board('id')
      .then(function (b) { return Epic.fetchArchived(t, b.id); })
      .then(function (arch) { return Promise.all([Epic.computeStats(t, cardId, { archivedById: arch }), Epic.getIcon(t, cardId), authed()]); })
      .then(function (r) {
        var s = r[0], icon = r[1], isAuthed = r[2];
        var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
        var rows = s.items.map(function (it) {
          return '<button class="item ' + (it.archived ? 'archived' : '') + '" data-id="' + it.id + '">' +
            '<span class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</span>' +
            '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span></button>';
        }).join('');
        if (!s.total) rows = '<p class="muted small">Пока нет подзадач — нажмите «+ Sub-task».</p>';

        var authRow = isAuthed ? '' :
          '<p class="small muted" style="margin:8px 0 4px">Создание новых карточек и учёт архивных — по авторизации:</p>' +
          '<div class="actions"><button class="btn" id="auth">Authorize (опционально)</button></div>';

        root.innerHTML =
          '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
          '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
          '<button class="btn primary" id="link">+ Sub-task</button>' +
          '<button class="btn" id="new"' + (isAuthed ? '' : ' disabled title="Нужна авторизация"') + '>Создать новую</button>' +
          '<button class="btn" id="un">Unmark</button></div>' +
          '<div class="list">' + rows + '</div>' + authRow;

        root.querySelectorAll('.list .item').forEach(function (el) {
          el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
        });
        document.getElementById('ic').addEventListener('click', function () { showIconPicker(cardId); });
        document.getElementById('link').addEventListener('click', function () { showLinkExisting(cardId); });
        document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
        var nw = document.getElementById('new');
        if (nw && !nw.disabled) nw.addEventListener('click', function () { showCreateForm(cardId); });
        var au = document.getElementById('auth');
        if (au) au.addEventListener('click', function () { doAuthorize(); });
      });
  }

  // Link an existing board card as a sub-task (no auth needed).
  function showLinkExisting(parentId) {
    busy = true;
    root.innerHTML = '<p class="muted small">Загрузка карточек…</p>';
    Promise.all([t.cards('id', 'name', 'idList'), t.lists('id', 'name'), Epic.getChildren(t, parentId)]).then(function (r) {
      var cards = r[0], lists = r[1], existing = r[2];
      var listName = {}; lists.forEach(function (l) { listName[l.id] = l.name; });
      var taken = {}; existing.forEach(function (id) { taken[id] = 1; }); taken[parentId] = 1;
      var candidates = cards.filter(function (c) { return !taken[c.id]; });

      function rowHtml(list) {
        return list.slice(0, LIMIT).map(function (c) {
          return '<button class="item" data-id="' + c.id + '"><span class="name">' + Views.esc(c.name) + '</span><span class="pill">' + Views.esc(listName[c.idList] || '') + '</span></button>';
        }).join('') + (list.length > LIMIT ? '<p class="muted small">…показаны первые ' + LIMIT + '. Уточните поиском.</p>' : '') || '<p class="muted small">Ничего не найдено.</p>';
      }
      function bind() {
        root.querySelectorAll('#cand .item').forEach(function (el) {
          el.addEventListener('click', function () {
            Epic.setParent(t, el.getAttribute('data-id'), parentId).then(render).catch(function () { render(); });
          });
        });
      }

      root.innerHTML =
        '<label>Добавить существующую карточку как Sub-task</label>' +
        '<input type="text" id="flt" placeholder="Поиск по названию…" autocomplete="off">' +
        '<div class="list" id="cand">' + rowHtml(candidates) + '</div>' +
        '<div class="actions"><button class="btn" id="cx">Отмена</button></div>';
      bind();
      var flt = document.getElementById('flt');
      flt.addEventListener('input', function () {
        var q = flt.value.toLowerCase();
        var filtered = candidates.filter(function (c) { return (c.name || '').toLowerCase().indexOf(q) >= 0; });
        document.getElementById('cand').innerHTML = rowHtml(filtered);
        bind(); fit();
      });
      flt.focus();
      document.getElementById('cx').addEventListener('click', render);
      fit();
    });
  }

  function doAuthorize() {
    var au = document.getElementById('auth');
    if (au) { au.textContent = 'Открываю…'; au.disabled = true; }
    try {
      t.getRestApi().authorize({ scope: 'read,write', expiration: 'never' })
        .then(render)
        .catch(function () { if (au) { au.textContent = 'Authorize (опционально)'; au.disabled = false; } });
    } catch (e) { if (au) { au.textContent = 'Authorize (опционально)'; au.disabled = false; } }
  }

  function showCreateForm(cardId) {
    busy = true;
    Promise.all([t.card('idList'), t.lists('id', 'name')]).then(function (r) {
      var cur = r[0], lists = r[1];
      var opts = lists.map(function (l) { return '<option value="' + l.id + '"' + (l.id === cur.idList ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>'; }).join('');
      root.innerHTML =
        '<label>Название новой подзадачи</label><input type="text" id="nm" placeholder="SUB - ..." autocomplete="off">' +
        '<label>Колонка</label><select id="ls">' + opts + '</select>' +
        '<div class="actions"><button class="btn primary" id="cr" disabled>Создать</button>' +
        '<button class="btn" id="cx">Отмена</button></div><p class="small muted" id="msg"></p>';
      var nm = document.getElementById('nm');
      nm.addEventListener('input', function () { document.getElementById('cr').disabled = !nm.value.trim(); });
      nm.focus();
      document.getElementById('cr').addEventListener('click', function () {
        var btn = this; btn.disabled = true; document.getElementById('msg').textContent = 'Создаю…';
        Epic.createSubtask(t, { name: nm.value.trim(), idList: document.getElementById('ls').value, parentId: cardId })
          .then(render)
          .catch(function (e) {
            document.getElementById('msg').textContent = (e.message === 'auth') ? 'Сначала Authorize.' : 'Ошибка: ' + e.message;
            btn.disabled = false;
          });
      });
      document.getElementById('cx').addEventListener('click', render);
      fit();
    });
  }

  function showIconPicker(cardId) {
    busy = true;
    var grid = Epic.ICON_PALETTE.map(function (e) { return '<button data-e="' + e + '">' + e + '</button>'; }).join('');
    root.innerHTML = '<p class="small muted">Значок Subscription:</p><div class="grid">' + grid + '</div>' +
      '<div class="actions"><button class="btn" id="cx">Отмена</button></div>';
    root.querySelectorAll('.grid button').forEach(function (b) {
      b.addEventListener('click', function () { Epic.setIcon(t, cardId, b.getAttribute('data-e')).then(render); });
    });
    document.getElementById('cx').addEventListener('click', render);
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
