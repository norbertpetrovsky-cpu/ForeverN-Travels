import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import {
  loadTrips, saveTrips, loadBucket, saveBucket,
  generateId, ALL_MODULES, SPECIAL_MOMENTS, whoLabel
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
  return new Date(d).toLocaleDateString('sk-SK', { day:'numeric', month:'short', year:'numeric' })
}
function useMobile() {
  const [m, setM] = useState(() => window.innerWidth < 600)
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 600)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return m
}

// ─── Countdown ────────────────────────────────────────────────
function Countdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  const pad = n => String(n).padStart(2,'0')
  if (diff <= 0) return <div style={{ textAlign:'center', color:'#3DCFE4', fontWeight:700, marginTop:10 }}>✈️ Letíme!</div>
  const parts = [
    { v:pad(Math.floor(diff/86400000)),           l:'dní' },
    { v:pad(Math.floor((diff%86400000)/3600000)), l:'hod' },
    { v:pad(Math.floor((diff%3600000)/60000)),    l:'min' },
    { v:pad(Math.floor((diff%60000)/1000)),       l:'sek' },
  ]
  return (
    <div style={{ marginTop:12, padding:'10px 12px', borderRadius:12, background:'rgba(12,180,204,0.1)', border:'1px solid rgba(12,180,204,0.25)' }}>
      <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(12,180,204,0.75)', textAlign:'center', marginBottom:6 }}>Odlet o</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        {parts.map((p,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            {i>0 && <span style={{ color:'rgba(12,180,204,0.4)', fontSize:'1rem', fontWeight:300 }}>:</span>}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#0CB4CC', fontVariantNumeric:'tabular-nums' }}>{p.v}</div>
              <div style={{ fontSize:9, color:'rgba(255,248,240,0.35)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{p.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Destination config ───────────────────────────────────────
const DEST = {
  'side-2019':               { color:'#C17F3E', colorRgb:'193,127,62',  code:'TR', gradient:'linear-gradient(135deg,rgba(193,127,62,0.28) 0%,rgba(160,90,30,0.12) 100%)' },
  'donovaly-2021':           { color:'#5B8C5A', colorRgb:'91,140,90',   code:'SK', gradient:'linear-gradient(135deg,rgba(91,140,90,0.28) 0%,rgba(50,100,50,0.1) 100%)'  },
  'slovinsko-taliansko-2022':{ color:'#7B5EA7', colorRgb:'123,94,167',  code:'EU', gradient:'linear-gradient(135deg,rgba(123,94,167,0.28) 0%,rgba(80,50,130,0.1) 100%)' },
  'cyprus-2022':             { color:'#0CB4CC', colorRgb:'12,180,204',  code:'CY', gradient:'linear-gradient(135deg,rgba(12,180,204,0.24) 0%,rgba(8,130,160,0.1) 100%)'  },
  'rim-2023':                { color:'#C17F3E', colorRgb:'193,127,62',  code:'IT', gradient:'linear-gradient(135deg,rgba(193,127,62,0.28) 0%,rgba(160,90,30,0.12) 100%)' },
  'cyprus-2024':             { color:'#0CB4CC', colorRgb:'12,180,204',  code:'CY', gradient:'linear-gradient(135deg,rgba(12,180,204,0.24) 0%,rgba(8,130,160,0.1) 100%)'  },
  'cyprus-2025':             { color:'#0CB4CC', colorRgb:'12,180,204',  code:'CY', gradient:'linear-gradient(135deg,rgba(12,180,204,0.24) 0%,rgba(8,130,160,0.1) 100%)'  },
  'cyprus-2026':             { color:'#0CB4CC', colorRgb:'12,180,204',  code:'CY', gradient:'linear-gradient(135deg,rgba(12,180,204,0.32) 0%,rgba(8,130,160,0.14) 100%)' },
}

// ─── Card SVG illustrations (larger, more evocative) ─────────
function CardIllustration({ tripId, color }) {
  const s = { position:'absolute', bottom:-4, right:-12, pointerEvents:'none', zIndex:0, opacity:0.18 }
  if (tripId === 'side-2019') return (
    // Minaret silhouette
    <svg style={{ ...s, width:130, height:170 }} viewBox="0 0 80 110" fill={color}>
      <rect x="34" y="18" width="12" height="78" rx="3"/>
      <ellipse cx="40" cy="18" rx="16" ry="12"/>
      <ellipse cx="40" cy="8"  rx="8"  ry="7"/>
      <circle  cx="40" cy="2"  r="4"/>
      <rect x="27" y="42" width="26" height="5" rx="2.5"/>
      <path d="M16,110 L16,66 Q16,44 40,44 Q64,44 64,66 L64,110Z" opacity=".45"/>
      {/* Second smaller minaret */}
      <rect x="10" y="52" width="7" height="40" rx="2" opacity=".4"/>
      <ellipse cx="13.5" cy="52" rx="8" ry="6" opacity=".4"/>
    </svg>
  )
  if (tripId === 'donovaly-2021') return (
    // Mountain peaks with snow
    <svg style={{ ...s, width:170, height:130 }} viewBox="0 0 110 85" fill={color}>
      <polygon points="55,4 0,85 110,85"/>
      <polygon points="55,4 40,28 70,28" fill="rgba(255,255,255,0.4)"/>
      <polygon points="20,32 -8,85 48,85" opacity=".5"/>
      <polygon points="90,24 55,85 125,85" opacity=".5"/>
      <polygon points="20,32 12,48 28,48" fill="rgba(255,255,255,0.25)" opacity=".5"/>
    </svg>
  )
  if (tripId === 'slovinsko-taliansko-2022') return (
    // Rialto arch bridge
    <svg style={{ ...s, width:165, height:120 }} viewBox="0 0 100 70" fill="none">
      <path d="M0,70 Q50,10 100,70" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <path d="M10,70 Q50,26 90,70" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <line x1="50" y1="12" x2="50" y2="70" stroke={color} strokeWidth="3"/>
      <line x1="30" y1="32" x2="30" y2="70" stroke={color} strokeWidth="2.5"/>
      <line x1="70" y1="32" x2="70" y2="70" stroke={color} strokeWidth="2.5"/>
      <line x1="16" y1="53" x2="16" y2="70" stroke={color} strokeWidth="2"/>
      <line x1="84" y1="53" x2="84" y2="70" stroke={color} strokeWidth="2"/>
      {/* Little gondola */}
      <path d="M42,68 Q50,62 58,68" stroke={color} strokeWidth="1.5" fill="none" opacity=".5"/>
    </svg>
  )
  if (tripId?.startsWith('cyprus')) return (
    // Palm tree + island
    <svg style={{ ...s, width:140, height:170, opacity:0.2 }} viewBox="0 0 65 95" fill="none">
      <path d="M32,95 Q30,65 33,40 Q35,22 32,12" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <path d="M32,20 Q16,12 2,20"    stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <path d="M32,20 Q26,3 14,0"     stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <path d="M32,20 Q41,3 54,8"     stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <path d="M32,20 Q48,14 63,10"   stroke={color} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M32,20 Q51,26 62,37"   stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="32" cy="91" rx="28" ry="6" fill={color} opacity=".45"/>
      {/* Sun reflection */}
      <circle cx="52" cy="10" r="4" fill={color} opacity=".35"/>
    </svg>
  )
  if (tripId?.startsWith('rim')) return (
    // Colosseum with arch openings
    <svg style={{ ...s, width:175, height:130 }} viewBox="0 0 90 72" fill={color}>
      <ellipse cx="45" cy="42" rx="44" ry="28"/>
      <ellipse cx="45" cy="42" rx="30" ry="17" fill="#060D1A"/>
      <rect x="1" y="14" width="88" height="10" rx="2"/>
      <rect x="1"  y="14" width="13" height="58" rx="2"/>
      <rect x="76" y="14" width="13" height="58" rx="2"/>
      <path d="M17,72 L17,35 Q17,21 27,21 Q37,21 37,35 L37,72" fill="#060D1A" opacity=".7"/>
      <path d="M39,72 L39,35 Q39,21 45,21 Q51,21 51,35 L51,72" fill="#060D1A" opacity=".7"/>
      <path d="M53,72 L53,35 Q53,21 63,21 Q73,21 73,35 L73,72" fill="#060D1A" opacity=".7"/>
    </svg>
  )
  return null
}

// ─── Country code badge ───────────────────────────────────────
function CountryBadge({ code, color }) {
  return (
    <div style={{
      position:'absolute', top:14, right:14, zIndex:5,
      width:32, height:32, borderRadius:'50%',
      background:`rgba(${color === '#0CB4CC' ? '12,180,204' : color === '#C17F3E' ? '193,127,62' : color === '#5B8C5A' ? '91,140,90' : color === '#7B5EA7' ? '123,94,167' : '12,180,204'},0.15)`,
      border:`1px solid ${color}44`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'0.5rem', fontWeight:800, letterSpacing:'0.05em',
      color:`${color}cc`,
    }}>
      {code}
    </div>
  )
}

// ─── Stamp decoration ─────────────────────────────────────────
function StampDecal({ color }) {
  return (
    <div style={{
      position:'absolute', bottom:14, right:14, zIndex:2,
      width:36, height:36,
      border:`1.5px dashed ${color}33`,
      borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      pointerEvents:'none',
    }}>
      <div style={{
        width:26, height:26, borderRadius:'50%',
        border:`1px solid ${color}22`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'0.45rem', fontWeight:700, letterSpacing:'0.08em',
        color:`${color}44`, textTransform:'uppercase', textAlign:'center', lineHeight:1.1,
      }}>
        ForeverN
      </div>
    </div>
  )
}

// ─── Content badges ───────────────────────────────────────────
function ContentBadges({ trip, color }) {
  const badges = []
  if (trip.hotel)                         badges.push('🏨')
  if (trip.modules?.mapa)                 badges.push('🗺️')
  if (trip.modules?.spomienky)            badges.push('📸')
  if (trip.modules?.denik)                badges.push('📖')
  if (badges.length === 0)                return null
  return (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:8 }}>
      {badges.map((b,i) => (
        <div key={i} style={{
          fontSize:'0.6rem', padding:'2px 7px', borderRadius:20,
          background:`rgba(${color === '#0CB4CC' ? '12,180,204' : color === '#C17F3E' ? '193,127,62' : color === '#5B8C5A' ? '91,140,90' : color === '#7B5EA7' ? '123,94,167' : '12,180,204'},0.1)`,
          border:`1px solid ${color}25`,
          color:`${color}99`,
        }}>{b}</div>
      ))}
    </div>
  )
}

