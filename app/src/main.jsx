import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './app.css';
import App from './App.jsx';

const theme = createTheme({
  primaryColor: 'red',
  primaryShade: 7,
  fontFamily: '"Segoe UI", "Inter", system-ui, sans-serif',
  defaultRadius: 'md',
  headings: { fontWeight: '700' },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider theme={theme} defaultColorScheme="light">
    <Notifications position="bottom-right" limit={3} />
    <App />
  </MantineProvider>,
);
