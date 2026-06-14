import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
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
function getYear(d) { return new Date(d).getFullYear() }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Live countdown ───────────────────────────────────────────
function Countdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  if (diff <= 0) return (
    <div style={{ textAlign:'center', color:'#3DCFE4', fontWeight:700, fontSize:'0.8rem', marginTop:10 }}>✈️ Letíme!</div>
  )
  const pad = n => String(n).padStart(2,'0')
  const parts = [
    { v: pad(Math.floor(diff/86400000)),              l:'dní'  },
    { v: pad(Math.floor((diff%86400000)/3600000)),    l:'hod'  },
    { v: pad(Math.floor((diff%3600000)/60000)),       l:'min'  },
    { v: pad(Math.floor((diff%60000)/1000)),          l:'sek'  },
  ]
  return (
    <div style={{ marginTop:12, padding:'10px 12px', borderRadius:12, background:'rgba(12,180,204,0.08)', border:'1px solid rgba(12,180,204,0.2)' }}>
      <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(12,180,204,0.7)', textAlign:'center', marginBottom:6 }}>Odlet o</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        {parts.map((p,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            {i>0 && <span style={{ color:'rgba(12,180,204,0.4)', fontSize:'1rem', fontWeight:300 }}>:</span>}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#0CB4CC', fontVariantNumeric:'tabular-nums' }}>{p.v}</div>
              <div style={{ fontSize:9, color:'rgba(255,248,240,0.3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{p.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card background SVG silhouettes ─────────────────────────
// Each returns an absolutely-positioned SVG that fills the card background
function CardBgSilhouette({ tripId }) {
  const base = { position:'absolute', bottom:0, right:-10, pointerEvents:'none', zIndex:0, opacity:0.09 }

  if (tripId === 'side-2019') return (
    // Ottoman arch / minaret
    <svg style={{ ...base, width:130, height:160 }} viewBox="0 0 80 100" fill="#C17F3E">
      {/* Minaret tower */}
      <rect x="34" y="15" width="12" height="70" rx="3"/>
      {/* Bulb top */}
      <ellipse cx="40" cy="15" rx="14" ry="10"/>
      <ellipse cx="40" cy="8"  rx="7"  ry="6"/>
      <circle  cx="40" cy="3"  r="3"/>
      {/* Balcony ring */}
      <rect x="28" y="40" width="24" height="4" rx="2"/>
      {/* Arch at base */}
      <path d="M20,100 L20,60 Q20,40 40,40 Q60,40 60,60 L60,100Z" opacity=".5"/>
    </svg>
  )

  if (tripId === 'donovaly-2021') return (
    // Mountain peaks
    <svg style={{ ...base, width:170, height:130 }} viewBox="0 0 100 80" fill="#5B8C5A">
      <polygon points="50,5 0,80 100,80"/>
      <polygon points="18,30 -12,80 48,80" opacity=".55"/>
      <polygon points="82,22 50,80 114,80" opacity=".55"/>
      {/* Snow caps */}
      <polygon points="50,5 38,28 62,28" fill="rgba(255,255,255,0.3)"/>
    </svg>
  )

  if (tripId === 'slovinsko-taliansko-2022') return (
    // Rialto-style arch bridge
    <svg style={{ ...base, width:170, height:120 }} viewBox="0 0 100 70" fill="none">
      <path d="M0,70 Q50,15 100,70" stroke="#7B5EA7" strokeWidth="5" strokeLinecap="round"/>
      <path d="M10,70 Q50,30 90,70" stroke="#7B5EA7" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Pillars hanging down */}
      <line x1="50" y1="17" x2="50" y2="70" stroke="#7B5EA7" strokeWidth="2.5"/>
      <line x1="32" y1="36" x2="32" y2="70" stroke="#7B5EA7" strokeWidth="2"/>
      <line x1="68" y1="36" x2="68" y2="70" stroke="#7B5EA7" strokeWidth="2"/>
      <line x1="18" y1="55" x2="18" y2="70" stroke="#7B5EA7" strokeWidth="1.5"/>
      <line x1="82" y1="55" x2="82" y2="70" stroke="#7B5EA7" strokeWidth="1.5"/>
    </svg>
  )

  if (tripId?.startsWith('cyprus')) return (
    // Palm tree + island shape
    <svg style={{ ...base, width:140, height:160, opacity:0.1 }} viewBox="0 0 65 90" fill="none">
      {/* Trunk */}
      <path d="M32,90 Q30,65 33,40 Q35,22 32,12" stroke="#0CB4CC" strokeWidth="5" strokeLinecap="round"/>
      {/* Leaves fanning out */}
      <path d="M32,20 Q16,12 3,20"    stroke="#0CB4CC" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M32,20 Q27,4 16,0"     stroke="#0CB4CC" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M32,20 Q40,4 52,8"     stroke="#0CB4CC" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M32,20 Q47,15 62,10"   stroke="#0CB4CC" strokeWidth="3"   strokeLinecap="round"/>
      <path d="M32,20 Q50,25 60,34"   stroke="#0CB4CC" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Island */}
      <ellipse cx="32" cy="87" rx="24" ry="5" fill="#0CB4CC" opacity=".45"/>
    </svg>
  )

  if (tripId?.startsWith('rim')) return (
    // Colosseum arch
    <svg style={{ ...base, width:170, height:130 }} viewBox="0 0 90 70" fill="#C17F3E">
      <ellipse cx="45" cy="42" rx="44" ry="28"/>
      <ellipse cx="45" cy="42" rx="30" ry="18" fill="#060D1A"/>
      {/* Top ledge */}
      <rect x="1" y="14" width="88" height="9" rx="2"/>
      {/* Side pillars */}
      <rect x="1"  y="14" width="11" height="56" rx="2"/>
      <rect x="78" y="14" width="11" height="56" rx="2"/>
      {/* Arch openings */}
      <path d="M16,70 L16,38 Q16,22 26,22 Q36,22 36,38 L36,70" fill="#060D1A" opacity=".6"/>
      <path d="M40,70 L40,38 Q40,22 45,22 Q50,22 50,38 L50,70" fill="#060D1A" opacity=".6"/>
      <path d="M54,70 L54,38 Q54,22 64,22 Q74,22 74,38 L74,70" fill="#060D1A" opacity=".6"/>
    </svg>
  )

  return null
}

