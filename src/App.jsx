import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Phone } from 'lucide-react';
import PlateVisualizer from './components/PlateVisualizer';
import MenuSelector from './components/MenuSelector';
import OrderSummary from './components/OrderSummary';
import SetupPanel from './components/SetupPanel';
import { SECTIONS, ITEMS_BY_ID, EVENT_TYPES, priceFor } from './MenuData';
import logoImg from './chitti naidu pulav logo.jpg';

function Kolam({ className }) {
  return (
    <svg className={`kolam ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 92 C 8 50, 50 8, 92 8" strokeLinecap="round" />
      <path d="M8 92 C 30 70, 30 40, 60 40 C 80 40, 80 60, 60 60 C 48 60, 48 48, 60 48" />
      <circle cx="8" cy="92" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="92" cy="8" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="30" cy="30" r="2" fill="currentColor" stroke="none" />
      <circle cx="50" cy="22" r="2" fill="currentColor" stroke="none" />
      <circle cx="22" cy="50" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Smooth count-up whenever the target value changes.
function AnimatedNumber({ value, prefix = '', format = (n) => n.toLocaleString('en-IN') }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const dur = 550;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{prefix}{format(display)}</>;
}

export default function App() {
  // 'function' = bulk catering for an event · 'solo' = a person/home ordering to eat
  const [mode, setMode] = useState('function');

  const [vegOnly, setVegOnly] = useState(false);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [guests, setGuests] = useState(150);
  const [eventDate, setEventDate] = useState('');

  // Cart: itemId -> quantity. In function mode a qty is "servings per guest".
  const [qtys, setQtys] = useState({});

  const isFunction = mode === 'function';

  const setQty = (id, n) =>
    setQtys((prev) => {
      const next = { ...prev };
      if (n <= 0) delete next[id];
      else next[id] = Math.min(99, n);
      return next;
    });
  const inc = (id) => setQty(id, (qtys[id] || 0) + 1);
  const dec = (id) => setQty(id, (qtys[id] || 0) - 1);

  // Drop non-veg dishes from the cart when pure-veg is switched on.
  useEffect(() => {
    if (!vegOnly) return;
    setQtys((prev) => {
      const next = {};
      Object.entries(prev).forEach(([id, q]) => {
        if (ITEMS_BY_ID[id]?.veg !== false) next[id] = q;
      });
      return next;
    });
  }, [vegOnly]);

  // Selected line items, resolved with details + the price for the current mode.
  const lines = useMemo(() => {
    return Object.entries(qtys)
      .map(([id, qty]) => {
        const item = ITEMS_BY_ID[id];
        if (!item) return null;
        return { ...item, qty, unit: priceFor(item, mode) };
      })
      .filter(Boolean);
  }, [qtys, mode]);

  // Per-course breakdown. For a "shared serving" course in function mode
  // (the mains), guests eat ONE serving split across the chosen varieties, so
  // its per-plate cost is the quantity-weighted average — not the sum.
  const breakdown = useMemo(() => {
    return SECTIONS.map((sec) => {
      const secLines = lines.filter((l) => l._section === sec.id);
      if (secLines.length === 0) return null;
      const totalQty = secLines.reduce((n, l) => n + l.qty, 0);
      const rawSum = secLines.reduce((t, l) => t + l.unit * l.qty, 0);
      const shared = isFunction && sec.perGuestShare;
      const perPlate = shared ? Math.round(rawSum / totalQty) : rawSum;
      return { id: sec.id, roman: sec.roman, title: sec.title, varieties: secLines.length, perPlate, shared };
    }).filter(Boolean);
  }, [lines, isFunction]);

  // Per-plate = one guest's plate (function) or the whole cart (solo).
  const perPlate = useMemo(() => breakdown.reduce((t, b) => t + b.perPlate, 0), [breakdown]);
  const grandTotal = isFunction ? perPlate * guests : perPlate;

  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const hasOrder = lines.length > 0;

  const plateTitle = isFunction ? `Your ${eventType.label.toLowerCase()} plate` : 'Your plate';

  return (
    <>
      <header className="topbar rise">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <img className="brand-logo" src={logoImg} alt="Chitti Naidu Pulavs — Pulav's | Badam Milk" />
            <span className="topbar-live"><i className="live-dot" />Now taking orders</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-tag">
              <span className="tag-lead">Authentic Andhra</span>
              <span className="tag-main">Pulav <i>·</i> Badam Milk</span>
            </div>
            <a className="topbar-call" href="tel:8008800467">
              <span className="call-ring"><Phone size={15} strokeWidth={2.4} /></span>
              <span className="call-text">
                <span className="call-hint">Call to order</span>
                <span className="call-num">8008800467</span>
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="app">
        <section className="hero rise d1">
          <Kolam className="tl" /><Kolam className="tr" />
          <Kolam className="bl" /><Kolam className="br" />
          <div className="hero-eyebrow">Craft my plate</div>
          <h1>Build your <span className="swash">feast</span><br />on a <span className="telugu">విస్తరాకు</span>.</h1>
          <p className="hero-sub">
            {isFunction
              ? "From weddings to gruhapravesams — compose every plate yourself, dish by dish, and we'll cater it for your whole gathering."
              : 'Craving a proper Andhra plate at home? Pick your pulav and sides, set the quantities, and chat with us to order in minutes.'}
          </p>
        </section>

        {/* mode switch + occasion / guests / date */}
        <div className="rise d2">
          <SetupPanel
            mode={mode}
            setMode={setMode}
            eventType={eventType}
            setEventType={setEventType}
            guests={guests}
            setGuests={setGuests}
            eventDate={eventDate}
            setEventDate={setEventDate}
            eventTypes={EVENT_TYPES}
          />
        </div>

        <section className="builder">
          <div className="stage-wrap rise d3">
            <div className={`stage ${isFunction ? 'stage-bulk' : ''}`}>
              <div className="stage-head">
                <h2>{plateTitle}</h2>
                <span className="count-pill">
                  {isFunction ? `${eventType.glyph} ${guests} guests` : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                </span>
              </div>

              <PlateVisualizer eventLabel={isFunction ? eventType.label : 'home'} lines={lines} />

              {/* premium bulk "quote" band */}
              {isFunction && (
                <div className="bulkband">
                  <div className="bb-stat">
                    <span className="bb-label">Per plate</span>
                    <span className="bb-value"><AnimatedNumber value={perPlate} prefix="₹" /></span>
                  </div>
                  <span className="bb-mult">×</span>
                  <div className="bb-stat">
                    <span className="bb-label">Guests</span>
                    <span className="bb-value"><AnimatedNumber value={Number(guests) || 0} /></span>
                  </div>
                  <div className="bb-grand">
                    <span className="bb-label"><Sparkles size={12} /> Estimated feast</span>
                    <span className="bb-value big"><AnimatedNumber value={grandTotal} prefix="₹" /></span>
                  </div>
                </div>
              )}

              {isFunction && hasOrder && (
                <div className="plate-breakdown">
                  <div className="pb-head">What each plate holds</div>
                  <ul>
                    {breakdown.map((b) => (
                      <li key={b.id}>
                        <span className="pb-roman">{b.roman}</span>
                        <span className="pb-title">
                          {b.title}
                          {b.shared && b.varieties > 1 && (
                            <em className="pb-tag">{b.varieties} varieties · served as a mix</em>
                          )}
                        </span>
                        <span className="pb-price">₹{b.perPlate}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="bulk-note">
                    Function pricing — each guest gets a curated serving within a grand spread, so per-dish rates
                    are lower than a full solo portion. The main course is one serving per guest: extra varieties
                    are served as a mix, so they don't multiply the cost.
                  </p>
                </div>
              )}
            </div>
          </div>

          <MenuSelector
            sections={SECTIONS}
            qtys={qtys}
            mode={mode}
            vegOnly={vegOnly}
            setVegOnly={setVegOnly}
            inc={inc}
            dec={dec}
          />
        </section>
      </div>

      <OrderSummary
        mode={mode}
        lines={lines}
        breakdown={breakdown}
        perPlate={perPlate}
        grandTotal={grandTotal}
        guests={guests}
        itemCount={itemCount}
        eventLabel={eventType.label}
        eventDate={eventDate}
      />
    </>
  );
}
