import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import os from 'os'

function getPreferredIP() {
  const interfaces = os.networkInterfaces()
  let vpnIP = null
  let lanIP = null

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (name.toLowerCase().includes('zerotier')) {
          vpnIP = iface.address
        } else if (iface.address.startsWith('192.168.')) {
          lanIP = iface.address
        }
      }
    }
  }
  console.log('IP LAN:', lanIP)
  console.log('IP VPN:', vpnIP)
  // Usar primero LAN si está disponible, sino VPN
  return lanIP || vpnIP || 'localhost'
}

const serverIP = getPreferredIP()
console.log('usando ip', serverIP)

export default defineConfig({
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(`http://${serverIP}:3000/api`)
  }
})
