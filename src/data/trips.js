// ─── Module definitions ───────────────────────────────────────────────────────
export const ALL_MODULES = [
  { id: 'balenie',   label: 'Balenie',    labelFull: 'Kontrolné zoznamy', icon: '🧳' },
  { id: 'plan',      label: 'Plán',       labelFull: 'Denný plánovač',    icon: '📅' },
  { id: 'mapa',      label: 'Mapa',       labelFull: 'Interaktívna mapa', icon: '🗺️' },
  { id: 'rozpocet',  label: 'Rozpočet',   labelFull: 'Sledovač výdavkov', icon: '💰' },
  { id: 'spomienky', label: 'Spomienky',  labelFull: 'Fotoalbum',         icon: '📸' },
  { id: 'denik',     label: 'Denník',     labelFull: 'Cestovný denník',   icon: '📖' },
]

// ─── Trip status ──────────────────────────────────────────────────────────────
// 'past' | 'active' | 'planned'

// ─── Special road moments (not trips — just markers on the timeline) ──────────
export const SPECIAL_MOMENTS = [
  {
    type: 'special',
    date: '2019-09-01',
    label: 'Spoznali sme sa',
    icon: '❤️',
    color: '#FF6B6B',
  },
  {
    type: 'special',
    date: '2021-06-06',
    label: 'Elizabethka sa narodila',
    icon: '👶',
    color: '#FFB6C1',
  },
]

// ─── Seed trip data (8 trips, chronological order) ───────────────────────────
export const INITIAL_TRIPS = [
  {
    id: 'side-2019',
    destination: 'Side',
    country: 'Turecko · Alba Resort',
    flag: '🇹🇷',
    dateFrom: '2019-09-01',
    dateTo: '2019-09-14',
    hotel: 'Alba Resort',
    status: 'past',
    who: 'couple',           // Norbi & Natalita — where they met
    color: '#C17F3E',
    highlight: 'Kde sa začal náš príbeh — Norbi a Natalita sa spoznali',
    isOriginStory: true,
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'donovaly-2021',
    destination: 'Donovaly',
    country: 'Slovensko · Nízke Tatry',
    flag: '🇸🇰',
    dateFrom: '2021-08-01',
    dateTo: '2021-08-14',
    hotel: '',
    status: 'past',
    who: 'family',           // all three — Elizabethka 2 months old
    color: '#5B8C5A',
    highlight: 'Prvá rodinná dovolenka — Elizabethka má 2 mesiace',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'slovinsko-taliansko-2022',
    destination: 'Slovinsko & Taliansko',
    country: 'Road trip · Alpy',
    flag: '🇸🇮🇮🇹',
    dateFrom: '2022-05-01',
    dateTo: '2022-05-21',
    hotel: 'Rôzne ubytovanie',
    status: 'past',
    who: 'family',
    color: '#7B5EA7',
    highlight: 'Tri týždne na kolesách — Ľubľana, Benátky, cez Alpy',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2022',
    destination: 'Cyprus',
    country: 'Protaras · Constantinos the Great',
    flag: '🇨🇾',
    dateFrom: '2022-09-01',
    dateTo: '2022-09-14',
    hotel: 'Constantinos the Great',
    status: 'past',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Prvýkrát sme objavili Protaras — láska na prvý pohľad',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'rim-2023',
    destination: 'Rím',
    country: 'Taliansko · Večné mesto',
    flag: '🇮🇹',
    dateFrom: '2023-11-01',
    dateTo: '2023-11-07',
    hotel: '',
    status: 'past',
    who: 'couple',           // Norbi & Natalita only
    color: '#C17F3E',
    highlight: 'Romantický únik pre dvoch — Koloseum, Trevi, Via Veneto',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2024',
    destination: 'Cyprus 2024',
    country: 'Protaras · Constantinos the Great',
    flag: '🇨🇾',
    dateFrom: '2024-07-01',
    dateTo: '2024-07-14',
    hotel: 'Constantinos the Great',
    status: 'past',
    who: 'family+',          // 5 people — with parents
    color: '#0CB4CC',
    highlight: 'S rodičmi — päťčlenná výprava do Protarasu',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2025',
    destination: 'Cyprus 2025',
    country: 'Protaras · Silver Sands',
    flag: '🇨🇾',
    dateFrom: '2025-07-01',
    dateTo: '2025-07-14',
    hotel: 'Silver Sands',
    status: 'past',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Prvý rok v Silver Sands — a hneď sme vedeli, že sa vrátime',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: false, plan: false, mapa: true, rozpocet: false, spomienky: true, denik: true },
  },
  {
    id: 'cyprus-2026',
    destination: 'Cyprus 2026',
    country: 'Protaras · Silver Sands',
    flag: '🇨🇾',
    dateFrom: '2026-07-25',
    dateTo: '2026-08-05',
    hotel: 'Silver Sands',
    status: 'active',
    who: 'family',
    color: '#0CB4CC',
    highlight: 'Štvrtý rok v Protarase — náš malý raj',
    bestMoment: '',
    bestRestaurant: '',
    modules: { balenie: true, plan: true, mapa: true, rozpocet: true, spomienky: true, denik: true },
  },
]

// ─── Bucket list seed data ────────────────────────────────────────────────────
export const INITIAL_BUCKET = [
  { id: 'bucket-maldives', destination: 'Maldivy',  flag: '🇲🇻', timeframe: '2027–2028', who: 'couple', notes: 'Sen — overwater bungalov' },
  { id: 'bucket-japan',    destination: 'Japonsko', flag: '🇯🇵', timeframe: '2028+',     who: 'family', notes: 'Tokio, Kjóto, Fuji' },
  { id: 'bucket-norway',   destination: 'Nórsko',   flag: '🇳🇴', timeframe: '2027',      who: 'couple', notes: 'Fjordy a polárna žiara' },
]

// ─── localStorage helpers ─────────────────────────────────────────────────────
const TRIPS_KEY  = 'fn_trips'
const BUCKET_KEY = 'fn_bucket'

export function loadTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_KEY)
    return raw ? JSON.parse(raw) : INITIAL_TRIPS
  } catch { return INITIAL_TRIPS }
}

export function saveTrips(trips) {
  try { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)) } catch {}
}

export function loadBucket() {
  try {
    const raw = localStorage.getItem(BUCKET_KEY)
    return raw ? JSON.parse(raw) : INITIAL_BUCKET
  } catch { return INITIAL_BUCKET }
}

export function saveBucket(bucket) {
  try { localStorage.setItem(BUCKET_KEY, JSON.stringify(bucket)) } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getTripStatus(trip) {
  const now  = new Date()
  const from = new Date(trip.dateFrom)
  const to   = new Date(trip.dateTo)
  if (now < from) return 'planned'
  if (now > to)   return 'past'
  return 'active'
}

export function formatDateRange(from, to) {
  const f = new Date(from)
  const t = new Date(to)
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${f.toLocaleDateString('sk-SK', opts)} – ${t.toLocaleDateString('sk-SK', opts)}`
}

export function generateId() {
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function whoLabel(who) {
  if (who === 'couple')  return '👫 Norbi & Natalita'
  if (who === 'family')  return '👨‍👩‍👧 Celá rodina'
  if (who === 'family+') return '👨‍👩‍👧+👴👵 S rodičmi'
  if (who === 'solo')    return '🧑 Sám'
  return who
}
