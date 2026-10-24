import { Fragment, useMemo, useState } from 'react';
import {
  ActionIcon, Anchor, Button, Group, Image, Kbd, Modal, NavLink, Popover, ScrollArea, Stack, Table, Tabs, Text, TextInput, ThemeIcon, Title, Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft, IconBook, IconCash, IconChefHat, IconChevronLeft, IconChevronRight, IconFileText, IconHome, IconList, IconPrinter, IconSearch,
} from '@tabler/icons-react';
import { HELP_GROUPS, TOPICS, buildIndex, topicById, topicsByAlink, topicsByKeywords } from './help.js';
import { Logo } from './ui.jsx';

const TOKEN = /(\[\[[^\]]+\]\]|\{\{[^}]+\}\}|<<[^>]+>>|\*\*[^*]+\*\*)/g;
const BROWSE = TOPICS.filter((t) => t.browse).sort((a, b) => a.browse.localeCompare(b.browse));
const plain = (s) => s.replace(/\[\[[^|]+\|([^\]]+)\]\]|\{\{[^|]+\|([^}]+)\}\}|<<[^|]+\|([^>]+)>>|\*\*([^*]+)\*\*/g, (_, a, b, c, d) => a ?? b ?? c ?? d);
const topicText = (t) => t.body.map((b) => b.p ?? b.h ?? (b.ul ?? b.ol ?? []).join(' ') ?? '').join(' ');

function Inline({ text, go, klink }) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('[[')) {
      const [id, label] = part.slice(2, -2).split('|');
      return <Anchor key={i} className="help-jump" onClick={() => go(id)}>{label}</Anchor>;
    }
    if (part.startsWith('{{')) {
      const [id, label] = part.slice(2, -2).split('|');
      const t = topicById(id);
      return (
        <Popover key={i} width={320} withArrow shadow="md" position="top">
          <Popover.Target><Anchor className="help-popup" component="span">{label}</Anchor></Popover.Target>
          <Popover.Dropdown bg="yellow.0">{t?.body.map((b, j) => <Text key={j} fz="sm"><Inline text={b.p} go={go} klink={klink} /></Text>)}</Popover.Dropdown>
        </Popover>
      );
    }
    if (part.startsWith('<<')) {
      const [kws, label] = part.slice(2, -2).split('|');
      return <Anchor key={i} className="help-jump" onClick={() => klink(kws.split(';'))}>{label}</Anchor>;
    }
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function HelpImage({ name }) {
  if (name === 'logo') return <div className="help-img"><Logo size={44} /></div>;
  const icons = { icon_pay: IconCash, icon_print: IconPrinter, icon_kitchen: IconChefHat };
  if (icons[name]) { const I = icons[name]; return <ThemeIcon size={48} variant="light" radius="md" mb="sm"><I size={30} /></ThemeIcon>; }
  return <Image src={`help/${name}.png`} radius="md" className="help-shot" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}

function TopicView({ topic, go, klink, alink }) {
  return (
    <Stack gap="sm">
      <Title order={3}>{topic.title}</Title>
      {topic.body.map((b, i) => {
        if (b.img) return <HelpImage key={i} name={b.img} />;
        if (b.h) return <Text key={i} fw={700} fz="lg" mt="xs">{b.h}</Text>;
        if (b.p) return <Text key={i}><Inline text={b.p} go={go} klink={klink} /></Text>;
        if (b.ul || b.ol) {
          const Tag = b.ul ? 'ul' : 'ol';
          return <Tag key={i} className="help-list">{(b.ul ?? b.ol).map((li, j) => <li key={j}><Inline text={li} go={go} klink={klink} /></li>)}</Tag>;
        }
        if (b.keys) return (
          <Table key={i} withTableBorder striped>
            <Table.Tbody>{b.keys.map(([k, v]) => <Table.Tr key={k}><Table.Td w={170}><Kbd>{k}</Kbd></Table.Td><Table.Td>{v}</Table.Td></Table.Tr>)}</Table.Tbody>
          </Table>
        );
        if (b.alink) return (
          <Group key={i} mt="xs"><Button variant="light" size="xs" leftSection={<IconBook size={14} />} onClick={() => alink(b.alink.key)}>См. также: {b.alink.label}</Button></Group>
        );
        return null;
      })}
    </Stack>
  );
}