// ─── Destination config ───────────────────────────────────────
const DEST_CONFIG = {
  'side-2019':              { stripe:'linear-gradient(90deg,#C17F3E,#E8A85F)',  stripeOpacity:0.9 },
  'donovaly-2021':          { stripe:'linear-gradient(90deg,#5B8C5A,#7DB87B)',  stripeOpacity:0.9 },
  'slovinsko-taliansko-2022':{ stripe:'linear-gradient(90deg,#7B5EA7,#A07FCC)', stripeOpacity:0.9 },
  'cyprus-2022':            { stripe:'linear-gradient(90deg,#0CB4CC,#3DCFE4)',  stripeOpacity:0.9 },
  'rim-2023':               { stripe:'linear-gradient(90deg,#C17F3E,#E8A85F)',  stripeOpacity:0.9 },
  'cyprus-2024':            { stripe:'linear-gradient(90deg,#0CB4CC,#3DCFE4)',  stripeOpacity:0.9 },
  'cyprus-2025':            { stripe:'linear-gradient(90deg,#0CB4CC,#3DCFE4)',  stripeOpacity:0.9 },
  'cyprus-2026':            { stripe:'linear-gradient(90deg,#0CB4CC,#3DCFE4,#0CB4CC)', stripeOpacity:1 },
}

