import path from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: [
          '@houdoku/common',
          '@houdoku/online-reader',
          'jsdom',
          'node-fetch',
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
  renderer: {
    build: {
      sourcemap: true, // Enable source maps for better error traces
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'fs', 'constants', 'stream', 'util', 'zlib'],
      }),
    ],
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
});
