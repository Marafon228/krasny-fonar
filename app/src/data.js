// Демонстрационные данные. В этом семестре делается только интерфейс,
// поэтому данные хранятся в памяти и сбрасываются при перезагрузке.

export const CATEGORIES = [
  { key: 'burgers', title: 'Бургеры', icon: 'burger', color: 'red' },
  { key: 'combo', title: 'Комбо', icon: 'combo', color: 'orange' },
  { key: 'chicken', title: 'Курица', icon: 'chicken', color: 'yellow' },
  { key: 'snacks', title: 'Картофель и снеки', icon: 'fries', color: 'lime' },
  { key: 'drinks', title: 'Напитки', icon: 'drink', color: 'cyan' },
  { key: 'desserts', title: 'Десерты', icon: 'dessert', color: 'pink' },
  { key: 'sauces', title: 'Соусы', icon: 'sauce', color: 'grape' },
];

export const DISHES = [
  { id: 101, cat: 'burgers', name: 'Фонарь Бургер', price: 189, kcal: 520, weight: 210, popular: true,
    composition: 'Булочка с кунжутом, говяжья котлета, сыр чеддер, лук, маринованные огурцы, соус «Фонарь»',
    allergens: ['глютен', 'молоко', 'кунжут'], b: 26, j: 27, u: 42 },
  { id: 102, cat: 'burgers', name: 'Двойной Фонарь', price: 279, kcal: 780, weight: 300, popular: true,
    composition: 'Две говяжьи котлеты, двойной сыр, лук, огурцы, соус «Фонарь»',
    allergens: ['глютен', 'молоко', 'кунжут'], b: 44, j: 45, u: 43 },
  { id: 103, cat: 'burgers', name: 'Чизбургер', price: 99, kcal: 300, weight: 115,
    composition: 'Булочка, говяжья котлета, сыр, кетчуп, горчица, лук, огурец',
    allergens: ['глютен', 'молоко', 'горчица'], b: 15, j: 13, u: 31 },
  { id: 104, cat: 'burgers', name: 'Острый Красный', price: 229, kcal: 610, weight: 240,
    composition: 'Говяжья котлета, перец халапеньо, сыр пеппер-джек, острый соус',
    allergens: ['глютен', 'молоко'], b: 30, j: 33, u: 45, stop: true },
  { id: 105, cat: 'burgers', name: 'Фиш Бургер', price: 169, kcal: 390, weight: 150,
    composition: 'Филе минтая в панировке, сыр, соус тартар',
    allergens: ['глютен', 'рыба', 'молоко', 'яйцо'], b: 16, j: 18, u: 39 },
  { id: 201, cat: 'combo', name: 'Комбо «Фонарь»', price: 399, kcal: 1040, weight: 610, popular: true,
    composition: 'Фонарь Бургер + картофель фри (ср.) + напиток (0,4 л)',
    allergens: ['глютен', 'молоко', 'кунжут'], b: 32, j: 45, u: 128 },
  { id: 202, cat: 'combo', name: 'Комбо «Двойной»', price: 489, kcal: 1300, weight: 700,
    composition: 'Двойной Фонарь + картофель фри (ср.) + напиток (0,4 л)',
    allergens: ['глютен', 'молоко', 'кунжут'], b: 50, j: 63, u: 129 },
  { id: 203, cat: 'combo', name: 'Детское комбо', price: 299, kcal: 620, weight: 400,
    composition: 'Чизбургер + картофель фри (мал.) + сок + игрушка',
    allergens: ['глютен', 'молоко', 'горчица'], b: 18, j: 22, u: 82 },
  { id: 301, cat: 'chicken', name: 'Наггетсы, 6 шт.', price: 159, kcal: 270, weight: 100, popular: true,
    composition: 'Куриное филе в хрустящей панировке', allergens: ['глютен'], b: 15, j: 16, u: 16 },
  { id: 302, cat: 'chicken', name: 'Наггетсы, 9 шт.', price: 219, kcal: 410, weight: 150,
    composition: 'Куриное филе в хрустящей панировке', allergens: ['глютен'], b: 23, j: 24, u: 24 },
  { id: 303, cat: 'chicken', name: 'Чикен Фонарик', price: 149, kcal: 440, weight: 160,
    composition: 'Булочка, куриная котлета, салат айсберг, майонез',
    allergens: ['глютен', 'яйцо'], b: 17, j: 22, u: 44 },
  { id: 304, cat: 'chicken', name: 'Крылышки острые, 5 шт.', price: 239, kcal: 450, weight: 180,
    composition: 'Куриные крылья в острой панировке', allergens: ['глютен'], b: 30, j: 28, u: 18 },
  { id: 401, cat: 'snacks', name: 'Картофель фри', price: 89, kcal: 340, weight: 110, popular: true, sizes: true,
    composition: 'Картофель, растительное масло, соль', allergens: [], b: 4, j: 17, u: 44 },
  { id: 402, cat: 'snacks', name: 'Картофель по-деревенски', price: 109, kcal: 320, weight: 130, sizes: true,
    composition: 'Картофельные дольки со специями', allergens: [], b: 4, j: 15, u: 42 },
  { id: 403, cat: 'snacks', name: 'Сырные палочки', price: 139, kcal: 330, weight: 100,
    composition: 'Сыр моцарелла в панировке', allergens: ['глютен', 'молоко'], b: 14, j: 19, u: 25 },
  { id: 501, cat: 'drinks', name: 'Кола', price: 99, kcal: 170, weight: 400, popular: true, sizes: true,
    composition: 'Газированный напиток', allergens: [], b: 0, j: 0, u: 42 },
  { id: 502, cat: 'drinks', name: 'Морс клюквенный', price: 109, kcal: 140, weight: 400, sizes: true,
    composition: 'Клюква, вода, сахар', allergens: [], b: 0, j: 0, u: 35 },
  { id: 503, cat: 'drinks', name: 'Кофе американо', price: 119, kcal: 5, weight: 300,
    composition: 'Эспрессо, горячая вода', allergens: [], b: 0, j: 0, u: 1 },
  { id: 504, cat: 'drinks', name: 'Молочный коктейль', price: 159, kcal: 380, weight: 400,
    composition: 'Молоко, мороженое, сироп (ваниль / клубника / шоколад)', allergens: ['молоко'], b: 10, j: 11, u: 58 },
  { id: 601, cat: 'desserts', name: 'Мороженое рожок', price: 59, kcal: 150, weight: 90, popular: true,
    composition: 'Мягкое ванильное мороженое, вафельный рожок', allergens: ['молоко', 'глютен'], b: 4, j: 5, u: 22 },
  { id: 602, cat: 'desserts', name: 'Пирожок вишнёвый', price: 79, kcal: 250, weight: 80,
    composition: 'Слоёное тесто, вишнёвая начинка', allergens: ['глютен'], b: 3, j: 12, u: 33 },
  { id: 603, cat: 'desserts', name: 'Сандэй карамельный', price: 129, kcal: 330, weight: 150,
    composition: 'Мороженое, карамельный топпинг', allergens: ['молоко'], b: 7, j: 9, u: 54 },
  { id: 701, cat: 'sauces', name: 'Соус кисло-сладкий', price: 39, kcal: 50, weight: 25,
    composition: 'Томаты, сахар, уксус', allergens: [], b: 0, j: 0, u: 12 },
  { id: 702, cat: 'sauces', name: 'Соус сырный', price: 39, kcal: 110, weight: 25,
    composition: 'Сыр, растительные масла', allergens: ['молоко'], b: 1, j: 11, u: 2 },
];

