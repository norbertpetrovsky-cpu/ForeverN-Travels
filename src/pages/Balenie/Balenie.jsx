import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Check, Trash2 } from 'lucide-react'
import { loadTrips } from '../../data/trips'

// ─── Person config ────────────────────────────────────────────
const PEOPLE = [
  { id:'norbi',       name:'Norbi',       emoji:'👨', color:'#0CB4CC', colorRgb:'12,180,204'  },
  { id:'natalita',    name:'Natalita',    emoji:'👩', color:'#FF6B6B', colorRgb:'255,107,107' },
  { id:'elizabethka', name:'Elizabethka', emoji:'👧', color:'#A78BFA', colorRgb:'167,139,250' },
]

// ─── Default categories per person ───────────────────────────
const SHARED_BASE = (prefix) => [
  {
    id:`${prefix}_oblecenie`, label:'Oblečenie', icon:'👕', color:'#7B5EA7',
    items:[
      { id:`${prefix}_o1`, text:'Plavky (2×)' },
      { id:`${prefix}_o2`, text:'Letné šaty / šortky' },
      { id:`${prefix}_o3`, text:'Večerné oblečenie' },
      { id:`${prefix}_o4`, text:'Ľahká bunda / sveter' },
      { id:`${prefix}_o5`, text:'Spodné prádlo' },
      { id:`${prefix}_o6`, text:'Sandále' },
    ],
  },
  {
    id:`${prefix}_plaz`, label:'Pláž & More', icon:'🏖️', color:'#0CB4CC',
    items:[
      { id:`${prefix}_p1`, text:'Opaľovací krém SPF 50' },
      { id:`${prefix}_p2`, text:'Slnečné okuliare' },
      { id:`${prefix}_p3`, text:'Klobúk / šiltovka' },
      { id:`${prefix}_p4`, text:'Uterák na pláž' },
    ],
  },
  {
    id:`${prefix}_lieky`, label:'Lieky & Zdravie', icon:'💊', color:'#FF9B9B',
    items:[
      { id:`${prefix}_l1`, text:'Pravidelné lieky' },
      { id:`${prefix}_l2`, text:'Lieky na bolenie hlavy' },
      { id:`${prefix}_l3`, text:'Náplasti' },
    ],
  },
  {
    id:`${prefix}_toaleta`, label:'Toaletné potreby', icon:'🧴', color:'#5B8C5A',
    items:[
      { id:`${prefix}_t1`, text:'Zubná kefka + pasta' },
      { id:`${prefix}_t2`, text:'Šampón + sprchový gél' },
      { id:`${prefix}_t3`, text:'Dezodorant' },
    ],
  },
]

