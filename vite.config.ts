import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/math-tutor-app/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'react-vendor', test: /node_modules\/(react|react-dom|scheduler)\// }],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', '.github/scripts/**/*.test.mjs'],
  },
})
