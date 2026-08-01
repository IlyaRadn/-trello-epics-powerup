/* global Epic, Views */
/* S7 — Subscription card back section: progress + list of sub-tasks. */
Views.parentSection = function (t, root) {
  root.innerHTML = '<p class="muted small">Загрузка…</p>';
  var cardId;
  return t.card('id').then(function (c) {
    cardId = c.id;
    return t.board('id');
  }).then(function (b) {
    return Epic.fetchArchived(t, b.id); // {} when not authorized (pre-S5)
  }).then(function (archived) {
    return Promise.all([
      Epic.computeStats(t, cardId, { archivedById: archived }),
      Epic.getIcon(t, cardId),
    ]);
  }).then(function (r) {
    var s = r[0], icon = r[1];
    var pct = s.total ? Math.round(100 * s.done / s.total) : 0;
    var rows = s.items.map(function (it) {
      return '<button class="item ' + (it.archived ? 'archived' : '') + '" data-id="' + it.id + '">' +
        '<span class="name">' + Views.esc(it.name) + (it.archived ? ' 📦' : '') + '</span>' +
        '<span class="pill ' + (it.done ? 'done' : '') + '">' + Views.esc(it.list) + '</span></button>';
    }).join('');
    if (!s.total) rows = '<p class="muted small">Пока нет подзадач. Нажмите «Add Sub-task» на карточке.</p>';

    root.innerHTML =
      '<div class="progress"><b style="font-size:16px">' + icon + '</b>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="small muted">' + s.done + '/' + s.total + ' done</span></div>' +
      '<div class="toolbar"><button class="iconbtn" id="chIcon" title="Сменить значок">' + icon + '</button>' +
      '<span class="small muted">Sub-tasks</span></div>' +
      '<div class="list">' + rows + '</div>';

    root.querySelectorAll('.item').forEach(function (el) {
      el.addEventListener('click', function () { t.showCard(el.getAttribute('data-id')); });
    });
    root.querySelector('#chIcon').addEventListener('click', function () {
      t.popup({ title: 'Значок Subscription', url: './icon-picker.html', height: 260 });
    });
    if (t.sizeTo) t.sizeTo(document.body);
  });
};
Views.boot('parentSection');