const DEFAULT_PEOPLE_LISTS = {
  norbi: [
    {
      id:'n_doklady', label:'Doklady & Financie', icon:'🛂', color:'#C17F3E',
      items:[
        { id:'n_d1', text:'Cestovné pasy (celá rodina)' },
        { id:'n_d2', text:'Letenky (vytlačené)' },
        { id:'n_d3', text:'Potvrdenie hotela' },
        { id:'n_d4', text:'Cestovné poistenie' },
        { id:'n_d5', text:'Kreditné karty' },
        { id:'n_d6', text:'Hotovosť v eurách' },
      ],
    },
    ...SHARED_BASE('n'),
    {
      id:'n_elektronika', label:'Elektronika', icon:'📱', color:'#3DCFE4',
      items:[
        { id:'n_e1', text:'Telefón + nabíjačka' },
        { id:'n_e2', text:'Power bank' },
        { id:'n_e3', text:'Fotoaparát' },
        { id:'n_e4', text:'Redukcia zástrčiek (EU)' },
        { id:'n_e5', text:'Slúchadlá' },
      ],
    },
    {
      id:'n_holenie', label:'Holiace potreby', icon:'🪒', color:'#C17F3E',
      items:[
        { id:'n_h1', text:'Holiaci strojček' },
        { id:'n_h2', text:'Aftershave' },
        { id:'n_h3', text:'Parfum' },
      ],
    },
  ],

  natalita: [
    ...SHARED_BASE('na'),
    {
      id:'na_kozmetika', label:'Kozmetika & Krása', icon:'💄', color:'#FF6B6B',
      items:[
        { id:'na_k1', text:'Make-up' },
        { id:'na_k2', text:'Parfum' },
        { id:'na_k3', text:'Krém na tvár' },
        { id:'na_k4', text:'Lak na nechty' },
        { id:'na_k5', text:'Vlasové doplnky' },
      ],
    },
    {
      id:'na_elektronika', label:'Elektronika', icon:'📱', color:'#3DCFE4',
      items:[
        { id:'na_e1', text:'Telefón + nabíjačka' },
        { id:'na_e2', text:'Tablet / iPad' },
        { id:'na_e3', text:'Slúchadlá' },
      ],
    },
  ],

  elizabethka: [
    {
      id:'e_oblecenie', label:'Oblečenie', icon:'👗', color:'#A78BFA',
      items:[
        { id:'e_o1', text:'Plavky (2×)' },
        { id:'e_o2', text:'Oblečenie (7 dní)' },
        { id:'e_o3', text:'Sandálky + topánky' },
        { id:'e_o4', text:'Klobúčik' },
        { id:'e_o5', text:'Pyžamo' },
      ],
    },
    {
      id:'e_plaz', label:'Na pláž', icon:'🏖️', color:'#0CB4CC',
      items:[
        { id:'e_p1', text:'Detský opaľovací krém SPF 50' },
        { id:'e_p2', text:'Plávací kruh / rukávniky' },
        { id:'e_p3', text:'Piesočné hračky' },
        { id:'e_p4', text:'Plážový uterák' },
        { id:'e_p5', text:'Slnečné okuliare pre deti' },
      ],
    },
    {
      id:'e_hracky', label:'Hračky & Zábava', icon:'🧸', color:'#A78BFA',
      items:[
        { id:'e_h1', text:'Obľúbená hračka / plyšák' },
        { id:'e_h2', text:'Tablet + slúchadlá (na cestu)' },
        { id:'e_h3', text:'Omaľovánky / pastelky' },
        { id:'e_h4', text:'Knihy' },
      ],
    },
    {
      id:'e_lieky', label:'Lieky pre Elizabethku', icon:'💊', color:'#FF9B9B',
      items:[
        { id:'e_l1', text:'Detské lieky na horúčku' },
        { id:'e_l2', text:'Náplasti (detské)' },
        { id:'e_l3', text:'Kvapky do nosa' },
        { id:'e_l4', text:'Vitamíny' },
      ],
    },
    {
      id:'e_toaleta', label:'Toaletné potreby', icon:'🧴', color:'#5B8C5A',
      items:[
        { id:'e_t1', text:'Detský šampón + kúpací gél' },
        { id:'e_t2', text:'Zubná kefka + pasta (detská)' },
        { id:'e_t3', text:'Vlhčené obrúsky' },
      ],
    },
  ],
}

// ─── Storage ──────────────────────────────────────────────────
function storageKey(tripId) { return `fn_balenie2_${tripId}` }

function loadAllLists(tripId) {
  try {
    const raw = localStorage.getItem(storageKey(tripId))
    if (raw) return JSON.parse(raw)
  } catch {}
  // Deep clone defaults
  const out = {}
  for (const p of PEOPLE) {
    out[p.id] = DEFAULT_PEOPLE_LISTS[p.id].map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, checked: false })),
    }))
  }
  return out
}

function saveAllLists(tripId, data) {
  try { localStorage.setItem(storageKey(tripId), JSON.stringify(data)) } catch {}
}

