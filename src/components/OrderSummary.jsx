import React from 'react';
import { MessageCircle } from 'lucide-react';

const RESTAURANT_PHONE = '919398449524'; // catering / chat-agent WhatsApp number

export default function OrderSummary({ mode, lines, breakdown = [], perPlate, grandTotal, guests, itemCount, eventLabel, eventDate }) {
  const isFunction = mode === 'function';
  const hasOrder = lines.length > 0;

  const sendToWhatsApp = () => {
    const msg = [];
    if (isFunction) {
      msg.push('*Chitti Naidu Pulavs — Function Catering*', '');
      msg.push(`Occasion: ${eventLabel}`);
      if (eventDate)
        msg.push(`Date: ${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`);
      msg.push(`Guests: ${guests}`, '', '*Per-plate menu (function rates)*');
      // Group by course so shared-serving mains read correctly.
      breakdown.forEach((b) => {
        const mix = b.shared && b.varieties > 1 ? ' — served as a mix' : '';
        msg.push(`${b.roman}. ${b.title} — ₹${b.perPlate}/plate${mix}`);
        lines.filter((l) => l._section === b.id).forEach((l) => msg.push(`   • ${l.qty > 1 ? `${l.qty}× ` : ''}${l.name}`));
      });
      msg.push('', `Per plate: ₹${perPlate}`);
      msg.push(`Estimated total (₹${perPlate} × ${guests}): *₹${grandTotal.toLocaleString('en-IN')}*`, '');
      msg.push('Please confirm availability. 🙏');
    } else {
      msg.push('*Chitti Naidu Pulavs — Home Order*', '', '*My order*');
      lines.forEach((l) => msg.push(`• ${l.qty}× ${l.name} — ₹${l.unit} = ₹${l.unit * l.qty}`));
      msg.push('', `Items: ${itemCount}`);
      msg.push(`Total: *₹${grandTotal.toLocaleString('en-IN')}*`, '');
      msg.push('Please confirm my order. 🙏');
    }
    window.open(`https://wa.me/${RESTAURANT_PHONE}?text=${encodeURIComponent(msg.join('\n'))}`, '_blank');
  };

  return (
    <div className={`orderbar rise d4 ${hasOrder ? '' : 'is-empty'}`}>
      <div className="ob-info">
        <span className="ob-cap">{isFunction ? 'Estimated total' : 'Order total'}</span>
        <span className="ob-total">₹{grandTotal.toLocaleString('en-IN')}</span>
        <span className="ob-sub">
          {isFunction
            ? `₹${perPlate.toLocaleString('en-IN')}/plate · ${guests} guests`
            : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} selected`}
        </span>
      </div>
      <button className="cta" onClick={sendToWhatsApp} disabled={!hasOrder}>
        <MessageCircle size={20} strokeWidth={2.4} />
        <span className="cta-label">Order on WhatsApp</span>
        <span className="cta-short">WhatsApp</span>
      </button>
    </div>
  );
}
