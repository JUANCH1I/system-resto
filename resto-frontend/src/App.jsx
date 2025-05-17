import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import MesasDiagramaPage from './pages/MesasDiagramaPage'
import MesasAbmPage from './pages/MesasAbmPage'
import ProductosPage from './pages/ProductosPage'
import CategoriasPage from './pages/CategoriasPage'
import ComandaPage from './pages/ComandaPage'
import CierreComandaPage from './components/CierreComandaPage'
import HomePage from './pages/HomePage'
import HistorialFacturasPage from './pages/HistorialFacturasPage'
import ClientesPage from './pages/ClientesPage'
import CajaPage from './pages/CajaPage'
import LoginPage from './pages/LoginPage'
import RequireAuth from './components/RequireAuth'
import HistorialCajasPage from './pages/HistorialCajaPage'
import ReportesPage from './pages/ReportesPage'
import { CajaProvider } from './context/CajaContext'
import { Toaster } from 'react-hot-toast'


export default function App() {
  return (
    <BrowserRouter>
      <CajaProvider>
          <Toaster/>
        <MainLayout>
          <Routes>
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/mesas/diagrama" element={<RequireAuth><MesasDiagramaPage /></RequireAuth>} />
            <Route path="/mesas/abm" element={<RequireAuth><MesasAbmPage /></RequireAuth>} />
            <Route path="/productos" element={<RequireAuth><ProductosPage /></RequireAuth>} />
            <Route path="/categorias" element={<RequireAuth><CategoriasPage /></RequireAuth>} />
            <Route path="/comanda/:id" element={<RequireAuth><ComandaPage /></RequireAuth>} />
            <Route path="/comanda/:id/cierre" element={<RequireAuth><CierreComandaPage /></RequireAuth>} />
            <Route path="/facturas" element={<RequireAuth><HistorialFacturasPage /></RequireAuth>} />
            <Route path="/clientes" element={<RequireAuth><ClientesPage /></RequireAuth>} />
            <Route path="/caja" element={<RequireAuth><CajaPage /></RequireAuth>} />
            <Route path="/historial-cajas" element={<RequireAuth><HistorialCajasPage /></RequireAuth>} />
            <Route path="/reportes" element={<RequireAuth><ReportesPage /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MainLayout>
      </CajaProvider>
    </BrowserRouter>
  )
}
