import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/framer-motion') || id.includes('node_modules/zustand')) {
            return 'reactCore';
          }

          if (id.includes('node_modules/@react-three/drei')) {
            return 'drei';
          }

          if (id.includes('node_modules/@react-three/fiber')) {
            return 'r3f';
          }

          if (id.includes('node_modules/three/examples')) {
            return 'three-extras';
          }

          if (id.includes('node_modules/three')) {
            return 'three-core';
          }

          return undefined;
        },
      },
    },
  },
});
