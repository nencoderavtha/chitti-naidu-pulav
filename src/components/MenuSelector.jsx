import React, { useState } from 'react';
import { ChevronDown, Check, Leaf, Minus, Plus } from 'lucide-react';
import { priceFor } from '../MenuData';

function VegDot({ veg }) {
  if (typeof veg !== 'boolean') return null;
  return <span className={`veg-dot ${veg ? 'veg' : 'non'}`} aria-label={veg ? 'Veg' : 'Non-veg'} />;
}

function DishCard({ item, qty, mode, onInc, onDec }) {
  const selected = qty > 0;
  const unit = priceFor(item, mode);
  const isFunction = mode === 'function';
  const saving = isFunction && unit < item.price;

  return (
    <div className={`dishcard ${selected ? 'selected' : ''}`}>
      {item.note && <span className="badge">{item.note}</span>}
      {selected && <span className="qty-flag">×{qty}</span>}

      <div className="thumb-wrap">
        <img className="thumb" src={item.img} alt={item.name} loading="lazy" />
        <VegDot veg={item.veg} />
      </div>

      <span className="name">{item.name}</span>

      <div className="price-row">
        <span className="price">₹{unit}</span>
        {isFunction && <small className="per">/plate</small>}
        {saving && <s className="was">₹{item.price}</s>}
        {!isFunction && item.serves && <small className="serves">serves ~{item.serves}</small>}
      </div>

      {selected ? (
        <div className="qty">
          <button onClick={onDec} aria-label={`Fewer ${item.name}`}><Minus size={15} strokeWidth={2.6} /></button>
          <span className="qty-num">{qty}</span>
          <button onClick={onInc} aria-label={`More ${item.name}`}><Plus size={15} strokeWidth={2.6} /></button>
        </div>
      ) : (
        <button className="add-btn" onClick={onInc}>
          <Plus size={15} strokeWidth={2.8} /> Add
        </button>
      )}
    </div>
  );
}

function Section({ roman, kicker, title, count, defaultOpen, banner, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section ${open ? 'open' : ''}`}>
      <div className="section-head" onClick={() => setOpen((o) => !o)} role="button" tabIndex={0}>
        <span className="medallion">{roman}</span>
        <div className="section-titles">
          <div className="kicker">{kicker}</div>
          <h3>{title}</h3>
        </div>
        {count > 0 && <span className="section-count">{count} added</span>}
        <span className="chev-btn"><ChevronDown size={17} strokeWidth={2.6} /></span>
      </div>
      {open && (
        <>
          {banner}
          <div className="grid">{children}</div>
        </>
      )}
    </div>
  );
}

export default function MenuSelector({ sections, qtys, mode, vegOnly, setVegOnly, inc, dec }) {
  const hide = (item) => vegOnly && item.veg === false;

  return (
    <div className="menu">
      <div className="veg-toggle">
        <span className="veg-ico"><Leaf size={18} strokeWidth={2.2} /></span>
        <div className="label">Pure-veg menu<small>Hide all non-veg dishes</small></div>
        <label className="switch">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
          <span className="track" />
        </label>
      </div>

      {sections.map((sec, i) => {
        const visible = sec.items.filter((it) => !hide(it));
        const count = visible.reduce((n, it) => n + (qtys[it.id] ? 1 : 0), 0);

        // "Shared serving" explainer for the mains, function mode only.
        let banner = null;
        if (mode === 'function' && sec.perGuestShare && count >= 1) {
          const chosen = visible.filter((it) => qtys[it.id]);
          const totalQty = chosen.reduce((n, it) => n + qtys[it.id], 0);
          const blended = Math.round(
            chosen.reduce((t, it) => t + priceFor({ ...it, _factor: sec.factor }, 'function') * qtys[it.id], 0) / totalQty
          );
          banner = (
            <div className="share-banner">
              <span className="sb-ico">🍚</span>
              {count === 1 ? (
                <span>
                  <b>One main serving per guest.</b> Add another variety and guests get a mix —
                  the cost stays about one portion, it won't double.
                </span>
              ) : (
                <span>
                  <b>{count} varieties → served as a mix.</b> Guests still get one main serving,
                  so it's priced as <b>~₹{blended}/plate</b>, not {count}× the price.
                </span>
              )}
            </div>
          );
        }

        return (
          <Section
            key={sec.id}
            roman={sec.roman}
            kicker={sec.kicker}
            title={sec.title}
            count={count}
            defaultOpen={i === 0}
            banner={banner}
          >
            {visible.map((it) => (
              <DishCard
                key={it.id}
                item={{ ...it, _factor: sec.factor }}
                qty={qtys[it.id] || 0}
                mode={mode}
                onInc={() => inc(it.id)}
                onDec={() => dec(it.id)}
              />
            ))}
          </Section>
        );
      })}
    </div>
  );
}
