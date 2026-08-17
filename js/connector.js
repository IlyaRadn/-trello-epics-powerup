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

  // Authorized == we hold our own OAuth token (duckToken), the same token the
  // whole app reads. NOT the Trello-managed REST token.
  function isAuthorizedSafe(t) {
    return Epic.getToken(t).then(function (tok) { return !!tok; }).catch(function () { return false; });
  }

  TrelloPowerUp.initialize({
    // ---- card buttons ----
    'card-buttons': function (t) {
      return Epic.loadMessages(t).then(function () { return t.card('id'); }).then(function (c) {
        var cardId = c.id;
        return Promise.all([Epic.isSubscription(t, cardId), Epic.getParent(t, cardId), isAuthorizedSafe(t)]).then(function (rr) {
          var isSub = rr[0], parent = rr[1], authed = rr[2];
          var buttons = [];

          buttons.push({
            icon: ICON, text: Epic.L(isSub ? 'unmark_subscription' : 'make_subscription'),
            callback: function (t) {
              return t.card('id').then(function (c) {
                return isSub ? Epic.unmakeSubscription(t, c.id) : Epic.makeSubscription(t, c.id);
              }).then(function () { return t.closePopup(); });
            },
          });

          if (isSub) {
            buttons.push({
              icon: ICON, text: Epic.L('add_subtask'),
              callback: function (t) { return t.popup({ title: Epic.L('add_subtask'), url: url('views/create-subtask.html'), height: 300 }); },
            });
          }

          buttons.push({
            icon: ICON, text: Epic.L(parent ? 'change_parent' : 'attach_to_subscription'),
            callback: function (t) { return t.popup({ title: Epic.L('choose_subscription_title'), url: url('views/choose-parent.html'), height: 300 }); },
          });

          if (!authed) {
            buttons.push({
              icon: ICON, text: Epic.L('authorize_duck'),
              callback: function (t) { return t.popup({ title: Epic.L('authorize_duck'), url: url('views/authorize.html?v=78'), height: 160 }); },
            });
          }
          return buttons;
        });
      }).catch(function () { return []; });
    },

    // ---- badge on the closed card ----
    'card-badges': function (t) {
      return Epic.loadMessages(t).then(function () { return t.card('id'); }).then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (isSub) {
            return Promise.all([statsFor(t, c.id), Epic.getIcon(t, c.id)]).then(function (rr) {
              var s = rr[0], icon = rr[1];
              var text = s.total ? (icon + ' ' + s.done + '/' + s.total + ' ' + Epic.L('done')) : icon;
              // Trello has no true-dark badge; use a bold valid color so it stands out
              // (green when fully done, blue while in progress).
              return [{ text: text, color: (s.total && s.done === s.total) ? 'green' : 'blue' }];
            });
          }
          return Epic.getParent(t, c.id).then(function (p) {
            if (!p) return [];
            // Show the parent Subscription's (client) name. Read it from the child's OWN
            // denormalized data — badges can't reliably read another card's pluginData/name.
            return Epic.getParentBadge(t, c.id).then(function (b) {
              if (b.name) return [{ text: (b.icon ? b.icon + ' ' : '') + b.name }];
              // Not denormalized yet — fall back to the client-cached board cards for the name.
              return t.cards('id', 'name').then(function (cs) {
                var pc = cs.filter(function (x) { return x.id === p; })[0];
                return [{ text: (b.icon ? b.icon + ' ' : '') + (pc ? pc.name : Epic.L('subscription')) }];
              }).catch(function () { return [{ text: (b.icon ? b.icon + ' ' : '') + Epic.L('subscription') }]; });
            });
          });
        });
      }).catch(function () { return []; });
    },

    // ---- badge on the open card detail ----
    'card-detail-badges': function (t) {
      return Epic.loadMessages(t).then(function () { return t.card('id'); }).then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (!isSub) return [];
          return statsFor(t, c.id).then(function (s) {
            return [{ title: Epic.L('subtasks'), text: s.done + '/' + s.total + ' ' + Epic.L('done'), color: s.total && s.done === s.total ? 'green' : 'light-gray' }];
          });
        });
      }).catch(function () { return []; });
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
          content: { type: 'iframe', url: t.signUrl(url('views/section.html?v=78&c=' + c.id)), height: 200 },
        };
      });
    },

    // ---- authorization ----
    'authorization-status': function (t) {
      return Epic.getToken(t).then(function (tok) { return { authorized: !!tok }; }).catch(function () { return { authorized: false }; });
    },
    'show-authorization': function (t) {
      return Epic.loadMessages(t).then(function () {
        return t.popup({ title: Epic.L('authorize_duck'), url: url('views/authorize.html?v=78'), height: 160 });
      });
    },
  }, {
    appKey: Epic.APP_KEY,
    appName: Epic.APP_NAME,
  });
})();
