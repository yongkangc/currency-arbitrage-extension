import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'),
        background: path.resolve(__dirname, 'src/background/service-worker.ts'),
        content: path.resolve(__dirname, 'src/content/content-script.ts'),
        options: path.resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const baseName = path.basename(chunkInfo.name, path.extname(chunkInfo.name));
          const folder = chunkInfo.name.includes('background') ? 'background' :
                        chunkInfo.name.includes('content') ? 'content' :
                        chunkInfo.name.includes('popup') ? 'popup' :
                        chunkInfo.name.includes('options') ? 'options' : '';
          return folder ? `${folder}/${baseName}.js` : `${baseName}.js`;
        },
        chunkFileNames: 'shared/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = path.extname(assetInfo.name);
          if (/\.(css)$/.test(extType)) {
            return 'styles/[name][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(extType)) {
            return 'assets/[name][extname]';
          }
          return '[name][extname]';
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    reportCompressedSize: false,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@adapters': path.resolve(__dirname, './src/adapters'),
      '@background': path.resolve(__dirname, './src/background'),
      '@content': path.resolve(__dirname, './src/content'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 3000,
    open: false,
    hmr: {
      port: 3001,
    },
  },
});