function generateId() {
  return `i-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
}

function getStats(categories) {
  const all = categories.flatMap(c => c.items)
  return { total: all.length, checked: all.filter(i => i.checked).length }
}

// ─── Mini progress card (per person) ─────────────────────────
function PersonProgress({ person, categories, isActive, onClick }) {
  const { total, checked } = getStats(categories)
  const pct     = total === 0 ? 0 : Math.round((checked / total) * 100)
  const isReady = pct === 100

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y:-2 }}
      whileTap={{ scale:0.97 }}
      style={{
        flex:1, minWidth:0,
        padding:'14px 16px', borderRadius:16,
        background: isActive
          ? `rgba(${person.colorRgb},0.14)`
          : 'rgba(255,255,255,0.04)',
        border:`1px solid ${isActive ? `rgba(${person.colorRgb},0.45)` : 'rgba(255,255,255,0.08)'}`,
        cursor:'pointer', textAlign:'left',
        boxShadow: isActive ? `0 4px 20px rgba(${person.colorRgb},0.15)` : 'none',
        transition:'all 0.25s',
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${person.color},transparent)`, opacity: isActive ? 1 : 0.4 }}/>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ fontSize:18 }}>{person.emoji}</span>
        <span style={{ fontSize:'0.72rem', fontWeight:700, color: isActive ? person.color : 'rgba(255,248,240,0.55)' }}>
          {person.name}
        </span>
        {isReady && <span style={{ fontSize:9, color:person.color, fontWeight:700 }}>✓</span>}
      </div>

      <div style={{ fontSize:'1.3rem', fontWeight:900, color: isReady ? person.color : 'rgba(255,248,240,0.9)', marginBottom:6, lineHeight:1 }}>
        {pct}%
      </div>

      <div style={{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
        <motion.div
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
          style={{ height:'100%', borderRadius:2, background:person.color, boxShadow: isReady ? `0 0 8px ${person.color}` : 'none' }}
        />
      </div>

      <div style={{ fontSize:'0.58rem', color:'rgba(255,248,240,0.28)', marginTop:5, letterSpacing:'0.06em' }}>
        {checked}/{total} položiek
      </div>
    </motion.button>
  )
}

