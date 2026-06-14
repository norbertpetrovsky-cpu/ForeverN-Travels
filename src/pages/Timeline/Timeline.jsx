import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Star, MapPin, Calendar, Users } from 'lucide-react'
import { loadTrips, saveTrips, loadBucket, saveBucket, formatDateRange, generateId, ALL_MODULES } from '../../data/trips'
import BucketModal from '../Bucket/BucketModal'
import NewTripModal from './NewTripModal'

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

function TripCard({ trip, onClick, index }) {
  const status = statusOf(trip)
  const isPast    = status === 'past'
  const isActive  = status === 'active'
  const isPlanned = status === 'planned'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22,1,0.36,1] }}
      onClick={onClick}
      className={`trip-card ${isActive ? 'trip-card-active' : isPlanned ? 'trip-card-planned' : 'trip-card-past'}`}
      style={{ opacity: isPast ? 0.82 : 1 }}
      whileHover={{ y: isActive ? -8 : -5 }}
    >
      {/* Colour bar top */}
      <div className="h-1.5 w-full rounded-t-3xl" style={{
        background: isActive
          ? 'linear-gradient(90deg, #0CB4CC, #3DCFE4, #0CB4CC)'
          : isPlanned
          ? 'linear-gradient(90deg, #FF6B6B, #FF9B9B)'
          : `linear-gradient(90deg, ${trip.color}99, ${trip.color}44)`,
        backgroundSize: isActive ? '200% 100%' : undefined,
        animation: isActive ? 'shimmerBar 2.5s linear infinite' : undefined,
      }}/>

      <div className="p-5 flex flex-col h-full" style={{ minHeight: isActive ? '340px' : '260px' }}>
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: isActive  ? 'rgba(12,180,204,0.18)' :
                          isPlanned ? 'rgba(255,107,107,0.18)' :
                          'rgba(255,255,255,0.08)',
              color: isActive  ? '#3DCFE4' :
                     isPlanned ? '#FF9B9B' :
                     'rgba(255,248,240,0.45)',
            }}>
            {isActive ? '● Aktívna' : isPlanned ? '✦ Plánovaná' : 'Navštívená'}
          </span>
          <span className="text-lg">{trip.flag}</span>
        </div>

        {/* Flag + Destination */}
        <div className="flex-1">
          <h3 className={`font-extrabold leading-tight mb-1 ${isActive ? 'text-2xl text-white' : 'text-xl text-white/90'}`}>
            {trip.destination}
          </h3>
          <p className="text-xs text-white/40 mb-3">{trip.country}</p>

          {trip.hotel && (
            <p className="text-xs text-white/35 mb-2 flex items-center gap-1">
              <MapPin size={10} className="opacity-60"/> {trip.hotel}
            </p>
          )}

          <p className="text-xs text-white/30 flex items-center gap-1 mb-4">
            <Calendar size={10} className="opacity-60"/>
            {formatDateRange(trip.dateFrom, trip.dateTo)}
          </p>

          {trip.highlight && (
            <p className={`text-xs leading-relaxed ${isActive ? 'text-white/60' : 'text-white/35'}`}>
              {trip.highlight}
            </p>
          )}
        </div>

        {/* Who */}
        <div className="mt-4 pt-4 border-t border-white/6">
          <p className="text-[10px] text-white/30">{whoLabel(trip.who)}</p>
        </div>

        {/* Active CTA */}
        {isActive && (
          <motion.div
            className="mt-4 py-2.5 rounded-xl text-center text-xs font-bold tracking-wide"
            style={{ background:'rgba(12,180,204,0.15)', color:'#3DCFE4', border:'1px solid rgba(12,180,204,0.25)' }}
            whileHover={{ background:'rgba(12,180,204,0.25)' }}
          >
            Otvoriť cestu →
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function Timeline() {
  const navigate  = useNavigate()
  const trackRef  = useRef(null)
  const [trips,  setTrips]  = useState(loadTrips)
  const [bucket, setBucket] = useState(loadBucket)
  const [showBucket,  setShowBucket]  = useState(false)
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  // Sort: past asc, then active, then planned
  const sorted = [...trips].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom))

  const checkArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', checkArrows, { passive: true })
    checkArrows()
    // Scroll to active card
    setTimeout(() => {
      const activeIdx = sorted.findIndex(t => statusOf(t) === 'active')
      if (activeIdx > 0) {
        const cards = el.querySelectorAll('.trip-card')
        if (cards[activeIdx]) cards[activeIdx].scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' })
      }
    }, 400)
    return () => el.removeEventListener('scroll', checkArrows)
  }, [])

  function scroll(dir) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  function handleSaveTrips(updated) { setTrips(updated); saveTrips(updated) }
  function handleSaveBucket(updated) { setBucket(updated); saveBucket(updated) }

  function createTripFromBucket(item) {
    setShowBucket(false)
    setTimeout(() => setShowNewTrip({ prefill: item }), 300)
  }

  function addNewTrip(tripData) {
    const newTrip = {
      ...tripData,
      id: generateId(),
      modules: Object.fromEntries(ALL_MODULES.map(m => [m.id, true])),
      highlight: '',
      bestMoment: '',
      bestRestaurant: '',
    }
    handleSaveTrips([...trips, newTrip])
    setShowNewTrip(false)
  }

  return (
    <div className="timeline-page min-h-screen flex flex-col">

      {/* Header */}
      <motion.div
        initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="flex items-center justify-between px-6 md:px-10 pt-8 pb-4"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color:'#0CB4CC' }}>
            ForeverN Travels
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Naše Cesty</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Bucket list */}
          <motion.button
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowBucket(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background:'rgba(255,107,107,0.12)', border:'1px solid rgba(255,107,107,0.25)', color:'#FF9B9B' }}
          >
            <Star size={13}/> Bucket list
          </motion.button>

          {/* New trip */}
          <motion.button
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowNewTrip(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background:'rgba(12,180,204,0.12)', border:'1px solid rgba(12,180,204,0.25)', color:'#3DCFE4' }}
          >
            <Plus size={13}/> Nová cesta
          </motion.button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
        className="flex items-center gap-6 px-6 md:px-10 pb-6"
      >
        {[
          { label:'Navštívené krajiny', value: new Set(trips.filter(t=>statusOf(t)==='past').map(t=>t.country)).size },
          { label:'Celkom ciest',       value: trips.length },
          { label:'Bucket list',        value: bucket.length },
        ].map(s => (
          <div key={s.label}>
            <span className="text-xl font-extrabold" style={{ color:'#0CB4CC' }}>{s.value}</span>
            <span className="text-xs text-white/35 ml-1.5">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Carousel */}
      <div className="relative flex-1 flex items-center">
        {/* Left arrow */}
        <AnimatePresence>
          {canLeft && (
            <motion.button
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
              className="carousel-arrow carousel-arrow-left hidden md:flex"
              onClick={() => scroll(-1)}
            >
              <ChevronLeft size={20}/>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Track */}
        <div ref={trackRef} className="carousel-track w-full items-stretch" style={{ paddingBottom:'60px' }}>
          {sorted.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={i}
              onClick={() => navigate(`/trip/${trip.id}`)}
            />
          ))}
        </div>

        {/* Right arrow */}
        <AnimatePresence>
          {canRight && (
            <motion.button
              initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}
              className="carousel-arrow carousel-arrow-right hidden md:flex"
              onClick={() => scroll(1)}
            >
              <ChevronRight size={20}/>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Timeline thread */}
        <div className="timeline-thread hidden md:block"/>
      </div>

      {/* Scroll hint on mobile */}
      <motion.p
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
        className="text-center text-[10px] text-white/20 pb-6 tracking-widest uppercase md:hidden"
      >
        Potiahnite pre ďalšie cesty →
      </motion.p>

      {/* Modals */}
      <AnimatePresence>
        {showBucket && (
          <BucketModal
            bucket={bucket}
            onSave={handleSaveBucket}
            onClose={() => setShowBucket(false)}
            onPlanTrip={createTripFromBucket}
          />
        )}
        {showNewTrip && (
          <NewTripModal
            prefill={showNewTrip?.prefill}
            onSave={addNewTrip}
            onClose={() => setShowNewTrip(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
