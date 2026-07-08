import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import plateImg from '../plate.webp';

// Food is *served* onto the leaf, not pinned as icons: mains form one combined
// helping in the centre that splits into proportional mounds as you add
// varieties (a guest still eats one serving), and the rest ring the leaf.
function ringPos(index, total, radius) {
  const angle = (-90 + (360 / Math.max(total, 1)) * index) * (Math.PI / 180);
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
}

// Build a pie-sector clip-path (degrees) so each main variety fills its own
// slice of the one central rice serving — like real food portioned together.
function wedgeClip(a0, a1) {
  const pts = ['50% 50%'];
  const steps = Math.max(2, Math.ceil((a1 - a0) / 7));
  for (let s = 0; s <= steps; s++) {
    const ang = ((a0 + ((a1 - a0) * s) / steps) * Math.PI) / 180;
    pts.push(`${(50 + 80 * Math.cos(ang)).toFixed(1)}% ${(50 + 80 * Math.sin(ang)).toFixed(1)}%`);
  }
  return `polygon(${pts.join(',')})`;
}

// deterministic tiny "hand-served" jitter so mounds don't look machine-placed
function jitter(id, spread) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return ((h % 1000) / 1000 - 0.5) * 2 * spread;
}

// How far to zoom into each photo so ONLY the food fills the mask — this
// crops out the bowl rim + table so nothing but the dish sits on the leaf.
// Wide "on a table" shots need more zoom; tight close-ups need less.
const ZOOM = { pulav: 178, starters: 188, curries: 150, pickles: 150, sweets: 156, drinks: 165 };

