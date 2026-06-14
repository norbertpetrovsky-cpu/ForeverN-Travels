import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

export default function Balenie() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-turquoise mb-1">Zoznamy</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Balenie</h1>
        <p className="text-white/40 text-sm mb-8">Všetky zoznamy — Norbi, Natalita, Elizabethka a zdieľané.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="coming-soon-card">
        <Package size={40} className="text-turquoise mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-bold text-white mb-2">Kontrolné zoznamy — krok 3</h3>
        <p className="text-white/40 text-sm max-w-sm mx-auto">
          9 kategórií, predvyplnené po slovensky, progress bary a možnosť pridávať/mazať položky.
        </p>
      </motion.div>
    </div>
  )
}
