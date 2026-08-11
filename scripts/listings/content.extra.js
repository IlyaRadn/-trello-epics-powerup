/*
 * content.extra.js — the other 22 locales for the Duck Epics listing (see content.js for
 * en-US + ru + docs). Tokens {G1}{G2}{G3} = the 3 demo GIFs (updater expands them).
 * en-GB / en-AU reuse the English master; the rest are machine translations (native review TODO).
 */
var EN_DESC = `## Duck Epics — epics, sub-tasks & progress tracking for Trello

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

Developed by [Duck.design](https://duck.design/)`;
var EN_OV = 'Epics, sub-tasks & parent-child hierarchy for Trello — group cards under a Subscription and track live progress.';

var EXTRA = {
  'en-GB': { overview: EN_OV, description: EN_DESC },
  'en-AU': { overview: EN_OV, description: EN_DESC },

  'es': { overview: 'Épicas, subtareas y jerarquía padre-hijo para Trello: agrupa tarjetas bajo una Suscripción y sigue el progreso en vivo.', description:
`## Duck Epics — épicas, subtareas y seguimiento de progreso para Trello

Duck Epics convierte cualquier tarjeta de Trello en una **Suscripción** (una épica, proyecto o cliente) y agrupa otras tarjetas debajo como **subtareas** — la jerarquía padre → hijo que Trello no ofrece de serie. Ideal para equipos que gestionan clientes o épicas con muchas tareas.

**100% gratis** — todas las funciones incluidas, sin plan de pago.

![Make a Subscription]({G1})

### Qué puedes hacer
- **Marca cualquier tarjeta como Suscripción** y asígnale un icono.
- **Crea subtareas** o **adjunta tarjetas existentes** (varias a la vez) con búsqueda.
- **Barra de progreso en vivo** e insignia **X/Y hecho** en la tarjeta de Suscripción.
- **Filas de subtarea completas** — columna de estado (menú o arrastrar), fecha con resaltado de atraso/próximo, progreso de checklist, asignados, «hecho» en un clic.
- **Edición en línea** — fecha, asignados y un enlace personalizado desde la fila.
- **Nombre del cliente en cada subtarea** — la insignia frontal muestra su padre (cliente/épica).
- **Contrae columnas, ordena por más reciente, filtra** la lista para adjuntar.
- **Subtareas archivadas** agrupadas aparte con Abrir / Desarchivar.

![Create a sub-task]({G2})

### Sigue el progreso a tu manera
Una subtarea se cuenta como hecha cuando llega a tu columna **Completado**, y el progreso se actualiza automáticamente.

![Track status and progress]({G3})

### Ideal para
- **Agencias y estudios de diseño** — una Suscripción por cliente, subtareas por entregable.
- **Equipos de producto y desarrollo** — épicas con subtareas y progreso en vivo.
- **Marketing y proyectos de IA/producto** — agrupa campañas o tareas bajo una épica.

### Privado y rápido
- **Sin servidor externo** — todos tus datos permanecen dentro de Trello.
- Actualizaciones instantáneas y optimistas.

---

Desarrollado por [Duck.design](https://duck.design/)` },

  'de': { overview: 'Epics, Unteraufgaben und Eltern-Kind-Hierarchie für Trello: Karten unter einem Abo gruppieren und den Fortschritt live verfolgen.', description:
`## Duck Epics — Epics, Unteraufgaben & Fortschritt für Trello

Duck Epics macht aus jeder Trello-Karte ein **Abo** (Epic, Projekt oder Kunde) und gruppiert andere Karten darunter als **Unteraufgaben** — die Eltern-→-Kind-Hierarchie, die Trello von Haus aus nicht hat. Ideal für Teams, die Kunden oder Epics mit vielen Aufgaben verwalten.

**100% kostenlos** — alle Funktionen inklusive, kein kostenpflichtiger Tarif.

![Make a Subscription]({G1})

### Was du tun kannst
- **Jede Karte als Abo markieren** und ihr ein Icon geben.
- **Unteraufgaben erstellen** oder **bestehende Karten anhängen** (mehrere auf einmal) mit Suche.
- **Live-Fortschrittsbalken** und ein **X/Y erledigt**-Badge auf der Abo-Karte.
- **Umfangreiche Unteraufgaben-Zeilen** — Statusspalte (Dropdown oder Ziehen), Fälligkeit mit Überfällig-/Bald-Markierung, Checklisten-Fortschritt, Zuständige, «Erledigt» per Klick.
- **Inline bearbeiten** — Fälligkeit, Zuständige und einen eigenen Link direkt in der Zeile.
- **Kundenname auf jeder Unteraufgabe** — das Front-Badge zeigt den Eltern-Eintrag (Kunde/Epic).
- **Spalten ein-/ausklappen, nach neu sortieren, filtern** der Anhängen-Liste.
- **Archivierte Unteraufgaben** separat gruppiert mit Öffnen / Wiederherstellen.

![Create a sub-task]({G2})

### Fertigstellung nach deiner Art
Eine Unteraufgabe gilt als erledigt, sobald sie in deiner **Fertig**-Spalte landet — der Fortschritt aktualisiert sich automatisch.

![Track status and progress]({G3})

### Ideal für
- **Agenturen & Designstudios** — ein Abo pro Kunde, Unteraufgaben je Ergebnis.
- **Produkt- & Dev-Teams** — Epics mit Unteraufgaben und Live-Fortschritt.
- **Marketing- & KI-/Produktprojekte** — Kampagnen oder Aufgaben unter einem Epic bündeln.

### Privat & schnell
- **Kein externer Server** — alle Daten bleiben in Trello.
- Sofortige, optimistische Updates.

---

Entwickelt von [Duck.design](https://duck.design/)` },

  'fr': { overview: 'Épics, sous-tâches et hiérarchie parent-enfant pour Trello : regroupez les cartes sous un Abonnement et suivez la progression en direct.', description:
`## Duck Epics — épics, sous-tâches et progression pour Trello

Duck Epics transforme n'importe quelle carte Trello en **Abonnement** (un épic, un projet ou un client) et regroupe d'autres cartes en dessous comme **sous-tâches** — la hiérarchie parent → enfant que Trello n'offre pas par défaut. Idéal pour les équipes qui gèrent des clients ou des épics avec de nombreuses tâches.

**100% gratuit** — toutes les fonctionnalités incluses, sans offre payante.

![Make a Subscription]({G1})

### Ce que vous pouvez faire
- **Marquer n'importe quelle carte comme Abonnement** et lui donner une icône.
- **Créer des sous-tâches** ou **attacher des cartes existantes** (plusieurs à la fois) avec recherche.
- **Barre de progression en direct** et un badge **X/Y terminé** sur la carte Abonnement.
- **Lignes de sous-tâche riches** — colonne de statut (menu ou glisser), échéance avec surbrillance en retard/bientôt, progression de checklist, assignés, «terminé» en un clic.
- **Édition en ligne** — échéance, assignés et un lien personnalisé depuis la ligne.
- **Nom du client sur chaque sous-tâche** — le badge en façade affiche son parent (client/épic).
- **Réduire les colonnes, trier par récence, filtrer** la liste d'attachement.
- **Sous-tâches archivées** regroupées à part avec Ouvrir / Désarchiver.

![Create a sub-task]({G2})

### Suivez l'achèvement à votre façon
Une sous-tâche est terminée quand elle atteint votre colonne **Terminé** — la progression se met à jour automatiquement.

![Track status and progress]({G3})

### Parfait pour
- **Agences et studios de design** — un Abonnement par client, des sous-tâches par livrable.
- **Équipes produit et dev** — des épics avec sous-tâches et progression en direct.
- **Projets marketing et IA/produit** — regroupez campagnes ou tâches sous un épic.

### Privé et rapide
- **Aucun serveur externe** — toutes vos données restent dans Trello.
- Mises à jour instantanées et optimistes.

---

Développé par [Duck.design](https://duck.design/)` },

  'pt-BR': { overview: 'Épicos, subtarefas e hierarquia pai-filho para o Trello: agrupe cartões sob uma Assinatura e acompanhe o progresso ao vivo.', description:
`## Duck Epics — épicos, subtarefas e progresso para o Trello

O Duck Epics transforma qualquer cartão do Trello em uma **Assinatura** (um épico, projeto ou cliente) e agrupa outros cartões abaixo como **subtarefas** — a hierarquia pai → filho que o Trello não tem por padrão. Ideal para equipes que gerenciam clientes ou épicos com muitas tarefas.

**100% grátis** — todos os recursos incluídos, sem plano pago.

![Make a Subscription]({G1})

### O que você pode fazer
- **Marque qualquer cartão como Assinatura** e dê a ele um ícone.
- **Crie subtarefas** ou **anexe cartões existentes** (vários de uma vez) com busca.
- **Barra de progresso ao vivo** e um selo **X/Y concluído** no cartão de Assinatura.
- **Linhas de subtarefa completas** — coluna de status (menu ou arrastar), prazo com destaque de atrasado/em breve, progresso de checklist, responsáveis, «concluído» em um clique.
- **Edição na linha** — prazo, responsáveis e um link personalizado direto na linha.
- **Nome do cliente em cada subtarefa** — o selo frontal mostra o pai (cliente/épico).
- **Recolher colunas, ordenar por mais recente, filtrar** a lista de anexar.
- **Subtarefas arquivadas** agrupadas à parte com Abrir / Desarquivar.

![Create a sub-task]({G2})

### Acompanhe a conclusão do seu jeito
Uma subtarefa conta como concluída quando chega à sua coluna **Concluído** — o progresso é atualizado automaticamente.

![Track status and progress]({G3})

### Ótimo para
- **Agências e estúdios de design** — uma Assinatura por cliente, subtarefas para cada entrega.
- **Times de produto e dev** — épicos com subtarefas e progresso ao vivo.
- **Projetos de marketing e IA/produto** — agrupe campanhas ou tarefas sob um épico.

### Privado e rápido
- **Sem servidor externo** — todos os seus dados permanecem no Trello.
- Atualizações instantâneas e otimistas.

---

Desenvolvido por [Duck.design](https://duck.design/)` },

  'it': { overview: 'Epic, sotto-attività e gerarchia genitore-figlio per Trello: raggruppa le carte sotto un Abbonamento e monitora i progressi in tempo reale.', description:
`## Duck Epics — epic, sotto-attività e avanzamento per Trello

Duck Epics trasforma qualsiasi scheda di Trello in un **Abbonamento** (un'epica, un progetto o un cliente) e raggruppa altre schede come **sotto-attività** — la gerarchia genitore → figlio che Trello non offre di default. Ideale per team che gestiscono clienti o epiche con molte attività.

**100% gratis** — tutte le funzioni incluse, nessun piano a pagamento.

![Make a Subscription]({G1})

### Cosa puoi fare
- **Segna qualsiasi scheda come Abbonamento** e assegnale un'icona.
- **Crea sotto-attività** o **allega schede esistenti** (diverse alla volta) con ricerca.
- **Barra di avanzamento in tempo reale** e badge **X/Y completato** sulla scheda Abbonamento.
- **Righe di sotto-attività complete** — colonna di stato (menu o trascinamento), scadenza con evidenziazione in ritardo/imminente, avanzamento checklist, assegnatari, «completato» in un clic.
- **Modifica in linea** — scadenza, assegnatari e un link personalizzato dalla riga.
- **Nome del cliente su ogni sotto-attività** — il badge frontale mostra il genitore (cliente/epica).
- **Comprimi colonne, ordina per più recenti, filtra** l'elenco da allegare.
- **Sotto-attività archiviate** raggruppate a parte con Apri / Ripristina.

![Create a sub-task]({G2})

### Monitora il completamento a modo tuo
Una sotto-attività è completata quando arriva nella tua colonna **Completato** — l'avanzamento si aggiorna automaticamente.

![Track status and progress]({G3})

### Perfetto per
- **Agenzie e studi di design** — un Abbonamento per cliente, sotto-attività per ogni consegna.
- **Team di prodotto e sviluppo** — epiche con sotto-attività e avanzamento live.
- **Progetti di marketing e IA/prodotto** — raggruppa campagne o attività sotto un'epica.

### Privato e veloce
- **Nessun server esterno** — tutti i dati restano dentro Trello.
- Aggiornamenti istantanei e ottimistici.

---

Sviluppato da [Duck.design](https://duck.design/)` },

  'fr-CA': { overview: 'Épics, sous-tâches et hiérarchie parent-enfant pour Trello : regroupez les cartes sous un Abonnement et suivez la progression en direct.', description:
`## Duck Epics — épics, sous-tâches et progression pour Trello

Duck Epics transforme n'importe quelle carte Trello en **Abonnement** (un épic, un projet ou un client) et regroupe d'autres cartes en dessous comme **sous-tâches** — la hiérarchie parent → enfant que Trello n'offre pas par défaut. Idéal pour les équipes qui gèrent des clients ou des épics avec de nombreuses tâches.

**100% gratuit** — toutes les fonctionnalités incluses, sans offre payante.

![Make a Subscription]({G1})

### Ce que vous pouvez faire
- **Marquer n'importe quelle carte comme Abonnement** et lui donner une icône.
- **Créer des sous-tâches** ou **attacher des cartes existantes** (plusieurs à la fois) avec recherche.
- **Barre de progression en direct** et un badge **X/Y terminé** sur la carte Abonnement.
- **Lignes de sous-tâche riches** — colonne de statut (menu ou glisser), échéance avec surbrillance en retard/bientôt, progression de checklist, assignés, «terminé» en un clic.
- **Édition en ligne** — échéance, assignés et un lien personnalisé depuis la ligne.
- **Nom du client sur chaque sous-tâche** — le badge en façade affiche son parent (client/épic).
- **Réduire les colonnes, trier par récence, filtrer** la liste d'attachement.
- **Sous-tâches archivées** regroupées à part avec Ouvrir / Désarchiver.

![Create a sub-task]({G2})

### Suivez l'achèvement à votre façon
Une sous-tâche est terminée quand elle atteint votre colonne **Terminé** — la progression se met à jour automatiquement.

![Track status and progress]({G3})

### Parfait pour
- **Agences et studios de design** — un Abonnement par client, des sous-tâches par livrable.
- **Équipes produit et dev** — des épics avec sous-tâches et progression en direct.
- **Projets marketing et IA/produit** — regroupez campagnes ou tâches sous un épic.

### Privé et rapide
- **Aucun serveur externe** — toutes vos données restent dans Trello.
- Mises à jour instantanées et optimistes.

---

Développé par [Duck.design](https://duck.design/)` },

  'nl': { overview: 'Epics, subtaken en ouder-kind-hiërarchie voor Trello: groepeer kaarten onder een Abonnement en volg de voortgang live.', description:
`## Duck Epics — epics, subtaken & voortgang voor Trello

Duck Epics maakt van elke Trello-kaart een **Abonnement** (een epic, project of klant) en groepeert andere kaarten eronder als **subtaken** — de ouder → kind-hiërarchie die Trello standaard niet heeft. Ideaal voor teams die klanten of epics met veel taken beheren.

**100% gratis** — alle functies inbegrepen, geen betaald abonnement.

![Make a Subscription]({G1})

### Wat je kunt doen
- **Markeer elke kaart als Abonnement** en geef het een icoon.
- **Maak subtaken** of **koppel bestaande kaarten** (meerdere tegelijk) met zoeken.
- **Live voortgangsbalk** en een **X/Y klaar**-badge op de Abonnementskaart.
- **Uitgebreide subtaak-rijen** — statuskolom (dropdown of slepen), einddatum met te-laat/binnenkort-markering, checklist-voortgang, toegewezenen, «klaar» met één klik.
- **Inline bewerken** — einddatum, toegewezenen en een eigen link direct in de rij.
- **Klantnaam op elke subtaak** — de badge vooraan toont de ouder (klant/epic).
- **Kolommen in-/uitklappen, sorteren op nieuwste, filteren** van de koppellijst.
- **Gearchiveerde subtaken** apart gegroepeerd met Openen / Herstellen.

![Create a sub-task]({G2})

### Volg voltooiing op jouw manier
Een subtaak is klaar zodra hij in je **Voltooid**-kolom komt — de voortgang wordt automatisch bijgewerkt.

![Track status and progress]({G3})

### Ideaal voor
- **Bureaus & designstudio's** — één Abonnement per klant, subtaken per opgeleverd werk.
- **Product- & devteams** — epics met subtaken en live voortgang.
- **Marketing- & AI/productprojecten** — groepeer campagnes of taken onder één epic.

### Privé & snel
- **Geen externe server** — al je data blijft in Trello.
- Directe, optimistische updates.

---

Ontwikkeld door [Duck.design](https://duck.design/)` },

  'pl': { overview: 'Epiki, podzadania i hierarchia rodzic-dziecko dla Trello: grupuj karty pod Subskrypcją i śledź postęp na żywo.', description:
`## Duck Epics — epiki, podzadania i postęp dla Trello

Duck Epics zamienia dowolną kartę Trello w **Subskrypcję** (epik, projekt lub klienta) i grupuje pod nią inne karty jako **podzadania** — hierarchię rodzic → dziecko, której Trello nie ma domyślnie. Idealne dla zespołów zarządzających klientami lub epikami z wieloma zadaniami.

**100% za darmo** — wszystkie funkcje w zestawie, bez płatnego planu.

![Make a Subscription]({G1})

### Co możesz zrobić
- **Oznacz dowolną kartę jako Subskrypcję** i nadaj jej ikonę.
- **Twórz podzadania** lub **dołączaj istniejące karty** (kilka naraz) z wyszukiwaniem.
- **Pasek postępu na żywo** i plakietka **X/Y gotowe** na karcie Subskrypcji.
- **Rozbudowane wiersze podzadań** — kolumna statusu (lista lub przeciąganie), termin z podświetleniem zaległości/wkrótce, postęp listy kontrolnej, przypisani, «gotowe» jednym kliknięciem.
- **Edycja w wierszu** — termin, przypisani i własny link bezpośrednio w wierszu.
- **Nazwa klienta na każdym podzadaniu** — plakietka z przodu pokazuje rodzica (klient/epik).
- **Zwijanie kolumn, sortowanie od najnowszych, filtrowanie** listy dołączania.
- **Zarchiwizowane podzadania** pogrupowane osobno z Otwórz / Przywróć.

![Create a sub-task]({G2})

### Śledź ukończenie po swojemu
Podzadanie jest gotowe, gdy trafia do kolumny **Ukończone** — postęp aktualizuje się automatycznie.

![Track status and progress]({G3})

### Świetne dla
- **Agencji i studiów projektowych** — jedna Subskrypcja na klienta, podzadania na każdy element.
- **Zespołów produktowych i deweloperskich** — epiki z podzadaniami i postępem na żywo.
- **Projektów marketingowych i AI/produktowych** — grupuj kampanie lub zadania pod jednym epikiem.

### Prywatnie i szybko
- **Bez zewnętrznego serwera** — wszystkie dane pozostają w Trello.
- Natychmiastowe, optymistyczne aktualizacje.

---

Stworzone przez [Duck.design](https://duck.design/)` },

  'uk': { overview: 'Епіки, підзадачі та ієрархія батько-дитина для Trello: групуйте картки під Підпискою та стежте за прогресом наживо.', description:
`## Duck Epics — епіки, підзадачі та прогрес для Trello

Duck Epics перетворює будь-яку картку Trello на **Підписку** (епік, проєкт або клієнта) і групує під нею інші картки як **підзадачі** — ієрархію батько → дитина, якої Trello не має за замовчуванням. Ідеально для команд, що ведуть клієнтів або епіки з багатьма задачами.

**100% безкоштовно** — усі функції включені, без платних тарифів.

![Make a Subscription]({G1})

### Що вміє
- **Позначте будь-яку картку як Підписку** і задайте їй іконку.
- **Створюйте підзадачі** або **прикріплюйте наявні картки** (кілька одразу) з пошуком.
- **Живий індикатор прогресу** та бейдж **X/Y готово** на картці Підписки.
- **Насичені рядки підзадач** — колонка статусу (список або перетягування), термін з підсвіткою прострочення/скоро, прогрес чек-листа, виконавці, «готово» в один клік.
- **Редагування в рядку** — термін, виконавці та власне посилання прямо в рядку.
- **Ім'я клієнта на кожній підзадачі** — бейдж спереду показує батька (клієнт/епік).
- **Згортання колонок, сортування за новизною, фільтр** списку прикріплення.
- **Архівні підзадачі** згруповані окремо з Відкрити / Розархівувати.

![Create a sub-task]({G2})

### Відстежуйте завершення по-своєму
Підзадача вважається готовою, коли потрапляє до вашої колонки **Завершено** — прогрес оновлюється автоматично.

![Track status and progress]({G3})

### Чудово для
- **Агенцій і дизайн-студій** — одна Підписка на клієнта, підзадачі на кожен результат.
- **Продуктових і dev-команд** — епіки з підзадачами та живим прогресом.
- **Маркетингових і AI/продуктових проєктів** — групуйте кампанії чи задачі під одним епіком.

### Приватно і швидко
- **Без зовнішнього сервера** — усі дані залишаються в Trello.
- Миттєві, оптимістичні оновлення.

---

Розроблено в [Duck.design](https://duck.design/)` },

  'sv': { overview: 'Epics, deluppgifter och förälder-barn-hierarki för Trello: gruppera kort under en Prenumeration och följ förloppet live.', description:
`## Duck Epics — epics, deluppgifter & förlopp för Trello

Duck Epics gör vilket Trello-kort som helst till en **Prenumeration** (en epic, ett projekt eller en kund) och grupperar andra kort under det som **deluppgifter** — förälder → barn-hierarkin som Trello saknar som standard. Perfekt för team som hanterar kunder eller epics med många uppgifter.

**100% gratis** — alla funktioner ingår, ingen betald plan.

![Make a Subscription]({G1})

### Vad du kan göra
- **Markera valfritt kort som Prenumeration** och ge det en ikon.
- **Skapa deluppgifter** eller **koppla befintliga kort** (flera samtidigt) med sökning.
- **Live-förloppsindikator** och en **X/Y klart**-bricka på Prenumerationskortet.
- **Rika deluppgiftsrader** — statuskolumn (rullgardin eller dra), förfallodatum med försenad/snart-markering, checklisteförlopp, tilldelade, «klar» med ett klick.
- **Redigera direkt i raden** — förfallodatum, tilldelade och en egen länk.
- **Kundnamn på varje deluppgift** — brickan framtill visar föräldern (kund/epic).
- **Fäll ihop kolumner, sortera efter senaste, filtrera** kopplingslistan.
- **Arkiverade deluppgifter** grupperade separat med Öppna / Återställ.

![Create a sub-task]({G2})

### Följ slutförande på ditt sätt
En deluppgift räknas som klar när den når din **Klar**-kolumn — förloppet uppdateras automatiskt.

![Track status and progress]({G3})

### Perfekt för
- **Byråer & designstudior** — en Prenumeration per kund, deluppgifter för varje leverans.
- **Produkt- & utvecklingsteam** — epics med deluppgifter och live-förlopp.
- **Marknadsförings- & AI/produktprojekt** — gruppera kampanjer eller uppgifter under en epic.

### Privat & snabbt
- **Ingen extern server** — all din data stannar i Trello.
- Omedelbara, optimistiska uppdateringar.

---

Utvecklad av [Duck.design](https://duck.design/)` },

  'nb': { overview: 'Epics, deloppgaver og foreldre-barn-hierarki for Trello: grupper kort under et Abonnement og følg fremdriften live.', description:
`## Duck Epics — epics, deloppgaver & fremdrift for Trello

Duck Epics gjør et hvilket som helst Trello-kort til et **Abonnement** (en epic, et prosjekt eller en kunde) og grupperer andre kort under det som **deloppgaver** — foreldre → barn-hierarkiet som Trello mangler som standard. Perfekt for team som håndterer kunder eller epics med mange oppgaver.

**100% gratis** — alle funksjoner inkludert, ingen betalt plan.

![Make a Subscription]({G1})

### Hva du kan gjøre
- **Merk et hvilket som helst kort som Abonnement** og gi det et ikon.
- **Opprett deloppgaver** eller **koble til eksisterende kort** (flere om gangen) med søk.
- **Live fremdriftslinje** og et **X/Y ferdig**-merke på Abonnementskortet.
- **Rike deloppgave-rader** — statuskolonne (nedtrekk eller dra), frist med forfalt/snart-utheving, sjekklistefremdrift, tilordnede, «ferdig» med ett klikk.
- **Rediger direkte i raden** — frist, tilordnede og en egen lenke.
- **Kundenavn på hver deloppgave** — merket foran viser forelderen (kunde/epic).
- **Skjul kolonner, sorter etter nyeste, filtrer** tilkoblingslisten.
- **Arkiverte deloppgaver** gruppert separat med Åpne / Gjenopprett.

![Create a sub-task]({G2})

### Følg fullføring på din måte
En deloppgave regnes som ferdig når den når din **Fullført**-kolonne — fremdriften oppdateres automatisk.

![Track status and progress]({G3})

### Perfekt for
- **Byråer & designstudioer** — ett Abonnement per kunde, deloppgaver for hver leveranse.
- **Produkt- & utviklingsteam** — epics med deloppgaver og live fremdrift.
- **Markedsførings- & AI/produktprosjekter** — grupper kampanjer eller oppgaver under én epic.

### Privat & raskt
- **Ingen ekstern server** — alle dataene dine forblir i Trello.
- Umiddelbare, optimistiske oppdateringer.

---

Utviklet av [Duck.design](https://duck.design/)` },

  'fi': { overview: 'Eepokset, alitehtävät ja vanhempi-lapsi-hierarkia Trellolle: ryhmittele kortit Tilauksen alle ja seuraa edistymistä reaaliajassa.', description:
`## Duck Epics — eepokset, alitehtävät & edistyminen Trellolle

Duck Epics muuttaa minkä tahansa Trello-kortin **Tilaukseksi** (eepos, projekti tai asiakas) ja ryhmittelee muut kortit sen alle **alitehtäviksi** — vanhempi → lapsi -hierarkia, jota Trellossa ei ole oletuksena. Sopii tiimeille, jotka hallitsevat asiakkaita tai eepoksia, joissa on paljon tehtäviä.

**100% ilmainen** — kaikki ominaisuudet mukana, ei maksullista tilausta.

![Make a Subscription]({G1})

### Mitä voit tehdä
- **Merkitse mikä tahansa kortti Tilaukseksi** ja anna sille kuvake.
- **Luo alitehtäviä** tai **liitä olemassa olevia kortteja** (useita kerralla) haulla.
- **Reaaliaikainen edistymispalkki** ja **X/Y valmis** -merkki Tilauskortissa.
- **Monipuoliset alitehtävärivit** — tilasarake (valikko tai vetäminen), eräpäivä myöhässä/pian-korostuksella, tarkistuslistan edistyminen, vastuuhenkilöt, «valmis» yhdellä napsautuksella.
- **Muokkaa rivillä** — eräpäivä, vastuuhenkilöt ja oma linkki.
- **Asiakkaan nimi jokaisessa alitehtävässä** — etumerkki näyttää vanhemman (asiakas/eepos).
- **Tiivistä sarakkeet, lajittele uusimman mukaan, suodata** liitoslista.
- **Arkistoidut alitehtävät** ryhmitelty erikseen: Avaa / Palauta.

![Create a sub-task]({G2})

### Seuraa valmistumista omalla tavallasi
Alitehtävä on valmis, kun se saapuu **Valmis**-sarakkeeseen — edistyminen päivittyy automaattisesti.

![Track status and progress]({G3})

### Loistava
- **Toimistoille & suunnittelustudioille** — yksi Tilaus per asiakas, alitehtävä jokaiselle toimitukselle.
- **Tuote- & kehitystiimeille** — eepoksia alitehtävineen ja reaaliaikaisella edistymisellä.
- **Markkinointi- & AI/tuoteprojekteille** — ryhmittele kampanjat tai tehtävät yhden eepoksen alle.

### Yksityinen & nopea
- **Ei ulkoista palvelinta** — kaikki tietosi pysyvät Trellossa.
- Välittömät, optimistiset päivitykset.

---

Kehittänyt [Duck.design](https://duck.design/)` },

  'cs': { overview: 'Epiky, dílčí úkoly a hierarchie rodič-dítě pro Trello: seskupte karty pod Předplatné a sledujte průběh živě.', description:
`## Duck Epics — epiky, dílčí úkoly & průběh pro Trello

Duck Epics promění libovolnou kartu Trello v **Předplatné** (epik, projekt nebo klient) a seskupí pod ni další karty jako **dílčí úkoly** — hierarchii rodič → dítě, kterou Trello standardně nemá. Ideální pro týmy spravující klienty nebo epiky s mnoha úkoly.

**100% zdarma** — všechny funkce v ceně, žádný placený plán.

![Make a Subscription]({G1})

### Co umí
- **Označte libovolnou kartu jako Předplatné** a přiřaďte jí ikonu.
- **Vytvářejte dílčí úkoly** nebo **připojte existující karty** (několik najednou) s vyhledáváním.
- **Živý ukazatel průběhu** a odznak **X/Y hotovo** na kartě Předplatného.
- **Bohaté řádky dílčích úkolů** — sloupec stavu (nabídka nebo přetažení), termín se zvýrazněním po termínu/brzy, průběh kontrolního seznamu, přiřazení, «hotovo» na jedno kliknutí.
- **Úpravy přímo v řádku** — termín, přiřazení a vlastní odkaz.
- **Jméno klienta u každého dílčího úkolu** — přední odznak ukazuje rodiče (klient/epik).
- **Sbalte sloupce, seřaďte podle nejnovějších, filtrujte** seznam připojení.
- **Archivované dílčí úkoly** seskupené zvlášť s Otevřít / Obnovit.

![Create a sub-task]({G2})

### Sledujte dokončení po svém
Dílčí úkol je hotový, jakmile se dostane do vašeho sloupce **Dokončeno** — průběh se aktualizuje automaticky.

![Track status and progress]({G3})

### Skvělé pro
- **Agentury a designová studia** — jedno Předplatné na klienta, dílčí úkoly na každý výstup.
- **Produktové a vývojové týmy** — epiky s dílčími úkoly a živým průběhem.
- **Marketingové a AI/produktové projekty** — seskupte kampaně nebo úkoly pod jeden epik.

### Soukromé a rychlé
- **Žádný externí server** — všechna vaše data zůstávají v Trellu.
- Okamžité, optimistické aktualizace.

---

Vyvinuto: [Duck.design](https://duck.design/)` },

  'hu': { overview: 'Epikek, részfeladatok és szülő-gyermek hierarchia a Trellóhoz: csoportosítsd a kártyákat egy Előfizetés alá, és kövesd a haladást élőben.', description:
`## Duck Epics — epikek, részfeladatok & haladás a Trellóhoz

A Duck Epics bármely Trello-kártyát **Előfizetéssé** alakít (epik, projekt vagy ügyfél), és más kártyákat csoportosít alá **részfeladatként** — a szülő → gyermek hierarchia, ami alapból hiányzik a Trellóból. Ideális csapatoknak, akik ügyfeleket vagy sok feladatból álló epikeket kezelnek.

**100% ingyenes** — minden funkció benne van, nincs fizetős csomag.

![Make a Subscription]({G1})

### Mit tudsz csinálni
- **Jelölj meg bármely kártyát Előfizetésként** és adj neki ikont.
- **Hozz létre részfeladatokat** vagy **csatolj meglévő kártyákat** (többet egyszerre) kereséssel.
- **Élő haladásjelző** és **X/Y kész** jelvény az Előfizetés kártyán.
- **Gazdag részfeladat-sorok** — státuszoszlop (legördülő vagy húzás), határidő lejárt/hamarosan kiemeléssel, ellenőrzőlista-haladás, felelősök, «kész» egy kattintással.
- **Szerkesztés a sorban** — határidő, felelősök és egyéni link.
- **Ügyfélnév minden részfeladaton** — az elülső jelvény mutatja a szülőt (ügyfél/epik).
- **Oszlopok összecsukása, rendezés legújabb szerint, szűrés** a csatolási listán.
- **Archivált részfeladatok** külön csoportosítva: Megnyitás / Visszaállítás.

![Create a sub-task]({G2})

### Kövesd a befejezést a magad módján
Egy részfeladat akkor kész, amikor a **Kész** oszlopba kerül — a haladás automatikusan frissül.

![Track status and progress]({G3})

### Kiváló
- **Ügynökségeknek & dizájnstúdióknak** — egy Előfizetés ügyfelenként, részfeladat minden leszállítandóra.
- **Termék- & fejlesztőcsapatoknak** — epikek részfeladatokkal és élő haladással.
- **Marketing- & AI/termékprojekteknek** — csoportosíts kampányokat vagy feladatokat egy epik alá.

### Privát & gyors
- **Nincs külső szerver** — minden adatod a Trellóban marad.
- Azonnali, optimista frissítések.

---

Készítette: [Duck.design](https://duck.design/)` },

  'tr': { overview: 'Trello için epikler, alt görevler ve ebeveyn-çocuk hiyerarşisi: kartları bir Abonelik altında grupla ve ilerlemeyi canlı takip et.', description:
`## Duck Epics — Trello için epikler, alt görevler & ilerleme

Duck Epics herhangi bir Trello kartını bir **Aboneliğe** (epik, proje veya müşteri) dönüştürür ve diğer kartları altında **alt görevler** olarak gruplar — Trello'da varsayılan olarak bulunmayan ebeveyn → çocuk hiyerarşisi. Çok sayıda görevle müşteri veya epik yöneten ekipler için idealdir.

**%100 ücretsiz** — tüm özellikler dahil, ücretli plan yok.

![Make a Subscription]({G1})

### Neler yapabilirsin
- **Herhangi bir kartı Abonelik olarak işaretle** ve ona bir simge ver.
- **Alt görevler oluştur** veya **mevcut kartları ekle** (aynı anda birkaç tane) aramayla.
- **Canlı ilerleme çubuğu** ve Abonelik kartında **X/Y tamamlandı** rozeti.
- **Zengin alt görev satırları** — durum sütunu (açılır menü veya sürükleme), gecikmiş/yakında vurgulu bitiş tarihi, kontrol listesi ilerlemesi, atananlar, tek tıkla «tamamlandı».
- **Satır içi düzenleme** — bitiş tarihi, atananlar ve özel bağlantı.
- **Her alt görevde müşteri adı** — öndeki rozet ebeveyni gösterir (müşteri/epik).
- **Sütunları daralt, en yeniye göre sırala, filtrele** ekleme listesini.
- **Arşivlenmiş alt görevler** ayrı gruplanır: Aç / Arşivden çıkar.

![Create a sub-task]({G2})

### Tamamlanmayı kendi yönteminle takip et
Bir alt görev, **Tamamlandı** sütununa ulaştığında tamamlanmış sayılır — ilerleme otomatik güncellenir.

![Track status and progress]({G3})

### Şunlar için harika
- **Ajanslar & tasarım stüdyoları** — müşteri başına bir Abonelik, her teslimat için alt görev.
- **Ürün & geliştirme ekipleri** — alt görevli epikler ve canlı ilerleme.
- **Pazarlama & AI/ürün projeleri** — kampanyaları veya görevleri tek bir epik altında grupla.

### Özel & hızlı
- **Harici sunucu yok** — tüm verilerin Trello içinde kalır.
- Anında, iyimser güncellemeler.

---

Geliştiren: [Duck.design](https://duck.design/)` },

  'ja': { overview: 'Trello向けのエピック、サブタスク、親子階層。カードをサブスクリプションの下にグループ化し、進捗をライブで追跡。', description:
`## Duck Epics — Trello のエピック・サブタスク・進捗管理

Duck Epics は任意の Trello カードを**サブスクリプション**（エピック・プロジェクト・クライアント）に変え、他のカードを**サブタスク**としてその下にグループ化します。Trello に標準ではない親 → 子の階層です。多くのタスクを持つクライアントやエピックを管理するチームに最適。

**100% 無料** — すべての機能を含み、有料プランはありません。

![Make a Subscription]({G1})

### できること
- **任意のカードをサブスクリプションに設定**し、アイコンを付与。
- **サブタスクを作成**または**既存のカードを添付**（一度に複数）、検索付き。
- サブスクリプションカードに**ライブ進捗バー**と **X/Y 完了**バッジ。
- **充実したサブタスク行** — ステータス列（ドロップダウンまたはドラッグ）、期限（遅延/間近ハイライト）、チェックリスト進捗、担当者、ワンクリック「完了」。
- **行内で編集** — 期限、担当者、カスタムリンク。
- **各サブタスクにクライアント名** — 前面バッジが親（クライアント/エピック）を表示。
- 添付リストの**列の折りたたみ、新しい順の並べ替え、フィルター**。
- **アーカイブ済みサブタスク**は別グループで「開く／アーカイブ解除」。

![Create a sub-task]({G2})

### 自分のやり方で完了を追跡
サブタスクは**完了**列に入ると完了とみなされ、進捗は自動更新されます。

![Track status and progress]({G3})

### こんなチームに最適
- **代理店・デザインスタジオ** — クライアントごとに1つのサブスクリプション、成果物ごとにサブタスク。
- **プロダクト・開発チーム** — サブタスク付きのエピックとライブ進捗。
- **マーケティング・AI/プロダクト案件** — キャンペーンやタスクを1つのエピックにまとめる。

### プライベートで高速
- **外部サーバーなし** — すべてのデータは Trello 内に保持。
- 即時・楽観的な更新。

---

開発元: [Duck.design](https://duck.design/)` },

  'th': { overview: 'อีพิก งานย่อย และลำดับชั้นแม่-ลูกสำหรับ Trello: จัดกลุ่มการ์ดไว้ใต้การสมัครสมาชิก และติดตามความคืบหน้าแบบเรียลไทม์', description:
`## Duck Epics — อีพิก งานย่อย และความคืบหน้าสำหรับ Trello

Duck Epics เปลี่ยนการ์ด Trello ใดก็ได้ให้เป็น **การสมัครสมาชิก** (อีพิก โปรเจกต์ หรือลูกค้า) และจัดกลุ่มการ์ดอื่นไว้ข้างใต้เป็น **งานย่อย** — ลำดับชั้นแม่ → ลูกที่ Trello ไม่มีมาให้ เหมาะกับทีมที่ดูแลลูกค้าหรืออีพิกที่มีงานจำนวนมาก

**ฟรี 100%** — รวมทุกฟีเจอร์ ไม่มีแพ็กเกจแบบเสียเงิน

![Make a Subscription]({G1})

### สิ่งที่คุณทำได้
- **ทำเครื่องหมายการ์ดใดก็ได้เป็นการสมัครสมาชิก** และกำหนดไอคอน
- **สร้างงานย่อย** หรือ **แนบการ์ดที่มีอยู่** (หลายใบพร้อมกัน) พร้อมค้นหา
- **แถบความคืบหน้าแบบเรียลไทม์** และป้าย **X/Y เสร็จ** บนการ์ดการสมัครสมาชิก
- **แถวงานย่อยที่สมบูรณ์** — คอลัมน์สถานะ (ดรอปดาวน์หรือลาก) กำหนดส่งพร้อมไฮไลต์เกินกำหนด/ใกล้ถึง ความคืบหน้าเช็กลิสต์ ผู้รับผิดชอบ และปุ่ม «เสร็จ» คลิกเดียว
- **แก้ไขในแถว** — กำหนดส่ง ผู้รับผิดชอบ และลิงก์ที่กำหนดเอง
- **ชื่อลูกค้าบนทุกงานย่อย** — ป้ายด้านหน้าแสดงรายการแม่ (ลูกค้า/อีพิก)
- **ยุบคอลัมน์ เรียงตามใหม่สุด กรอง** รายการแนบ
- **งานย่อยที่เก็บถาวร** จัดกลุ่มแยกพร้อม เปิด / เลิกเก็บถาวร

![Create a sub-task]({G2})

### ติดตามการเสร็จสิ้นในแบบของคุณ
งานย่อยจะถือว่าเสร็จเมื่อไปถึงคอลัมน์ **เสร็จสิ้น** ของคุณ — ความคืบหน้าจะอัปเดตอัตโนมัติ

![Track status and progress]({G3})

### เหมาะสำหรับ
- **เอเจนซีและสตูดิโอออกแบบ** — หนึ่งการสมัครสมาชิกต่อลูกค้า งานย่อยสำหรับทุกงานส่งมอบ
- **ทีมผลิตภัณฑ์และนักพัฒนา** — อีพิกพร้อมงานย่อยและความคืบหน้าแบบเรียลไทม์
- **โปรเจกต์การตลาดและ AI/ผลิตภัณฑ์** — จัดกลุ่มแคมเปญหรืองานไว้ใต้อีพิกเดียว

### เป็นส่วนตัวและรวดเร็ว
- **ไม่มีเซิร์ฟเวอร์ภายนอก** — ข้อมูลทั้งหมดอยู่ใน Trello
- อัปเดตทันทีแบบ optimistic

---

พัฒนาโดย [Duck.design](https://duck.design/)` },

  'vi': { overview: 'Epic, nhiệm vụ con và phân cấp cha-con cho Trello: nhóm các thẻ dưới một Đăng ký và theo dõi tiến độ trực tiếp.', description:
`## Duck Epics — epic, nhiệm vụ con & tiến độ cho Trello

Duck Epics biến bất kỳ thẻ Trello nào thành **Đăng ký** (epic, dự án hoặc khách hàng) và nhóm các thẻ khác bên dưới thành **nhiệm vụ con** — hệ phân cấp cha → con mà Trello không có sẵn. Lý tưởng cho các nhóm quản lý khách hàng hoặc epic với nhiều nhiệm vụ.

**Miễn phí 100%** — bao gồm mọi tính năng, không có gói trả phí.

![Make a Subscription]({G1})

### Bạn có thể làm gì
- **Đánh dấu bất kỳ thẻ nào là Đăng ký** và gán biểu tượng.
- **Tạo nhiệm vụ con** hoặc **đính kèm thẻ hiện có** (nhiều thẻ cùng lúc) với tìm kiếm.
- **Thanh tiến độ trực tiếp** và huy hiệu **X/Y hoàn thành** trên thẻ Đăng ký.
- **Hàng nhiệm vụ con phong phú** — cột trạng thái (menu hoặc kéo), hạn chót với đánh dấu quá hạn/sắp tới, tiến độ danh sách kiểm, người phụ trách, «hoàn thành» một chạm.
- **Chỉnh sửa ngay trong hàng** — hạn chót, người phụ trách và liên kết tùy chỉnh.
- **Tên khách hàng trên mỗi nhiệm vụ con** — huy hiệu mặt trước hiển thị thẻ cha (khách hàng/epic).
- **Thu gọn cột, sắp xếp mới nhất, lọc** danh sách đính kèm.
- **Nhiệm vụ con đã lưu trữ** nhóm riêng với Mở / Bỏ lưu trữ.

![Create a sub-task]({G2})

### Theo dõi hoàn thành theo cách của bạn
Một nhiệm vụ con được tính là hoàn thành khi vào cột **Hoàn thành** — tiến độ tự động cập nhật.

![Track status and progress]({G3})

### Tuyệt vời cho
- **Agency & studio thiết kế** — một Đăng ký mỗi khách hàng, nhiệm vụ con cho từng sản phẩm bàn giao.
- **Nhóm sản phẩm & phát triển** — epic với nhiệm vụ con và tiến độ trực tiếp.
- **Dự án marketing & AI/sản phẩm** — nhóm chiến dịch hoặc nhiệm vụ dưới một epic.

### Riêng tư & nhanh
- **Không máy chủ bên ngoài** — mọi dữ liệu của bạn ở lại trong Trello.
- Cập nhật tức thì, lạc quan.

---

Phát triển bởi [Duck.design](https://duck.design/)` },

  'zh-Hans': { overview: 'Trello 的史诗、子任务和父子层级：将卡片归组到订阅下，并实时跟踪进度。', description:
`## Duck Epics — Trello 的史诗、子任务与进度跟踪

Duck Epics 将任意 Trello 卡片变为**订阅**（史诗、项目或客户），并把其他卡片作为**子任务**归组到其下——这是 Trello 默认没有的父 → 子层级。非常适合管理客户或包含大量任务的史诗的团队。

**100% 免费** — 包含所有功能，没有付费套餐。

![Make a Subscription]({G1})

### 你可以做什么
- **将任意卡片标记为订阅**并为其设置图标。
- **创建子任务**或**附加现有卡片**（一次多个），支持搜索。
- 订阅卡片上的**实时进度条**和 **X/Y 完成**徽章。
- **丰富的子任务行** — 状态列（下拉或拖拽）、带逾期/即将到期高亮的截止日期、清单进度、负责人、一键「完成」。
- **行内编辑** — 截止日期、负责人和自定义链接。
- **每个子任务显示客户名称** — 正面徽章显示其父项（客户/史诗）。
- 附加列表的**折叠列、按最新排序、筛选**。
- **已归档子任务**单独分组，支持 打开 / 取消归档。

![Create a sub-task]({G2})

### 按你的方式跟踪完成
子任务进入你的**已完成**列即算完成——进度自动更新。

![Track status and progress]({G3})

### 非常适合
- **代理机构与设计工作室** — 每个客户一个订阅，每个交付物一个子任务。
- **产品与开发团队** — 带子任务的史诗和实时进度。
- **营销与 AI/产品项目** — 将活动或任务归组到一个史诗下。

### 私密且快速
- **无外部服务器** — 你的所有数据都保留在 Trello 中。
- 即时、乐观的更新。

---

由 [Duck.design](https://duck.design/) 开发` },

  'zh-Hant': { overview: 'Trello 的史詩、子任務與父子層級：將卡片歸類到訂閱之下，並即時追蹤進度。', description:
`## Duck Epics — Trello 的史詩、子任務與進度追蹤

Duck Epics 將任意 Trello 卡片變為**訂閱**（史詩、專案或客戶），並把其他卡片作為**子任務**歸類到其下——這是 Trello 預設沒有的父 → 子層級。非常適合管理客戶或包含大量任務的史詩的團隊。

**100% 免費** — 包含所有功能，沒有付費方案。

![Make a Subscription]({G1})

### 你可以做什麼
- **將任意卡片標記為訂閱**並為其設定圖示。
- **建立子任務**或**附加現有卡片**（一次多個），支援搜尋。
- 訂閱卡片上的**即時進度條**和 **X/Y 完成**徽章。
- **豐富的子任務列** — 狀態欄（下拉或拖曳）、帶逾期/即將到期標示的截止日期、清單進度、負責人、一鍵「完成」。
- **列內編輯** — 截止日期、負責人和自訂連結。
- **每個子任務顯示客戶名稱** — 正面徽章顯示其父項（客戶/史詩）。
- 附加清單的**折疊欄、依最新排序、篩選**。
- **已封存子任務**單獨分組，支援 開啟 / 取消封存。

![Create a sub-task]({G2})

### 用你的方式追蹤完成
子任務進入你的**已完成**欄即算完成——進度自動更新。

![Track status and progress]({G3})

### 非常適合
- **代理商與設計工作室** — 每個客戶一個訂閱，每個交付物一個子任務。
- **產品與開發團隊** — 帶子任務的史詩和即時進度。
- **行銷與 AI/產品專案** — 將活動或任務歸類到一個史詩下。

### 私密且快速
- **無外部伺服器** — 你的所有資料都保留在 Trello 中。
- 即時、樂觀的更新。

---

由 [Duck.design](https://duck.design/) 開發` }
};

if (typeof module !== 'undefined' && module.exports) module.exports = { EXTRA };
