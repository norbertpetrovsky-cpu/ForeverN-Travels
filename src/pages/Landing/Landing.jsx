import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'

// Departure: July 25, 2026 at 06:00 Bratislava time
const DEPARTURE = new Date('2026-07-25T06:00:00')

function getTimeLeft() {
  const now = new Date()
  const diff = DEPARTURE - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

// Generate stable particle configs
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size:  Math.random() * 3 + 1.5,
  left:  Math.random() * 100,
  delay: Math.random() * 10,
  duration: Math.random() * 8 + 8,
  opacity: Math.random() * 0.5 + 0.3,
}))

function CountBox({ value, label }) {
  const [displayed, setDisplayed] = useState(value)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (value !== displayed) {
      setAnimKey(k => k + 1)
      setDisplayed(value)
    }
  }, [value])

  return (
    <div className="glass-box flex flex-col items-center justify-center px-4 py-4 min-w-[70px] md:min-w-[90px]">
      <motion.span
        key={animKey}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl md:text-5xl font-bold text-white tabular-nums leading-none"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-[10px] md:text-xs font-medium mt-2 uppercase tracking-widest text-turquoise-light opacity-80">
        {label}
      </span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  }

  const itemVariants = {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <div className="landing-bg relative flex items-center justify-center min-h-screen overflow-hidden select-none">

      {/* ── Particles ── */}
      {PARTICLES.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            width:           `${p.size}px`,
            height:          `${p.size}px`,
            left:            `${p.left}%`,
            bottom:          '-20px',
            animationDelay:  `${p.delay}s`,
            animationDuration:`${p.duration}s`,
            opacity:         p.opacity,
          }}
        />
      ))}

      {/* ── Stars (small fixed dots) ── */}
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={`star-${i}`}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width:   `${Math.random() * 1.5 + 0.5}px`,
            height:  `${Math.random() * 1.5 + 0.5}px`,
            left:    `${Math.random() * 100}%`,
            top:     `${Math.random() * 60}%`,
            opacity: Math.random() * 0.4 + 0.1,
          }}
        />
      ))}

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Location badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 glass-box px-4 py-2 mb-8 text-turquoise-light text-xs font-semibold uppercase tracking-[0.18em]">
            <MapPin size={12} className="text-coral" />
            Protaras · Cyprus · Silver Sands
          </div>
        </motion.div>

        {/* Main title */}
        <motion.div variants={itemVariants} className="mb-2">
          <h1 className="shimmer-text text-6xl md:text-8xl font-extrabold leading-none tracking-tight">
            ForeverN
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-2xl md:text-3xl font-light tracking-[0.25em] uppercase text-white/60">
            Travels
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemVariants} className="mb-12">
          <p className="text-base md:text-lg text-white/50 font-light italic leading-relaxed">
            Naše cesty, naše spomienky.
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div variants={itemVariants} className="mb-4 w-full">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium mb-4">
            Odlet o
          </p>
          <div className="flex items-start justify-center gap-3 md:gap-4">
            <CountBox value={timeLeft.days}    label="Dní" />
            <div className="text-2xl font-bold text-white/30 mt-4">:</div>
            <CountBox value={timeLeft.hours}   label="Hodín" />
            <div className="text-2xl font-bold text-white/30 mt-4">:</div>
            <CountBox value={timeLeft.minutes} label="Minút" />
            <div className="text-2xl font-bold text-white/30 mt-4">:</div>
            <CountBox value={timeLeft.seconds} label="Sekúnd" />
          </div>
          <p className="text-xs text-white/25 mt-4 tracking-wide">
            25. júla 2026 · Bratislava → Larnaka
          </p>
        </motion.div>

        {/* Enter button */}
        <motion.div variants={itemVariants} className="mt-8">
          <button
            onClick={() => navigate('/domov')}
            className="glow-btn inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base tracking-wide"
          >
            Vstúpiť do aplikácie
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Family names */}
        <motion.div variants={itemVariants} className="mt-10">
          <p className="text-xs text-white/20 font-light tracking-widest uppercase">
            Norbi · Natalita · Elizabethka
          </p>
        </motion.div>
      </motion.div>

      {/* ── Animated Waves ── */}
      <div className="wave-container" style={{ height: '120px' }}>
        {/* Wave 3 — darkest, front */}
        <svg className="wave-svg wave-3 absolute bottom-0" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path
            fill="#0A1628"
            d="M0,40 C180,90 360,10 540,50 C720,90 900,20 1080,55 C1260,90 1350,30 1440,50 L1440,120 L0,120 Z
               M1440,40 C1260,90 1080,10 900,50 C720,90 540,20 360,55 C180,90 90,30 0,50 L0,120 L1440,120 Z"
          />
        </svg>
        {/* Wave 2 — medium */}
        <svg className="wave-svg wave-2 absolute bottom-0" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '100px' }}>
          <path
            fill="rgba(10,26,40,0.6)"
            d="M0,60 C200,20 400,100 600,60 C800,20 1000,90 1200,55 C1350,30 1400,70 1440,60 L1440,120 L0,120 Z
               M1440,60 C1240,20 1040,100 840,60 C640,20 440,90 240,55 C90,30 40,70 0,60 L0,120 L1440,120 Z"
          />
        </svg>
        {/* Wave 1 — lightest, back */}
        <svg className="wave-svg wave-1 absolute bottom-0" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path
            fill="rgba(6,78,98,0.35)"
            d="M0,80 C240,40 480,110 720,70 C960,30 1200,95 1440,65 L1440,120 L0,120 Z
               M1440,80 C1200,40 960,110 720,70 C480,30 240,95 0,65 L0,120 L1440,120 Z"
          />
        </svg>
      </div>
    </div>
  )
}
