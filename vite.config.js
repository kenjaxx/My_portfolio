import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Pre-bundle everything at startup. Your lazy-loaded parts (Three.js, the
  // carousels, gsap) import these late, which makes Vite re-bundle
  // mid-session and causes the white screen.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'framer-motion',
      'motion/react',
      'react-icons/fa',
      'three',
      'gsap',
    ],
  },
})