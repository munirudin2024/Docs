import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // listen localhost
  //server: {
  //  host: '127.0.0.1',
  //  port: 5173,
  //  strictPort: true,
  //}

  // listen all network
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