// ─── Trip Card ────────────────────────────────────────────────
function TripCard({ trip, isActive, isHighlighted, side, onNavigate, isMobile }) {
  const cfg = DEST_CONFIG[trip.id] || { stripe:'linear-gradient(90deg,#0CB4CC,#3DCFE4)', stripeOpacity:0.7 }

  const borderColor = isActive
    ? 'rgba(12,180,204,0.5)'
    : isHighlighted
    ? 'rgba(255,255,255,0.22)'
    : 'rgba(255,255,255,0.09)'

  const shadow = isActive
    ? '0 8px 40px rgba(12,180,204,0.2), 0 0 80px rgba(12,180,204,0.08)'
    : isHighlighted
    ? '0 4px 20px rgba(255,255,255,0.06)'
    : 'none'

  return (
    <motion.div
      onClick={onNavigate}
      initial={{ opacity:0, x: (isMobile || side === 'right') ? 24 : -24 }}
      animate={{ opacity:1, x:0 }}
      transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-4, transition:{ duration:0.18 } }}
      style={{
        background:'rgba(10,22,40,0.85)',
        border:`1px solid ${borderColor}`,
        borderRadius:20,
        maxWidth:260,
        width:'100%',
        cursor:'pointer',
        position:'relative',
        overflow:'hidden',
        boxShadow:shadow,
        transition:'border-color 0.3s, box-shadow 0.3s',
        backdropFilter:'blur(8px)',
      }}
    >
      {/* Coloured top stripe */}
      <div style={{
        height: isActive ? 3 : 2,
        background: cfg.stripe,
        opacity: cfg.stripeOpacity,
        backgroundSize: isActive ? '200% 100%' : undefined,
        animation: isActive ? 'stripeShimmer 2.5s linear infinite' : undefined,
      }}/>

      {/* Background silhouette */}
      <CardBgSilhouette tripId={trip.id}/>

      <div style={{ padding:'16px 18px 18px', position:'relative', zIndex:1 }}>

        {/* Active badge */}
        {isActive && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            fontSize:9, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase',
            color:'#3DCFE4', background:'rgba(12,180,204,0.12)',
            border:'1px solid rgba(12,180,204,0.28)', borderRadius:20,
            padding:'3px 10px', marginBottom:10,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#0CB4CC', display:'inline-block', animation:'blink 1.5s ease-in-out infinite' }}/>
            Aktívna cesta
          </div>
        )}

        {/* Flag */}
        <div style={{ fontSize:22, marginBottom:6, lineHeight:1 }}>{trip.flag}</div>

        {/* Destination name */}
        <div style={{
          fontSize: isActive ? '1.08rem' : '1rem',
          fontWeight:800, lineHeight:1.15, marginBottom:3,
          ...(isActive ? {
            background:'linear-gradient(135deg,#0CB4CC,#3DCFE4)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          } : { color:'#fff' }),
        }}>{trip.destination}</div>

        {/* Country/region */}
        <div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:600, marginBottom:9 }}>
          {trip.country}
        </div>

        {/* Highlight text */}
        {trip.highlight && (
          <div style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.48)', lineHeight:1.55, fontStyle:'italic', marginBottom:9 }}>
            {trip.highlight}
          </div>
        )}

        {/* Dates */}
        <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.28)', fontWeight:600, letterSpacing:'0.06em', marginBottom: trip.hotel ? 3 : 0 }}>
          {fmtDate(trip.dateFrom)} – {fmtDate(trip.dateTo)}
        </div>

        {/* Hotel */}
        {trip.hotel && (
          <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.28)', marginBottom:0 }}>🏨 {trip.hotel}</div>
        )}

        {/* Who */}
        <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.25)', marginTop:6 }}>
          {whoLabel(trip.who)}
        </div>

        {/* Countdown for active */}
        {isActive && <Countdown target={new Date('2026-07-25T06:00:00').getTime()} />}

        {/* CTA */}
        <div style={{
          marginTop:12, padding:'7px 0', borderRadius:10, textAlign:'center',
          fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.04em',
          background: isActive ? 'rgba(12,180,204,0.14)' : 'rgba(255,255,255,0.05)',
          color: isActive ? '#3DCFE4' : 'rgba(255,248,240,0.4)',
          border:`1px solid ${isActive ? 'rgba(12,180,204,0.25)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          Otvoriť cestu →
        </div>
      </div>
    </motion.div>
  )
}

// ─── Special moment card ──────────────────────────────────────
function SpecialCard({ moment }) {
  const isBirth = moment.icon === '👶'
  return (
    <motion.div
      initial={{ opacity:0, x:20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ duration:0.45 }}
      style={{
        background: isBirth ? 'rgba(255,182,193,0.07)' : 'rgba(255,107,107,0.07)',
        border:`1px solid ${isBirth ? 'rgba(255,182,193,0.25)' : 'rgba(255,107,107,0.25)'}`,
        borderRadius:16,
        padding:'14px 18px',
        maxWidth:220,
        width:'100%',
        position:'relative',
        overflow:'hidden',
      }}
    >
      {/* Top stripe */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: isBirth ? 'linear-gradient(90deg,#FFB6C1,#FF9B9B)' : 'linear-gradient(90deg,#FF6B6B,#FF9B9B)', opacity:0.8 }}/>
      <div style={{ fontSize:20, marginBottom:6, marginTop:4 }}>{moment.icon}</div>
      <div style={{ fontSize:'0.88rem', fontWeight:800, color:'#fff', marginBottom:4 }}>{moment.label}</div>
      <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.32)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600 }}>
        {new Date(moment.date).toLocaleDateString('sk-SK', { day:'numeric', month:'long', year:'numeric' })}
      </div>
    </motion.div>
  )
}

// ─── Milestone Dot ────────────────────────────────────────────
const DOT_EMOJI = {
  'side-2019': '💑', 'donovaly-2021': '⛷️',
  'slovinsko-taliansko-2022': '🚗',
  'cyprus-2022': '🌊', 'rim-2023': '🏛️',
  'cyprus-2024': '🐚', 'cyprus-2025': '🌴', 'cyprus-2026': '✈️',
}

function MilestoneDot({ trip, isActive, isSpecial, specialData, isHighlighted, year, showYear, onNavigate }) {
  const size  = isActive ? 90 : isSpecial ? 60 : 72
  const emoji = isSpecial
    ? specialData?.icon
    : DOT_EMOJI[trip?.id] || '🌍'

  const borderCol = isActive ? '#0CB4CC' : isSpecial ? (specialData?.color || '#FF6B6B') : isHighlighted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.13)'
  const glowShadow = isActive
    ? '0 0 0 4px #060D1A,0 0 0 7px rgba(12,180,204,0.45),0 0 35px rgba(12,180,204,0.55),0 0 70px rgba(12,180,204,0.22)'
    : isSpecial
    ? `0 0 0 4px #060D1A,0 0 22px ${specialData?.color || '#FF6B6B'}66`
    : isHighlighted
    ? '0 0 0 4px #060D1A,0 0 18px rgba(255,255,255,0.18)'
    : '0 0 0 4px #060D1A'

  return (
    <div
      onClick={onNavigate}
      style={{ position:'relative', flexShrink:0, zIndex:15, cursor: trip && !isSpecial ? 'pointer' : 'default' }}
    >
      {showYear && (
        <div style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          top:-20, zIndex:20, whiteSpace:'nowrap',
          fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
          padding:'2px 10px', borderRadius:20,
          color: isActive ? '#3DCFE4' : '#FF9B9B',
          background: isActive ? 'rgba(12,180,204,0.15)' : 'rgba(255,107,107,0.1)',
          border:`1px solid ${isActive ? 'rgba(12,180,204,0.38)' : 'rgba(255,107,107,0.22)'}`,
        }}>
          {year}
        </div>
      )}
      <div style={{
        width:size, height:size, borderRadius:'50%',
        background:'#080F1C',
        border:`2px solid ${borderCol}`,
        boxShadow:glowShadow,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: isActive ? 34 : isSpecial ? 24 : 26,
        transition:'box-shadow 0.35s, border-color 0.35s',
        animation: isActive ? 'activeGlowDot 2.5s ease-in-out infinite' : undefined,
      }}>
        {emoji}
      </div>
    </div>
  )
}

