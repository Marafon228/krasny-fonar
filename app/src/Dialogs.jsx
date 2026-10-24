import { useState } from 'react';
import { Button, Checkbox, Divider, Group, Modal, NumberInput, Paper, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconCash, IconCreditCard, IconPrinter, IconQrcode } from '@tabler/icons-react';
import { PAYMENT, SIZES, dishById, itemPrice, orderTotal, rub } from './data.js';
import { Logo } from './ui.jsx';

export function PayModal({ order, guest, onClose, onPaid }) {
  const total = orderTotal(order);
  const [method, setMethod] = useState('card');
  const [cash, setCash] = useState(total);
  const [useBonus, setUseBonus] = useState(false);
  const bonus = guest && useBonus ? Math.min(guest.bonus, Math.floor(total * 0.3)) : 0;
  const due = total - bonus;
  const change = method === 'cash' ? Math.max(0, (Number(cash) || 0) - due) : 0;
  const notEnough = method === 'cash' && (Number(cash) || 0) < due;
  return (
    <Modal opened onClose={onClose} title={<Text fw={700}>Оплата заказа № {order.id}</Text>} centered size="md">
      <Stack>
        <Group justify="space-between"><Text c="dimmed">Сумма заказа</Text><Text fw={700} fz="xl">{rub(total)}</Text></Group>
        {guest && guest.bonus > 0 && (
          <Checkbox checked={useBonus} onChange={(e) => setUseBonus(e.currentTarget.checked)}
            label={`Списать бонусы гостя (доступно ${guest.bonus}, не более 30 % суммы)`} />
        )}
        <SegmentedControl fullWidth size="md" value={method} onChange={setMethod} data={[
          { value: 'card', label: <Group gap={6} justify="center"><IconCreditCard size={18} />Карта</Group> },
          { value: 'cash', label: <Group gap={6} justify="center"><IconCash size={18} />Наличные</Group> },
          { value: 'sbp', label: <Group gap={6} justify="center"><IconQrcode size={18} />СБП</Group> },
        ]} />
        {method === 'cash' && (
          <Group grow align="flex-end">
            <NumberInput label="Получено от гостя" size="md" min={0} value={cash} onChange={setCash} suffix=" ₽" thousandSeparator=" " data-autofocus />
            <Paper withBorder p="xs"><Text fz="xs" c="dimmed">Сдача</Text><Text fw={700} fz="lg">{rub(change)}</Text></Paper>
          </Group>
        )}
        {method === 'card' && <Text c="dimmed" fz="sm">Попросите гостя приложить карту к терминалу.</Text>}
        {method === 'sbp' && <Text c="dimmed" fz="sm">QR-код показан на экране покупателя.</Text>}
        <Divider />
        <Group justify="space-between">
          <Text fw={600}>К оплате</Text><Text fw={800} fz={26} c="red.8">{rub(due)}</Text>
        </Group>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Отмена</Button>
          <Button size="md" disabled={notEnough} data-autofocus={method !== 'cash' || undefined} onClick={() => onPaid(method, bonus)}>Провести оплату</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function ReceiptModal({ order, guest, onClose, onPrint }) {
  return (
    <Modal opened onClose={onClose} title={<Text fw={700}>Печать чека</Text>} centered size="sm">
      <Paper withBorder p="md" className="receipt">
        <Group justify="center" mb="xs"><Logo size={28} /></Group>
        <Text ta="center" fz="xs">ООО «Красный фонарь» · ИНН 0000000000</Text>
        <Text ta="center" fz="xs" mb="xs">Касса № 1 · Смена № 214 · Заказ № {order.id}</Text>
        <Divider variant="dashed" />
        {order.items.map((it) => {
          const d = dishById(it.dishId);
          return (
            <Group key={it.uid} justify="space-between" wrap="nowrap" fz="sm">
              <Text fz="sm">{it.qty} × {d.name}{d.sizes && it.size !== 'M' ? ` (${SIZES.find((s) => s.key === it.size).title.toLowerCase()})` : ''}</Text>
              <Text fz="sm">{rub(itemPrice(it))}</Text>
            </Group>
          );
        })}
        <Divider variant="dashed" my={4} />
        <Group justify="space-between"><Text fw={800}>ИТОГО</Text><Text fw={800}>{rub(orderTotal(order))}</Text></Group>
        <Text fz="xs">Оплата: {order.paid ? PAYMENT[order.paid] : 'не оплачен'}</Text>
        {guest && <Text fz="xs">Гость: {guest.card}</Text>}
        <Text ta="center" fz="xs" mt="xs">Спасибо! Приходите ещё</Text>
      </Paper>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>Закрыть</Button>
        <Button leftSection={<IconPrinter size={18} />} onClick={onPrint}>Печать</Button>
      </Group>
    </Modal>
  );
}

export function AboutModal({ onClose }) {
  return (
    <Modal opened onClose={onClose} title="О программе" centered>
      <Stack align="center" gap="xs">
        <Logo size={48} />
        <Text fw={700} mt="sm">Красный фонарь — Касса</Text>
        <Text c="dimmed" fz="sm">Версия 0.1 (прототип интерфейса)</Text>
        <Text fz="sm" ta="center">Рабочее место кассира ресторана быстрого обслуживания. Учебный проект по дисциплине «Проектирование человеко-машинного интерфейса».</Text>
      </Stack>
    </Modal>
  );
}
