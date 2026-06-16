import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Check, Edit3, Copy, Trash2, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import { loadTrips } from '../../data/trips'

// ─── Constants ────────────────────────────────────────────────
const BLOCKS = [
  { id:'rano',        label:'Ráno',         icon:'🌅', color:'rgba(255,180,50,0.7)'  },
  { id:'dopoludnie',  label:'Dopoludnie',   icon:'☀️', color:'rgba(255,210,80,0.65)' },
  { id:'obed',        label:'Obed',         icon:'🍽️', color:'rgba(255,140,60,0.65)' },
  { id:'poobede',     label:'Poobede',      icon:'🌤️', color:'rgba(12,180,204,0.7)'  },
  { id:'vecer',       label:'Večer',        icon:'🌙', color:'rgba(123,94,167,0.7)'  },
  { id:'ak_bude_cas', label:'Ak bude čas',  icon:'✨', color:'rgba(255,107,107,0.6)' },
]

const CATEGORIES = [
  { id:'jedlo',      label:'Jedlo',       icon:'🍽️' },
  { id:'plaz',       label:'Pláž',        icon:'🏖️' },
  { id:'vylet',      label:'Výlet',       icon:'🗺️' },
  { id:'presun',     label:'Presun',      icon:'🚗' },
  { id:'oddych',     label:'Oddych',      icon:'😴' },
  { id:'nakupy',     label:'Nákupy',      icon:'🛍️' },
  { id:'atrakcia',   label:'Atrakcia',    icon:'🎡' },
  { id:'rezervacia', label:'Rezervácia',  icon:'📋' },
  { id:'volny_cas',  label:'Voľný čas',   icon:'🌊' },
  { id:'dolezite',   label:'Dôležité',    icon:'⭐' },
]

const PARTICIPANTS = [
  { id:'vsetci',      label:'Všetci',     emoji:'👨‍👩‍👧' },
  { id:'norbi',       label:'Norbi',      emoji:'👨' },
  { id:'natalita',    label:'Natalita',   emoji:'👩' },
  { id:'elizabethka', label:'Elizabethka',emoji:'👧' },
]

const DAY_LABELS = [
  'Prílet','Pláž','Výlet','Oddych','Loď','Mesto','Voľný deň',
  'Presun','Obed vonku','Výlet do prírody','Raňajky vonku',
  'Nákupy','Aquapark','Lodný výlet',
]

const DAY_ICONS = ['✈️','🏖️','🗺️','😴','⛵','🏙️','🌴','🚗','🍽️','🌿','☕','🛍️','🏊','⚓']

const SK_DAYS = ['ne','po','ut','st','št','pi','so']
const SK_MONTHS = ['jan','feb','mar','apr','máj','jún','júl','aug','sep','okt','nov','dec']

// ─── Data helpers ─────────────────────────────────────────────
function storageKey(tripId) { return `fn_plan_${tripId}` }

function generateId() { return `p-${Date.now()}-${Math.random().toString(36).slice(2,6)}` }

function generateDays(dateFrom, dateTo) {
  const days = []
  const start = new Date(dateFrom)
  const end   = new Date(dateTo)
  let d = new Date(start)
  let n = 1
  while (d <= end) {
    days.push({
      id:      `day-${n}`,
      number:  n,
      date:    d.toISOString().slice(0,10),
      label:   n === 1 ? 'Prílet' : n === Math.round((end-start)/(86400000)+1) ? 'Odlet' : '',
      icon:    n === 1 ? '✈️' : '',
      activities: [],
      notes:   [],
    })
    d = new Date(d.getTime() + 86400000)
    n++
  }
  return days
}

function loadPlan(tripId, trip) {
  try {
    const raw = localStorage.getItem(storageKey(tripId))
    if (raw) return JSON.parse(raw)
  } catch {}
  return { days: generateDays(trip.dateFrom, trip.dateTo), ideas: [] }
}

