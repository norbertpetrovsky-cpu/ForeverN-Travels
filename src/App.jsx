import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Landing  from './pages/Landing/Landing'
import Timeline from './pages/Timeline/Timeline'
import Trip     from './pages/Trip/Trip'

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                   element={<Landing />} />
        <Route path="/timeline"           element={<Timeline />} />
        <Route path="/trip/:id"           element={<Trip />} />
        <Route path="/trip/:id/:module"   element={<Trip />} />
      </Routes>
    </AnimatePresence>
  )
}
