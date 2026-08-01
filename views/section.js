/* global TrelloPowerUp, Epic, Views */
/*
 * section.js — the always-visible "Duck Epics" card-back section.
 * Handles all three states of a card:
 *   - Subscription  -> progress + list of sub-tasks (+ add / icon / unmark)
 *   - Sub-task      -> its parent Subscription (+ detach)
 *   - Unlinked      -> "Make Subscription" / "Attach to Subscription"
 */
(function () {
  var t = TrelloPowerUp.iframe();
  var root;

  function fit() { if (t.sizeTo) t.sizeTo(document.body); }

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
      t.popup({ title: 'Choose Subscription', url: './choose-parent.html', height: 300 });
    });
  }

  function renderParent(cardId) {
    return t.board('id')
      .then(function (b) { return Epic.fetchArchived(t, b.id); })
      .then(function (arch) {
        return Promise.all([Epic.computeStats(t, cardId, { archivedById: arch }), Epic.getIcon(t, cardId)]);
      })
      .then(function (r) {
        var s = r[0], icon = r[1];
        var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
        var rows = s.items.map(function (it) {
          return '<button class="item ' + (it.archived ? 'archived' : '') + '" data-id="' + it.id + '">' +
            '<span class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</span>' +
            '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span></button>';
        }).join('');
        if (!s.total) rows = '<p class="muted small">Пока нет подзадач — нажмите «+ Sub-task».</p>';

        root.innerHTML =
          '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
          '<div class="toolbar"><button class="iconbtn" id="ic" title="Значок">' + icon + '</button>' +
          '<button class="btn primary" id="add">+ Sub-task</button>' +
          '<button class="btn" id="un">Unmark</button></div>' +
          '<div class="list">' + rows + '</div>';

        root.querySelectorAll('.item').forEach(function (el) {
          el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
        });
        document.getElementById('ic').addEventListener('click', function () {
          t.popup({ title: 'Значок Subscription', url: './icon-picker.html', height: 260 });
        });
        document.getElementById('add').addEventListener('click', function () {
          t.popup({ title: 'Add Sub-task', url: './create-subtask.html', height: 300 });
        });
        document.getElementById('un').addEventListener('click', function () {
          Epic.unmakeSubscription(t, cardId).then(render);
        });
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
      document.getElementById('de').addEventListener('click', function () {
        Epic.detach(t, cardId).then(render);
      });
    });
  }

  // Re-render when the popups close and change data.
  t.render(function () { render(); });
  render();
})();