function savePlan(tripId, data) {
  try { localStorage.setItem(storageKey(tripId), JSON.stringify(data)) } catch {}
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getDate()}. ${SK_MONTHS[d.getMonth()]}`
}
function fmtDateFull(dateStr) {
  const d = new Date(dateStr)
  const wd = ['Nedeľa','Pondelok','Utorok','Streda','Štvrtok','Piatok','Sobota'][d.getDay()]
  return `${wd}, ${d.getDate()}. ${d.getMonth()+1}. ${d.getFullYear()}`
}
function fmtDayShort(dateStr) {
  const d = new Date(dateStr)
  return SK_DAYS[d.getDay()]
}

function getCatIcon(catId) {
  return CATEGORIES.find(c => c.id === catId)?.icon || '📌'
}
function getParticipantEmoji(pid) {
  return PARTICIPANTS.find(p => p.id === pid)?.emoji || ''
}

// ─── Activity Form Modal ──────────────────────────────────────
function ActivityModal({ activity, dayId, days, onSave, onClose }) {
  const isEdit = !!activity
  const [form, setForm] = useState(activity || {
    id: generateId(),
    title: '',
    block: 'dopoludnie',
    time: '',
    duration: '',
    category: 'volny_cas',
    location: '',
    notes: '',
    participants: ['vsetci'],
    bring: [],
    done: false,
  })
  const [bringInput, setBringInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function toggleParticipant(pid) {
    set('participants', form.participants.includes(pid)
      ? form.participants.filter(p => p !== pid)
      : [...form.participants.filter(p => p !== 'vsetci'), pid]
    )
  }

  function addBring() {
    const t = bringInput.trim()
    if (!t) return
    set('bring', [...form.bring, t])
    setBringInput('')
  }

  function handleSave() {
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim() })
  }

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:10,
    padding:'9px 12px', color:'rgba(255,248,240,0.9)',
    fontSize:'0.82rem', fontFamily:'inherit', outline:'none',
    boxSizing:'border-box',
  }

  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="modal-sheet" initial={{ y:50, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:50, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:280 }}
        style={{ maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>
            {isEdit ? 'Upraviť aktivitu' : 'Nová aktivita'}
          </h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,248,240,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={13}/>
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Názov *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="napr. Fig Tree Bay, Raňajky, Presun..." style={inputStyle} autoFocus
            onKeyDown={e => e.key==='Enter' && handleSave()}/>
        </div>

        {/* Time block */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Časť dňa</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {BLOCKS.map(b => (
              <button key={b.id} onClick={() => set('block', b.id)}
                style={{ padding:'5px 12px', borderRadius:20, fontSize:'0.7rem', fontWeight:700, cursor:'pointer',
                  background: form.block===b.id ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.block===b.id ? 'rgba(12,180,204,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: form.block===b.id ? '#3DCFE4' : 'rgba(255,248,240,0.45)',
                }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time + Duration */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <div>
            <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Čas (voliteľné)</label>
            <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="10:00" style={inputStyle} type="time"/>
          </div>
          <div>
            <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Trvanie (voliteľné)</label>
            <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="2h, 30min..." style={inputStyle}/>
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Kategória</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => set('category', c.id)}
                style={{ padding:'5px 11px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
                  background: form.category===c.id ? 'rgba(12,180,204,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${form.category===c.id ? 'rgba(12,180,204,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  color: form.category===c.id ? '#3DCFE4' : 'rgba(255,248,240,0.4)',
                }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Miesto (voliteľné)</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="napr. Fig Tree Bay, Protaras" style={inputStyle}/>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Poznámky (voliteľné)</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ďalšie poznámky..."
            style={{ ...inputStyle, resize:'vertical', minHeight:60 }}/>
        </div>

        {/* Participants */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Účastníci</label>
          <div style={{ display:'flex', gap:8 }}>
            {PARTICIPANTS.map(p => (
              <button key={p.id} onClick={() => {
                  if (p.id === 'vsetci') { set('participants', ['vsetci']); return }
                  toggleParticipant(p.id)
                }}
                style={{ flex:1, padding:'7px 0', borderRadius:12, fontSize:'0.7rem', fontWeight:700, cursor:'pointer',
                  background: form.participants.includes(p.id) || (p.id==='vsetci' && form.participants.includes('vsetci')) ? 'rgba(12,180,204,0.16)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.participants.includes(p.id) ? 'rgba(12,180,204,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  color: form.participants.includes(p.id) ? '#3DCFE4' : 'rgba(255,248,240,0.4)',
                  textAlign:'center',
                }}>
                <div style={{ fontSize:16 }}>{p.emoji}</div>
                <div style={{ fontSize:'0.6rem', marginTop:2 }}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bring with us */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>
            Zobrať so sebou
          </label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
            {form.bring.map((b,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background:'rgba(12,180,204,0.1)', border:'1px solid rgba(12,180,204,0.25)', fontSize:'0.68rem', color:'#3DCFE4' }}>
                {b}
                <button onClick={() => set('bring', form.bring.filter((_,j) => j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(12,180,204,0.5)', padding:0, lineHeight:1 }}>
                  <X size={10}/>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:7 }}>
            <input value={bringInput} onChange={e => setBringInput(e.target.value)}
              placeholder="opaľovací krém, uteráky..."
              onKeyDown={e => e.key==='Enter' && addBring()}
              style={{ ...inputStyle, flex:1 }}/>
            <button onClick={addBring} style={{ padding:'0 14px', borderRadius:10, background:'rgba(12,180,204,0.15)', border:'1px solid rgba(12,180,204,0.3)', color:'#3DCFE4', cursor:'pointer', flexShrink:0 }}>
              <Plus size={14}/>
            </button>
          </div>
        </div>

        {/* Save */}
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleSave}
          style={{ width:'100%', padding:'12px', borderRadius:14, background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', border:'none' }}>
          {isEdit ? 'Uložiť zmeny' : 'Pridať aktivitu'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Edit day label modal ─────────────────────────────────────
function EditDayModal({ day, onSave, onClose }) {
  const [label, setLabel] = useState(day.label || '')
  const [icon,  setIcon]  = useState(day.icon  || '')

  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="modal-sheet" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:40, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:300 }}
        style={{ maxWidth:380 }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>
            Deň {day.number} — {fmtDate(day.date)}
          </h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,248,240,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={13}/>
          </button>
        </div>

        {/* Quick label presets */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {DAY_LABELS.map((l,i) => (
            <button key={l} onClick={() => { setLabel(l); setIcon(DAY_ICONS[i] || '') }}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
                background: label===l ? 'rgba(12,180,204,0.18)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${label===l ? 'rgba(12,180,204,0.4)' : 'rgba(255,255,255,0.09)'}`,
                color: label===l ? '#3DCFE4' : 'rgba(255,248,240,0.4)',
              }}>
              {DAY_ICONS[i]} {l}
            </button>
          ))}
        </div>

        {/* Custom label */}
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Vlastný názov dňa..."
          style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'9px 12px', color:'rgba(255,248,240,0.9)', fontSize:'0.82rem', fontFamily:'inherit', outline:'none', marginBottom:14, boxSizing:'border-box' }}
          onKeyDown={e => e.key==='Enter' && onSave({ label, icon })}/>

        {/* Icon picker */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
          {DAY_ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              style={{ width:36, height:36, borderRadius:8, fontSize:18, cursor:'pointer',
                background: icon===ic ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.05)',
                border: icon===ic ? '1px solid rgba(12,180,204,0.4)' : '1px solid transparent' }}>
              {ic}
            </button>
          ))}
        </div>

        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          onClick={() => onSave({ label: label.trim(), icon })}
          style={{ width:'100%', padding:'11px', borderRadius:14, background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', border:'none' }}>
          Uložiť
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Activity card ────────────────────────────────────────────
function ActivityCard({ activity, onEdit, onDelete, onToggleDone, onMoveBlock, onCopyToDay, days }) {
  const [open, setOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)
  const catIcon = getCatIcon(activity.category)

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:8 }}
      animate={{ opacity: activity.done ? 0.55 : 1, y:0 }}
      exit={{ opacity:0, scale:0.95 }}
      style={{
        background: activity.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${activity.done ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius:14, marginBottom:8, overflow:'hidden',
        transition:'background 0.3s, border-color 0.3s',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px' }}>
        {/* Done toggle */}
        <button onClick={() => onToggleDone(activity.id)}
          style={{ width:20, height:20, borderRadius:5, flexShrink:0, cursor:'pointer', transition:'all 0.2s',
            border:`1.5px solid ${activity.done ? '#0CB4CC' : 'rgba(255,255,255,0.22)'}`,
            background: activity.done ? '#0CB4CC' : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
          {activity.done && <Check size={11} color="white" strokeWidth={3}/>}
        </button>

        {/* Category icon */}
        <span style={{ fontSize:15, flexShrink:0 }}>{catIcon}</span>

        {/* Main info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{
              fontSize:'0.82rem', fontWeight:700,
              color: activity.done ? 'rgba(255,248,240,0.35)' : 'rgba(255,248,240,0.92)',
              textDecoration: activity.done ? 'line-through' : 'none',
            }}>{activity.title}</span>
            {activity.time && (
              <span style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.35)', display:'flex', alignItems:'center', gap:3 }}>
                <Clock size={9}/>{activity.time}
                {activity.duration && ` · ${activity.duration}`}
              </span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, flexWrap:'wrap' }}>
            {activity.location && (
              <span style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.3)', display:'flex', alignItems:'center', gap:3 }}>
                <MapPin size={9}/>{activity.location}
              </span>
            )}
            {activity.participants?.length > 0 && (
              <span style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.28)' }}>
                {activity.participants.map(p => getParticipantEmoji(p)).join('')}
              </span>
            )}
            {activity.bring?.length > 0 && (
              <span style={{ fontSize:'0.6rem', color:'rgba(12,180,204,0.5)' }}>🎒 {activity.bring.length}</span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setOpen(o => !o)}
          style={{ width:24, height:24, borderRadius:6, background:'rgba(255,255,255,0.05)', border:'none', color:'rgba(255,248,240,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:10, transition:'transform 0.2s', display:'inline-block', transform:open?'rotate(180deg)':'rotate(0deg)' }}>▼</span>
        </button>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ padding:'0 14px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              {activity.notes && (
                <p style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.45)', margin:'10px 0 8px', lineHeight:1.6, fontStyle:'italic' }}>
                  {activity.notes}
                </p>
              )}
              {activity.bring?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.3)', fontWeight:700, marginBottom:5 }}>Zobrať so sebou</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {activity.bring.map((b,i) => (
                      <span key={i} style={{ fontSize:'0.65rem', padding:'2px 9px', borderRadius:20, background:'rgba(12,180,204,0.1)', border:'1px solid rgba(12,180,204,0.22)', color:'#3DCFE4' }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy to another day */}
              <div style={{ marginBottom:10 }}>
                <button onClick={() => setCopyOpen(c=>!c)}
                  style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.65rem', fontWeight:600, color:'rgba(255,248,240,0.4)', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: copyOpen ? 8 : 0 }}>
                  <Copy size={11}/> Kopírovať do iného dňa
                </button>
                <AnimatePresence>
                  {copyOpen && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} style={{ overflow:'hidden' }}>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap', paddingTop:4 }}>
                        {days.map(d => (
                          <button key={d.id} onClick={() => { onCopyToDay(d.id); setCopyOpen(false) }}
                            style={{ padding:'4px 10px', borderRadius:9, fontSize:'0.62rem', fontWeight:700, cursor:'pointer', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.5)' }}>
                            {d.icon||'📅'} Deň {d.number}{d.label ? ` · ${d.label}` : ''}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Move block */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.3)', fontWeight:700, marginBottom:5 }}>Presunúť do bloku</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {BLOCKS.filter(b => b.id !== activity.block).map(b => (
                    <button key={b.id} onClick={() => onMoveBlock(activity.id, b.id)}
                      style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.62rem', fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.4)' }}>
                      {b.icon} {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => onEdit(activity)}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:8, fontSize:'0.68rem', fontWeight:600, color:'rgba(255,248,240,0.5)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', cursor:'pointer' }}>
                  <Edit3 size={11}/> Upraviť
                </button>
                <button onClick={() => onDelete(activity.id)}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:8, fontSize:'0.68rem', fontWeight:600, color:'rgba(255,107,107,0.6)', background:'rgba(255,107,107,0.07)', border:'1px solid rgba(255,107,107,0.15)', cursor:'pointer' }}>
                  <Trash2 size={11}/> Vymazať
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Time block section ───────────────────────────────────────
function TimeBlock({ block, activities, onAdd, onEdit, onDelete, onToggleDone, onMoveBlock, onCopyToDay, days }) {
  const blockActivities = activities.filter(a => a.block === block.id)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ marginBottom:20 }}>
      {/* Block header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <button onClick={() => setCollapsed(c => !c)}
          style={{ display:'flex', alignItems:'center', gap:8, flex:1, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0 }}>
          <span style={{ fontSize:16 }}>{block.icon}</span>
          <span style={{ fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', color:block.color }}>
            {block.label}
          </span>
          {blockActivities.length > 0 && (
            <span style={{ fontSize:'0.6rem', color:'rgba(255,248,240,0.25)', fontWeight:600 }}>
              {blockActivities.filter(a=>a.done).length}/{blockActivities.length}
            </span>
          )}
          <span style={{ fontSize:9, color:'rgba(255,248,240,0.2)', marginLeft:'auto', transform:collapsed?'rotate(-90deg)':'rotate(0deg)', transition:'transform 0.2s' }}>▼</span>
        </button>
        <button onClick={() => onAdd(block.id)}
          style={{ width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Plus size={13}/>
        </button>
      </div>

      {/* Separator line */}
      <div style={{ height:1, background:`linear-gradient(90deg,${block.color},transparent)`, marginBottom:10, opacity:0.4 }}/>

      {/* Activities */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }} style={{ overflow:'hidden' }}>
            <AnimatePresence>
              {blockActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleDone={onToggleDone}
                  onMoveBlock={onMoveBlock}
                  onCopyToDay={(targetDayId) => onCopyToDay(targetDayId, act)}
                  days={days}
                />
              ))}
            </AnimatePresence>

            {blockActivities.length === 0 && (
              <button onClick={() => onAdd(block.id)}
                style={{ width:'100%', padding:'10px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', color:'rgba(255,248,240,0.22)', fontSize:'0.72rem', cursor:'pointer', fontStyle:'italic' }}>
                + Pridať aktivitu do {block.label.toLowerCase()}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Day notes section ────────────────────────────────────────
function DayNotes({ notes, onChange }) {
  const [adding, setAdding] = useState(false)
  const [input, setInput]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus() }, [adding])

  function addNote() {
    const t = input.trim()
    if (!t) { setAdding(false); return }
    onChange([...notes, { id:generateId(), text:t }])
    setInput('')
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'16px 18px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,248,240,0.35)', fontWeight:700 }}>📋 Poznámky dňa</span>
        <button onClick={() => setAdding(true)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.65rem', color:'rgba(12,180,204,0.7)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
          <Plus size={11}/> Pridať
        </button>
      </div>

      {notes.map(n => (
        <div key={n.id} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
          <span style={{ color:'rgba(12,180,204,0.5)', marginTop:2, flexShrink:0, fontSize:10 }}>●</span>
          <span style={{ fontSize:'0.78rem', color:'rgba(255,248,240,0.65)', flex:1, lineHeight:1.5 }}>{n.text}</span>
          <button onClick={() => onChange(notes.filter(x => x.id!==n.id))}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,248,240,0.2)', flexShrink:0, padding:0 }}>
            <X size={11}/>
          </button>
        </div>
      ))}

      {notes.length === 0 && !adding && (
        <p style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.2)', fontStyle:'italic' }}>Žiadne poznámky na tento deň.</p>
      )}

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ display:'flex', gap:6, marginTop:8 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              placeholder="Napr. Zobrať opaľovací krém..."
              onKeyDown={e => { if(e.key==='Enter') addNote(); if(e.key==='Escape') setAdding(false) }}
              style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'7px 11px', color:'rgba(255,248,240,0.9)', fontSize:'0.78rem', fontFamily:'inherit', outline:'none' }}/>
            <button onClick={addNote} style={{ width:30, height:30, borderRadius:8, background:'rgba(12,180,204,0.18)', border:'1px solid rgba(12,180,204,0.35)', color:'#3DCFE4', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Check size={13}/>
            </button>
            <button onClick={() => { setAdding(false); setInput('') }} style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={13}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Day selector strip ───────────────────────────────────────
function DayStrip({ days, activeDayId, onSelect, tripColor }) {
  const scrollRef = useRef(null)

  // Scroll active day into view
  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-dayid="${activeDayId}"]`)
    el?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' })
  }, [activeDayId])

  return (
    <div style={{ position:'relative', marginBottom:24 }}>
      <div ref={scrollRef} style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4,
        scrollbarWidth:'none', msOverflowStyle:'none' }}>
        {days.map(day => {
          const isActive  = day.id === activeDayId
          const actCount  = day.activities.length
          return (
            <button
              key={day.id}
              data-dayid={day.id}
              onClick={() => onSelect(day.id)}
              style={{
                flexShrink:0, padding:'10px 14px', borderRadius:14, cursor:'pointer',
                minWidth:80, textAlign:'center',
                background: isActive ? `rgba(${tripColor ? '12,180,204' : '12,180,204'},0.18)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? 'rgba(12,180,204,0.5)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? '0 4px 16px rgba(12,180,204,0.2)' : 'none',
                transition:'all 0.2s',
              }}
            >
              <div style={{ fontSize:18, marginBottom:2 }}>{day.icon || '📅'}</div>
              <div style={{ fontSize:'0.58rem', fontWeight:800, color: isActive ? '#3DCFE4' : 'rgba(255,248,240,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                Deň {day.number}
              </div>
              <div style={{ fontSize:'0.58rem', color: isActive ? 'rgba(12,180,204,0.7)' : 'rgba(255,248,240,0.28)', marginTop:1 }}>
                {fmtDate(day.date)} {fmtDayShort(day.date)}
              </div>
              {day.label && (
                <div style={{ fontSize:'0.58rem', fontWeight:700, color: isActive ? '#3DCFE4' : 'rgba(255,248,240,0.35)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:80 }}>
                  {day.label}
                </div>
              )}
              {actCount > 0 && (
                <div style={{ width:16, height:4, borderRadius:2, background: isActive ? '#0CB4CC' : 'rgba(255,255,255,0.15)', margin:'4px auto 0' }}/>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Ideas bucket — improved ──────────────────────────────────
function IdeasBucket({ ideas, onChange, days, onAddToDay, activeDayId }) {
  const [adding,   setAdding]   = useState(false)
  const [input,    setInput]    = useState('')
  const [category, setCategory] = useState('volny_cas')
  const [notes,    setNotes]    = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus() }, [adding])

  function addIdea() {
    const t = input.trim()
    if (!t) { setAdding(false); return }
    onChange([...ideas, { id:generateId(), title:t, category, notes }])
    setInput(''); setNotes(''); setCategory('volny_cas'); setAdding(false)
  }

  function scheduleIdea(idea, dayId) {
    const day = days.find(d => d.id === dayId)
    if (!day) return
    onAddToDay(dayId, {
      id:generateId(), title:idea.title, block:'poobede',
      time:'', duration:'', category:idea.category||'volny_cas',
      location:'', notes:idea.notes||'',
      participants:['vsetci'], bring:[], done:false,
    })
    onChange(ideas.filter(x => x.id !== idea.id))
  }

  return (
    <div style={{ background:'rgba(255,107,107,0.05)', border:'1px solid rgba(255,107,107,0.15)', borderRadius:18, padding:'18px 20px', marginTop:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,107,107,0.75)', fontWeight:700 }}>
            💡 Nápady / Možno
          </div>
          <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.25)', marginTop:2 }}>
            Neplánované nápady — zaradíme ich neskôr
          </div>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:20, fontSize:'0.68rem', fontWeight:700, color:'rgba(255,107,107,0.8)', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.25)', cursor:'pointer' }}>
            <Plus size={11}/> Pridať nápad
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              placeholder="Cape Greco, Blue Lagoon, Luna park..."
              onKeyDown={e => { if (e.key==='Enter') addIdea(); if (e.key==='Escape') { setAdding(false); setInput('') } }}
              style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:9, padding:'9px 12px', color:'rgba(255,248,240,0.9)', fontSize:'0.82rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:10 }}/>

            {/* Category */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  style={{ padding:'4px 10px', borderRadius:20, fontSize:'0.65rem', fontWeight:600, cursor:'pointer',
                    background: category===c.id ? 'rgba(255,107,107,0.18)' : 'rgba(255,255,255,0.04)',
                    border:`1px solid ${category===c.id ? 'rgba(255,107,107,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    color: category===c.id ? '#FF9B9B' : 'rgba(255,248,240,0.35)',
                  }}>{c.icon} {c.label}</button>
              ))}
            </div>

            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Krátka poznámka (voliteľné)..."
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'8px 12px', color:'rgba(255,248,240,0.75)', fontSize:'0.75rem', fontFamily:'inherit', outline:'none', resize:'none', height:52, boxSizing:'border-box', marginBottom:10 }}/>

            <div style={{ display:'flex', gap:7, justifyContent:'flex-end' }}>
              <button onClick={() => { setAdding(false); setInput(''); setNotes('') }}
                style={{ padding:'6px 14px', borderRadius:9, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.38)', fontSize:'0.72rem', fontWeight:600, cursor:'pointer' }}>
                Zrušiť
              </button>
              <button onClick={addIdea}
                style={{ padding:'6px 16px', borderRadius:9, background:'rgba(255,107,107,0.18)', border:'1px solid rgba(255,107,107,0.38)', color:'#FF9B9B', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}>
                Pridať nápad
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ideas list */}
      {ideas.length === 0 ? (
        <p style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.2)', fontStyle:'italic', textAlign:'center', padding:'10px 0' }}>
          Pridaj nápady, ktoré možno zaradíme neskôr.
        </p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              days={days}
              activeDayId={activeDayId}
              onSchedule={scheduleIdea}
              onDelete={() => onChange(ideas.filter(x => x.id!==idea.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single idea card with inline day picker ──────────────────
function IdeaCard({ idea, days, activeDayId, onSchedule, onDelete }) {
  const [picking, setPicking] = useState(false)

  return (
    <motion.div layout initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
        <span style={{ fontSize:16, flexShrink:0 }}>{getCatIcon(idea.category)}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(255,248,240,0.82)' }}>{idea.title}</div>
          {idea.notes && <div style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.35)', marginTop:2, fontStyle:'italic' }}>{idea.notes}</div>}
        </div>
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          <button onClick={() => setPicking(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:8, fontSize:'0.65rem', fontWeight:700, color:'#3DCFE4', background:'rgba(12,180,204,0.12)', border:'1px solid rgba(12,180,204,0.28)', cursor:'pointer' }}>
            <Plus size={10}/> Do dňa
          </button>
          <button onClick={onDelete}
            style={{ width:24, height:24, borderRadius:6, background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.18)', color:'rgba(255,107,107,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={10}/>
          </button>
        </div>
      </div>

      {/* Inline day picker */}
      <AnimatePresence>
        {picking && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.2 }} style={{ overflow:'hidden' }}>
            <div style={{ padding:'0 14px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, marginBottom:8, marginTop:8 }}>
                Vyber deň:
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {days.map(d => (
                  <button key={d.id} onClick={() => { onSchedule(idea, d.id); setPicking(false) }}
                    style={{ padding:'5px 11px', borderRadius:10, fontSize:'0.65rem', fontWeight:700, cursor:'pointer',
                      background: d.id===activeDayId ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.05)',
                      border:`1px solid ${d.id===activeDayId ? 'rgba(12,180,204,0.45)' : 'rgba(255,255,255,0.1)'}`,
                      color: d.id===activeDayId ? '#3DCFE4' : 'rgba(255,248,240,0.55)',
                    }}>
                    {d.icon||'📅'} Deň {d.number}
                    {d.label && <span style={{ opacity:0.65 }}> · {d.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Reservation status config ───────────────────────────────
const RES_STATUSES = [
  { id:'potvrdene',      label:'Potvrdené',         color:'#5B8C5A', bg:'rgba(91,140,90,0.15)'  },
  { id:'rezervovane',    label:'Rezervované',        color:'#0CB4CC', bg:'rgba(12,180,204,0.12)' },
  { id:'treba_rez',      label:'Treba rezervovať',   color:'#FF9B9B', bg:'rgba(255,155,155,0.12)'},
  { id:'nie_je_potrebna',label:'Nie je potrebná',    color:'rgba(255,248,240,0.3)', bg:'rgba(255,255,255,0.05)' },
]

function getResStatus(id) { return RES_STATUSES.find(s => s.id === id) || RES_STATUSES[3] }

// ─── Reservation modal ────────────────────────────────────────
function ReservationModal({ reservation, onSave, onClose }) {
  const isEdit = !!reservation
  const [form, setForm] = useState(reservation || {
    id: generateId(), time:'', title:'', place:'',
    status:'nie_je_potrebna', note:'', cost:'',
  })
  function set(k,v) { setForm(f => ({ ...f, [k]:v })) }

  const inp = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'9px 12px', color:'rgba(255,248,240,0.9)', fontSize:'0.82rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="modal-sheet" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:40, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:300 }}
        style={{ maxWidth:420 }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>{isEdit ? 'Upraviť rezerváciu' : 'Nová rezervácia'}</h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,248,240,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={13}/></button>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:5 }}>Názov *</label>
          <input value={form.title} onChange={e => set('title',e.target.value)} placeholder="Večera v centre, Loď..." style={inp} autoFocus onKeyDown={e => e.key==='Enter' && form.title.trim() && onSave(form)}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:5 }}>Čas</label>
            <input value={form.time} onChange={e => set('time',e.target.value)} type="time" style={inp}/>
          </div>
          <div>
            <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:5 }}>Cena (€)</label>
            <input value={form.cost} onChange={e => set('cost',e.target.value)} placeholder="0" style={inp}/>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:5 }}>Miesto</label>
          <input value={form.place} onChange={e => set('place',e.target.value)} placeholder="Reštaurácia, molo..." style={inp}/>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:6 }}>Stav</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {RES_STATUSES.map(s => (
              <button key={s.id} onClick={() => set('status',s.id)}
                style={{ padding:'5px 12px', borderRadius:20, fontSize:'0.68rem', fontWeight:700, cursor:'pointer',
                  background: form.status===s.id ? s.bg : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${form.status===s.id ? s.color : 'rgba(255,255,255,0.09)'}`,
                  color: form.status===s.id ? s.color : 'rgba(255,248,240,0.35)',
                }}>{s.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700, display:'block', marginBottom:5 }}>Poznámka / potvrdenie</label>
          <input value={form.note} onChange={e => set('note',e.target.value)} placeholder="Číslo rezervácie, odkaz..." style={inp}/>
        </div>

        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          onClick={() => form.title.trim() && onSave(form)}
          style={{ width:'100%', padding:'11px', borderRadius:14, background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', border:'none' }}>
          {isEdit ? 'Uložiť zmeny' : 'Pridať rezerváciu'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Reservations section ─────────────────────────────────────
function DayReservations({ reservations, onChange }) {
  const [showModal, setShowModal] = useState(null) // null | {} | reservation

  function save(res) {
    const exists = reservations.find(r => r.id === res.id)
    onChange(exists ? reservations.map(r => r.id===res.id ? res : r) : [...reservations, res])
    setShowModal(null)
  }

  const sorted = [...reservations].sort((a,b) => (a.time||'').localeCompare(b.time||''))

  return (
    <>
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,248,240,0.35)', fontWeight:700 }}>📋 Rezervácie</span>
          <button onClick={() => setShowModal({})}
            style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.65rem', color:'rgba(12,180,204,0.7)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
            <Plus size={11}/> Pridať
          </button>
        </div>

        {sorted.length === 0 ? (
          <p style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.2)', fontStyle:'italic' }}>Žiadne rezervácie na tento deň.</p>
        ) : (
          sorted.map(res => {
            const st = getResStatus(res.status)
            return (
              <div key={res.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                {res.time && (
                  <span style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,248,240,0.4)', flexShrink:0, minWidth:38 }}>{res.time}</span>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                    <span style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(255,248,240,0.85)' }}>{res.title}</span>
                    <span style={{ fontSize:'0.6rem', fontWeight:700, color:st.color, background:st.bg, padding:'2px 8px', borderRadius:20, border:`1px solid ${st.color}44` }}>{st.label}</span>
                  </div>
                  {res.place && <div style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.3)', marginTop:2 }}>📍 {res.place}</div>}
                  {res.note  && <div style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.28)', marginTop:2, fontStyle:'italic' }}>{res.note}</div>}
                  {res.cost  && <div style={{ fontSize:'0.65rem', color:'rgba(91,140,90,0.8)', marginTop:2 }}>€{res.cost}</div>}
                </div>
                <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                  <button onClick={() => setShowModal(res)} style={{ width:24, height:24, borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,248,240,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Edit3 size={10}/></button>
                  <button onClick={() => onChange(reservations.filter(r => r.id!==res.id))} style={{ width:24, height:24, borderRadius:6, background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.18)', color:'rgba(255,107,107,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={10}/></button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {showModal !== null && (
          <ReservationModal
            reservation={showModal?.id ? showModal : null}
            onSave={save}
            onClose={() => setShowModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Logistics section ────────────────────────────────────────
const TRAVEL_MODES = [
  { id:'pesky', label:'Pešo',    icon:'🚶' },
  { id:'autom', label:'Autom',   icon:'🚗' },
  { id:'taxi',  label:'Taxi',    icon:'🚕' },
  { id:'lod',   label:'Loď',     icon:'⛵' },
  { id:'bus',   label:'Bus',     icon:'🚌' },
  { id:'bicykel',label:'Bicykel',icon:'🚲' },
]

function DayLogistics({ logistics, onChange }) {
  const [open, setOpen] = useState(false)
  const L = logistics || {}
  function set(k,v) { onChange({ ...L, [k]:v }) }

  const hasContent = L.from||L.to||L.mode||L.time||L.parking||L.stroller||L.mapNote

  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'8px 11px', color:'rgba(255,248,240,0.85)', fontSize:'0.78rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: open||hasContent ? 12 : 0 }}>
        <span style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,248,240,0.35)', fontWeight:700 }}>🚗 Logistika & Presun</span>
        <span style={{ fontSize:10, color:'rgba(255,248,240,0.2)', transform:open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }}>▼</span>
      </button>

      {/* Summary row when collapsed */}
      {!open && hasContent && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {L.from && L.to && <span style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.5)' }}>{L.from} → {L.to}</span>}
          {L.mode && <span style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.4)' }}>{TRAVEL_MODES.find(m=>m.id===L.mode)?.icon} {TRAVEL_MODES.find(m=>m.id===L.mode)?.label}</span>}
          {L.time && <span style={{ fontSize:'0.72rem', color:'rgba(255,248,240,0.35)' }}>~{L.time}</span>}
          {L.parking && <span style={{ fontSize:'0.68rem', color:'rgba(255,248,240,0.3)' }}>🅿️ {L.parking}</span>}
          {L.stroller === 'ano' && <span style={{ fontSize:'0.68rem', color:'rgba(91,140,90,0.8)' }}>🛒 Kočík vhodný</span>}
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }} style={{ overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:4 }}>Odkiaľ</label>
                <input value={L.from||''} onChange={e=>set('from',e.target.value)} placeholder="Hotel, pláž..." style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:4 }}>Kam</label>
                <input value={L.to||''} onChange={e=>set('to',e.target.value)} placeholder="Centrum, výlet..." style={inp}/>
              </div>
            </div>

            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:6 }}>Doprava</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {TRAVEL_MODES.map(m => (
                  <button key={m.id} onClick={() => set('mode', L.mode===m.id ? '' : m.id)}
                    style={{ padding:'5px 11px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
                      background: L.mode===m.id ? 'rgba(12,180,204,0.16)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${L.mode===m.id ? 'rgba(12,180,204,0.4)' : 'rgba(255,255,255,0.09)'}`,
                      color: L.mode===m.id ? '#3DCFE4' : 'rgba(255,248,240,0.38)',
                    }}>{m.icon} {m.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:4 }}>Čas cesty</label>
                <input value={L.time||''} onChange={e=>set('time',e.target.value)} placeholder="15 min, 1h..." style={inp}/>
              </div>
              <div>
                <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:4 }}>Parkovanie</label>
                <input value={L.parking||''} onChange={e=>set('parking',e.target.value)} placeholder="Zadarmo, 3€..." style={inp}/>
              </div>
            </div>

            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:6 }}>Kočík vhodný?</label>
              <div style={{ display:'flex', gap:6 }}>
                {[{id:'ano',label:'✓ Áno'},{id:'nie',label:'✗ Nie'},{id:'ciastocne',label:'~ Čiastočne'}].map(s => (
                  <button key={s.id} onClick={() => set('stroller', L.stroller===s.id ? '' : s.id)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
                      background: L.stroller===s.id ? 'rgba(91,140,90,0.16)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${L.stroller===s.id ? 'rgba(91,140,90,0.4)' : 'rgba(255,255,255,0.09)'}`,
                      color: L.stroller===s.id ? '#7DB87B' : 'rgba(255,248,240,0.38)',
                    }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,248,240,0.3)', fontWeight:700, display:'block', marginBottom:4 }}>Poznámka / mapa</label>
              <input value={L.mapNote||''} onChange={e=>set('mapNote',e.target.value)} placeholder="Google Maps odkaz, poznámka k trase..." style={inp}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Family notes section ─────────────────────────────────────
function FamilyNotes({ familyNotes, onChange }) {
  const F = familyNotes || {}
  function set(k,v) { onChange({ ...F, [k]:v }) }
  const [open, setOpen] = useState(false)

  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'8px 11px', color:'rgba(255,248,240,0.85)', fontSize:'0.78rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  const hasContent = F.sleep||F.notes||F.childFriendly

  return (
    <div style={{ background:'rgba(167,139,250,0.05)', border:'1px solid rgba(167,139,250,0.14)', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: open||hasContent ? 12 : 0 }}>
        <span style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(167,139,250,0.7)', fontWeight:700 }}>👧 Elizabethka · Rodinné potreby</span>
        <span style={{ fontSize:10, color:'rgba(255,248,240,0.2)', transform:open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }}>▼</span>
      </button>

      {!open && hasContent && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {F.sleep && <span style={{ fontSize:'0.7rem', color:'rgba(167,139,250,0.7)' }}>😴 {F.sleep}</span>}
          {F.childFriendly && <span style={{ fontSize:'0.7rem', color: F.childFriendly==='ano' ? 'rgba(91,140,90,0.8)' : 'rgba(255,155,155,0.7)' }}>{F.childFriendly==='ano' ? '✓ Vhodné pre dieťa' : '✗ Nie vhodné pre dieťa'}</span>}
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }} style={{ overflow:'hidden' }}>

            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(167,139,250,0.5)', fontWeight:700, display:'block', marginBottom:4 }}>Spánok Elizabethky</label>
              <input value={F.sleep||''} onChange={e=>set('sleep',e.target.value)} placeholder="napr. 15:00 – 16:30" style={{ ...inp, border:'1px solid rgba(167,139,250,0.2)' }}/>
            </div>

            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(167,139,250,0.5)', fontWeight:700, display:'block', marginBottom:6 }}>Vhodné pre dieťa?</label>
              <div style={{ display:'flex', gap:6 }}>
                {[{id:'ano',label:'✓ Áno'},{id:'nie',label:'✗ Nie'},{id:'ciastocne',label:'~ Čiastočne'}].map(s => (
                  <button key={s.id} onClick={() => set('childFriendly', F.childFriendly===s.id ? '' : s.id)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
                      background: F.childFriendly===s.id ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${F.childFriendly===s.id ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.09)'}`,
                      color: F.childFriendly===s.id ? '#A78BFA' : 'rgba(255,248,240,0.38)',
                    }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(167,139,250,0.5)', fontWeight:700, display:'block', marginBottom:4 }}>Poznámky pre rodinu</label>
              <textarea value={F.notes||''} onChange={e=>set('notes',e.target.value)}
                placeholder="Zobrať kočík, hydratácia, večer skôr domov..."
                style={{ ...inp, border:'1px solid rgba(167,139,250,0.2)', resize:'vertical', minHeight:64 }}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Cost estimate section ────────────────────────────────────
const COST_CATS = [
  { id:'jedlo',    label:'Jedlo',             icon:'🍽️' },
  { id:'doprava',  label:'Doprava & Parkov.', icon:'🚗' },
  { id:'aktivity', label:'Aktivity',          icon:'🎡' },
  { id:'nakupy',   label:'Nákupy & ostatné',  icon:'🛍️' },
]

function CostEstimate({ costs, onChange, activities }) {
  const C = costs || {}
  function set(k,v) { onChange({ ...C, [k]:v }) }
  const [open, setOpen] = useState(false)

  // Parse "100-140" or "50" → [min, max]
  function parseRange(str) {
    if (!str) return [0,0]
    const parts = String(str).split('-').map(s => parseFloat(s.trim())||0)
    return parts.length === 2 ? [parts[0], parts[1]] : [parts[0], parts[0]]
  }

  const totals = COST_CATS.reduce((acc,cat) => {
    const [lo,hi] = parseRange(C[cat.id])
    acc.lo += lo; acc.hi += hi
    return acc
  }, { lo:0, hi:0 })

  // Also sum activity-level costs
  const actTotal = (activities||[]).reduce((s,a) => s + (parseFloat(a.cost)||0), 0)
  const grandLo  = totals.lo + actTotal
  const grandHi  = totals.hi + actTotal

  const hasContent = COST_CATS.some(c => C[c.id]) || actTotal > 0

  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'8px 11px', color:'rgba(255,248,240,0.85)', fontSize:'0.78rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ background:'rgba(91,140,90,0.05)', border:'1px solid rgba(91,140,90,0.14)', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: open||hasContent ? 12 : 0 }}>
        <span style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(91,140,90,0.75)', fontWeight:700 }}>💰 Odhadované náklady</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {(grandLo > 0 || grandHi > 0) && (
            <span style={{ fontSize:'0.78rem', fontWeight:800, color:'rgba(91,140,90,0.9)' }}>
              €{grandLo === grandHi ? grandLo : `${grandLo}–${grandHi}`}
            </span>
          )}
          <span style={{ fontSize:10, color:'rgba(255,248,240,0.2)', transform:open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }}>▼</span>
        </div>
      </button>

      {/* Summary when collapsed */}
      {!open && hasContent && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {COST_CATS.filter(c => C[c.id]).map(c => (
            <span key={c.id} style={{ fontSize:'0.68rem', color:'rgba(255,248,240,0.4)' }}>{c.icon} {c.label}: <strong style={{ color:'rgba(91,140,90,0.8)' }}>€{C[c.id]}</strong></span>
          ))}
          {actTotal > 0 && <span style={{ fontSize:'0.68rem', color:'rgba(255,248,240,0.4)' }}>🎯 Aktivity: <strong style={{ color:'rgba(91,140,90,0.8)' }}>€{actTotal}</strong></span>}
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }} style={{ overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {COST_CATS.map(cat => (
                <div key={cat.id}>
                  <label style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(91,140,90,0.55)', fontWeight:700, display:'block', marginBottom:4 }}>{cat.icon} {cat.label}</label>
                  <input value={C[cat.id]||''} onChange={e=>set(cat.id,e.target.value)}
                    placeholder="€0 alebo €10-20" style={{ ...inp, border:'1px solid rgba(91,140,90,0.18)' }}/>
                </div>
              ))}
            </div>

            {/* Activity costs breakdown */}
            {actTotal > 0 && (
              <div style={{ marginBottom:12, padding:'8px 12px', borderRadius:10, background:'rgba(91,140,90,0.06)', border:'1px solid rgba(91,140,90,0.15)' }}>
                <div style={{ fontSize:'0.62rem', color:'rgba(91,140,90,0.6)', fontWeight:700, marginBottom:5 }}>Z aktivít</div>
                {(activities||[]).filter(a=>a.cost).map(a => (
                  <div key={a.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.68rem', color:'rgba(255,248,240,0.45)', marginBottom:3 }}>
                    <span>{getCatIcon(a.category)} {a.title}</span>
                    <span style={{ color:'rgba(91,140,90,0.75)' }}>€{a.cost}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop:'1px solid rgba(91,140,90,0.2)' }}>
              <span style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,248,240,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Spolu odhad</span>
              <span style={{ fontSize:'1.1rem', fontWeight:900, color:'rgba(91,140,90,0.9)' }}>
                €{grandLo === grandHi ? grandLo : `${grandLo}–${grandHi}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Day templates ────────────────────────────────────────────
const TEMPLATES = [
  {
    id:'plaz', label:'Plážový deň', icon:'🏖️', color:'#0CB4CC',
    activities:[
      { block:'rano',       title:'Raňajky v hoteli',         category:'jedlo',    participants:['vsetci'] },
      { block:'dopoludnie', title:'Pláž dopoludnia',           category:'plaz',     participants:['vsetci'], bring:['opaľovací krém','uteráky','voda'] },
      { block:'obed',       title:'Obed pri pláži',            category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Oddych / Elizabethka spí',  category:'oddych',   participants:['elizabethka'] },
      { block:'poobede',    title:'Plávanie poobede',          category:'plaz',     participants:['norbi','natalita'] },
      { block:'vecer',      title:'Večera v reštaurácii',      category:'jedlo',    participants:['vsetci'] },
      { block:'ak_bude_cas',title:'Prechádzka po promenáde',   category:'volny_cas',participants:['vsetci'] },
    ],
  },
  {
    id:'vylet', label:'Výletný deň', icon:'🗺️', color:'#7B5EA7',
    activities:[
      { block:'rano',       title:'Skoré raňajky',             category:'jedlo',    participants:['vsetci'] },
      { block:'dopoludnie', title:'Presun na výlet',            category:'presun',   participants:['vsetci'] },
      { block:'dopoludnie', title:'Hlavná atrakcia',            category:'vylet',    participants:['vsetci'] },
      { block:'obed',       title:'Obed vonku',                 category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Prehliadka / pokračovanie',  category:'atrakcia', participants:['vsetci'] },
      { block:'vecer',      title:'Návrat do hotela',           category:'presun',   participants:['vsetci'] },
      { block:'vecer',      title:'Večera',                     category:'jedlo',    participants:['vsetci'] },
    ],
  },
  {
    id:'oddych', label:'Oddychový deň', icon:'😴', color:'#5B8C5A',
    activities:[
      { block:'rano',       title:'Pomalé raňajky',             category:'jedlo',    participants:['vsetci'] },
      { block:'dopoludnie', title:'Bazén / relax',               category:'oddych',   participants:['vsetci'] },
      { block:'obed',       title:'Ľahký obed',                 category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Poobedný odpočinok',          category:'oddych',   participants:['vsetci'] },
      { block:'vecer',      title:'Večera v pokoji',             category:'jedlo',    participants:['vsetci'] },
      { block:'ak_bude_cas',title:'Filmový večer',               category:'volny_cas',participants:['vsetci'] },
    ],
  },
  {
    id:'cestovny', label:'Cestovný deň', icon:'✈️', color:'#C17F3E',
    activities:[
      { block:'rano',       title:'Raňajky a balenie',          category:'dolezite', participants:['vsetci'] },
      { block:'dopoludnie', title:'Check-out z hotela',          category:'dolezite', participants:['vsetci'] },
      { block:'dopoludnie', title:'Presun na letisko',           category:'presun',   participants:['vsetci'] },
      { block:'obed',       title:'Obed na letisku',             category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Let domov',                   category:'presun',   participants:['vsetci'], time:'14:00' },
    ],
  },
  {
    id:'lod', label:'Lodný výlet', icon:'⛵', color:'#0CB4CC',
    activities:[
      { block:'rano',       title:'Raňajky a príprava',         category:'jedlo',    participants:['vsetci'] },
      { block:'dopoludnie', title:'Nástup na loď',               category:'dolezite', participants:['vsetci'] },
      { block:'dopoludnie', title:'Plávanie v mori',             category:'plaz',     participants:['vsetci'] },
      { block:'obed',       title:'Obed na lodi',                category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Blue Lagoon / zastávka',      category:'vylet',    participants:['vsetci'] },
      { block:'vecer',      title:'Návrat do prístavu',          category:'presun',   participants:['vsetci'] },
      { block:'vecer',      title:'Večera',                      category:'jedlo',    participants:['vsetci'] },
    ],
  },
  {
    id:'mesto', label:'Mestský deň', icon:'🏙️', color:'#7B5EA7',
    activities:[
      { block:'rano',       title:'Raňajky v kaviarni',          category:'jedlo',    participants:['vsetci'] },
      { block:'dopoludnie', title:'Centrum mesta / prechádzka',  category:'vylet',    participants:['vsetci'] },
      { block:'obed',       title:'Obed v meste',                category:'jedlo',    participants:['vsetci'] },
      { block:'poobede',    title:'Nákupy / suveníry',           category:'nakupy',   participants:['vsetci'] },
      { block:'poobede',    title:'Kaviareň / pohoda',           category:'oddych',   participants:['vsetci'] },
      { block:'vecer',      title:'Večera v meste',              category:'jedlo',    participants:['vsetci'] },
    ],
  },
]

function TemplatesModal({ onApply, onClose }) {
  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="modal-sheet" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:40, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:300 }}
        style={{ maxWidth:480 }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#fff', margin:0 }}>Šablóna dňa</h3>
            <p style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.35)', margin:'4px 0 0' }}>Vyber šablónu — aktivity sa pridajú k tomuto dňu</p>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,248,240,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={13}/></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {TEMPLATES.map(tmpl => (
            <motion.button key={tmpl.id} whileHover={{ x:3 }} whileTap={{ scale:0.98 }}
              onClick={() => onApply(tmpl)}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14,
                background:`rgba(${tmpl.color==='#0CB4CC'?'12,180,204':tmpl.color==='#7B5EA7'?'123,94,167':tmpl.color==='#5B8C5A'?'91,140,90':tmpl.color==='#C17F3E'?'193,127,62':'12,180,204'},0.08)`,
                border:`1px solid ${tmpl.color}28`, cursor:'pointer', textAlign:'left' }}>
              <span style={{ fontSize:26, flexShrink:0 }}>{tmpl.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.85rem', fontWeight:800, color:'rgba(255,248,240,0.9)' }}>{tmpl.label}</div>
                <div style={{ fontSize:'0.62rem', color:'rgba(255,248,240,0.35)', marginTop:3 }}>
                  {tmpl.activities.length} aktivít · {[...new Set(tmpl.activities.map(a=>BLOCKS.find(b=>b.id===a.block)?.label))].join(', ')}
                </div>
              </div>
              <span style={{ fontSize:'0.65rem', color:tmpl.color, fontWeight:700, flexShrink:0 }}>Použiť →</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Plan component ──────────────────────────────────────
export default function Plan() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const trips   = loadTrips()
  const trip    = trips.find(t => t.id === id)

  const [plan, setPlan]     = useState(() => trip ? loadPlan(id, trip) : { days:[], ideas:[] })
  const [activeDayId, setActiveDayId] = useState(() => plan.days[0]?.id)
  const [showActivityModal, setShowActivityModal] = useState(null)
  const [showEditDay, setShowEditDay] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Auto-save
  useEffect(() => { if (trip) savePlan(id, plan) }, [plan, id])

  if (!trip) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,248,240,0.4)' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'3rem' }}>🗺️</p>
        <p>Cesta nenájdená</p>
        <button onClick={() => navigate('/timeline')} style={{ marginTop:16, color:'#0CB4CC', background:'none', border:'none', cursor:'pointer' }}>
          Späť na cesty
        </button>
      </div>
    </div>
  )

  const activeDay = plan.days.find(d => d.id === activeDayId) || plan.days[0]
  const activeDayIndex = plan.days.findIndex(d => d.id === activeDayId)

  // ── Mutations ──
  function updatePlan(fn) { setPlan(p => { const next = fn(p); return { ...next } }) }

  function updateDay(dayId, fn) {
    updatePlan(p => ({ ...p, days: p.days.map(d => d.id===dayId ? fn(d) : d) }))
  }

  function addActivity(dayId, activity) {
    updateDay(dayId, d => ({ ...d, activities: [...d.activities, activity] }))
  }
  function editActivity(dayId, updated) {
    updateDay(dayId, d => ({ ...d, activities: d.activities.map(a => a.id===updated.id ? updated : a) }))
  }
  function deleteActivity(dayId, actId) {
    updateDay(dayId, d => ({ ...d, activities: d.activities.filter(a => a.id!==actId) }))
  }
  function toggleDone(dayId, actId) {
    updateDay(dayId, d => ({ ...d, activities: d.activities.map(a => a.id===actId ? {...a, done:!a.done} : a) }))
  }
  function moveBlock(dayId, actId, newBlock) {
    updateDay(dayId, d => ({ ...d, activities: d.activities.map(a => a.id===actId ? {...a, block:newBlock} : a) }))
  }
  function copyActivityToDay(targetDayId, activity) {
    const copy = { ...activity, id:generateId(), done:false }
    updateDay(targetDayId, d => ({ ...d, activities: [...d.activities, copy] }))
  }
  function applyTemplate(dayId, template) {
    const newActs = template.activities.map(a => ({
      ...a, id:generateId(), time: a.time||'', duration:'', location:'',
      notes:'', bring:[], done:false,
      participants: a.participants||['vsetci'],
    }))
    updateDay(dayId, d => ({ ...d, activities: [...d.activities, ...newActs] }))
    setShowTemplates(false)
  }
  function updateNotes(dayId, notes) {
    updateDay(dayId, d => ({ ...d, notes }))
  }
  function updateDayMeta(dayId, meta) {
    updateDay(dayId, d => ({ ...d, ...meta }))
  }
  function updateIdeas(ideas) {
    updatePlan(p => ({ ...p, ideas }))
  }
  function updateReservations(dayId, reservations) {
    updateDay(dayId, d => ({ ...d, reservations }))
  }
  function updateLogistics(dayId, logistics) {
    updateDay(dayId, d => ({ ...d, logistics }))
  }
  function updateFamilyNotes(dayId, familyNotes) {
    updateDay(dayId, d => ({ ...d, familyNotes }))
  }
  function updateCosts(dayId, costs) {
    updateDay(dayId, d => ({ ...d, costs }))
  }

  // Day stats
  const allActs   = activeDay?.activities || []
  const doneCount = allActs.filter(a => a.done).length
  const totalCount = allActs.length

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%,rgba(12,180,204,0.09) 0%,transparent 55%),linear-gradient(180deg,#0A1628 0%,#060D1A 100%)' }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 20px 14px' }}>
        <motion.button whileHover={{ x:-2 }} whileTap={{ scale:0.97 }}
          onClick={() => navigate(`/trip/${id}`)} className="float-btn">
          <ArrowLeft size={14}/>
          <span style={{ marginLeft:6, fontSize:'0.8rem' }}>{trip.destination}</span>
        </motion.button>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* Prev/next day arrows */}
          <button onClick={() => activeDayIndex > 0 && setActiveDayId(plan.days[activeDayIndex-1].id)}
            disabled={activeDayIndex <= 0}
            style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color: activeDayIndex<=0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,248,240,0.5)', cursor: activeDayIndex<=0 ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronLeft size={14}/>
          </button>
          <button onClick={() => activeDayIndex < plan.days.length-1 && setActiveDayId(plan.days[activeDayIndex+1].id)}
            disabled={activeDayIndex >= plan.days.length-1}
            style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color: activeDayIndex>=plan.days.length-1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,248,240,0.5)', cursor: activeDayIndex>=plan.days.length-1 ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 16px 100px' }}>

        {/* Module header */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} style={{ marginBottom:20 }}>
          <div style={{ fontSize:'0.58rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#0CB4CC', opacity:0.75, marginBottom:5 }}>
            📅 Plán · {trip.destination}
          </div>
          <h1 style={{ fontSize:'clamp(1.8rem,5vw,2.4rem)', fontWeight:900, color:'#fff', margin:0, lineHeight:1, letterSpacing:'-0.02em' }}>
            Denný plán
          </h1>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,248,240,0.3)', marginTop:6, fontWeight:300, fontStyle:'italic' }}>
            {plan.days.length} dní · {trip.dateFrom} – {trip.dateTo}
          </p>
        </motion.div>

        {/* Day strip */}
        <DayStrip days={plan.days} activeDayId={activeDay?.id} onSelect={setActiveDayId} tripColor={trip.color}/>

        {/* Active day header */}
        {activeDay && (
          <motion.div
            key={activeDay.id}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.35 }}
          >
            <div style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
              borderRadius:18, padding:'18px 20px', marginBottom:20,
            }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:22 }}>{activeDay.icon || '📅'}</span>
                    <div>
                      <div style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,248,240,0.35)', fontWeight:700 }}>
                        Deň {activeDay.number} z {plan.days.length}
                      </div>
                      <h2 style={{ fontSize:'1.15rem', fontWeight:900, color:'#fff', margin:0, lineHeight:1.1 }}>
                        {fmtDateFull(activeDay.date)}
                      </h2>
                    </div>
                  </div>
                  {activeDay.label && (
                    <span style={{ display:'inline-block', fontSize:'0.72rem', fontWeight:700, color:'#3DCFE4', background:'rgba(12,180,204,0.12)', border:'1px solid rgba(12,180,204,0.28)', borderRadius:20, padding:'3px 12px', marginTop:6 }}>
                      {activeDay.label}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:7, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
                  {totalCount > 0 && (
                    <div style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.35)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'4px 10px' }}>
                      {doneCount}/{totalCount} ✓
                    </div>
                  )}
                  <button onClick={() => setShowTemplates(true)}
                    style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', fontWeight:600, color:'rgba(255,248,240,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'4px 12px', cursor:'pointer' }}>
                    ✦ Šablóna
                  </button>
                  <button onClick={() => setShowEditDay(true)}
                    style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', fontWeight:600, color:'rgba(255,248,240,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'4px 12px', cursor:'pointer' }}>
                    <Edit3 size={11}/> Upraviť deň
                  </button>
                  <button
                    onClick={() => {
                      const src = activeDay
                      const newDay = { ...src, id:`day-copy-${Date.now()}`, number: plan.days.length+1, label:`Kópia · ${src.label||'Deň'}`,
                        activities: src.activities.map(a => ({ ...a, id:generateId(), done:false })),
                        notes: src.notes.map(n => ({ ...n, id:generateId() })),
                      }
                      updatePlan(p => ({ ...p, days:[...p.days, newDay] }))
                    }}
                    style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', fontWeight:600, color:'rgba(255,248,240,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'4px 12px', cursor:'pointer' }}>
                    <Copy size={11}/> Duplikovať
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {totalCount === 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ textAlign:'center', padding:'32px 20px', color:'rgba(255,248,240,0.25)', marginBottom:16 }}>
                <p style={{ fontSize:'2rem', marginBottom:8 }}>🌴</p>
                <p style={{ fontSize:'0.85rem', fontStyle:'italic', marginBottom:16 }}>
                  Voľný deň — oddych alebo pridaj prvý plán.
                </p>
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                  onClick={() => setShowActivityModal({ block:'dopoludnie' })}
                  style={{ padding:'10px 24px', borderRadius:20, background:'rgba(12,180,204,0.14)', border:'1px solid rgba(12,180,204,0.35)', color:'#3DCFE4', fontSize:'0.8rem', fontWeight:700, cursor:'pointer' }}>
                  + Pridať prvú aktivitu
                </motion.button>
              </motion.div>
            )}

            {/* Time blocks */}
            {BLOCKS.map(block => (
              <TimeBlock
                key={block.id}
                block={block}
                activities={activeDay.activities}
                onAdd={blockId => setShowActivityModal({ block: blockId })}
                onEdit={act => setShowActivityModal({ act })}
                onDelete={actId => deleteActivity(activeDay.id, actId)}
                onToggleDone={actId => toggleDone(activeDay.id, actId)}
                onMoveBlock={(actId, newBlock) => moveBlock(activeDay.id, actId, newBlock)}
                onCopyToDay={(targetDayId, act) => copyActivityToDay(targetDayId, act)}
                days={plan.days}
              />
            ))}

            {/* Global add button */}
            <motion.button
              whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowActivityModal({ block:'dopoludnie' })}
              style={{ width:'100%', padding:'12px', borderRadius:14, marginBottom:16, background:'rgba(12,180,204,0.08)', border:'1px dashed rgba(12,180,204,0.28)', color:'rgba(12,180,204,0.7)', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <Plus size={14}/> Pridať aktivitu
            </motion.button>

            {/* Day notes */}
            <DayNotes
              notes={activeDay.notes || []}
              onChange={notes => updateNotes(activeDay.id, notes)}
            />

            {/* Reservations */}
            <DayReservations
              reservations={activeDay.reservations || []}
              onChange={res => updateReservations(activeDay.id, res)}
            />

            {/* Logistics */}
            <DayLogistics
              logistics={activeDay.logistics || {}}
              onChange={log => updateLogistics(activeDay.id, log)}
            />

            {/* Family notes */}
            <FamilyNotes
              familyNotes={activeDay.familyNotes || {}}
              onChange={fn => updateFamilyNotes(activeDay.id, fn)}
            />

            {/* Cost estimate */}
            <CostEstimate
              costs={activeDay.costs || {}}
              onChange={c => updateCosts(activeDay.id, c)}
              activities={activeDay.activities}
            />
          </motion.div>
        )}

        {/* Ideas bucket */}
        <IdeasBucket
          ideas={plan.ideas}
          onChange={updateIdeas}
          days={plan.days}
          activeDayId={activeDay?.id}
          onAddToDay={(dayId, act) => addActivity(dayId, act)}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showActivityModal && (
          <ActivityModal
            activity={showActivityModal.act || null}
            dayId={activeDay?.id}
            days={plan.days}
            onSave={act => {
              if (showActivityModal.act) {
                editActivity(activeDay.id, act)
              } else {
                addActivity(activeDay.id, { ...act, block: showActivityModal.block || act.block })
              }
              setShowActivityModal(null)
            }}
            onClose={() => setShowActivityModal(null)}
          />
        )}
        {showTemplates && (
          <TemplatesModal
            onApply={tmpl => applyTemplate(activeDay.id, tmpl)}
            onClose={() => setShowTemplates(false)}
          />
        )}
        {showEditDay && activeDay && (
          <EditDayModal
            day={activeDay}
            onSave={meta => { updateDayMeta(activeDay.id, meta); setShowEditDay(false) }}
            onClose={() => setShowEditDay(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
