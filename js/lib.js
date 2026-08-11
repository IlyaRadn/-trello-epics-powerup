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
    '🐸','🐵','🐧','🦋','🐢','🐬','🦈','🦭','🦕','🐺',
    '🎉','🥳','🤖','👾','🐲','🦩','🦚','🦜','🐣','🦔',
    '🦦','🦥','🐿️','🦫','🍕','🍔','🌭','🌮','🥨','🧇',
    '🥞','🍿','🍫','🍭','🍦','🧁','🎂','🥤','🍹','🍸',
    '🎃','👻','💀','🤡','🎭','🪄','🎇','🎆','🌠','💫',
    '🪐','🔔','🎺','🥁','🎻','🪕','🪗','🧃','🌪️','🦖',
    // ---- cyberpunk / gaming vibe ----
    '🧠','🦾','🦿','📟','💽','🖲️','🪫','🔋','🧬','⚗️',
    '🧪','🛡️','⚔️','🗡️','🏹','🪓','🔫','💣','🧨','⛓️',
    '🕶️','🥽','🦺','🪖','🚨','🛜','🔌','💥','🌆','🌃',
    '🏙️','🟣','🟪','🔷','🔶','🟩','🧫','🕳️','♾️','☢️',
    '☣️','👁️','🩻','🫀','💊','🕷️','🕸️','🐉','🎛️','🧯',
  ];

  function key(kind, id) { return 'sub:' + kind + ':' + id; }

  var Epic = {
    DONE_LIST_RE: DONE_LIST_RE,
    ICON_PALETTE: ICON_PALETTE,

    // Trello API key from the Power-Up admin (public value, embedded in client).
    APP_KEY: 'ffdbea7aa839ec372b926441255ca3d3',
    APP_NAME: 'Duck Epics',

    // ---------- token (our own OAuth flow, stored member-private) ----------
    // Per-sub-task custom link. SHARDED per parent Subscription (`sub:links:<parentId>`)
    // so no single pluginData key hits Trello's 8192-char limit. Old global `sub:links`
    // is still read (backward-compat) but never written to again.
    // Links map lives on the SUBSCRIPTION card ({childId: url}); legacy board keys are
    // still read as a fallback so old links keep showing.
    getLinks: function (t, parentId) {
      if (!parentId) return Promise.resolve({});
      return Promise.all([
        Epic._cget(t, parentId, 'links', {}),
        Epic._get(t, 'sub:links', {}),
        Epic._get(t, key('links', parentId), {}),
      ]).then(function (r) { return Object.assign({}, r[1] || {}, r[2] || {}, r[0] || {}); });
    },
    setLink: function (t, parentId, cardId, url) {
      if (!parentId) return Promise.resolve();
      return Epic._cget(t, parentId, 'links', {}).then(function (m) {
        m = m || {};
        if (url) m[cardId] = url; else delete m[cardId];
        return Epic._cset(t, parentId, 'links', m);
      });
    },

    // Collapsed-group UI state, stored per member (personal preference, persists across sessions).
    getCollapsed: function (t) { return t.get('member', 'private', 'sub:collapsed').then(function (v) { return v || {}; }).catch(function () { return {}; }); },
    setCollapsed: function (t, obj) { return t.set('member', 'private', 'sub:collapsed', obj).catch(function () {}); },

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
          (opts.due ? '&due=' + encodeURIComponent(opts.due) : '') +
          (opts.link ? '&desc=' + encodeURIComponent(opts.link) : '') +
          (opts.idMembers && opts.idMembers.length ? '&idMembers=' + encodeURIComponent(opts.idMembers.join(',')) : '') +
          '&key=' + encodeURIComponent(Epic.APP_KEY) +
          '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards?' + qs, { method: 'POST' })
          .then(function (resp) { if (!resp.ok) throw new Error('rest ' + resp.status); return resp.json(); })
          .then(function (card) {
            // Linking the sub-task to its parent is ESSENTIAL. The custom link is
            // optional — never let a link write (or its size limit) break creation.
            return Epic.setParent(t, card.id, opts.parentId).then(function () {
              if (opts.link) {
                Epic.setLink(t, opts.parentId, card.id, opts.link).catch(function () {});
                Epic.linkToDesc(t, card.id, opts.link).catch(function () {});
              }
              return card.id;
            });
          });
      });
    },

    // Board members cache (board-shared pluginData) so avatars/photos load instantly
    // on every card open instead of a REST call per iframe. Refreshed when stale.
    getMembersCache: function (t) { return Epic._get(t, 'sub:members', null); },
    // Cache ONLY avatar URLs (id->url) — small, well under the pluginData size limit.
    // Returns the full member map for the caller; caching is best-effort/non-blocking.
    refreshMembers: function (t, boardId) {
      return Epic.fetchMembers(t, boardId).then(function (map) {
        map = map || {};
        var avatars = {};
        Object.keys(map).forEach(function (id) { if (map[id].avatarUrl) avatars[id] = map[id].avatarUrl; });
        // Only cache if it stays comfortably under the 8192-char pluginData key limit
        // (big boards can have enough members that the avatar map would overflow).
        var payload = { ts: Date.now(), avatars: avatars };
        if (Object.keys(avatars).length && JSON.stringify(payload).length < 7000) {
          Epic._set(t, 'sub:members', payload).catch(function () {});
        }
        return map;
      });
    },

    // Fetch idMembers for every open card on the board in ONE REST call → { cardId: [memberId] }.
    // Trello's t.cards() rejects the 'idMembers' field ("Command: cards"), and it sometimes
    // returns an empty expanded `members` array, so this is the reliable source of assignees.
    fetchCardMembers: function (t, boardId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return {};
        var qs = 'fields=idMembers&filter=open&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/boards/' + boardId + '/cards?' + qs)
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (arr) { var m = {}; arr.forEach(function (c) { m[c.id] = c.idMembers || []; }); return m; })
          .catch(function () { return {}; });
      });
    },

    // Fetch board members via REST as id->{avatarUrl,fullName,...} (t.cards('members')
    // omits avatar URLs, so we look them up here). Empty map if not authorized.
    fetchMembers: function (t, boardId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return {};
        var qs = 'fields=fullName,username,initials,avatarUrl&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/boards/' + boardId + '/members?' + qs)
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (arr) { var map = {}; arr.forEach(function (m) { map[m.id] = m; }); return map; })
          .catch(function () { return {}; });
      });
    },

    // Archive (close) a card via REST. Rejects Error('auth') if not authorized.
    archiveCard: function (t, id) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'closed=true&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + id + '?' + qs, { method: 'PUT' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Un-archive (reopen) a card via REST. Rejects Error('auth') if not authorized.
    unarchiveCard: function (t, id) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'closed=false&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + id + '?' + qs, { method: 'PUT' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Move a card to another list (change its status column). Needs REST auth.
    moveCard: function (t, id, idList) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'idList=' + encodeURIComponent(idList) + '&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + id + '?' + qs, { method: 'PUT' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Set (or clear, with dueISO = '') a card's due date via REST.
    setDue: function (t, id, dueISO) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'due=' + encodeURIComponent(dueISO || '') + '&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + id + '?' + qs, { method: 'PUT' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Append a URL to a card's description (Trello desc) if not already present —
    // so the link is visible when you open the actual sub-task card. Non-clobbering.
    linkToDesc: function (t, cardId, url) {
      if (!url) return Promise.resolve();
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return;
        var base = 'key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + cardId + '?fields=desc&' + base)
          .then(function (r) { return r.ok ? r.json() : {}; })
          .then(function (c) {
            var desc = (c && c.desc) || '';
            if (desc.indexOf(url) >= 0) return; // already there
            var next = desc ? (desc + '\n\n' + url) : url;
            return fetch('https://api.trello.com/1/cards/' + cardId + '?desc=' + encodeURIComponent(next) + '&' + base, { method: 'PUT' });
          }).catch(function () {});
      });
    },

    // Assign a board member to a card via REST.
    addMember: function (t, cardId, memberId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'value=' + encodeURIComponent(memberId) + '&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + cardId + '/idMembers?' + qs, { method: 'POST' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Remove a member from a card via REST.
    removeMember: function (t, cardId, memberId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) throw new Error('auth');
        var qs = 'key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + cardId + '/idMembers/' + memberId + '?' + qs, { method: 'DELETE' })
          .then(function (r) { if (!r.ok) throw new Error('rest ' + r.status); return true; });
      });
    },

    // Which board lists count as workflow "status" columns (move targets). null = not configured.
    getStatusLists: function (t) { return Epic._get(t, 'sub:statusLists', null); },
    setStatusLists: function (t, ids) { return Epic._set(t, 'sub:statusLists', ids); },

    // All active cards on the board via REST — t.cards() only returns the cards Trello
    // has lazy-loaded into the client (~first dozens on big boards). Null if not authorized.
    fetchBoardCards: function (t, boardId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return null;
        var qs = 'filter=open&fields=name,idList,dateLastActivity&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/boards/' + boardId + '/cards?' + qs)
          .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      });
    },

    // Fetch one card's detail (due, assignees, labels) via REST — used to enrich
    // the child view with the parent Subscription's date / members / labels.
    fetchCardDetail: function (t, id) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return null;
        var qs = 'fields=name,url,due,dueComplete,labels&members=true&member_fields=fullName,username,initials,avatarUrl&key=' +
          encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/cards/' + id + '?' + qs)
          .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      });
    },

    // Fetch specific cards by id via REST (used for the few archived sub-tasks) —
    // WAY faster than pulling every closed card on the board. id->{name,idList,closed,url}.
    fetchArchivedByIds: function (t, ids) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY || !ids || !ids.length) return {};
        return Promise.all(ids.map(function (id) {
          var qs = 'fields=name,idList,closed,url&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
          return fetch('https://api.trello.com/1/cards/' + id + '?' + qs)
            .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
        })).then(function (cards) {
          var map = {};
          cards.forEach(function (c) { if (c) map[c.id] = { id: c.id, name: c.name, idList: c.idList, closed: !!c.closed, url: c.url }; });
          return map;
        });
      });
    },

    // Fetch archived (closed) cards for the board via REST, as id->{idList,name,closed}.
    // Used by the parent section/badges to include archived sub-tasks (S5+).
    fetchArchived: function (t, boardId) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY) return {};
        var qs = 'filter=closed&fields=name,idList,closed,url&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
        return fetch('https://api.trello.com/1/boards/' + boardId + '/cards?' + qs)
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (cards) {
            var map = {};
            cards.forEach(function (c) { map[c.id] = { id: c.id, name: c.name, idList: c.idList, closed: true, url: c.url }; });
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

    // ---------- per-CARD store ----------
    // Trello's pluginData limit is 8192 chars PER SECTION (scope+visibility), NOT per key.
    // So we store each card's own data (meta/parent/children/links/backup) on that card's
    // OWN card-scope section (its own 4096 budget) instead of cramming everything into the
    // single board/shared section. `t.set(cardId, …)` can target any card by id.
    // NOTE: in some contexts (notably card-badges) Trello's t.get/set/remove throws SYNCHRONOUSLY
    // ("Invalid value for scope") when the scope is a card id rather than a keyword. A plain
    // `.catch()` can't catch a sync throw, so it escapes as a Power-Up "unhandled error". We wrap
    // every call in Promise.resolve().then(...) to turn a sync throw into a catchable rejection,
    // and _cget falls back to the 'card' scope (there `t` is bound to the current card).
    _cget: function (t, cardId, k, dflt) {
      return Promise.resolve().then(function () { return t.get(cardId, VIS, k); })
        .catch(function () { return Promise.resolve().then(function () { return t.get('card', VIS, k); }).catch(function () { return dflt; }); })
        .then(function (v) { return (v === undefined || v === null) ? dflt : v; })
        .catch(function () { return dflt; });
    },
    _cset: function (t, cardId, k, v) { return Promise.resolve().then(function () { return t.set(cardId, VIS, k, v); }); },
    _cremove: function (t, cardId, k) { return Promise.resolve().then(function () { return t.remove(cardId, VIS, k); }).catch(function () {}); },

    // ---------- meta (role + icon) — stored on the card itself ----------
    getMeta: function (t, cardId) {
      return Epic._cget(t, cardId, 'meta', null).then(function (m) {
        if (m) return m;
        // migrate from the legacy board-scoped key on first read
        return Epic._get(t, key('meta', cardId), null).then(function (legacy) {
          if (legacy) { Epic._cset(t, cardId, 'meta', legacy).catch(function () {}); Epic._remove(t, key('meta', cardId)).catch(function () {}); return legacy; }
          return {};
        });
      });
    },

    isSubscription: function (t, cardId) {
      return Epic.getMeta(t, cardId).then(function (m) { return m.role === 'subscription'; });
    },

    makeSubscription: function (t, cardId, icon) {
      // If this card was un-marked before, restore its old sub-tasks from the backup
      // (only children still free — not ones re-assigned to another Subscription meanwhile).
      // Backup lives on the card itself now (legacy board key read as fallback).
      return Epic._cget(t, cardId, 'backup', null).then(function (b) {
        if (b) return b;
        return Epic._get(t, key('backup', cardId), null);
      }).then(function (backup) {
        var restore = Promise.resolve();
        if (backup && backup.children && backup.children.length) {
          var toRestore = [], chain = Promise.resolve();
          backup.children.forEach(function (cid) {
            chain = chain.then(function () {
              return Epic.getParent(t, cid).then(function (p) {
                if (!p) { toRestore.push(cid); return Epic._cset(t, cid, 'parent', cardId); }
              });
            });
          });
          restore = chain
            .then(function () { return Epic._setChildren(t, cardId, toRestore); })
            .then(function () { return Epic._cremove(t, cardId, 'backup'); })
            .then(function () { return Epic._remove(t, key('backup', cardId)).catch(function () {}); });
        } else if (backup) {
          restore = Epic._cremove(t, cardId, 'backup').then(function () { return Epic._remove(t, key('backup', cardId)).catch(function () {}); });
        }
        return restore.then(function () {
          return Epic.getMeta(t, cardId).then(function (m) {
            m.role = 'subscription';
            if (!m.icon) m.icon = (backup && backup.meta && backup.meta.icon) || icon || Epic.autoIcon(cardId);
            return Epic._cset(t, cardId, 'meta', m); // ESSENTIAL — card-scoped, always writable
          });
        }).then(function () { return Epic._indexAdd(t, cardId).catch(function () {}); }); // index is secondary — never block
      });
    },

    unmakeSubscription: function (t, cardId) {
      // Drop the role + detach children, but BACK UP the relationships so a later
      // "Make Subscription" can restore the same sub-tasks.
      return Promise.all([Epic.getChildren(t, cardId), Epic.getMeta(t, cardId)]).then(function (r) {
        var kids = r[0] || [], meta = r[1] || {};
        return Epic._cset(t, cardId, 'backup', { children: kids, meta: meta }).then(function () {
          var chain = Promise.resolve();
          kids.forEach(function (cid) {
            chain = chain.then(function () { return Epic._cremove(t, cid, 'parent'); })
              .then(function () { return Epic._remove(t, key('parent', cid)).catch(function () {}); });
          });
          return chain
            .then(function () { return Epic._removeChildren(t, cardId); })
            .then(function () { return Epic._cremove(t, cardId, 'meta'); })
            .then(function () { return Epic._indexRemove(t, cardId); });
        });
      });
    },

    // ---------- subscription index (for listing all epics) ----------
    // The subscription index is SHARDED too (`sub:index`, `sub:index:1` …) so a board
    // with many subscriptions never hits the 8192-char per-key limit.
    _idxKey: function (i) { return i ? 'sub:index:' + i : 'sub:index'; },
    listSubscriptions: function (t) {
      var reads = [];
      for (var i = 0; i < 6; i++) reads.push(Epic._get(t, Epic._idxKey(i), []));
      return Promise.all(reads).then(function (parts) {
        var all = [], seen = {};
        parts.forEach(function (arr) { (arr || []).forEach(function (id) { if (!seen[id]) { seen[id] = 1; all.push(id); } }); });
        return all;
      });
    },
    _indexAdd: function (t, cardId) {
      var reads = [];
      for (var i = 0; i < 6; i++) reads.push(Epic._get(t, Epic._idxKey(i), []));
      return Promise.all(reads).then(function (parts) {
        for (var j = 0; j < parts.length; j++) if ((parts[j] || []).indexOf(cardId) >= 0) return;
        for (var i = 0; i < 6; i++) {
          var arr = (parts[i] || []).concat([cardId]);
          if (JSON.stringify(arr).length < 6000) return Epic._set(t, Epic._idxKey(i), arr);
        }
        return Epic._set(t, Epic._idxKey(5), (parts[5] || []).concat([cardId]));
      });
    },
    _indexRemove: function (t, cardId) {
      var chain = Promise.resolve();
      var mk = function (i) { return function () {
        return Epic._get(t, Epic._idxKey(i), []).then(function (arr) {
          arr = arr || [];
          if (arr.indexOf(cardId) < 0) return;
          return Epic._set(t, Epic._idxKey(i), arr.filter(function (x) { return x !== cardId; }));
        });
      }; };
      for (var i = 0; i < 6; i++) chain = chain.then(mk(i));
      return chain;
    },

    // Resolve missing child ids in ONE REST pass: returns which are archived (still exist)
    // and which are confirmed DELETED (HTTP 404). Network errors are treated as unknown
    // (neither) so we never mistake a transient failure for a deletion.
    resolveMissing: function (t, ids) {
      return Epic.getToken(t).then(function (token) {
        if (!token || !Epic.APP_KEY || !ids || !ids.length) return { archived: {}, dead: [] };
        return Promise.all(ids.map(function (id) {
          var qs = 'fields=name,idList,closed,url&key=' + encodeURIComponent(Epic.APP_KEY) + '&token=' + encodeURIComponent(token);
          return fetch('https://api.trello.com/1/cards/' + id + '?' + qs).then(function (r) {
            if (r.status === 404) return { id: id, dead: true };
            return r.ok ? r.json().then(function (c) { return { id: id, card: c }; }) : { id: id };
          }).catch(function () { return { id: id }; });
        })).then(function (arr) {
          var archived = {}, dead = [];
          arr.forEach(function (x) {
            if (x.dead) dead.push(x.id);
            else if (x.card) archived[x.card.id] = { id: x.card.id, name: x.card.name, idList: x.card.idList, closed: !!x.card.closed, url: x.card.url };
          });
          return { archived: archived, dead: dead };
        });
      });
    },

    // Drop dead sub-task ids (cards deleted in Trello) from a subscription's children list
    // and clear their legacy parent records. Keeps stored data small over time so no
    // section ever bloats back toward the limit. Caller must vet `orphanIds` safely.
    pruneChildren: function (t, parentId, orphanIds) {
      if (!orphanIds || !orphanIds.length) return Promise.resolve();
      var set = {}; orphanIds.forEach(function (id) { set[id] = 1; });
      return Epic.getChildren(t, parentId).then(function (arr) {
        var kept = arr.filter(function (id) { return !set[id]; });
        var chain = (kept.length !== arr.length) ? Epic._cset(t, parentId, 'children', kept) : Promise.resolve();
        orphanIds.forEach(function (id) { chain = chain.then(function () { return Epic._remove(t, key('parent', id)).catch(function () {}); }); });
        return chain;
      });
    },

    getIcon: function (t, cardId) {
      return Epic.getMeta(t, cardId).then(function (m) { return m.icon || '🗂️'; });
    },
    setIcon: function (t, cardId, icon) {
      return Epic.getMeta(t, cardId).then(function (m) {
        m.icon = icon;
        return Epic._cset(t, cardId, 'meta', m);
      });
    },

    // Random pick — a fresh icon each time a Subscription is created.
    autoIcon: function () {
      return ICON_PALETTE[Math.floor(Math.random() * ICON_PALETTE.length)];
    },

    // ---------- relationships ----------
    // Parent link is stored on the CHILD card (its own section), with legacy migration.
    getParent: function (t, childId) {
      return Epic._cget(t, childId, 'parent', null).then(function (p) {
        if (p) return p;
        return Epic._get(t, key('parent', childId), null).then(function (legacy) {
          if (legacy) { Epic._cset(t, childId, 'parent', legacy).catch(function () {}); Epic._remove(t, key('parent', childId)).catch(function () {}); return legacy; }
          return null;
        });
      });
    },
    // Children list is stored on the SUBSCRIPTION card (its own section). Legacy data lived
    // in board-scoped (optionally sharded) keys — migrate on first read.
    _childKey: function (parentId, i) { return i ? key('children', parentId) + ':' + i : key('children', parentId); },
    getChildren: function (t, parentId) {
      return Epic._cget(t, parentId, 'children', null).then(function (arr) {
        if (arr) return arr;
        var reads = [];
        for (var i = 0; i < 6; i++) reads.push(Epic._get(t, Epic._childKey(parentId, i), []));
        return Promise.all(reads).then(function (parts) {
          var all = [], seen = {};
          parts.forEach(function (a) { (a || []).forEach(function (id) { if (!seen[id]) { seen[id] = 1; all.push(id); } }); });
          if (all.length) {
            Epic._cset(t, parentId, 'children', all).catch(function () {});
            for (var i = 0; i < 6; i++) Epic._remove(t, Epic._childKey(parentId, i)).catch(function () {});
          }
          return all;
        });
      });
    },

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
          .then(function () { return Epic._setParentPtr(t, childId, parentId); })
          .then(function () { return Epic._pushChild(t, parentId, childId); })
          .then(function () { return Epic.denormParent(t, childId, parentId).catch(function () {}); });
      });
    },

    // Denormalize the parent Subscription's NAME + ICON onto the child card. The child's
    // front-of-card badge needs to show the client (parent) name, but card-badges run in a
    // restricted context where reading ANOTHER card's pluginData/name is unreliable (card-id
    // scope throws; t.cards() may omit it). Reading the child's OWN card data always works, so
    // we copy the parent's name/icon here (in the section context, where they resolve reliably).
    denormParent: function (t, childId, parentId) {
      return Promise.all([
        t.cards('id', 'name').then(function (cs) { var pc = cs.filter(function (x) { return x.id === parentId; })[0]; return pc ? pc.name : null; }).catch(function () { return null; }),
        Epic.getIcon(t, parentId).catch(function () { return null; })
      ]).then(function (r) {
        if (!r[0] && !r[1]) return;
        return Epic._cset(t, childId, 'parentInfo', { name: r[0] || null, icon: r[1] || null }).catch(function () {});
      }).catch(function () {});
    },
    // Read the denormalized {name,icon} from the child's OWN card scope (works in the badge context).
    getParentBadge: function (t, childId) {
      return Epic._cget(t, childId, 'parentInfo', null).then(function (v) { return v || { name: null, icon: null }; });
    },
    // Write the denormalized {name,icon} to MANY children at once (parent-side backfill). Best-effort.
    denormChildren: function (t, children, name, icon) {
      var info = { name: name || null, icon: icon || null };
      var chain = Promise.resolve();
      (children || []).forEach(function (id) {
        chain = chain.then(function () { return Epic._cset(t, id, 'parentInfo', info).catch(function () {}); });
      });
      return chain;
    },

    // Write the child->parent pointer. Prefer the child card's OWN scope, but a JUST-created
    // card is not yet in Trello's board model, so t.set(childId,...) throws "Card not found or
    // not on current board". Fall back to the board-scope legacy key (getParent migrates it to
    // card scope the first time the child is opened). Never throws — the essential link is the
    // subscription's children list (_pushChild), which must run regardless.
    _setParentPtr: function (t, childId, parentId) {
      return Epic._cset(t, childId, 'parent', parentId)
        .then(function () { return Epic._remove(t, key('parent', childId)).catch(function () {}); })
        .catch(function () { return Epic._set(t, key('parent', childId), parentId).catch(function () {}); });
    },

    addChild: function (t, parentId, childId) { return Epic.setParent(t, childId, parentId); },

    detach: function (t, childId) {
      return Epic.getParent(t, childId).then(function (p) {
        var chain = Promise.resolve();
        if (p) chain = chain.then(function () { return Epic._pullChild(t, p, childId); });
        return chain
          .then(function () { return Epic._cremove(t, childId, 'parent'); })
          .then(function () { return Epic._cremove(t, childId, 'parentInfo'); })
          .then(function () { return Epic._remove(t, key('parent', childId)).catch(function () {}); });
      });
    },

    _pushChild: function (t, parentId, childId) {
      return Epic.getChildren(t, parentId).then(function (arr) {
        if (arr.indexOf(childId) !== -1) return;
        return Epic._cset(t, parentId, 'children', arr.concat([childId]));
      });
    },
    _pullChild: function (t, parentId, childId) {
      return Epic.getChildren(t, parentId).then(function (arr) {
        return Epic._cset(t, parentId, 'children', arr.filter(function (x) { return x !== childId; }));
      });
    },
    _removeChildren: function (t, parentId) { return Epic._cremove(t, parentId, 'children'); },
    _setChildren: function (t, parentId, ids) { return Epic._cset(t, parentId, 'children', ids || []); },

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
        opts.childIds ? Promise.resolve(opts.childIds) : Epic.getChildren(t, parentId),
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
            url: c.url || null,
            due: c.due || null, dueComplete: !!c.dueComplete,
            checkItems: b.checkItems || 0, checkItemsChecked: b.checkItemsChecked || 0,
            members: c.members || [],
            // Trello sometimes returns idMembers but not expanded `members` inline — keep the
            // ids so the UI can resolve avatars from the board members map as a fallback.
            idMembers: c.idMembers || (c.members || []).map(function (m) { return m.id; }),
          });
        });

        return { total: childIds.length, done: done, doneListId: doneListId, items: items, byList: byList };
      });
    },
  };

  global.Epic = Epic;
})(typeof window !== 'undefined' ? window : this);
