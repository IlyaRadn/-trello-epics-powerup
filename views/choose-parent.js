/* global Epic, Views */
/* S3 — popup: attach the current card to a Subscription (or detach). */
Views.chooseParent = function (t, root) {
  root.innerHTML = '<p class="muted small">Loading…</p>';
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
      root.innerHTML = '<p class="muted small">No Subscriptions on this board yet.<br>' +
        'Open a client card and click "Make Subscription".</p>';
      if (t.sizeTo) t.sizeTo(document.body);
      return;
    }

    var html = '<div class="list">' + opts.map(function (id) {
      return '<button class="item ' + (id === current ? 'selected' : '') + '" data-id="' + id + '">' +
        '<span class="name">' + Views.esc(nameOf[id] || '(card)') + '</span>' +
        (id === current ? '<span class="pill done">current</span>' : '') + '</button>';
    }).join('') + '</div>';
    if (current) html += '<div class="actions"><button class="btn danger" id="detach">Detach from Subscription</button></div>';
    html += '<p class="small muted" id="msg"></p>';
    root.innerHTML = html;

    root.querySelectorAll('.item').forEach(function (el) {
      el.addEventListener('click', function () {
        Epic.setParent(t, selfId, el.getAttribute('data-id'))
          .then(function () { return t.closePopup(); })
          .catch(function (e) {
            root.querySelector('#msg').textContent = (e.message === 'cycle')
              ? 'Not allowed: this would create a cycle.' : 'Error: ' + e.message;
          });
      });
    });
    var d = root.querySelector('#detach');
    if (d) d.addEventListener('click', function () { Epic.detach(t, selfId).then(function () { return t.closePopup(); }); });
    if (t.sizeTo) t.sizeTo(document.body);
  });
};
Views.boot('chooseParent');
