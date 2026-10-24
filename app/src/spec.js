// Единый источник истины для интерфейса и отчётов: функции, операции,
// экранные формы, структура главного меню и его состояния (ЛР1).

export const APP_NAME = 'Красный фонарь';
export const APP_TITLE = 'Красный фонарь — Касса';

// Функции приложения для основного профиля «Кассир» (п. 4.2 ЛР1)
export const FUNCTIONS = [
  { n: 1, text: 'создание нового заказа' },
  { n: 2, text: 'поиск заказа в журнале (по номеру, статусу, гостю, блюду)' },
  { n: 3, text: 'редактирование заказа' },
  { n: 4, text: 'привязка гостя (карты лояльности) к заказу' },
  { n: 5, text: 'регистрация и редактирование гостя' },
  { n: 6, text: 'выбор блюда из меню ресторана' },
  { n: 7, text: 'поиск блюда в меню' },
  { n: 8, text: 'просмотр карточки блюда (состав, КБЖУ, аллергены)' },
  { n: 9, text: 'добавление блюда в заказ с модификаторами' },
  { n: 10, text: 'сохранение заказа' },
  { n: 11, text: 'оплата заказа' },
  { n: 12, text: 'печать чека' },
  { n: 13, text: 'передача заказа на кухню и контроль его статуса' },
];

// Функциональные блоки и экранные формы (п. 4.4 ЛР1)
export const BLOCKS = [
  { name: 'Заказы', functions: [1, 2, 3, 4, 9, 10, 11, 12], forms: ['orders', 'order'] },
  { name: 'Гости', functions: [4, 5], forms: ['guests', 'guest'] },
  { name: 'Меню ресторана', functions: [6, 7, 8, 9], forms: ['dishes', 'dish'] },
  { name: 'Кухня', functions: [13], forms: ['kitchen'] },
];

export const FORMS = {
  orders: 'Журнал заказов',
  order: 'Текущий заказ',
  guests: 'Список гостей',
  guest: 'Карточка гостя',
  dishes: 'Меню ресторана',
  dish: 'Карточка блюда',
  kitchen: 'Экран кухни',
};

// Операции пользователя (п. 4.5 ЛР1). Номера используются в меню и на схемах.
export const OPERATIONS = [
  { n: 1, text: 'создать новый заказ' },
  { n: 2, text: 'задать параметры поиска заказа' },
  { n: 3, text: 'найти заказ по текущим параметрам' },
  { n: 4, text: 'открыть выбранный заказ для редактирования' },
  { n: 5, text: 'открыть список гостей для привязки к текущему заказу' },
  { n: 6, text: 'открыть меню ресторана для добавления блюд в текущий заказ' },
  { n: 7, text: 'просмотреть список гостей' },
  { n: 8, text: 'найти гостя по телефону или имени' },
  { n: 9, text: 'добавить выбранного гостя к параметрам поиска заказа' },
  { n: 10, text: 'зарегистрировать нового гостя' },
  { n: 11, text: 'открыть карточку выбранного гостя' },
  { n: 12, text: 'привязать выбранного гостя к текущему заказу' },
  { n: 13, text: 'сохранить карточку гостя' },
  { n: 14, text: 'просмотреть меню ресторана' },
  { n: 15, text: 'найти блюдо по названию' },
  { n: 16, text: 'открыть карточку выбранного блюда' },
  { n: 17, text: 'добавить выбранное блюдо к параметрам поиска заказа' },
  { n: 18, text: 'добавить выбранное блюдо в текущий заказ' },
  { n: 19, text: 'изменить позицию заказа (количество, модификаторы)' },
  { n: 20, text: 'сохранить текущий заказ' },
  { n: 21, text: 'оплатить текущий заказ' },
  { n: 22, text: 'напечатать чек по текущему заказу' },
  { n: 23, text: 'передать текущий заказ на кухню' },
  { n: 24, text: 'открыть экран кухни' },
  { n: 25, text: 'изменить статус заказа на кухне' },
  { n: 26, text: 'вернуться к журналу заказов' },
];

