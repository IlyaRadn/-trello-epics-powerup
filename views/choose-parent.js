/* global Epic, Views */
/* S3 — popup: attach the current card to a Subscription (or detach). */
Views.chooseParent = function (t, root) {
  root.innerHTML = '<p class="muted small">Загрузка…</p>';
  var selfId;
  return t.card('id').then(function (c) {
    selfId = c.id;
    return Promise.all([Epic.listSubscriptions(t), Epic.getParent(t, selfId), t.cards('id', 'name')]);
  }).then(function (r) {
    var subs = r[0], current = r[1], cards = r[2];
    var nameOf = {};
    cards.forEach(function (x) { nameOf[x.id] = x.name; });
    var opts = subs.filter(function (id) { return id !== selfId; });

    if (!opts.length) {
      root.innerHTML = '<p class="muted small">На доске ещё нет Subscription.<br>' +
        'Откройте карточку-клиент и нажмите «Make Subscription».</p>';
      if (t.sizeTo) t.sizeTo(document.body);
      return;
    }

    var html = '<div class="list">' + opts.map(function (id) {
      return '<button class="item ' + (id === current ? 'selected' : '') + '" data-id="' + id + '">' +
        '<span class="name">' + Views.esc(nameOf[id] || '(card)') + '</span>' +
        (id === current ? '<span class="pill done">текущий</span>' : '') + '</button>';
    }).join('') + '</div>';
    if (current) html += '<div class="actions"><button class="btn danger" id="detach">Отвязать от Subscription</button></div>';
    html += '<p class="small muted" id="msg"></p>';
    root.innerHTML = html;

    root.querySelectorAll('.item').forEach(function (el) {
      el.addEventListener('click', function () {
        Epic.setParent(t, selfId, el.getAttribute('data-id'))
          .then(function () { return t.closePopup(); })
          .catch(function (e) {
            root.querySelector('#msg').textContent = (e.message === 'cycle')
              ? 'Нельзя: получится циклическая связь.' : 'Ошибка: ' + e.message;
          });
      });
    });
    var d = root.querySelector('#detach');
    if (d) d.addEventListener('click', function () { Epic.detach(t, selfId).then(function () { return t.closePopup(); }); });
    if (t.sizeTo) t.sizeTo(document.body);
  });
};
Views.boot('chooseParent');
