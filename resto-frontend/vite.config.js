import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import os from 'os'

// 🔧 Función para detectar la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL_PRODUCTION': JSON.stringify(
      `http://${localIP}:3000/api`
    ),
  },
})
