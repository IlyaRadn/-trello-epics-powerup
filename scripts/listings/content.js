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

// ---------------------------------------------------------------------------
// Applied to EVERY locale by the updater (so a rule changes once, everywhere):
//   • overview  → prefixed with "🆓 <localized Free> — " (capped at 128 chars).
//   • description → an Agile/Scrum/Kanban PM paragraph inserted before the
//     "---" footer, for keyword discoverability ("scrum", "kanban", "backlog"…).
// Both are idempotent (see update-listings.js): re-running never double-applies.
// ---------------------------------------------------------------------------
var FREE = {
  'en-US': 'Free', 'en-GB': 'Free', 'en-AU': 'Free', 'ru': 'Бесплатно', 'es': 'Gratis',
  'de': 'Kostenlos', 'fr': 'Gratuit', 'fr-CA': 'Gratuit', 'pt-BR': 'Grátis', 'it': 'Gratis',
  'nl': 'Gratis', 'pl': 'Za darmo', 'uk': 'Безкоштовно', 'sv': 'Gratis', 'nb': 'Gratis',
  'fi': 'Ilmainen', 'cs': 'Zdarma', 'hu': 'Ingyenes', 'tr': 'Ücretsiz', 'ja': '無料',
  'th': 'ฟรี', 'vi': 'Miễn phí', 'zh-Hans': '免费', 'zh-Hant': '免費',
};
var AGILE = {
  'en-US': '**Agile, Scrum & Kanban** — run sprints or a Kanban flow, manage your backlog, epics and user stories, and see progress roll up in real time.',
  'en-GB': '**Agile, Scrum & Kanban** — run sprints or a Kanban flow, manage your backlog, epics and user stories, and see progress roll up in real time.',
  'en-AU': '**Agile, Scrum & Kanban** — run sprints or a Kanban flow, manage your backlog, epics and user stories, and see progress roll up in real time.',
  'ru': '**Agile, Scrum и Kanban** — ведите спринты или поток Канбан, управляйте бэклогом, эпиками и пользовательскими историями, а прогресс обновляется в реальном времени.',
  'es': '**Agile, Scrum y Kanban** — ejecuta sprints o un flujo Kanban, gestiona tu backlog, épicas e historias de usuario, y ve el progreso en tiempo real.',
  'de': '**Agile, Scrum & Kanban** — arbeite in Sprints oder im Kanban-Fluss, verwalte Backlog, Epics und User Stories und verfolge den Fortschritt in Echtzeit.',
  'fr': '**Agile, Scrum et Kanban** — menez des sprints ou un flux Kanban, gérez votre backlog, vos epics et user stories, et suivez la progression en temps réel.',
  'fr-CA': '**Agile, Scrum et Kanban** — menez des sprints ou un flux Kanban, gérez votre backlog, vos epics et user stories, et suivez la progression en temps réel.',
  'pt-BR': '**Agile, Scrum e Kanban** — faça sprints ou um fluxo Kanban, gerencie seu backlog, épicos e histórias de usuário, e acompanhe o progresso em tempo real.',
  'it': '**Agile, Scrum e Kanban** — gestisci sprint o un flusso Kanban, il tuo backlog, epiche e user story, e monitora i progressi in tempo reale.',
  'nl': '**Agile, Scrum & Kanban** — werk in sprints of een Kanban-flow, beheer je backlog, epics en user stories en volg de voortgang in realtime.',
  'pl': '**Agile, Scrum i Kanban** — prowadź sprinty lub przepływ Kanban, zarządzaj backlogiem, epikami i historyjkami użytkownika i śledź postęp na bieżąco.',
  'uk': '**Agile, Scrum і Kanban** — ведіть спринти або потік Канбан, керуйте беклогом, епіками та користувацькими історіями, а прогрес оновлюється в реальному часі.',
  'sv': '**Agile, Scrum & Kanban** — kör sprintar eller ett Kanban-flöde, hantera din backlog, epics och user stories och följ framsteg i realtid.',
  'nb': '**Agile, Scrum & Kanban** — kjør sprinter eller en Kanban-flyt, håndter backlog, epics og brukerhistorier, og følg fremdriften i sanntid.',
  'fi': '**Agile, Scrum ja Kanban** — vedä sprinttejä tai Kanban-virtausta, hallitse backlogia, epicejä ja käyttäjätarinoita ja seuraa edistymistä reaaliajassa.',
  'cs': '**Agile, Scrum a Kanban** — veďte sprinty nebo Kanban tok, spravujte backlog, epiky a uživatelské příběhy a sledujte průběh v reálném čase.',
  'hu': '**Agile, Scrum és Kanban** — futtass sprinteket vagy Kanban-folyamatot, kezeld a backlogot, epikeket és felhasználói történeteket, és kövesd a haladást valós időben.',
  'tr': '**Agile, Scrum ve Kanban** — sprint’ler veya Kanban akışı yürütün, backlog’unuzu, epic’leri ve kullanıcı hikayelerini yönetin, ilerlemeyi gerçek zamanlı görün.',
  'ja': '**アジャイル・スクラム・カンバン** — スプリントやカンバンで、バックログ・エピック・ユーザーストーリーを管理し、進捗をリアルタイムで確認できます。',
  'th': '**Agile, Scrum และ Kanban** — ทำงานแบบสปรินต์หรือโฟลว์ Kanban จัดการ backlog, epic และ user story พร้อมดูความคืบหน้าแบบเรียลไทม์',
  'vi': '**Agile, Scrum và Kanban** — chạy sprint hoặc luồng Kanban, quản lý backlog, epic và user story, theo dõi tiến độ theo thời gian thực.',
  'zh-Hans': '**敏捷、Scrum 与看板（Kanban）** — 运行冲刺或看板流程，管理待办列表（backlog）、史诗（epic）和用户故事，实时查看进度。',
  'zh-Hant': '**敏捷、Scrum 與看板（Kanban）** — 執行衝刺或看板流程，管理待辦清單（backlog）、史詩（epic）與使用者故事，即時查看進度。',
};

