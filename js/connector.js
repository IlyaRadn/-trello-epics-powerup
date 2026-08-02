/* global TrelloPowerUp, Epic */
/*
 * connector.js — registers the Power-Up capabilities with Trello.
 * Wires capabilities (buttons, badges, sections, authorization) to the data
 * layer in js/lib.js.
 */
(function () {
  'use strict';

  var BASE = (function () {
    var s = document.querySelector('script[src*="connector.js"]');
    return s ? s.src.replace(/js\/connector\.js.*$/, '') : './';
  })();
  function url(p) { return BASE + p; }

  var ICON = url('assets/icon.svg');

  // Fast stats for badges: active cards only (Trello-cached), no REST per badge.
  function statsFor(t, cardId) {
    return Epic.computeStats(t, cardId);
  }

  // Never let a REST-auth check break the buttons: default to "authorized".
  function isAuthorizedSafe(t) {
    try { return t.getRestApi().isAuthorized().catch(function () { return true; }); }
    catch (e) { return Promise.resolve(true); }
  }

  TrelloPowerUp.initialize({
    // ---- card buttons ----
    'card-buttons': function (t) {
      return t.card('id').then(function (c) {
        var cardId = c.id;
        return Promise.all([Epic.isSubscription(t, cardId), Epic.getParent(t, cardId), isAuthorizedSafe(t)]).then(function (rr) {
          var isSub = rr[0], parent = rr[1], authed = rr[2];
          var buttons = [];

          buttons.push({
            icon: ICON, text: isSub ? 'Unmark Subscription' : 'Make Subscription',
            callback: function (t) {
              return t.card('id').then(function (c) {
                return isSub ? Epic.unmakeSubscription(t, c.id) : Epic.makeSubscription(t, c.id);
              }).then(function () { return t.closePopup(); });
            },
          });

          if (isSub) {
            buttons.push({
              icon: ICON, text: 'Add Sub-task',
              callback: function (t) { return t.popup({ title: 'Add Sub-task', url: url('views/create-subtask.html'), height: 300 }); },
            });
          }

          buttons.push({
            icon: ICON, text: parent ? 'Change parent' : 'Attach to Subscription',
            callback: function (t) { return t.popup({ title: 'Choose Subscription', url: url('views/choose-parent.html'), height: 300 }); },
          });

          if (!authed) {
            buttons.push({
              icon: ICON, text: 'Authorize Duck Epics',
              callback: function (t) { return t.popup({ title: 'Authorize Duck Epics', url: url('views/authorize.html'), height: 160 }); },
            });
          }
          return buttons;
        });
      });
    },

    // ---- badge on the closed card ----
    'card-badges': function (t) {
      return t.card('id').then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (isSub) {
            return Promise.all([statsFor(t, c.id), Epic.getIcon(t, c.id)]).then(function (rr) {
              var s = rr[0], icon = rr[1];
              var text = s.total ? (icon + ' ' + s.done + '/' + s.total + ' done') : icon;
              // Trello has no true-dark badge; use a bold valid color so it stands out
              // (green when fully done, blue while in progress).
              return [{ text: text, color: (s.total && s.done === s.total) ? 'green' : 'blue' }];
            });
          }
          return Epic.getParent(t, c.id).then(function (p) {
            if (!p) return [];
            return Promise.all([Epic.getIcon(t, p), t.cards('id', 'name')]).then(function (rr) {
              var pc = rr[1].filter(function (x) { return x.id === p; })[0];
              return [{ text: rr[0] + ' ' + (pc ? pc.name : 'Subscription') }];
            });
          });
        });
      });
    },

    // ---- badge on the open card detail ----
    'card-detail-badges': function (t) {
      return t.card('id').then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (!isSub) return [];
          return statsFor(t, c.id).then(function (s) {
            return [{ title: 'Sub-tasks', text: s.done + '/' + s.total + ' done', color: s.total && s.done === s.total ? 'green' : 'light-gray' }];
          });
        });
      });
    },

    // ---- section on the back of the card (ALWAYS shown; handles all states) ----
    // Put the card id in the URL so each card gets its OWN iframe (Trello otherwise
    // reuses the previous card's iframe on t.showCard navigation), and so the
    // section reads its true card id from the URL instead of a stale t.card().
    'card-back-section': function (t) {
      return t.card('id').then(function (c) {
        return {
          title: 'Duck Epics',
          icon: ICON,
          content: { type: 'iframe', url: t.signUrl(url('views/section.html?v=34&c=' + c.id)), height: 200 },
        };
      });
    },

    // ---- authorization ----
    'authorization-status': function (t) {
      return t.getRestApi().isAuthorized().then(function (authed) { return { authorized: authed }; });
    },
    'show-authorization': function (t) {
      return t.popup({ title: 'Authorize Duck Epics', url: url('views/authorize.html'), height: 160 });
    },
  }, {
    appKey: Epic.APP_KEY,
    appName: Epic.APP_NAME,
  });
})();
