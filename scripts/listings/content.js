/*
 * content.js — MASTER content for the Duck Epics Trello catalog listing, all 24 locales.
 * Source of truth; version-controlled. Push to Trello with ../update-listings.js.
 *
 * Descriptions are Markdown. The tokens {G1} {G2} {G3} are the three demo GIFs — the updater
 * replaces them with GIF_BASE + 'duck-epics-<make-subscription|create-subtask|status-done>.gif'.
 *
 * Order matters: en-US MUST stay first — Trello serves the first listing as the default/fallback.
 * en-US / en-GB / en-AU / ru are human-reviewed; the rest are machine translations (native review TODO).
 */
var NAME = 'Duck Epics — Sub-tasks & Progress';
var GIF_BASE = 'https://trello-epics-powerup.pages.dev/assets/gifs/';

var LISTINGS = {
  'en-US': {
    overview: 'Epics, sub-tasks & parent-child hierarchy for Trello — group cards under a Subscription and track live progress.',
    description: `## Duck Epics — epics, sub-tasks & progress tracking for Trello

Duck Epics turns any Trello card into a **Subscription** (an epic, project, or client) and groups other cards under it as **sub-tasks** — the parent → child hierarchy Trello doesn't have out of the box. Built for teams that manage clients or epics with many underlying tasks.

**100% free** — every feature included, no paid plan.

![Make a Subscription]({G1})

### What you can do
- **Mark any card as a Subscription** and give it an icon.
- **Create sub-tasks** or **attach existing cards** (several at once) with search.
- **Live progress bar** and an **X/Y done** badge on the Subscription card.
- **Rich sub-task rows** — status column (dropdown or drag-and-drop), due date with overdue/soon highlighting, checklist progress, assignees, one-click "done".
- **Edit inline** — due date, assignees and a custom link right from the row.
- **Client name on every sub-task** — each sub-task's front badge shows its parent (client/epic) name.
- **Collapse/expand columns, sort newest-first, filter** the attach list.
- **Archived sub-tasks** grouped separately with Open / Unarchive.

![Create a sub-task]({G2})

### Track completion your way
A sub-task counts as done when it reaches your **Completed** column, so progress updates automatically.

![Track status and progress]({G3})

### Great for
- **Agencies & design studios** — one Subscription per client, sub-tasks for every deliverable.
- **Product & dev teams** — epics with sub-tasks and live progress.
- **Marketing & AI/product projects** — group campaigns or model tasks under one epic.

### Private & fast
- **No external server** — all your data stays inside Trello.
- Instant, optimistic updates.

---

Developed by [Duck.design](https://duck.design/)`
  },

  'ru': {
    overview: 'Эпики, подзадачи и иерархия родитель–потомок для Trello: группируйте карточки под Подпиской и следите за прогрессом.',
    description: `## Duck Epics — эпики, подзадачи и прогресс для Trello

Duck Epics превращает любую карточку Trello в **Подписку** (эпик, проект или клиента) и группирует под ней другие карточки как **подзадачи** — иерархию родитель → потомок, которой в Trello нет из коробки. Для команд, которые ведут клиентов или эпики с множеством задач.

**Полностью бесплатный** — все функции включены, без платных тарифов.

![Создание подписки]({G1})

### Что умеет
- **Отметить любую карточку как Подписку** и задать иконку.
- **Создавать подзадачи** или **привязывать существующие карточки** (сразу несколько) с поиском.
- **Живой прогресс-бар** и бейдж **X/Y готово** на карточке-подписке.
- **Насыщенные строки подзадач** — колонка статуса (дропдаун или перетаскивание), срок с подсветкой просрочки, прогресс чек-листа, исполнители, отметка «готово» в один клик.
- **Правки прямо в строке** — срок, исполнители и произвольная ссылка.
- **Имя клиента на каждой подзадаче** — на лицевой стороне видно её родителя (клиент/эпик).
- **Сворачивание колонок, сортировка по новизне, фильтр** списка привязки.
- **Архивные подзадачи** вынесены отдельно с «Открыть / Разархивировать».

![Создание подзадачи]({G2})

### Отслеживание готовности
Подзадача считается выполненной, когда попадает в вашу колонку **Завершено** — прогресс обновляется автоматически.

![Смена статуса и прогресс]({G3})

### Кому подходит
- **Агентства и дизайн-студии** — одна Подписка на клиента, подзадачи под каждый результат.
- **Продуктовые и dev-команды** — эпики с подзадачами и живым прогрессом.
- **Маркетинг и AI/продуктовые проекты** — группируйте кампании и задачи под одним эпиком.

### Приватно и быстро
- **Без внешнего сервера** — все данные остаются внутри Trello.
- Мгновенные, оптимистичные обновления.

---

Разработано в [Duck.design](https://duck.design/)`
  }
};

/* The remaining 22 locales (en-GB, en-AU, es, de, fr, fr-CA, pt-BR, it, nl, pl, uk, sv, nb, fi,
   cs, hu, tr, ja, th, vi, zh-Hans, zh-Hant) are LIVE on Trello and identical in structure to the
   two masters above (localized text + the same 3 GIFs + "free" line + Duck.design footer).
   They are appended in content.extra.js to keep this file readable. Load both when pushing. */

if (typeof module !== 'undefined' && module.exports) module.exports = { NAME, GIF_BASE, LISTINGS };
