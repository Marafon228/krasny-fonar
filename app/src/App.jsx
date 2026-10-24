import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Anchor, Avatar, Breadcrumbs, Divider, Group, Switch, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCash, IconChefHat, IconDeviceFloppy, IconFolderOpen, IconHelp, IconListDetails, IconPlus, IconReceipt, IconSearch, IconToolsKitchen2, IconUsers,
} from '@tabler/icons-react';
import MainMenu, { isEnabled } from './MainMenu.jsx';
import HelpViewer from './HelpViewer.jsx';
import { AboutModal, PayModal, ReceiptModal } from './Dialogs.jsx';
import Orders, { filterOrders } from './screens/Orders.jsx';
import Order from './screens/Order.jsx';
import { GuestCard, GuestsList, filterGuests } from './screens/Guests.jsx';
import { DishCard, DishesList, filterDishes } from './screens/Dishes.jsx';
import Kitchen, { NEXT_STATUS } from './screens/Kitchen.jsx';
import { moveSelection } from './screens/common.jsx';
import { FORMS, MENU, STATES, menuStateFor } from './spec.js';
import { CONTEXT_HELP } from './help.js';
import { GUESTS, ORDERS, ORDER_STATUSES, dishById, orderTotal } from './data.js';
import { Logo } from './ui.jsx';

const DEFAULT_FILTERS = { number: '', status: 'all', type: 'all', guestId: null, dishId: null };
const LIST_FORMS = ['orders', 'guests', 'dishes', 'kitchen'];
const sectionOf = (cmd) => MENU.find((s) => s.items.some((it) => it.key === cmd || it.sub?.some((x) => x.key === cmd)));
const nowTime = () => new Date().toTimeString().slice(0, 5);
const info = (message, color = 'red') => notifications.show({ message, color, autoClose: 2500 });

// Демо-параметры адресной строки для снимков экрана: ?screen=order&order=1047&ops=1&menu=actions
const params = new URLSearchParams(window.location.search);
function initialStack() {
  const s = params.get('screen');
  const origin = params.get('origin') ?? 'orders';
  const order = Number(params.get('order') ?? 1048);
  if (s === 'order') return [{ form: 'orders' }, { form: 'order', orderId: order }];
  if (s === 'guests') return origin === 'order' ? [{ form: 'orders' }, { form: 'order', orderId: order }, { form: 'guests', origin }] : [{ form: 'orders' }, { form: 'guests', origin }];
  if (s === 'guest') return [{ form: 'orders' }, { form: 'guests', origin: 'orders' }, { form: 'guest', guest: GUESTS[0] }];
  if (s === 'dishes') return origin === 'order' ? [{ form: 'orders' }, { form: 'order', orderId: order }, { form: 'dishes', origin }] : [{ form: 'orders' }, { form: 'dishes', origin }];
  if (s === 'dish') return [{ form: 'orders' }, { form: 'dishes', origin: 'orders' }, { form: 'dish', dishId: 201 }];
  if (s === 'kitchen') return [{ form: 'orders' }, { form: 'kitchen' }];
  return [{ form: 'orders' }];
}

