import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing/Landing'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Balenie from './pages/Balenie/Balenie'
import Plan from './pages/Plan/Plan'
import Cesty from './pages/Cesty/Cesty'
import Rozpocet from './pages/Rozpocet/Rozpocet'
import Spomienky from './pages/Spomienky/Spomienky'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Landing page — full screen, no nav */}
        <Route path="/" element={<Landing />} />

        {/* Main app — with navigation layout */}
        <Route element={<Layout />}>
          <Route path="/domov"     element={<Home />} />
          <Route path="/balenie"   element={<Balenie />} />
          <Route path="/plan"      element={<Plan />} />
          <Route path="/cesty"     element={<Cesty />} />
          <Route path="/rozpocet"  element={<Rozpocet />} />
          <Route path="/spomienky" element={<Spomienky />} />
          <Route path="*"          element={<Navigate to="/domov" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