// ─── Trip Card — premium travel postcard ─────────────────────
function TripCard({ trip, isActive, isHighlighted, side, onNavigate }) {
  const cfg = DEST[trip.id] || DEST['cyprus-2022']
  const c   = cfg.color
  const rgb = cfg.colorRgb
  const ref = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); obs.disconnect() } },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const borderColor = isActive
    ? `rgba(${rgb},0.65)`
    : isHighlighted
    ? `rgba(${rgb},0.45)`
    : `rgba(${rgb},0.18)`

  const shadow = isActive
    ? `0 12px 50px rgba(${rgb},0.28), 0 0 0 1px rgba(${rgb},0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
    : isHighlighted
    ? `0 10px 40px rgba(${rgb},0.2), 0 0 0 1px rgba(${rgb},0.2)`
    : `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`

  return (
    <motion.div
      ref={ref}
      onClick={onNavigate}
      initial={{ opacity:0, x: side==='left' ? -40 : 40, y: 12 }}
      animate={entered ? {
        opacity:1, x:0, y:0,
        scale: isHighlighted ? 1.04 : 1,
      } : {}}
      transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
      whileHover={{
        y:-9, scale:1.035,
        transition:{ duration:0.22, ease:'easeOut' }
      }}
      style={{
        background: cfg.gradient,
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        border:`1px solid ${borderColor}`,
        borderRadius:22,
        maxWidth:272, width:'100%',
        cursor:'pointer', position:'relative', overflow:'hidden',
        boxShadow: shadow,
        transition:'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      {/* Top accent stripe — thicker, glows on active */}
      <div style={{
        height: isActive ? 5 : 3,
        background:`linear-gradient(90deg, ${c}cc, ${c}, ${c}88)`,
        backgroundSize: isActive ? '200% 100%' : undefined,
        animation: isActive ? 'stripeShimmer 2.5s linear infinite' : undefined,
        boxShadow: isActive ? `0 0 12px ${c}88` : undefined,
      }}/>

      {/* Destination illustration */}
      <CardIllustration tripId={trip.id} color={c}/>

      {/* Country code badge */}
      <CountryBadge code={cfg.code} color={c}/>

      {/* Stamp decal — bottom right */}
      <StampDecal color={c}/>

      <div style={{ padding:'14px 18px 52px', position:'relative', zIndex:3 }}>

        {/* Active badge */}
        {isActive && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            fontSize:8, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase',
            color:'#3DCFE4', background:'rgba(12,180,204,0.14)',
            border:'1px solid rgba(12,180,204,0.32)', borderRadius:20,
            padding:'3px 10px', marginBottom:10,
          }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#0CB4CC', display:'inline-block', animation:'blink 1.5s ease-in-out infinite' }}/>
            Aktívna cesta
          </div>
        )}

        {/* Flag — larger */}
        <div style={{ fontSize:26, marginBottom:8, lineHeight:1 }}>{trip.flag}</div>

        {/* Destination — hero text */}
        <div style={{
          fontSize: isActive ? '1.15rem' : '1.05rem',
          fontWeight:900, lineHeight:1.1, marginBottom:4, letterSpacing:'-0.01em',
          ...(isActive ? {
            background:`linear-gradient(135deg,#0CB4CC,#3DCFE4,#0CB4CC)`,
            backgroundSize:'200% 100%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'stripeShimmer 4s linear infinite',
          } : { color:'rgba(255,248,240,0.95)' }),
        }}>{trip.destination}</div>

        {/* Country / region */}
        <div style={{
          fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.18em',
          color:`${c}bb`, fontWeight:700, marginBottom:10,
        }}>{trip.country}</div>

        {/* Divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,${c}22,${c}44,${c}22)`, marginBottom:10 }}/>

        {/* Highlight */}
        {trip.highlight && (
          <div style={{
            fontSize:'0.7rem', color:'rgba(255,248,240,0.6)', lineHeight:1.6,
            fontStyle:'italic', marginBottom:10, fontWeight:300,
          }}>{trip.highlight}</div>
        )}

        {/* Dates */}
        <div style={{
          fontSize:'0.6rem', color:'rgba(255,248,240,0.38)', fontWeight:600,
          letterSpacing:'0.06em', marginBottom: trip.hotel ? 3 : 0,
          display:'flex', alignItems:'center', gap:5,
        }}>
          <span style={{ color:`${c}66`, fontSize:8 }}>●</span>
          {fmtDate(trip.dateFrom)} – {fmtDate(trip.dateTo)}
        </div>

        {/* Hotel */}
        {trip.hotel && (
          <div style={{ fontSize:'0.6rem', color:'rgba(255,248,240,0.32)', marginBottom:0, display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:9 }}>🏨</span>{trip.hotel}
          </div>
        )}

        {/* Who */}
        <div style={{
          fontSize:'0.6rem', color:'rgba(255,248,240,0.3)', marginTop:6,
          display:'flex', alignItems:'center', gap:5,
        }}>
          <span style={{ color:`${c}55`, fontSize:8 }}>●</span>
          {whoLabel(trip.who)}
        </div>

        {/* Content badges */}
        <ContentBadges trip={trip} color={c}/>

        {/* Countdown for active */}
        {isActive && <Countdown target={new Date('2026-07-25T06:00:00').getTime()}/>}

      </div>

      {/* CTA button — sits above stamp area */}
      <div style={{ padding:'0 18px 16px', position:'relative', zIndex:3 }}>
        <div style={{
          padding:'8px 0', borderRadius:12, textAlign:'center',
          fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.06em',
          background: isActive
            ? `linear-gradient(135deg,rgba(${rgb},0.25),rgba(${rgb},0.12))`
            : `rgba(255,255,255,0.05)`,
          color: isActive ? '#3DCFE4' : `rgba(${rgb},0.7)`,
          border:`1px solid ${isActive ? `rgba(${rgb},0.35)` : `rgba(${rgb},0.18)`}`,
          transition:'all 0.2s',
        }}>
          Otvoriť cestu →
        </div>
      </div>
    </motion.div>
  )
}

