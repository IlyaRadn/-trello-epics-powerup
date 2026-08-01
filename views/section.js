/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — the always-visible "Duck Epics" card-back section.
 *   Subscription -> progress + sub-tasks (+ add / icon / unmark / authorize)
 *   Sub-task     -> its parent (+ detach)
 *   Unlinked     -> Make Subscription / Attach to Subscription
 */
(function () {
  var t = TrelloPowerUp.iframe();
  // Absolute base of this /views/ folder, so popup URLs resolve reliably.
  var HERE = location.href.replace(/[^/]*$/, '');
  function vurl(p) { return HERE + p; }
  var root;

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }
  function authed() {
    try { return t.getRestApi().isAuthorized().catch(function () { return false; }); }
    catch (e) { return Promise.resolve(false); }
  }
  function popup(title, page, height) {
    return t.popup({ title: title, url: vurl(page), height: height || 300 });
  }

  function render() {
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

  function renderNone(cardId) {
    root.innerHTML =
      '<p class="muted small">Эта карточка не связана.</p>' +
      '<div class="actions">' +
      '<button class="btn primary" id="mk">Make Subscription</button>' +
      '<button class="btn" id="at">Attach to Subscription</button></div>';
    document.getElementById('mk').addEventListener('click', function () {
      Epic.makeSubscription(t, cardId).then(render);
    });
    document.getElementById('at').addEventListener('click', function () {
      popup('Choose Subscription', 'choose-parent.html');
    });
  }

  function renderParent(cardId) {
    return t.board('id')
      .then(function (b) { return Epic.fetchArchived(t, b.id); })
      .then(function (arch) {
        return Promise.all([Epic.computeStats(t, cardId, { archivedById: arch }), Epic.getIcon(t, cardId), authed()]);
      })
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
          '<p class="small" style="color:#974f0c;margin:8px 0 4px">Для создания подзадач нужна авторизация Trello.</p>' +
          '<div class="actions"><button class="btn primary" id="auth">Authorize</button></div>';

        root.innerHTML =
          '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
          '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
          '<button class="btn primary" id="add"' + (isAuthed ? '' : ' disabled') + '>+ Sub-task</button>' +
          '<button class="btn" id="un">Unmark</button></div>' +
          authRow +
          '<div class="list">' + rows + '</div>';

        root.querySelectorAll('.item').forEach(function (el) {
          el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
        });
        document.getElementById('ic').addEventListener('click', function () { popup('Значок Subscription', 'icon-picker.html', 260); });
        var add = document.getElementById('add');
        if (add && !add.disabled) add.addEventListener('click', function () { popup('Add Sub-task', 'create-subtask.html'); });
        document.getElementById('un').addEventListener('click', function () { Epic.unmakeSubscription(t, cardId).then(render); });
        var au = document.getElementById('auth');
        if (au) au.addEventListener('click', function () { popup('Authorize Duck Epics', 'authorize.html', 170); });
      });
  }

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

  t.render(function () { render(); });
  render();
})();
