/* global TrelloPowerUp, Epic */
/*
 * authorize.js — the "Authorize account" popup (Settings → Log in, and the
 * "Authorize Duck Epics" card button). Uses the SAME custom OAuth flow as the
 * card-back section: open Trello's authorize page in a real window, capture the
 * token via views/auth-return.html (postMessage), and store it member-private
 * as `duckToken`. This is the token the whole app reads (Epic.getToken) — the
 * Trello-managed REST token is intentionally NOT used here.
 */
(function () {
  var t = TrelloPowerUp.iframe({ appKey: Epic.APP_KEY, appName: Epic.APP_NAME });
  function L(k) { return Epic.L(k); }
  var root;
  function fit() { try { if (t.sizeTo) { var p = t.sizeTo(document.body); if (p && p.catch) p.catch(function () {}); } } catch (e) {} }

  function doAuthorize(onDone) {
    var ret = location.href.replace(/[^/]*$/, '') + 'auth-return.html';
    var u = 'https://trello.com/1/authorize?expiration=never&scope=read,write&name=Duck%20Epics' +
      '&response_type=token&key=' + encodeURIComponent(Epic.APP_KEY) +
      '&return_url=' + encodeURIComponent(ret) + '&callback_method=fragment';
    window.open(u, 'duckauth', 'width=500,height=760');
    function handler(e) {
      if (e && e.data && e.data.duckToken) {
        window.removeEventListener('message', handler);
        Epic.setToken(t, e.data.duckToken).then(function () { if (onDone) onDone(); });
      }
    }
    window.addEventListener('message', handler);
  }

  function render(authed) {
    root = document.getElementById('root');
    if (authed) {
      root.innerHTML =
        '<p class="small">✅ ' + L('authorized_ok') + '</p>' +
        '<div class="actions"><button class="btn" id="logout">' + L('logout') + '</button>' +
        '<button class="btn primary" id="close">' + L('close') + '</button></div>';
      document.getElementById('close').addEventListener('click', function () { t.closePopup(); });
      document.getElementById('logout').addEventListener('click', function () {
        Epic.clearToken(t).then(function () { render(false); });
      });
    } else {
      root.innerHTML =
        '<p class="small muted">' + L('auth_grant') + '</p>' +
        '<div class="actions"><button class="btn primary" id="auth">' + L('authorize') + '</button></div>' +
        '<p class="small muted" id="msg"></p>';
      document.getElementById('auth').addEventListener('click', function () {
        document.getElementById('msg').textContent = L('opening_trello');
        doAuthorize(function () { render(true); });
      });
    }
    fit();
  }

  // Load the viewer's language, then render from OUR token state. Any failure
  // still renders the un-authorized view (never a blank popup).
  Epic.loadMessages(t)
    .then(function () { return Epic.getToken(t); })
    .then(function (tok) { render(!!tok); })
    .catch(function () { render(false); });
})();
