import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Package, CalendarDays, Globe, Wallet, Camera,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/domov',     label: 'Domov',      labelShort: 'Domov',     icon: Home         },
  { path: '/balenie',   label: 'Balenie',     labelShort: 'Balenie',   icon: Package      },
  { path: '/plan',      label: 'Plán',        labelShort: 'Plán',      icon: CalendarDays },
  { path: '/cesty',     label: 'Cesty',       labelShort: 'Cesty',     icon: Globe        },
  { path: '/rozpocet',  label: 'Rozpočet',    labelShort: 'Budget',    icon: Wallet       },
  { path: '/spomienky', label: 'Spomienky',   labelShort: 'Foto',      icon: Camera       },
]

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2  } },
}

export default function Layout() {
  const location = useLocation()

  return (
    <div className="app-layout">

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <NavLink to="/domov" className="block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-turquoise opacity-70 mb-0.5">
              Naše cesty
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">
              <span className="shimmer-text">ForeverN</span>
              <span className="text-white/40 font-light ml-1.5">Travels</span>
            </h2>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Trip info footer */}
        <div className="px-5 py-5 border-t border-white/5">
          <div className="glass-box px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-coral">
                Aktívna dovolenka
              </span>
            </div>
            <p className="text-sm font-semibold text-white">🇨🇾 Cyprus 2026</p>
            <p className="text-xs text-white/40 mt-0.5">Silver Sands · Protaras</p>
            <p className="text-xs text-white/30 mt-1">25.7 – 5.8.2026</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="nav-item flex-1"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={isActive ? 'text-turquoise' : ''}
              />
              <span className={`text-[9px] font-medium tracking-wide ${isActive ? 'text-turquoise' : ''}`}>
                {item.labelShort}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-turquoise"
                />
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