// ─── Special card — family memory capsule ────────────────────
function SpecialCard({ moment }) {
  const isBirth   = moment.icon === '👶'
  const accent    = isBirth ? '#FFB6C1' : '#FF6B6B'
  const accentRgb = isBirth ? '255,182,193' : '255,107,107'
  const ref       = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0, x:30, y:8 }}
      animate={entered ? { opacity:1, x:0, y:0 } : {}}
      transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-5, transition:{ duration:0.2 } }}
      style={{
        background:`radial-gradient(ellipse at 50% 0%, rgba(${accentRgb},0.18) 0%, rgba(6,13,26,0.92) 65%)`,
        border:`1px solid rgba(${accentRgb},0.25)`,
        borderRadius:22,
        padding:'22px 20px 20px',
        maxWidth:210, width:'100%',
        position:'relative', overflow:'hidden', cursor:'default',
        boxShadow:`0 4px 24px rgba(${accentRgb},0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Top warm glow */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:80,
        background:`radial-gradient(ellipse at 50% 0%, rgba(${accentRgb},0.22) 0%, transparent 70%)`,
        pointerEvents:'none',
      }}/>

      {/* Top accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${accent},transparent)`, opacity:0.8 }}/>

      {/* Large centred icon */}
      <div style={{
        textAlign:'center', fontSize:32, marginBottom:12,
        filter:`drop-shadow(0 0 12px ${accent}66)`,
        position:'relative', zIndex:1,
      }}>{moment.icon}</div>

      {/* Label */}
      <div style={{
        fontSize:'0.9rem', fontWeight:800, color:'rgba(255,248,240,0.92)',
        marginBottom:6, textAlign:'center', lineHeight:1.2,
        position:'relative', zIndex:1,
      }}>{moment.label}</div>

      {/* Date */}
      <div style={{
        fontSize:'0.6rem', color:`${accent}88`,
        letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600,
        textAlign:'center', position:'relative', zIndex:1,
      }}>
        {new Date(moment.date).toLocaleDateString('sk-SK', { day:'numeric', month:'long', year:'numeric' })}
      </div>

      {/* Subtle decorative ring */}
      <div style={{
        position:'absolute', bottom:-20, right:-20,
        width:80, height:80, borderRadius:'50%',
        border:`1px dashed rgba(${accentRgb},0.15)`,
        pointerEvents:'none',
      }}/>
    </motion.div>
  )
}

// ─── Milestone Dot ────────────────────────────────────────────
const DOT_EMOJI = {
  'side-2019':'💑','donovaly-2021':'⛷️','slovinsko-taliansko-2022':'🚗',
  'cyprus-2022':'🌊','rim-2023':'🏛️','cyprus-2024':'🐚','cyprus-2025':'🌴','cyprus-2026':'✈️',
}

function MilestoneDot({ trip, isActive, isSpecial, specialData, isHighlighted, year, showYear, onNavigate }) {
  const size    = isActive ? 90 : isSpecial ? 60 : 72
  const emoji   = isSpecial ? specialData?.icon : (DOT_EMOJI[trip?.id] || '🌍')
  const tripColor = trip?.id ? (DEST[trip.id]?.color || 'rgba(255,255,255,0.35)') : null

  const bdr = isActive
    ? '#0CB4CC'
    : isSpecial
    ? (specialData?.color||'#FF6B6B')
    : isHighlighted && tripColor
    ? tripColor          // destination colour when highlighted
    : isHighlighted
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(255,255,255,0.14)'

  const shadow = isActive
    ? '0 0 0 4px #060D1A,0 0 0 8px rgba(12,180,204,.55),0 0 40px rgba(12,180,204,.7),0 0 80px rgba(12,180,204,.3)'
    : isSpecial
    ? `0 0 0 4px #060D1A,0 0 28px ${(specialData?.color||'#FF6B6B')}99`
    : isHighlighted && tripColor
    ? `0 0 0 4px #060D1A,0 0 30px ${tripColor}88`
    : isHighlighted
    ? '0 0 0 4px #060D1A,0 0 24px rgba(255,255,255,0.28)'
    : '0 0 0 4px #060D1A'

  // Year pill — brighter + larger when highlighted
  const yearBg     = isActive ? 'rgba(12,180,204,0.16)' : isHighlighted ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)'
  const yearBdr    = isActive ? 'rgba(12,180,204,0.4)'  : isHighlighted ? 'rgba(255,107,107,0.45)' : 'rgba(255,107,107,0.22)'
  const yearColor  = isActive ? '#3DCFE4' : isHighlighted ? '#FFAA99' : '#FF9B9B'
  const yearScale  = isHighlighted && !isActive ? 1.1 : 1

  return (
    <div onClick={onNavigate} style={{ position:'relative', flexShrink:0, zIndex:15, cursor:trip&&!isSpecial?'pointer':'default' }}>
      {showYear && (
        <motion.div
          animate={{ scale: yearScale, opacity: isHighlighted ? 1 : 0.75 }}
          transition={{ type:'spring', stiffness:280, damping:24 }}
          style={{
            position:'absolute', left:'50%', transform:'translateX(-50%)',
            top:-24, zIndex:20, whiteSpace:'nowrap',
            fontSize: isHighlighted ? 11 : 10,
            fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
            padding:'2px 11px', borderRadius:20,
            color: yearColor,
            background: yearBg,
            border:`1px solid ${yearBdr}`,
            boxShadow: isHighlighted ? `0 0 12px ${yearColor}44` : 'none',
            transition:'color 0.3s, background 0.3s, box-shadow 0.3s',
          }}
        >{year}</motion.div>
      )}
      <motion.div
        animate={{ scale: isHighlighted&&!isActive ? 1.12 : 1 }}
        transition={{ type:'spring', stiffness:280, damping:22 }}
        style={{
          width:size, height:size, borderRadius:'50%',
          background:'#080F1C',
          border:`2.5px solid ${bdr}`,
          boxShadow:shadow,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:isActive?34:isSpecial?24:26,
          transition:'box-shadow 0.4s, border-color 0.4s',
          animation:isActive?'activeGlowDot 2.5s ease-in-out infinite':undefined,
        }}
      >
        {emoji}
      </motion.div>
      {isActive && (
        <>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:size+20, height:size+20, borderRadius:'50%', border:'1.5px solid rgba(12,180,204,0.35)', animation:'sonar1 2.5s ease-out infinite', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:size+40, height:size+40, borderRadius:'50%', border:'1px solid rgba(12,180,204,0.2)', animation:'sonar2 2.5s ease-out infinite 0.6s', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:size+65, height:size+65, borderRadius:'50%', border:'1px solid rgba(12,180,204,0.1)', animation:'sonar2 2.5s ease-out infinite 1.2s', pointerEvents:'none' }}/>
        </>
      )}
    </div>
  )
}

