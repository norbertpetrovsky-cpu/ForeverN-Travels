import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, MapPin, Calendar } from 'lucide-react'
import {
  loadTrips, saveTrips, loadBucket, saveBucket,
  formatDateRange, generateId, ALL_MODULES,
  SPECIAL_MOMENTS, whoLabel
} from '../../data/trips'
import BucketModal from '../Bucket/BucketModal'
import NewTripModal from './NewTripModal'

// ─── Helpers ──────────────────────────────────────────────────
function statusOf(trip) {
  const now = new Date(), from = new Date(trip.dateFrom), to = new Date(trip.dateTo)
  if (now < from) return 'planned'
  if (now > to)   return 'past'
  return 'active'
}

function getYear(dateStr) {
  return new Date(dateStr).getFullYear()
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Countdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  if (diff <= 0) return (
    <div className="mt-3 text-center text-xs font-bold" style={{ color: '#3DCFE4' }}>✈️ Letíme!</div>
  )
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(12,180,204,0.08)', border: '1px solid rgba(12,180,204,0.2)' }}>
      <div className="text-center mb-2" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(12,180,204,0.7)' }}>Odlet o</div>
      <div className="flex items-center justify-center gap-1.5">
        {[{ v: pad(d), l: 'dní' }, { v: pad(h), l: 'hod' }, { v: pad(m), l: 'min' }, { v: pad(s), l: 'sek' }].map((x, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: 'rgba(12,180,204,0.4)', fontSize: '1rem', fontWeight: 300, lineHeight: '1.5' }}>:</span>}
            <div className="text-center">
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0CB4CC', fontVariantNumeric: 'tabular-nums' }}>{x.v}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,248,240,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{x.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SVG Landmark Silhouettes ─────────────────────────────────
const LandmarkSVGs = {
  bratislava: ({ color = '#0CB4CC' }) => (
    <svg width="55" height="90" viewBox="0 0 55 90" fill={color}>
      <rect x="5" y="50" width="45" height="40" rx="2"/>
      <rect x="12" y="35" width="31" height="20"/>
      <rect x="8" y="20" width="8" height="18"/>
      <rect x="39" y="20" width="8" height="18"/>
      <rect x="22" y="10" width="11" height="26"/>
      <rect x="24" y="2" width="7" height="12"/>
    </svg>
  ),
  mountains: ({ color = '#0CB4CC' }) => (
    <svg width="80" height="90" viewBox="0 0 80 90" fill={color}>
      <polygon points="40,5 0,90 80,90"/>
      <polygon points="15,30 -10,90 40,90" opacity=".6"/>
      <polygon points="65,25 40,90 90,90" opacity=".6"/>
    </svg>
  ),
  bridge: ({ color = '#0CB4CC' }) => (
    <svg width="70" height="90" viewBox="0 0 70 90" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
      <path d="M5,90 Q5,40 35,20 Q65,40 65,90"/>
      <path d="M15,90 Q15,50 35,35 Q55,50 55,90"/>
      <line x1="5" y1="65" x2="65" y2="65"/>
      <path d="M25,80 Q35,72 45,80" fill={color} stroke="none"/>
    </svg>
  ),
  colosseum: ({ color = '#FF6B6B' }) => (
    <svg width="90" height="80" viewBox="0 0 90 80" fill={color}>
      <ellipse cx="45" cy="45" rx="44" ry="32"/>
      <ellipse cx="45" cy="45" rx="30" ry="20" fill="#060D1A"/>
      <rect x="1" y="13" width="88" height="9" rx="2"/>
      <rect x="1" y="13" width="10" height="67" rx="2"/>
      <rect x="79" y="13" width="10" height="67" rx="2"/>
    </svg>
  ),
  palm: ({ color = '#0CB4CC' }) => (
    <svg width="65" height="90" viewBox="0 0 65 90" fill="none">
      <path d="M32,90 Q30,60 33,35 Q35,20 32,10" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <path d="M32,18 Q18,10 5,18" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M32,18 Q28,4 18,0" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M32,18 Q40,5 50,8" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M32,18 Q46,14 60,10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M32,18 Q48,22 58,30" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="32" cy="86" rx="22" ry="5" fill={color} opacity=".5"/>
    </svg>
  ),
  eiffel: ({ color = '#FF9B9B' }) => (
    <svg width="55" height="90" viewBox="0 0 55 90" fill={color}>
      <polygon points="27,2 20,40 34,40"/>
      <polygon points="27,38 12,70 42,70"/>
      <rect x="8" y="68" width="39" height="6" rx="2"/>
      <polygon points="27,72 5,90 49,90"/>
      <rect x="20" y="36" width="15" height="6" rx="2"/>
      <rect x="5" y="46" width="45" height="4" rx="2"/>
    </svg>
  ),
}

// ─── SVG Silhouettes per trip (bg decorations on cards) ──────
function CardSilhouette({ tripId, side }) {
  const style = {
    position: 'absolute', pointerEvents: 'none', zIndex: 0,
    opacity: 0.07,
    bottom: 0,
    [side === 'left' ? 'left' : 'right']: -20,
  }
  if (tripId === 'side-2019')
    return <svg style={{ ...style, width: 140, height: 140 }} viewBox="0 0 80 100" fill="#C17F3E">
      <rect x="35" y="10" width="10" height="60" rx="5"/>
      <ellipse cx="40" cy="10" rx="20" ry="12"/>
      <path d="M20,35 Q5,30 5,20 Q5,8 20,8" stroke="#C17F3E" strokeWidth="3" fill="none"/>
      <path d="M60,35 Q75,30 75,20 Q75,8 60,8" stroke="#C17F3E" strokeWidth="3" fill="none"/>
    </svg>
  if (tripId === 'donovaly-2021')
    return <svg style={{ ...style, width: 180, height: 150 }} viewBox="0 0 100 80" fill="#5B8C5A">
      <polygon points="50,5 0,80 100,80"/>
      <polygon points="20,30 -10,80 50,80" opacity=".6"/>
      <polygon points="80,25 50,80 110,80" opacity=".6"/>
    </svg>
  if (tripId === 'slovinsko-taliansko-2022')
    return <svg style={{ ...style, width: 180, height: 130 }} viewBox="0 0 100 70" fill="none">
      <path d="M0,70 Q50,20 100,70" stroke="#7B5EA7" strokeWidth="4"/>
      <path d="M10,70 Q50,35 90,70" stroke="#7B5EA7" strokeWidth="3"/>
      <line x1="50" y1="22" x2="50" y2="70" stroke="#7B5EA7" strokeWidth="3"/>
      <line x1="30" y1="42" x2="30" y2="70" stroke="#7B5EA7" strokeWidth="2"/>
      <line x1="70" y1="42" x2="70" y2="70" stroke="#7B5EA7" strokeWidth="2"/>
    </svg>
  if (tripId?.startsWith('cyprus'))
    return <svg style={{ ...style, width: 200, height: 110, opacity: 0.09 }} viewBox="0 0 110 60" fill="#0CB4CC">
      <path d="M5,45 Q20,20 40,30 Q50,15 65,25 Q80,10 95,30 Q110,40 105,50 Q90,60 60,55 Q30,65 5,45Z"/>
      <circle cx="55" cy="10" r="7" fill="rgba(255,210,0,0.9)"/>
    </svg>
  if (tripId?.startsWith('rim'))
    return <svg style={{ ...style, width: 180, height: 130 }} viewBox="0 0 90 70" fill="#C17F3E">
      <ellipse cx="45" cy="40" rx="44" ry="28"/>
      <ellipse cx="45" cy="40" rx="30" ry="18" fill="#060D1A"/>
      <rect x="1" y="12" width="88" height="8" rx="2"/>
    </svg>
  return null
}

// ─── Trip Card ────────────────────────────────────────────────
function TripCard({ trip, isActive, isHighlighted, side, onNavigate }) {
  const status = statusOf(trip)
  const isPast = status === 'past'

  const gradients = {
    'side-2019': 'linear-gradient(135deg, rgba(193,127,62,0.18) 0%, rgba(180,100,40,0.08) 100%)',
    'donovaly-2021': 'linear-gradient(135deg, rgba(91,140,90,0.18) 0%, rgba(50,100,50,0.08) 100%)',
    'slovinsko-taliansko-2022': 'linear-gradient(135deg, rgba(123,94,167,0.18) 0%, rgba(80,50,130,0.08) 100%)',
    'cyprus-2022': 'linear-gradient(135deg, rgba(12,180,204,0.15) 0%, rgba(10,138,163,0.07) 100%)',
    'rim-2023': 'linear-gradient(135deg, rgba(193,127,62,0.18) 0%, rgba(180,100,40,0.08) 100%)',
    'cyprus-2024': 'linear-gradient(135deg, rgba(12,180,204,0.15) 0%, rgba(10,138,163,0.07) 100%)',
    'cyprus-2025': 'linear-gradient(135deg, rgba(12,180,204,0.15) 0%, rgba(10,138,163,0.07) 100%)',
    'cyprus-2026': 'linear-gradient(135deg, rgba(12,180,204,0.22) 0%, rgba(61,207,228,0.10) 100%)',
  }

  return (
    <motion.div
      onClick={onNavigate}
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: gradients[trip.id] || 'rgba(255,255,255,0.04)',
        border: `1px solid ${isActive
          ? 'rgba(12,180,204,0.45)'
          : isHighlighted
          ? 'rgba(255,255,255,0.18)'
          : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        padding: '18px 20px',
        maxWidth: 270,
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isActive
          ? '0 8px 32px rgba(12,180,204,0.18), 0 0 60px rgba(12,180,204,0.08)'
          : isHighlighted
          ? '0 4px 16px rgba(255,255,255,0.05)'
          : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <CardSilhouette tripId={trip.id} side={side} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Active badge */}
        {isActive && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#3DCFE4', background: 'rgba(12,180,204,0.12)',
            border: '1px solid rgba(12,180,204,0.25)', borderRadius: 20,
            padding: '3px 10px', marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0CB4CC', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }}/>
            Aktívna cesta
          </div>
        )}

        {/* Flag + destination */}
        <div style={{ fontSize: 20, marginBottom: 6 }}>{trip.flag}</div>
        <div style={{
          fontSize: isActive ? '1.1rem' : '1rem',
          fontWeight: 800, lineHeight: 1.2, marginBottom: 3,
          color: isActive ? 'transparent' : '#fff',
          background: isActive ? 'linear-gradient(135deg,#0CB4CC,#3DCFE4)' : undefined,
          WebkitBackgroundClip: isActive ? 'text' : undefined,
          backgroundClip: isActive ? 'text' : undefined,
          WebkitTextFillColor: isActive ? 'transparent' : undefined,
        }}>{trip.destination}</div>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,248,240,0.38)', fontWeight: 600, marginBottom: 8 }}>{trip.country}</div>

        {trip.highlight && (
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,248,240,0.5)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 8 }}>
            {trip.highlight}
          </div>
        )}

        <div style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.3)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: trip.hotel ? 4 : 0 }}>
          {formatShortDate(trip.dateFrom)} – {formatShortDate(trip.dateTo)}
        </div>

        {trip.hotel && (
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.3)' }}>🏨 {trip.hotel}</div>
        )}

        <div style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.28)', marginTop: 6 }}>
          {whoLabel(trip.who)}
        </div>

        {isActive && <Countdown target={new Date('2026-07-25T06:00:00').getTime()} />}

        <div style={{
          marginTop: 12, padding: '7px 14px', borderRadius: 10, textAlign: 'center',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
          background: isActive ? 'rgba(12,180,204,0.15)' : 'rgba(255,255,255,0.06)',
          color: isActive ? '#3DCFE4' : 'rgba(255,248,240,0.45)',
          border: `1px solid ${isActive ? 'rgba(12,180,204,0.25)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          Otvoriť cestu →
        </div>
      </div>
    </motion.div>
  )
}

// ─── Special moment card (non-trip) ──────────────────────────
function SpecialCard({ moment, side }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255,107,107,0.06)',
        border: '1px solid rgba(255,107,107,0.2)',
        borderRadius: 16,
        padding: '14px 18px',
        maxWidth: 230,
        width: '100%',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 6 }}>{moment.icon}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: 3 }}>{moment.label}</div>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
        {new Date(moment.date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </motion.div>
  )
}

