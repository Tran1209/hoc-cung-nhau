import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' giúp web chạy được ở mọi nơi (Vercel, Netlify, GitHub Pages, thư mục con...)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    watch: {
      ignored: ['**/*.apk', '**/*.pdf', '**/*.zip', '**/dist/**', '**/.git/**']
    }
  }
});
