'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { MapMember, VehicleType } from '@/lib/mapData'

const MEMBER_COLORS = ['#D4A853','#10B981','#3B82F6','#8B5CF6','#EF4444','#F59E0B','#EC4899']
function apiToMapMember(m: any, index: number): MapMember {
  return {
    id: String(m.user_id),
    name: m.name,
    color: MEMBER_COLORS[index % MEMBER_COLORS.length],
    photo: m.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=1e293b&textColor=ffffff`,
    location: m.place_name || 'Unknown',
    battery: m.battery ?? 50,
    lat: m.lat ?? 19.0760,
    lng: m.lng ?? 72.8777,
    vehicle: 'car' as VehicleType,
    speed: 0,
    gender: 'male' as const,
    status: m.is_online ? 'safe' : 'offline' as const,
    lastUpdated: m.recorded_at || new Date().toISOString(),
    accuracy: 50,
  }
}
import { getUser, getToken, clearAuth, AuthUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import PanelBackground from '@/components/effects/PanelBackground'

/* ── Dynamic MapView (desktop — with all controls) ───────────── */
const MapView = dynamic(() => import('@/components/sections/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center"
         style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#D4A853]/20 animate-ping" />
          <div className="w-14 h-14 rounded-full border-2 border-t-[#D4A853] border-[#D4A853]/10 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">📍</div>
        </div>
        <span className="text-[#D4A853] text-xs font-semibold tracking-[0.2em] uppercase">Loading Map</span>
      </div>
    </div>
  ),
})

/* ── Dynamic UberFamilyMap (mobile) ──────────────────────────── */
const UberFamilyMap = dynamic(() => import('@/components/shared/UberFamilyMap'), { ssr: false })

/* ── Vehicle emoji ───────────────────────────────────────────── */
const V: Record<VehicleType, string> = {
  car:'🚗', bus:'🚌', walk:'🚶', bike:'🚲', auto:'🛺', tempo:'🚛', train:'🚆', metro:'🚇',
}

/* ── Journey data ────────────────────────────────────────────── */
const JOURNEY: Record<string, {time:string;place:string;icon:string;done:boolean}[]> = {
  mom:     [{time:'7:30 AM',place:'Left Home',icon:'🏠',done:true},{time:'8:15 AM',place:'Market',icon:'🛒',done:true},{time:'10:00 AM',place:'Back Home',icon:'🏠',done:true}],
  dad:     [{time:'8:00 AM',place:'Left Home',icon:'🏠',done:true},{time:'9:20 AM',place:'Office',icon:'🏢',done:true},{time:'6:00 PM',place:'Return home',icon:'🏠',done:false}],
  priya:   [{time:'7:45 AM',place:'Left Home',icon:'🏠',done:true},{time:'8:50 AM',place:'College',icon:'🎓',done:true},{time:'4:00 PM',place:'Return home',icon:'🏠',done:false}],
  anya:    [{time:'7:00 AM',place:'Left Home',icon:'🏠',done:true},{time:'8:42 AM',place:'School',icon:'🏫',done:true},{time:'2:30 PM',place:'Return home',icon:'🏠',done:false}],
  grandpa: [{time:'9:00 AM',place:'Left Home',icon:'🏠',done:true},{time:'9:35 AM',place:'Market',icon:'🛍️',done:true},{time:'12:00 PM',place:'Return home',icon:'🏠',done:false}],
}

/* ── Alert types ─────────────────────────────────────────────── */
type Sev = 'safe'|'warning'|'sos'|'info'
interface Alert { id:string; icon:string; title:string; msg:string; time:string; sev:Sev }

const INIT_ALERTS: Alert[] = [
  {id:'a1',icon:'📍',title:'Geofence Entered',  msg:'Anya entered School zone',          time:'8:42 AM', sev:'safe'},
  {id:'a2',icon:'🔋',title:'Battery Low',        msg:"Priya's battery is at 42%",          time:'11:15 AM',sev:'warning'},
  {id:'a3',icon:'🚨',title:'SOS Cleared',        msg:"Dad's SOS resolved. All clear.",     time:'9:03 AM', sev:'sos'},
  {id:'a4',icon:'🏠',title:'Geofence Exited',    msg:'Mom left Home zone at 7:30 AM',     time:'7:30 AM', sev:'info'},
]

const SEV_STYLE: Record<Sev,{bg:string;border:string;bar:string;dot:string}> = {
  safe:    {bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)',  bar:'#10B981', dot:'#10B981'},
  warning: {bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.25)',  bar:'#F59E0B', dot:'#F59E0B'},
  sos:     {bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.25)',   bar:'#EF4444', dot:'#EF4444'},
  info:    {bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.25)',  bar:'#3B82F6', dot:'#3B82F6'},
}

type Tab = 'family'|'alerts'|'profile'
type TKey = 'location'|'push'|'sos'|'battery'

/* ─────────────────────────────────────────────────────────────
   TOGGLE SWITCH
─────────────────────────────────────────────────────────────── */
function Toggle({ on, set }: { on:boolean; set:(v:boolean)=>void }) {
  return (
    <button onClick={() => set(!on)} role="switch" aria-checked={on}
      className="relative flex-shrink-0 transition-all duration-300"
      style={{ width:44,height:24,borderRadius:12,background:on?'linear-gradient(135deg,#D4A853,#B8922E)':'rgba(255,255,255,0.1)',
               boxShadow:on?'0 0 12px rgba(212,168,83,0.4)':'none' }}>
      <motion.span animate={{x: on?22:2}} transition={{type:'spring',stiffness:500,damping:30}}
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-lg"
        style={{background: on?'#fff':'rgba(255,255,255,0.4)'}} />
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   BATTERY BAR
─────────────────────────────────────────────────────────────── */
function BattBar({ pct, color }: { pct:number; color:string }) {
  const c = pct<25?'#EF4444':pct<50?'#F59E0B':color
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'var(--bg-surface3)'}}>
        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,ease:'easeOut'}}
          className="h-full rounded-full" style={{background:c,boxShadow:`0 0 6px ${c}60`}} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{color:'var(--text-muted)',minWidth:28}}>{pct}%</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MEMBER CARD (Family tab)
─────────────────────────────────────────────────────────────── */
function MemberCard({ m, open, onToggle, onSOS, onMap }: { m:MapMember; open:boolean; onToggle:()=>void; onSOS?:()=>void; onMap?:()=>void }) {
  return (
    <motion.div layout className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: open?`${m.color}0D`:'var(--bg-surface2)',
               border: open?`1px solid ${m.color}40`:'1px solid var(--border)',
               boxShadow: open?`0 4px 24px ${m.color}15`:'none',
               transition:'border 0.2s,background 0.2s,box-shadow 0.2s' }}>

      {/* Header row */}
      <button className="w-full flex items-center gap-3 p-3.5 text-left" onClick={onToggle}>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl overflow-hidden"
               style={{border:`2.5px solid ${m.color}`,boxShadow:`0 0 12px ${m.color}40`}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
          </div>
          {/* Live dot */}
          <motion.span animate={{scale:[1,1.4,1],opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
            style={{background:'#10B981',borderColor:'var(--bg-surface2)'}} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="truncate" style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{m.name}</p>
            <span className="ml-2 flex-shrink-0 px-1 py-0.5 rounded-full"
                  style={{fontSize:10,fontWeight:500,background:`${m.color}15`,color:m.color,border:`1px solid ${m.color}30`}}>
              {V[m.vehicle]} {m.speed??0}km/h
            </span>
          </div>
          <p className="mb-1.5 truncate" style={{fontSize:11,color:'var(--text-muted)'}}>📍 {m.location}</p>
          <BattBar pct={m.battery} color={m.color} />
        </div>

        <motion.span animate={{rotate:open?180:0}} transition={{duration:0.2}}
          className="text-[10px] ml-1 flex-shrink-0" style={{color:'var(--text-muted)'}}>▼</motion.span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="exp" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.28}} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-2.5 flex flex-col gap-3"
                 style={{borderTop:`1px solid ${m.color}18`}}>

              {/* Mini stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {icon:'⚡',label:'Speed',val:`${m.speed??0}km/h`},
                  {icon:'🔒',label:'Zone',val:'SAFE'},
                  {icon:'🆘',label:'SOS',val:'None'},
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2 text-center"
                       style={{background:`${m.color}0A`,border:`1px solid ${m.color}20`}}>
                    <div className="text-base">{s.icon}</div>
                    <div className="text-[8px] mt-0.5" style={{color:'var(--text-muted)'}}>{s.label}</div>
                    <div className="text-[10px] font-bold mt-0.5" style={{color:m.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Journey */}
              {(JOURNEY[m.id]??[]).length > 0 && <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{color:'var(--text-muted)'}}>Today's Journey</p>
                {(JOURNEY[m.id]??[]).map((step,i,arr) => (
                  <div key={i} className="flex items-center gap-2.5 mb-1.5">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                           style={{background:step.done?`${m.color}20`:'rgba(255,255,255,0.05)',
                                   border:`1px solid ${step.done?m.color:'rgba(255,255,255,0.1)'}`}}>
                        {step.icon}
                      </div>
                      {i<arr.length-1 && <div className="w-px flex-1 mt-0.5 mb-0.5 min-h-[6px]"
                        style={{background:step.done?`${m.color}30`:'rgba(255,255,255,0.06)'}} />}
                    </div>
                    <span className="text-[11px] flex-1" style={{color:step.done?'var(--text-primary)':'var(--text-muted)'}}>{step.place}</span>
                    <span className="text-[9px] tabular-nums" style={{color:'var(--text-muted)'}}>{step.time}</span>
                  </div>
                ))}
              </div>}

              {/* Actions */}
              <div className="flex gap-2">
                <a href={`/track`}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all hover:opacity-80 flex items-center justify-center gap-1.5 no-underline"
                  style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',color:'#60A5FA'}}>
                  📍 Track
                </a>
                <motion.button
                  onClick={() => onSOS?.()}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all hover:opacity-80 flex items-center justify-center gap-1.5"
                  style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#F87171'}}
                  animate={{boxShadow:['0 0 0 0 rgba(239,68,68,0.4)','0 0 0 20px rgba(239,68,68,0)','0 0 0 0 rgba(239,68,68,0)']}}
                  transition={{duration:2,repeat:Infinity}}>
                  🚨 SOS
                </motion.button>
                <button
                  onClick={() => { onMap?.(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all hover:opacity-80 flex items-center justify-center gap-1.5"
                  style={{background:`${m.color}10`,border:`1px solid ${m.color}30`,color:m.color}}>
                  🗺️ Map
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ALERTS TAB
─────────────────────────────────────────────────────────────── */
function AlertsTab({ alerts,dismiss }: { alerts:Alert[]; dismiss:(id:string)=>void }) {
  if (!alerts.length) return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
           style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)'}}>✅</div>
      <p className="text-sm font-semibold" style={{color:'var(--text-muted)'}}>No active alerts</p>
    </div>
  )
  return (
    <div className="flex flex-col gap-2">
      {alerts.map(a => {
        const s = SEV_STYLE[a.sev]
        return (
          <motion.div key={a.id} layout exit={{opacity:0,x:40}} transition={{duration:0.2}}
            className="flex gap-3 relative overflow-hidden rounded-xl"
            style={{padding:'12px 16px',background:'var(--bg-surface)',borderLeft:`3px solid ${s.bar}`}}>
            <div className="flex gap-3 flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="truncate" style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{a.title}</p>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.dot}} />
                </div>
                <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.4}}>{a.msg}</p>
                <p className="mt-1" style={{fontSize:11,color:'var(--text-muted)'}}>{a.time}</p>
              </div>
            </div>
            <button onClick={() => dismiss(a.id)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all hover:bg-white/10"
              style={{color:'var(--text-muted)'}}>✕</button>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PROFILE TAB
─────────────────────────────────────────────────────────────── */
function ProfileTab({ user, toggles, setToggle, logout, familyRole, familyInviteCode, familyName }:{
  user:AuthUser; toggles:Record<TKey,boolean>; setToggle:(k:TKey)=>void; logout:()=>void
  familyRole:string; familyInviteCode:string; familyName:string
}) {
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinMsg, setJoinMsg] = useState<{text:string;ok:boolean}|null>(null)
  const isOwner = familyRole === 'owner'

  function copyCode() {
    if (!familyInviteCode) return
    navigator.clipboard.writeText(familyInviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function joinFamily() {
    if (!joinCode.trim()) return
    const token = localStorage.getItem('gv_token')
    if (!token) return
    try {
      const res = await fetch(`/families/join/${joinCode.trim()}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'parent' }),
      })
      if (res.ok) {
        setJoinMsg({ text: 'Joined! Please refresh.', ok: true })
        setJoinCode('')
      } else {
        const d = await res.json().catch(() => ({}))
        setJoinMsg({ text: d.detail || 'Invalid code', ok: false })
      }
    } catch { setJoinMsg({ text: 'Network error', ok: false }) }
  }

  const SETTINGS: {key:TKey;label:string;desc:string;icon:string}[] = [
    {key:'location',label:'Location Sharing',  desc:'Share your live location with family', icon:'📍'},
    {key:'push',    label:'Push Notifications',desc:'Receive instant alerts on device',      icon:'🔔'},
    {key:'sos',     label:'SOS Auto-Call',     desc:'Auto-call emergency contacts on SOS',  icon:'🚨'},
    {key:'battery', label:'Battery Alerts',    desc:'Notify family when battery is low',    icon:'🔋'},
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* User card */}
      <div className="rounded-2xl p-4 relative overflow-hidden"
           style={{background:'linear-gradient(135deg,rgba(212,168,83,0.12),rgba(184,146,46,0.06))',
                   border:'1px solid rgba(212,168,83,0.25)'}}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
             style={{background:'#D4A853',transform:'translate(30%,-30%)'}} />
        <div className="flex items-center gap-3 relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
               style={{background:'linear-gradient(135deg,#D4A853,#92580A)',color:'#fff',
                       boxShadow:'0 4px 16px rgba(212,168,83,0.4)'}}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate" style={{color:'var(--text-primary)'}}>{user.name}</p>
            <p className="text-[11px] mt-0.5 truncate" style={{color:'var(--text-muted)'}}>{user.email}</p>
            <span className="inline-block mt-1.5 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{background: isOwner ? 'rgba(212,168,83,0.18)' : 'rgba(16,185,129,0.12)',
                          color: isOwner ? '#D4A853' : '#10B981',
                          border: isOwner ? '1px solid rgba(212,168,83,0.35)' : '1px solid rgba(16,185,129,0.3)'}}>
              {isOwner ? '👑 Owner' : '● Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Member — show invite code (owner only) */}
      {isOwner && familyInviteCode && (
        <div className="rounded-2xl p-3.5"
             style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.25)'}}>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{color:'#10B981'}}>
            👥 Add Member to {familyName || 'Family'}
          </p>
          <p className="text-[10px] mb-2.5" style={{color:'var(--text-muted)'}}>
            Share this invite code with family members:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center font-mono text-sm font-bold tracking-[0.2em]"
                 style={{background:'var(--bg-surface2)',border:'1px solid rgba(16,185,129,0.3)',color:'#10B981',
                         letterSpacing:'0.25em'}}>
              {familyInviteCode}
            </div>
            <motion.button whileTap={{scale:0.93}} onClick={copyCode}
              className="px-3 py-2.5 rounded-xl text-[11px] font-bold flex-shrink-0"
              style={{background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.12)',
                      border:'1px solid rgba(16,185,129,0.35)',color:'#10B981',
                      transition:'background 0.2s'}}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </motion.button>
          </div>
          <p className="text-[9px] mt-2" style={{color:'var(--text-muted)'}}>
            They can enter this code in their app → Profile → Join Family
          </p>
        </div>
      )}

      {/* Join Family — for non-owner users without family */}
      {!isOwner && (
        <div className="rounded-2xl p-3.5"
             style={{background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)'}}>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{color:'#60A5FA'}}>
            🔗 Join a Family
          </p>
          <div className="flex gap-2">
            <input
              value={joinCode} onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter invite code"
              className="flex-1 rounded-xl px-3 py-2 text-[12px] font-mono outline-none"
              style={{background:'var(--bg-surface2)',border:'1px solid rgba(59,130,246,0.3)',
                      color:'var(--text-primary)'}} />
            <motion.button whileTap={{scale:0.93}} onClick={joinFamily}
              className="px-3 py-2 rounded-xl text-[11px] font-bold flex-shrink-0"
              style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.35)',color:'#60A5FA'}}>
              Join
            </motion.button>
          </div>
          {joinMsg && (
            <p className="text-[10px] mt-1.5" style={{color: joinMsg.ok ? '#10B981' : '#F87171'}}>
              {joinMsg.text}
            </p>
          )}
        </div>
      )}

      {/* Settings */}
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] px-1" style={{color:'var(--text-muted)'}}>Preferences</p>
      {SETTINGS.map((s,i) => (
        <motion.div key={s.key} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
          className="flex items-center gap-3 p-3.5 rounded-2xl"
          style={{background:'var(--bg-surface2)',border:'1px solid var(--border)'}}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
               style={{background:'var(--bg-surface3)',border:'1px solid var(--border)'}}>
            {s.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{color:'var(--text-primary)'}}>{s.label}</p>
            <p className="text-[10px] mt-0.5 truncate" style={{color:'var(--text-muted)'}}>{s.desc}</p>
          </div>
          <Toggle on={toggles[s.key]} set={() => setToggle(s.key)} />
        </motion.div>
      ))}

      {/* Logout */}
      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={() => logout()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all mt-1"
        style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',color:'#F87171',
                boxShadow:'0 0 0 0 rgba(239,68,68,0)'}}>
        <span>🚪</span> Sign Out
      </motion.button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   RIGHT PANEL
