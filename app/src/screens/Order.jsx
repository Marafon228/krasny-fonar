import { useState } from 'react';
import {
  ActionIcon, Avatar, Badge, Button, Chip, CloseButton, Divider, Group, Modal, NumberInput, Paper, ScrollArea,
  SegmentedControl, SimpleGrid, Stack, Text, TextInput, Tooltip, UnstyledButton,
} from '@mantine/core';
import {
  IconCash, IconChefHat, IconDeviceFloppy, IconFlame, IconInfoCircle, IconMinus, IconPlus, IconReceipt, IconSearch, IconTrash, IconUserPlus,
} from '@tabler/icons-react';
import { CATEGORIES, DISHES, MODIFIERS, ORDER_STATUSES, ORDER_TYPES, SIZES, dishById, itemPrice, orderTotal, rub } from '../data.js';
import { DishIcon, KeyHint } from '../ui.jsx';

function DishTile({ dish, onAdd, onInfo }) {
  return (
    <UnstyledButton className="dish-tile" data-stop={dish.stop || undefined} onClick={() => !dish.stop && onAdd(dish)}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <DishIcon dish={dish} size={46} />
        <Group gap={4}>
          {dish.popular && <IconFlame size={18} color="var(--mantine-color-orange-6)" />}
          <Tooltip label="Карточка блюда" withArrow>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => { e.stopPropagation(); onInfo(dish.id); }} aria-label="Карточка блюда">
              <IconInfoCircle size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Text fw={600} fz="sm" mt={8} lh={1.25} lineClamp={2} h={36}>{dish.name}</Text>
      <Group justify="space-between" mt={4}>
        <Text fw={800} c="red.8">{rub(dish.price)}</Text>
        <Text fz="xs" c="dimmed">{dish.kcal} ккал</Text>
      </Group>
      {dish.stop && <Badge className="stop-badge" color="red" variant="filled" size="sm">стоп-лист</Badge>}
    </UnstyledButton>
  );
}

