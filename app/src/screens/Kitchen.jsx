import { Badge, Group, Paper, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { ORDER_TYPES, dishById } from '../data.js';
import { ScreenHeader } from './common.jsx';

export const KITCHEN_COLUMNS = [
  { status: 'new', title: 'Новые', color: 'blue' },
  { status: 'cooking', title: 'Готовятся', color: 'orange' },
  { status: 'ready', title: 'Готовы к выдаче', color: 'green' },
];

export const NEXT_STATUS = { new: 'cooking', cooking: 'ready', ready: 'done' };

// Демонстрационное время ожидания: от времени заказа до «текущих» 12:45
const waitMinutes = (time) => { const [h, m] = time.split(':').map(Number); return Math.max(0, 12 * 60 + 45 - (h * 60 + m)); };

export default function Kitchen({ orders, selected, setSelected, advance }) {
  return (
    <>
      <ScreenHeader title="Экран кухни" subtitle="Щёлкните по заказу (или нажмите Пробел), чтобы перевести его в следующий статус" />
      <div className="kitchen-board">
        {KITCHEN_COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.status);
          return (
            <Paper key={col.status} withBorder p="sm" className="kitchen-col">
              <Group justify="space-between" mb="sm">
                <Text fw={800} fz="lg">{col.title}</Text>
                <Badge color={col.color} size="lg" circle>{list.length}</Badge>
              </Group>
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="sm">
                  {list.map((o) => {
                    const wait = waitMinutes(o.time);
                    return (
                      <UnstyledButton key={o.id} className="kitchen-ticket" data-color={col.color} data-selected={o.id === selected || undefined}
                        onClick={() => { setSelected(o.id); advance(o.id); }}>
                        <Group justify="space-between">
                          <Text fz={28} fw={900}>№ {o.id}</Text>
                          <Stack gap={2} align="flex-end">
                            <Badge variant="outline" color="dark">{ORDER_TYPES[o.type]}</Badge>
                            <Group gap={4} c={wait > 8 ? 'red.7' : 'dimmed'}><IconClock size={14} /><Text fz="sm" fw={600}>{wait} мин</Text></Group>
                          </Stack>
                        </Group>
                        <Stack gap={2} mt={6}>
                          {o.items.map((it) => (
                            <Text key={it.uid} fz="md"><b>{it.qty}×</b> {dishById(it.dishId).name}
                              {it.mods.length > 0 && <Text span c="red.7" fz="sm"> — {it.mods.join(', ')}</Text>}</Text>
                          ))}
                        </Stack>
                      </UnstyledButton>
                    );
                  })}
                  {!list.length && <Text c="dimmed" ta="center" py="lg">Нет заказов</Text>}
                </Stack>
              </ScrollArea>
            </Paper>
          );
        })}
      </div>
    </>
  );
}