export default function App() {
  const [stack, setStack] = useState(initialStack);
  const [orders, setOrders] = useState(ORDERS);
  const [guests, setGuests] = useState(GUESTS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selOrder, setSelOrder] = useState(1048);
  const [selGuest, setSelGuest] = useState(1);
  const [selDish, setSelDish] = useState(201);
  const [selKitchen, setSelKitchen] = useState(1045);
  const [guestQuery, setGuestQuery] = useState('');
  const [dishQuery, setDishQuery] = useState('');
  const [dishCat, setDishCat] = useState('all');
  const [modal, setModal] = useState(params.get('modal'));
  const [help, setHelp] = useState({ opened: params.has('help'), topicId: params.get('help') || 'IDH_CONTENTS', tab: 'contents' });
  const [showOps, setShowOps] = useState(params.has('ops'));
  const [menuOpened, setMenuOpened] = useState(params.get('menu'));
  const [clock, setClock] = useState(nowTime());
  const searchRef = useRef(null);
  const reg = useRef({});

  const top = stack[stack.length - 1];
  const stateKey = menuStateFor(top.form, top.origin);
  const push = (s) => setStack((st) => [...st, s]);
  const pop = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
  const toOrders = () => setStack([{ form: 'orders' }]);
  const currentOrder = top.form === 'order' ? orders.find((o) => o.id === top.orderId) : stack.find((s) => s.form === 'order') && orders.find((o) => o.id === stack.find((s) => s.form === 'order').orderId);
  const setOrder = (fn) => setOrders((os) => os.map((o) => (o.id === currentOrder.id ? fn(o) : o)));
  const guestOf = (o) => guests.find((g) => g.id === o?.guestId);

  useEffect(() => { const t = setInterval(() => setClock(nowTime()), 15000); return () => clearInterval(t); }, []);

  const listIds = () => {
    if (top.form === 'orders') return filterOrders(orders, filters).map((o) => o.id);
    if (top.form === 'guests') return filterGuests(guests, guestQuery).map((g) => g.id);
    if (top.form === 'dishes') return filterDishes(dishQuery, dishCat).map((d) => d.id);
    if (top.form === 'kitchen') return orders.filter((o) => ['new', 'cooking', 'ready'].includes(o.status)).map((o) => o.id);
    return [];
  };
  const selection = { orders: [selOrder, setSelOrder], guests: [selGuest, setSelGuest], dishes: [selDish, setSelDish], kitchen: [selKitchen, setSelKitchen] };

  const advanceKitchen = (id) => {
    const o = orders.find((x) => x.id === id);
    if (!o || !NEXT_STATUS[o.status]) return;
    const next = NEXT_STATUS[o.status];
    setOrders((os) => os.map((x) => (x.id === id ? { ...x, status: next } : x)));
    info(`Заказ № ${id}: ${ORDER_STATUSES[next].title.toLowerCase()}`, 'green');
  };

  const openHelp = (topicId, tab = 'contents') => setHelp({ opened: true, topicId, tab });

  function run(cmd, arg) {
    const section = sectionOf(cmd);
    if (section && !isEnabled(stateKey, section, cmd)) return;
    setMenuOpened(null);
    switch (cmd) {
      case 'createOrder': {
        const id = Math.max(...orders.map((o) => o.id)) + 1;
        setOrders((os) => [{ id, time: nowTime(), type: 'hall', guestId: null, status: 'draft', paid: null, items: [] }, ...os]);
        setSelOrder(id);
        setStack([{ form: 'orders' }, { form: 'order', orderId: id }]);
        break;
      }
      case 'createGuest': {
        const id = Math.max(...guests.map((g) => g.id)) + 1;
        push({ form: 'guest', guest: { id, name: '', phone: '+7 ', card: `КФ-000${700 + id}`, bonus: 0, visits: 0, email: '', birthday: '', promo: false, isNew: true } });
        break;
      }
      case 'open':
        if (top.form === 'orders') { const id = arg ?? selOrder; if (id) push({ form: 'order', orderId: id }); }
        if (top.form === 'guests') { const g = guests.find((x) => x.id === (arg ?? selGuest)); if (g) push({ form: 'guest', guest: g }); }
        if (top.form === 'dishes') { const id = arg ?? selDish; if (id) push({ form: 'dish', dishId: id }); }
        break;
      case 'save':
        if (top.form === 'order') info(`Заказ № ${currentOrder.id} сохранён`, 'green');
        if (top.form === 'guest') {
          const g = reg.current.saveGuest?.();
          if (!g) return;
          const { isNew, ...clean } = g;
          setGuests((gs) => (isNew ? [...gs, clean] : gs.map((x) => (x.id === clean.id ? clean : x))));
          setSelGuest(clean.id);
          info(isNew ? `Гость ${clean.name} зарегистрирован, карта ${clean.card}` : 'Карточка гостя сохранена', 'green');
          pop();
        }
        break;
      case 'select': {
        const id = arg ?? (top.form === 'guests' ? selGuest : selDish);
        if (stateKey === 'M3') { setFilters({ ...DEFAULT_FILTERS, guestId: id }); toOrders(); }
        if (stateKey === 'M4') { setOrder((o) => ({ ...o, guestId: id })); info('Гость привязан к заказу', 'green'); pop(); }
        if (stateKey === 'M6') { setFilters({ ...DEFAULT_FILTERS, dishId: id }); toOrders(); }
        if (stateKey === 'M7') {
          const d = dishById(id);
          if (d.stop) { info(`«${d.name}» в стоп-листе`); return; }
          setOrder((o) => ({ ...o, items: [...o.items, { uid: `${id}-${Date.now()}`, dishId: id, qty: 1, size: 'M', mods: [] }] }));
          info(`«${d.name}» добавлен в заказ`, 'green');
          pop();
        }
        break;
      }
      case 'pay': if (currentOrder?.items.length && !currentOrder.paid) setModal('pay'); break;
      case 'print': if (currentOrder?.items.length) setModal('print'); break;
      case 'toKitchen':
        if (!currentOrder?.items.length || currentOrder.status !== 'draft') return;
        setOrder((o) => ({ ...o, status: 'new' }));
        info(`Заказ № ${currentOrder.id} передан на кухню`, 'green');
        break;
      case 'status': advanceKitchen(selKitchen); break;
      case 'find': searchRef.current?.focus(); searchRef.current?.select(); break;
      case 'resetFilter': setFilters(DEFAULT_FILTERS); break;
      case 'listOrders': toOrders(); break;
      case 'listGuests': setGuestQuery(''); push({ form: 'guests', origin: top.form === 'order' ? 'order' : 'orders' }); break;
      case 'listDishes': setDishQuery(''); push({ form: 'dishes', origin: top.form === 'order' ? 'order' : 'orders' }); break;
      case 'listKitchen': push({ form: 'kitchen' }); break;
      case 'helpContents': openHelp('IDH_CONTENTS'); break;
      case 'helpIndex': openHelp(help.topicId, 'index'); break;
      case 'helpSearch': openHelp(help.topicId, 'search'); break;
      case 'helpContext': openHelp(CONTEXT_HELP[top.form]); break;
      case 'about': setModal('about'); break;
      default: info('Эта функция появится в следующей версии программы', 'gray');
    }
  }

  // Горячие клавиши. Сравниваем e.code, чтобы они работали и в русской раскладке.
  useEffect(() => {
    const onKey = (e) => {
      if (modal || help.opened) return;
      if (menuOpened) { if (e.key === 'Escape') setMenuOpened(null); return; }
      const inText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      const k = (c) => { e.preventDefault(); run(c); };
      if (e.altKey && !e.ctrlKey) {
        const s = MENU.find((m) => m.code === e.code);
        if (s) { e.preventDefault(); setMenuOpened(s.key); }
        return;
      }
      if (e.key === 'F1') return k(e.shiftKey ? 'helpContext' : 'helpContents');
      const fkeys = { F2: 'listOrders', F3: 'listDishes', F4: 'listGuests', F6: 'listKitchen', F8: 'toKitchen', F9: 'pay' };
      if (fkeys[e.key]) return k(fkeys[e.key]);
      if (e.key === 'Insert') return k(STATES[stateKey].cmds.createOrder !== undefined ? 'createOrder' : 'createGuest');
      if (e.ctrlKey && e.code === 'KeyS') return k('save');
      if (e.ctrlKey && e.code === 'KeyP') return k('print');
      if (e.ctrlKey && e.code === 'KeyF') return k('find');
      if (e.ctrlKey && e.code === 'KeyR') return k('resetFilter');
      if (e.ctrlKey && e.key === 'Enter') return k('select');
      if (e.key === 'Escape') { if (inText && e.target.value) return; e.preventDefault(); pop(); return; }
      if (!LIST_FORMS.includes(top.form)) return;
      if (e.key === 'Enter' && !e.ctrlKey) return k(top.form === 'kitchen' ? 'status' : 'open');
      if (top.form === 'kitchen' && e.code === 'Space') return k('status');
      const dirs = { ArrowUp: 'up', ArrowDown: 'down', Home: 'home', End: 'end' };
      if (dirs[e.key] && !(inText && (e.key === 'Home' || e.key === 'End'))) {
        e.preventDefault();
        const [sel, setSel] = selection[top.form];
        setSel(moveSelection(listIds(), sel, dirs[e.key]));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Если выбранная строка отфильтрована, выбираем первую подходящую (ЛР2: экономит одно указание мышью)
  useEffect(() => {
    const sel = selection[top.form];
    if (!sel || top.form === 'kitchen') return;
    const ids = listIds();
    if (ids.length && !ids.includes(sel[0])) sel[1](ids[0]);
  }, [top.form, filters, guestQuery, dishQuery, dishCat]);

  // Прокрутка к выбранной строке при перемещении с клавиатуры
  useEffect(() => { document.querySelector('[data-selected]')?.scrollIntoView({ block: 'nearest' }); }, [selOrder, selGuest, selDish, selKitchen]);

  const tools = [
    ['createOrder', 'Новый заказ (Ins)', IconPlus], ['open', 'Открыть (Enter)', IconFolderOpen], ['save', 'Сохранить (Ctrl+S)', IconDeviceFloppy],
    null, ['pay', 'Оплатить (F9)', IconCash], ['print', 'Печать чека (Ctrl+P)', IconReceipt], ['toKitchen', 'Передать на кухню (F8)', IconChefHat],
    null, ['find', 'Найти (Ctrl+F)', IconSearch],
    null, ['listOrders', 'Журнал заказов (F2)', IconListDetails], ['listDishes', 'Меню ресторана (F3)', IconToolsKitchen2], ['listGuests', 'Гости (F4)', IconUsers], ['listKitchen', 'Экран кухни (F6)', IconChefHat],
  ];

  const crumbTitle = (s) => (s.form === 'order' ? `Заказ № ${s.orderId}` : s.form === 'dish' ? dishById(s.dishId)?.name : s.form === 'guest' ? (s.guest.isNew ? 'Новый гость' : s.guest.name) : FORMS[s.form]);

  let screen = null;
  if (top.form === 'orders') screen = <Orders orders={orders} guests={guests} filters={filters} setFilters={setFilters} selected={selOrder} setSelected={setSelOrder} run={run} searchRef={searchRef} />;
  if (top.form === 'order' && currentOrder) screen = <Order key={currentOrder.id} order={currentOrder} setOrder={setOrder} guests={guests} run={run} searchRef={searchRef} openDish={(id) => push({ form: 'dish', dishId: id })} />;
  if (top.form === 'guests') screen = <GuestsList guests={guests} query={guestQuery} setQuery={setGuestQuery} selected={selGuest} setSelected={setSelGuest} run={run} origin={top.origin} searchRef={searchRef} />;
  if (top.form === 'guest') screen = <GuestCard guest={top.guest} orders={orders} reg={reg} run={run} />;
  if (top.form === 'dishes') screen = <DishesList query={dishQuery} setQuery={setDishQuery} cat={dishCat} setCat={setDishCat} selected={selDish} setSelected={setSelDish} run={run} origin={top.origin} searchRef={searchRef} />;
  if (top.form === 'dish') screen = <DishCard dish={dishById(top.dishId)} />;
  if (top.form === 'kitchen') screen = <Kitchen orders={orders} selected={selKitchen} setSelected={setSelKitchen} advance={advanceKitchen} />;

  return (
    <div className="app">
      <header className="app-header">
        <Logo size={36} light />
        <Group gap="lg">
          <Text c="red.1" fz="sm">Касса № 1 · Смена № 214</Text>
          <Group gap={8}><Avatar color="red" variant="white" radius="xl" size={30}>АП</Avatar><Text c="white" fw={600} fz="sm">Анна Петрова, кассир</Text></Group>
        </Group>
      </header>

      <MainMenu stateKey={stateKey} showOps={showOps} opened={menuOpened} setOpened={setMenuOpened} onCommand={run} />

      <Group className="toolbar" gap={4} wrap="nowrap">
        {tools.map((t, i) => {
          if (!t) return <Divider key={i} orientation="vertical" mx={4} />;
          const [cmd, label, Icon] = t;
          const enabled = isEnabled(stateKey, sectionOf(cmd), cmd);
          return (
            <Tooltip key={cmd} label={label} withArrow openDelay={300}>
              <ActionIcon variant="subtle" color="dark" size={36} disabled={!enabled} onClick={() => run(cmd)} aria-label={label}><Icon size={21} stroke={1.6} /></ActionIcon>
            </Tooltip>
          );
        })}
        <div style={{ flex: 1 }} />
        <Tooltip label="Справка по этому окну (Shift+F1)" withArrow>
          <ActionIcon variant="subtle" color="dark" size={36} onClick={() => run('helpContext')} aria-label="Справка"><IconHelp size={21} stroke={1.6} /></ActionIcon>
        </Tooltip>
      </Group>

      <main className="workspace">
        <Breadcrumbs mb="xs" separator="›" fz="sm">
          {stack.map((s, i) => (i < stack.length - 1
            ? <Anchor key={i} fz="sm" onClick={() => setStack(stack.slice(0, i + 1))}>{crumbTitle(s)}</Anchor>
            : <Text key={i} fz="sm" c="dimmed">{crumbTitle(s)}</Text>))}
        </Breadcrumbs>
        <div className="screen">{screen}</div>
      </main>

      <footer className="statusbar">
        <Group gap="md" wrap="nowrap">
          <Text fz="xs" fw={600}>{FORMS[top.form]}</Text>
          <Text fz="xs" c="dimmed">Состояние меню: {stateKey.replace('M', 'М')}</Text>
          <Text fz="xs" c="dimmed" visibleFrom="md">F1 — справка · Alt — меню · Esc — назад</Text>
        </Group>
        <Group gap="md" wrap="nowrap">
          <Switch size="xs" label="Номера операций в меню" checked={showOps} onChange={(e) => setShowOps(e.currentTarget.checked)} />
          <Text fz="xs" c="dimmed">{clock}</Text>
        </Group>
      </footer>

      {modal === 'pay' && currentOrder && (
        <PayModal order={currentOrder} guest={guestOf(currentOrder)} onClose={() => setModal(null)}
          onPaid={(method, usedBonus) => {
            const total = orderTotal(currentOrder);
            setOrder((o) => ({ ...o, paid: method, status: o.status === 'draft' ? 'new' : o.status }));
            if (currentOrder.guestId) setGuests((gs) => gs.map((g) => (g.id === currentOrder.guestId ? { ...g, bonus: g.bonus - usedBonus + Math.round((total - usedBonus) * 0.05), visits: g.visits + 1 } : g)));
            setModal(null);
            info(`Заказ № ${currentOrder.id} оплачен и передан на кухню`, 'green');
          }} />
      )}
      {modal === 'print' && currentOrder && (
        <ReceiptModal order={currentOrder} guest={guestOf(currentOrder)} onClose={() => setModal(null)} onPrint={() => { setModal(null); info('Чек отправлен на принтер', 'green'); }} />
      )}
      {modal === 'about' && <AboutModal onClose={() => setModal(null)} />}
      <HelpViewer opened={help.opened} onClose={() => setHelp((h) => ({ ...h, opened: false }))}
        topicId={help.topicId} setTopicId={(id) => setHelp((h) => ({ ...h, topicId: id }))}
        tab={help.tab} setTab={(tab) => setHelp((h) => ({ ...h, tab }))} />
    </div>
  );
}
