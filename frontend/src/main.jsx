import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { theme } from './theme';
import './styles.css';

if (!window.__GLOBAL_DEBUG_INSTALLED) {
  window.__GLOBAL_DEBUG_INSTALLED = true;
  window.addEventListener('error', e => {
    console.log('[GLOBAL onerror]', e.message, e.filename, e.lineno);
  });
  window.addEventListener('unhandledrejection', e => {
    console.log('[GLOBAL unhandledrejection]', e.reason);
  });
  console.log('[DEBUG] Global handlers instalados');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);