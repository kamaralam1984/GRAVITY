'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  MapPin,
  Heart,
  Activity,
  AlertTriangle,
  Car,
  Gauge,
  Clock,
  Book,
  Bus,
  Phone,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Battery,
  Navigation,
  Bell,
  Star,
  ChevronRight,
  ChevronDown,
  Flame,
  Moon,
  Droplets,
  Thermometer,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const glassCard =
  'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl';

function StatusBadge({
  status,
  size = 'sm',
}: {
  status: string;
  size?: 'sm' | 'md';
}) {
  const map: Record<string, string> = {
    Safe: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'At Risk': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    Critical: 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
    Stable: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Home: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    School: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  };
  const px = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`rounded-full font-medium ${px} ${map[status] ?? 'bg-white/10 text-white/60 border border-white/20'}`}>
      {status}
    </span>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const color =
    level > 50 ? 'text-emerald-400' : level > 20 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Battery className="w-3 h-3" />
      {level}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHILDREN MONITOR SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  status: string;
  battery: number;
  steps: number;
  stepsGoal: number;
  school: string;
  alerts: number;
  heartRate: number;
  activeMinutes: number;
  attendance: number;
  homework: number;
  currentClass: string;
  lastSync: string;
  device: string;
  color: string;
  geofenceStatus: string;
  recentAlerts: { icon: string; text: string; time: string }[];
  teacherNote: string;
}

const childrenData: Child[] = [
  {
    id: 'aarav',
    name: 'Aarav',
    age: 9,
    location: 'School',
    status: 'Safe',
    battery: 87,
    steps: 4823,
    stepsGoal: 8000,
    school: 'DPS Mumbai',
    alerts: 3,
    heartRate: 88,
    activeMinutes: 42,
    attendance: 94,
    homework: 78,
    currentClass: 'Mathematics',
    lastSync: '2 min ago',
    device: 'Gravity Watch Pro',
    color: '#F59E0B',
    geofenceStatus: 'Inside school zone',
    recentAlerts: [
      { icon: '🏃', text: 'Left school premises at 3:45 PM', time: 'Yesterday' },
      { icon: '🔋', text: 'Low battery warning — 15%', time: '2 days ago' },
    ],
    teacherNote: 'Aarav is doing great in Maths. Needs improvement in Hindi.',
  },
  {
    id: 'priya',
    name: 'Priya',
    age: 12,
    location: 'Home',
    status: 'Safe',
    battery: 65,
    steps: 7231,
    stepsGoal: 10000,
    school: 'Ryan International',
    alerts: 0,
    heartRate: 76,
    activeMinutes: 68,
    attendance: 99,
    homework: 95,
    currentClass: 'On Holiday',
    lastSync: '5 min ago',
    device: 'Gravity Band Ultra',
    color: '#8B5CF6',
    geofenceStatus: 'Inside home zone',
    recentAlerts: [],
    teacherNote: 'Priya is an excellent student. Top of class in Science.',
  },
];