// ─── Road fill animation (page load) ─────────────────────────
function RoadFillOverlay({ wrapperRef }) {
  const [progress, setProgress] = useState(0)
  const [glowY, setGlowY]       = useState(0)
  const [phase, setPhase]        = useState('fill') // 'fill' | 'glow' | 'done'

  useEffect(() => {
    // Calculate how far "now" sits from 2019 to end of timeline
    const start = new Date('2019-01-01').getTime()
    const end   = new Date('2028-01-01').getTime()
    const pct   = Math.min(1, (Date.now() - start) / (end - start))

    // Phase 1: road fills up to current date pct, over 1.2s
    let raf
    const startTime = performance.now()
    const fillDuration = 1200

    function animateFill(now) {
      const t = Math.min(1, (now - startTime) / fillDuration)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased * pct)
      if (t < 1) { raf = requestAnimationFrame(animateFill) }
      else {
        setProgress(pct)
        setPhase('glow')
        // Phase 2: glow beam travels from top to pct, over 0.8s
        const glowStart = performance.now()
        const glowDuration = 800
        function animateGlow(now2) {
          const t2 = Math.min(1, (now2 - glowStart) / glowDuration)
          const eased2 = 1 - Math.pow(1 - t2, 2)
          setGlowY(eased2 * pct)
          if (t2 < 1) { raf = requestAnimationFrame(animateGlow) }
          else { setGlowY(pct); setPhase('done') }
        }
        raf = requestAnimationFrame(animateGlow)
      }
    }
    raf = requestAnimationFrame(animateFill)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (phase === 'done') return null

  return (
    <div style={{
      position:'absolute', left:0, top:0, bottom:0, right:0,
      pointerEvents:'none', zIndex:3, overflow:'hidden',
    }}>
      {/* Turquoise fill rising */}
      <div style={{
        position:'absolute', left:'50%', transform:'translateX(-50%)',
        top:0, width:52,
        height:`${progress * 100}%`,
        background:'linear-gradient(180deg, rgba(12,180,204,0.18) 0%, rgba(12,180,204,0.06) 100%)',
        transition:'none',
      }}/>
      {/* Travelling glow beam */}
      {phase === 'glow' && (
        <div style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          top:`calc(${glowY * 100}% - 30px)`,
          width:80, height:60,
          background:'radial-gradient(ellipse at center, rgba(12,180,204,0.7) 0%, transparent 70%)',
          filter:'blur(4px)',
        }}/>
      )}
    </div>
  )
}

