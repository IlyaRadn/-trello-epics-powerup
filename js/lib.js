/*
 * lib.js — data layer for the Duck Epics Power-Up (Subscription → Sub-task).
 *
 * WHY board-scoped storage:
 * The Trello Power-Up client can only WRITE pluginData to the *current* card
 * (scope 'card') or to the *board* (scope 'board'). It cannot write another
 * card's pluginData. Relationships inherently touch two cards, so we keep the
 * whole relationship graph in BOARD-scoped pluginData, where any card context
 * can read and write it. This also avoids scanning a huge board (400+ cards)
 * to find a parent's children — we read the child-id list directly by key.
 *
 * Keys (all board scope, 'shared' visibility):
 *   sub:children:<parentId>  -> string[]  (ids of this parent's sub-tasks)
 *   sub:parent:<childId>     -> string    (id of this child's parent)
 *   sub:meta:<cardId>        -> { role:'subscription', icon:'🚀' }
 *
 * Each key stays small (one id or one id-list), well under Trello's ~4KB limit.
 */
(function (global) {
  'use strict';

  var SCOPE = 'board';
  var VIS = 'shared';

  // Default detection of the "done" list by name. Configurable later (§6).
  var DONE_LIST_RE = /completed tasks|completed|^\s*done\s*$|готово|заверш/i;

  // Palette for auto-assigned / pickable Subscription icons (~100).
  var ICON_PALETTE = [
    '🚀','🌟','🔥','⚡','🎯','🧩','🌈','🍀','🔮','🎨','🛠️','📦',
    '🧭','🗺️','🏆','💎','🐳','🦊','🦄','🐙','🦉','🐝','🌵','🍩',
    '🎸','🎧','🎬','🎮','🕹️','🎲','♟️','🧸','🎈','🎁','🎀','🧵',
    '👑','💡','🔧','⚙️','🔩','🧲','🔬','🔭','📡','💻','🖥️','⌨️',
    '💾','💿','🧿','🎓','📚','📖','📝','✏️','🖌️','📐','📌','📎',
    '🔗','📈','📊','💰','💳','🏦','🏭','🏗️','🏠','🏢','🚗','🚌',
    '✈️','🛸','⛵','🚤','🛰️','🌍','🌙','⭐','☀️','🌊','❄️','🌸',
    '🌻','🌷','🌹','🍎','🍊','🍋','🍉','🍇','🍓','🫐','🥝','🍒',
    '🥑','🌽','🥕','🍄','🐶','🐱','🐰','🐻','🐼','🐨','🐯','🦁',
    '🐸','🐵','🐧','🦋','🐢','🐬','🦈','🦭','🦕','🐝',
  ];

  function key(kind, id) { return 'sub:' + kind + ':' + id; }

  var Epic = {
    DONE_LIST_RE: DONE_LIST_RE,
    ICON_PALETTE: ICON_PALETTE,

    // Trello API key from the Power-Up admin (public value, embedded in client).
    APP_KEY: 'ffdbea7aa839ec372b926441255ca3d3',
    APP_NAME: 'Duck Epics',

    // ---------- token (our own OAuth flow, stored member-private) ----------
    getToken: function (t) { return t.get('member', 'private', 'duckToken').catch(function () { return null; }); },
    setToken: function (t, token) { return t.set('member', 'private', 'duckToken', token); },
    clearToken: function (t) { return t.remove('member', 'private', 'duckToken'); },

    // ---------- REST helpers (need user authorization, see S5) ----------
    // Create a new card via REST and link it under `parentId` as a Sub-task.
    // Resolves with the new card id. Rejects with Error('auth') if not authorized.
    createSubtask: function (t, opts) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'idList=' + encodeURIComponent(opts.idList) +
          '&name=' + encodeURIComponent(opts.name) +
          '&key=' + encodeURIComponent(Epic.APP_KEY) +
          '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards?' + qs, { method: 'POST' })
          .then(function (resp) { if (!resp.ok) throw new Error('rest ' + resp.status); return resp.json(); })
          .then(function (card) {
            return Epic.setParent(t, card.id, opts.parentId).then(function () { return card.id; });
          });
      });
    },

    // Fetch archived (closed) cards for the board via REST, as id->{idList,name,closed}.
    // Used by the parent section/badges to include archived sub-tasks (S5+).
    fetchArchived: function (t, boardId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return {};
        var qs = 'filter=closed&fields=name,idList,closed&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/boards/' + boardId + '/cards?' + qs)
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (cards) {
            var map = {};
            cards.forEach(function (c) { map[c.id] = { id: c.id, name: c.name, idList: c.idList, closed: true }; });
            return map;
          }).catch(function () { return {}; });
      });
    },

    // ---------- low-level board store ----------
    _get: function (t, k, dflt) {
      return t.get(SCOPE, VIS, k).then(function (v) {
        return (v === undefined || v === null) ? dflt : v;
      });
    },
    _set: function (t, k, v) { return t.set(SCOPE, VIS, k, v); },
    _remove: function (t, k) { return t.remove(SCOPE, VIS, k); },

    // ---------- meta (role + icon) ----------
    getMeta: function (t, cardId) { return Epic._get(t, key('meta', cardId), {}); },

    isSubscription: function (t, cardId) {
      return Epic.getMeta(t, cardId).then(function (m) { return m.role === 'subscription'; });
    },

    makeSubscription: function (t, cardId, icon) {
      return Epic.getMeta(t, cardId).then(function (m) {
        m.role = 'subscription';
        if (!m.icon) m.icon = icon || Epic.autoIcon(cardId);
        return Epic._set(t, key('meta', cardId), m);
      }).then(function () { return Epic._indexAdd(t, cardId); });
    },

    unmakeSubscription: function (t, cardId) {
      // Drop the role but keep any existing links intact; also detach children.
      return Epic.getChildren(t, cardId).then(function (kids) {
        var chain = Promise.resolve();
        kids.forEach(function (cid) {
          chain = chain.then(function () { return Epic._remove(t, key('parent', cid)); });
        });
        return chain
          .then(function () { return Epic._remove(t, key('children', cardId)); })
          .then(function () { return Epic._remove(t, key('meta', cardId)); })
          .then(function () { return Epic._indexRemove(t, cardId); });
      });
    },

    // ---------- subscription index (for listing all epics) ----------
    listSubscriptions: function (t) { return Epic._get(t, 'sub:index', []); },
    _indexAdd: function (t, cardId) {
      return Epic.listSubscriptions(t).then(function (arr) {
        if (arr.indexOf(cardId) === -1) arr.push(cardId);
        return Epic._set(t, 'sub:index', arr);
      });
    },
    _indexRemove: function (t, cardId) {
      return Epic.listSubscriptions(t).then(function (arr) {
        return Epic._set(t, 'sub:index', arr.filter(function (x) { return x !== cardId; }));
      });
    },

    getIcon: function (t, cardId) {
      return Epic.getMeta(t, cardId).then(function (m) { return m.icon || '🗂️'; });
    },
    setIcon: function (t, cardId, icon) {
      return Epic.getMeta(t, cardId).then(function (m) {
        m.icon = icon;
        return Epic._set(t, key('meta', cardId), m);
      });
    },

    // Deterministic pick from palette by card id (stable, no RNG).
    autoIcon: function (cardId) {
      var h = 0, s = String(cardId);
      for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
      return ICON_PALETTE[h % ICON_PALETTE.length];
    },

    // ---------- relationships ----------
    getParent: function (t, childId) { return Epic._get(t, key('parent', childId), null); },
    getChildren: function (t, parentId) { return Epic._get(t, key('children', parentId), []); },

    // Would linking child->parent create a cycle? (parent is a descendant of child)
    wouldCycle: function (t, childId, parentId) {
      if (childId === parentId) return Promise.resolve(true);
      var walk = function (id, guard) {
        if (!id) return Promise.resolve(false);
        if (id === childId) return Promise.resolve(true);
        if (guard > 50) return Promise.resolve(false);
        return Epic.getParent(t, id).then(function (p) { return walk(p, guard + 1); });
      };
      return walk(parentId, 0);
    },

    // Attach childId under parentId (moves it if it already had a parent).
    setParent: function (t, childId, parentId) {
      return Epic.wouldCycle(t, childId, parentId).then(function (cyc) {
        if (cyc) throw new Error('cycle');
        return Epic.getParent(t, childId);
      }).then(function (oldParent) {
        var chain = Promise.resolve();
        if (oldParent && oldParent !== parentId) {
          chain = chain.then(function () { return Epic._pullChild(t, oldParent, childId); });
        }
        return chain
          .then(function () { return Epic._set(t, key('parent', childId), parentId); })
          .then(function () { return Epic._pushChild(t, parentId, childId); });
      });
    },

    addChild: function (t, parentId, childId) { return Epic.setParent(t, childId, parentId); },

    detach: function (t, childId) {
      return Epic.getParent(t, childId).then(function (p) {
        var chain = Promise.resolve();
        if (p) chain = chain.then(function () { return Epic._pullChild(t, p, childId); });
        return chain.then(function () { return Epic._remove(t, key('parent', childId)); });
      });
    },

    _pushChild: function (t, parentId, childId) {
      return Epic.getChildren(t, parentId).then(function (arr) {
        if (arr.indexOf(childId) === -1) arr.push(childId);
        return Epic._set(t, key('children', parentId), arr);
      });
    },
    _pullChild: function (t, parentId, childId) {
      return Epic.getChildren(t, parentId).then(function (arr) {
        var next = arr.filter(function (x) { return x !== childId; });
        return Epic._set(t, key('children', parentId), next);
      });
    },

    // ---------- stats ----------
    findDoneListId: function (lists, doneListName) {
      var match = null;
      lists.forEach(function (l) {
        if (doneListName) { if (l.name === doneListName) match = l.id; }
        else if (!match && DONE_LIST_RE.test(l.name)) match = l.id;
      });
      return match;
    },

    /*
     * Build progress for a Subscription.
     * `activeCards` = result of t.cards('id','name','idList','closed') (active only).
     * `archivedById` = optional map id->{idList,name,closed:true} from REST (S5+).
     * Returns { total, done, doneListId, items:[{id,name,list,listId,done,archived}], byList }.
     */
    computeStats: function (t, parentId, opts) {
      opts = opts || {};
      return Promise.all([
        Epic.getChildren(t, parentId),
        opts.activeCards ? Promise.resolve(opts.activeCards) : t.cards('id', 'name', 'idList', 'closed'),
        opts.lists ? Promise.resolve(opts.lists) : t.lists('id', 'name'),
      ]).then(function (res) {
        var childIds = res[0];
        var active = res[1] || [];
        var lists = res[2] || [];
        var listName = {};
        lists.forEach(function (l) { listName[l.id] = l.name; });
        var doneListId = Epic.findDoneListId(lists, opts.doneListName);

        var byId = {};
        active.forEach(function (c) { byId[c.id] = c; });
        var archived = opts.archivedById || {};

        var items = [], byList = {}, done = 0;
        childIds.forEach(function (id) {
          var c = byId[id] || archived[id];
          if (!c) {
            // Not found among active cards; unknown until REST fills archived (S5).
            items.push({ id: id, name: '(archived / not loaded)', list: '—', listId: null, done: false, archived: true, unknown: true });
            byList['—'] = (byList['—'] || 0) + 1;
            return;
          }
          var ln = listName[c.idList] || (c.list || '—');
          var isDone = doneListId ? (c.idList === doneListId) : false;
          if (isDone) done++;
          byList[ln] = (byList[ln] || 0) + 1;
          var b = c.badges || {};
          items.push({
            id: id, name: c.name, list: ln, listId: c.idList, done: isDone, archived: !!c.closed,
            due: c.due || null, dueComplete: !!c.dueComplete,
            checkItems: b.checkItems || 0, checkItemsChecked: b.checkItemsChecked || 0,
            members: c.members || [],
          });
        });

        return { total: childIds.length, done: done, doneListId: doneListId, items: items, byList: byList };
      });
    },
  };

  global.Epic = Epic;
})(typeof window !== 'undefined' ? window : this);