// ─── THE ROAD — cinematic spine with glow + fill anim ────────
// Road fades out at the bottom so JourneyEnding SVG continues it seamlessly
function TheRoad({ isMobile, scrollGlowPct }) {
  const fillRef = useRef(null)
  const beadRef = useRef(null)

  useEffect(() => {
    const start = new Date('2019-01-01').getTime()
    const end   = new Date('2028-01-01').getTime()
    const pct   = Math.min(1, (Date.now()-start)/(end-start))
    let raf
    const t0 = performance.now()
    function stepFill(now) {
      const t = Math.min(1, (now-t0)/1600)
      const e = 1 - Math.pow(1-t, 3)
      if (fillRef.current) fillRef.current.style.height = `${e*pct*100}%`
      if (t < 1) { raf = requestAnimationFrame(stepFill) }
      else {
        if (fillRef.current) fillRef.current.style.height = `${pct*100}%`
        const t1 = performance.now()
        function stepBead(now2) {
          const t2 = Math.min(1, (now2-t1)/1000)
          const e2 = 1 - Math.pow(1-t2, 2)
          if (beadRef.current) {
            beadRef.current.style.top = `${e2*pct*100}%`
            beadRef.current.style.opacity = t2 < 0.85 ? '1' : `${(1-t2)*6.6}`
          }
          if (t2 < 1) { raf = requestAnimationFrame(stepBead) }
          else if (beadRef.current) beadRef.current.style.opacity = '0'
        }
        raf = requestAnimationFrame(stepBead)
      }
    }
    setTimeout(() => { raf = requestAnimationFrame(stepFill) }, 400)
    return () => cancelAnimationFrame(raf)
  }, [])

  const w = isMobile ? 36 : 52

  return (
    <div style={{
      position:'absolute', left:'50%', transform:'translateX(-50%)',
      top:0, bottom:0, width:w,
      zIndex:1, overflow:'visible',
    }}>
      {/* Outer glow edges */}
      <div style={{
        position:'absolute', left:-14, right:-14, top:0, bottom:0,
        background:'linear-gradient(90deg,transparent 0%,rgba(12,180,204,0.07) 20%,rgba(12,180,204,0.12) 50%,rgba(12,180,204,0.07) 80%,transparent 100%)',
        filter:'blur(8px)', pointerEvents:'none',
        maskImage:'linear-gradient(180deg, black 0%, black 75%, transparent 100%)',
        WebkitMaskImage:'linear-gradient(180deg, black 0%, black 75%, transparent 100%)',
      }}/>
      {/* Road surface */}
      <div style={{
        position:'absolute', left:0, right:0, top:0, bottom:0,
        background:'#0E1A2B',
        borderLeft:'1.5px solid rgba(26,45,66,0.9)',
        borderRight:'1.5px solid rgba(26,45,66,0.9)',
        overflow:'hidden',
        maskImage:'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
        WebkitMaskImage:'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(168deg,transparent 0px,transparent 8px,rgba(255,255,255,0.012) 8px,rgba(255,255,255,0.012) 9px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, bottom:0, width:2.5, background:'repeating-linear-gradient(to bottom,rgba(255,210,0,0.55) 0px,rgba(255,210,0,0.55) 16px,transparent 16px,transparent 32px)' }}/>
        <div ref={fillRef} style={{
          position:'absolute', left:0, right:0, top:0, height:'0%',
          background:'linear-gradient(180deg,rgba(12,180,204,0.28) 0%,rgba(12,180,204,0.14) 60%,rgba(12,180,204,0.0) 100%)',
        }}/>
        <div ref={beadRef} style={{ position:'absolute', left:'50%', transform:'translate(-50%,-50%)', top:'0%', width:w+18, height:80, opacity:0, background:'radial-gradient(ellipse,rgba(12,180,204,0.95) 0%,rgba(12,180,204,0.3) 45%,transparent 70%)', filter:'blur(3px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'50%', transform:'translate(-50%,-50%)', top:`${scrollGlowPct*100}%`, width:w+20, height:100, background:'radial-gradient(ellipse,rgba(12,180,204,0.55) 0%,rgba(12,180,204,0.12) 50%,transparent 70%)', filter:'blur(6px)', pointerEvents:'none', transition:'top 0.3s ease-out', opacity:0.85 }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(12,180,204,0.05) 30%,rgba(12,180,204,0.05) 70%,transparent 100%)', pointerEvents:'none' }}/>
      </div>
      <div style={{ position:'absolute', left:-2, top:0, bottom:0, width:2, background:'linear-gradient(180deg,transparent,rgba(12,180,204,0.35) 20%,rgba(12,180,204,0.35) 70%,transparent 100%)', filter:'blur(2px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:-2, top:0, bottom:0, width:2, background:'linear-gradient(180deg,transparent,rgba(12,180,204,0.35) 20%,rgba(12,180,204,0.35) 70%,transparent 100%)', filter:'blur(2px)', pointerEvents:'none' }}/>
      {Array.from({ length:26 }, (_,i) => (
        <div key={i} style={{ position:'absolute', left:i%2===0?0:undefined, right:i%2===1?0:undefined, top:`${(i+1)*3.2}%`, width:6, height:1, background:'rgba(12,180,204,0.25)', pointerEvents:'none' }}/>
      ))}
    </div>
  )
}

// ─── MAP BACKGROUND — full-page travel map atmosphere ─────────
function MapBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>

      {/* Base gradient — rich deep navy, not flat */}
      <div style={{
        position:'absolute', inset:0,
        background:`
          radial-gradient(ellipse 80% 40% at 50% 0%, rgba(12,30,60,0.95) 0%, transparent 100%),
          radial-gradient(ellipse 60% 50% at 20% 60%, rgba(8,20,45,0.6) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 80% 40%, rgba(8,20,45,0.5) 0%, transparent 70%),
          linear-gradient(180deg, #060D1A 0%, #080F20 40%, #060D18 70%, #040A14 100%)
        `,
      }}/>

      {/* Vignette — dark edges, lighter centre */}
      <div style={{
        position:'absolute', inset:0,
        background:'radial-gradient(ellipse 85% 70% at 50% 40%, transparent 40%, rgba(2,5,12,0.7) 100%)',
      }}/>

      {/* Subtle map contour lines — SVG pattern across full page */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.035 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="contour" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0,60 Q30,40 60,60 Q90,80 120,60" fill="none" stroke="#0CB4CC" strokeWidth="0.8"/>
            <path d="M0,30 Q30,10 60,30 Q90,50 120,30" fill="none" stroke="#0CB4CC" strokeWidth="0.6"/>
            <path d="M0,90 Q30,70 60,90 Q90,110 120,90" fill="none" stroke="#0CB4CC" strokeWidth="0.6"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contour)"/>
      </svg>

      {/* Dotted grid — map coordinate feel */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.04 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="0.8" fill="#3DCFE4"/>
            <circle cx="0"  cy="0"  r="0.5" fill="#3DCFE4"/>
            <circle cx="60" cy="0"  r="0.5" fill="#3DCFE4"/>
            <circle cx="0"  cy="60" r="0.5" fill="#3DCFE4"/>
            <circle cx="60" cy="60" r="0.5" fill="#3DCFE4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)"/>
      </svg>

      {/* Faint dotted flight path arcs — left and right of centre */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }} preserveAspectRatio="xMidYMid slice">
        {/* Arc from top-left sweeping across */}
        <path d="M -50,200 Q 300,-80 700,350" fill="none" stroke="#0CB4CC" strokeWidth="1" strokeDasharray="4 8"/>
        {/* Arc from top-right */}
        <path d="M 1500,150 Q 1100,-60 650,400" fill="none" stroke="#0CB4CC" strokeWidth="1" strokeDasharray="4 8"/>
        {/* Mid flight path */}
        <path d="M 100,800 Q 500,400 1350,700" fill="none" stroke="#3DCFE4" strokeWidth="0.8" strokeDasharray="3 10"/>
      </svg>

      {/* Small compass in top-right corner */}
      <svg style={{ position:'absolute', top:80, right:40, width:60, height:60, opacity:0.07 }} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="28" fill="none" stroke="#0CB4CC" strokeWidth="1"/>
        <circle cx="30" cy="30" r="22" fill="none" stroke="#0CB4CC" strokeWidth="0.5"/>
        {/* Cardinal ticks */}
        <line x1="30" y1="2"  x2="30" y2="10" stroke="#0CB4CC" strokeWidth="1.5"/>
        <line x1="30" y1="50" x2="30" y2="58" stroke="#0CB4CC" strokeWidth="1"/>
        <line x1="2"  y1="30" x2="10" y2="30" stroke="#0CB4CC" strokeWidth="1"/>
        <line x1="50" y1="30" x2="58" y2="30" stroke="#0CB4CC" strokeWidth="1"/>
        {/* N marker */}
        <text x="27" y="20" fontSize="7" fill="#0CB4CC" fontFamily="sans-serif" fontWeight="bold">N</text>
        {/* Needle */}
        <polygon points="30,8 27,30 30,26 33,30" fill="#0CB4CC" opacity="0.8"/>
        <polygon points="30,52 27,30 30,34 33,30" fill="#0CB4CC" opacity="0.3"/>
      </svg>

      {/* Subtle noise grain overlay */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize:'256px 256px',
        opacity:0.35,
        mixBlendMode:'overlay',
      }}/>
    </div>
  )
}

// ─── Journey ending — road dissolves into constellation ───────
// Overlaps the bottom of TheRoad by 120px via negative margin-top
// so there is zero visible seam between the timeline and this section
function JourneyEnding({ onAddTrip }) {
  const nearStars = [
    { cx:710, cy:145, r:1.2, o:0.28 }, { cx:728, cy:158, r:0.8, o:0.22 },
    { cx:700, cy:175, r:1.0, o:0.32 }, { cx:738, cy:168, r:0.7, o:0.24 },
    { cx:695, cy:198, r:1.4, o:0.30 }, { cx:745, cy:185, r:0.9, o:0.20 },
    { cx:706, cy:212, r:0.6, o:0.22 }, { cx:733, cy:205, r:1.1, o:0.26 },
    { cx:688, cy:228, r:0.8, o:0.18 }, { cx:752, cy:222, r:0.7, o:0.20 },
  ]
  const midStars = [
    { cx:650, cy:270, r:1.0, o:0.22, d:3.5, dl:0.8  },
    { cx:770, cy:260, r:0.8, o:0.18, d:4.2, dl:1.2  },
    { cx:630, cy:305, r:1.3, o:0.26, d:3.0, dl:0.3  },
    { cx:790, cy:298, r:0.9, o:0.20, d:5.0, dl:2.0  },
    { cx:680, cy:328, r:0.7, o:0.16, d:3.8, dl:0.6  },
    { cx:760, cy:322, r:1.1, o:0.22, d:4.5, dl:1.5  },
    { cx:610, cy:345, r:0.6, o:0.14, d:6.0, dl:2.5  },
    { cx:820, cy:338, r:0.8, o:0.18, d:3.2, dl:0.9  },
    { cx:720, cy:352, r:1.5, o:0.30, d:4.0, dl:0.0  },
  ]
  const farStars = [
    { cx:200,  cy:390, r:0.7, o:0.12, d:5.5, dl:1.0 }, { cx:380,  cy:370, r:1.0, o:0.14, d:4.0, dl:2.2 },
    { cx:520,  cy:405, r:0.8, o:0.12, d:6.5, dl:0.5 }, { cx:920,  cy:378, r:0.9, o:0.13, d:3.8, dl:1.8 },
    { cx:1060, cy:398, r:0.7, o:0.11, d:5.0, dl:3.0 }, { cx:1240, cy:365, r:1.1, o:0.15, d:4.5, dl:0.7 },
    { cx:150,  cy:455, r:1.2, o:0.16, d:3.5, dl:1.5 }, { cx:340,  cy:445, r:0.8, o:0.14, d:6.0, dl:2.8 },
    { cx:480,  cy:468, r:0.6, o:0.11, d:4.8, dl:0.3 }, { cx:960,  cy:452, r:0.9, o:0.13, d:5.2, dl:1.2 },
    { cx:1100, cy:462, r:0.7, o:0.12, d:3.8, dl:2.5 }, { cx:1280, cy:442, r:1.0, o:0.14, d:4.2, dl:0.8 },
    { cx:100,  cy:510, r:0.8, o:0.09, d:6.5, dl:1.0 }, { cx:280,  cy:498, r:1.1, o:0.12, d:3.5, dl:3.0 },
    { cx:580,  cy:505, r:0.7, o:0.10, d:5.0, dl:0.5 }, { cx:860,  cy:492, r:0.9, o:0.11, d:4.5, dl:2.0 },
    { cx:1140, cy:502, r:0.8, o:0.09, d:6.0, dl:1.5 }, { cx:1360, cy:488, r:0.6, o:0.10, d:3.8, dl:0.8 },
  ]
  const constellationLines = [
    [midStars[0], midStars[1]], [midStars[1], midStars[5]],
    [midStars[5], midStars[8]], [midStars[0], midStars[4]],
    [midStars[4], midStars[8]],
  ]

  return (
    <div style={{
      position:'relative', zIndex:10,
      // Pull this section UP by 120px so it overlaps the fading bottom of TheRoad
      marginTop:-120,
    }}>
      <svg
        viewBox="0 0 1440 580"
        preserveAspectRatio="xMidYTop meet"
        style={{ width:'100vw', marginLeft:'calc(-50vw + 50%)', display:'block' }}
      >
        <defs>
          {/* The top 120px of this SVG is the overlap zone — transparent so TheRoad shows through */}
          <linearGradient id="overlapFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060D1A" stopOpacity="0"/>
            <stop offset="20%"  stopColor="#060D1A" stopOpacity="0"/>
            <stop offset="55%"  stopColor="#060D1A" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#040A14" stopOpacity="0.9"/>
          </linearGradient>
          {/* Road ghost — continues the road fading from where TheRoad left off */}
          <linearGradient id="roadGhost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#0E1A2B" stopOpacity="0.0"/>
            <stop offset="12%" stopColor="#0E1A2B" stopOpacity="0.35"/>
            <stop offset="38%" stopColor="#0E1A2B" stopOpacity="0.18"/>
            <stop offset="65%" stopColor="#0E1A2B" stopOpacity="0.05"/>
            <stop offset="100%" stopColor="#0E1A2B" stopOpacity="0"/>
          </linearGradient>
          {/* Dashes fade */}
          <linearGradient id="dashGhost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(255,210,0,0)" />
            <stop offset="10%" stopColor="rgba(255,210,0,0.28)"/>
            <stop offset="40%" stopColor="rgba(255,210,0,0.12)"/>
            <stop offset="65%" stopColor="rgba(255,210,0,0)"/>
          </linearGradient>
          {/* Edge glow dissolve */}
          <linearGradient id="edgeGhost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#0CB4CC" stopOpacity="0"/>
            <stop offset="12%" stopColor="#0CB4CC" stopOpacity="0.22"/>
            <stop offset="45%" stopColor="#0CB4CC" stopOpacity="0.06"/>
            <stop offset="70%" stopColor="#0CB4CC" stopOpacity="0"/>
          </linearGradient>
          {/* Dream glow at centre */}
          <radialGradient id="dreamGlow" cx="50%" cy="70%" r="38%">
            <stop offset="0%"  stopColor="#0CB4CC" stopOpacity="0.14"/>
            <stop offset="55%" stopColor="#0CB4CC" stopOpacity="0.04"/>
            <stop offset="100%" stopColor="#0CB4CC" stopOpacity="0"/>
          </radialGradient>
          {/* Vanishing point */}
          <radialGradient id="vpGlow" cx="50%" cy="0%" r="60%">
            <stop offset="0%"  stopColor="#0CB4CC" stopOpacity="0.65"/>
            <stop offset="35%" stopColor="#0CB4CC" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#0CB4CC" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Background darkens gradually — transparent at top so timeline shows through */}
        <rect x="0" y="0" width="1440" height="580" fill="url(#overlapFade)"/>
        {/* Dream glow */}
        <rect x="0" y="0" width="1440" height="580" fill="url(#dreamGlow)"/>

        {/* Road ghost — continues TheRoad's fade seamlessly */}
        <rect x="694" y="0" width="52" height="580" fill="url(#roadGhost)"/>
        {/* Edge glow ghost */}
        <rect x="690" y="0" width="5" height="400" fill="url(#edgeGhost)"/>
        <rect x="745" y="0" width="5" height="400" fill="url(#edgeGhost)"/>

        {/* Yellow dashes ghost — fade in briefly then out */}
        <line x1="720" y1="70" x2="720" y2="200"
          stroke="url(#dashGhost)" strokeWidth="2.5" strokeDasharray="16 16"/>

        {/* Dashes → dots transition */}
        {[215,238,260,280,298,314,328,340].map((y,i) => (
          <circle key={i} cx="720" cy={y}
            r={Math.max(0.5, 2.2 - i*0.22)}
            fill={`rgba(255,210,0,${Math.max(0, 0.32 - i*0.04)})`}
          />
        ))}

        {/* Near stars — emerge right where dashes dissolve */}
        {nearStars.map((s,i) => (
          <circle key={`n${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o}/>
        ))}

        {/* Mid stars with twinkling */}
        {midStars.map((s,i) => (
          <circle key={`m${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o}
            style={{ animation:`twinkleE ${s.d}s ease-in-out infinite ${s.dl}s` }}/>
        ))}

        {/* Faint constellation lines */}
        {constellationLines.map(([a,b],i) => (
          <line key={`cl${i}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
            stroke="rgba(12,180,204,0.07)" strokeWidth="0.7"/>
        ))}

        {/* Far stars — full width, very sparse */}
        {farStars.map((s,i) => (
          <circle key={`f${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o}
            style={{ animation:`twinkleE ${s.d}s ease-in-out infinite ${s.dl}s` }}/>
        ))}

        {/* Vanishing point — where road fully dissolves */}
        <ellipse cx="720" cy="350" rx="55" ry="11" fill="url(#vpGlow)"/>
        <circle cx="720" cy="350" r="3"  fill="#0CB4CC" opacity="0.72"/>
        <circle cx="720" cy="350" r="7"  fill="#0CB4CC" opacity="0.16"/>
        <circle cx="720" cy="350" r="14" fill="#0CB4CC" opacity="0.06"/>

        {/* One subtle future flight arc */}
        <path d="M 560,440 Q 720,360 880,450"
          fill="none" stroke="rgba(12,180,204,0.06)" strokeWidth="1"
          strokeDasharray="5 14"/>

        {/* Soft bottom horizon glow */}
        <ellipse cx="720" cy="555" rx="480" ry="55" fill="rgba(12,180,204,0.05)"/>
      </svg>

      {/* Text and button */}
      <div style={{
        position:'absolute', bottom:55, left:0, right:0,
        display:'flex', flexDirection:'column', alignItems:'center', gap:20, zIndex:20,
      }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'0.58rem', letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(255,248,240,0.2)', marginBottom:8 }}>2027 a ďalej</div>
          <div style={{ fontSize:'0.9rem', color:'rgba(255,248,240,0.3)', fontStyle:'italic', fontWeight:300, letterSpacing:'0.02em' }}>
            Maldivy · Japonsko · Nórsko · Svet čaká
          </div>
        </div>
        <motion.button
          whileHover={{ scale:1.05, y:-3, boxShadow:'0 8px 36px rgba(12,180,204,0.42)' }}
          whileTap={{ scale:0.96 }}
          onClick={onAddTrip}
          style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'13px 34px', borderRadius:100, background:'linear-gradient(135deg,rgba(12,180,204,0.2),rgba(12,180,204,0.08))', border:'1px solid rgba(12,180,204,0.38)', color:'#3DCFE4', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', letterSpacing:'0.05em', boxShadow:'0 4px 20px rgba(12,180,204,0.15)' }}
        >
          <Plus size={16}/> Pridať novú cestu
        </motion.button>
      </div>

      <style>{`@keyframes twinkleE{0%,100%{opacity:inherit;}50%{opacity:0.03;}}`}</style>
    </div>
  )
}

// ─── Chapter atmosphere — decorative side elements per destination ─
// Renders full-viewport SVG behind everything, changes with scroll
function ChapterAtmosphere({ highlightedId }) {
  const [visible, setVisible] = useState(highlightedId)

  useEffect(() => {
    // Gentle delayed transition so chapter feels like it fades in
    const t = setTimeout(() => setVisible(highlightedId), 120)
    return () => clearTimeout(t)
  }, [highlightedId])

  // Which chapter are we in?
  const isTurkey    = visible === 'side-2019'
  const isMountains = visible === 'donovaly-2021'
  const isRoadtrip  = visible === 'slovinsko-taliansko-2022'
  const isCyprus    = visible?.startsWith('cyprus') || false
  const isRome      = visible === 'rim-2023'
  const isSpecial   = visible?.startsWith('special') || false

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1,
      pointerEvents:'none', overflow:'hidden',
      transition:'opacity 1.2s ease',
    }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
        viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">

        {/* ── TURKEY / SIDE — Ottoman arches, warm amber ── */}
        {isTurkey && <>
          {/* Large minaret silhouette — far left */}
          <g opacity="0.055" fill="#C17F3E">
            <rect x="60" y="200" width="28" height="600" rx="6"/>
            <ellipse cx="74" cy="200" rx="36" ry="26"/>
            <ellipse cx="74" cy="178" rx="18" ry="16"/>
            <circle  cx="74" cy="164" r="9"/>
            <rect    x="54" y="340" width="40" height="10" rx="5"/>
            {/* Arch below */}
            <path d="M30,800 L30,580 Q30,500 74,500 Q118,500 118,580 L118,800Z" opacity=".4"/>
          </g>
          {/* Smaller minaret — far right */}
          <g opacity="0.04" fill="#C17F3E">
            <rect x="1360" y="320" width="22" height="500" rx="5"/>
            <ellipse cx="1371" cy="320" rx="28" ry="20"/>
            <ellipse cx="1371" cy="304" rx="14" ry="12"/>
            <path d="M1345,800 L1345,540 Q1345,480 1371,480 Q1397,480 1397,540 L1397,800Z" opacity=".4"/>
          </g>
          {/* Warm amber glow — left side */}
          <radialGradient id="turkeyGlow" cx="0%" cy="60%" r="40%">
            <stop offset="0%" stopColor="#C17F3E" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#C17F3E" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#turkeyGlow)"/>
          {/* Faint sea waves bottom */}
          <path d="M0,860 Q180,840 360,860 Q540,880 720,858 Q900,836 1080,858 Q1260,880 1440,860 L1440,900 L0,900Z"
            fill="#C17F3E" opacity="0.03"/>
        </>}

        {/* ── SLOVAKIA / DONOVALY — mountains, forest green ── */}
        {isMountains && <>
          {/* Mountain range — left */}
          <g opacity="0.055" fill="#5B8C5A">
            <polygon points="0,900 120,420 240,900"/>
            <polygon points="60,900 180,520 300,900" opacity=".6"/>
            <polygon points="-40,900 80,600 200,900" opacity=".4"/>
            {/* Snow cap */}
            <polygon points="120,420 95,490 145,490" fill="rgba(255,255,255,0.4)"/>
          </g>
          {/* Mountain range — right */}
          <g opacity="0.045" fill="#5B8C5A">
            <polygon points="1200,900 1320,460 1440,900"/>
            <polygon points="1260,900 1380,540 1440,780"/>
            {/* Snow cap */}
            <polygon points="1320,460 1295,530 1345,530" fill="rgba(255,255,255,0.35)"/>
          </g>
          {/* Pine trees — scattered */}
          {[80,140,200,1260,1340,1410].map((x,i) => (
            <g key={i} opacity="0.04" fill="#5B8C5A">
              <polygon points={`${x},900 ${x-12},820 ${x+12},820`}/>
              <polygon points={`${x},840 ${x-16},760 ${x+16},760`}/>
              <polygon points={`${x},790 ${x-20},700 ${x+20},700`}/>
              <rect x={x-4} y="820" width="8" height="80"/>
            </g>
          ))}
          {/* Green tint */}
          <radialGradient id="mountainGlow" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#5B8C5A" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#5B8C5A" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#mountainGlow)"/>
        </>}

        {/* ── SLOVENIA & ITALY ROAD TRIP — bridge, purple ── */}
        {isRoadtrip && <>
          {/* Arch bridge — left side */}
          <g opacity="0.05" fill="none" stroke="#7B5EA7" strokeWidth="8" strokeLinecap="round">
            <path d="M-60,750 Q120,400 300,750"/>
            <path d="M0,750 Q120,480 240,750" strokeWidth="5"/>
            <line x1="120" y1="405" x2="120" y2="750" strokeWidth="4"/>
            <line x1="60"  y1="575" x2="60"  y2="750" strokeWidth="3"/>
            <line x1="180" y1="575" x2="180" y2="750" strokeWidth="3"/>
          </g>
          {/* Winding road — right */}
          <g opacity="0.04" fill="none" stroke="#7B5EA7" strokeWidth="6" strokeDasharray="20 15">
            <path d="M1440,300 Q1300,400 1350,550 Q1400,700 1260,800 Q1120,900 1200,900"/>
          </g>
          {/* Alps silhouette — faint right side */}
          <g opacity="0.04" fill="#7B5EA7">
            <polygon points="1100,900 1260,500 1420,900"/>
            <polygon points="1200,900 1340,580 1440,900" opacity=".6"/>
            <polygon points="1260,500 1230,560 1290,560" fill="rgba(255,255,255,0.3)"/>
          </g>
          {/* Purple tint */}
          <radialGradient id="roadtripGlow" cx="20%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#7B5EA7" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#7B5EA7" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#roadtripGlow)"/>
        </>}

        {/* ── CYPRUS — sea waves, palm, turquoise ── */}
        {isCyprus && <>
          {/* Sea wave layers — bottom */}
          <path d="M0,820 Q180,795 360,820 Q540,845 720,818 Q900,791 1080,818 Q1260,845 1440,820 L1440,900 L0,900Z"
            fill="#0CB4CC" opacity="0.05"/>
          <path d="M0,850 Q200,830 400,852 Q600,874 800,848 Q1000,822 1200,848 Q1400,874 1440,850 L1440,900 L0,900Z"
            fill="#0CB4CC" opacity="0.04"/>
          <path d="M0,875 Q240,860 480,878 Q720,896 960,874 Q1200,852 1440,875 L1440,900 L0,900Z"
            fill="#0CB4CC" opacity="0.06"/>
          {/* Palm tree — left */}
          <g opacity="0.05">
            <path d="M80,900 Q76,720 82,600 Q86,530 80,480" stroke="#0CB4CC" strokeWidth="12" fill="none" strokeLinecap="round"/>
            <path d="M80,510 Q30,480 -10,510"  stroke="#0CB4CC" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M80,510 Q55,460 20,440"   stroke="#0CB4CC" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M80,510 Q110,455 150,460" stroke="#0CB4CC" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M80,510 Q120,500 160,520" stroke="#0CB4CC" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <ellipse cx="80" cy="895" rx="55" ry="10" fill="#0CB4CC"/>
          </g>
          {/* Palm tree — right */}
          <g opacity="0.04">
            <path d="M1380,900 Q1376,740 1382,620 Q1386,555 1380,510" stroke="#0CB4CC" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <path d="M1380,530 Q1330,500 1290,520" stroke="#0CB4CC" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <path d="M1380,530 Q1410,480 1440,470" stroke="#0CB4CC" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <path d="M1380,530 Q1420,520 1440,540" stroke="#0CB4CC" strokeWidth="6" fill="none" strokeLinecap="round"/>
          </g>
          {/* Sun shimmer on water */}
          <ellipse cx="720" cy="890" rx="200" ry="15" fill="#0CB4CC" opacity="0.04"/>
          {/* Turquoise ambient */}
          <radialGradient id="cyprusGlow" cx="50%" cy="100%" r="55%">
            <stop offset="0%" stopColor="#0CB4CC" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#0CB4CC" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#cyprusGlow)"/>
        </>}

        {/* ── ROME — Colosseum arches, warm amber ── */}
        {isRome && <>
          {/* Large Colosseum silhouette — left */}
          <g opacity="0.05" fill="#C17F3E">
            <ellipse cx="150" cy="700" rx="148" ry="100"/>
            <ellipse cx="150" cy="700" rx="100" ry="62" fill="#060D1A"/>
            <rect x="2" y="600" width="296" height="32" rx="4"/>
            <rect x="2"   y="600" width="36" height="200" rx="4"/>
            <rect x="264" y="600" width="36" height="200" rx="4"/>
            {/* Arch openings */}
            <path d="M48,800 L48,660 Q48,620 80,620 Q112,620 112,660 L112,800" fill="#060D1A" opacity=".7"/>
            <path d="M120,800 L120,660 Q120,620 150,620 Q180,620 180,660 L180,800" fill="#060D1A" opacity=".7"/>
            <path d="M188,800 L188,660 Q188,620 220,620 Q252,620 252,660 L252,800" fill="#060D1A" opacity=".7"/>
          </g>
          {/* Ancient arch — right */}
          <g opacity="0.04" fill="none" stroke="#C17F3E" strokeWidth="10" strokeLinecap="round">
            <path d="M1260,900 L1260,600 Q1260,500 1350,500 Q1440,500 1440,600 L1440,900"/>
            <path d="M1290,900 L1290,640 Q1290,560 1350,560 Q1410,560 1410,640 L1410,900"/>
          </g>
          {/* Warm amber tint */}
          <radialGradient id="romeGlow" cx="15%" cy="70%" r="40%">
            <stop offset="0%" stopColor="#C17F3E" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#C17F3E" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#romeGlow)"/>
        </>}

        {/* ── SPECIAL MOMENTS — warm coral glow, hearts ── */}
        {isSpecial && <>
          <radialGradient id="specialGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0"/>
          </radialGradient>
          <rect x="0" y="0" width="1440" height="900" fill="url(#specialGlow)"/>
          {/* Subtle heart shapes — far sides */}
          {[[60,400],[1380,300],[80,650],[1360,580]].map(([x,y],i) => (
            <path key={i} opacity="0.04" fill="#FF6B6B"
              d={`M${x},${y+12} C${x},${y} ${x-15},${y-14} ${x-15},${y+4} C${x-15},${y+18} ${x},${y+30} ${x},${y+30} C${x},${y+30} ${x+15},${y+18} ${x+15},${y+4} C${x+15},${y-14} ${x},${y} ${x},${y+12}Z`}
              transform={`scale(${1.5 + i*0.3})`}
            />
          ))}
        </>}

      </svg>
    </div>
  )
}
function LandmarksRow() {
  const items = [
    { label:'Bratislava', color:'#0CB4CC', svg: <svg width="50" height="84" viewBox="0 0 55 90" fill="#0CB4CC"><rect x="5" y="50" width="45" height="40" rx="2"/><rect x="12" y="35" width="31" height="20"/><rect x="8" y="20" width="8" height="18"/><rect x="39" y="20" width="8" height="18"/><rect x="22" y="10" width="11" height="26"/><rect x="24" y="2" width="7" height="12"/></svg> },
    { label:'Donovaly',   color:'#5B8C5A', svg: <svg width="72" height="84" viewBox="0 0 80 90" fill="#5B8C5A"><polygon points="40,5 0,90 80,90"/><polygon points="15,30 -10,90 40,90" opacity=".55"/><polygon points="65,25 40,90 90,90" opacity=".55"/></svg> },
    { label:'Taliansko',  color:'#7B5EA7', svg: <svg width="62" height="84" viewBox="0 0 70 90" fill="none" stroke="#7B5EA7" strokeWidth="3" strokeLinecap="round"><path d="M5,90 Q5,40 35,20 Q65,40 65,90"/><path d="M15,90 Q15,50 35,35 Q55,50 55,90"/><line x1="5" y1="65" x2="65" y2="65"/><path d="M25,80 Q35,72 45,80" fill="#7B5EA7" stroke="none"/></svg> },
    { label:'Rím',        color:'#C17F3E', svg: <svg width="80" height="74" viewBox="0 0 90 80" fill="#C17F3E"><ellipse cx="45" cy="45" rx="44" ry="30"/><ellipse cx="45" cy="45" rx="30" ry="18" fill="#060D1A"/><rect x="1" y="15" width="88" height="9" rx="2"/><rect x="1" y="15" width="12" height="65" rx="2"/><rect x="77" y="15" width="12" height="65" rx="2"/></svg> },
    { label:'Cyprus',     color:'#0CB4CC', svg: <svg width="56" height="84" viewBox="0 0 65 90" fill="none"><path d="M32,90 Q30,60 33,35 Q35,20 32,10" stroke="#0CB4CC" strokeWidth="4" strokeLinecap="round"/><path d="M32,18 Q18,10 5,18" stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/><path d="M32,18 Q28,4 18,0" stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/><path d="M32,18 Q40,5 50,8" stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/><path d="M32,18 Q46,14 60,10" stroke="#0CB4CC" strokeWidth="3" strokeLinecap="round"/><ellipse cx="32" cy="87" rx="22" ry="5" fill="#0CB4CC" opacity=".45"/></svg> },
    { label:'Svet čaká',  color:'#FF9B9B', svg: <svg width="48" height="84" viewBox="0 0 55 90" fill="#FF9B9B"><polygon points="27,2 20,40 34,40"/><polygon points="27,38 12,70 42,70"/><rect x="8" y="68" width="39" height="6" rx="2"/><polygon points="27,72 5,90 49,90"/><rect x="20" y="36" width="15" height="6" rx="2"/><rect x="5" y="46" width="45" height="4" rx="2"/></svg> },
  ]
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:4, paddingTop:32, height:124, overflow:'hidden' }}>
      {items.map(({ label, color, svg }) => (
        <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', opacity:0.18, transition:'opacity 0.3s', flexShrink:0, cursor:'default' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.45'}
          onMouseLeave={e => e.currentTarget.style.opacity='0.18'}
        >
          {svg}
          <span style={{ fontSize:7, letterSpacing:'0.12em', textTransform:'uppercase', color, marginTop:3, opacity:0.65 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Build rows ───────────────────────────────────────────────
function buildRows(sorted) {
  const items = [
    ...sorted.map(t => ({ type:'trip', date:t.dateFrom, data:t })),
    ...SPECIAL_MOMENTS.map(m => ({ type:'special', date:m.date, data:m })),
  ].sort((a,b) => new Date(a.date) - new Date(b.date))
  const rows = [], sides = ['right','left','right','left','right','left','right','left','right','left']
  let prevYear = null, sideIdx = 0
  for (const item of items) {
    const year = getYear(item.date)
    if (prevYear !== null && year > prevYear+1) {
      for (let y=prevYear+1; y<year; y++) {
        rows.push({ type:'yeargap', year:y, note:y===2020?'COVID · doma':undefined, date:`${y}-06-01` })
      }
    }
    if (item.type==='trip') rows.push({ ...item, side:sides[sideIdx++%sides.length], year })
    else rows.push({ ...item, side:'right', year })
    prevYear = year
  }
  return rows
}

// ─── Main ─────────────────────────────────────────────────────
export default function Timeline() {
  const navigate  = useNavigate()
  const isMobile  = useMobile()
  const [trips,  setTrips]  = useState(loadTrips)
  const [bucket, setBucket] = useState(loadBucket)
  const [showBucket,  setShowBucket]  = useState(false)
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const [scrollGlowPct, setScrollGlowPct] = useState(0)
  const milestoneRefs = useRef({})

  const sorted = [...trips].sort((a,b) => new Date(a.dateFrom)-new Date(b.dateFrom))
  const rows   = buildRows(sorted)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id   = e.target.dataset.id
          setHighlightedId(id)
          const rect = e.target.getBoundingClientRect()
          const midY = window.scrollY + rect.top + rect.height/2
          setScrollGlowPct(midY / document.documentElement.scrollHeight)
        }
      })
    }, { threshold:0.5 })
    Object.values(milestoneRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [rows.length])

  function handleSaveTrips(u)  { setTrips(u);  saveTrips(u) }
  function handleSaveBucket(u) { setBucket(u); saveBucket(u) }
  function createTripFromBucket(item) { setShowBucket(false); setTimeout(()=>setShowNewTrip({prefill:item}),300) }
  function addNewTrip(tripData) {
    handleSaveTrips([...trips,{ ...tripData, id:generateId(), modules:Object.fromEntries(ALL_MODULES.map(m=>[m.id,true])), highlight:'', bestMoment:'', bestRestaurant:'' }])
    setShowNewTrip(false)
  }

  const PAD = isMobile ? '0 26px' : '0 46px'

  return (
    <div style={{ minHeight:'100vh', position:'relative', overflowX:'hidden' }}>

      {/* Fixed map background */}
      <MapBackground/>

      {/* Chapter atmosphere — destination-specific decorative side elements */}
      <ChapterAtmosphere highlightedId={highlightedId}/>

      <style>{`
        @keyframes activeGlowDot{
          0%,100%{box-shadow:0 0 0 4px #060D1A,0 0 0 8px rgba(12,180,204,.55),0 0 40px rgba(12,180,204,.7),0 0 80px rgba(12,180,204,.3);}
          50%{box-shadow:0 0 0 4px #060D1A,0 0 0 12px rgba(12,180,204,.75),0 0 65px rgba(12,180,204,.9),0 0 120px rgba(12,180,204,.4);}
        }
        @keyframes sonar1{0%{transform:translate(-50%,-50%) scale(1);opacity:0.6;}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0;}}
        @keyframes sonar2{0%{transform:translate(-50%,-50%) scale(1);opacity:0.4;}100%{transform:translate(-50%,-50%) scale(1.7);opacity:0;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.22;}}
        @keyframes planeFly{0%{transform:translateX(-60px) translateY(8px);}100%{transform:translateX(calc(100vw + 60px)) translateY(-10px);}}
        @keyframes shimmerText{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes stripeShimmer{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}
      `}</style>

      {/* Content layer — sits above fixed background */}
      <div style={{ position:'relative', zIndex:2 }}>

        {/* Header */}
        <header style={{ position:'relative', zIndex:10, textAlign:'center', padding:'58px 20px 0', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:700, height:300, background:'radial-gradient(ellipse,rgba(12,180,204,0.14) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:32, left:0, right:0, height:36, overflow:'hidden', pointerEvents:'none' }}>
            <span style={{ fontSize:20, position:'absolute', left:0, top:0, animation:'planeFly 14s linear infinite' }}>✈️</span>
          </div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'#0CB4CC', opacity:0.75, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <span style={{ width:26, height:1, background:'#0CB4CC', opacity:0.4, display:'inline-block' }}/>Naše cesty<span style={{ width:26, height:1, background:'#0CB4CC', opacity:0.4, display:'inline-block' }}/>
          </div>
          <h1 style={{ fontSize:'clamp(2.2rem,6vw,4.4rem)', fontWeight:900, lineHeight:1, letterSpacing:'-0.02em', margin:0 }}>
            <span style={{ background:'linear-gradient(120deg,#fff 30%,#3DCFE4 50%,#fff 70%)', backgroundSize:'300% 100%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'shimmerText 4s ease-in-out infinite' }}>ForeverN</span>
            <span style={{ display:'block', fontSize:'clamp(0.85rem,2.2vw,1.4rem)', fontWeight:300, letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(255,248,240,0.32)', marginTop:4 }}>Travels</span>
          </h1>
          <p style={{ fontSize:'clamp(0.72rem,1.8vw,0.9rem)', color:'rgba(255,248,240,0.38)', fontStyle:'italic', marginTop:12, fontWeight:300 }}>
            Norbi · Natalita · Elizabethka — spomienky, ktoré trvajú navždy
          </p>

          {/* Route line connecting header to road */}
          <div style={{ position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)', width:2, height:40, background:'linear-gradient(180deg,rgba(12,180,204,0.5),rgba(12,180,204,0.1))', pointerEvents:'none' }}/>

          <LandmarksRow/>
        </header>

        {/* Wave transition header → timeline */}
        <div style={{ height:60, marginTop:-6, overflow:'hidden', position:'relative', zIndex:6 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%' }}>
            <path d="M0,60 Q120,18 240,42 Q360,60 480,30 Q600,8 720,38 Q840,60 960,28 Q1080,4 1200,38 Q1320,60 1440,28 L1440,60 Z" fill="rgba(12,180,204,0.055)"/>
            <path d="M0,60 Q180,32 360,50 Q540,64 720,42 Q900,22 1080,50 Q1260,66 1440,44 L1440,60 Z" fill="rgba(12,180,204,0.035)"/>
          </svg>
        </div>

        {/* Timeline */}
        <div style={{ position:'relative', maxWidth:900, margin:'0 auto', padding:'0 16px 0' }}>

          <TheRoad isMobile={isMobile} scrollGlowPct={scrollGlowPct}/>

          {rows.map((row, idx) => {

            if (row.type==='yeargap') return (
              <div key={`gap-${row.year}`} style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', height:52 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'rgba(12,180,204,0.15)', border:'1px solid rgba(12,180,204,0.3)', boxShadow:'0 0 8px rgba(12,180,204,0.2), 0 0 0 3px #060D1A', zIndex:12 }}/>
                <span style={{ position:'absolute', right:'calc(50% + 36px)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,248,240,0.2)' }}>{row.year}</span>
                {row.note && <span style={{ position:'absolute', left:'calc(50% + 36px)', fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,248,240,0.16)' }}>{row.note}</span>}
              </div>
            )

            if (row.type==='special') {
              const m=row.data, uid=`special-${m.date}`
              const showYear = !rows.some((r,ri)=>ri<idx&&r.year===row.year)
              const isHigh = highlightedId===uid
              const accent = m.icon === '👶' ? 'rgba(255,182,193,' : 'rgba(255,107,107,'
              return (
                <div key={uid} data-id={uid} ref={el=>milestoneRefs.current[uid]=el}
                  style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', minHeight:160, padding:'18px 0' }}>
                  <div style={{ flex:1 }}/>
                  <MilestoneDot trip={null} isActive={false} isSpecial specialData={m} isHighlighted={isHigh} year={row.year} showYear={showYear}/>
                  <div style={{ flex:1, display:'flex', justifyContent:'flex-start', padding:PAD, position:'relative' }}>
                    {/* Connector — brightens on highlight */}
                    <div style={{
                      position:'absolute', left:isMobile?14:26, top:'50%',
                      width:isMobile?22:38, height: isHigh ? 2 : 1,
                      background:`linear-gradient(90deg,${accent}${isHigh?'0.7)':'0.35)'},transparent)`,
                      pointerEvents:'none',
                      transition:'height 0.3s, background 0.3s',
                    }}/>
                    <SpecialCard moment={m}/>
                  </div>
                </div>
              )
            }

            if (row.type==='trip') {
              const trip=row.data, isAct=statusOf(trip)==='active'
              const isHigh=highlightedId===trip.id
              const showYear=!rows.some((r,ri)=>ri<idx&&r.year===row.year&&(r.type==='trip'||r.type==='special'))
              const goLeft=!isMobile&&row.side==='left'
              const tripColor = DEST[trip.id]?.color || 'rgba(255,255,255,0.12)'
              const connectorOpacity = isHigh ? '0.65' : '0.35'
              const connectorH      = isHigh ? 2 : 1

              return (
                <div key={trip.id} data-id={trip.id} ref={el=>milestoneRefs.current[trip.id]=el}
                  style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', minHeight:isAct?290:215, padding:'24px 0' }}>
                  {goLeft ? (
                    <>
                      <div style={{ flex:1, display:'flex', justifyContent:'flex-end', padding:PAD, position:'relative' }}>
                        {/* Connector — brightens + thickens when highlighted */}
                        <div style={{
                          position:'absolute', right:isMobile?14:26, top:'50%',
                          width:isMobile?22:38, height:connectorH,
                          background:`linear-gradient(90deg,transparent,${tripColor}${connectorOpacity})`,
                          pointerEvents:'none', transition:'height 0.3s, background 0.3s',
                          boxShadow: isHigh ? `0 0 6px ${tripColor}55` : 'none',
                        }}/>
                        <TripCard trip={trip} isActive={isAct} isHighlighted={isHigh} side="left" onNavigate={()=>navigate(`/trip/${trip.id}`)}/>
                      </div>
                      <MilestoneDot trip={trip} isActive={isAct} isHighlighted={isHigh} year={row.year} showYear={showYear} onNavigate={()=>navigate(`/trip/${trip.id}`)}/>
                      <div style={{ flex:1 }}/>
                    </>
                  ) : (
                    <>
                      <div style={{ flex:1 }}/>
                      <MilestoneDot trip={trip} isActive={isAct} isHighlighted={isHigh} year={row.year} showYear={showYear} onNavigate={()=>navigate(`/trip/${trip.id}`)}/>
                      <div style={{ flex:1, display:'flex', justifyContent:'flex-start', padding:PAD, position:'relative' }}>
                        {/* Connector */}
                        <div style={{
                          position:'absolute', left:isMobile?14:26, top:'50%',
                          width:isMobile?22:38, height:connectorH,
                          background:`linear-gradient(90deg,${tripColor}${connectorOpacity},transparent)`,
                          pointerEvents:'none', transition:'height 0.3s, background 0.3s',
                          boxShadow: isHigh ? `0 0 6px ${tripColor}55` : 'none',
                        }}/>
                        <TripCard trip={trip} isActive={isAct} isHighlighted={isHigh} side="right" onNavigate={()=>navigate(`/trip/${trip.id}`)}/>
                      </div>
                    </>
                  )}
                </div>
              )
            }

            return null
          })}
        </div>

        {/* Journey ending — road dissolves into constellation */}
        <JourneyEnding onAddTrip={()=>setShowNewTrip(true)}/>

        {/* Floating bucket list */}
        <motion.button
          whileHover={{ scale:1.07, y:-3 }} whileTap={{ scale:0.95 }}
          onClick={()=>setShowBucket(true)}
          style={{ position:'fixed', bottom:26, right:22, zIndex:50, display:'flex', alignItems:'center', gap:7, padding:'11px 22px', borderRadius:100, background:'linear-gradient(135deg,#FF6B6B,#FF9B9B)', boxShadow:'0 4px 24px rgba(255,107,107,0.42),0 0 60px rgba(255,107,107,0.14)', color:'#fff', fontSize:'0.78rem', fontWeight:800, cursor:'pointer', letterSpacing:'0.04em', border:'1px solid rgba(255,255,255,0.14)' }}
        >✨ Bucket list</motion.button>

        <AnimatePresence>
          {showBucket && <BucketModal bucket={bucket} onSave={handleSaveBucket} onClose={()=>setShowBucket(false)} onPlanTrip={createTripFromBucket}/>}
          {showNewTrip && <NewTripModal prefill={showNewTrip?.prefill} onSave={addNewTrip} onClose={()=>setShowNewTrip(false)}/>}
        </AnimatePresence>
      </div>
    </div>
  )
}