// Keyword-rich "Also works as" line inserted before the footer on every locale
// (discoverability for: subtasks, WBS, epic/user-story tracker, project/task
// tracker, card relationships…). Honest synonyms only — no features we lack.
var KEYWORDS = {
  'en-US': '**Also works as:** a subtasks manager, parent-child card hierarchy, work breakdown structure (WBS), epic & user-story tracker, project & task tracker, and a way to group, link and roll up related cards — for agencies, product and dev teams.',
  'en-GB': '**Also works as:** a subtasks manager, parent-child card hierarchy, work breakdown structure (WBS), epic & user-story tracker, project & task tracker, and a way to group, link and roll up related cards — for agencies, product and dev teams.',
  'en-AU': '**Also works as:** a subtasks manager, parent-child card hierarchy, work breakdown structure (WBS), epic & user-story tracker, project & task tracker, and a way to group, link and roll up related cards — for agencies, product and dev teams.',
  'ru': '**Также подходит как:** менеджер подзадач (subtasks), иерархия карточек родитель-потомок, work breakdown structure (WBS), трекер эпиков (epics) и user story, трекер проектов и задач, инструмент для группировки и связывания карточек — для агентств, продуктовых и dev-команд.',
  'es': '**También sirve como:** gestor de subtareas (subtasks), jerarquía de tarjetas padre-hijo, estructura de desglose del trabajo (WBS), seguimiento de epics y user stories, gestor de proyectos y tareas, y para agrupar y enlazar tarjetas relacionadas — para agencias, equipos de producto y desarrollo.',
  'de': '**Funktioniert auch als:** Subtask-Manager, Eltern-Kind-Kartenhierarchie, Projektstrukturplan (WBS), Epic- und User-Story-Tracker, Projekt- und Aufgaben-Tracker sowie zum Gruppieren und Verknüpfen zusammengehöriger Karten — für Agenturen, Produkt- und Dev-Teams.',
  'fr': '**Fonctionne aussi comme :** gestionnaire de sous-tâches (subtasks), hiérarchie de cartes parent-enfant, organigramme des tâches (WBS), suivi d’epics et user stories, suivi de projets et tâches, et pour regrouper et lier des cartes liées — pour agences, équipes produit et dev.',
  'fr-CA': '**Fonctionne aussi comme :** gestionnaire de sous-tâches (subtasks), hiérarchie de cartes parent-enfant, organigramme des tâches (WBS), suivi d’epics et user stories, suivi de projets et tâches, et pour regrouper et lier des cartes liées — pour agences, équipes produit et dev.',
  'pt-BR': '**Também funciona como:** gerenciador de subtarefas (subtasks), hierarquia de cartões pai-filho, estrutura analítica do projeto (WBS), acompanhamento de epics e user stories, gestor de projetos e tarefas, e para agrupar e vincular cartões relacionados — para agências, equipes de produto e dev.',
  'it': '**Funziona anche come:** gestore di sotto-attività (subtasks), gerarchia di schede padre-figlio, work breakdown structure (WBS), tracker di epic e user story, tracker di progetti e attività, e per raggruppare e collegare schede correlate — per agenzie, team di prodotto e sviluppo.',
  'nl': '**Werkt ook als:** subtaken-manager (subtasks), ouder-kind kaarthiërarchie, work breakdown structure (WBS), epic- en user-story-tracker, project- en taaktracker, en om gerelateerde kaarten te groeperen en te koppelen — voor agencies, product- en dev-teams.',
  'pl': '**Działa też jako:** menedżer podzadań (subtasks), hierarchia kart rodzic-dziecko, struktura podziału pracy (WBS), śledzenie epików i historyjek użytkownika, tracker projektów i zadań oraz do grupowania i łączenia powiązanych kart — dla agencji, zespołów produktowych i deweloperskich.',
  'uk': '**Також підходить як:** менеджер підзадач (subtasks), ієрархія карток батько-нащадок, структура декомпозиції робіт (WBS), трекер епіків та user story, трекер проєктів і задач, для групування та звʼязування карток — для агенцій, продуктових і dev-команд.',
  'sv': '**Fungerar även som:** hanterare av deluppgifter (subtasks), förälder-barn-korthierarki, work breakdown structure (WBS), epic- och user story-spårning, projekt- och uppgiftsspårare, och för att gruppera och länka relaterade kort — för byråer, produkt- och utvecklingsteam.',
  'nb': '**Fungerer også som:** deloppgave-håndterer (subtasks), forelder-barn-korthierarki, work breakdown structure (WBS), epic- og user story-sporing, prosjekt- og oppgavesporing, og for å gruppere og koble relaterte kort — for byråer, produkt- og utviklingsteam.',
  'fi': '**Toimii myös:** alitehtävien hallinta (subtasks), vanhempi-lapsi-korttihierarkia, työn ositus (WBS), epic- ja user story -seuranta, projekti- ja tehtäväseuranta sekä korttien ryhmittely ja linkitys — toimistoille, tuote- ja kehitystiimeille.',
  'cs': '**Funguje také jako:** správce podúkolů (subtasks), hierarchie karet rodič-potomek, struktura rozpadu práce (WBS), sledování epiců a user stories, sledování projektů a úkolů a pro seskupování a propojování souvisejících karet — pro agentury, produktové a vývojové týmy.',
  'hu': '**Így is használható:** részfeladat-kezelő (subtasks), szülő-gyermek kártyahierarchia, munkalebontási struktúra (WBS), epic- és user story-követés, projekt- és feladatkövető, valamint kártyák csoportosítása és összekapcsolása — ügynökségeknek, termék- és fejlesztőcsapatoknak.',
  'tr': '**Şu işler için de uygundur:** alt görev (subtasks) yöneticisi, üst-alt kart hiyerarşisi, iş kırılım yapısı (WBS), epic ve user story takibi, proje ve görev takibi, ilgili kartları gruplama ve bağlama — ajanslar, ürün ve geliştirme ekipleri için.',
  'ja': '**こんな用途にも:** サブタスク（subtasks）管理、親子カード階層、作業分解構成（WBS）、エピック（epic）・ユーザーストーリー管理、プロジェクト・タスク管理、関連カードのグループ化とリンク — 代理店・プロダクト・開発チーム向け。',
  'th': '**ยังใช้เป็น:** ตัวจัดการงานย่อย (subtasks), ลำดับชั้นการ์ดแบบ parent-child, work breakdown structure (WBS), ติดตาม epic และ user story, ติดตามโปรเจกต์และงาน, จัดกลุ่มและเชื่อมโยงการ์ดที่เกี่ยวข้อง — สำหรับเอเจนซี ทีมผลิตภัณฑ์และทีมพัฒนา',
  'vi': '**Cũng dùng như:** trình quản lý công việc con (subtasks), phân cấp thẻ cha-con, cấu trúc phân rã công việc (WBS), theo dõi epic và user story, theo dõi dự án và công việc, nhóm và liên kết các thẻ liên quan — cho agency, nhóm sản phẩm và phát triển.',
  'zh-Hans': '**还可用作：** 子任务（subtasks）管理、父子卡片层级、工作分解结构（WBS）、史诗（epic）与用户故事跟踪、项目与任务跟踪，以及对相关卡片进行分组和关联 — 适合代理机构、产品与开发团队。',
  'zh-Hant': '**也可用作：** 子任務（subtasks）管理、父子卡片層級、工作分解結構（WBS）、史詩（epic）與使用者故事追蹤、專案與任務追蹤，以及將相關卡片分組與連結 — 適合代理機構、產品與開發團隊。',
};

if (typeof module !== 'undefined' && module.exports) module.exports = { NAME, GIF_BASE, LISTINGS, FREE, AGILE, KEYWORDS };