// ─── Star dissolve ending ─────────────────────────────────────
function StarDissolve() {
  // Stable stars — useMemo to avoid re-render flicker
  const stars = Array.from({ length: 32 }, (_, i) => ({
    cx: 30 + Math.sin(i * 2.1 + 0.5) * (10 + (i/32)*22),
    cy: 15 + (i / 32) * 158,
    r:  0.8 + (i/32) * 2.4,
    op: 0.08 + (i/32) * 0.55,
  }))
  return (
    <div style={{ position:'relative', height:190, zIndex:10 }}>
      <svg width="120" height="190" viewBox="0 0 120 190"
        style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:0 }}>
        <defs>
          <linearGradient id="rfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111D2C" stopOpacity="1"/>
            <stop offset="75%" stopColor="#111D2C" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#111D2C" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="dfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,210,0,0.55)"/>
            <stop offset="70%" stopColor="rgba(255,210,0,0)"/>
          </linearGradient>
        </defs>
        {/* Narrowing road polygon */}
        <polygon points="8,0 52,0 37,190 23,190" fill="url(#rfade)"/>
        {/* Fading dashes */}
        <line x1="30" y1="0" x2="30" y2="130" stroke="url(#dfade)" strokeWidth="2.5" strokeDasharray="16 16"/>
        {/* Stars scattering outward */}
        {stars.map((s,i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.op}/>
        ))}
        {/* Terminal glow point */}
        <circle cx="30" cy="184" r="5"  fill="#0CB4CC" opacity="0.85"/>
        <circle cx="30" cy="184" r="10" fill="#0CB4CC" opacity="0.22"/>
        <circle cx="30" cy="184" r="18" fill="#0CB4CC" opacity="0.08"/>
      </svg>
    </div>
  )
}

