import { motion } from 'framer-motion'
import { Sun, Plane, MapPin, CalendarDays } from 'lucide-react'

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Home() {
  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1,  y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-2"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-turquoise mb-1">
          Vitaj späť
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Ahoj, Norbi! 👋
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Priprav sa na Cyprus 2026 — tu je prehľad tvojej dovolenky.
        </p>
      </motion.div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Plane,        label: 'Odlet',       value: '25. júla',   sub: '2026',           color: 'text-turquoise' },
          { icon: MapPin,       label: 'Destinácia',  value: 'Protaras',   sub: 'Cyprus 🇨🇾',       color: 'text-coral'     },
          { icon: CalendarDays, label: 'Nocí',        value: '11 nocí',    sub: 'Silver Sands',   color: 'text-turquoise' },
          { icon: Sun,          label: 'Počasie',     value: '~34°C',      sub: 'Slnečno ☀️',      color: 'text-coral'     },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="card p-5"
            >
              <Icon size={20} className={`${card.color} mb-3`} strokeWidth={1.8} />
              <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-1">
                {card.label}
              </p>
              <p className="text-lg font-bold text-white leading-tight">{card.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{card.sub}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Coming soon notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="coming-soon-card"
      >
        <div className="text-4xl mb-4">🏖️</div>
        <h3 className="text-xl font-bold text-white mb-2">Dashboard — prichádza čoskoro</h3>
        <p className="text-white/40 text-sm max-w-sm mx-auto">
          V ďalšom kroku tu bude živý odpočet, prehľad balenia, dnešný plán a rýchle skratky.
        </p>
      </motion.div>
    </div>
  )
}