export default function HelpViewer({ opened, onClose, topicId, setTopicId, tab, setTab }) {
  const [history, setHistory] = useState([]);
  const [indexQuery, setIndexQuery] = useState('');
  const [search, setSearch] = useState('');
  const [found, setFound] = useState(null); // окно «Найденные разделы»
  const index = useMemo(buildIndex, []);
  const topic = topicById(topicId) ?? topicById('IDH_CONTENTS');

  const go = (id) => {
    const t = topicById(id);
    if (!t) return;
    setFound(null);
    if (t.popup) { setFound({ title: t.title, topics: [t] }); return; }
    setHistory((h) => [...h, topic.id]);
    setTopicId(id);
  };
  const choose = (topics, title) => (topics.length === 1 ? go(topics[0].id) : setFound({ title, topics }));
  const klink = (kws) => choose(topicsByKeywords(kws), 'Найденные разделы');
  const alink = (key) => choose(topicsByAlink(key).filter((t) => t.id !== topic.id), 'Найденные разделы');
  const back = () => setHistory((h) => { if (!h.length) return h; setTopicId(h[h.length - 1]); return h.slice(0, -1); });
  const bi = BROWSE.findIndex((t) => t.id === topic.id);

  const searchResults = search.trim().length > 1
    ? TOPICS.filter((t) => !t.popup && (t.title + ' ' + plain(topicText(t))).toLowerCase().includes(search.trim().toLowerCase()))
    : [];

  return (
    <Modal opened={opened} onClose={onClose} size="min(1100px, 95vw)" padding={0} centered
      title={<Group gap="xs" px="md"><IconBook size={20} /><Text fw={700}>Справка — Красный фонарь</Text></Group>}
      styles={{ header: { borderBottom: '1px solid var(--mantine-color-gray-3)' } }}>
      <div className="help-layout">
        <div className="help-side">
          <Tabs value={tab} onChange={setTab} variant="outline">
            <Tabs.List grow>
              <Tabs.Tab value="contents" leftSection={<IconList size={14} />}>Содержание</Tabs.Tab>
              <Tabs.Tab value="index" leftSection={<IconFileText size={14} />}>Указатель</Tabs.Tab>
              <Tabs.Tab value="search" leftSection={<IconSearch size={14} />}>Поиск</Tabs.Tab>
            </Tabs.List>
            <ScrollArea h={540} p="xs">
              <Tabs.Panel value="contents">
                <NavLink label="Содержание" leftSection={<IconHome size={16} />} active={topic.id === 'IDH_CONTENTS'} onClick={() => go('IDH_CONTENTS')} />
                {HELP_GROUPS.map((g) => (
                  <NavLink key={g.key} label={g.label ?? g.title} leftSection={<IconBook size={16} />} defaultOpened childrenOffset={18}>
                    {TOPICS.filter((t) => t.group === g.key).map((t) => (
                      <NavLink key={t.id} label={t.title} leftSection={<IconFileText size={14} />} active={t.id === topic.id} onClick={() => go(t.id)} />
                    ))}
                  </NavLink>
                ))}
              </Tabs.Panel>
              <Tabs.Panel value="index">
                <TextInput placeholder="Введите первые буквы слова" mb="xs" value={indexQuery} onChange={(e) => setIndexQuery(e.currentTarget.value)} />
                {index.filter(([k]) => k.toLowerCase().startsWith(indexQuery.toLowerCase())).map(([k, ids]) => (
                  <NavLink key={k} label={k} py={3} onClick={() => choose(ids.map(topicById), `Найденные разделы: «${k}»`)} />
                ))}
              </Tabs.Panel>
              <Tabs.Panel value="search">
                <TextInput placeholder="Слово для поиска" mb="xs" leftSection={<IconSearch size={14} />} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
                {searchResults.map((t) => <NavLink key={t.id} label={t.title} onClick={() => go(t.id)} />)}
                {search.trim().length > 1 && !searchResults.length && <Text c="dimmed" fz="sm">Ничего не найдено</Text>}
              </Tabs.Panel>
            </ScrollArea>
          </Tabs>
        </div>
        <div className="help-main">
          <Group gap={4} p="xs" className="help-toolbar">
            <Tooltip label="Назад"><ActionIcon variant="default" disabled={!history.length} onClick={back}><IconArrowLeft size={16} /></ActionIcon></Tooltip>
            <Tooltip label="Предыдущая тема"><ActionIcon variant="default" disabled={bi <= 0} onClick={() => go(BROWSE[bi - 1].id)}><IconChevronLeft size={16} /></ActionIcon></Tooltip>
            <Tooltip label="Следующая тема"><ActionIcon variant="default" disabled={bi < 0 || bi >= BROWSE.length - 1} onClick={() => go(BROWSE[bi + 1].id)}><IconChevronRight size={16} /></ActionIcon></Tooltip>
            <Button variant="subtle" size="xs" leftSection={<IconHome size={14} />} onClick={() => go('IDH_CONTENTS')}>Содержание</Button>
          </Group>
          <ScrollArea h={540} p="lg"><TopicView topic={topic} go={go} klink={klink} alink={alink} /></ScrollArea>
        </div>
      </div>

      <Modal opened={!!found} onClose={() => setFound(null)} title={found?.title} size="sm" centered>
        {found?.topics.length === 1 && found.topics[0].popup
          ? found.topics[0].body.map((b, i) => <Text key={i}><Inline text={b.p} go={go} klink={klink} /></Text>)
          : (
            <Stack gap={2}>
              {found?.topics.map((t) => <NavLink key={t.id} label={t.title} leftSection={<IconFileText size={14} />} onClick={() => go(t.id)} />)}
              {found && !found.topics.length && <Text c="dimmed">Дополнительные сведения отсутствуют</Text>}
            </Stack>
          )}
      </Modal>
    </Modal>
  );
}
