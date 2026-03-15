import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,  // 如果端口被占用，自动尝试下一个可用端口
    host: true,         // 监听所有地址，包括局域网
  },
})
