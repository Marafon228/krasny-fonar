import { Group, Kbd, Menu, Text, UnstyledButton } from '@mantine/core';
import { MENU, STATES } from './spec.js';

// Название раздела с подчёркнутой буквой быстрого доступа (Alt+буква)
function AccessTitle({ title, access }) {
  const i = title.indexOf(access);
  if (i < 0) return title;
  return (<>{title.slice(0, i)}<u>{title[i]}</u>{title.slice(i + 1)}</>);
}

export function commandOp(stateKey, cmd) {
  return STATES[stateKey]?.cmds[cmd];
}

export function isEnabled(stateKey, section, cmd) {
  if (section.standard) return true;
  return commandOp(stateKey, cmd) !== undefined;
}

function OpTag({ op, show }) {
  if (!show || op === undefined) return null;
  return <Text span fz="xs" c="red.6" fw={600} ml={6}>({op})</Text>;
}

export default function MainMenu({ stateKey, showOps, opened, setOpened, onCommand }) {
  return (
    <Group gap={2} className="menubar" wrap="nowrap">
      {MENU.map((section) => (
        <Menu
          key={section.key}
          opened={opened === section.key}
          onChange={(o) => setOpened(o ? section.key : null)}
          position="bottom-start"
          offset={2}
          width={290}
          shadow="lg"
          transitionProps={{ duration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <UnstyledButton
              className="menubar-item"
              data-active={opened === section.key || undefined}
              onMouseEnter={() => opened && opened !== section.key && setOpened(section.key)}
            >
              <AccessTitle title={section.title} access={section.access} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {section.items.map((it, idx) => {
              if (it.divider) return <Menu.Divider key={idx} />;
              if (it.sub) {
                const anyEnabled = it.sub.some((s) => isEnabled(stateKey, section, s.key));
                return (
                  <Menu.Sub key={it.key} position="right-start" offset={4}>
                    <Menu.Sub.Target>
                      <Menu.Sub.Item disabled={!anyEnabled}>{it.title}</Menu.Sub.Item>
                    </Menu.Sub.Target>
                    <Menu.Sub.Dropdown>
                      {it.sub.map((s) => {
                        const en = isEnabled(stateKey, section, s.key);
                        return (
                          <Menu.Item key={s.key} disabled={!en} onClick={() => onCommand(s.key)}
                            rightSection={s.shortcut && <Kbd size="xs">{s.shortcut}</Kbd>}>
                            {s.title}<OpTag op={commandOp(stateKey, s.key)} show={showOps} />
                          </Menu.Item>
                        );
                      })}
                    </Menu.Sub.Dropdown>
                  </Menu.Sub>
                );
              }
              const en = isEnabled(stateKey, section, it.key);
              return (
                <Menu.Item key={it.key} disabled={!en} onClick={() => onCommand(it.key)}
                  rightSection={it.shortcut && <Kbd size="xs">{it.shortcut}</Kbd>}>
                  {it.title}<OpTag op={commandOp(stateKey, it.key)} show={showOps} />
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      ))}
    </Group>
  );
}
