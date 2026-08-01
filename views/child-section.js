/* global Epic, Views */
/* S8 — Sub-task card back section: shows the parent Subscription. */
Views.childSection = function (t, root) {
  root.innerHTML = '<p class="muted small">Загрузка…</p>';
  var selfId;
  return t.card('id').then(function (c) {
    selfId = c.id;
    return Epic.getParent(t, selfId);
  }).then(function (pid) {
    if (!pid) { root.innerHTML = '<p class="muted small">Не привязано к Subscription.</p>'; return; }
    return Promise.all([Epic.getIcon(t, pid), t.cards('id', 'name')]).then(function (r) {
      var icon = r[0], cards = r[1];
      var p = cards.filter(function (x) { return x.id === pid; })[0];
      var name = p ? p.name : '(archived Subscription)';
      root.innerHTML =
        '<button class="item" data-id="' + pid + '">' +
        '<span style="font-size:16px">' + icon + '</span>' +
        '<span class="name">' + Views.esc(name) + '</span>' +
        '<span class="pill">Subscription</span></button>';
      root.querySelector('.item').addEventListener('click', function () { t.showCard(pid); });
      if (t.sizeTo) t.sizeTo(document.body);
    });
  });
};
Views.boot('childSection');