// ─── Milestone Dot ────────────────────────────────────────────
function MilestoneDot({ trip, isActive, isSpecial, isHighlighted, year, showYear }) {
  const dotSize = isActive ? 90 : isSpecial ? 60 : 72
  const emoji = isSpecial
    ? (trip?.color === '#FFB6C1' ? '👶' : '❤️')
    : isActive ? '✈️'
    : trip?.id?.startsWith('cyprus') ? ['🌊','🐚','🌴','🌊','🌴'][['cyprus-2022','cyprus-2024','cyprus-2025','cyprus-2026'].indexOf(trip?.id)] || '🌊'
    : trip?.id === 'donovaly-2021' ? '⛷️'
    : trip?.id === 'side-2019' ? '💑'
    : trip?.id?.startsWith('slovinsko') ? '🚗'
    : trip?.id?.startsWith('rim') ? '🏛️'
    : '🌍'

  return (
    <div style={{ position: 'relative', flexShrink: 0, zIndex: 15 }}>
      {showYear && (
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: -18,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap', zIndex: 20,
          color: isActive ? '#3DCFE4' : '#FF9B9B',
          background: isActive ? 'rgba(12,180,204,0.15)' : 'rgba(255,107,107,0.1)',
          border: `1px solid ${isActive ? 'rgba(12,180,204,0.35)' : 'rgba(255,107,107,0.2)'}`,
        }}>
          {year}
        </div>
      )}
      <div style={{
        width: dotSize, height: dotSize,
        borderRadius: '50%',
        background: '#0A1628',
        border: `2px solid ${isSpecial ? '#FF6B6B' : isActive ? '#0CB4CC' : isHighlighted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: isActive
          ? '0 0 0 4px #060D1A, 0 0 0 6px rgba(12,180,204,0.4), 0 0 30px rgba(12,180,204,0.5), 0 0 60px rgba(12,180,204,0.2)'
          : isSpecial
          ? '0 0 0 4px #060D1A, 0 0 20px rgba(255,107,107,0.4)'
          : isHighlighted
          ? '0 0 0 4px #060D1A, 0 0 16px rgba(255,255,255,0.15)'
          : '0 0 0 4px #060D1A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isActive ? 34 : 26,
        transition: 'box-shadow 0.3s, border-color 0.3s',
        animation: isActive ? 'activeGlowDot 2.5s ease-in-out infinite' : undefined,
        cursor: trip && !isSpecial ? 'pointer' : 'default',
      }}>
        {emoji}
      </div>
    </div>
  )
}

// ─── Year label between milestones ───────────────────────────
function YearSeparator({ year, note }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, zIndex: 10 }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 0 0 4px #060D1A', position: 'relative', zIndex: 12 }}/>
      <span style={{ position: 'absolute', right: 'calc(50% + 40px)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.18)' }}>
        {year}
      </span>
      {note && (
        <span style={{ position: 'absolute', left: 'calc(50% + 40px)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.18)' }}>
          {note}
        </span>
      )}
    </div>
  )
}

// ─── Star dissolve footer ─────────────────────────────────────
function StarDissolve() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: 20 + Math.sin(i * 2.4) * 18 + (Math.random() * 12 - 6),
    delay: i * 0.06,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.15 + Math.random() * 0.45,
  }))
  return (
    <div style={{ position: 'relative', height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
      {/* Road narrows into stars */}
      <svg width="60" height="180" viewBox="0 0 60 180" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0 }}>
        {/* Narrowing road */}
        <defs>
          <linearGradient id="roadFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111D2C" stopOpacity="1"/>
            <stop offset="100%" stopColor="#111D2C" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="dashFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,210,0,0.5)"/>
            <stop offset="100%" stopColor="rgba(255,210,0,0)"/>
          </linearGradient>
        </defs>
        {/* Road body shrinking */}
        <polygon points="4,0 56,0 35,180 25,180" fill="url(#roadFade)"/>
        {/* Center dash fading */}
        <line x1="30" y1="0" x2="30" y2="120" stroke="url(#dashFade)" strokeWidth="2.5" strokeDasharray="16 16"/>
        {/* Scattered stars emanating from road */}
        {stars.map(s => (
          <circle key={s.id}
            cx={30 + (s.x - 30) * (s.id / 28) * 1.8}
            cy={20 + (s.id / 28) * 155}
            r={s.size * (0.4 + s.id / 28 * 0.8)}
            fill="white"
            opacity={s.opacity * (s.id / 28)}
          />
        ))}
        {/* Terminal glow point */}
        <circle cx="30" cy="175" r="4" fill="#0CB4CC" opacity="0.8"/>
        <circle cx="30" cy="175" r="8" fill="#0CB4CC" opacity="0.2"/>
        <circle cx="30" cy="175" r="14" fill="#0CB4CC" opacity="0.08"/>
      </svg>
    </div>
  )
}

// ─── Header landmarks row ─────────────────────────────────────
function LandmarksRow() {
  const items = [
    { key: 'bratislava', label: 'Bratislava', Comp: LandmarkSVGs.bratislava, color: '#0CB4CC' },
    { key: 'mountains',  label: 'Donovaly',   Comp: LandmarkSVGs.mountains,  color: '#0CB4CC' },
    { key: 'bridge',     label: 'Itálie',     Comp: LandmarkSVGs.bridge,     color: '#7B5EA7' },
    { key: 'colosseum',  label: 'Rím',        Comp: LandmarkSVGs.colosseum,  color: '#FF6B6B' },
    { key: 'palm',       label: 'Cyprus',     Comp: LandmarkSVGs.palm,       color: '#0CB4CC' },
    { key: 'eiffel',     label: 'Svet čaká',  Comp: LandmarkSVGs.eiffel,     color: '#FF9B9B' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0, paddingTop: 32, height: 130, overflow: 'hidden' }}>
      {items.map(({ key, label, Comp, color }) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.18, transition: 'opacity 0.3s', flexShrink: 0, cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.38'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.18'}
        >
          <Comp color={color}/>
          <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0CB4CC', marginTop: 4, opacity: 0.6 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Timeline Component ──────────────────────────────────
export default function Timeline() {
  const navigate = useNavigate()
  const [trips, setTrips]   = useState(loadTrips)
  const [bucket, setBucket] = useState(loadBucket)
  const [showBucket,  setShowBucket]  = useState(false)
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)

  // Sort chronologically
  const sorted = [...trips].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom))

  // Scroll sync: highlight whichever milestone is near viewport center
  const milestoneRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setHighlightedId(e.target.dataset.id)
        })
      },
      { threshold: 0.55 }
    )
    Object.values(milestoneRefs.current).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [sorted.length])

  // Build timeline rows: year separators + trips + special moments
  function buildRows() {
    const all = []
    let seenYears = new Set()

    // Merge trips + special moments, sorted by date
    const items = [
      ...sorted.map(t => ({ type: 'trip', date: t.dateFrom, data: t })),
      ...SPECIAL_MOMENTS.map(m => ({ type: 'special', date: m.date, data: m })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Track which side to alternate
    let sideIndex = 0
    const sides = ['right', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left']

    for (const item of items) {
      const year = getYear(item.date)

      // Emit year separator for gaps (only if this year hasn't been shown and there's no milestone already showing it)
      // We'll show the year on the dot itself, but emit a gap separator for years with no milestone
      if (!seenYears.has(year)) {
        // Check if previous item was in a different year (and skip consecutive years)
        const prevYear = all.length > 0 ? getYear(all[all.length - 1]?.date || item.date) : null
        if (prevYear && year > prevYear + 1) {
          // Fill in silent year markers for the gap
          for (let y = prevYear + 1; y < year; y++) {
            all.push({ type: 'yeargap', year: y, note: y === 2020 ? 'COVID · doma' : undefined, date: `${y}-06-01` })
          }
        }
        seenYears.add(year)
      }

      if (item.type === 'trip') {
        const side = sides[sideIndex % sides.length]
        sideIndex++
        all.push({ ...item, side, showYear: true, year })
      } else {
        // Special moments always go right
        all.push({ ...item, side: 'right', showYear: false, year })
      }
    }

    return all
  }

  const rows = buildRows()

  function handleSaveTrips(updated)  { setTrips(updated);  saveTrips(updated)  }
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
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, rgba(12,180,204,0.12) 0%, transparent 65%), linear-gradient(180deg, #0A1628 0%, #060D1A 100%)', overflowX: 'hidden' }}>

      {/* CSS for active glow + blink */}
      <style>{`
        @keyframes activeGlowDot {
          0%,100%{box-shadow:0 0 0 4px #060D1A,0 0 0 6px rgba(12,180,204,.4),0 0 30px rgba(12,180,204,.5),0 0 60px rgba(12,180,204,.2);}
          50%{box-shadow:0 0 0 4px #060D1A,0 0 0 8px rgba(12,180,204,.6),0 0 50px rgba(12,180,204,.7),0 0 90px rgba(12,180,204,.3);}
        }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
        @keyframes planeFly{0%{transform:translateX(-60px) translateY(10px);}100%{transform:translateX(calc(100vw + 60px)) translateY(-10px);}}
        .road-milestone-row { display:flex; align-items:center; min-height:230px; padding:28px 0; position:relative; }
        .road-milestone-row .ms-content { flex:1; display:flex; padding:0 52px; }
        .road-milestone-row .ms-content-left  { justify-content:flex-end; }
        .road-milestone-row .ms-content-right { justify-content:flex-start; }
        .road-milestone-row .ms-empty { flex:1; }
        @media(max-width:640px){
          .road-milestone-row .ms-content{padding:0 34px;}
          .road-milestone-row{min-height:180px;}
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 20px 0', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(12,180,204,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* Flying plane */}
        <div style={{ position: 'absolute', top: 36, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden', height: 40 }}>
          <span style={{ fontSize: 20, position: 'absolute', left: 0, top: 0, animation: 'planeFly 14s linear infinite' }}>✈️</span>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0CB4CC', opacity: 0.75, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 1, background: '#0CB4CC', opacity: 0.4, display: 'inline-block' }}/>
          Naše cesty
          <span style={{ width: 28, height: 1, background: '#0CB4CC', opacity: 0.4, display: 'inline-block' }}/>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>
          <span style={{
            background: 'linear-gradient(120deg,#fff 30%,#3DCFE4 50%,#fff 70%)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerText 4s ease-in-out infinite',
          }}>ForeverN</span>
          <span style={{ display: 'block', fontSize: 'clamp(0.9rem,2.5vw,1.5rem)', fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.35)', marginTop: 4 }}>Travels</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.75rem,2vw,0.95rem)', color: 'rgba(255,248,240,0.4)', fontStyle: 'italic', marginTop: 12, fontWeight: 300 }}>
          Norbi · Natalita · Elizabethka — spomienky, ktoré trvajú navždy
        </p>

        <style>{`@keyframes shimmerText{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}`}</style>

        {/* Landmarks silhouettes */}
        <LandmarksRow />
      </header>

      {/* Cloud wave divider */}
      <div style={{ position: 'relative', zIndex: 6, height: 56, marginTop: -8, overflow: 'hidden' }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          <path d="M0,56 Q120,20 240,42 Q360,56 480,32 Q600,10 720,38 Q840,56 960,28 Q1080,5 1200,38 Q1320,56 1440,28 L1440,56 Z" fill="rgba(12,180,204,0.06)"/>
          <path d="M0,56 Q180,30 360,48 Q540,62 720,42 Q900,22 1080,48 Q1260,64 1440,42 L1440,56 Z" fill="rgba(12,180,204,0.04)"/>
        </svg>
      </div>

      {/* ── Timeline wrapper ── */}
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* The Road — absolute, full height */}
        <div style={{
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          top: 0, bottom: 0,
          width: 52,
          background: '#111D2C',
          borderLeft: '2px solid #1A2D42',
          borderRight: '2px solid #1A2D42',
          zIndex: 1,
        }}>
          {/* Yellow dashed centre line */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: 0, bottom: 0, width: 3,
            background: 'repeating-linear-gradient(to bottom, rgba(255,210,0,0.55) 0px, rgba(255,210,0,0.55) 18px, transparent 18px, transparent 36px)',
          }}/>
          {/* Turquoise glow overlay */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(12,180,204,0.07) 30%, rgba(12,180,204,0.07) 70%, transparent 100%)',
            pointerEvents: 'none',
          }}/>
        </div>

        {/* Timeline rows */}
        {rows.map((row, idx) => {
          if (row.type === 'yeargap') {
            return (
              <div key={`gap-${row.year}`} style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 0 0 4px #060D1A', position: 'relative', zIndex: 12 }}/>
                <span style={{ position: 'absolute', right: 'calc(50% + 38px)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.18)' }}>{row.year}</span>
                {row.note && <span style={{ position: 'absolute', left: 'calc(50% + 38px)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.15)' }}>{row.note}</span>}
              </div>
            )
          }

          if (row.type === 'special') {
            const m = row.data
            return (
              <div
                key={`special-${m.date}`}
                className="road-milestone-row"
                data-id={`special-${m.date}`}
                ref={el => milestoneRefs.current[`special-${m.date}`] = el}
                style={{ position: 'relative', zIndex: 10 }}
              >
                <div className="ms-empty"/>
                <MilestoneDot
                  trip={null} isActive={false} isSpecial
                  isHighlighted={highlightedId === `special-${m.date}`}
                  year={row.year} showYear={!rows.some((r, ri) => ri < idx && r.year === row.year)}
                />
                <div className="ms-content ms-content-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', padding: '0 48px' }}>
                  {/* connector line */}
                  <div style={{ position: 'absolute', left: 'calc(50% + 30px)', top: '50%', width: 44, height: 1, background: 'linear-gradient(90deg, rgba(255,107,107,0.3), transparent)', pointerEvents: 'none' }}/>
                  <SpecialCard moment={m} side="right"/>
                </div>
              </div>
            )
          }

          if (row.type === 'trip') {
            const trip = row.data
            const status = statusOf(trip)
            const isActive = status === 'active'
            const isLeft = row.side === 'left'
            const isHighlighted = highlightedId === trip.id
            const showYear = !rows.some((r, ri) => ri < idx && r.year === row.year && (r.type === 'trip' || r.type === 'special'))

            return (
              <div
                key={trip.id}
                className="road-milestone-row"
                data-id={trip.id}
                ref={el => milestoneRefs.current[trip.id] = el}
                style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', minHeight: isActive ? 320 : 230, padding: '28px 0' }}
              >
                {isLeft ? (
                  <>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '0 48px', position: 'relative' }}>
                      {/* connector */}
                      <div style={{ position: 'absolute', right: 30, top: '50%', width: 50, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12))', pointerEvents: 'none' }}/>
                      <TripCard trip={trip} isActive={isActive} isHighlighted={isHighlighted} side="left" onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    </div>
                    <MilestoneDot trip={trip} isActive={isActive} isSpecial={false} isHighlighted={isHighlighted} year={row.year} showYear={showYear}/>
                    <div style={{ flex: 1 }}/>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}/>
                    <MilestoneDot trip={trip} isActive={isActive} isSpecial={false} isHighlighted={isHighlighted} year={row.year} showYear={showYear}/>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', padding: '0 48px', position: 'relative' }}>
                      {/* connector */}
                      <div style={{ position: 'absolute', left: 30, top: '50%', width: 50, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' }}/>
                      <TripCard trip={trip} isActive={isActive} isHighlighted={isHighlighted} side="right" onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    </div>
                  </>
                )}
              </div>
            )
          }

          return null
        })}

        {/* Star dissolve ending */}
        <StarDissolve />

        {/* "What comes next" teaser */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingTop: 0, paddingBottom: 20 }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,248,240,0.18)', marginBottom: 6 }}>2027 a ďalej</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,248,240,0.28)', fontStyle: 'italic' }}>Maldivy? Japonsko? Nórsko? Svet čaká.</div>
        </div>
      </div>

      {/* ── New trip button at bottom of road ── */}
      <div style={{ textAlign: 'center', paddingBottom: 140, position: 'relative', zIndex: 10 }}>
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewTrip(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 100,
            background: 'rgba(12,180,204,0.12)',
            border: '1px solid rgba(12,180,204,0.3)',
            color: '#3DCFE4', fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          <Plus size={15}/> Pridať novú cestu
        </motion.button>
      </div>

      {/* ── Floating Bucket List button ── */}
      <motion.button
        whileHover={{ scale: 1.06, y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowBucket(true)}
        style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 22px', borderRadius: 100,
          background: 'linear-gradient(135deg, #FF6B6B, #FF9B9B)',
          boxShadow: '0 4px 24px rgba(255,107,107,0.4), 0 0 60px rgba(255,107,107,0.15)',
          color: '#fff', fontSize: '0.8rem', fontWeight: 800,
          cursor: 'pointer', letterSpacing: '0.04em',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        ✨ Bucket list
      </motion.button>

      {/* ── Modals ── */}
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
