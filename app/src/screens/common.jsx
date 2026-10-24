import { ActionIcon, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronsLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';

export function ScreenHeader({ title, subtitle, children }) {
  return (
    <Group justify="space-between" align="flex-end" mb="md" wrap="nowrap">
      <div>
        <Title order={2} fz={24}>{title}</Title>
        {subtitle && <Text c="dimmed" fz="sm">{subtitle}</Text>}
      </div>
      <Group gap="xs" wrap="nowrap">{children}</Group>
    </Group>
  );
}

// Перемещение по списку: первая / предыдущая / следующая / последняя запись (ЛР2)
export function RecordNav({ ids, selected, onSelect }) {
  const i = ids.indexOf(selected);
  const go = (j) => ids.length && onSelect(ids[Math.max(0, Math.min(ids.length - 1, j))]);
  const items = [
    ['К первой записи (Home)', IconChevronsLeft, () => go(0)],
    ['К предыдущей записи (↑)', IconChevronLeft, () => go(i - 1)],
    ['К следующей записи (↓)', IconChevronRight, () => go(i + 1)],
    ['К последней записи (End)', IconChevronsRight, () => go(ids.length - 1)],
  ];
  return (
    <ActionIcon.Group>
      {items.map(([label, Icon, fn]) => (
        <Tooltip key={label} label={label} withArrow>
          <ActionIcon variant="default" size="lg" onClick={fn} aria-label={label}><Icon size={18} /></ActionIcon>
        </Tooltip>
      ))}
    </ActionIcon.Group>
  );
}

export function moveSelection(ids, selected, dir) {
  if (!ids.length) return selected;
  const i = ids.indexOf(selected);
  if (dir === 'home') return ids[0];
  if (dir === 'end') return ids[ids.length - 1];
  if (i < 0) return ids[0];
  return ids[Math.max(0, Math.min(ids.length - 1, i + (dir === 'up' ? -1 : 1)))];
}
