import { Box, Group, Kbd, Text, ThemeIcon } from '@mantine/core';
import {
  IconBurger, IconToolsKitchen2, IconMeat, IconCookie, IconCup, IconIceCream2, IconDroplet, IconCoffee, IconFish, IconLamp,
} from '@tabler/icons-react';
import { CATEGORIES } from './data.js';

const CAT_ICONS = {
  burgers: IconBurger, combo: IconToolsKitchen2, chicken: IconMeat, snacks: IconCookie,
  drinks: IconCup, desserts: IconIceCream2, sauces: IconDroplet,
};

export const categoryOf = (key) => CATEGORIES.find((c) => c.key === key);

export function DishIcon({ dish, size = 44, radius = 'md' }) {
  const cat = categoryOf(dish.cat);
  let Icon = CAT_ICONS[dish.cat] ?? IconBurger;
  if (dish.id === 503) Icon = IconCoffee;
  if (dish.id === 105) Icon = IconFish;
  return (
    <ThemeIcon size={size} radius={radius} variant="light" color={cat?.color ?? 'red'}>
      <Icon size={size * 0.6} stroke={1.6} />
    </ThemeIcon>
  );
}

export function Logo({ size = 34, light = false }) {
  return (
    <Group gap={10} wrap="nowrap">
      <Box className="logo-lamp" style={{ width: size, height: size }}>
        <IconLamp size={size * 0.68} stroke={1.8} />
      </Box>
      <Box>
        <Text fw={800} fz={size * 0.5} lh={1} c={light ? 'white' : 'red.8'} style={{ letterSpacing: 0.3 }}>
          Красный фонарь
        </Text>
        <Text fz={size * 0.3} lh={1.3} c={light ? 'red.1' : 'dimmed'}>быстрое питание</Text>
      </Box>
    </Group>
  );
}

// Подпись кнопки с горячей клавишей справа
export function KeyHint({ k }) {
  if (!k) return null;
  return <Kbd size="xs" className="key-hint">{k}</Kbd>;
}
