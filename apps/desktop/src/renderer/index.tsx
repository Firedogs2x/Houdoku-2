import { createRoot } from 'react-dom/client';
import './App.global.css';
import { RecoilRoot, useRecoilValue } from 'recoil';
import App from './App';

import { Titlebar } from './components/general/Titlebar';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { themeState } from './state/settingStates';
import { ApplicationTheme } from '@/common/models/types';
import { useEffect } from 'react';

const { ipcRenderer } = require('electron');

document.addEventListener(
  'contextmenu',
  (e: MouseEvent) => {
    // Skip reader viewer — it has its own onContextMenu handler that suppresses
    // context menus entirely inside the reader.
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-reader-viewer]')) {
      return;
    }

    // Block Chromium's default (white) context menu.
    e.preventDefault();

    const el = e.target as HTMLElement | null;
    const isEditable =
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el?.isContentEditable === true;

    const selection = window.getSelection();
    const hasSelection = (selection?.toString().trim().length ?? 0) > 0;

    // Ask the main process to show the Electron-native (dark) menu.
    ipcRenderer.send('houdoku:show-context-menu', { isEditable, hasSelection });
  },
);

const main = document.createElement('main');
document.body.appendChild(main);
const root = createRoot(main);

function Root() {
  const theme = useRecoilValue(themeState);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === ApplicationTheme.Light ? 'light' : 'dark');
  }, [theme]);

  return (
    <>
      <header id="titlebar">
        <Titlebar />
      </header>
      <div id="root">
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </div>
    </>
  );
}

root.render(
  <RecoilRoot>
    <Root />
  </RecoilRoot>,
);