export default function PlateVisualizer({ eventLabel, lines }) {
  const drinks = lines.filter((l) => l._section === 'drinks');
  const mains = lines.filter((l) => l._section === 'pulav');
  const ring = lines.filter((l) => l._section !== 'pulav' && l._section !== 'drinks');
  const isEmpty = lines.length === 0;

  // Scroll-synced orbit: rotate the whole plate (leaf + food + grains) as the
  // page scrolls, so it feels like a top-down camera slowly circling the dish.
  const { scrollY } = useScroll();
  const rawRot = useTransform(scrollY, (y) => y * 0.05);
  const rotate = useSpring(rawRot, { stiffness: 60, damping: 20, mass: 0.6 });

  // ---- mains: ONE serving of rice — variety mounds that nestle & overlap
  // in the centre (a guest still eats one serving) ----
  const mainQty = mains.reduce((n, m) => n + m.qty, 0) || 1;
  const MAIN_D = 56;
  const clusterR = mains.length === 2 ? 9 : mains.length === 3 ? 11 : 12;
  const placedMains = mains.map((m, i) => {
    const share = m.qty / mainQty;
    const size = Math.max(26, MAIN_D * Math.sqrt(share));
    let x = 50, y = 50;
    if (mains.length > 1) {
      const p = ringPos(i, mains.length, clusterR);
      x = p.x; y = p.y;
    }
    return { ...m, x, y, size, base: true, z: 6 };
  });

  // ---- everything else: served around the leaf ----
  const ringRadius = ring.length <= 6 ? 35 : ring.length <= 10 ? 37 : 38.5;
  const placedRing = ring.map((it, i) => {
    const p = ringPos(i, ring.length, ringRadius);
    const size = 14 + Math.min(it.qty - 1, 3) * 1.4;
    return {
      ...it,
      x: p.x + jitter(it.id, 1.6),
      y: p.y + jitter(it.id + 'y', 1.6),
      size,
      base: false,
      z: 4,
    };
  });

  const servings = [...placedRing, ...placedMains];

  // Craft loose rice grains around each main's boundary. Two layers:
  // (A) a dense fine band that buries the feather, and (B) stray grains that
  // spill just onto the leaf. Each grain is a tiny crop sampled from the FOOD
  // itself (centre of the photo, not the bowl/table) so its colour matches.
  const grains = [];
  const addGrain = (m, tag, a, rr, gs, op) =>
    grains.push({
      id: `${m.id}-${tag}`,
      img: m.img,
      gx: m.x + rr * Math.cos(a),
      gy: m.y + rr * Math.sin(a),
      gs,
      op,
      bx: 50 + jitter(`${m.id}${tag}bx`, 26), // sample from the rice, not the rim
      by: 50 + jitter(`${m.id}${tag}by`, 26),
      ar: 1.5 + Math.abs(jitter(`${m.id}${tag}ar`, 1.1)), // varied grain lengths
      bs: 600 + Math.abs(jitter(`${m.id}${tag}bs`, 360)), // varied grain zoom
      rot: (a * 180) / Math.PI + jitter(`${m.id}${tag}rot`, 75),
      z: m.z,
    });

  placedMains.forEach((m) => {
    const R = m.size / 2;
    // (A) dense fine band packed into the feather (~0.72–0.98 of the radius)
    const countA = Math.min(240, Math.max(120, Math.round(m.size * 4.6)));
    for (let k = 0; k < countA; k++) {
      const a = jitter(`${m.id}Aa${k}`, Math.PI) + Math.PI;
      const rr = R * (0.85 + jitter(`${m.id}Ar${k}`, 0.14));
      const gs = Math.max(0.55, m.size * 0.028 * (1 + jitter(`${m.id}As${k}`, 0.5)));
      addGrain(m, `A${k}`, a, rr, gs, 1);
    }
    // (B) stray grains spilling just past the edge onto the leaf
    const countB = Math.min(80, Math.max(36, Math.round(m.size * 1.4)));
    for (let k = 0; k < countB; k++) {
      const a = jitter(`${m.id}Ba${k}`, Math.PI) + Math.PI;
      const rr = R * (1.0 + Math.abs(jitter(`${m.id}Br${k}`, 0.12)));
      const gs = Math.max(0.7, m.size * 0.04 * (1 + jitter(`${m.id}Bs${k}`, 0.5)));
      addGrain(m, `B${k}`, a, rr, gs, 0.9);
    }
  });

  return (
    <>
      <div className="leaf-frame">
      <motion.div className="plate-disc" style={{ rotate }}>
        <img className="plate-img" src={plateImg} alt="Traditional stitched leaf plate" />

        <AnimatePresence>
          {servings.map((s) => (
            <motion.div
              key={s.id}
              className={`serving ${s.base ? 'main' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}%`, translateX: '-50%', translateY: '-50%', zIndex: s.z }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <div
                className="serving-food"
                style={{ backgroundImage: `url(${s.img})`, backgroundSize: `${ZOOM[s._section] || 170}%` }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* loose rice-grain stickers scattered along the mains' boundaries */}
        {grains.map((g) => (
          <div
            key={g.id}
            className="grain"
            style={{
              left: `${g.gx}%`,
              top: `${g.gy}%`,
              width: `${g.gs}%`,
              aspectRatio: g.ar,
              opacity: g.op,
              transform: `translate(-50%, -50%) rotate(${g.rot}deg)`,
              backgroundImage: `url(${g.img})`,
              backgroundPosition: `${g.bx}% ${g.by}%`,
              backgroundSize: `${g.bs}%`,
              zIndex: g.z,
            }}
          />
        ))}
      </motion.div>

      {/* upright hint overlay — does not rotate with the plate */}
      {isEmpty && (
        <div className="empty-hint">
          <div className="e-title">A fresh విస్తరాకు</div>
          <div className="e-sub">Add a pulav and dishes — watch your {eventLabel.toLowerCase()} plate come to life.</div>
        </div>
      )}

      </div>

      {/* drinks — first 4 fill the base row (near the bar); extras stack on a
          row ABOVE, pushed to the left & right edges so the layout stays tight */}
      <AnimatePresence>
        {drinks.length > 0 && (
          <motion.div
            className="drink-shelf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {drinks.length > 4 && (
              <div className="drink-row drink-row-top">
                <AnimatePresence mode="popLayout">
                  {drinks.slice(4).map((d) => renderDrink(d))}
                </AnimatePresence>
              </div>
            )}
            <div className="drink-row drink-row-base">
              <AnimatePresence mode="popLayout">
                {drinks.slice(0, 4).map((d) => renderDrink(d))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function renderDrink(d) {
  return (
    <motion.div
      key={d.id}
      className="drink"
      layout
      initial={{ scale: 0.4, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.4, opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
    >
      <span className="drink-glass">
        <img className="drink-cut" src={d.cut} alt={d.name} />
        {d.qty > 1 && <span className="drink-qty">×{d.qty}</span>}
      </span>
      <span className="drink-name">{d.name}</span>
    </motion.div>
  );
}
