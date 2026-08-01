/* global Epic, Views */
/* S2 — popup: pick the Subscription's icon (palette + custom emoji). */
Views.iconPicker = function (t, root) {
  var cardId;
  return t.card('id').then(function (c) {
    cardId = c.id;
    return Epic.getIcon(t, cardId);
  }).then(function (cur) {
    var grid = Epic.ICON_PALETTE.map(function (e) {
      return '<button class="' + (e === cur ? 'sel' : '') + '" data-e="' + e + '">' + e + '</button>';
    }).join('');
    root.innerHTML =
      '<div class="grid">' + grid + '</div>' +
      '<label>Или свой эмодзи</label>' +
      '<input type="text" id="custom" maxlength="4" placeholder="😀 и Enter">';

    root.querySelectorAll('.grid button').forEach(function (b) {
      b.addEventListener('click', function () {
        Epic.setIcon(t, cardId, b.getAttribute('data-e')).then(function () { return t.closePopup(); });
      });
    });
    root.querySelector('#custom').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        var v = ev.target.value.trim();
        if (v) Epic.setIcon(t, cardId, v).then(function () { return t.closePopup(); });
      }
    });
    if (t.sizeTo) t.sizeTo(document.body);
  });
};
Views.boot('iconPicker');
