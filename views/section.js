/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — the always-visible "Duck Epics" card-back section.
 * Everything is inline (no t.popup, which Trello does not open from a
 * card-back-section iframe): authorize, create sub-task, icon picker, attach.
 */
(function () {
  var t = TrelloPowerUp.iframe();
  var root;
  var busy = false; // a form is open — don't let t.render wipe it

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
    root.innerHTML = '<p class="muted small">Загрузка…</p>';
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
          '<p class="small" style="color:#974f0c;margin:8px 0 4px">Для создания подзадач и учёта архивных нужна авторизация Trello.</p>' +
          '<div class="actions"><button class="btn primary" id="auth">Authorize</button></div>';

        root.innerHTML =
          '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
          '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
          '<button class="btn primary" id="add"' + (isAuthed ? '' : ' disabled title="Сначала Authorize"') + '>+ Sub-task</button>' +
          '<button class="btn" id="un">Unmark</button></div>' +
          authRow + '<div class="list">' + rows + '</div>';

        root.querySelectorAll('.item').forEach(function (el) {
          el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
        });
        document.getElementById('ic').addEventListener('click', function () { showIconPicker(cardId); });
        document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
        var add = document.getElementById('add');
        if (add && !add.disabled) add.addEventListener('click', function () { showCreateForm(cardId); });
        var au = document.getElementById('auth');
        if (au) au.addEventListener('click', function () { doAuthorize(); });
      });
  }

  function doAuthorize() {
    var au = document.getElementById('auth');
    if (au) { au.textContent = 'Открываю окно Trello…'; au.disabled = true; }
    try {
      t.getRestApi().authorize({ scope: 'read,write', expiration: 'never' })
        .then(render)
        .catch(function (e) { if (au) { au.textContent = 'Authorize'; au.disabled = false; } });
    } catch (e) { if (au) { au.textContent = 'Authorize'; au.disabled = false; } }
  }

  function showCreateForm(cardId) {
    busy = true;
    Promise.all([t.card('idList'), t.lists('id', 'name')]).then(function (r) {
      var cur = r[0], lists = r[1];
      var opts = lists.map(function (l) { return '<option value="' + l.id + '"' + (l.id === cur.idList ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>'; }).join('');
      root.innerHTML =
        '<label>Название подзадачи</label><input type="text" id="nm" placeholder="SUB - ..." autocomplete="off">' +
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
            document.getElementById('msg').textContent = (e.message === 'auth') ? 'Сначала нажмите Authorize.' : 'Ошибка: ' + e.message;
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
