import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const DEPARTURE = new Date('2026-07-25T06:00:00')
const RETURN    = new Date('2026-08-05T23:59:00')

function getPhase() {
  const now = new Date()
  if (now < DEPARTURE) return 'before'
  if (now <= RETURN)   return 'during'
  return 'after'
}

function getTimeLeft() {
  const now  = new Date()
  const diff = DEPARTURE - now
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  }
}

function getDaysOnHoliday() {
  return Math.floor((new Date() - DEPARTURE) / 86400000) + 1
}

function getDaysLeft() {
  return Math.max(0, Math.floor((RETURN - new Date()) / 86400000))
}

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  size:     Math.random() * 3 + 1.5,
  left:     Math.random() * 100,
  delay:    Math.random() * 12,
  duration: Math.random() * 8 + 8,
  opacity:  Math.random() * 0.45 + 0.25,
}))

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  size:    Math.random() * 1.5 + 0.5,
  left:    Math.random() * 100,
  top:     Math.random() * 65,
  opacity: Math.random() * 0.35 + 0.08,
}))

function CountBox({ value, label }) {
  return (
    <div className="glass-box flex flex-col items-center justify-center px-3 py-3 min-w-[64px] md:min-w-[82px]">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="text-2xl md:text-4xl font-bold text-white tabular-nums leading-none"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-[9px] md:text-[10px] font-semibold mt-1.5 uppercase tracking-widest opacity-65"
            style={{ color: '#3DCFE4' }}>
        {label}
      </span>
    </div>
  )
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.13 } } }
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22,1,0.36,1] } } }

export default function Landing() {
  const navigate   = useNavigate()
  const [tl, setTl] = useState(getTimeLeft())
  const phase      = getPhase()

  useEffect(() => {
    if (phase !== 'before') return
    const t = setInterval(() => setTl(getTimeLeft()), 1000)
    return () => clearInterval(t)
  }, [phase])

  const msg = useMemo(() => {
    if (phase === 'during') return {
      title: `Deň ${getDaysOnHoliday()} — ste v raji! 🌊`,
      sub:   `Ešte ${getDaysLeft()} úžasných dní slnka a mora. Každá chvíľa sa počíta — užívajte naplno! ☀️`,
      cta:   'Otvoriť aplikáciu',
    }
    if (phase === 'after') return {
      title: 'Vitajte doma! 🏠❤️',
      sub:   'Aká bude ďalšia zastávka? Svet na vás čaká — pozrite sa na váš bucket list. 🌍',
      cta:   'Pozrieť cesty',
    }
    return { title: null, sub: 'Naše cesty, naše spomienky.', cta: 'Vstúpiť do aplikácie' }
  }, [phase])

  return (
    <div className="landing-bg relative flex items-center justify-center min-h-screen overflow-hidden select-none">

      {/* Particles */}
      {PARTICLES.map(p => (
        <span key={p.id} className="particle" style={{
          width:`${p.size}px`, height:`${p.size}px`, left:`${p.left}%`, bottom:'-20px',
          animationDelay:`${p.delay}s`, animationDuration:`${p.duration}s`, opacity:p.opacity,
        }}/>
      ))}

      {/* Stars */}
      {STARS.map(s => (
        <span key={s.id} className="absolute rounded-full bg-white pointer-events-none" style={{
          width:`${s.size}px`, height:`${s.size}px`, left:`${s.left}%`, top:`${s.top}%`, opacity:s.opacity,
        }}/>
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-lg w-full"
        variants={stagger} initial="hidden" animate="visible"
      >
        {/* Icon */}
        <motion.div variants={fadeUp} className="mb-7">
          <div className="w-14 h-14 rounded-2xl glass-box flex items-center justify-center mx-auto text-2xl">
            ✈️
          </div>
        </motion.div>

        {/* Title block */}
        {phase === 'before' ? (
          <>
            <motion.div variants={fadeUp} className="mb-1">
              <h1 className="shimmer-text text-6xl md:text-8xl font-extrabold leading-none tracking-tight">
                ForeverN
              </h1>
            </motion.div>
            <motion.div variants={fadeUp} className="mb-7">
              <p className="text-2xl md:text-3xl font-light tracking-[0.22em] uppercase text-white/45">
                Travels
              </p>
            </motion.div>
          </>
        ) : (
          <motion.div variants={fadeUp} className="mb-7">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-snug">
              {msg.title}
            </h1>
          </motion.div>
        )}

        {/* Sub */}
        <motion.div variants={fadeUp} className="mb-10">
          <p className="text-sm md:text-base text-white/42 font-light italic leading-relaxed max-w-sm">
            {msg.sub}
          </p>
        </motion.div>

        {/* Countdown */}
        {phase === 'before' && tl && (
          <motion.div variants={fadeUp} className="mb-10 w-full">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/32 font-semibold mb-4">
              Odlet o
            </p>
            <div className="flex items-start justify-center gap-2 md:gap-3">
              <CountBox value={tl.days}    label="Dní"    />
              <span className="text-xl font-bold text-white/22 mt-3">:</span>
              <CountBox value={tl.hours}   label="Hodín"  />
              <span className="text-xl font-bold text-white/22 mt-3">:</span>
              <CountBox value={tl.minutes} label="Minút"  />
              <span className="text-xl font-bold text-white/22 mt-3">:</span>
              <CountBox value={tl.seconds} label="Sekúnd" />
            </div>
            <p className="text-[9px] text-white/18 mt-4 tracking-widest uppercase">
              Protaras · Cyprus · Silver Sands · 25.7.2026
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('/timeline')}
            className="glow-btn inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base tracking-wide"
          >
            {msg.cta}
            <ArrowRight size={17} />
          </button>
        </motion.div>
      </motion.div>

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height:'130px' }}>
        <svg className="wave-svg wave-3 absolute bottom-0" viewBox="0 0 1440 130" preserveAspectRatio="none" style={{height:'88px'}}>
          <path fill="#0A1628" d="M0,45 C180,95 360,15 540,55 C720,95 900,20 1080,58 C1260,95 1350,32 1440,52 L1440,130 L0,130 Z M1440,45 C1260,95 1080,15 900,55 C720,95 540,20 360,58 C180,95 90,32 0,52 L0,130 L1440,130 Z"/>
        </svg>
        <svg className="wave-svg wave-2 absolute bottom-0" viewBox="0 0 1440 130" preserveAspectRatio="none" style={{height:'105px'}}>
          <path fill="rgba(10,26,40,0.55)" d="M0,65 C200,22 400,105 600,62 C800,20 1000,92 1200,58 C1350,32 1400,72 1440,62 L1440,130 L0,130 Z M1440,65 C1240,22 1040,105 840,62 C640,20 440,92 240,58 C90,32 40,72 0,62 L0,130 L1440,130 Z"/>
        </svg>
        <svg className="wave-svg wave-1 absolute bottom-0" viewBox="0 0 1440 130" preserveAspectRatio="none" style={{height:'125px'}}>
          <path fill="rgba(6,78,98,0.28)" d="M0,85 C240,42 480,115 720,72 C960,30 1200,98 1440,68 L1440,130 L0,130 Z M1440,85 C1200,42 960,115 720,72 C480,30 240,98 0,68 L0,130 L1440,130 Z"/>
        </svg>
      </div>
    </div>
  )
}
