# Инструкция: создать Power-Up в Trello (делает Илья)

Делается один раз. Займёт ~3 минуты. Нужно **после** первого деплоя на GitHub Pages (чтобы был URL коннектора).

## Шаг 1. Открыть админку Power-Ups
Перейти: **https://trello.com/power-ups/admin**

## Шаг 2. Создать новый Power-Up
1. Нажать **«New»** (Create new Power-Up).
2. Заполнить:
   - **Name:** `Duck Epics` (любое)
   - **Workspace:** выбрать рабочее пространство, которому принадлежит доска *Duck.design Mission Control* (то же, где лежит доска).
   - **Iframe connector URL:** `https://ilyaradn.github.io/-trello-epics-powerup/index.html`
     *(точный URL я подтвержу после деплоя — он зависит от имени репозитория)*
   - **Email / Author / Support contact:** твои данные.
3. Сохранить.

## Шаг 3. Сгенерировать API Key
1. В созданном Power-Up открыть вкладку **«API Key»**.
2. Нажать **«Generate a new API Key»**.
3. Скопировать **API Key** и прислать мне.
   - ⚠️ **Secret / OAuth Secret — НЕ присылать**, он не нужен и должен оставаться приватным. API Key — публичный, его можно вставлять в код.

## Шаг 4. (если попросит) Указать capabilities
Если админка просит список возможностей — отметить:
`card-buttons`, `card-badges`, `card-detail-badges`, `card-back-section`, `authorization-status`, `show-authorization`.
*(Если такого поля нет — ок, они считываются из кода.)*

## Шаг 5. Включить Power-Up на доске
1. Открыть доску **Duck.design Mission Control**.
2. Меню доски → **Power-Ups** → вкладка **Custom** (или по названию) → **Add / Enable** `Duck Epics`.

## Что прислать мне
- ✅ **API Key** (строка)
- ✅ Подтвердить точный **Iframe connector URL** (после того как я включу GitHub Pages)

Всё остальное (капабилити, логика, авторизация пользователя) — в коде, с твоей стороны больше ничего не нужно.
