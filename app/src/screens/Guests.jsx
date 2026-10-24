import { useEffect, useState } from 'react';
import {
  Avatar, Badge, Button, Card, Group, Paper, ScrollArea, SimpleGrid, Stack, Switch, Table, Text, TextInput,
} from '@mantine/core';
import { IconCheck, IconDeviceFloppy, IconFolderOpen, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { ORDER_STATUSES, orderTotal, rub } from '../data.js';
import { KeyHint } from '../ui.jsx';
import { RecordNav, ScreenHeader } from './common.jsx';

export const filterGuests = (guests, q) => {
  const s = q.trim().toLowerCase();
  const digits = s.replace(/\D/g, '');
  return guests.filter((g) => !s || g.name.toLowerCase().includes(s) || (digits && g.phone.replace(/\D/g, '').includes(digits)));
};

export function GuestsList({ guests, query, setQuery, selected, setSelected, run, origin, searchRef }) {
  const list = filterGuests(guests, query);
  const ids = list.map((g) => g.id);
  const forOrder = origin === 'order';
  // При привязке гостя к заказу курсор сразу стоит в поле поиска (ЛР2)
  useEffect(() => { if (forOrder) searchRef.current?.focus(); }, [forOrder, searchRef]);
  return (
    <>
      <ScreenHeader title="Список гостей"
        subtitle={forOrder ? 'Выберите гостя, чтобы привязать его к текущему заказу' : 'Гости программы лояльности'}>
        <Button size="md" variant="default" leftSection={<IconUserPlus size={20} />} rightSection={<KeyHint k="Ins" />} onClick={() => run('createGuest')}>Новый гость</Button>
        <Button size="md" variant="default" leftSection={<IconFolderOpen size={20} />} rightSection={<KeyHint k="Enter" />} disabled={!selected} onClick={() => run('open')}>Открыть</Button>
        <Button size="md" leftSection={<IconCheck size={20} />} rightSection={<KeyHint k="Ctrl+Enter" />} disabled={!selected} onClick={() => run('select')}>
          {forOrder ? 'Привязать к заказу' : 'Найти заказы гостя'}
        </Button>
      </ScreenHeader>
      <Paper withBorder p="sm" mb="sm">
        <Group justify="space-between">
          <TextInput ref={searchRef} w={360} size="md" leftSection={<IconSearch size={18} />} placeholder="Телефон (последние цифры) или имя"
            value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
          <RecordNav ids={ids} selected={selected} onSelect={setSelected} />
        </Group>
      </Paper>
      <Paper withBorder style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="100%">
          <Table highlightOnHover stickyHeader verticalSpacing="sm" fz="md">
            <Table.Thead>
              <Table.Tr><Table.Th>Гость</Table.Th><Table.Th>Телефон</Table.Th><Table.Th>Карта</Table.Th><Table.Th ta="right">Бонусы</Table.Th><Table.Th ta="right">Визитов</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((g) => (
                <Table.Tr key={g.id} className="row" data-selected={g.id === selected || undefined}
                  onClick={() => setSelected(g.id)} onDoubleClick={() => { setSelected(g.id); run(forOrder ? 'select' : 'open', g.id); }}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="red" radius="xl" size="sm">{g.name.split(' ').map((s) => s[0]).join('')}</Avatar>
                      <Text fw={600}>{g.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{g.phone}</Table.Td>
                  <Table.Td><Badge variant="outline" color="gray">{g.card}</Badge></Table.Td>
                  <Table.Td ta="right" fw={600}>{g.bonus}</Table.Td>
                  <Table.Td ta="right">{g.visits}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {!list.length && <Text ta="center" c="dimmed" p="xl">Гость не найден. Нажмите «Новый гость», чтобы зарегистрировать его.</Text>}
        </ScrollArea>
      </Paper>
    </>
  );
}

export function GuestCard({ guest, orders, reg, run }) {
  const [form, setForm] = useState(guest);
  const [errors, setErrors] = useState({});
  useEffect(() => setForm(guest), [guest]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value });

  // Команда «Сохранить» главного меню вызывает проверку этой формы
  reg.current.saveGuest = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Укажите имя гостя';
    if (form.phone.replace(/\D/g, '').length < 11) err.phone = 'Телефон в формате +7 900 000-00-00';
    setErrors(err);
    return Object.keys(err).length ? null : form;
  };

  const history = orders.filter((o) => o.guestId === guest.id);
  return (
    <>
      <ScreenHeader title={guest.isNew ? 'Новый гость' : 'Карточка гостя'} subtitle={guest.isNew ? 'Заполните имя и телефон' : form.name}>
        <Button size="md" leftSection={<IconDeviceFloppy size={20} />} rightSection={<KeyHint k="Ctrl+S" />} onClick={() => run('save')}>Сохранить</Button>
      </ScreenHeader>
      <SimpleGrid cols={2} spacing="md">
        <Paper withBorder p="lg">
          <Stack>
            <TextInput label="Имя и фамилия" required size="md" value={form.name} onChange={set('name')} error={errors.name} data-autofocus />
            <TextInput label="Телефон" required size="md" placeholder="+7 900 000-00-00" value={form.phone} onChange={set('phone')} error={errors.phone} />
            <TextInput label="E-mail" size="md" value={form.email} onChange={set('email')} />
            <TextInput label="Дата рождения" type="date" size="md" value={form.birthday} onChange={set('birthday')} />
            <Switch label="Согласен получать акции по SMS" checked={form.promo} onChange={set('promo')} />
          </Stack>
        </Paper>
        <Stack>
          <Card withBorder className="loyalty-card" padding="lg">
            <Text fz="sm" c="red.1">Карта лояльности</Text>
            <Text fz={26} fw={800} c="white" style={{ letterSpacing: 2 }}>{form.card}</Text>
            <Group justify="space-between" mt="md">
              <div><Text fz="xs" c="red.1">Бонусы</Text><Text fz={22} fw={700} c="white">{form.bonus}</Text></div>
              <div><Text fz="xs" c="red.1">Визитов</Text><Text fz={22} fw={700} c="white">{form.visits}</Text></div>
            </Group>
          </Card>
          <Paper withBorder p="md">
            <Text fw={700} mb="xs">История заказов</Text>
            {history.length ? history.map((o) => (
              <Group key={o.id} justify="space-between" py={4}>
                <Text fz="sm">№ {o.id} · {o.time}</Text>
                <Group gap="xs"><Badge size="sm" variant="light" color={ORDER_STATUSES[o.status].color}>{ORDER_STATUSES[o.status].title}</Badge><Text fz="sm" fw={600}>{rub(orderTotal(o))}</Text></Group>
              </Group>
            )) : <Text c="dimmed" fz="sm">Заказов в этой смене нет</Text>}
          </Paper>
        </Stack>
      </SimpleGrid>
    </>
  );
}
