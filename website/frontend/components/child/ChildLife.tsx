'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Bus,
  Clock,
  Heart,
  Activity,
  Zap,
  Award,
  Star,
  MessageCircle,
  Send,
  Settings,
  Bell,
  Lock,
  ChevronRight,
  Check,
  Flame,
  Target,
  Trophy,
  Moon,
  Sun,
  Droplets,
  User,
  Edit,
  LogOut,
} from 'lucide-react';

// ─── Shared Styles ────────────────────────────────────────────────────────────

const CARD = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '20px',
};

const GOLD = '#F59E0B';
const GOLD_GLOW = 'rgba(245,158,11,0.35)';

// ─── SchoolSection ─────────────────────────────────────────────────────────────

interface ClassEntry {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  status: 'done' | 'now' | 'upcoming';
}

const SCHEDULE: ClassEntry[] = [
  { time: '8:00 AM',  subject: 'Mathematics',   teacher: 'Mr. Sharma',   room: 'R-101', color: '#3B82F6', status: 'done' },
  { time: '9:00 AM',  subject: 'Science',        teacher: 'Mrs. Patel',   room: 'R-204', color: '#10B981', status: 'now' },
  { time: '10:00 AM', subject: 'English',         teacher: 'Ms. Singh',    room: 'R-108', color: '#8B5CF6', status: 'upcoming' },
  { time: '11:00 AM', subject: 'Break',           teacher: '—',            room: 'Lawn',  color: '#6B7280', status: 'upcoming' },
  { time: '11:30 AM', subject: 'Hindi',           teacher: 'Mr. Gupta',    room: 'R-305', color: '#F59E0B', status: 'upcoming' },
  { time: '12:30 PM', subject: 'Lunch',           teacher: '—',            room: 'Canteen', color: '#EF4444', status: 'upcoming' },
  { time: '1:30 PM',  subject: 'Computer Sci.',   teacher: 'Ms. Rao',      room: 'Lab-1', color: '#06B6D4', status: 'upcoming' },
  { time: '2:30 PM',  subject: 'Art',             teacher: 'Mr. Verma',    room: 'R-410', color: '#EC4899', status: 'upcoming' },
  { time: '3:30 PM',  subject: 'Dismissal',       teacher: '—',            room: 'Gate',  color: '#10B981', status: 'upcoming' },
];

interface HomeworkItem {
  subject: string;
  task: string;
  due: string;
  color: string;
  done: boolean;
  overdue: boolean;
}

const HOMEWORK: HomeworkItem[] = [
  { subject: 'Mathematics', task: 'Chapter 5: Algebra exercises pg 84-86', due: 'Today',     color: '#3B82F6', done: false, overdue: false },
  { subject: 'Science',     task: 'Lab report: Photosynthesis experiment',  due: 'Tomorrow',  color: '#10B981', done: false, overdue: false },
  { subject: 'English',     task: 'Essay: My favorite season (300 words)',  due: 'Yesterday', color: '#8B5CF6', done: false, overdue: true  },
  { subject: 'Hindi',       task: 'Poem recitation practice',               due: 'Friday',    color: '#F59E0B', done: true,  overdue: false },
];

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: '∑',
  Science: '⚗',
  English: 'A',
  Break: '☕',
  Hindi: 'अ',
  Lunch: '🥗',
  'Computer Sci.': '</> ',
  Art: '🎨',
  Dismissal: '🏠',
};