function ItemModal({ item, onClose, onChange, onRemove }) {
  const dish = item && dishById(item.dishId);
  if (!dish) return null;
  return (
    <Modal opened onClose={onClose} title={<Text fw={700}>{dish.name}</Text>} centered>
      <Stack>
        {dish.sizes && (
          <div>
            <Text fz="sm" fw={500} mb={4}>Размер порции</Text>
            <SegmentedControl fullWidth value={item.size} onChange={(v) => onChange({ ...item, size: v })}
              data={SIZES.map((s) => ({ value: s.key, label: `${s.title}${s.delta ? ` (${s.delta > 0 ? '+' : ''}${s.delta} ₽)` : ''}` }))} />
          </div>
        )}
        <div>
          <Text fz="sm" fw={500} mb={6}>Модификаторы</Text>
          <Chip.Group multiple value={item.mods} onChange={(v) => onChange({ ...item, mods: v })}>
            <Group gap={6}>{MODIFIERS.map((m) => <Chip key={m} value={m} size="sm">{m}</Chip>)}</Group>
          </Chip.Group>
        </div>
        <NumberInput label="Количество" min={1} max={50} value={item.qty} onChange={(v) => onChange({ ...item, qty: Number(v) || 1 })} w={140} />
        <Group justify="space-between" mt="sm">
          <Button variant="subtle" color="red" leftSection={<IconTrash size={16} />} onClick={onRemove}>Удалить позицию</Button>
          <Group gap="xs"><Text fw={700}>{rub(itemPrice(item))}</Text><Button onClick={onClose}>Готово</Button></Group>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function Order({ order, setOrder, guests, run, openDish, searchRef }) {
  const [cat, setCat] = useState('popular');
  const [query, setQuery] = useState('');
  const [editUid, setEditUid] = useState(null);
  const guest = guests.find((g) => g.id === order.guestId);
  const locked = ['done', 'canceled'].includes(order.status);

  const shown = DISHES.filter((d) =>
    (query ? d.name.toLowerCase().includes(query.toLowerCase()) : cat === 'popular' ? d.popular : d.cat === cat));

  const addDish = (dish) => setOrder((o) => {
    const same = o.items.find((it) => it.dishId === dish.id && !it.mods.length && it.size === 'M');
    if (same) return { ...o, items: o.items.map((it) => (it === same ? { ...it, qty: it.qty + 1 } : it)) };
    return { ...o, items: [...o.items, { uid: `${dish.id}-${Date.now()}`, dishId: dish.id, qty: 1, size: 'M', mods: [] }] };
  });
  const updateItem = (it) => setOrder((o) => ({ ...o, items: o.items.map((x) => (x.uid === it.uid ? it : x)) }));
  const removeItem = (uid) => setOrder((o) => ({ ...o, items: o.items.filter((x) => x.uid !== uid) }));
  const changeQty = (it, d) => (it.qty + d <= 0 ? removeItem(it.uid) : updateItem({ ...it, qty: it.qty + d }));
  const total = orderTotal(order);

  return (
    <div className="order-layout">
      {/* Каталог блюд */}
      <Paper withBorder p="md" className="order-catalog">
        <Group justify="space-between" mb="sm" wrap="nowrap">
          <SegmentedControl value={query ? '' : cat} onChange={(v) => { setCat(v); setQuery(''); }} size="sm"
            data={[{ value: 'popular', label: 'Популярное' }, ...CATEGORIES.map((c) => ({ value: c.key, label: c.title }))]} />
          <TextInput ref={searchRef} placeholder="Поиск блюда" leftSection={<IconSearch size={16} />} w={200}
            value={query} onChange={(e) => setQuery(e.currentTarget.value)}
            rightSection={query && <CloseButton size="sm" onClick={() => setQuery('')} />} />
        </Group>
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          <SimpleGrid cols={{ base: 3, xl: 4 }} spacing="sm">
            {shown.map((d) => <DishTile key={d.id} dish={d} onAdd={locked ? () => {} : addDish} onInfo={openDish} />)}
          </SimpleGrid>
          {!shown.length && <Text c="dimmed" ta="center" p="xl">Ничего не найдено</Text>}
        </ScrollArea>
      </Paper>

      {/* Состав заказа */}
      <Paper withBorder p="md" className="order-cart">
        <Group justify="space-between">
          <Text fw={800} fz={22}>Заказ № {order.id}</Text>
          <Badge size="lg" color={ORDER_STATUSES[order.status].color} variant="light">{ORDER_STATUSES[order.status].title}</Badge>
        </Group>
        <SegmentedControl mt="sm" fullWidth value={order.type} disabled={locked} onChange={(v) => setOrder((o) => ({ ...o, type: v }))}
          data={Object.entries(ORDER_TYPES).map(([value, label]) => ({ value, label }))} />

        <Paper bg="gray.0" p="xs" mt="sm" radius="md">
          {guest ? (
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Avatar color="red" radius="xl">{guest.name.split(' ').map((s) => s[0]).join('')}</Avatar>
                <div>
                  <Text fw={600} fz="sm">{guest.name}</Text>
                  <Text fz="xs" c="dimmed">{guest.card} · бонусов: {guest.bonus}</Text>
                </div>
              </Group>
              {!locked && <CloseButton onClick={() => setOrder((o) => ({ ...o, guestId: null }))} aria-label="Отвязать гостя" />}
            </Group>
          ) : (
            <Button fullWidth variant="subtle" leftSection={<IconUserPlus size={18} />} rightSection={<KeyHint k="F4" />}
              disabled={locked} onClick={() => run('listGuests')}>
              Привязать гостя
            </Button>
          )}
        </Paper>

        <ScrollArea style={{ flex: 1 }} mt="sm" offsetScrollbars>
          <Stack gap={6}>
            {order.items.map((it) => {
              const d = dishById(it.dishId);
              return (
                <Group key={it.uid} className="cart-line" wrap="nowrap" gap="xs">
                  <UnstyledButton style={{ flex: 1, minWidth: 0 }} onClick={() => !locked && setEditUid(it.uid)}>
                    <Text fw={600} fz="sm" truncate>{d.name}{d.sizes && it.size !== 'M' ? ` (${SIZES.find((s) => s.key === it.size).title.toLowerCase()})` : ''}</Text>
                    {it.mods.length > 0 && <Text fz="xs" c="dimmed" truncate>{it.mods.join(', ')}</Text>}
                  </UnstyledButton>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="default" size="md" disabled={locked} onClick={() => changeQty(it, -1)} aria-label="Меньше"><IconMinus size={14} /></ActionIcon>
                    <Text w={22} ta="center" fw={700}>{it.qty}</Text>
                    <ActionIcon variant="default" size="md" disabled={locked} onClick={() => changeQty(it, 1)} aria-label="Больше"><IconPlus size={14} /></ActionIcon>
                  </Group>
                  <Text w={70} ta="right" fw={600} fz="sm">{rub(itemPrice(it))}</Text>
                </Group>
              );
            })}
            {!order.items.length && (
              <Text c="dimmed" ta="center" py="xl" fz="sm">Заказ пуст.<br />Щёлкните по плитке блюда слева, чтобы добавить его.</Text>
            )}
          </Stack>
        </ScrollArea>

        <Divider my="sm" />
        <Group justify="space-between">
          <Text c="dimmed">Позиций: {order.items.reduce((s, it) => s + it.qty, 0)}</Text>
          <Text fw={800} fz={28}>{rub(total)}</Text>
        </Group>
        {guest && <Text fz="xs" c="dimmed" ta="right">Будет начислено бонусов: {Math.round(total * 0.05)}</Text>}

        <SimpleGrid cols={3} mt="sm" spacing={6}>
          <Button variant="default" px={6} leftSection={<IconDeviceFloppy size={16} />} onClick={() => run('save')} disabled={locked}>Сохранить</Button>
          <Button variant="default" px={6} leftSection={<IconChefHat size={16} />} onClick={() => run('toKitchen')}
            disabled={locked || !order.items.length || order.status !== 'draft'}>На кухню</Button>
          <Button variant="default" px={6} leftSection={<IconReceipt size={16} />} onClick={() => run('print')} disabled={!order.items.length}>Чек</Button>
        </SimpleGrid>
        <Button mt="xs" size="lg" fullWidth leftSection={<IconCash size={22} />} rightSection={<KeyHint k="F9" />}
          disabled={!order.items.length || !!order.paid || locked} onClick={() => run('pay')}>
          {order.paid ? 'Оплачен' : `Оплатить ${rub(total)}`}
        </Button>
      </Paper>

      {editUid && (
        <ItemModal item={order.items.find((x) => x.uid === editUid)} onClose={() => setEditUid(null)}
          onChange={updateItem} onRemove={() => { removeItem(editUid); setEditUid(null); }} />
      )}
    </div>
  );
}