// ─── Family overview progress ─────────────────────────────────
function FamilyProgress({ lists, tripColor }) {
  const allItems  = PEOPLE.flatMap(p => lists[p.id]?.flatMap(c => c.items) || [])
  const total     = allItems.length
  const checked   = allItems.filter(i => i.checked).length
  const pct       = total === 0 ? 0 : Math.round((checked / total) * 100)
  const isReady   = pct === 100

  return (
    <div style={{
      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:20, padding:'20px 24px', marginBottom:16,
      position:'relative', overflow:'hidden',
    }}>
      {/* Suitcase silhouette */}
      <svg style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', opacity:0.04, pointerEvents:'none' }}
        width="110" height="82" viewBox="0 0 120 90">
        <rect x="10" y="20" width="100" height="68" rx="8" fill="white"/>
        <rect x="38" y="8" width="44" height="16" rx="6" fill="none" stroke="white" strokeWidth="4"/>
        <line x1="10" y1="54" x2="110" y2="54" stroke="white" strokeWidth="2" opacity=".5"/>
        <circle cx="60" cy="54" r="5" fill="white"/>
      </svg>

      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(255,248,240,0.3)', fontWeight:700, marginBottom:3 }}>
              Rodinná pripravenosť
            </div>
            <div style={{ fontSize:'1.5rem', fontWeight:900, color: isReady ? '#3DCFE4' : 'rgba(255,248,240,0.9)', lineHeight:1 }}>
              {pct}%
              {isReady && <span style={{ fontSize:'0.9rem', marginLeft:8, color:'#3DCFE4' }}>✓ Rodina zabalená!</span>}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'1.4rem', fontWeight:900, color:tripColor }}>{checked}</div>
            <div style={{ fontSize:'0.58rem', color:'rgba(255,248,240,0.28)', letterSpacing:'0.08em' }}>z {total}</div>
          </div>
        </div>

        <div style={{ height:5, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
          <motion.div
            animate={{ width:`${pct}%` }}
            transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
            style={{
              height:'100%', borderRadius:3,
              background: isReady ? 'linear-gradient(90deg,#0CB4CC,#3DCFE4)' : `linear-gradient(90deg,${tripColor}88,${tripColor})`,
              boxShadow: isReady ? '0 0 12px #0CB4CC88' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Packing item — with inline text editing ──────────────────
function PackingItem({ item, catColor, onToggle, onDelete, onEdit, index }) {
  const [hovering, setHovering] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [draft,    setDraft]    = useState(item.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function startEdit() {
    setDraft(item.text)
    setEditing(true)
  }

  function commitEdit() {
    const t = draft.trim()
    if (t && t !== item.text) onEdit(item.id, t)
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(item.text)
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity:0, x:-8 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:index*0.03, duration:0.3, ease:[0.22,1,0.36,1] }}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Checkbox — never triggers edit */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale:0.88 }}
        style={{
          width:22, height:22, borderRadius:6, flexShrink:0,
          border:`1.5px solid ${item.checked ? catColor : 'rgba(255,255,255,0.2)'}`,
          background: item.checked ? catColor : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'all 0.22s ease',
          boxShadow: item.checked ? `0 0 8px ${catColor}55` : 'none',
        }}
      >
        <AnimatePresence>
          {item.checked && (
            <motion.div
              initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
              transition={{ type:'spring', stiffness:400, damping:20 }}
            >
              <Check size={12} color="white" strokeWidth={3}/>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Text — click to edit */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') cancelEdit()
          }}
          onBlur={commitEdit}
          style={{
            flex:1, fontSize:'0.8rem',
            background:'rgba(255,255,255,0.06)',
            border:`1px solid ${catColor}55`,
            borderRadius:7, padding:'3px 8px',
            color:'rgba(255,248,240,0.9)',
            fontFamily:'inherit', outline:'none',
            boxShadow:`0 0 0 2px ${catColor}22`,
          }}
        />
      ) : (
        <span
          onClick={startEdit}
          title="Kliknite pre úpravu"
          style={{
            flex:1, fontSize:'0.8rem',
            color: item.checked ? 'rgba(255,248,240,0.3)' : 'rgba(255,248,240,0.82)',
            fontStyle: item.checked ? 'italic' : 'normal',
            transition:'color 0.3s',
            cursor:'text',
          }}
        >
          {item.checked ? `✓ ${item.text}` : item.text}
        </span>
      )}

      {/* Delete — only on hover, not while editing */}
      <AnimatePresence>
        {hovering && !editing && (
          <motion.button
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
            onClick={onDelete}
            style={{ width:24, height:24, borderRadius:6, background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.2)', color:'rgba(255,107,107,0.6)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}
          >
            <X size={11}/>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Category compartment ─────────────────────────────────────
function CategoryCompartment({ cat, onToggleItem, onAddItem, onDeleteItem, onDeleteCategory, onEditItem }) {
  const [adding, setAdding]   = useState(false)
  const [newText, setNewText] = useState('')
  const [open, setOpen]       = useState(true)
  const inputRef              = useRef(null)

  const checkedCount = cat.items.filter(i => i.checked).length
  const total        = cat.items.length
  const allDone      = total > 0 && checkedCount === total
  const catPct       = total === 0 ? 0 : checkedCount / total

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus() }, [adding])

  function handleAdd() {
    const t = newText.trim()
    if (!t) { setAdding(false); return }
    onAddItem(cat.id, t)
    setNewText('')
  }

  return (
    <div style={{
      marginBottom:12,
      background:'rgba(255,255,255,0.03)',
      border:`1px solid ${cat.color}28`,
      borderRadius:16, overflow:'hidden',
      boxShadow: allDone ? `0 0 16px ${cat.color}14` : 'none',
      transition:'box-shadow 0.4s',
    }}>
      <div style={{ height:2, background:`linear-gradient(90deg,transparent,${cat.color}77,transparent)` }}/>

      <div onClick={() => setOpen(o => !o)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer' }}>
        <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:`${cat.color}18`, border:`1px solid ${cat.color}2e`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
          {cat.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:'0.78rem', fontWeight:700, color: allDone ? cat.color : 'rgba(255,248,240,0.82)', transition:'color 0.3s' }}>{cat.label}</span>
            {allDone && <span style={{ fontSize:8, color:cat.color, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>✓</span>}
          </div>
          <div style={{ marginTop:4, height:2, background:'rgba(255,255,255,0.07)', borderRadius:1, overflow:'hidden' }}>
            <motion.div animate={{ width:`${catPct*100}%` }} transition={{ duration:0.5 }} style={{ height:'100%', background:cat.color, borderRadius:1, opacity:0.65 }}/>
          </div>
        </div>
        <div style={{ fontSize:'0.62rem', fontWeight:700, color:`${cat.color}bb`, background:`${cat.color}12`, border:`1px solid ${cat.color}22`, borderRadius:20, padding:'2px 8px', flexShrink:0 }}>
          {checkedCount}/{total}
        </div>
        <div style={{ fontSize:10, color:'rgba(255,248,240,0.2)', transition:'transform 0.25s', transform:open?'rotate(180deg)':'rotate(0deg)' }}>▼</div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ padding:'0 16px 4px' }}>
              {cat.items.map((item, i) => (
                <PackingItem key={item.id} item={item} catColor={cat.color}
                  onToggle={() => onToggleItem(cat.id, item.id)}
                  onDelete={() => onDeleteItem(cat.id, item.id)}
                  onEdit={(itemId, newText) => onEditItem(cat.id, itemId, newText)}
                  index={i}
                />
              ))}

              <AnimatePresence>
                {adding && (
                  <motion.div
                    initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                    style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 0 4px' }}
                  >
                    <input
                      ref={inputRef}
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAdd()
                        if (e.key === 'Escape') { setAdding(false); setNewText('') }
                      }}
                      placeholder="Nová položka..."
                      style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${cat.color}44`, borderRadius:10, padding:'8px 12px', color:'rgba(255,248,240,0.9)', fontSize:'0.8rem', fontFamily:'inherit', outline:'none' }}
                    />
                    <button onClick={handleAdd} style={{ width:30, height:30, borderRadius:8, background:`${cat.color}22`, border:`1px solid ${cat.color}44`, color:cat.color, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={13}/>
                    </button>
                    <button onClick={() => { setAdding(false); setNewText('') }} style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,248,240,0.35)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <X size={13}/>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0 10px' }}>
                <button onClick={() => setAdding(true)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.65rem', color:`${cat.color}77`, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                  <Plus size={11}/> Pridať položku
                </button>
                <button onClick={() => onDeleteCategory(cat.id)} style={{ fontSize:'0.6rem', color:'rgba(255,248,240,0.16)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                  <Trash2 size={9}/> Odstrániť
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Add category modal ───────────────────────────────────────
const CAT_PRESETS = [
  { label:'Šport & Hobby',    icon:'⚽', color:'#0CB4CC' },
  { label:'Jedlo & Desiata',  icon:'🍎', color:'#5B8C5A' },
  { label:'Knihy & Zábava',   icon:'📚', color:'#7B5EA7' },
  { label:'Vlastná sekcia',   icon:'📦', color:'#C17F3E' },
]
const CAT_COLORS = ['#0CB4CC','#C17F3E','#5B8C5A','#7B5EA7','#FF9B9B','#A78BFA','#3DCFE4']

function AddCategoryModal({ onAdd, onClose }) {
  const [label, setLabel] = useState('')
  const [icon,  setIcon]  = useState('📦')
  const [color, setColor] = useState('#0CB4CC')

  function handleAdd() {
    const t = label.trim()
    if (!t) return
    onAdd({ id:`cat-${Date.now()}`, label:t, icon, color, items:[] })
    onClose()
  }

  return (
    <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div className="modal-sheet" initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
        transition={{ type:'spring', damping:28, stiffness:300 }} style={{ maxWidth:400 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>Nová sekcia kufra</h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,248,240,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={13}/>
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {CAT_PRESETS.map(p => (
            <button key={p.label} onClick={() => { setLabel(p.label); setIcon(p.icon); setColor(p.color) }}
              style={{ padding:'9px 12px', borderRadius:12, background:`${p.color}14`, border:`1px solid ${p.color}30`, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>{p.icon}</span>
              <span style={{ fontSize:'0.7rem', fontWeight:600, color:'rgba(255,248,240,0.65)' }}>{p.label}</span>
            </button>
          ))}
        </div>

        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Názov sekcie..." autoFocus
          onKeyDown={e => e.key==='Enter' && handleAdd()}
          style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 14px', color:'rgba(255,248,240,0.9)', fontSize:'0.85rem', fontFamily:'inherit', outline:'none', marginBottom:12, boxSizing:'border-box' }}/>

        <div style={{ display:'flex', gap:7, marginBottom:12, flexWrap:'wrap' }}>
          {['📦','🎽','👒','🔧','💻','🎮','🎵','📷','🍕','🏥','🌂','⚽'].map(e => (
            <button key={e} onClick={() => setIcon(e)}
              style={{ width:34, height:34, borderRadius:8, fontSize:16, cursor:'pointer', background: icon===e ? 'rgba(12,180,204,0.2)' : 'rgba(255,255,255,0.05)', border: icon===e ? '1px solid rgba(12,180,204,0.4)' : '1px solid transparent' }}>
              {e}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:7, marginBottom:18 }}>
          {CAT_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{ width:22, height:22, borderRadius:'50%', background:c, border: color===c ? '2px solid white' : '2px solid transparent', cursor:'pointer', flexShrink:0 }}/>
          ))}
        </div>

        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleAdd}
          style={{ width:'100%', padding:'11px', borderRadius:14, background:'linear-gradient(135deg,#0CB4CC,#0A8AA3)', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', border:'none' }}>
          Pridať sekciu
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Single person's checklist column ────────────────────────
function PersonList({ person, categories, onToggleItem, onAddItem, onDeleteItem, onDeleteCategory, onAddCategory, showAddBtn }) {
  const [showAddCat, setShowAddCat] = useState(false)
  return (
    <div style={{ flex:1, minWidth:0 }}>
      {showAddBtn && (
        <>
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.35 }}>
              <CategoryCompartment
                cat={cat}
                onToggleItem={onToggleItem}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
                onDeleteCategory={onDeleteCategory}
              />
            </motion.div>
          ))}
          <motion.button
            whileHover={{ scale:1.01, y:-1 }} whileTap={{ scale:0.98 }}
            onClick={() => setShowAddCat(true)}
            style={{ width:'100%', padding:'12px', borderRadius:14, marginTop:6, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.12)', color:'rgba(255,248,240,0.35)', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
          >
            <Plus size={12}/> Pridať sekciu
          </motion.button>
          <AnimatePresence>
            {showAddCat && (
              <AddCategoryModal
                onAdd={cat => { onAddCategory(cat); setShowAddCat(false) }}
                onClose={() => setShowAddCat(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

// ─── Main Balenie ─────────────────────────────────────────────
export default function Balenie() {
  const { id } = useParams()
  const navigate = useNavigate()
  const trips = loadTrips()
  const trip  = trips.find(t => t.id === id)

  const [lists, setLists] = useState(() => loadAllLists(id))
  const [personFilter, setPersonFilter] = useState('all')   // 'all' | 'norbi' | 'natalita' | 'elizabethka'
  const [showAddCat, setShowAddCat] = useState(false)

  useEffect(() => { saveAllLists(id, lists) }, [lists, id])

  const tripColor = trip?.color || '#0CB4CC'

  // Mutation helpers — always scoped to a person
  function toggleItem(personId, catId, itemId) {
    setLists(prev => ({
      ...prev,
      [personId]: prev[personId].map(c =>
        c.id !== catId ? c : { ...c, items: c.items.map(i => i.id !== itemId ? i : { ...i, checked: !i.checked }) }
      ),
    }))
  }
  function addItem(personId, catId, text) {
    setLists(prev => ({
      ...prev,
      [personId]: prev[personId].map(c =>
        c.id !== catId ? c : { ...c, items: [...c.items, { id:generateId(), text, checked:false }] }
      ),
    }))
  }
  function deleteItem(personId, catId, itemId) {
    setLists(prev => ({
      ...prev,
      [personId]: prev[personId].map(c =>
        c.id !== catId ? c : { ...c, items: c.items.filter(i => i.id !== itemId) }
      ),
    }))
  }
  function editItem(personId, catId, itemId, newText) {
    setLists(prev => ({
      ...prev,
      [personId]: prev[personId].map(c =>
        c.id !== catId ? c : { ...c, items: c.items.map(i => i.id !== itemId ? i : { ...i, text: newText }) }
      ),
    }))
  }
  function deleteCategory(personId, catId) {
    setLists(prev => ({ ...prev, [personId]: prev[personId].filter(c => c.id !== catId) }))
  }
  function addCategory(personId, cat) {
    setLists(prev => ({
      ...prev,
      [personId]: [...prev[personId], { ...cat, items: [] }],
    }))
  }

  function resetAll() {
    if (!window.confirm('Resetovať všetky zoznamy? Všetky zaškrtnutia sa vymažú.')) return
    setLists(prev => {
      const next = {}
      for (const p of PEOPLE) {
        next[p.id] = prev[p.id].map(c => ({ ...c, items: c.items.map(i => ({ ...i, checked:false })) }))
      }
      return next
    })
  }

  const activePeople = personFilter === 'all' ? PEOPLE : PEOPLE.filter(p => p.id === personFilter)

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%,rgba(12,180,204,0.1) 0%,transparent 55%),linear-gradient(180deg,#0A1628 0%,#060D1A 100%)' }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 20px 16px' }}>
        <motion.button whileHover={{ x:-2 }} whileTap={{ scale:0.97 }} onClick={() => navigate(`/trip/${id}`)} className="float-btn">
          <ArrowLeft size={14}/>
          <span style={{ marginLeft:6, fontSize:'0.8rem' }}>{trip?.destination || 'Späť'}</span>
        </motion.button>
        <button onClick={resetAll} style={{ fontSize:'0.65rem', color:'rgba(255,248,240,0.22)', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em' }}>
          Resetovať
        </button>
      </div>

      <div style={{ maxWidth: personFilter==='all' ? 1000 : 680, margin:'0 auto', padding:'0 16px 100px', transition:'max-width 0.4s ease' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:22 }}>
          <div style={{ fontSize:'0.58rem', letterSpacing:'0.25em', textTransform:'uppercase', color:tripColor, opacity:0.75, marginBottom:6 }}>
            🧳 Balenie · {trip?.destination}
          </div>
          <h1 style={{ fontSize:'clamp(1.8rem,5vw,2.4rem)', fontWeight:900, color:'#fff', margin:0, lineHeight:1, letterSpacing:'-0.02em' }}>
            Kufre & Tašky
          </h1>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,248,240,0.32)', marginTop:6, fontStyle:'italic', fontWeight:300 }}>
            Každá sekcia je priečinok kufra. Zaškrtnuté = zabalené.
          </p>
        </motion.div>

        {/* Family overview */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08, duration:0.5 }}>
          <FamilyProgress lists={lists} tripColor={tripColor}/>
        </motion.div>

        {/* Individual person progress cards */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14, duration:0.5 }}
          style={{ display:'flex', gap:10, marginBottom:22 }}>
          {PEOPLE.map(p => (
            <PersonProgress
              key={p.id}
              person={p}
              categories={lists[p.id] || []}
              isActive={personFilter === p.id}
              onClick={() => setPersonFilter(prev => prev === p.id ? 'all' : p.id)}
            />
          ))}
        </motion.div>

        {/* Person filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap' }}>
          {[{ key:'all', label:'👨‍👩‍👧 Všetci' }, ...PEOPLE.map(p => ({ key:p.id, label:`${p.emoji} ${p.name}` }))].map(f => {
            const person = PEOPLE.find(p => p.id === f.key)
            const accent = person ? person.color : tripColor
            const isAct  = personFilter === f.key
            return (
              <button key={f.key} onClick={() => setPersonFilter(f.key)}
                style={{
                  padding:'7px 16px', borderRadius:20, fontSize:'0.72rem', fontWeight:700,
                  cursor:'pointer', transition:'all 0.22s', letterSpacing:'0.03em',
                  background: isAct ? `${accent}20` : 'rgba(255,255,255,0.05)',
                  border:`1px solid ${isAct ? `${accent}55` : 'rgba(255,255,255,0.1)'}`,
                  color: isAct ? accent : 'rgba(255,248,240,0.38)',
                }}
              >{f.label}</button>
            )
          })}
        </div>

        {/* Content — all view: 3 columns (desktop), stacked (mobile) */}
        {personFilter === 'all' ? (
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
            {PEOPLE.map(person => {
              const cats = lists[person.id] || []
              const { total, checked } = getStats(cats)
              return (
                <div key={person.id} style={{ flex:'1 1 280px', minWidth:260 }}>
                  {/* Person column header */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:8, marginBottom:12,
                    padding:'10px 14px', borderRadius:12,
                    background:`rgba(${person.colorRgb},0.08)`,
                    border:`1px solid rgba(${person.colorRgb},0.2)`,
                  }}>
                    <span style={{ fontSize:20 }}>{person.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.78rem', fontWeight:800, color:person.color }}>{person.name}</div>
                      <div style={{ fontSize:'0.58rem', color:'rgba(255,248,240,0.3)', marginTop:1 }}>{checked}/{total} zabalené</div>
                    </div>
                    <button
                      onClick={() => setPersonFilter(person.id)}
                      style={{ fontSize:'0.6rem', color:`${person.color}88`, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}
                    >
                      Detail →
                    </button>
                  </div>

                  {cats.map((cat, i) => (
                    <motion.div key={cat.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.35 }}>
                      <CategoryCompartment
                        cat={cat}
                        onToggleItem={(catId, itemId) => toggleItem(person.id, catId, itemId)}
                        onAddItem={(catId, text) => addItem(person.id, catId, text)}
                        onDeleteItem={(catId, itemId) => deleteItem(person.id, catId, itemId)}
                        onDeleteCategory={catId => deleteCategory(person.id, catId)}
                        onEditItem={(catId, itemId, newText) => editItem(person.id, catId, itemId, newText)}
                      />
                    </motion.div>
                  ))}

                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    onClick={() => {
                      setPersonFilter(person.id)
                      setTimeout(() => setShowAddCat(true), 100)
                    }}
                    style={{ width:'100%', padding:'10px', borderRadius:12, marginTop:4, background:'rgba(255,255,255,0.02)', border:`1px dashed rgba(${person.colorRgb},0.2)`, color:`rgba(${person.colorRgb},0.4)`, fontSize:'0.68rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
                  >
                    <Plus size={11}/> Sekcia
                  </motion.button>
                </div>
              )
            })}
          </div>
        ) : (
          /* Single person focused view */
          (() => {
            const person = PEOPLE.find(p => p.id === personFilter)
            const cats   = lists[personFilter] || []
            return (
              <div>
                {cats.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.35 }}>
                    <CategoryCompartment
                      cat={cat}
                      onToggleItem={(catId, itemId) => toggleItem(personFilter, catId, itemId)}
                      onAddItem={(catId, text) => addItem(personFilter, catId, text)}
                      onDeleteItem={(catId, itemId) => deleteItem(personFilter, catId, itemId)}
                      onDeleteCategory={catId => deleteCategory(personFilter, catId)}
                      onEditItem={(catId, itemId, newText) => editItem(personFilter, catId, itemId, newText)}
                    />
                  </motion.div>
                ))}
                <motion.button
                  whileHover={{ scale:1.01, y:-1 }} whileTap={{ scale:0.98 }}
                  onClick={() => setShowAddCat(true)}
                  style={{ width:'100%', padding:'13px', borderRadius:14, marginTop:8, background:'rgba(255,255,255,0.03)', border:`1px dashed rgba(${person?.colorRgb||'255,255,255'},0.18)`, color:`rgba(${person?.colorRgb||'255,255,255'},0.38)`, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                >
                  <Plus size={13}/> Pridať sekciu kufra pre {person?.name}
                </motion.button>
              </div>
            )
          })()
        )}
      </div>

      <AnimatePresence>
        {showAddCat && personFilter !== 'all' && (
          <AddCategoryModal
            onAdd={cat => { addCategory(personFilter, cat); setShowAddCat(false) }}
            onClose={() => setShowAddCat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