export const SIZES = [
  { key: 'S', title: 'Маленький', delta: -20 },
  { key: 'M', title: 'Средний', delta: 0 },
  { key: 'L', title: 'Большой', delta: 30 },
];

export const MODIFIERS = ['Без лука', 'Без соуса', 'Без огурцов', 'Двойной сыр (+40 ₽)', 'Без льда', 'С собой упаковать отдельно'];

export const GUESTS = [
  { id: 1, name: 'Иванова Мария', phone: '+7 912 345-67-89', card: 'КФ-000123', bonus: 340, visits: 27, email: 'm.ivanova@mail.ru', birthday: '1998-04-12', promo: true },
  { id: 2, name: 'Петров Алексей', phone: '+7 903 111-22-33', card: 'КФ-000245', bonus: 75, visits: 6, email: '', birthday: '2001-11-03', promo: false },
  { id: 3, name: 'Сидорова Анна', phone: '+7 925 777-00-11', card: 'КФ-000318', bonus: 1210, visits: 64, email: 'anna.s@yandex.ru', birthday: '1990-07-22', promo: true },
  { id: 4, name: 'Кузнецов Игорь', phone: '+7 916 450-12-90', card: 'КФ-000402', bonus: 0, visits: 1, email: '', birthday: '', promo: false },
  { id: 5, name: 'Смирнова Ольга', phone: '+7 999 230-45-67', card: 'КФ-000511', bonus: 520, visits: 33, email: 'olga.smirnova@gmail.com', birthday: '1995-01-30', promo: true },
  { id: 6, name: 'Волков Дмитрий', phone: '+7 921 888-14-14', card: 'КФ-000634', bonus: 95, visits: 9, email: '', birthday: '2003-09-09', promo: false },
];