// Структура главного меню (п. 4.5 ЛР1). key — идентификатор команды.
// Стандартные разделы «Файл» и «Справка» в граф состояний не входят.
export const MENU = [
  {
    key: 'file', title: 'Файл', access: 'Ф', code: 'KeyA', standard: true,
    items: [
      { key: 'shiftOpen', title: 'Открыть смену…' },
      { key: 'shiftClose', title: 'Закрыть смену…' },
      { divider: true },
      { key: 'settings', title: 'Настройки…' },
      { divider: true },
      { key: 'exit', title: 'Выход', shortcut: 'Alt+F4' },
    ],
  },
  {
    key: 'actions', title: 'Действия', access: 'Д', code: 'KeyL',
    items: [
      {
        key: 'create', title: 'Создать', sub: [
          { key: 'createOrder', title: 'Заказ', shortcut: 'Ins' },
          { key: 'createGuest', title: 'Гостя…', shortcut: 'Ins' },
        ],
      },
      { key: 'open', title: 'Открыть', shortcut: 'Enter' },
      { key: 'save', title: 'Сохранить', shortcut: 'Ctrl+S' },
      { key: 'select', title: 'Выбрать', shortcut: 'Ctrl+Enter' },
      { divider: true },
      { key: 'pay', title: 'Оплатить…', shortcut: 'F9' },
      { key: 'print', title: 'Печать чека…', shortcut: 'Ctrl+P' },
      { key: 'toKitchen', title: 'Передать на кухню', shortcut: 'F8' },
      { divider: true },
      { key: 'status', title: 'Сменить статус', shortcut: 'Пробел' },
    ],
  },
  {
    key: 'search', title: 'Поиск', access: 'П', code: 'KeyG',
    items: [
      { key: 'find', title: 'Найти', shortcut: 'Ctrl+F' },
      { key: 'resetFilter', title: 'Сбросить параметры', shortcut: 'Ctrl+R' },
    ],
  },
  {
    key: 'lists', title: 'Списки', access: 'С', code: 'KeyC',
    items: [
      { key: 'listOrders', title: 'Журнал заказов', shortcut: 'F2' },
      { divider: true },
      { key: 'listGuests', title: 'Гости', shortcut: 'F4' },
      { key: 'listDishes', title: 'Меню ресторана', shortcut: 'F3' },
      { divider: true },
      { key: 'listKitchen', title: 'Экран кухни', shortcut: 'F6' },
    ],
  },
  {
    key: 'help', title: 'Справка', access: 'а', code: 'KeyF', standard: true,
    items: [
      { key: 'helpContents', title: 'Содержание', shortcut: 'F1' },
      { key: 'helpIndex', title: 'Предметный указатель' },
      { key: 'helpSearch', title: 'Поиск в справке…' },
      { key: 'helpContext', title: 'Справка по этому окну', shortcut: 'Shift+F1' },
      { divider: true },
      { key: 'about', title: 'О программе…' },
    ],
  },
];

// Состояния меню (п. 4.6 ЛР1): для каждого состояния — доступные команды
// и номер операции, которую команда выполняет в этом состоянии.
export const STATES = {
  M1: {
    form: 'orders', note: 'Журнал заказов',
    cmds: { createOrder: 1, open: 4, find: 3, resetFilter: 2, listGuests: 7, listDishes: 14, listKitchen: 24 },
  },
  M2: {
    form: 'order', note: 'Текущий заказ',
    cmds: { save: 20, pay: 21, print: 22, toKitchen: 23, listGuests: 5, listDishes: 6, listOrders: 26 },
  },
  M3: {
    form: 'guests', note: 'Список гостей (переход по операции 7)', via: 7,
    cmds: { createGuest: 10, open: 11, select: 9, find: 8, listOrders: 26 },
  },
  M4: {
    form: 'guests', note: 'Список гостей (переход по операции 5)', via: 5,
    cmds: { createGuest: 10, open: 11, select: 12, find: 8, listOrders: 26 },
  },
  M5: {
    form: 'guest', note: 'Карточка гостя',
    cmds: { save: 13, listOrders: 26 },
  },
  M6: {
    form: 'dishes', note: 'Меню ресторана (переход по операции 14)', via: 14,
    cmds: { open: 16, select: 17, find: 15, listOrders: 26 },
  },
  M7: {
    form: 'dishes', note: 'Меню ресторана (переход по операции 6)', via: 6,
    cmds: { open: 16, select: 18, find: 15, listOrders: 26 },
  },
  M8: {
    form: 'dish', note: 'Карточка блюда',
    cmds: { listOrders: 26 },
  },
  M9: {
    form: 'kitchen', note: 'Экран кухни',
    cmds: { status: 25, listOrders: 26 },
  },
};

// Переходы графа состояний: [из, в, операция]. Кроме перечисленных, из любого
// состояния М2–М9 операция 26 (F2) ведёт в М1, а Esc — в предыдущее состояние.
export const TRANSITIONS = [
  ['M1', 'M2', 1], ['M1', 'M2', 4], ['M1', 'M3', 7], ['M1', 'M6', 14], ['M1', 'M9', 24],
  ['M2', 'M4', 5], ['M2', 'M7', 6], ['M2', 'M8', 16], ['M2', 'M1', 26],
  ['M3', 'M5', 10], ['M3', 'M5', 11], ['M3', 'M1', 9],
  ['M4', 'M5', 10], ['M4', 'M5', 11], ['M4', 'M2', 12],
  ['M5', 'M3', 13], ['M5', 'M4', 13],
  ['M6', 'M8', 16], ['M6', 'M1', 17],
  ['M7', 'M8', 16], ['M7', 'M2', 18],
  ['M8', 'M6', 'Esc'], ['M8', 'M7', 'Esc'], ['M8', 'M2', 'Esc'],
  ['M9', 'M1', 26],
];

export function menuStateFor(form, origin) {
  if (form === 'guests') return origin === 'order' ? 'M4' : 'M3';
  if (form === 'dishes') return origin === 'order' ? 'M7' : 'M6';
  return Object.keys(STATES).find((k) => STATES[k].form === form);
}
