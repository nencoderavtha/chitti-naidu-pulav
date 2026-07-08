import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Home, Minus, Plus, CalendarDays } from 'lucide-react';

const GMIN = 10;
const GMAX = 1000;
const PRESETS = [50, 100, 150, 250, 500, 750];
const clampG = (n) => Math.max(GMIN, Math.min(5000, n));

// ---- confetti party-popper (no dependency) ----
const CONFETTI_COLORS = ['#cf9b2c', '#f4dd9a', '#2f8c4a', '#9e1b1b', '#c8431f', '#e8821e', '#e7c463'];
const POPPERS = ['🎉', '🎊', '✨'];

function makePieces() {
  const arr = [];
  for (let i = 0; i < 30; i++) {
    const ang = (-90 + (Math.random() * 170 - 85)) * (Math.PI / 180); // fan upward
    const dist = 70 + Math.random() * 160;
    arr.push({
      id: `c${i}`,
      emoji: null,
      x: Math.cos(ang) * dist,
      rise: 45 + Math.random() * 95,
      fall: 130 + Math.random() * 150,
      rot: Math.random() * 720 - 360,
      dur: 0.9 + Math.random() * 0.7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 7,
      round: Math.random() < 0.28,
    });
  }
  // a few emoji poppers that shoot straight up
  for (let i = 0; i < 3; i++) {
    arr.push({
      id: `e${i}`,
      emoji: POPPERS[i % POPPERS.length],
      x: (Math.random() - 0.5) * 120,
      rise: 70 + Math.random() * 60,
      fall: 90 + Math.random() * 80,
      rot: Math.random() * 60 - 30,
      dur: 1 + Math.random() * 0.5,
    });
  }
  return arr;
}

function Confetti({ fireKey }) {
  const pieces = useMemo(() => makePieces(), [fireKey]);
  if (!fireKey) return null;
  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id + '-' + fireKey}
          className="confetti-bit"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, -p.rise, p.fall], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: p.dur, ease: 'easeOut', times: [0, 0.35, 1] }}
          style={
            p.emoji
              ? { fontSize: 20 }
              : { width: p.w, height: p.h, background: p.color, borderRadius: p.round ? '50%' : '1px' }
          }
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

// live contextual read-out — changes often as you scrub the slider
const VIBES = [
  { max: 15, icon: '🍽️', text: 'Just you & yours' },
  { max: 22, icon: '🪔', text: 'An intimate dinner' },
  { max: 30, icon: '🫶', text: 'Close family only' },
  { max: 40, icon: '🌿', text: 'A cozy get-together' },
  { max: 50, icon: '🍵', text: 'The evening tiffin crowd' },
  { max: 65, icon: '🏡', text: 'A warm house party' },
  { max: 80, icon: '🎈', text: 'The relatives are here' },
  { max: 95, icon: '🎉', text: 'A lively function' },
  { max: 115, icon: '🎊', text: 'A proper celebration' },
  { max: 140, icon: '🥁', text: "The whole street's invited" },
  { max: 165, icon: '💃', text: 'Sangeet-night numbers' },
  { max: 195, icon: '🪅', text: 'A packed pandal' },
  { max: 230, icon: '✨', text: 'A grand celebration' },
  { max: 270, icon: '🎇', text: "Half the town's coming" },
  { max: 315, icon: '🎆', text: 'A big function' },
  { max: 365, icon: '🍛', text: 'Bulk-biryani territory' },
  { max: 420, icon: '💐', text: 'A festive gathering' },
  { max: 480, icon: '👑', text: 'A royal spread' },
  { max: 550, icon: '🏰', text: 'A big fat wedding' },
  { max: 630, icon: '🌟', text: 'A mega feast' },
  { max: 720, icon: '🔥', text: 'Feeding a small town' },
  { max: 820, icon: '🚩', text: 'Village-fair scale' },
  { max: 920, icon: '🐘', text: 'An elephant-sized order' },
  { max: 1000, icon: '🍚', text: 'Cauldrons of biryani' },
  { max: 1400, icon: '🚚', text: 'Industrial-scale feast' },
  { max: Infinity, icon: '🌌', text: 'A legendary banquet!' },
];
function vibe(g) {
  return VIBES.find((v) => g < v.max) || VIBES[VIBES.length - 1];
}