export const ORDER_STATUSES = {
  draft: { title: 'Черновик', color: 'gray' },
  new: { title: 'Новый', color: 'blue' },
  cooking: { title: 'Готовится', color: 'orange' },
  ready: { title: 'Готов', color: 'green' },
  done: { title: 'Выдан', color: 'dark' },
  canceled: { title: 'Отменён', color: 'red' },
};

export const ORDER_TYPES = { hall: 'В зале', takeaway: 'С собой', delivery: 'Доставка' };

const item = (dishId, qty = 1, extra = {}) => ({ uid: `${dishId}-${Math.random().toString(36).slice(2, 7)}`, dishId, qty, size: 'M', mods: [], ...extra });

export const ORDERS = [
  { id: 1048, time: '12:44', type: 'takeaway', guestId: 1, status: 'draft', paid: null, items: [item(201), item(401, 1, { size: 'L', mods: ['Без соуса'] }), item(504)] },
  { id: 1047, time: '12:41', type: 'hall', guestId: 3, status: 'cooking', paid: 'card', items: [item(201), item(301), item(601, 2)] },
  { id: 1046, time: '12:38', type: 'takeaway', guestId: null, status: 'ready', paid: 'sbp', items: [item(102), item(401, 1, { size: 'L' }), item(501)] },
  { id: 1045, time: '12:35', type: 'hall', guestId: 1, status: 'new', paid: 'cash', items: [item(203), item(504)] },
  { id: 1044, time: '12:30', type: 'delivery', guestId: 5, status: 'done', paid: 'card', items: [item(202, 2), item(302)] },
  { id: 1043, time: '12:22', type: 'hall', guestId: null, status: 'done', paid: 'cash', items: [item(103, 3), item(501, 3, { size: 'S' })] },
  { id: 1042, time: '12:17', type: 'takeaway', guestId: 2, status: 'done', paid: 'card', items: [item(303), item(402), item(502)] },
  { id: 1041, time: '12:09', type: 'hall', guestId: null, status: 'canceled', paid: null, items: [item(104)] },
  { id: 1040, time: '12:02', type: 'hall', guestId: 6, status: 'done', paid: 'sbp', items: [item(101, 2, { mods: ['Без лука'] }), item(401), item(503)] },
  { id: 1039, time: '11:54', type: 'takeaway', guestId: null, status: 'done', paid: 'card', items: [item(301), item(701), item(601)] },
  { id: 1038, time: '11:47', type: 'hall', guestId: 3, status: 'done', paid: 'card', items: [item(201), item(603)] },
  { id: 1037, time: '11:40', type: 'delivery', guestId: 4, status: 'done', paid: 'card', items: [item(202), item(304), item(504)] },
  { id: 1036, time: '11:31', type: 'hall', guestId: null, status: 'done', paid: 'cash', items: [item(105), item(402), item(502)] },
];

export const PAYMENT = { cash: 'Наличные', card: 'Карта', sbp: 'СБП' };

export const dishById = (id) => DISHES.find((d) => d.id === id);

export function itemPrice(it) {
  const d = dishById(it.dishId);
  if (!d) return 0;
  const sizeDelta = d.sizes ? (SIZES.find((s) => s.key === it.size)?.delta ?? 0) : 0;
  const modDelta = it.mods.includes('Двойной сыр (+40 ₽)') ? 40 : 0;
  return (d.price + sizeDelta + modDelta) * it.qty;
}

export const orderTotal = (o) => o.items.reduce((s, it) => s + itemPrice(it), 0);

export const rub = (v) => `${v.toLocaleString('ru-RU')} ₽`;
