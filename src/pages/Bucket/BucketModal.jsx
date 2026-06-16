import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Map, Edit3, Check } from 'lucide-react'
import { generateId } from '../../data/trips'

const WHO_OPTS = [
  { v:'couple', l:'👫 Norbi & Natalita' },
  { v:'family', l:'👨‍👩‍👧 Celá rodina'    },
  { v:'solo',   l:'🧑 Sám'              },
]

function BucketItem({ item, onDelete, onEdit, onPlanTrip }) {
  return (
    <motion.div
      layout
      initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
      className="flex items-start gap-3 p-4 rounded-2xl"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-2xl mt-0.5 flex-shrink-0">{item.flag || '🌍'}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white text-sm leading-tight">{item.destination}</h4>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {item.timeframe && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background:'rgba(12,180,204,0.12)', color:'#3DCFE4', border:'1px solid rgba(12,180,204,0.2)' }}>
              📅 {item.timeframe}
            </span>
          )}
          {item.who && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,248,240,0.5)' }}>
              {WHO_OPTS.find(w=>w.v===item.who)?.l || item.who}
            </span>
          )}
        </div>
        {item.notes && <p className="text-xs text-white/35 mt-1.5 leading-relaxed">{item.notes}</p>}
        {/* Plan trip button */}
        <button
          onClick={() => onPlanTrip(item)}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all"
          style={{ background:'rgba(255,107,107,0.12)', color:'#FF9B9B', border:'1px solid rgba(255,107,107,0.2)' }}
        >
          <Map size={11}/> Naplánovať cestu
        </button>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
          <Edit3 size={12} className="text-white/40"/>
        </button>
        <button onClick={() => onDelete(item.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors">
          <Trash2 size={12} className="text-white/30"/>
        </button>
      </div>
    </motion.div>
  )
}

function BucketForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { destination:'', flag:'', timeframe:'', who:'family', notes:'' })
  function set(k,v) { setForm(f=>({...f,[k]:v})) }
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl" style={{ background:'rgba(12,180,204,0.06)', border:'1px solid rgba(12,180,204,0.15)' }}>
      <div className="grid grid-cols-2 gap-2">
        <input className="input-field" placeholder="Destinácia *" value={form.destination} onChange={e=>set('destination',e.target.value)}/>
        <input className="input-field" placeholder="Vlajka 🏳️" value={form.flag} onChange={e=>set('flag',e.target.value)}/>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="input-field" placeholder="Časový rámec (napr. 2027)" value={form.timeframe} onChange={e=>set('timeframe',e.target.value)}/>
        <select className="input-field" value={form.who} onChange={e=>set('who',e.target.value)}>
          {WHO_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>
      <input className="input-field" placeholder="Poznámka (nepovinné)" value={form.notes} onChange={e=>set('notes',e.target.value)}/>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">
          Zrušiť
        </button>
        <button
          onClick={() => form.destination.trim() && onSave(form)}
          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          style={{ background:'rgba(12,180,204,0.2)', color:'#3DCFE4', border:'1px solid rgba(12,180,204,0.3)' }}
        >
          <Check size={12}/> Uložiť
        </button>
      </div>
    </div>
  )
}

export default function BucketModal({ bucket, onSave, onClose, onPlanTrip }) {
  const [items,    setItems]    = useState(bucket)
  const [adding,   setAdding]   = useState(false)
  const [editing,  setEditing]  = useState(null) // item id

  function save(updated) { setItems(updated); onSave(updated) }

  function addItem(form) {
    save([...items, { ...form, id: generateId() }])
    setAdding(false)
  }

  function editItem(form) {
    save(items.map(i => i.id === editing ? { ...i, ...form } : i))
    setEditing(null)
  }

  function deleteItem(id) {
    save(items.filter(i => i.id !== id))
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-extrabold text-white">✨ Bucket list</h2>
            <p className="text-xs text-white/35 mt-0.5">Miesta, ktoré chceme navštíviť</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/60"/>
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          <AnimatePresence>
            {items.map(item => (
              editing === item.id
                ? <BucketForm key={item.id} initial={item} onSave={editItem} onCancel={() => setEditing(null)}/>
                : <BucketItem key={item.id} item={item} onDelete={deleteItem} onEdit={i=>setEditing(i.id)} onPlanTrip={onPlanTrip}/>
            ))}
          </AnimatePresence>

          {/* Add form / button */}
          {adding
            ? <BucketForm onSave={addItem} onCancel={() => setAdding(false)}/>
            : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ border:'1px dashed rgba(255,107,107,0.3)', color:'rgba(255,107,107,0.6)' }}
              >
                <Plus size={14}/> Pridať destináciu
              </button>
            )
          }
        </div>
      </motion.div>
    </motion.div>
  )
}
