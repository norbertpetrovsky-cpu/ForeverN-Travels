import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus } from 'lucide-react'

const COLORS = ['#0CB4CC','#FF6B6B','#5B8C5A','#7B5EA7','#C17F3E','#E05A8A','#4A90D9']

export default function NewTripModal({ prefill, onSave, onClose }) {
  const [form, setForm] = useState({
    destination:  prefill?.destination || '',
    country:      prefill?.country     || '',
    flag:         prefill?.flag        || '',
    dateFrom:     '',
    dateTo:       '',
    hotel:        '',
    who:          prefill?.who         || 'family',
    color:        '#0CB4CC',
    status:       'planned',
  })
  const [err, setErr] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.destination.trim()) return setErr('Zadaj názov destinácie')
    if (!form.dateFrom)           return setErr('Zadaj dátum odletu')
    if (!form.dateTo)             return setErr('Zadaj dátum návratu')
    if (new Date(form.dateTo) <= new Date(form.dateFrom)) return setErr('Dátum návratu musí byť po odlete')
    setErr('')
    onSave(form)
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Nová cesta</h2>
            {prefill && <p className="text-xs text-white/40 mt-0.5">Predvyplnené z bucket listu</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/60"/>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Destination */}
          <div>
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Destinácia *</label>
            <input className="input-field" placeholder="napr. Grécko, Thajsko..." value={form.destination} onChange={e=>set('destination',e.target.value)}/>
          </div>

          {/* Flag + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Vlajka (emoji)</label>
              <input className="input-field" placeholder="🇬🇷" value={form.flag} onChange={e=>set('flag',e.target.value)}/>
            </div>
            <div>
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Krajina / región</label>
              <input className="input-field" placeholder="napr. Grécko · Santorini" value={form.country} onChange={e=>set('country',e.target.value)}/>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Odlet *</label>
              <input type="date" className="input-field" value={form.dateFrom} onChange={e=>set('dateFrom',e.target.value)}/>
            </div>
            <div>
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Návrat *</label>
              <input type="date" className="input-field" value={form.dateTo} onChange={e=>set('dateTo',e.target.value)}/>
            </div>
          </div>

          {/* Hotel */}
          <div>
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1.5 block">Hotel / ubytovanie</label>
            <input className="input-field" placeholder="napr. Silver Sands Hotel" value={form.hotel} onChange={e=>set('hotel',e.target.value)}/>
          </div>

          {/* Who */}
          <div>
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2 block">Kto cestuje</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v:'couple', l:'👫 Norbi & Natalita' },
                { v:'family', l:'👨‍👩‍👧 Celá rodina'     },
                { v:'solo',   l:'🧑 Sám'               },
              ].map(opt => (
                <button key={opt.v} onClick={() => set('who', opt.v)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: form.who===opt.v ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.who===opt.v ? 'rgba(12,180,204,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    color: form.who===opt.v ? '#3DCFE4' : 'rgba(255,248,240,0.5)',
                  }}
                >{opt.l}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2 block">Farba karty</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => set('color',c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ background:c, outline: form.color===c ? `3px solid ${c}` : 'none', outlineOffset:'2px' }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {err && <p className="text-xs text-red-400 font-medium">{err}</p>}

          {/* Save */}
          <motion.button
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
            style={{ background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff', boxShadow:'0 0 20px rgba(12,180,204,0.3)' }}
          >
            <Plus size={16}/> Vytvoriť cestu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
