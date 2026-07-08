// Chitti Naidu Pulavs — Wedding & Function Catering
// "Craft My Plate" — an Andhra–Telangana feast, served on a vistaraaku (leaf plate).
//
// img: real food photographs bundled locally in /public/food so dishes always
// load instantly with no runtime network dependency.
const food = (id) => `/food/${id}.jpg`;
const cutout = (id) => `/food/${id}_cut.png`; // transparent-PNG sticker

export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', glyph: '💍' },
  { id: 'reception', label: 'Reception', glyph: '🥂' },
  { id: 'engagement', label: 'Engagement', glyph: '💐' },
  { id: 'housewarming', label: 'Gruhapravesam', glyph: '🏡' },
  { id: 'birthday', label: 'Birthday', glyph: '🎂' },
];

// ------------------------------------------------------------------
// DUAL PRICING
// `price` is the SOLO price — one full restaurant portion (a biryani box
// here genuinely feeds ~2). For a function, each guest eats a smaller share
// of every dish within a big spread, so the per-guest price is the solo
// price scaled by the section's `factor`, rounded to the nearest ₹5.
// ------------------------------------------------------------------
export const bulkPrice = (price, factor) =>
  Math.max(5, Math.round((price * factor) / 5) * 5);

export const priceFor = (item, mode) =>
  mode === 'function' ? bulkPrice(item.price, item._factor) : item.price;

// The six sections. Every section is multi-pick with per-item quantities.
export const SECTIONS = [
  {
    id: 'pulav',
    roman: 'I',
    kicker: 'The centrepiece',
    title: 'Pulav & Biryani',
    factor: 0.5, // a full box feeds ~2; per guest is a mound, not a box
    hero: true,
    // A guest eats ONE main serving. Offering more varieties splits that one
    // serving (a mix), so the per-plate cost is the blended average of the
    // chosen varieties — it does NOT multiply. (Function mode only.)
    perGuestShare: true,
    items: [
      { id: 'b1', name: 'Chicken Pulav', price: 250, veg: false, note: 'Signature', serves: 2, img: food('b1') },
      { id: 'b2', name: 'Mutton Pulav', price: 350, veg: false, note: "Chef's pick", serves: 2, img: food('b2') },
      { id: 'b3', name: 'Veg Pulav', price: 180, veg: true, serves: 2, img: food('b3') },
      { id: 'b4', name: 'Bagara Rice', price: 150, veg: true, serves: 2, img: food('b4') },
    ],
  },
  {
    id: 'starters',
    roman: 'II',
    kicker: 'To begin',
    title: 'Starters & Fries',
    factor: 0.6,
    items: [
      { id: 's1', name: 'Chicken Fry', price: 150, veg: false, img: food('s1') },
      { id: 's2', name: 'Mutton Fry', price: 250, veg: false, img: food('s2') },
      { id: 's3', name: 'Prawns Roast', price: 280, veg: false, img: food('s3') },
      { id: 's4', name: 'Paneer Tikka', price: 180, veg: true, img: food('s4') },
      { id: 's5', name: 'Gobi 65', price: 120, veg: true, img: food('s5') },
    ],
  },
  {
    id: 'curries',
    roman: 'III',
    kicker: 'The heart',
    title: 'Curries & Gravies',
    factor: 0.6,
    items: [
      { id: 'c1', name: 'Kodi Kura', price: 160, veg: false, img: food('c1') },
      { id: 'c2', name: 'Gongura Mutton', price: 240, veg: false, img: food('c2') },
      { id: 'c3', name: 'Dal Tadka', price: 90, veg: true, img: food('c3') },
      { id: 'c4', name: 'Aloo Kurma', price: 100, veg: true, img: food('c4') },
      { id: 'c5', name: 'Boiled Egg', price: 20, veg: false, img: food('c5') },
    ],
  },
  {
    id: 'pickles',
    roman: 'IV',
    kicker: 'Tradition',
    title: 'Pickles & Podis',
    factor: 0.85,
    items: [
      { id: 'p1', name: 'Avakaya', price: 30, veg: true, img: food('p1') },
      { id: 'p2', name: 'Gongura Pickle', price: 30, veg: true, img: food('p2') },
      { id: 'p3', name: 'Karam Podi', price: 25, veg: true, img: food('p3') },
      { id: 'p4', name: 'Perugu (Curd)', price: 25, veg: true, img: food('p4') },
    ],
  },
  {
    id: 'sweets',
    roman: 'V',
    kicker: 'To finish',
    title: 'Sweets',
    factor: 0.7,
    items: [
      { id: 'w1', name: 'Bobbatlu', price: 60, veg: true, img: food('w1') },
      { id: 'w2', name: 'Double Ka Meetha', price: 70, veg: true, img: food('w2') },
      { id: 'w3', name: 'Qubani', price: 80, veg: true, img: food('w3') },
      { id: 'w4', name: 'Sweet Pan', price: 30, veg: true, img: food('w4') },
    ],
  },
  {
    id: 'drinks',
    roman: 'VI',
    kicker: 'To wash it down',
    title: 'Drinks & Extras',
    factor: 0.9,
    items: [
      { id: 'd1', name: 'Badam Milk', price: 60, veg: true, emoji: '🥛', img: food('d1'), cut: cutout('d1') },
      { id: 'd2', name: 'Thums Up', price: 40, veg: true, emoji: '🥤', img: food('d2'), cut: cutout('d2') },
      { id: 'd3', name: 'Water Bottle', price: 20, veg: true, emoji: '💧', img: food('d3'), cut: cutout('d3') },
      { id: 'd4', name: 'Lassi', price: 50, veg: true, emoji: '🥛', img: food('d4'), cut: cutout('d4') },
      { id: 'd5', name: 'Ice Cream', price: 50, veg: true, emoji: '🍨', img: food('d5'), cut: cutout('d5') },
      { id: 'd6', name: 'Fruit Bowl', price: 70, veg: true, emoji: '🍓', img: food('d6'), cut: cutout('d6') },
    ],
  },
];

// Flat lookup: every item, tagged with its section id, roman, and portion factor.
export const ITEMS_BY_ID = {};
SECTIONS.forEach((sec) => {
  sec.items.forEach((it) => {
    ITEMS_BY_ID[it.id] = { ...it, _section: sec.id, _roman: sec.roman, _factor: sec.factor };
  });
});