function StepsRing({ steps, goal, size = 60 }: { steps: number; goal: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(steps / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={4}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function ChildrenMonitorSection() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedChild((prev) => (prev === id ? null : id));
    setSelectedChild(id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Children</h2>
            <p className="text-xs text-white/50">Real-time monitoring</p>
          </div>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            {childrenData.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-semibold shadow-lg shadow-amber-500/20"
        >
          <span>+</span> Add Child
        </motion.button>
      </div>

      {/* Child Cards */}
      <div className="space-y-3">
        {childrenData.map((child) => {
          const isExpanded = expandedChild === child.id;
          return (
            <motion.div
              key={child.id}
              layout
              className={`${glassCard} overflow-hidden transition-all duration-300 ${
                isExpanded ? 'border-l-4' : ''
              }`}
              style={isExpanded ? { borderLeftColor: child.color } : {}}
            >
              {/* Collapsed Row — always visible */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                style={{ minHeight: 64 }}
                onClick={() => toggleExpand(child.id)}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0"
                  style={{ background: child.color }}
                >
                  {child.name.charAt(0)}
                </div>

                {/* Name + age */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{child.name}</span>
                    <span className="text-white/40 text-xs">{child.age} yrs</span>
                    <StatusBadge status={child.status} />
                    <StatusBadge status={child.location} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <BatteryIcon level={child.battery} />
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {child.steps.toLocaleString()} steps
                    </span>
                    {child.alerts > 0 && (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        {child.alerts} alerts
                      </span>
                    )}
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </motion.div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Location */}
                        <div className="bg-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-white/50 text-xs">
                            <MapPin className="w-3 h-3" /> Location
                          </div>
                          <p className="text-white text-sm font-semibold">{child.location}</p>
                          <p className="text-white/40 text-xs">{child.geofenceStatus}</p>
                        </div>

                        {/* School */}
                        <div className="bg-white/5 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-white/50 text-xs">
                            <Book className="w-3 h-3" /> School
                          </div>
                          <p className="text-white text-sm font-semibold">{child.school}</p>
                          <p className="text-white/40 text-xs">Now: {child.currentClass}</p>
                        </div>

                        {/* Health */}
                        <div className="bg-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                            <Heart className="w-3 h-3" /> Health
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative w-[60px] h-[60px] flex items-center justify-center flex-shrink-0">
                              <StepsRing steps={child.steps} goal={child.stepsGoal} size={60} />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-amber-400">
                                  {Math.round((child.steps / child.stepsGoal) * 100)}%
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-white/60">
                                <span className="text-white font-semibold">{child.heartRate}</span> bpm
                              </div>
                              <div className="text-xs text-white/60">
                                <span className="text-white font-semibold">{child.activeMinutes}</span> active min
                              </div>
                              <div className="text-xs text-white/60">
                                <span className="text-white font-semibold">{child.steps.toLocaleString()}</span> steps
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        <div className="bg-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                            <AlertTriangle className="w-3 h-3" /> Recent Alerts
                          </div>
                          {child.recentAlerts.length === 0 ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                              <CheckCircle className="w-3.5 h-3.5" />
                              No alerts this week
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {child.recentAlerts.map((alert, i) => (
                                <div key={i} className="text-xs text-white/60 leading-tight">
                                  <span className="mr-1">{alert.icon}</span>
                                  {alert.text}
                                  <span className="block text-white/30 text-[10px]">{alert.time}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { icon: Phone, label: 'Call', color: 'emerald' },
                          { icon: Navigation, label: 'Locate', color: 'blue' },
                          { icon: Shield, label: 'SOS Log', color: 'red' },
                          { icon: Eye, label: 'Monitor', color: 'violet' },
                        ].map(({ icon: Icon, label, color }) => (
                          <motion.button
                            key={label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-xs font-medium`}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </motion.button>
                        ))}
                      </div>

                      {/* Device info */}
                      <div className="flex items-center justify-between text-xs text-white/40 bg-white/5 rounded-xl px-3 py-2">
                        <span>{child.device}</span>
                        <BatteryIcon level={child.battery} />
                        <span>Synced {child.lastSync}</span>
                      </div>
                    </div>

                    {/* School Summary */}
                    <div className="mx-4 mb-4 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bus className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-semibold text-violet-300">School Summary</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">Attendance</p>
                          <p className="text-white font-bold text-base">{child.attendance}%</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">Homework</p>
                          <p className="text-white font-bold text-base">{child.homework}%</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">Status</p>
                          <p className="text-emerald-400 font-bold text-sm">Good</p>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-white/40 text-[10px] uppercase mb-0.5">Teacher Note</p>
                        <p className="text-white/70 text-xs italic">"{child.teacherNote}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ELDERLY MONITOR SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface Elder {
  id: string;
  name: string;
  age: number;
  relationship: string;
  location: string;
  status: 'Stable' | 'At Risk' | 'Critical';
  heartRate: number;
  heartRateTrend: number[];
  bp: string;
  bpStatus: 'Normal' | 'Elevated' | 'High';
  steps: number;
  stepsMax: number;
  lastCheckin: string;
  caregiver: string;
  fallDate: string | null;
  nextMedication: string;
  color: string;
  weeklyHR: number[];
}

const elderlyData: Elder[] = [
  {
    id: 'dadaji',
    name: 'Dadaji',
    age: 80,
    relationship: 'Grandfather',
    location: 'Home',
    status: 'Stable',
    heartRate: 78,
    heartRateTrend: [76, 80, 77, 78, 79, 78, 78],
    bp: '130/85',
    bpStatus: 'Elevated',
    steps: 1200,
    stepsMax: 3000,
    lastCheckin: '12 min ago',
    caregiver: 'Dr. Sharma',
    fallDate: null,
    nextMedication: '2h 15m',
    color: '#10B981',
    weeklyHR: [74, 78, 76, 80, 77, 79, 78],
  },
  {
    id: 'dadiji',
    name: 'Dadiji',
    age: 76,
    relationship: 'Grandmother',
    location: 'Home',
    status: 'At Risk',
    heartRate: 92,
    heartRateTrend: [85, 88, 90, 92, 91, 93, 92],
    bp: '145/90',
    bpStatus: 'High',
    steps: 800,
    stepsMax: 3000,
    lastCheckin: '28 min ago',
    caregiver: 'Dr. Mehra',
    fallDate: null,
    nextMedication: '45m',
    color: '#F59E0B',
    weeklyHR: [84, 86, 89, 91, 88, 92, 92],
  },
];

function HeartSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 30;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

function WeeklyHRChart({ data }: { data: number[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min;
  const w = 280;
  const h = 80;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h + 20}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polyline
          points={points}
          fill="none"
          stroke="#EF4444"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((v - min) / range) * h;
          return (
            <g key={i}>
              <motion.circle
                cx={x}
                cy={y}
                r={3}
                fill="#EF4444"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i + 1, duration: 0.3 }}
              />
              <text x={x} y={h + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">
                {days[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ElderlyMonitorSection() {
  const [selectedElder, setSelectedElder] = useState<string | null>(null);
  const [vitalsExpanded, setVitalsExpanded] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  const bpColor: Record<string, string> = {
    Normal: 'text-emerald-400',
    Elevated: 'text-amber-400',
    High: 'text-red-400',
  };

  const allWeekly = elderlyData.map((e) => e.weeklyHR).reduce((acc, arr) =>
    acc.map((v, i) => Math.round((v + arr[i]) / 2))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Elderly Care</h2>
            <p className="text-xs text-white/50">Health monitoring</p>
          </div>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
            {elderlyData.length}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
          <Shield className="w-3 h-3" /> Care Active
        </span>
      </div>

      {/* Elder Cards */}
      <div className="space-y-3">
        {elderlyData.map((elder) => {
          const isAtRisk = elder.status !== 'Stable';
          return (
            <motion.div
              key={elder.id}
              layout
              className={`${glassCard} p-4 space-y-3 cursor-pointer`}
              style={{ minHeight: 200 }}
              onClick={() => setSelectedElder((s) => (s === elder.id ? null : elder.id))}
              whileHover={{ scale: 1.01 }}
            >
              {/* Top Row */}
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 relative"
                  style={{ background: `${elder.color}33`, border: `2px solid ${elder.color}55` }}
                >
                  {elder.name.charAt(0)}
                  {isAtRisk && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#0f1117] animate-pulse" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{elder.name}</span>
                    <span className="text-white/40 text-xs">{elder.age} yrs</span>
                    <span className="text-white/40 text-xs">• {elder.relationship}</span>
                    <StatusBadge status={elder.status} size="md" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-white/30" />
                    <span className="text-white/40 text-xs">{elder.location}</span>
                    <Clock className="w-3 h-3 text-white/30 ml-1" />
                    <span className="text-white/40 text-xs">Checked {elder.lastCheckin}</span>
                  </div>
                </div>
              </div>

              {/* Vitals Row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Heart Rate */}
                <div className="bg-white/5 rounded-xl p-2.5">
                  <div className="flex items-center gap-1 text-white/40 text-[10px] mb-1">
                    <Heart className="w-3 h-3 text-red-400" /> Heart Rate
                  </div>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      className={`text-xl font-bold ${isAtRisk ? 'text-amber-400' : 'text-white'}`}
                      animate={{ opacity: pulse ? 1 : 0.7 }}
                      transition={{ duration: 0.5 }}
                    >
                      {elder.heartRate}
                    </motion.span>
                    <span className="text-white/40 text-[10px]">bpm</span>
                  </div>
                  <HeartSparkline data={elder.heartRateTrend} color={isAtRisk ? '#F59E0B' : '#10B981'} />
                </div>

                {/* Blood Pressure */}
                <div className="bg-white/5 rounded-xl p-2.5">
                  <div className="flex items-center gap-1 text-white/40 text-[10px] mb-1">
                    <Activity className="w-3 h-3 text-blue-400" /> Blood Pressure
                  </div>
                  <div className={`text-base font-bold ${bpColor[elder.bpStatus]}`}>{elder.bp}</div>
                  <div className={`text-[10px] mt-1 ${bpColor[elder.bpStatus]}`}>{elder.bpStatus}</div>
                  <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        elder.bpStatus === 'Normal'
                          ? 'bg-emerald-400'
                          : elder.bpStatus === 'Elevated'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: elder.bpStatus === 'Normal' ? '40%' : elder.bpStatus === 'Elevated' ? '65%' : '90%',
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white/5 rounded-xl p-2.5">
                  <div className="flex items-center gap-1 text-white/40 text-[10px] mb-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Steps
                  </div>
                  <div className="text-base font-bold text-white">{elder.steps.toLocaleString()}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">/ {elder.stepsMax.toLocaleString()} goal</div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(elder.steps / elder.stepsMax) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-2 gap-2">
                {/* Fall Detection */}
                <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40">Fall Detection</p>
                    {elder.fallDate ? (
                      <p className="text-xs text-red-400 font-medium">Last fall: {elder.fallDate}</p>
                    ) : (
                      <p className="text-xs text-emerald-400 font-medium">No falls this month ✓</p>
                    )}
                  </div>
                </div>

                {/* Medication */}
                <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40">Next Medication</p>
                    <p className="text-xs text-violet-400 font-medium">In {elder.nextMedication}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Activity, label: 'Health History', color: 'rose' },
                  { icon: Bell, label: 'Alert Caregiver', color: 'amber' },
                  { icon: Phone, label: 'Call', color: 'emerald' },
                ].map(({ icon: Icon, label, color }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-xs font-medium`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="text-[10px] text-white/30 text-right">
                Caregiver: {elder.caregiver}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Heart Rate Chart */}
      <div className={`${glassCard} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-white">Weekly Heart Rate Trend</span>
          </div>
          <span className="text-xs text-white/40">Last 7 days — avg</span>
        </div>
        <WeeklyHRChart data={allWeekly} />
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Emergency Contact</p>
          <p className="text-xs text-white/50">Dr. Anand Sharma — Cardiologist</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-500/30"
        >
          Call Now
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVING SAFETY SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface Driver {
  id: string;
  name: string;
  age: number;
  isTeen: boolean;
  score: number;
  distance: number;
  harshBrakes: number;
  speedViolations: number;
  phoneUse: boolean;
  lastTripDate: string;
  lastTripRoute: string;
  lastTripScore: number;
  lastTripDuration: string;
  lastTripDistance: number;
  color: string;
  badge: string;
  trips: { date: string; duration: string; distance: number; score: number; route: string }[];
  coachTip: string;
  coachTrend: 'up' | 'down';
}

const driversData: Driver[] = [
  {
    id: 'rahul',
    name: 'Rahul (Dad)',
    age: 42,
    isTeen: false,
    score: 95,
    distance: 1240,
    harshBrakes: 2,
    speedViolations: 0,
    phoneUse: false,
    lastTripDate: 'Today, 9:15 AM',
    lastTripRoute: 'Home → Office',
    lastTripScore: 97,
    lastTripDuration: '32 min',
    lastTripDistance: 18.4,
    color: '#10B981',
    badge: 'Safe Driver',
    trips: [
      { date: 'Today', duration: '32 min', distance: 18.4, score: 97, route: 'Home → Office' },
      { date: 'Yesterday', duration: '28 min', distance: 16.2, score: 94, route: 'Office → Home' },
      { date: 'Jun 11', duration: '45 min', distance: 24.1, score: 93, route: 'Home → Mall → Home' },
    ],
    coachTip: 'Excellent driving! Keep maintaining safe following distance.',
    coachTrend: 'up',
  },
  {
    id: 'riya',
    name: 'Riya (Teen)',
    age: 16,
    isTeen: true,
    score: 72,
    distance: 320,
    harshBrakes: 8,
    speedViolations: 3,
    phoneUse: true,
    lastTripDate: 'Today, 4:30 PM',
    lastTripRoute: 'School → Home',
    lastTripScore: 68,
    lastTripDuration: '22 min',
    lastTripDistance: 9.6,
    color: '#F59E0B',
    badge: 'Needs Improvement',
    trips: [
      { date: 'Today', duration: '22 min', distance: 9.6, score: 68, route: 'School → Home' },
      { date: 'Yesterday', duration: '25 min', distance: 10.2, score: 74, route: 'Home → School' },
      { date: 'Jun 11', duration: '18 min', distance: 8.8, score: 75, route: 'Mall → Home' },
    ],
    coachTip: 'Detected harsh braking. Maintain 3-second following distance. Avoid phone use while driving.',
    coachTrend: 'down',
  },
];

function ScoreCircle({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-white/40">/100</span>
      </div>
    </div>
  );
}

function TripBar({ score }: { score: number }) {
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444';
  return (
    <div className="w-1 self-stretch rounded-full overflow-hidden bg-white/10 flex-shrink-0">
      <motion.div
        className="w-full rounded-full"
        style={{ background: color }}
        initial={{ height: 0 }}
        animate={{ height: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

export function DrivingSection() {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [dateRange] = useState('Last 30 days');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Driving Safety</h2>
            <p className="text-xs text-white/50">{dateRange}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-semibold flex items-center gap-1.5">
          <Star className="w-3 h-3" /> Teen Mode
        </span>
      </div>

      {/* Driver Score Cards */}
      <div className="space-y-3">
        {driversData.map((driver) => {
          const scoreColor =
            driver.score >= 90 ? '#10B981' : driver.score >= 75 ? '#F59E0B' : '#EF4444';
          const isSelected = selectedDriver === driver.id;

          return (
            <motion.div
              key={driver.id}
              layout
              className={`${glassCard} overflow-hidden cursor-pointer`}
              onClick={() => setSelectedDriver((s) => (s === driver.id ? null : driver.id))}
            >
              {/* Score Row */}
              <div className="flex items-center gap-4 p-4">
                <ScoreCircle score={driver.score} color={scoreColor} size={80} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-white">{driver.name}</span>
                    {driver.isTeen && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-semibold border border-violet-500/30">
                        TEEN
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        color: scoreColor,
                        background: `${scoreColor}20`,
                        borderColor: `${scoreColor}40`,
                      }}
                    >
                      {driver.badge}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      <span>{driver.distance} km driven</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Gauge className={`w-3 h-3 ${driver.harshBrakes > 5 ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className={driver.harshBrakes > 5 ? 'text-red-400' : ''}>
                        {driver.harshBrakes} harsh brakes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <AlertTriangle className={`w-3 h-3 ${driver.speedViolations > 0 ? 'text-red-400' : 'text-white/30'}`} />
                      <span className={driver.speedViolations > 0 ? 'text-red-400' : ''}>
                        {driver.speedViolations} speed violations
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Phone className={`w-3 h-3 ${driver.phoneUse ? 'text-red-400' : 'text-white/30'}`} />
                      <span className={driver.phoneUse ? 'text-red-400' : ''}>
                        {driver.phoneUse ? 'Phone use detected' : 'No phone use'}
                      </span>
                    </div>
                  </div>

                  {/* Last Trip */}
                  <div className="mt-2 text-[10px] text-white/30">
                    Last trip: {driver.lastTripDate} — {driver.lastTripRoute} — Score:{' '}
                    <span style={{ color: scoreColor }}>{driver.lastTripScore}</span>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isSelected ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/30" />
                </motion.div>
              </div>

              {/* Expanded: Trip History + AI Coach */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                      {/* Trip History */}
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Trip History</p>
                        <div className="space-y-2">
                          {driver.trips.map((trip, i) => {
                            const tc =
                              trip.score >= 90 ? '#10B981' : trip.score >= 75 ? '#F59E0B' : '#EF4444';
                            return (
                              <div key={i} className="flex items-stretch gap-2 bg-white/5 rounded-xl p-2.5">
                                <TripBar score={trip.score} />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-white">{trip.route}</span>
                                    <span
                                      className="text-xs font-bold"
                                      style={{ color: tc }}
                                    >
                                      {trip.score}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/40">
                                    <span>{trip.date}</span>
                                    <span>{trip.duration}</span>
                                    <span>{trip.distance} km</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Coach */}
                      <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-semibold text-violet-300">AI Driving Coach</span>
                          {driver.coachTrend === 'up' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-400 ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">{driver.coachTip}</p>
                        {driver.isTeen && driver.harshBrakes > 5 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Reduce harsh braking — improvement needed
                          </div>
                        )}
                      </div>

                      {/* Speed Violation Map Placeholder */}
                      {driver.speedViolations > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-semibold text-white/70">
                              Speed Violation Heatmap
                            </span>
                            <span className="ml-auto text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                              {driver.speedViolations} zones
                            </span>
                          </div>
                          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {/* Fake heatmap blobs */}
                            <div className="absolute w-16 h-16 rounded-full bg-red-500/30 blur-xl top-2 left-8" />
                            <div className="absolute w-10 h-10 rounded-full bg-amber-500/30 blur-lg bottom-2 right-12" />
                            <div className="absolute w-8 h-8 rounded-full bg-red-500/20 blur-lg top-4 right-6" />
                            <span className="text-white/30 text-xs relative z-10">Route Heatmap — Mumbai</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Non-driving placeholder for children */}
      <div className={`${glassCard} p-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Car className="w-5 h-5 text-white/20" />
        </div>
        <div>
          <p className="text-sm text-white/60 font-medium">Aarav, 9 yrs — Not eligible for driving</p>
          <p className="text-xs text-white/30">Driving monitoring will activate at age 16</p>
        </div>
        <Clock className="w-4 h-4 text-white/20 ml-auto" />
      </div>
    </div>
  );
}
