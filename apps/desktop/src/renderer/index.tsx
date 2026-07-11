import { createRoot } from 'react-dom/client';
import './App.global.css';
import { RecoilRoot, useRecoilValue } from 'recoil';
import App from './App';

import { Titlebar } from './components/general/Titlebar';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { themeState } from './state/settingStates';
import { ApplicationTheme } from '@/common/models/types';
import { useEffect } from 'react';

// Block Chromium's default (white) context menu everywhere in the renderer.
// The main-process registerContextMenu handler builds the same Electron-native
// (dark) menu for every context — editable fields, selected text, etc.
// Preventing the DOM-level contextmenu event ensures Chromium's white menu
// never leaks through, so only the consistent Electron Menu is seen.
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

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
