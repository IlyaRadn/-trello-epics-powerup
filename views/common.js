/* Shared helpers for view iframes. Each view defines Views.<name>(t, root). */
window.Views = window.Views || {};

Views.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
};

// Auto-run a view against the real Trello iframe — unless the mock harness
// drives it directly (it sets window.__MOCK_BOOT__ = true).
Views.boot = function (name) {
  if (window.__MOCK_BOOT__) return;
  function go() { Views[name](TrelloPowerUp.iframe(), document.getElementById('root')); }
  if (document.readyState !== 'loading') go();
  else document.addEventListener('DOMContentLoaded', go);
};
