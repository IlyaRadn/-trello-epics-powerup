/* global TrelloPowerUp, Epic */
/*
 * connector.js — registers the Power-Up capabilities with Trello.
 *
 * Capabilities are fleshed out step by step (S2 buttons, S6 badges,
 * S7/S8 sections). This file wires them to the data layer in js/lib.js.
 */
(function () {
  'use strict';

  // Monochrome icon for card buttons / sections.
  var ICON =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect x='3' y='3' width='18' height='18' rx='4' fill='%23172b4d'/%3E%3Crect x='7' y='7' width='10' height='2.5' rx='1' fill='white'/%3E%3Crect x='7' y='11' width='7' height='2.5' rx='1' fill='white'/%3E%3C/svg%3E";

  var BASE = (function () {
    // Absolute base URL of this Power-Up (for building popup/section URLs).
    var s = document.querySelector('script[src*="connector.js"]');
    return s ? s.src.replace(/js\/connector\.js.*$/, '') : './';
  })();
  function url(p) { return BASE + p; }

  TrelloPowerUp.initialize({
    // ---- S2: card buttons (Make Subscription / parent linking) ----
    'card-buttons': function (t) {
      return Promise.all([
        t.card('id').then(function (c) { return Epic.isSubscription(t, c.id); }),
        t.card('id').then(function (c) { return Epic.getParent(t, c.id); }),
      ]).then(function (r) {
        var isSub = r[0], parent = r[1];
        var buttons = [];

        buttons.push({
          icon: ICON,
          text: isSub ? 'Unmark Subscription' : 'Make Subscription',
          callback: function (t) {
            return t.card('id').then(function (c) {
              return isSub ? Epic.unmakeSubscription(t, c.id) : Epic.makeSubscription(t, c.id);
            }).then(function () { return t.closePopup(); });
          },
        });

        if (isSub) {
          buttons.push({
            icon: ICON, text: 'Add Sub-task',
            callback: function (t) { return t.popup({ title: 'Add Sub-task', url: url('views/create-subtask.html'), height: 280 }); },
          });
        }

        buttons.push({
          icon: ICON,
          text: parent ? 'Change parent' : 'Attach to Subscription',
          callback: function (t) { return t.popup({ title: 'Choose Subscription', url: url('views/choose-parent.html'), height: 280 }); },
        });

        return buttons;
      });
    },

    // ---- S6: badges on the closed card ----
    'card-badges': function (t) {
      return t.card('id').then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (isSub) {
            return Epic.computeStats(t, c.id).then(function (s) {
              if (!s.total) return [];
              return [{ text: s.done + '/' + s.total, color: s.done === s.total ? 'green' : 'blue' }];
            });
          }
          return Epic.getParent(t, c.id).then(function (p) {
            if (!p) return [];
            return Epic.getIcon(t, p).then(function (icon) { return [{ text: icon + ' Subscription' }]; });
          });
        });
      });
    },

    // ---- S6: badge on the open card detail ----
    'card-detail-badges': function (t) {
      return t.card('id').then(function (c) {
        return Epic.isSubscription(t, c.id).then(function (isSub) {
          if (!isSub) return [];
          return Epic.computeStats(t, c.id).then(function (s) {
            return [{ title: 'Sub-tasks', text: s.done + '/' + s.total + ' done', color: s.total && s.done === s.total ? 'green' : 'light-gray' }];
          });
        });
      });
    },

    // ---- S7/S8: sections on the back of the card ----
    'card-back-section': function (t) {
      return t.card('id').then(function (c) {
        return Promise.all([Epic.isSubscription(t, c.id), Epic.getParent(t, c.id)]).then(function (r) {
          var isSub = r[0], parent = r[1];
          if (isSub) return { title: 'Subscription — Sub-tasks', icon: ICON, content: { type: 'iframe', url: t.signUrl(url('views/parent-section.html')), height: 240 } };
          if (parent) return { title: 'Part of Subscription', icon: ICON, content: { type: 'iframe', url: t.signUrl(url('views/child-section.html')), height: 120 } };
          return null;
        });
      });
    },
  });
})();
