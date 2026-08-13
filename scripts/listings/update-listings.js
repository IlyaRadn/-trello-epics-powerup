/*
 * update-listings.js — push the master listing content to Trello for ALL 24 locales.
 *
 * USAGE (browser console, logged into trello.com as the Power-Up admin):
 *   1. Open https://trello.com, DevTools → Console.
 *   2. Paste the full contents of  content.js  then  content.extra.js  then THIS file, and run.
 *      (They define the globals NAME, GIF_BASE, LISTINGS, EXTRA that this script consumes.)
 *   3. It creates-or-updates every locale and prints a { locale: status } map — all should be 200.
 *
 * The three GIF tokens {G1}{G2}{G3} in the descriptions are expanded here.
 * Writes use PUT /1/plugins/{id}/listings/{listingId} (existing) or POST /…/listings (new),
 * with the `dsc` cookie as the CSRF token.
 */
(async function () {
  var PLUGIN_ID = '6a6dbb0953912e0f415de989';
  var dsc = (document.cookie.match(/(?:^|; )dsc=([^;]+)/) || [])[1];
  if (!dsc) { console.error('No dsc cookie — are you logged into trello.com?'); return; }

  // Merge the two content files. en-US + ru live in LISTINGS; the other 22 in EXTRA.
  var ALL = Object.assign({}, (typeof LISTINGS !== 'undefined' ? LISTINGS : {}), (typeof EXTRA !== 'undefined' ? EXTRA : {}));
  if (!Object.keys(ALL).length) { console.error('No content — paste content.js and content.extra.js first.'); return; }

  var G1 = GIF_BASE + 'duck-epics-make-subscription.gif';
  var G2 = GIF_BASE + 'duck-epics-create-subtask.gif';
  var G3 = GIF_BASE + 'duck-epics-status-done.gif';
  function expand(md) { return md.split('{G1}').join(G1).split('{G2}').join(G2).split('{G3}').join(G3); }

  var FREE_MAP = (typeof FREE !== 'undefined') ? FREE : {};
  var AGILE_MAP = (typeof AGILE !== 'undefined') ? AGILE : {};
  // Overview → "🆓 <localized Free> — …", idempotent and capped at 128 chars.
  function withFree(loc, overview) {
    var word = FREE_MAP[loc] || 'Free';
    var base = (overview || '').replace(/^🆓[^—]*—\s*/, '').trim();
    var pfx = '🆓 ' + word + ' — ';
    var out = pfx + base;
    if (out.length > 128) out = pfx + base.slice(0, Math.max(0, 127 - pfx.length)).replace(/\s+\S*$/, '') + '…';
    return out;
  }
  var KW_MAP = (typeof KEYWORDS !== 'undefined') ? KEYWORDS : {};
  // Insert a localized paragraph before the "---" footer, once (idempotent).
  function insertBeforeFooter(description, block) {
    if (!block || description.indexOf(block) >= 0) return description;
    var idx = description.lastIndexOf('\n---');
    return idx >= 0 ? (description.slice(0, idx) + '\n' + block + '\n' + description.slice(idx))
                    : (description + '\n\n' + block);
  }
  // Description → Agile/Scrum/Kanban paragraph, then the keyword-rich "Also works as" line.
  function withAgile(loc, description) { return insertBeforeFooter(description, AGILE_MAP[loc] || AGILE_MAP['en-US'] || ''); }
  function withKeywords(loc, description) { return insertBeforeFooter(description, KW_MAP[loc] || KW_MAP['en-US'] || ''); }

  var current = await fetch('/1/plugins/' + PLUGIN_ID + '?listings=true&_=' + Date.now(), { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
  var byLocale = {};
  (current.listings || []).forEach(function (l) { byLocale[l.locale] = l; });

  var results = {};
  // en-US first so, on a fresh plugin, it becomes the default (first) listing.
  var order = Object.keys(ALL).sort(function (a, b) { return (a === 'en-US' ? -1 : b === 'en-US' ? 1 : 0); });

  for (var i = 0; i < order.length; i++) {
    var loc = order[i];
    var item = ALL[loc];
    var body = new URLSearchParams();
    body.set('name', NAME);
    body.set('locale', loc);
    body.set('overview', withFree(loc, item.overview));
    body.set('description', withKeywords(loc, withAgile(loc, expand(item.description))));
    body.set('dsc', dsc);
    var existing = byLocale[loc];
    var url = existing ? ('/1/plugins/' + PLUGIN_ID + '/listings/' + existing.id) : ('/1/plugins/' + PLUGIN_ID + '/listings');
    var method = existing ? 'PUT' : 'POST';
    try {
      var r = await fetch(url, { method: method, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      results[loc] = r.status;
    } catch (e) { results[loc] = 'ERR'; }
  }
  console.log('Duck Epics listings update:', results);
  return results;
})();
