/* global Epic, Views */
/* S4 — popup form: create a new Sub-task card under the current Subscription. */
Views.createSubtask = function (t, root) {
  root.innerHTML = '<p class="muted small">Загрузка…</p>';
  return Promise.all([t.card('id', 'idList'), t.lists('id', 'name'), t.board('name')]).then(function (r) {
    var card = r[0], lists = r[1], board = r[2];
    var listOpts = lists.map(function (l) {
      return '<option value="' + l.id + '"' + (l.id === card.idList ? ' selected' : '') + '>' + Views.esc(l.name) + '</option>';
    }).join('');

    root.innerHTML =
      '<label>Название подзадачи</label>' +
      '<input type="text" id="name" placeholder="SUB - ..." autocomplete="off">' +
      '<label>Доска</label>' +
      '<select id="board" disabled><option>' + Views.esc(board.name) + ' (текущая)</option></select>' +
      '<label>Колонка</label><select id="list">' + listOpts + '</select>' +
      '<div class="actions"><button class="btn primary" id="create" disabled>Создать</button>' +
      '<button class="btn" id="cancel">Отмена</button></div>' +
      '<p class="small muted" id="msg"></p>';

    var name = root.querySelector('#name'), create = root.querySelector('#create'), msg = root.querySelector('#msg');
    name.addEventListener('input', function () { create.disabled = !name.value.trim(); });
    name.focus();

    create.addEventListener('click', function () {
      create.disabled = true; msg.textContent = 'Создаю…';
      Epic.createSubtask(t, {
        name: name.value.trim(),
        idList: root.querySelector('#list').value,
        parentId: card.id,
      }).then(function () { return t.closePopup(); })
        .catch(function (e) {
          if (e.message === 'auth') {
            msg.innerHTML = 'Нужна авторизация Trello (для создания карточек).<br>Откройте настройки Power-Up → Authorize.';
          } else { msg.textContent = 'Ошибка: ' + e.message; }
          create.disabled = false;
        });
    });
    root.querySelector('#cancel').addEventListener('click', function () { t.closePopup(); });
    if (t.sizeTo) t.sizeTo(document.body);
  });
};
Views.boot('createSubtask');
