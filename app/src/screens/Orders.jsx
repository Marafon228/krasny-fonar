import { Badge, Button, Card, CloseButton, Group, Paper, ScrollArea, SegmentedControl, Select, SimpleGrid, Table, Text, TextInput } from '@mantine/core';
import { IconFilterOff, IconFolderOpen, IconPlus, IconSearch, IconUser, IconBurger } from '@tabler/icons-react';
import { ORDER_STATUSES, ORDER_TYPES, PAYMENT, dishById, orderTotal, rub } from '../data.js';
import { KeyHint } from '../ui.jsx';
import { RecordNav, ScreenHeader } from './common.jsx';

const STATUS_GROUPS = {
  all: () => true,
  active: (o) => ['draft', 'new', 'cooking', 'ready'].includes(o.status),
  done: (o) => o.status === 'done',
  canceled: (o) => o.status === 'canceled',
};

export function filterOrders(orders, f) {
  return orders.filter((o) =>
    (!f.number || String(o.id).includes(f.number.trim())) &&
    STATUS_GROUPS[f.status](o) &&
    (f.type === 'all' || o.type === f.type) &&
    (!f.guestId || o.guestId === f.guestId) &&
    (!f.dishId || o.items.some((it) => it.dishId === f.dishId)));
}

export default function Orders({ orders, guests, filters, setFilters, selected, setSelected, run, searchRef }) {
  const list = filterOrders(orders, filters);
  const ids = list.map((o) => o.id);
  const guestName = (id) => guests.find((g) => g.id === id)?.name;
  const paidOrders = orders.filter((o) => o.paid);
  const revenue = paidOrders.reduce((s, o) => s + orderTotal(o), 0);

  return (
    <>
      <ScreenHeader title="Журнал заказов" subtitle="Смена № 214 · 24 октября 2026">
        <Button size="md" leftSection={<IconPlus size={20} />} rightSection={<KeyHint k="Ins" />} onClick={() => run('createOrder')}>
          Новый заказ
        </Button>
        <Button size="md" variant="default" leftSection={<IconFolderOpen size={20} />} rightSection={<KeyHint k="Enter" />}
          disabled={!selected} onClick={() => run('open')}>
          Открыть
        </Button>
      </ScreenHeader>

      <SimpleGrid cols={4} mb="md">
        {[
          ['Заказов за смену', orders.length],
          ['Активных', orders.filter(STATUS_GROUPS.active).length],
          ['Выручка', rub(revenue)],
          ['Средний чек', rub(Math.round(revenue / Math.max(1, paidOrders.length)))],
        ].map(([label, value]) => (
          <Card key={label} withBorder padding="sm">
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
            <Text fz={22} fw={700}>{value}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Paper withBorder p="sm" mb="sm">
        <Group gap="sm" align="flex-end" wrap="wrap">
          <TextInput ref={searchRef} label="Номер заказа" placeholder="например, 1045" w={170}
            leftSection={<IconSearch size={16} />} value={filters.number}
            onChange={(e) => setFilters({ ...filters, number: e.currentTarget.value })} />
          <div>
            <Text fz="sm" fw={500} mb={4}>Статус</Text>
            <SegmentedControl value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}
              data={[{ value: 'all', label: 'Все' }, { value: 'active', label: 'Активные' }, { value: 'done', label: 'Выданные' }, { value: 'canceled', label: 'Отменённые' }]} />
          </div>
          <Select label="Тип" w={150} value={filters.type} allowDeselect={false}
            onChange={(v) => setFilters({ ...filters, type: v })}
            data={[{ value: 'all', label: 'Любой' }, ...Object.entries(ORDER_TYPES).map(([value, label]) => ({ value, label }))]} />
          {filters.guestId && (
            <Badge size="lg" variant="light" leftSection={<IconUser size={14} />}
              rightSection={<CloseButton size="xs" onClick={() => setFilters({ ...filters, guestId: null })} />}>
              Гость: {guestName(filters.guestId)}
            </Badge>
          )}
          {filters.dishId && (
            <Badge size="lg" variant="light" color="orange" leftSection={<IconBurger size={14} />}
              rightSection={<CloseButton size="xs" onClick={() => setFilters({ ...filters, dishId: null })} />}>
              Блюдо: {dishById(filters.dishId)?.name}
            </Badge>
          )}
          <Group ml="auto" gap="xs">
            <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={() => run('resetFilter')}>
              Сбросить
            </Button>
            <RecordNav ids={ids} selected={selected} onSelect={setSelected} />
          </Group>
        </Group>
      </Paper>

      <Paper withBorder style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="100%">
          <Table highlightOnHover stickyHeader verticalSpacing="sm" fz="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>№</Table.Th><Table.Th>Время</Table.Th><Table.Th>Тип</Table.Th><Table.Th>Гость</Table.Th>
                <Table.Th>Состав</Table.Th><Table.Th ta="right">Сумма</Table.Th><Table.Th>Оплата</Table.Th><Table.Th>Статус</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((o) => (
                <Table.Tr key={o.id} className="row" data-selected={o.id === selected || undefined}
                  onClick={() => setSelected(o.id)} onDoubleClick={() => { setSelected(o.id); run('open', o.id); }}>
                  <Table.Td fw={700}>{o.id}</Table.Td>
                  <Table.Td>{o.time}</Table.Td>
                  <Table.Td>{ORDER_TYPES[o.type]}</Table.Td>
                  <Table.Td>{guestName(o.guestId) ?? <Text span c="dimmed">—</Text>}</Table.Td>
                  <Table.Td maw={300}><Text truncate fz="sm">{o.items.map((it) => `${dishById(it.dishId)?.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join(', ') || '—'}</Text></Table.Td>
                  <Table.Td ta="right" fw={600}>{rub(orderTotal(o))}</Table.Td>
                  <Table.Td>{o.paid ? PAYMENT[o.paid] : <Text span c="dimmed">не оплачен</Text>}</Table.Td>
                  <Table.Td><Badge color={ORDER_STATUSES[o.status].color} variant="light">{ORDER_STATUSES[o.status].title}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {!list.length && <Text ta="center" c="dimmed" p="xl">Заказы по заданным параметрам не найдены</Text>}
        </ScrollArea>
      </Paper>
    </>
  );
}
