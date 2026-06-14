import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

export default function Cesty() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-turquoise mb-1">Cestovný denník</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Cesty</h1>
        <p className="text-white/40 text-sm mb-8">Všetky naše dovolenky + bucket list budúcich ciest.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="coming-soon-card">
        <Globe size={40} className="text-turquoise mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-bold text-white mb-2">Cestovná časová os — krok 5</h3>
        <p className="text-white/40 text-sm max-w-sm mx-auto">
          Donovaly 2021, Slovinsko & Taliansko 2022, Cyprus 2023–2026, Rím 2024 + bucket list.
        </p>
      </motion.div>
    </div>
  )
}