─────────────────────────────────────────────────────────────── */
function RightPanel({ tab, setTab, expanded, setExpanded, alerts, dismiss, toggles, setToggle, user, logout, onSOS, onMap, members, familyRole, familyInviteCode, familyName }: {
  tab:Tab; setTab:(t:Tab)=>void
  expanded:string|null; setExpanded:(id:string|null)=>void
  alerts:Alert[]; dismiss:(id:string)=>void
  toggles:Record<TKey,boolean>; setToggle:(k:TKey)=>void
  user:AuthUser; logout:()=>void
  onSOS?:()=>void
  onMap?:(id:string)=>void
  members: MapMember[]
  familyRole:string; familyInviteCode:string; familyName:string
}) {
  const MEMBERS = members
  const TABS: {id:Tab;label:string;icon:string;count?:number}[] = [
    {id:'family', label:'Family', icon:'👨‍👩‍👧'},
    {id:'alerts', label:'Alerts', icon:'🔔', count:alerts.length},
    {id:'profile',label:'Profile',icon:'👤'},
  ]

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden dashboard-panel"
         style={{background:'var(--bg-surface)',border:'1px solid var(--border)',
                 backdropFilter:'blur(24px)',boxShadow:'0 32px 64px rgba(0,0,0,0.4)'}}>

      {/* All safe banner */}
      <div className="mx-3 mt-3 mb-0 flex items-center gap-2 rounded-2xl px-3 py-2"
           style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}}>
        <motion.div animate={{scale:[1,1.3,1]}} transition={{duration:2,repeat:Infinity}}
          className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-emerald-400 flex-1">All {MEMBERS.length} members safe</span>
        <span className="text-lg">🛡️</span>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-2 pb-0"
           style={{borderBottom:'1px solid var(--border)'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 relative flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{
              height:40,
              fontSize:13,
              fontWeight:500,
              color: tab===t.id ? 'var(--gold)' : 'var(--text-muted)',
              background:'transparent',
              border:'none',
              borderBottom: tab===t.id ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom:-1,
              paddingBottom:0,
            }}>
            <span className="text-sm leading-none">{t.icon}</span>
            <span>{t.label}</span>
            {t.count && t.count>0 ? (
              <span className="rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{background:'#EF4444',color:'#fff',width:16,height:16,minWidth:16}}>
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-none"
           style={{maxHeight:'calc(100vh - 220px)'}}>
        <AnimatePresence mode="wait">
          {tab==='family' && (
            <motion.div key="fam" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
              {MEMBERS.map((m,i) => (
                <motion.div key={m.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05,duration:0.3}}>
                  <MemberCard m={m} open={expanded===m.id} onToggle={() => setExpanded(expanded===m.id?null:m.id)} onSOS={onSOS} onMap={() => onMap?.(m.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {tab==='alerts' && (
            <motion.div key="alr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <AlertsTab alerts={alerts} dismiss={dismiss} />
            </motion.div>
          )}
          {tab==='profile' && (
            <motion.div key="pro" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <ProfileTab user={user} toggles={toggles} setToggle={setToggle} logout={logout}
                familyRole={familyRole} familyInviteCode={familyInviteCode} familyName={familyName} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router  = useRouter()
  const [user,    setUser]    = useState<AuthUser|null>(null)
  const [activeId,setActiveId]= useState<string|null>(null)
  const [tab,     setTab]     = useState<Tab>('family')
  const [mobTab,  setMobTab]  = useState<Tab>('family')
  const [expanded,setExpanded]= useState<string|null>(null)
  const [alerts,  setAlerts]  = useState<Alert[]>([])
  const [bell,    setBell]    = useState(false)
  const [toggles, setToggles] = useState<Record<TKey,boolean>>({location:true,push:true,sos:false,battery:true})
  const [familyMembers, setFamilyMembers] = useState<MapMember[]>([])
  const [familyLoading, setFamilyLoading] = useState(true)
  const [familyRole, setFamilyRole] = useState<string>('member')
  const [familyInviteCode, setFamilyInviteCode] = useState<string>('')
  const [familyName, setFamilyName] = useState<string>('')
  const [realAlerts, setRealAlerts] = useState<Alert[]>([])
  const [familyId, setFamilyId] = useState<number | null>(null)

  // Sync real alerts when they load — use INIT_ALERTS as fallback
  useEffect(() => {
    if (realAlerts.length > 0) setAlerts(realAlerts)
  }, [realAlerts])

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/login'); return }
    setUser(u)
  }, [router])

  useEffect(() => {
    const token = getToken()
    if (!token) { setFamilyLoading(false); return }
    fetch('/families/my', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => {
        if (r.status === 401) { clearAuth(); router.replace('/login'); return [] }
        return r.ok ? r.json() : []
      })
      .then(async (families: any[]) => {
        if (!Array.isArray(families) || families.length === 0) { setFamilyLoading(false); return }
        const fid = families[0].id
        const myRole = families[0].role || 'member'
        // Redirect to role-specific dashboard
        if (myRole === 'child') { router.replace('/child'); return }
        if (myRole === 'owner' || myRole === 'member') { router.replace('/parent'); return }
        setFamilyId(fid)
        setFamilyRole(myRole)
        setFamilyInviteCode(families[0].invite_code || '')
        setFamilyName(families[0].name || 'My Family')
        try {
          const [membersRes, liveRes] = await Promise.all([
            fetch(`/families/${fid}/members`, { headers: { Authorization: 'Bearer ' + token } }),
            fetch(`/location/live/${fid}`, { headers: { Authorization: 'Bearer ' + token } }),
          ])
          const baseMembers = membersRes.ok ? await membersRes.json() : []
          const live = liveRes.ok ? await liveRes.json() : []
          const liveMap: Record<number, any> = {}
          live.forEach((l: any) => { liveMap[l.user_id] = l })
          if (Array.isArray(baseMembers) && baseMembers.length > 0) {
            const merged = baseMembers.map((bm: any, i: number) => {
              const liveData = liveMap[bm.user_id]
              return apiToMapMember({
                user_id: bm.user_id,
                name: bm.name,
                avatar_url: null,
                lat: liveData?.lat ?? 19.0760 + (i * 0.002),
                lng: liveData?.lng ?? 72.8777 + (i * 0.002),
                place_name: liveData ? (liveData.place_name || 'Sharing location') : 'Location unknown',
                battery: liveData?.battery ?? bm.battery ?? 50,
                is_online: !!liveData,
                recorded_at: liveData?.recorded_at ?? null,
              }, i)
            })
            setFamilyMembers(merged)
          }
        } catch (_) {}
        finally { setFamilyLoading(false) }
        // Fetch SOS alerts
        fetch('/sos/history/' + fid, { headers: { Authorization: 'Bearer ' + token } })
          .then(r => r.ok ? r.json() : [])
          .then((sos: any[]) => {
            if (sos.length > 0) {
              const mapped: Alert[] = sos.slice(0, 4).map((s: any) => ({
                id: String(s.id),
                icon: s.status === 'active' ? '🚨' : '✅',
                title: s.status === 'active' ? 'SOS Alert Active' : 'SOS Resolved',
                msg: s.place_name || 'Location shared',
                time: new Date(s.triggered_at).toLocaleTimeString(),
                sev: (s.status === 'active' ? 'sos' : 'safe') as Sev,
              }))
              setRealAlerts(mapped)
            }
          })
          .catch(() => {})
      })
      .catch(() => { setFamilyLoading(false) })
  }, [router])

  const onMemberClick = useCallback((id:string) => {
    setActiveId(p => p===id?null:id)
    setExpanded(p => p===id?null:id)
    setTab('family')
    setMobTab('family')
  }, [])

  const logout = () => { clearAuth(); router.replace('/login') }
  const dismiss = (id:string) => setAlerts(p => p.filter(a => a.id!==id))
  const toggleSetting = (k:TKey) => setToggles(p => ({...p,[k]:!p[k]}))

  const triggerSOS = useCallback(() => {
    const token = getToken()
    if (!token || !familyId) return
    fetch('/sos/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ family_id: familyId, message: 'Emergency SOS' }),
    }).catch(() => {})
  }, [familyId])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[#D4A853]/20 animate-ping" />
        <div className="w-16 h-16 rounded-full border-2 border-t-[#D4A853] border-[#D4A853]/10 animate-spin" />
      </div>
    </div>
  )

  const MEMBERS = familyMembers
  const activeMember = MEMBERS.find(m => m.id===activeId) ?? null

  return (
    <div className="min-h-screen flex flex-col" style={{background:'var(--bg)',color:'var(--text-primary)'}}>

      {/* VFX background layer */}
      <PanelBackground />

      {/* Ambient bg glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}}>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10" style={{background:'#3B82F6'}} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-8" style={{background:'#D4A853'}} />
      </div>

      {/* ══════ HEADER ══════════════════════════════════════════ */}
      <header className="relative z-50 sticky top-0 flex items-center justify-between"
        style={{height:52,padding:'0 16px',background:'var(--bg-surface)',backdropFilter:'blur(24px)',
                borderBottom:'1px solid var(--border)',
                boxShadow:'0 1px 0 rgba(212,168,83,0.08)'}}>

        {/* Logo — Shield + Gravity */}
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#D4A853',flexShrink:0}}>
            <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z"
                  fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-sm tracking-wide" style={{color:'#D4A853',fontSize:14,fontWeight:700}}>Gravity</span>
          <div className="w-px h-3.5 hidden sm:block" style={{background:'var(--border)'}} />
          <span className="text-xs font-medium hidden sm:block" style={{color:'var(--text-muted)'}}>Dashboard</span>
        </div>

        {/* Center — safe status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
             style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.28)',
                     boxShadow:'0 0 20px rgba(16,185,129,0.1)'}}>
          <motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:1.4,repeat:Infinity}}
            className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-400">All Safe</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Bell / SOS count badge */}
          <div className="relative">
            <button onClick={() => setBell(v => !v)}
              className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
              style={{border:'1px solid var(--border)'}}>
              <span className="text-sm">🔔</span>
              {alerts.length>0 && (
                <span className="absolute -top-1 -right-1 rounded-full text-[8px] font-bold flex items-center justify-center"
                      style={{background:'#EF4444',color:'#fff',width:16,height:16,minWidth:16}}>
                  {alerts.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {bell && (
                <motion.div key="bell" initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
                  exit={{opacity:0,y:-8,scale:0.95}} transition={{duration:0.2}}
                  className="absolute right-0 top-10 rounded-2xl p-3 z-50"
                  style={{background:'var(--bg-surface)',border:'1px solid var(--border)',
                          boxShadow:'0 24px 60px rgba(0,0,0,0.6)',width:288}}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] px-1 mb-2" style={{color:'var(--text-muted)'}}>Recent</p>
                  {alerts.slice(0,3).map(a => (
                    <div key={a.id} className="flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5"
                         style={{background:SEV_STYLE[a.sev].bg,border:`1px solid ${SEV_STYLE[a.sev].border}`}}>
                      <span className="text-base flex-shrink-0">{a.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{color:'var(--text-primary)'}}>{a.title}</p>
                        <p className="text-[10px] mt-0.5" style={{color:'var(--text-muted)'}}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar — clickable profile dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => { setTab('profile'); setMobTab('profile'); setBell(false) }}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{background:'linear-gradient(135deg,#D4A853,#92580A)',color:'#fff',
                      boxShadow:'0 3px 10px rgba(212,168,83,0.35)',border:'2px solid rgba(212,168,83,0.4)',cursor:'pointer'}}>
              {user.name.charAt(0).toUpperCase()}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ══════ MAIN ════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-5 pb-24 lg:pb-5">

        {/* LEFT — Map + strip */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Map */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
            className="relative rounded-3xl overflow-hidden flex-1"
            style={{minHeight:380,
                    border:'1px solid rgba(255,255,255,0.08)',
                    boxShadow:'0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,83,0.04)'}}>

            {/* Desktop: MapView with zoom/style controls */}
            <div className="hidden lg:block absolute inset-0">
              <MapView key={familyLoading ? 'init' : `ready-${familyMembers.length}`} activeId={activeId} onMemberClick={onMemberClick} members={familyMembers} />
            </div>
            {/* Mobile: UberFamilyMap (better mobile rendering) */}
            <div className="lg:hidden absolute inset-0">
              <UberFamilyMap showMemberList={false} height="100%" />
            </div>

            {/* Top gradient fade — premium depth */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none"
                 style={{height:80,
                         background:'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)',
                         zIndex:2}} />

            {/* Corner gradient overlays for depth */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background:'radial-gradient(ellipse at top left, rgba(5,13,26,0.25) 0%, transparent 50%)',
              zIndex:3
            }} />

            {/* Active member overlay */}
            <AnimatePresence>
              {activeMember && (
                <motion.div key={activeMember.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}
                  className="absolute top-4 left-4 z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                  style={{background:'rgba(5,13,26,0.92)',backdropFilter:'blur(20px)',
                          border:`1px solid ${activeMember.color}40`,
                          boxShadow:`0 8px 32px rgba(0,0,0,0.5),0 0 0 1px ${activeMember.color}15`}}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                       style={{border:`2px solid ${activeMember.color}`}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeMember.photo} alt={activeMember.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{activeMember.name}</p>
                    <p className="text-[10px] mt-0.5" style={{color:activeMember.color}}>
                      {activeMember.location} · {V[activeMember.vehicle]} {activeMember.speed??0}km/h
                    </p>
                  </div>
                  <button onClick={() => {setActiveId(null);setExpanded(null)}}
                    className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all hover:bg-white/10"
                    style={{color:'rgba(255,255,255,0.3)'}}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                 style={{background:'rgba(5,13,26,0.85)',backdropFilter:'blur(12px)',
                         border:'1px solid rgba(16,185,129,0.3)'}}>
              <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1.2,repeat:Infinity}}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-wider">LIVE</span>
            </div>
          </motion.div>

          {/* Member strip */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.15}}
            className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {MEMBERS.length === 0 && familyLoading && [0,1,2].map(i => (
              <div key={i} className="flex-shrink-0 w-20 h-24 rounded-2xl animate-pulse"
                   style={{background:'var(--bg-surface2)',border:'1px solid var(--border)'}} />
            ))}
            {MEMBERS.length === 0 && !familyLoading && (
              <div className="py-3 px-4 rounded-2xl"
                   style={{background:'var(--bg-surface2)',border:'1px solid var(--border)'}}>
                <p className="text-xs whitespace-nowrap" style={{color:'var(--text-muted)'}}>
                  No family members sharing location
                </p>
              </div>
            )}
            {MEMBERS.map((m,i) => (
              <motion.button key={m.id}
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0,transition:{delay:i*0.07}}}
                whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}}
                onClick={() => onMemberClick(m.id)}
                className="flex-shrink-0 flex flex-col items-center gap-2 px-3.5 py-3 rounded-2xl transition-all duration-200"
                style={{
                  minWidth:80,
                  background: activeId===m.id?`${m.color}15`:'var(--bg-surface2)',
                  border: activeId===m.id?`1px solid ${m.color}45`:'1px solid var(--border)',
                  boxShadow: activeId===m.id?`0 8px 24px ${m.color}20`:'none',
                }}>

                {/* Photo */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-full overflow-hidden"
                       style={{border:`2.5px solid ${activeId===m.id?m.color:m.color+'60'}`,
                               boxShadow:activeId===m.id?`0 0 14px ${m.color}50`:'none'}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[12px] leading-none">{V[m.vehicle]}</span>
                </div>

                <span className="text-[10px] font-semibold whitespace-nowrap"
                      style={{color: activeId===m.id?m.color:'var(--text-primary)'}}>
                  {m.name}
                </span>

                {/* Battery */}
                <div className="w-full flex flex-col gap-0.5">
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{background:'var(--bg-surface3)'}}>
                    <div className="h-full rounded-full transition-all"
                         style={{width:`${m.battery}%`,
                                 background:m.battery<25?'#EF4444':m.battery<50?'#F59E0B':m.color,
                                 boxShadow:`0 0 4px ${m.color}60`}} />
                  </div>
                  <span className="text-[9px] text-center" style={{color:'var(--text-muted)'}}>{m.battery}%</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Panel (desktop) */}
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.1}}
          className="hidden lg:flex flex-col w-[320px] flex-shrink-0">
          <RightPanel tab={tab} setTab={setTab} expanded={expanded} setExpanded={setExpanded}
            alerts={alerts} dismiss={dismiss} toggles={toggles} setToggle={toggleSetting}
            user={user} logout={logout} onSOS={triggerSOS} onMap={onMemberClick} members={MEMBERS}
            familyRole={familyRole} familyInviteCode={familyInviteCode} familyName={familyName} />
        </motion.div>

        {/* RIGHT — Mobile tab content */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div key={mobTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
              {mobTab==='family' && (
                <div className="space-y-2">
                  {MEMBERS.map(m => (
                    <MemberCard key={m.id} m={m} open={expanded===m.id} onToggle={() => setExpanded(expanded===m.id?null:m.id)} onSOS={triggerSOS} onMap={() => onMemberClick(m.id)} />
                  ))}
                </div>
              )}
              {mobTab==='alerts' && <AlertsTab alerts={alerts} dismiss={dismiss} />}
              {mobTab==='profile' && <ProfileTab user={user} toggles={toggles} setToggle={toggleSetting} logout={logout}
                familyRole={familyRole} familyInviteCode={familyInviteCode} familyName={familyName} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ══════ MOBILE BOTTOM TAB BAR ═══════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex"
           style={{background:'var(--bg-surface)',backdropFilter:'blur(24px)',
                   borderTop:'1px solid var(--border)',
                   boxShadow:'0 -8px 32px rgba(0,0,0,0.4)'}}>
        {([
          {id:'map',   label:'Map',   icon:'🗺️'},
          {id:'family',label:'Family',icon:'👨‍👩‍👧'},
          {id:'alerts',label:'Alerts',icon:'🔔',badge:alerts.length},
          {id:'profile',label:'Profile',icon:'👤'},
        ] as const).map(item => {
          const active = item.id==='map'?!['alerts','profile'].includes(mobTab):mobTab===item.id
          return (
            <button key={item.id} onClick={() => { if(item.id==='map') { window.scrollTo({top:0,behavior:'smooth'}) } else { setMobTab(item.id as Tab) } }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 relative transition-colors"
              style={{color:active?'#D4A853':'rgba(255,255,255,0.35)'}}>
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[8px] font-bold tracking-wider uppercase">{item.label}</span>
              {'badge' in item && item.badge&&item.badge>0 ? (
                <span className="absolute top-2 left-[calc(50%+4px)] w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
                      style={{background:'#EF4444',color:'#fff'}}>{item.badge}</span>
              ) : null}
              {active && (
                <motion.div layoutId="mob-tab" className="absolute bottom-0 left-[25%] right-[25%] h-0.5 rounded-full"
                  style={{background:'#D4A853',boxShadow:'0 0 8px rgba(212,168,83,0.8)'}} />
              )}
            </button>
          )
        })}
      </nav>

      <style>{`
        .dashboard-panel { background: var(--bg-surface) !important; border-color: var(--border) !important; }
      `}</style>
    </div>
  )
}