export function SchoolSection() {
  const [hwDone, setHwDone] = useState<boolean[]>(HOMEWORK.map(h => h.done));
  const [busProgress, setBusProgress] = useState(0);
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    // Animate bus progress to 65%
    const t = setTimeout(() => setBusProgress(65), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 60000);
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
        }}>
          <Book size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>School</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Delhi Public School</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={16} color={GOLD} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today&apos;s Schedule
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          {/* vertical line */}
          <div style={{
            position: 'absolute', left: '38px', top: 0, bottom: 0,
            width: '2px', background: 'rgba(255,255,255,0.06)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SCHEDULE.map((cls, i) => {
              const isDone = cls.status === 'done';
              const isNow  = cls.status === 'now';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isNow ? 'rgba(245,158,11,0.08)' : 'transparent',
                    borderLeft: isNow ? `3px solid ${GOLD}` : '3px solid transparent',
                    opacity: isDone ? 0.45 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* time */}
                  <span style={{
                    fontSize: '11px', fontWeight: 600, color: isNow ? GOLD : 'rgba(255,255,255,0.4)',
                    width: '58px', flexShrink: 0, textAlign: 'right',
                  }}>
                    {cls.time}
                  </span>

                  {/* dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isDone ? 'rgba(255,255,255,0.2)' : cls.color,
                    boxShadow: isNow ? `0 0 8px ${cls.color}` : 'none',
                    flexShrink: 0,
                  }} />

                  {/* subject icon */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: isDone ? 'rgba(255,255,255,0.05)' : `${cls.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', flexShrink: 0,
                  }}>
                    {SUBJECT_ICONS[cls.subject] || '📖'}
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: isNow ? 700 : 500, color: isNow ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                        {cls.subject}
                      </span>
                      {isNow && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: '#000',
                          background: GOLD, borderRadius: '4px', padding: '1px 6px',
                          letterSpacing: '0.05em',
                        }}>NOW</span>
                      )}
                      {isDone && <Check size={12} color="#10B981" />}
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                      {cls.teacher} · {cls.room}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* School Bus Tracking */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bus size={16} color='#F59E0B' />
            <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              School Bus
            </span>
          </div>
          <div style={{
            background: 'rgba(16,185,129,0.15)', borderRadius: '20px', padding: '4px 12px',
            fontSize: '12px', fontWeight: 600, color: '#10B981',
          }}>
            Bus DL-01-XY-4567
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            Driver: <span style={{ color: '#fff', fontWeight: 500 }}>Ramu Singh</span>
          </div>
        </div>

        {/* Route stops */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {['Home', 'Stop 1', 'School'].map((stop, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: i <= 1 ? '#10B981' : 'rgba(255,255,255,0.2)',
                boxShadow: i === 1 ? '0 0 8px #10B981' : 'none',
              }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{stop}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{
            height: '6px', borderRadius: '3px',
            background: 'rgba(255,255,255,0.08)',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${busProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '3px',
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#10B981', border: '2px solid #fff',
                boxShadow: '0 0 8px rgba(16,185,129,0.6)',
              }} />
            </motion.div>
          </div>
        </div>

        {/* Map placeholder */}
        <div style={{
          borderRadius: '12px', overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
          height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Road lines decoration */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="12,8" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </svg>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Bus size={20} color={GOLD} />
            <div style={{ fontSize: '12px', color: GOLD, fontWeight: 600, marginTop: '4px' }}>
              Arrives in {countdown} min
            </div>
          </div>
        </div>
      </div>

      {/* Homework */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Book size={16} color='#8B5CF6' />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Homework Due
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {HOMEWORK.map((hw, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px', borderRadius: '12px',
                background: hw.overdue ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hw.overdue ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`,
                opacity: hwDone[i] ? 0.5 : 1,
              }}
            >
              {/* checkbox */}
              <button
                onClick={() => setHwDone(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  border: `2px solid ${hwDone[i] ? hw.color : 'rgba(255,255,255,0.2)'}`,
                  background: hwDone[i] ? hw.color : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {hwDone[i] && <Check size={13} color="#fff" />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    color: hw.color,
                    background: `${hw.color}18`, borderRadius: '4px', padding: '1px 7px',
                  }}>
                    {hw.subject}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: hw.overdue ? '#EF4444' : 'rgba(255,255,255,0.4)',
                  }}>
                    {hw.overdue ? '⚠ Overdue' : hw.due}
                  </span>
                </div>
                <p style={{
                  margin: '4px 0 0', fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: hwDone[i] ? 'line-through' : 'none',
                }}>
                  {hw.task}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HealthSection ─────────────────────────────────────────────────────────────

