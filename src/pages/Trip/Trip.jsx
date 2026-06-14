import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, X, MapPin, Calendar, Hotel, Users, Check } from 'lucide-react'
import { loadTrips, saveTrips, formatDateRange, ALL_MODULES } from '../../data/trips'

function statusOf(trip) {
  const now = new Date(), from = new Date(trip.dateFrom), to = new Date(trip.dateTo)
  if (now < from) return 'planned'
  if (now > to)   return 'past'
  return 'active'
}

function whoLabel(who) {
  if (who === 'couple') return '👫 Norbi & Natalita'
  if (who === 'family') return '👨‍👩‍👧 Celá rodina'
  return who
}

function SettingsModal({ trip, onSave, onClose }) {
  const [modules, setModules] = useState({ ...trip.modules })
  function toggle(id) { setModules(m => ({ ...m, [id]: !m[id] })) }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal-sheet max-w-sm"
        initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-white">Nastavenia cesty</h2>
            <p className="text-xs text-white/35 mt-0.5">{trip.destination}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/60"/>
          </button>
        </div>

        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Aktívne moduly</p>
        <div className="flex flex-col gap-2">
          {ALL_MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => toggle(mod.id)}
              className="flex items-center justify-between p-3.5 rounded-xl transition-all"
              style={{
                background: modules[mod.id] ? 'rgba(12,180,204,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${modules[mod.id] ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{mod.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{mod.label}</p>
                  <p className="text-xs text-white/35">{mod.labelFull}</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: modules[mod.id] ? '#0CB4CC' : 'rgba(255,255,255,0.1)' }}>
                {modules[mod.id] && <Check size={11} className="text-white"/>}
              </div>
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
          onClick={() => onSave(modules)}
          className="w-full mt-5 py-3 rounded-xl font-bold text-sm"
          style={{ background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff' }}
        >
          Uložiť zmeny
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function Trip() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [trips,   setTrips]    = useState(loadTrips)
  const [showSettings, setShowSettings] = useState(false)

  const trip = trips.find(t => t.id === id)

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center text-white/40">
      <div className="text-center">
        <p className="text-4xl mb-4">🗺️</p>
        <p className="font-semibold">Cesta nenájdená</p>
        <button onClick={() => navigate('/timeline')} className="mt-4 text-sm text-turquoise underline">
          Späť na cesty
        </button>
      </div>
    </div>
  )

  const status = statusOf(trip)

  function saveModules(modules) {
    const updated = trips.map(t => t.id === id ? { ...t, modules } : t)
    setTrips(updated)
    saveTrips(updated)
    setShowSettings(false)
  }

  const activeModules  = ALL_MODULES.filter(m => trip.modules[m.id])
  const inactiveModules = ALL_MODULES.filter(m => !trip.modules[m.id])

  // Module coming soon content (to be replaced step by step)
  function handleModuleClick(modId) {
    // Future: navigate to module
    alert(`Modul "${modId}" bude dostupný v ďalšom kroku vývoja.`)
  }

  return (
    <div className="trip-page min-h-screen">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-6 pb-4">
        {/* Back to timeline */}
        <motion.button
          whileHover={{ x:-2 }} whileTap={{ scale:0.97 }}
          onClick={() => navigate('/timeline')}
          className="float-btn"
        >
          <ArrowLeft size={14}/>
          <span>Všetky cesty</span>
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ rotate:30 }} whileTap={{ scale:0.95 }}
          onClick={() => setShowSettings(true)}
          className="float-btn"
        >
          <Settings size={14}/>
          <span className="hidden sm:inline">Nastavenia</span>
        </motion.button>
      </div>

      {/* Trip overview card */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="mx-4 md:mx-8 mb-8 rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${trip.color}22, rgba(255,255,255,0.03))`,
          border: status === 'active'
            ? `1px solid ${trip.color}55`
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: status === 'active' ? `0 0 40px ${trip.color}22` : 'none',
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{trip.flag}</span>
                {status === 'active' && (
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background:'rgba(12,180,204,0.15)', color:'#3DCFE4', border:'1px solid rgba(12,180,204,0.3)' }}>
                    ● Aktívna
                  </span>
                )}
                {status === 'planned' && (
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background:'rgba(255,107,107,0.15)', color:'#FF9B9B', border:'1px solid rgba(255,107,107,0.3)' }}>
                    ✦ Plánovaná
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {trip.destination}
              </h1>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 opacity-50" style={{ color:trip.color }}/>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Krajina</p>
                <p className="text-sm text-white font-semibold mt-0.5">{trip.country}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={14} className="mt-0.5 flex-shrink-0 opacity-50" style={{ color:trip.color }}/>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Termín</p>
                <p className="text-sm text-white font-semibold mt-0.5">{formatDateRange(trip.dateFrom, trip.dateTo)}</p>
              </div>
            </div>
            {trip.hotel && (
              <div className="flex items-start gap-2">
                <Hotel size={14} className="mt-0.5 flex-shrink-0 opacity-50" style={{ color:trip.color }}/>
                <div>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Hotel</p>
                  <p className="text-sm text-white font-semibold mt-0.5">{trip.hotel}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Users size={14} className="mt-0.5 flex-shrink-0 opacity-50" style={{ color:trip.color }}/>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Cestujú</p>
                <p className="text-sm text-white font-semibold mt-0.5">{whoLabel(trip.who)}</p>
              </div>
            </div>
          </div>

          {trip.highlight && (
            <p className="mt-5 text-sm text-white/45 italic border-t border-white/8 pt-4">
              "{trip.highlight}"
            </p>
          )}
        </div>
      </motion.div>

      {/* Modules */}
      <div className="px-4 md:px-8 pb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Moduly</p>

        <div className="module-grid">
          {/* Active modules */}
          {activeModules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.07, duration:0.4, ease:[0.22,1,0.36,1] }}
              onClick={() => handleModuleClick(mod.id)}
              className="module-tile"
            >
              <div className="text-3xl mb-3">{mod.icon}</div>
              <p className="text-sm font-bold text-white">{mod.label}</p>
              <p className="text-[10px] text-white/35 mt-1">{mod.labelFull}</p>
            </motion.div>
          ))}

          {/* Inactive modules — greyed out */}
          {inactiveModules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay: (activeModules.length + i) * 0.07 }}
              className="module-tile module-tile-disabled"
              title="Vypnutý — zapni v Nastaveniach"
            >
              <div className="text-3xl mb-3 grayscale">{mod.icon}</div>
              <p className="text-sm font-bold text-white/30">{mod.label}</p>
              <p className="text-[10px] text-white/20 mt-1">Vypnutý</p>
            </motion.div>
          ))}
        </div>

        {inactiveModules.length > 0 && (
          <p className="text-xs text-white/20 mt-4 text-center">
            {inactiveModules.length} {inactiveModules.length === 1 ? 'modul vypnutý' : 'moduly vypnuté'} — zapni v Nastaveniach
          </p>
        )}
      </div>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal trip={trip} onSave={saveModules} onClose={() => setShowSettings(false)}/>
        )}
      </AnimatePresence>
    </div>
  )
}