// ─── Header landmark silhouettes ─────────────────────────────
function LandmarksRow() {
  const items = [
    { label:'Bratislava', color:'#0CB4CC', svg: (
      <svg width="50" height="85" viewBox="0 0 55 90" fill="#0CB4CC">
        <rect x="5" y="50" width="45" height="40" rx="2"/>
        <rect x="12" y="35" width="31" height="20"/>
        <rect x="8" y="20" width="8" height="18"/>
        <rect x="39" y="20" width="8" height="18"/>
        <rect x="22" y="10" width="11" height="26"/>
        <rect x="24" y="2" width="7" height="12"/>
      </svg>
    )},
    { label:'Donovaly', color:'#5B8C5A', svg: (
      <svg width="70" height="85" viewBox="0 0 80 90" fill="#5B8C5A">
        <polygon points="40,5 0,90 80,90"/>
        <polygon points="15,30 -10,90 40,90" opacity=".6"/>
        <polygon points="65,25 40,90 90,90" opacity=".6"/>
      </svg>
    )},
    { label:'Taliansko', color:'#7B5EA7', svg: (
      <svg width="65" height="85" viewBox="0 0 70 90" fill="none" stroke="#7B5EA7" strokeWidth="3" strokeLinecap="round">
        <path d="M5,90 Q5,40 35,20 Q65,40 65,90"/>
        <path d="M15,90 Q15,50 35,35 Q55,50 55,90"/>
        <line x1="5" y1="65" x2="65" y2="65"/>
        <path d="M25,80 Q35,72 45,80" fill="#7B5EA7" stroke="none"/>
      </svg>
    )},
    { label:'Rím', color:'#C17F3E', svg: (
      <svg width="82" height="75" viewBox="0 0 90 80" fill="#C17F3E">
        <ellipse cx="45" cy="45" rx="44" ry="32"/>
        <ellipse cx="45" cy="45" rx="30" ry="20" fill="#060D1A"/>
        <rect x="1" y="13" width="88" height="9" rx="2"/>
        <rect x="1"  y="13" width="11" height="67" rx="2"/>
        <rect x="78" y="13" width="11" height="67" rx="2"/>
      </svg>
    )},
    { label:'Cyprus', color:'#0CB4CC', svg: (
      <svg width="58" height="85" viewBox="0 0 65 90" fill="none">
        <path d="M32,90 Q30,60 33,35 Q35,20 32,10" stroke="#0CB4CC" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32,18 Q18,10 5,18"  stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32,18 Q28,4 18,0"   stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32,18 Q40,5 50,8"   stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32,18 Q46,14 60,10" stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="32" cy="87" rx="22" ry="5" fill="#0CB4CC" opacity=".45"/>
      </svg>
    )},
    { label:'Svet čaká', color:'#FF9B9B', svg: (
      <svg width="50" height="85" viewBox="0 0 55 90" fill="#FF9B9B">
        <polygon points="27,2 20,40 34,40"/>
        <polygon points="27,38 12,70 42,70"/>
        <rect x="8" y="68" width="39" height="6" rx="2"/>
        <polygon points="27,72 5,90 49,90"/>
        <rect x="20" y="36" width="15" height="6" rx="2"/>
        <rect x="5" y="46" width="45" height="4" rx="2"/>
      </svg>
    )},
  ]
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:4, paddingTop:36, height:128, overflow:'hidden' }}>
      {items.map(({ label, color, svg }) => (
        <div key={label}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', opacity:0.18, transition:'opacity 0.3s ease', flexShrink:0, cursor:'default' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.38'}
          onMouseLeave={e => e.currentTarget.style.opacity='0.18'}
        >
          {svg}
          <span style={{ fontSize:7, letterSpacing:'0.12em', textTransform:'uppercase', color, marginTop:3, opacity:0.65 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Build timeline rows ──────────────────────────────────────
function buildRows(sorted) {
  const items = [
    ...sorted.map(t => ({ type:'trip', date:t.dateFrom, data:t })),
    ...SPECIAL_MOMENTS.map(m => ({ type:'special', date:m.date, data:m })),
  ].sort((a,b) => new Date(a.date) - new Date(b.date))

  const rows = []
  let prevYear = null
  let sideIdx  = 0
  const sides  = ['right','left','right','left','right','left','right','left','right','left']

  for (const item of items) {
    const year = getYear(item.date)

    // Year gap markers
    if (prevYear !== null && year > prevYear + 1) {
      for (let y = prevYear + 1; y < year; y++) {
        rows.push({ type:'yeargap', year:y, note: y === 2020 ? 'COVID · doma' : undefined, date:`${y}-06-01` })
      }
    }

    if (item.type === 'trip') {
      const side = sides[sideIdx % sides.length]
      sideIdx++
      rows.push({ ...item, side, year })
    } else {
      rows.push({ ...item, side:'right', year })
    }

    prevYear = year
  }

  return rows
}

// ─── Main component ───────────────────────────────────────────
export default function Timeline() {
  const navigate = useNavigate()
  const [trips,  setTrips]  = useState(loadTrips)
  const [bucket, setBucket] = useState(loadBucket)
  const [showBucket,  setShowBucket]  = useState(false)
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const wrapperRef   = useRef(null)
  const milestoneRefs = useRef({})

  const sorted = [...trips].sort((a,b) => new Date(a.dateFrom) - new Date(b.dateFrom))
  const rows   = buildRows(sorted)

  // Scroll sync — highlight whichever milestone is centred in viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setHighlightedId(e.target.dataset.id) }),
      { threshold: 0.5 }
    )
    Object.values(milestoneRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [rows.length])

  function handleSaveTrips(u)  { setTrips(u);  saveTrips(u)  }
  function handleSaveBucket(u) { setBucket(u); saveBucket(u) }

  function createTripFromBucket(item) {
    setShowBucket(false)
    setTimeout(() => setShowNewTrip({ prefill:item }), 300)
  }

  function addNewTrip(tripData) {
    const newTrip = {
      ...tripData,
      id: generateId(),
      modules: Object.fromEntries(ALL_MODULES.map(m => [m.id, true])),
      highlight:'', bestMoment:'', bestRestaurant:'',
    }
    handleSaveTrips([...trips, newTrip])
    setShowNewTrip(false)
  }

  // ── Render ──
  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%, rgba(12,180,204,0.13) 0%, transparent 60%), linear-gradient(180deg,#0A1628 0%,#060D1A 100%)', overflowX:'hidden' }}>

      <style>{`
        @keyframes activeGlowDot {
          0%,100%{box-shadow:0 0 0 4px #060D1A,0 0 0 7px rgba(12,180,204,.45),0 0 35px rgba(12,180,204,.55),0 0 70px rgba(12,180,204,.22);}
          50%    {box-shadow:0 0 0 4px #060D1A,0 0 0 9px rgba(12,180,204,.65),0 0 55px rgba(12,180,204,.75),0 0 100px rgba(12,180,204,.3);}
        }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}
        @keyframes planeFly{0%{transform:translateX(-60px) translateY(8px);}100%{transform:translateX(calc(100vw + 60px)) translateY(-10px);}}
        @keyframes shimmerText{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes stripeShimmer{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}

        /* Mobile: cards always right, road narrower */
        @media(max-width:600px){
          .ms-left-col  { display:none !important; }
          .ms-right-col { display:flex !important; }
          .road-col     { width:36px !important; min-width:36px !important; }
          .ms-card-wrap { padding:0 28px !important; }
          .year-pill    { font-size:9px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position:'relative', zIndex:10, textAlign:'center', padding:'58px 20px 0', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:600, height:280, background:'radial-gradient(ellipse,rgba(12,180,204,0.16) 0%,transparent 70%)', pointerEvents:'none' }}/>
        {/* Plane */}
        <div style={{ position:'absolute', top:32, left:0, right:0, height:36, overflow:'hidden', pointerEvents:'none' }}>
          <span style={{ fontSize:20, position:'absolute', left:0, top:0, animation:'planeFly 14s linear infinite' }}>✈️</span>
        </div>
        {/* Brand tag */}
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'#0CB4CC', opacity:0.75, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span style={{ width:26, height:1, background:'#0CB4CC', opacity:0.4, display:'inline-block' }}/>
          Naše cesty
          <span style={{ width:26, height:1, background:'#0CB4CC', opacity:0.4, display:'inline-block' }}/>
        </div>
        {/* Title */}
        <h1 style={{ fontSize:'clamp(2.2rem,6vw,4.4rem)', fontWeight:900, lineHeight:1, letterSpacing:'-0.02em', margin:0 }}>
          <span style={{
            background:'linear-gradient(120deg,#fff 30%,#3DCFE4 50%,#fff 70%)',
            backgroundSize:'300% 100%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'shimmerText 4s ease-in-out infinite',
          }}>ForeverN</span>
          <span style={{ display:'block', fontSize:'clamp(0.85rem,2.2vw,1.4rem)', fontWeight:300, letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(255,248,240,0.32)', marginTop:4 }}>Travels</span>
        </h1>
        <p style={{ fontSize:'clamp(0.72rem,1.8vw,0.9rem)', color:'rgba(255,248,240,0.38)', fontStyle:'italic', marginTop:12, fontWeight:300 }}>
          Norbi · Natalita · Elizabethka — spomienky, ktoré trvajú navždy
        </p>
        <LandmarksRow />
      </header>

      {/* Wave divider */}
      <div style={{ height:52, marginTop:-6, overflow:'hidden', position:'relative', zIndex:6 }}>
        <svg viewBox="0 0 1440 52" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%' }}>
          <path d="M0,52 Q120,18 240,40 Q360,52 480,30 Q600,8 720,36 Q840,52 960,26 Q1080,4 1200,36 Q1320,52 1440,26 L1440,52 Z" fill="rgba(12,180,204,0.06)"/>
          <path d="M0,52 Q180,28 360,46 Q540,60 720,40 Q900,20 1080,46 Q1260,62 1440,40 L1440,52 Z" fill="rgba(12,180,204,0.04)"/>
        </svg>
      </div>

      {/* ── Timeline wrapper ── */}
      <div ref={wrapperRef} style={{ position:'relative', maxWidth:900, margin:'0 auto', padding:'0 16px 60px' }}>

        {/* The Road */}
        <div className="road-col" style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          top:0, bottom:0, width:52, minWidth:52,
          background:'#111D2C',
          borderLeft:'2px solid #1A2D42',
          borderRight:'2px solid #1A2D42',
          zIndex:1,
        }}>
          {/* Yellow dashes */}
          <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, width:3,
            background:'repeating-linear-gradient(to bottom,rgba(255,210,0,0.52) 0px,rgba(255,210,0,0.52) 17px,transparent 17px,transparent 34px)' }}/>
          {/* Side glow */}
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(90deg,transparent 0%,rgba(12,180,204,0.07) 30%,rgba(12,180,204,0.07) 70%,transparent 100%)',
            pointerEvents:'none' }}/>
        </div>

        {/* Road fill animation overlay */}
        <RoadFillOverlay wrapperRef={wrapperRef}/>

        {/* ── Rows ── */}
        {rows.map((row, idx) => {

          // Year gap
          if (row.type === 'yeargap') return (
            <div key={`gap-${row.year}`} style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', height:52 }}>
              <div style={{ width:11, height:11, borderRadius:'50%', background:'rgba(255,255,255,0.11)', border:'1px solid rgba(255,255,255,0.2)', boxShadow:'0 0 0 4px #060D1A', zIndex:12 }}/>
              <span style={{ position:'absolute', right:'calc(50% + 36px)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,248,240,0.16)' }}>{row.year}</span>
              {row.note && <span style={{ position:'absolute', left:'calc(50% + 36px)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,248,240,0.14)' }}>{row.note}</span>}
            </div>
          )

          // Special moment
          if (row.type === 'special') {
            const m = row.data
            const uid = `special-${m.date}`
            const showYear = !rows.some((r,ri) => ri < idx && r.year === row.year)
            return (
              <div key={uid} data-id={uid} ref={el => milestoneRefs.current[uid] = el}
                style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', minHeight:160, padding:'20px 0' }}>
                {/* Left empty */}
                <div className="ms-left-col" style={{ flex:1 }}/>
                {/* Dot */}
                <MilestoneDot trip={null} isActive={false} isSpecial specialData={m} isHighlighted={highlightedId===uid} year={row.year} showYear={showYear}/>
                {/* Right card */}
                <div className="ms-right-col ms-card-wrap" style={{ flex:1, display:'flex', justifyContent:'flex-start', padding:'0 46px', position:'relative' }}>
                  <div style={{ position:'absolute', left:28, top:'50%', width:42, height:1, background:'linear-gradient(90deg,rgba(255,107,107,0.35),transparent)', pointerEvents:'none' }}/>
                  <SpecialCard moment={m}/>
                </div>
              </div>
            )
          }

          // Trip
          if (row.type === 'trip') {
            const trip   = row.data
            const isAct  = statusOf(trip) === 'active'
            const isLeft = row.side === 'left'
            const isHigh = highlightedId === trip.id
            const showYear = !rows.some((r,ri) => ri < idx && r.year === row.year && (r.type==='trip'||r.type==='special'))

            return (
              <div key={trip.id} data-id={trip.id} ref={el => milestoneRefs.current[trip.id] = el}
                style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', minHeight: isAct ? 300 : 220, padding:'26px 0' }}>

                {isLeft ? (
                  <>
                    {/* Left card */}
                    <div className="ms-left-col ms-card-wrap" style={{ flex:1, display:'flex', justifyContent:'flex-end', padding:'0 46px', position:'relative' }}>
                      <div style={{ position:'absolute', right:28, top:'50%', width:42, height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1))', pointerEvents:'none' }}/>
                      <TripCard trip={trip} isActive={isAct} isHighlighted={isHigh} side="left" onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    </div>
                    <MilestoneDot trip={trip} isActive={isAct} isSpecial={false} isHighlighted={isHigh} year={row.year} showYear={showYear} onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    {/* Right empty — hidden on mobile via CSS, right card shown via sibling */}
                    <div className="ms-right-col ms-card-wrap" style={{ flex:1, display:'none', justifyContent:'flex-start', padding:'0 46px', position:'relative' }}>
                      <div style={{ position:'absolute', left:28, top:'50%', width:42, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.1),transparent)', pointerEvents:'none' }}/>
                      <TripCard trip={trip} isActive={isAct} isHighlighted={isHigh} side="right" isMobile onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    </div>
                    <div className="ms-left-col" style={{ flex:1 }}/>
                  </>
                ) : (
                  <>
                    <div className="ms-left-col" style={{ flex:1 }}/>
                    <MilestoneDot trip={trip} isActive={isAct} isSpecial={false} isHighlighted={isHigh} year={row.year} showYear={showYear} onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    <div className="ms-right-col ms-card-wrap" style={{ flex:1, display:'flex', justifyContent:'flex-start', padding:'0 46px', position:'relative' }}>
                      <div style={{ position:'absolute', left:28, top:'50%', width:42, height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.1),transparent)', pointerEvents:'none' }}/>
                      <TripCard trip={trip} isActive={isAct} isHighlighted={isHigh} side="right" onNavigate={() => navigate(`/trip/${trip.id}`)}/>
                    </div>
                  </>
                )}
              </div>
            )
          }

          return null
        })}

        {/* Star dissolve */}
        <StarDissolve/>

        {/* Future whisper */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', paddingBottom:24 }}>
          <div style={{ fontSize:'0.62rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,248,240,0.15)', marginBottom:5 }}>2027 a ďalej</div>
          <div style={{ fontSize:'0.78rem', color:'rgba(255,248,240,0.25)', fontStyle:'italic' }}>Maldivy? Japonsko? Nórsko? Svet čaká.</div>
        </div>
      </div>

      {/* ── Add trip button ── */}
      <div style={{ textAlign:'center', paddingBottom:120, position:'relative', zIndex:10 }}>
        <motion.button
          whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.96 }}
          onClick={() => setShowNewTrip(true)}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'12px 30px', borderRadius:100,
            background:'rgba(12,180,204,0.11)', border:'1px solid rgba(12,180,204,0.3)',
            color:'#3DCFE4', fontSize:'0.84rem', fontWeight:700, cursor:'pointer', letterSpacing:'0.04em',
          }}
        >
          <Plus size={15}/> Pridať novú cestu
        </motion.button>
      </div>

      {/* ── Floating bucket list ── */}
      <motion.button
        whileHover={{ scale:1.07, y:-3 }} whileTap={{ scale:0.95 }}
        onClick={() => setShowBucket(true)}
        style={{
          position:'fixed', bottom:26, right:22, zIndex:50,
          display:'flex', alignItems:'center', gap:7,
          padding:'11px 22px', borderRadius:100,
          background:'linear-gradient(135deg,#FF6B6B,#FF9B9B)',
          boxShadow:'0 4px 24px rgba(255,107,107,0.42), 0 0 60px rgba(255,107,107,0.14)',
          color:'#fff', fontSize:'0.78rem', fontWeight:800, cursor:'pointer', letterSpacing:'0.04em',
          border:'1px solid rgba(255,255,255,0.14)',
        }}
      >
        ✨ Bucket list
      </motion.button>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showBucket && (
          <BucketModal bucket={bucket} onSave={handleSaveBucket} onClose={() => setShowBucket(false)} onPlanTrip={createTripFromBucket}/>
        )}
        {showNewTrip && (
          <NewTripModal prefill={showNewTrip?.prefill} onSave={addNewTrip} onClose={() => setShowNewTrip(false)}/>
        )}
      </AnimatePresence>
    </div>
  )
}