export default function SetupPanel({
  mode, setMode, eventType, setEventType, guests, setGuests, eventDate, setEventDate, eventTypes,
}) {
  const isFunction = mode === 'function';
  const g = Number(guests) || 0;
  const fill = Math.min(100, Math.max(0, ((g - GMIN) / (GMAX - GMIN)) * 100));
  const v = vibe(g);

  // Fire a confetti burst once the guest count settles (after any +/−, manual
  // entry, slider, or preset — debounced so a run of clicks pops just once).
  const [burst, setBurst] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (!g) return;
    const t = setTimeout(() => setBurst((b) => b + 1), 450);
    return () => clearTimeout(t);
  }, [guests]);

  return (
    <div className="setup-panel">
      {/* sliding segmented mode switch */}
      <div className="segmode" role="tablist">
        <button className={isFunction ? 'active' : ''} onClick={() => setMode('function')} role="tab">
          {isFunction && <motion.span layoutId="segpill" className="seg-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <Users size={18} /> <span>Catering for a function</span>
        </button>
        <button className={!isFunction ? 'active' : ''} onClick={() => setMode('solo')} role="tab">
          {!isFunction && <motion.span layoutId="segpill" className="seg-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <Home size={18} /> <span>Order for home</span>
        </button>
      </div>

      {isFunction ? (
        <div className="setup-cards">
          {/* occasion — horizontal scroll strip */}
          <div className="scard occ-card">
            <div className="scard-label">The occasion</div>
            <div className="occ-row">
              {eventTypes.map((et) => (
                <motion.button
                  key={et.id}
                  whileTap={{ scale: 0.92 }}
                  className={`occ ${eventType.id === et.id ? 'on' : ''}`}
                  onClick={() => setEventType(et)}
                >
                  <span className="occ-glyph">{et.glyph}</span>
                  <span className="occ-name">{et.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* guests — the interactive centrepiece */}
          <div className="scard guests-card">
            <Confetti fireKey={burst} />
            <div className="scard-label">Number of guests</div>

            <div className="guests-main">
              <motion.button whileTap={{ scale: 0.9 }} className="gstep" onClick={() => setGuests(clampG(g - 25))} aria-label="Fewer guests">
                <Minus size={20} />
              </motion.button>
              <div className="gnum">
                <input
                  className="gnum-input"
                  type="text"
                  inputMode="numeric"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value === '' ? '' : Math.min(5000, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0))}
                  onBlur={() => setGuests(clampG(g || GMIN))}
                  aria-label="Number of guests"
                />
                <span className="gnum-cap">guests</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} className="gstep" onClick={() => setGuests(clampG(g + 25))} aria-label="More guests">
                <Plus size={20} />
              </motion.button>
            </div>

            <input
              className="grange"
              type="range"
              min={GMIN}
              max={GMAX}
              step={5}
              value={Math.min(g, GMAX)}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              style={{ background: `linear-gradient(90deg, var(--gold-500) ${fill}%, rgba(42,28,18,0.14) ${fill}%)` }}
              aria-label="Guest slider"
            />

            <div className="gpresets">
              {PRESETS.map((p) => (
                <button key={p} className={g === p ? 'on' : ''} onClick={() => setGuests(p)}>
                  {p}
                </button>
              ))}
              <button className={g >= GMAX ? 'on' : ''} onClick={() => setGuests(1000)}>1000+</button>
            </div>

            <div className="gvibe">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={v.text}
                  className="gvibe-in"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <span className="gvibe-emoji">{v.icon}</span> {v.text}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* date */}
          <div className="scard date-card">
            <div className="scard-label">Function date</div>
            <label className="datefield">
              <CalendarDays size={19} />
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </label>
          </div>
        </div>
      ) : (
        <div className="scard solo-card">
          <div className="scard-label">Ordering for home</div>
          <p className="solo-lead">Pick any dishes and set how many of each — no plate maths.</p>
          <p className="field-note">Portions are generous: a single pulav / biryani box comfortably feeds about two.</p>
        </div>
      )}
    </div>
  );
}
