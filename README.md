# Duck Epics — Trello Power-Up

Иерархия **Subscription → Sub-task** для Trello: помечаешь карточку-клиента как Subscription, привязываешь/создаёшь подзадачи, видишь прогресс `X/Y done` и список детей со статусами-колонками. Внутренний аналог [Hello Epics](https://helloepics.com) для duck.design.

## Структура

```
index.html            connector (Trello грузит его в iframe)
js/lib.js             слой данных (связи в board-scoped pluginData) + REST
js/connector.js       регистрация capabilities (buttons, badges, sections)
views/                UI-вьюхи (секции родителя/ребёнка, попапы)
css/style.css         общие стили
server.js             локальный дев-сервер (node server.js → :5050)
test/harness.html     авто-тесты слоя данных
test/views-harness.html  превью всех вьюх на мок-данных
docs/                 требования (BRD v1.0), план разработки, настройка Trello
```

## Локальная разработка

```bash
node server.js
# http://localhost:5050/test/harness.html        — авто-тесты
# http://localhost:5050/test/views-harness.html   — превью вьюх
```

## Развёртывание

Статические файлы на HTTPS (GitHub Pages). Регистрация Power-Up и получение API Key — см. [docs/trello-setup.md](docs/trello-setup.md). Требования — [docs/requirements.md](docs/requirements.md). План — [docs/dev-plan.md](docs/dev-plan.md).

## Статус

Фаза 1 (MVP), в разработке. Готово: слой данных, вьюхи, capabilities. Осталось: REST-авторизация (архивные + создание карточек), живой тест на доске.
