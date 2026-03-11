import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'
import Zones from './pages/Zones'
import Capteurs from './pages/Capteurs'
import Pompes from './pages/Pompes'
import Alertes from './pages/Alertes'

const ACTIVE_ALERT_COUNT = 4

function AppLayout() {
  const { sidebarCollapsed } = useTheme()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setRefreshKey(k => k + 1)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="app-layout">
      <Sidebar alertCount={ACTIVE_ALERT_COUNT} />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onRefresh={handleRefresh} loading={loading} alertCount={ACTIVE_ALERT_COUNT} />
        <main className="page-content" key={refreshKey}>
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/zones"    element={<Zones />} />
            <Route path="/capteurs" element={<Capteurs />} />
            <Route path="/pompes"   element={<Pompes />} />
            <Route path="/alertes"  element={<Alertes />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  )
}
