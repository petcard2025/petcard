import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

export default defineConfig({
  plugins: [vue()],
  server: {
    https: {
      key: fs.readFileSync('./basedatos-backend/certs/cert.key'),
cert: fs.readFileSync('./basedatos-backend/certs/cert.crt'),
    }
  }
})