const WEEKLY_STEPS = [6200, 8100, 7400, 9800, 5600, 8234, 0];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ActivityRings() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  const rings = [
    { label: 'Steps',   color: '#3B82F6', pct: 0.823, r: 88, width: 12 },
    { label: 'Calories',color: '#F97316', pct: 0.70,  r: 68, width: 12 },
    { label: 'Active',  color: '#10B981', pct: 0.60,  r: 48, width: 12 },
  ];

  const cx = 100;
  const cy = 100;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {rings.map((ring) => {
          const circumference = 2 * Math.PI * ring.r;
          const offset = animated ? circumference * (1 - ring.pct) : circumference;
          return (
            <g key={ring.label}>
              {/* track */}
              <circle
                cx={cx} cy={cy} r={ring.r}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={ring.width}
              />
              {/* progress */}
              <motion.circle
                cx={cx} cy={cy} r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.width}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ filter: `drop-shadow(0 0 6px ${ring.color})` }}
              />
            </g>
          );
        })}
        {/* center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700">8,234</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11">steps today</text>
      </svg>

      {/* ring labels outside */}
      <div style={{
        position: 'absolute', top: '10px', right: '-60px',
        display: 'flex', flexDirection: 'column', gap: '18px',
      }}>
        {rings.map(ring => (
          <div key={ring.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ring.color }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (value / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export function HealthSection() {
  const steps = 8234;
  const goalSteps = 10000;
  const heartRate = 78;
  const calories = 420;
  const sleep = 7.5;
  const water = 1200;
  const waterGoal = 2000;
  const activeMin = 45;

  const maxWeekly = Math.max(...WEEKLY_STEPS, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #EF4444, #F97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
        }}>
          <Heart size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>Health</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Activity & Wellness</p>
        </div>
      </div>

      {/* Activity Rings */}
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', alignSelf: 'flex-start' }}>
          Activity Rings
        </span>
        <ActivityRings />
        <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
          {[
            { label: 'Steps',    value: `${steps.toLocaleString()} / ${goalSteps.toLocaleString()}`, color: '#3B82F6' },
            { label: 'Calories', value: `${calories} / 600 kcal`,  color: '#F97316' },
            { label: 'Active',   value: `${activeMin} / 75 min`,   color: '#10B981' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: item.color, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vital Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Heart Rate */}
        <div style={{ ...CARD, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Heart size={14} color="#EF4444" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>HEART RATE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.85 }}
              style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444' }}
            >
              <AnimatedCount value={heartRate} />
            </motion.span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>bpm</span>
          </div>
          <div style={{ marginTop: '8px', height: '28px', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, Math.random() * 18 + 4, 4] }}
                transition={{ repeat: Infinity, duration: 0.8 + i * 0.05, delay: i * 0.04 }}
                style={{ width: '3px', background: '#EF4444', borderRadius: '2px', opacity: 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div style={{ ...CARD, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Moon size={14} color="#8B5CF6" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>SLEEP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#8B5CF6' }}>{sleep}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>hrs</span>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(sleep / 9) * 100}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', borderRadius: '2px', background: '#8B5CF6' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Goal: 9 hrs</div>
          </div>
        </div>

        {/* Water */}
        <div style={{ ...CARD, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Droplets size={14} color="#06B6D4" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>WATER</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#06B6D4' }}>1.2L</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/ 2L</span>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(water / waterGoal) * 100}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', borderRadius: '2px', background: '#06B6D4' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{water} ml consumed</div>
          </div>
        </div>

        {/* Calories */}
        <div style={{ ...CARD, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Flame size={14} color="#F97316" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>CALORIES</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#F97316' }}>{calories}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>kcal</span>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(calories / 600) * 100}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', borderRadius: '2px', background: '#F97316' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Goal: 600 kcal</div>
          </div>
        </div>
      </div>

      {/* Weekly Steps Bar Chart */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Activity size={16} color='#3B82F6' />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Weekly Steps
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
          {WEEKLY_STEPS.map((val, i) => {
            const isToday = i === 5;
            const pct = val / maxWeekly;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    background: isToday
                      ? 'linear-gradient(180deg, #3B82F6, #60A5FA)'
                      : i === 6
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(59,130,246,0.35)',
                    boxShadow: isToday ? '0 0 8px rgba(59,130,246,0.4)' : 'none',
                  }}
                />
                <span style={{ fontSize: '10px', color: isToday ? '#3B82F6' : 'rgba(255,255,255,0.35)', fontWeight: isToday ? 700 : 400 }}>
                  {DAYS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Challenge */}
      <div style={{
        ...CARD,
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} color={GOLD} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>10K Step Challenge</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD }}>
            {Math.round((steps / goalSteps) * 100)}%
          </span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', marginBottom: '10px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(steps / goalSteps) * 100}%` }}
            transition={{ duration: 1.2 }}
            style={{
              height: '100%', borderRadius: '4px',
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
              boxShadow: '0 0 8px rgba(59,130,246,0.4)',
            }}
          />
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          You&apos;re {(goalSteps - steps).toLocaleString()} steps away from your goal! Keep going! 🔥
        </p>
      </div>
    </div>
  );
}

// ─── AchievementsSection ───────────────────────────────────────────────────────

interface Badge {
  icon: React.ReactNode;
  name: string;
  desc: string;
  color: string;
  unlocked: boolean;
}

const BADGES: Badge[] = [
  { icon: <Star size={22} />,        name: 'Safe Guardian',   desc: '7 safe days',     color: '#F59E0B', unlocked: true  },
  { icon: <Activity size={22} />,    name: 'Step Master',     desc: '100K steps',      color: '#3B82F6', unlocked: true  },
  { icon: <Book size={22} />,        name: 'Attendance Star', desc: 'Full attendance', color: '#10B981', unlocked: true  },
  { icon: <Sun size={22} />,         name: 'Early Bird',      desc: 'On time 7 days',  color: '#F97316', unlocked: false },
  { icon: <Zap size={22} />,         name: 'SOS Hero',        desc: 'Used SOS safely', color: '#EF4444', unlocked: false },
  { icon: <Heart size={22} />,       name: 'Family First',    desc: 'Daily check-in',  color: '#EC4899', unlocked: false },
];

const LEADERBOARD = [
  { name: 'You',    steps: 8234,  color: GOLD,      rank: 1 },
  { name: 'Dad',    steps: 7680,  color: '#8B5CF6', rank: 2 },
  { name: 'Mom',    steps: 6210,  color: '#3B82F6', rank: 3 },
  { name: 'Sister', steps: 5400,  color: '#10B981', rank: 4 },
];

export function AchievementsSection() {
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #F59E0B, #F97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
        }}>
          <Trophy size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>Achievements</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Your milestones</p>
        </div>
      </div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...CARD,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245,158,11,0.5)',
            flexShrink: 0,
          }}
        >
          <Flame size={28} color="#fff" />
        </motion.div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: GOLD }}>7 Day Streak</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Safety check-in streak</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: i < 7 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${i < 7 ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700,
                color: i < 7 ? GOLD : 'rgba(255,255,255,0.2)',
              }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Award size={16} color={GOLD} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Badges
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          {BADGES.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: badge.unlocked ? 1 : 0.45, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.08 }}
              onHoverStart={() => setHoveredBadge(i)}
              onHoverEnd={() => setHoveredBadge(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                cursor: 'pointer', padding: '12px 8px',
                borderRadius: '14px',
                background: badge.unlocked ? `${badge.color}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${badge.unlocked ? `${badge.color}30` : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.2s',
              }}
            >
              {/* badge circle */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: badge.unlocked ? `linear-gradient(135deg, ${badge.color}, ${badge.color}99)` : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: badge.unlocked ? `0 0 ${hoveredBadge === i ? '20px' : '10px'} ${badge.color}60` : 'none',
                transition: 'box-shadow 0.2s',
                color: badge.unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
                filter: badge.unlocked ? 'none' : 'grayscale(100%)',
              }}>
                {badge.icon}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: badge.unlocked ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: '10px', color: badge.unlocked ? badge.color : 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Trophy size={16} color='#F59E0B' />
          <span style={{ fontSize: '13px', fontWeight: 600, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Family Leaderboard
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LEADERBOARD.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '12px',
                background: i === 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span style={{
                fontSize: '14px', fontWeight: 800,
                color: i === 0 ? GOLD : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7C2F' : 'rgba(255,255,255,0.3)',
                width: '20px',
              }}>
                #{entry.rank}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: entry.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#fff',
              }}>
                {entry.name[0]}
              </div>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                {entry.name}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: entry.color }}>
                {entry.steps.toLocaleString()} steps
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* XP Progress */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={16} color='#8B5CF6' />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Level 5</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>→ Level 6</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8B5CF6' }}>340 / 500 XP</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1.2 }}
            style={{
              height: '100%', borderRadius: '4px',
              background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
              boxShadow: '0 0 8px rgba(139,92,246,0.5)',
            }}
          />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          160 XP more to reach Level 6 — Safety Champion!
        </p>
      </div>
    </div>
  );
}

// ─── ChatSection ───────────────────────────────────────────────────────────────

interface Message {
  id: number;
  sender: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  mine: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1,  sender: 'Mom',    initials: 'M', color: '#3B82F6', text: 'Hey beta, are you at school safely?',          time: '8:02 AM',  mine: false },
  { id: 2,  sender: 'You',    initials: 'Y', color: GOLD,      text: 'Yes Mom! I\'m here. Science class starting.',   time: '8:05 AM',  mine: true  },
  { id: 3,  sender: 'Dad',    initials: 'D', color: '#8B5CF6', text: 'Great! Study hard today. Proud of you 💪',      time: '8:06 AM',  mine: false },
  { id: 4,  sender: 'You',    initials: 'Y', color: GOLD,      text: 'Thanks Dad! I will! 😊',                        time: '8:07 AM',  mine: true  },
  { id: 5,  sender: 'Sister', initials: 'S', color: '#10B981', text: 'Don\'t forget your lunch box!',                 time: '12:15 PM', mine: false },
  { id: 6,  sender: 'You',    initials: 'Y', color: GOLD,      text: 'I\'m at school 📚 Having lunch now.',           time: '12:18 PM', mine: true  },
  { id: 7,  sender: 'Mom',    initials: 'M', color: '#3B82F6', text: 'Bus will be there at 3:45. Be ready at gate.',  time: '3:20 PM',  mine: false },
];

const QUICK_REPLIES = [
  { text: "I'm Safe 👍",    color: '#10B981' },
  { text: "On my way 🚗",  color: '#3B82F6' },
  { text: "At School 📚",  color: '#8B5CF6' },
  { text: "Need Help ❗",  color: '#EF4444' },
];

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(INITIAL_MESSAGES.length + 1);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: msgId.current++,
      sender: 'You',
      initials: 'Y',
      color: GOLD,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: msgId.current++,
        sender: 'Mom',
        initials: 'M',
        color: '#3B82F6',
        text: 'Got it! Stay safe beta ❤️',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: false,
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
          }}>
            <MessageCircle size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>Family Chat</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '12px', color: '#10B981' }}>3 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div
        ref={listRef}
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px',
          paddingRight: '4px', minHeight: '300px', maxHeight: '420px',
        }}
      >
        {messages.map((msg, i) => {
          const showTime = i === 0 || messages[i - 1].time !== msg.time;
          return (
            <div key={msg.id}>
              {showTime && (
                <div style={{ textAlign: 'center', margin: '8px 0 4px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '20px' }}>
                    {msg.time}
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  flexDirection: msg.mine ? 'row-reverse' : 'row',
                  alignItems: 'flex-end', gap: '8px',
                }}
              >
                {!msg.mine && (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: '#fff',
                  }}>
                    {msg.initials}
                  </div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  {!msg.mine && (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', marginLeft: '4px' }}>
                      {msg.sender}
                    </div>
                  )}
                  <div style={{
                    padding: '10px 14px', borderRadius: msg.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.mine
                      ? 'linear-gradient(135deg, #F59E0B, #F97316)'
                      : 'rgba(255,255,255,0.08)',
                    border: msg.mine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: '14px',
                    color: msg.mine ? '#000' : 'rgba(255,255,255,0.85)',
                    fontWeight: msg.mine ? 600 : 400,
                    lineHeight: '1.4',
                    boxShadow: msg.mine ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#fff',
              }}>M</div>
              <div style={{
                padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255,255,255,0.08)', display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(dot => (
                  <motion.div
                    key={dot}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: dot * 0.15 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Replies */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 0 8px' }}>
        {QUICK_REPLIES.map((qr, i) => (
          <button
            key={i}
            onClick={() => sendMessage(qr.text)}
            style={{
              background: `${qr.color}18`,
              border: `1px solid ${qr.color}40`,
              borderRadius: '20px', padding: '6px 14px',
              fontSize: '12px', fontWeight: 600,
              color: qr.color, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {qr.text}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
      }}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(inputText); }}
          placeholder="Type a message..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '14px', color: '#fff', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => setInputText(prev => prev + '😊')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
        >
          😊
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(inputText)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: inputText.trim() ? 'linear-gradient(135deg, #F59E0B, #F97316)' : 'rgba(255,255,255,0.08)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            boxShadow: inputText.trim() ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
          }}
        >
          <Send size={15} color={inputText.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
        </motion.button>
      </div>
    </div>
  );
}

// ─── SettingsSection ───────────────────────────────────────────────────────────

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  color?: string;
}

function Toggle({ on, onToggle, color = GOLD }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '44px', height: '26px', borderRadius: '13px',
        background: on ? color : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.25s',
        flexShrink: 0,
        boxShadow: on ? `0 0 8px ${color}80` : 'none',
      }}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: '3px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  sublabel?: string;
  hasToggle?: boolean;
  toggleOn?: boolean;
  onToggle?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, iconColor, label, sublabel, hasToggle, toggleOn, onToggle, danger }: SettingsRowProps) {
  return (
    <motion.button
      whileTap={!hasToggle ? { scale: 0.98 } : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '12px 0', textAlign: 'left',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
        background: `${iconColor}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: danger ? '#EF4444' : '#fff' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{sublabel}</div>}
      </div>

      {hasToggle
        ? <Toggle on={!!toggleOn} onToggle={onToggle || (() => {})} color={iconColor} />
        : <ChevronRight size={16} color={danger ? '#EF4444' : 'rgba(255,255,255,0.25)'} />
      }
    </motion.button>
  );
}

export function SettingsSection() {
  const [locationSharing, setLocationSharing] = useState(true);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [sosAutocall, setSosAutocall] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [quietHours, setQuietHours] = useState(true);
  const [biometric, setBiometric] = useState(true);

  const GROUPS = [
    {
      title: 'Safety',
      color: '#10B981',
      rows: [
        { icon: <User size={16} />, iconColor: '#10B981', label: 'Emergency Contacts', sublabel: '3 contacts added' },
        { icon: <Target size={16} />, iconColor: '#3B82F6', label: 'Geofence Alerts', hasToggle: true, toggleOn: geofenceAlerts, onToggle: () => setGeofenceAlerts(p => !p) },
        { icon: <Zap size={16} />, iconColor: '#EF4444', label: 'SOS Auto-Call', sublabel: 'Calls emergency contact', hasToggle: true, toggleOn: sosAutocall, onToggle: () => setSosAutocall(p => !p) },
      ],
    },
    {
      title: 'Privacy',
      color: '#8B5CF6',
      rows: [
        { icon: <Activity size={16} />, iconColor: '#8B5CF6', label: 'Location Sharing', sublabel: 'Visible to family', hasToggle: true, toggleOn: locationSharing, onToggle: () => setLocationSharing(p => !p) },
        { icon: <Clock size={16} />, iconColor: '#6B7280', label: 'Location History', sublabel: 'Last 30 days' },
      ],
    },
    {
      title: 'Notifications',
      color: '#F59E0B',
      rows: [
        { icon: <Bell size={16} />, iconColor: GOLD, label: 'Push Notifications', hasToggle: true, toggleOn: pushNotifs, onToggle: () => setPushNotifs(p => !p) },
        { icon: <MessageCircle size={16} />, iconColor: '#3B82F6', label: 'SMS Alerts', hasToggle: true, toggleOn: smsNotifs, onToggle: () => setSmsNotifs(p => !p) },
        { icon: <Moon size={16} />, iconColor: '#8B5CF6', label: 'Quiet Hours', sublabel: '10:00 PM – 7:00 AM', hasToggle: true, toggleOn: quietHours, onToggle: () => setQuietHours(p => !p) },
      ],
    },
    {
      title: 'Account',
      color: '#06B6D4',
      rows: [
        { icon: <Lock size={16} />, iconColor: '#06B6D4', label: 'Change PIN', sublabel: 'Last changed 30 days ago' },
        { icon: <Star size={16} />, iconColor: GOLD, label: 'Biometric Login', hasToggle: true, toggleOn: biometric, onToggle: () => setBiometric(p => !p) },
        { icon: <Settings size={16} />, iconColor: '#6B7280', label: 'Linked Device', sublabel: 'iPhone 13 — Active' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'linear-gradient(135deg, #6B7280, #374151)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(107,114,128,0.4)',
        }}>
          <Settings size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>Settings</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Account & Preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...CARD,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.08))',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #F97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 800, color: '#fff',
          boxShadow: '0 0 20px rgba(245,158,11,0.4)',
          flexShrink: 0,
        }}>
          A
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Aarav Sharma</div>
          <div style={{
            fontSize: '12px', fontWeight: 600, color: GOLD,
            background: 'rgba(245,158,11,0.12)', borderRadius: '6px', padding: '2px 8px',
            display: 'inline-block', marginTop: '4px',
          }}>
            Child Account
          </div>
        </div>

        <button style={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Edit size={15} color="rgba(255,255,255,0.6)" />
        </button>
      </motion.div>

      {/* Settings Groups */}
      {GROUPS.map((group, gi) => (
        <motion.div
          key={gi}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
          style={{ ...CARD }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {group.title}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {group.rows.map((row, ri) => (
              <div key={ri}>
                {ri > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 0' }} />}
                <SettingsRow {...row} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{
          ...CARD,
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          Danger Zone
        </div>
        <SettingsRow
          icon={<LogOut size={16} />}
          iconColor="#EF4444"
          label="Request Account Deletion"
          sublabel="Permanently delete all data"
          danger
        />
      </motion.div>
    </div>
  );
}
