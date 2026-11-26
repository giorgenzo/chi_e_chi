/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Percorso su GitHub Pages: https://<utente>.github.io/chi_e_chi/
export default defineConfig({
  base: '/chi_e_chi/',
  plugins: [react()],
  test: { environment: 'node' },
});
