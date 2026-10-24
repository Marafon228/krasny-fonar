import { Alert, Badge, Button, Group, Paper, Progress, ScrollArea, Select, SimpleGrid, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconFlame, IconFolderOpen, IconSearch } from '@tabler/icons-react';
import { CATEGORIES, DISHES, rub } from '../data.js';
import { DishIcon, KeyHint, categoryOf } from '../ui.jsx';
import { RecordNav, ScreenHeader } from './common.jsx';

export const filterDishes = (q, cat) => DISHES.filter((d) =>
  (cat === 'all' || d.cat === cat) && (!q.trim() || d.name.toLowerCase().includes(q.trim().toLowerCase())));

export function DishesList({ query, setQuery, cat, setCat, selected, setSelected, run, origin, searchRef }) {
  const list = filterDishes(query, cat);
  const ids = list.map((d) => d.id);
  const forOrder = origin === 'order';
  return (
    <>
      <ScreenHeader title="Меню ресторана" subtitle={forOrder ? 'Выберите блюдо, чтобы добавить его в текущий заказ' : 'Все блюда, цены и стоп-лист'}>
        <Button size="md" variant="default" leftSection={<IconFolderOpen size={20} />} rightSection={<KeyHint k="Enter" />} disabled={!selected} onClick={() => run('open')}>Карточка блюда</Button>
        <Button size="md" leftSection={<IconCheck size={20} />} rightSection={<KeyHint k="Ctrl+Enter" />}
          disabled={!selected || (forOrder && DISHES.find((d) => d.id === selected)?.stop)} onClick={() => run('select')}>
          {forOrder ? 'Добавить в заказ' : 'Найти заказы с блюдом'}
        </Button>
      </ScreenHeader>
      <Paper withBorder p="sm" mb="sm">
        <Group justify="space-between">
          <Group>
            <TextInput ref={searchRef} w={300} size="md" leftSection={<IconSearch size={18} />} placeholder="Название блюда"
              value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
            <Select size="md" w={220} value={cat} onChange={setCat} allowDeselect={false}
              data={[{ value: 'all', label: 'Все категории' }, ...CATEGORIES.map((c) => ({ value: c.key, label: c.title }))]} />
          </Group>
          <RecordNav ids={ids} selected={selected} onSelect={setSelected} />
        </Group>
      </Paper>
      <Paper withBorder style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="100%">
          <Table highlightOnHover stickyHeader verticalSpacing={6} fz="md">
            <Table.Thead>
              <Table.Tr><Table.Th>Блюдо</Table.Th><Table.Th>Категория</Table.Th><Table.Th ta="right">Вес, г</Table.Th><Table.Th ta="right">Ккал</Table.Th><Table.Th ta="right">Цена</Table.Th><Table.Th /></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.map((d) => (
                <Table.Tr key={d.id} className="row" data-selected={d.id === selected || undefined}
                  onClick={() => setSelected(d.id)} onDoubleClick={() => { setSelected(d.id); run('open', d.id); }}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap"><DishIcon dish={d} size={34} /><Text fw={600}>{d.name}</Text>
                      {d.popular && <IconFlame size={16} color="var(--mantine-color-orange-6)" />}</Group>
                  </Table.Td>
                  <Table.Td>{categoryOf(d.cat).title}</Table.Td>
                  <Table.Td ta="right">{d.weight}</Table.Td>
                  <Table.Td ta="right">{d.kcal}</Table.Td>
                  <Table.Td ta="right" fw={700}>{rub(d.price)}</Table.Td>
                  <Table.Td>{d.stop && <Badge color="red">стоп-лист</Badge>}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </>
  );
}

export function DishCard({ dish }) {
  const total = dish.b + dish.j + dish.u || 1;
  return (
    <>
      <ScreenHeader title="Карточка блюда" subtitle={categoryOf(dish.cat).title} />
      <SimpleGrid cols={2} spacing="md">
        <Paper withBorder p="xl" className="dish-hero">
          <DishIcon dish={dish} size={160} radius={80} />
          <Title order={2} mt="lg" ta="center">{dish.name}</Title>
          <Text fz={32} fw={800} c="red.8">{rub(dish.price)}</Text>
          {dish.stop && <Alert mt="md" color="red" icon={<IconAlertTriangle />} title="Блюдо в стоп-листе">Сейчас недоступно для заказа</Alert>}
        </Paper>
        <Stack>
          <Paper withBorder p="md">
            <Text fw={700} mb={4}>Состав</Text>
            <Text>{dish.composition}</Text>
          </Paper>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="xs"><Text fw={700}>Пищевая ценность</Text><Text c="dimmed">{dish.weight} г · {dish.kcal} ккал</Text></Group>
            <Progress.Root size={22}>
              <Progress.Section value={(dish.b / total) * 100} color="blue"><Progress.Label>Б {dish.b} г</Progress.Label></Progress.Section>
              <Progress.Section value={(dish.j / total) * 100} color="yellow"><Progress.Label>Ж {dish.j} г</Progress.Label></Progress.Section>
              <Progress.Section value={(dish.u / total) * 100} color="teal"><Progress.Label>У {dish.u} г</Progress.Label></Progress.Section>
            </Progress.Root>
          </Paper>
          <Paper withBorder p="md">
            <Text fw={700} mb="xs">Аллергены</Text>
            {dish.allergens.length
              ? <Group gap={6}>{dish.allergens.map((a) => <Badge key={a} color="orange" variant="light" size="lg">{a}</Badge>)}</Group>
              : <Text c="dimmed">Не содержит основных аллергенов</Text>}
          </Paper>
          <Text fz="sm" c="dimmed">Нажмите Esc, чтобы вернуться к предыдущему окну.</Text>
        </Stack>
      </SimpleGrid>
    </>
  );
}
