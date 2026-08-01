/* global TrelloPowerUp, Epic */
/* S5 — authorize the Power-Up to use the Trello REST API (archived cards + card creation). */
(function () {
  var t = TrelloPowerUp.iframe();
  function render(authed) {
    var root = document.getElementById('root');
    if (authed) {
      root.innerHTML = '<p>✅ Duck Epics авторизован.</p><div class="actions"><button class="btn" id="close">Закрыть</button></div>';
      document.getElementById('close').addEventListener('click', function () { t.closePopup(); });
    } else {
      root.innerHTML =
        '<p class="small muted">Разреши доступ к Trello, чтобы учитывать архивные карточки и создавать подзадачи.</p>' +
        '<div class="actions"><button class="btn primary" id="auth">Authorize</button></div>' +
        '<p class="small muted" id="msg"></p>';
      document.getElementById('auth').addEventListener('click', function () {
        document.getElementById('msg').textContent = 'Открываю окно Trello…';
        t.getRestApi().authorize({ scope: { read: true, write: true }, expiration: 'never' })
          .then(function () { return t.closePopup(); })
          .catch(function (e) { document.getElementById('msg').textContent = 'Не удалось: ' + (e && e.message || e); });
      });
    }
    if (t.sizeTo) t.sizeTo(document.body);
  }
  t.getRestApi().isAuthorized().then(render);
})();
