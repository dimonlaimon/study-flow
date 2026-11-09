import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ← ДОБАВЛЕНО: базовый путь для GitHub Pages.
  // Без него ассеты ищутся от корня dimonlaimon.github.io,
  // а проект лежит в /study-flow/ — отсюда белый экран.
  base: '/study-flow/',
});
