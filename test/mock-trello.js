/*
 * mock-trello.js — a tiny fake of the Trello Power-Up `t` client for local
 * testing without Trello. Implements only the subset our code uses.
 *
 * createMockTrello(seed) -> { t, db, currentCard(id) }
 *   db.boardPlugin : board-scoped 'shared' pluginData (key -> value)
 *   db.lists       : [{id, name}]
 *   db.cards       : [{id, name, idList, closed}]
 */
(function (global) {
  'use strict';

  function defaultSeed() {
    return {
      board: { id: 'board_ddmc', name: 'Duck.design Mission Control' },
      lists: [
        { id: 'l_backlog', name: 'Backlog' },
        { id: 'l_inprogress', name: 'In progress' },
        { id: 'l_review', name: 'Review' },
        { id: 'l_completed', name: 'Completed Tasks' },
        { id: 'l_sub', name: 'Подписка' },
      ],
      cards: [
        { id: 'c_parent', name: 'Desri', idList: 'l_sub', closed: false },
        { id: 'c_k1', name: 'SUB - logo', idList: 'l_backlog', closed: false },
        { id: 'c_k2', name: 'SUB - web', idList: 'l_inprogress', closed: false },
        { id: 'c_k3', name: 'SUB - brandbook', idList: 'l_completed', closed: false },
        { id: 'c_k4', name: 'SUB - old (archived, in completed)', idList: 'l_completed', closed: true },
        { id: 'c_other', name: 'Unrelated card', idList: 'l_review', closed: false },
      ],
      boardPlugin: {},
    };
  }

  function createMockTrello(seed) {
    var db = seed || defaultSeed();
    var current = db.cards[0].id;

    function findCard(id) {
      for (var i = 0; i < db.cards.length; i++) if (db.cards[i].id === id) return db.cards[i];
      return null;
    }

    var t = {
      // ----- pluginData (only 'board'/'shared' is exercised by lib.js) -----
      get: function (scope, vis, key) {
        if (scope === 'board') return Promise.resolve(db.boardPlugin[key]);
        // 'card' scope on a specific id or the current card
        var cid = (scope === 'card') ? current : scope;
        var bag = (db.cardPlugin && db.cardPlugin[cid]) || {};
        return Promise.resolve(bag[key]);
      },
      set: function (scope, vis, key, value) {
        if (scope === 'board') { db.boardPlugin[key] = value; return Promise.resolve(); }
        var cid = (scope === 'card') ? current : scope;
        db.cardPlugin = db.cardPlugin || {};
        db.cardPlugin[cid] = db.cardPlugin[cid] || {};
        db.cardPlugin[cid][key] = value;
        return Promise.resolve();
      },
      remove: function (scope, vis, key) {
        if (scope === 'board') { delete db.boardPlugin[key]; return Promise.resolve(); }
        var cid = (scope === 'card') ? current : scope;
        if (db.cardPlugin && db.cardPlugin[cid]) delete db.cardPlugin[cid][key];
        return Promise.resolve();
      },

      // ----- context -----
      card: function () { return Promise.resolve(findCard(current)); },
      cards: function () { return Promise.resolve(db.cards.filter(function (c) { return !c.closed; })); },
      lists: function () { return Promise.resolve(db.lists.slice()); },
      board: function () { return Promise.resolve(db.board); },
      member: function () { return Promise.resolve({ id: 'm_self', fullName: 'Tester' }); },

      // ----- UI (no-ops that log) -----
      popup: function (o) { (global.__mockLog || function () {})('popup', o); return Promise.resolve(); },
      modal: function (o) { (global.__mockLog || function () {})('modal', o); return Promise.resolve(); },
      closePopup: function () { return Promise.resolve(); },
      sizeTo: function () { return Promise.resolve(); },
      render: function (cb) { if (cb) cb(); },
      signUrl: function (u) { return u; },
      navigate: function (o) { (global.__mockLog || function () {})('navigate', o); return Promise.resolve(); },
      showCard: function (id) { (global.__mockLog || function () {})('showCard', id); return Promise.resolve(); },

      // ----- REST API stub (filled in for S5) -----
      getRestApi: function () {
        return {
          isAuthorized: function () { return Promise.resolve(false); },
          authorize: function () { return Promise.resolve(); },
          getToken: function () { return Promise.resolve(null); },
        };
      },
    };

    return {
      t: t,
      db: db,
      currentCard: function (id) { current = id; return t; },
      getCurrent: function () { return current; },
    };
  }

  global.createMockTrello = createMockTrello;
  global.__mockDefaultSeed = defaultSeed;
})(typeof window !== 'undefined' ? window : this);
