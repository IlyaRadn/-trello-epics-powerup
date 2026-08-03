/* global TrelloPowerUp, Epic */
/* S5 — authorize the Power-Up to use the Trello REST API (archived cards + card creation). */
(function () {
  var t = TrelloPowerUp.iframe();
  function render(authed) {
    var root = document.getElementById('root');
    if (authed) {
      root.innerHTML = '<p>✅ Duck Epics authorized.</p><div class="actions"><button class="btn" id="close">Close</button></div>';
      document.getElementById('close').addEventListener('click', function () { t.closePopup(); });
    } else {
      root.innerHTML =
        '<p class="small muted">Grant Trello access to count archived cards and create sub-tasks.</p>' +
        '<div class="actions"><button class="btn primary" id="auth">Authorize</button></div>' +
        '<p class="small muted" id="msg"></p>';
      document.getElementById('auth').addEventListener('click', function () {
        document.getElementById('msg').textContent = 'Opening Trello window…';
        t.getRestApi().authorize({ scope: { read: true, write: true }, expiration: 'never' })
          .then(function () { return t.closePopup(); })
          .catch(function (e) { document.getElementById('msg').textContent = 'Failed: ' + (e && e.message || e); });
      });
    }
    if (t.sizeTo) t.sizeTo(document.body);
  }
  t.getRestApi().isAuthorized().then(render);
})();
