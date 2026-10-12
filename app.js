/* FITAI — interactive front-end prototype. All profile and food-log data stays in this browser. */
const root = document.getElementById('app');
const STORE_KEY = 'fitai-local-prototype-v1';

const ICONS = {
  apple: '<path d="M12 7.5c-1.2-2.4.2-4.6 2.8-5.5-.1 2.4-1.2 4.3-2.8 5.5Z"/><path d="M12 8c-1.2-1.8-4.9-2.3-6.7-.4-2.1 2.2-.8 7.5 1.4 10.1 1.1 1.3 2.1 2 3.3 1.5.8-.3 1.5-.3 2.3 0 1.2.5 2.2-.2 3.3-1.5 2.2-2.6 3.5-7.9 1.4-10.1C15.2 5.7 13.2 6.2 12 8Z"/>',
  arrowLeft: '<path d="m15 18-6-6 6-6"/><path d="M9 12h12"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/>',
  flame: '<path d="M12.8 2.5c.5 3-1.2 4.7-2.6 6.2-1.5 1.6-2.7 3-2.7 5.5a4.5 4.5 0 0 0 9 0c0-2.3-1-4.4-2.3-6.3.1 2-1 2.8-1.8 3.2.2-3.4-.2-6.2-2-8.6Z"/><path d="M12.1 15.2c-1.1.9-1.6 1.7-1.6 2.7a1.7 1.7 0 0 0 3.4 0c0-1-.6-2-1.8-2.7Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  scale: '<path d="M4 6h16l1 14H3L4 6Z"/><path d="M9 10a3 3 0 0 1 6 0"/><path d="m12 10 2-2"/>',
  ruler: '<path d="M4 20 20 4"/><path d="m7 17 2 2M10 14l2 2M13 11l2 2M16 8l2 2"/><path d="M5 4h15v15"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  person: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
  activity: '<path d="m3 12 4-1 3 5 4-10 3 6 4-1"/><path d="M4 20h16"/>',
  dumbbell: '<path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M3 12l9 9M12 3l9 9"/><path d="m2 10 8-8M14 22l8-8"/>',
  fork: '<path d="M6 2v6M10 2v6M6 5h4M8 8v14M17 2v7a3 3 0 0 0 3 3V2M20 12v10"/>',
  leaf: '<path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c3-6 7-9 13-12"/>',
  heart: '<path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.4Z"/>',
  sparkles: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 2l.7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 21h22"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  wheat: '<path d="M12 22V8M12 12c-4 0-6-2-6-5 4 0 6 2 6 5ZM12 16c4 0 6-2 6-5-4 0-6 2-6 5ZM12 8c-3 0-4.5-1.5-4.5-4.5C10.5 3.5 12 5 12 8ZM12 9c3 0 4.5-1.5 4.5-4.5C13.5 4.5 12 6 12 9Z"/>',
  drumstick: '<path d="M15.5 8.5 8 16a3.5 3.5 0 1 0 2 2l7.5-7.5a5 5 0 0 0 5-5 5 5 0 0 0-7 3Z"/><path d="m5 19-2 2M4 16l-2-1M8 20l1 2"/>',
  oil: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  cup: '<path d="M5 8h14l-1 12H6L5 8ZM4 5h16v3H4zM9 3h6"/><path d="M8 12h8"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  bolt: '<path d="m13 2-3 9h7L9 22l3-9H5l8-11Z"/>',
  medal: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13-1 8 4.8-2.5 4.8 2.5-1-8"/>',
  coffee: '<path d="M4 8h14v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8ZM18 10h2a2 2 0 1 1 0 4h-2M7 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4"/>',
  appleHeart: '<path d="M12 7c-1.3-2-4.7-2.3-6.5-.4-2.2 2.2-.7 7.5 1.3 10.2 1.1 1.5 2.2 2 3.3 1.6.6-.2 1.1-.4 1.9 0 1.2.5 2.2-.1 3.3-1.6 1.9-2.5 3.3-7.6 1.4-10.1C15.2 4.8 13.3 5 12 7Z"/><path d="M12 6c.1-2 1.2-3 3-3"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
  plate: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="M3 4v6M1.5 4v3a1.5 1.5 0 0 0 3 0V4M3 10v11M21 4v17M21 4c-2 2-3 4-3 6h3"/>',
  water: '<path d="M12 2s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  arrowDown: '<path d="M12 4v16M19 13l-7 7-7-7"/>',
  arrowUp: '<path d="M12 20V4M5 11l7-7 7 7"/>',
  minus: '<path d="M5 12h14"/>',
  walk: '<circle cx="13" cy="4" r="1.5"/><path d="m11 7-2 4 3 2-1 7M11 7l4 3 3 1M9 11l-4 1M12 13l5 4M9 20l-3 2M17 17l2 4"/>',
  sprout: '<path d="M12 22v-9M12 13c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 10c0-5 3-8 8-8 0 5-3 8-8 8Z"/>',
  fish: '<path d="M3 12c3-4 7-6 12-5l5-3v16l-5-3c-5 1-9-1-12-5Z"/><circle cx="14" cy="11" r=".7" fill="currentColor"/><path d="M3 12H1M7 9l2 3-2 3"/>',
  olive: '<path d="M12 21c-4 0-7-3-7-7s3-8 7-11c4 3 7 7 7 11s-3 7-7 7Z"/><path d="M12 19c1-5 3-8 6-11"/>',
  male: '<circle cx="10" cy="14" r="6"/><path d="m15 9 6-6M15 3h6v6"/>',
  female: '<circle cx="12" cy="9" r="6"/><path d="M12 15v7M9 19h6"/>',
  moon: '<path d="M20.8 14A8.8 8.8 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z"/>',
};

function icon(name, size = 22) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkles}</svg>`;
}
function brand() { return `<span class="brand"><span class="brand-mark">${icon('apple', 21)}</span><span>FITAI</span></span>`; }
function esc(value = '') { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function todayISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function dateFromISO(s) { return new Date(`${s}T12:00:00`); }
function dateKey(d) { const copy = new Date(d); copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset()); return copy.toISOString().slice(0, 10); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function round1(value) { return Math.round(Number(value) * 10) / 10; }
function fmtNumber(n) { return new Intl.NumberFormat('en-US').format(Math.round(Number(n) || 0)); }
function fmtWeight(kg, unit = 'kg', precision = 1) { const value = unit === 'lb' ? Number(kg) * 2.20462262 : Number(kg); return `${value.toFixed(precision)} ${unit}`; }
function fmtShortWeight(kg) { return `${Number(kg).toFixed(1)} kg`; }
function initials(name = 'FITAI') { return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase(); }
function localDateLabel(iso, options = { weekday: 'long', month: 'long', day: 'numeric' }) { return dateFromISO(iso).toLocaleDateString('en-US', options); }
function loadApp() {
  const base = {
    view: 'auth', authMode: 'login', authError: '', profile: null, answers: {}, plan: null,
    flowIndex: 0, units: { weight: 'kg', height: 'cm' }, logs: {}, water: {}, selectedDate: todayISO(),
    tab: 'home', modal: null, aiText: '', aiEstimate: null, modalMealType: 'Breakfast', toast: '',
    weightLogs: [], joinedChallenge: false, challengeChecked: false,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) {
      Object.assign(base, saved);
      base.view = 'auth';
      base.authMode = 'login';
      base.authError = '';
      base.modal = null;
      base.toast = '';
      base.aiEstimate = null;
      base.aiText = '';
      base.units = Object.assign({ weight: 'kg', height: 'cm' }, saved.units || {});
    }
  } catch (error) { console.warn('FITAI local profile could not be loaded.', error); }
  return base;
}
const app = loadApp();
function persist() {
  try {
    const { profile, answers, plan, flowIndex, units, logs, water, selectedDate, tab, weightLogs, joinedChallenge, challengeChecked } = app;
    localStorage.setItem(STORE_KEY, JSON.stringify({ profile, answers, plan, flowIndex, units, logs, water, selectedDate, tab, weightLogs, joinedChallenge, challengeChecked }));
  } catch (error) { console.warn('FITAI could not save this update locally.', error); }
}

/* Onboarding sequence: goal first, then the details needed to estimate nutrition, then routine and food context. */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const singleOptions = {
  goal: [
    { value: 'lose', title: 'Lose weight', desc: 'Build a steady, sustainable calorie deficit.', icon: 'arrowDown' },
    { value: 'maintain', title: 'Maintain my weight', desc: 'Support a balanced routine and feel your best.', icon: 'minus' },
    { value: 'gain', title: 'Gain weight', desc: 'Fuel gradual, intentional weight gain.', icon: 'arrowUp' },
  ],
  sex: [
    { value: 'male', title: 'Male', desc: '', icon: 'male' },
    { value: 'female', title: 'Female', desc: '', icon: 'female' },
    { value: 'other', title: 'Another / prefer not to say', desc: 'We’ll use a neutral estimate.', icon: 'person' },
  ],
  activity: [
    { value: 'sedentary', title: 'Mostly sitting', desc: 'Desk work, driving, or little daily walking.', icon: 'person' },
    { value: 'light', title: 'Lightly active', desc: 'Regular walking or time on your feet.', icon: 'walk' },
    { value: 'moderate', title: 'Moderately active', desc: 'A mix of movement and sitting most days.', icon: 'activity' },
    { value: 'very', title: 'Very active', desc: 'Physical work or lots of movement most days.', icon: 'bolt' },
  ],
  workouts: [
    { value: '0-2', title: '0–2 workouts', desc: 'A few days a week or less.', icon: 'clock' },
    { value: '3-5', title: '3–5 workouts', desc: 'A few workouts most weeks.', icon: 'dumbbell' },
    { value: '6+', title: '6+ workouts', desc: 'Training is part of most days.', icon: 'activity' },
  ],
  diet: [
    { value: 'balanced', title: 'Balanced', desc: 'A flexible mix of foods.', icon: 'plate' },
    { value: 'vegetarian', title: 'Vegetarian', desc: 'No meat or fish.', icon: 'leaf' },
    { value: 'vegan', title: 'Vegan', desc: 'Plant-based foods only.', icon: 'sprout' },
    { value: 'pescatarian', title: 'Pescatarian', desc: 'Fish, dairy, and plant foods.', icon: 'fish' },
    { value: 'mediterranean', title: 'Mediterranean', desc: 'Plants, whole grains, and healthy fats.', icon: 'olive' },
    { value: 'high-protein', title: 'Higher protein', desc: 'Protein-forward, still flexible.', icon: 'drumstick' },
  ],
  mealsPerDay: [
    { value: '2', title: '2 meals', desc: 'A simple, lighter meal rhythm.', icon: 'plate' },
    { value: '3', title: '3 meals', desc: 'Breakfast, lunch, and dinner.', icon: 'fork' },
    { value: '4', title: '4 meals', desc: 'Three meals and a snack.', icon: 'clock' },
    { value: '5', title: '5+ meals', desc: 'Smaller meals across the day.', icon: 'sparkles' },
  ],
  motivation: [
    { value: 'energy', title: 'Feel more energized', desc: '', icon: 'bolt' },
    { value: 'confidence', title: 'Feel more confident', desc: '', icon: 'heart' },
    { value: 'strength', title: 'Build strength and fitness', desc: '', icon: 'dumbbell' },
    { value: 'consistency', title: 'Feel consistent and in control', desc: '', icon: 'target' },
  ],
  reminders: [
    { value: 'none', title: 'No reminders for now', desc: 'You can change this any time.', icon: 'bell' },
    { value: 'meal', title: 'Gentle meal-time nudges', desc: 'A little help remembering to log.', icon: 'clock' },
    { value: 'evening', title: 'An evening check-in', desc: 'A quick look at how the day went.', icon: 'moon' },
  ],
  rollover: [
    { value: 'no', title: 'No, keep days separate', desc: 'A fresh daily target each day.', icon: 'calendar' },
    { value: 'yes', title: 'Yes, up to 200 calories', desc: 'Add a little flexibility to tomorrow’s tracker.', icon: 'refresh' },
  ],
};
const multiOptions = {
  allergies: [
    { value: 'none', label: 'None' }, { value: 'dairy', label: 'Dairy' }, { value: 'gluten', label: 'Gluten' },
    { value: 'peanuts', label: 'Peanuts' }, { value: 'tree-nuts', label: 'Tree nuts' }, { value: 'soy', label: 'Soy' },
    { value: 'eggs', label: 'Eggs' }, { value: 'shellfish', label: 'Shellfish' },
  ],
  health: [
    { value: 'none', label: 'No specific considerations' }, { value: 'health-condition', label: 'Managing a health condition' },
    { value: 'pregnancy', label: 'Pregnant or breastfeeding' }, { value: 'history', label: 'A history of disordered eating' },
    { value: 'prefer-not', label: 'Prefer not to say' },
  ],
  foodPrefs: [
    { value: 'quick', label: 'Quick to prepare' }, { value: 'home-cooked', label: 'Mostly home-cooked' },
    { value: 'indian', label: 'Indian-inspired' }, { value: 'plant-forward', label: 'Plant-forward' },
    { value: 'high-protein', label: 'High-protein ideas' }, { value: 'meal-prep', label: 'Meal-prep friendly' },
    { value: 'family', label: 'Family-friendly meals' }, { value: 'simple', label: 'Simple ingredients' },
  ],
  barriers: [
    { value: 'busy', label: 'Busy schedule', icon: 'calendar' }, { value: 'consistency', label: 'Staying consistent', icon: 'chart' },
    { value: 'inspiration', label: 'Meal inspiration', icon: 'sparkles' }, { value: 'portions', label: 'Portion sizes', icon: 'plate' },
    { value: 'eating-out', label: 'Eating out often', icon: 'fork' }, { value: 'snacking', label: 'Stress or snacking', icon: 'heart' },
    { value: 'forgetting', label: 'Remembering to log', icon: 'clock' },
  ],
};

const FLOW = [
  { id: 'goal', type: 'single', key: 'goal', title: 'What would you like to accomplish?', subtitle: 'Your goal helps FITAI shape a starting plan that feels relevant to you.', options: singleOptions.goal },
  { id: 'goal-insight', type: 'insight', title: 'A clear goal. A plan that fits.', subtitle: 'We’ll use your answers to build a starting point—not a one-size-fits-all rule.' },
  { id: 'dob', type: 'dob', key: 'birthDate', title: 'When were you born?', subtitle: 'Your age helps estimate daily energy needs. FITAI’s calorie estimates are designed for adults 18+.' },
  { id: 'sex', type: 'single', key: 'sex', title: 'What sex should we use for your calorie estimate?', subtitle: 'This is one input in a standard energy equation. You can choose a neutral estimate instead.', options: singleOptions.sex },
  { id: 'height', type: 'height', key: 'heightCm', title: 'How tall are you?', subtitle: 'A quick measurement helps us personalize your baseline.' },
  { id: 'weight', type: 'weight', key: 'weightKg', title: 'What is your current weight?', subtitle: 'This is used to estimate your starting nutrition targets.' },
  { id: 'activity', type: 'single', key: 'activity', title: 'How active are you on a typical day?', subtitle: 'Think about your usual movement outside of planned workouts.', options: singleOptions.activity },
  { id: 'workouts', type: 'single', key: 'workouts', title: 'How many workouts do you do per week?', subtitle: 'This helps FITAI tailor activity tips around your routine.', options: singleOptions.workouts },
  { id: 'goal-weight', type: 'goal-weight', key: 'goalWeightKg', title: 'What weight would you like to reach?', subtitle: 'Choose a direction that feels meaningful. Your target can be edited later.', when: a => a.goal === 'lose' || a.goal === 'gain' },
  { id: 'pace', type: 'pace', key: 'paceKgPerWeek', title: 'What pace feels realistic?', subtitle: 'A gradual pace is easier to review and adjust as you go.', when: a => a.goal === 'lose' || a.goal === 'gain' },
  { id: 'diet', type: 'single', key: 'diet', title: 'Do you follow a specific eating style?', subtitle: 'We’ll use this to keep food ideas closer to what you enjoy.', options: singleOptions.diet, grid: true },
  { id: 'allergies', type: 'multi', key: 'allergies', title: 'Any food allergies or intolerances?', subtitle: 'Choose all that apply. Always verify product labels, especially for severe allergies.', options: multiOptions.allergies, noneValue: 'none' },
  { id: 'health', type: 'multi', key: 'health', title: 'Anything we should keep in mind?', subtitle: 'Optional context only. FITAI is a general wellness tool, not a medical dietitian.', options: multiOptions.health, noneValue: 'none', optional: true },
  { id: 'meals', type: 'single', key: 'mealsPerDay', title: 'How many meals work for your day?', subtitle: 'There’s no ideal number—choose what fits your normal rhythm.', options: singleOptions.mealsPerDay, grid: true },
  { id: 'food-prefs', type: 'multi', key: 'foodPrefs', title: 'What kind of food ideas would help?', subtitle: 'Pick any preferences that make eating well feel more practical.', options: multiOptions.foodPrefs },
  { id: 'barriers', type: 'multi', key: 'barriers', title: 'What tends to get in the way?', subtitle: 'This helps FITAI make its tips useful for your real routine.', options: multiOptions.barriers, grid: true },
  { id: 'support-insight', type: 'insight', title: 'Built for your real life', subtitle: 'Your plan can adapt to your habits, food preferences, and the things that make tracking harder.' },
  { id: 'reminders', type: 'single', key: 'reminders', title: 'Would a gentle reminder help?', subtitle: 'Choose a style—or skip reminders entirely. You can change it any time.', options: singleOptions.reminders },
  { id: 'rollover', type: 'single', key: 'rollover', title: 'Carry a few unused calories into tomorrow?', subtitle: 'This optional tracker setting can roll over up to 200 calories from a logged day. It never changes your base nutrition plan.', options: singleOptions.rollover },
];

function currentAge() {
  const date = app.answers.birthDate;
  if (!date) return null;
  const d = dateFromISO(date); const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDelta = now.getMonth() - d.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
function currentFlow() { return FLOW.filter(step => !step.when || step.when(app.answers)); }
function activeStep() { const flow = currentFlow(); app.flowIndex = clamp(app.flowIndex, 0, Math.max(0, flow.length - 1)); return flow[app.flowIndex] || flow[0]; }
function optionButton(option, selected, key, multi = false) {
  return `<button type="button" class="option-card${selected ? ' selected' : ''}" data-action="${multi ? 'toggle-answer' : 'set-answer'}" data-key="${esc(key)}" data-value="${esc(option.value)}" aria-pressed="${selected ? 'true' : 'false'}">
    <span class="option-icon">${icon(option.icon || 'sparkles')}</span><span class="option-copy"><span class="option-title">${esc(option.title || option.label)}</span>${option.desc ? `<span class="option-desc">${esc(option.desc)}</span>` : ''}</span><span class="option-check">${icon('check', 13)}</span>
  </button>`;
}
function renderFlowHeader(step, index, total) {
  const percent = Math.round(((index + 1) / total) * 100);
  return `<header class="flow-header"><button class="back-button" type="button" data-action="back" aria-label="Go back">${icon('arrowLeft')}</button>
    <div class="flow-progress-block"><div class="flow-progress-meta"><span>YOUR PLAN</span><span>${index + 1} OF ${total}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div>
    <div class="flow-header-brand">${brand()}</div></header>`;
}
function renderDob() {
  const parts = app.answers.birthParts || { month: '', day: '', year: '' };
  const monthOptions = `<option value="">Month</option>${MONTHS.map((m, i) => `<option value="${i + 1}" ${String(parts.month) === String(i + 1) ? 'selected' : ''}>${m}</option>`).join('')}`;
  const dayOptions = `<option value="">Day</option>${Array.from({ length: 31 }, (_, i) => i + 1).map(d => `<option value="${d}" ${String(parts.day) === String(d) ? 'selected' : ''}>${String(d).padStart(2, '0')}</option>`).join('')}`;
  let years = '<option value="">Year</option>';
  for (let year = new Date().getFullYear() - 18; year >= 1935; year--) years += `<option value="${year}" ${String(parts.year) === String(year) ? 'selected' : ''}>${year}</option>`;
  const age = currentAge();
  const complete = !!(parts.month && parts.day && parts.year);
  const ageMessage = age !== null ? `${age} years old · your full birth date stays on this device.` : complete ? 'FITAI’s calorie estimates are designed for adults 18+. Please choose an adult birth date.' : 'Select your birth date to continue.';
  return `<div class="date-picker"><label class="sr-only" for="dob-month">Month</label><select id="dob-month" aria-label="Month" data-dob-part="month">${monthOptions}</select><label class="sr-only" for="dob-day">Day</label><select id="dob-day" aria-label="Day" data-dob-part="day">${dayOptions}</select><label class="sr-only" for="dob-year">Year</label><select id="dob-year" aria-label="Year" data-dob-part="year">${years}</select></div>
    <div class="age-preview">${icon('info')}<span>${ageMessage}</span></div>`;
}
function displayHeight(cm) {
  if (app.units.height === 'cm') return `${Math.round(cm)} <small>cm</small>`;
  const totalInches = Math.round(Number(cm) / 2.54);
  return `${Math.floor(totalInches / 12)}′ ${totalInches % 12}″ <small>ft / in</small>`;
}
function displayWeight(kg) {
  const value = app.units.weight === 'lb' ? Number(kg) * 2.20462262 : Number(kg);
  return `${value.toFixed(1)} <small>${app.units.weight}</small>`;
}
function renderHeightPanel() {
  const value = Number(app.answers.heightCm || 170);
  const pct = ((value - 120) / 100) * 100;
  return `<div class="metric-panel"><div class="metric-top"><div><p class="metric-label">Height</p><div class="metric-value" data-output="heightCm">${displayHeight(value)}</div></div>
      <div class="unit-switch"><button type="button" data-action="set-unit" data-unit-group="height" data-unit="cm" class="${app.units.height === 'cm' ? 'active' : ''}">cm</button><button type="button" data-action="set-unit" data-unit-group="height" data-unit="ft" class="${app.units.height === 'ft' ? 'active' : ''}">ft / in</button></div></div>
      <div class="range-ruler"><input class="range-input" type="range" min="120" max="220" step="1" value="${value}" style="--range:${pct}%" data-range-answer="heightCm" aria-label="Height in centimeters" /></div><div class="range-endpoints"><span>${displayHeight(120).replace('<small>cm</small>', app.units.height === 'cm' ? 'cm' : '')}</span><span>${displayHeight(220).replace('<small>cm</small>', app.units.height === 'cm' ? 'cm' : '')}</span></div><p class="metric-note">Slide to adjust. Your height is used only to estimate nutrition needs.</p></div>`;
}
function renderWeightPanel(key, isGoal = false) {
  const current = Number(app.answers.weightKg || 68);
  const savedGoal = Number(app.answers.goalWeightKg);
  const targetWrongDirection = app.answers.goal === 'lose' ? savedGoal >= current : savedGoal <= current;
  if (isGoal && (!Number.isFinite(savedGoal) || targetWrongDirection)) app.answers.goalWeightKg = round1(current + (app.answers.goal === 'lose' ? -5 : 5));
  const valueKg = isGoal ? Number(app.answers.goalWeightKg || current) : current;
  let minKg = 35, maxKg = 180;
  if (isGoal && app.answers.goal === 'lose') { minKg = Math.max(30, current - 35); maxKg = current; }
  if (isGoal && app.answers.goal === 'gain') { minKg = current; maxKg = Math.min(220, current + 35); }
  if (maxKg <= minKg) maxKg = minKg + 1;
  const unit = app.units.weight;
  const min = unit === 'lb' ? minKg * 2.20462262 : minKg;
  const max = unit === 'lb' ? maxKg * 2.20462262 : maxKg;
  const displayed = unit === 'lb' ? valueKg * 2.20462262 : valueKg;
  const pct = ((displayed - min) / (max - min)) * 100;
  const title = isGoal ? 'Goal weight' : 'Current weight';
  const note = isGoal ? 'A healthy plan should support steady progress. You can edit your goal at any time.' : 'Your current weight is a starting estimate, not a judgment. You can update it later.';
  return `<div class="metric-panel"><div class="metric-top"><div><p class="metric-label">${title}</p><div class="metric-value" data-output="${key}">${displayWeight(valueKg)}</div></div>
      <div class="unit-switch"><button type="button" data-action="set-unit" data-unit-group="weight" data-unit="kg" class="${unit === 'kg' ? 'active' : ''}">kg</button><button type="button" data-action="set-unit" data-unit-group="weight" data-unit="lb" class="${unit === 'lb' ? 'active' : ''}">lb</button></div></div>
      <div class="range-ruler"><input class="range-input" type="range" min="${min.toFixed(1)}" max="${max.toFixed(1)}" step="0.1" value="${displayed.toFixed(1)}" style="--range:${pct}%" data-range-answer="${key}" data-weight-unit="${unit}" aria-label="${title}" /></div><div class="range-endpoints"><span>${unit === 'lb' ? `${Math.round(min)} lb` : `${Math.round(min)} kg`}</span><span>${unit === 'lb' ? `${Math.round(max)} lb` : `${Math.round(max)} kg`}</span></div><p class="metric-note">${note}</p></div>`;
}
function paceOptions() {
  if (app.answers.goal === 'gain') return [
    { value: '0.15', title: 'Gentle', desc: 'About 0.15 kg per week', icon: 'walk' },
    { value: '0.25', title: 'Steady', desc: 'About 0.25 kg per week', icon: 'activity', recommended: true },
    { value: '0.35', title: 'Faster', desc: 'About 0.35 kg per week', icon: 'bolt' },
  ];
  return [
    { value: '0.25', title: 'Gentle', desc: 'About 0.25 kg per week', icon: 'walk' },
    { value: '0.4', title: 'Steady', desc: 'About 0.4 kg per week', icon: 'activity', recommended: true },
    { value: '0.5', title: 'Faster', desc: 'About 0.5 kg per week', icon: 'bolt' },
  ];
}
function renderPace() {
  const options = paceOptions();
  const selected = String(app.answers.paceKgPerWeek || '');
  return `<div class="option-list">${options.map(o => `<button type="button" class="option-card${selected === o.value ? ' selected' : ''}" data-action="set-answer" data-key="paceKgPerWeek" data-value="${o.value}" aria-pressed="${selected === o.value}">
    <span class="option-icon">${icon(o.icon)}</span><span class="option-copy"><span class="option-title">${o.title}${o.recommended ? ' <span class="eyebrow" style="display:inline;color:#d19470;letter-spacing:.06em;margin-left:5px">RECOMMENDED</span>' : ''}</span><span class="option-desc">${o.desc}</span></span><span class="option-check">${icon('check',13)}</span></button>`).join('')}</div><p class="choice-helper">The estimated pace is a guide—not a promise or a substitute for professional advice.</p>`;
}
function renderMulti(step) {
  const selected = Array.isArray(app.answers[step.key]) ? app.answers[step.key] : [];
  const options = step.options || [];
  return `<div class="multi-label">${icon('checkCircle')}Choose any that apply</div><div class="chip-grid">${options.map(o => {
    const active = selected.includes(o.value);
    return `<button type="button" class="select-chip${active ? ' selected' : ''}" data-action="toggle-answer" data-key="${esc(step.key)}" data-value="${esc(o.value)}" aria-pressed="${active}">${o.icon ? icon(o.icon, 16) : ''}${esc(o.label || o.title)}</button>`;
  }).join('')}</div>${step.id === 'allergies' ? '<p class="metric-note">Food tracking cannot guarantee allergen safety. Check packaging and restaurant information every time.</p>' : ''}`;
}
function insightDetails(step) {
  const goal = app.answers.goal;
  if (step.id === 'goal-insight') {
    const text = goal === 'lose' ? 'We’ll estimate a moderate calorie target and focus on habits you can repeat—not crash-diet rules.' : goal === 'gain' ? 'We’ll estimate a modest energy surplus and make room for meals and snacks that suit your routine.' : 'We’ll estimate a maintenance starting point and help you build a steady, balanced routine.';
    return { kicker: 'YOUR GOAL, FIRST', title: goal === 'lose' ? 'Progress without the all-or-nothing.' : goal === 'gain' ? 'Fuel the progress you want to make.' : 'Keep your routine feeling balanced.', body: text, points: ['An estimate shaped by your personal details', 'Simple daily calorie and macro targets', 'Room to adjust as you learn what works'], icon: 'target', visual: 'A useful starting point is better than a perfect plan you can’t follow.' };
  }
  const barrier = (app.answers.barriers || [])[0];
  const barrierText = barrier === 'busy' ? 'We’ll keep quick, low-friction ideas in mind for busy days.' : barrier === 'inspiration' ? 'We’ll make food ideas easier to find when inspiration runs low.' : barrier === 'consistency' ? 'Small check-ins can make it easier to build a steady rhythm.' : barrier === 'forgetting' ? 'Quick logging can help make meal tracking less of a chore.' : 'Your food preferences and routine can guide the ideas FITAI surfaces.';
  return { kicker: 'PERSONALIZED FOR YOU', title: 'Good guidance should fit your day.', body: barrierText, points: ['Log food in a few taps or with a meal description', 'See calories, protein, carbs, and fats in one place', 'Use flexible targets—not pass or fail rules'], icon: 'sparkles', visual: `Your ${app.answers.diet ? app.answers.diet.replace('-', ' ') : 'flexible'} eating style and daily rhythm will guide your plan.` };
}
function renderInsight(step) {
  const content = insightDetails(step);
  return `<div class="insight-panel"><div class="insight-copy-card"><p class="eyebrow">${esc(content.kicker)}</p><h2>${esc(content.title)}</h2><p>${esc(content.body)}</p><div class="insight-points">${content.points.map(p => `<div class="insight-point"><span>${icon('check')}</span><span>${esc(p)}</span></div>`).join('')}</div></div>
    <div class="insight-visual-card"><div><div class="insight-orbit">${icon(content.icon, 34)}</div><div class="insight-visual-label">${esc(content.visual)}</div></div><div class="progress-mini"><svg viewBox="0 0 200 55" preserveAspectRatio="none"><path class="mini-dash" d="M0 42H200"/><path d="M2 43 C30 42, 38 37, 65 39 S102 30, 122 27 S158 10,198 8"/></svg></div></div></div>`;
}
function stepValid(step) {
  if (step.type === 'insight') return true;
  if (step.id === 'health' && step.optional) return true;
  if (step.type === 'dob') return !!app.answers.birthDate && Number(currentAge()) >= 18;
  if (step.type === 'single') return !!app.answers[step.key];
  if (step.type === 'pace') return Number(app.answers.paceKgPerWeek) > 0;
  if (step.type === 'multi') return Array.isArray(app.answers[step.key]) && app.answers[step.key].length > 0;
  return true;
}
function renderOnboarding() {
  const flow = currentFlow(); const index = clamp(app.flowIndex, 0, flow.length - 1); const step = flow[index];
  let content = '';
  if (step.type === 'single') {
    const selected = app.answers[step.key];
    content = `<div class="${step.grid ? 'option-grid' : 'option-list'}">${step.options.map(o => optionButton(o, selected === o.value, step.key)).join('')}</div>`;
  } else if (step.type === 'dob') content = renderDob();
  else if (step.type === 'height') content = renderHeightPanel();
  else if (step.type === 'weight') content = renderWeightPanel('weightKg', false);
  else if (step.type === 'goal-weight') content = renderWeightPanel('goalWeightKg', true);
  else if (step.type === 'pace') content = renderPace();
  else if (step.type === 'multi') content = renderMulti(step);
  else if (step.type === 'insight') content = renderInsight(step);
  return `<div class="flow-shell">${renderFlowHeader(step, index, flow.length)}<main class="flow-main"><p class="eyebrow">A FEW QUICK PICKS</p><h1>${esc(step.title)}</h1><p class="flow-subtitle">${esc(step.subtitle)}</p><div class="question-content">${content}</div></main>
    <footer class="flow-footer"><div class="flow-footer-inner"><button type="button" class="btn" data-action="next-step" ${stepValid(step) ? '' : 'disabled'}>${index === flow.length - 1 ? 'Build my plan' : 'Continue'}${icon('arrowRight')}</button></div></footer></div>`;
}

function getAgeFromDate(dateStr) {
  const d = dateFromISO(dateStr); const now = new Date(); let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
}
const ACTIVITY_MULTIPLIER = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
function calculateMacros(calories, bodyWeightKg) {
  const kcal = Math.max(1, Number(calories) || 0);
  const bodyWeight = Math.max(35, Number(bodyWeightKg) || 68);
  const protein = Math.round(Math.min(220, bodyWeight * 1.6, kcal * .32 / 4));
  const fat = Math.round((kcal * .28) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}
function calculatePlan(answers = app.answers) {
  const weight = Number(answers.weightKg || 68); const height = Number(answers.heightCm || 170); const age = Number(getAgeFromDate(answers.birthDate || '1998-01-01'));
  const sexAdjustment = answers.sex === 'male' ? 5 : answers.sex === 'female' ? -161 : -78;
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + sexAdjustment;
  const activity = ACTIVITY_MULTIPLIER[answers.activity] || 1.45;
  const maintenance = Math.round(bmr * activity);
  const goal = answers.goal || 'maintain';
  const weeklyPace = Number(answers.paceKgPerWeek || (goal === 'gain' ? .25 : .4));
  let calories = maintenance;
  if (goal === 'lose') calories = Math.max(1200, maintenance - Math.min(500, Math.max(250, weeklyPace * 7700 / 7)));
  if (goal === 'gain') calories = maintenance + Math.min(300, Math.max(150, weeklyPace * 7700 / 7));
  calories = Math.round(calories / 10) * 10;
  const macroWeight = goal === 'gain' ? Number(answers.goalWeightKg || weight) : weight;
  const macros = calculateMacros(calories, macroWeight);
  const fiber = Math.round(Math.max(25, calories * .014));
  const waterLitres = Math.max(1.5, Math.round(weight * .035 * 10) / 10);
  const goalWeight = goal === 'maintain' ? weight : Number(answers.goalWeightKg || (goal === 'lose' ? weight - 5 : weight + 5));
  const difference = Math.abs(goalWeight - weight);
  const weeks = goal === 'maintain' ? 0 : Math.max(1, Math.ceil(difference / Math.max(.1, weeklyPace)));
  const date = new Date(); date.setDate(date.getDate() + weeks * 7);
  const healthFlags = (answers.health || []).filter(v => v !== 'none' && v !== 'prefer-not');
  const caution = healthFlags.length ? 'Because you shared a health consideration, treat this as general information and review any calorie or macro target with a qualified clinician.' : 'These are starting estimates, not a medical prescription. Energy needs vary day to day; adjust with a qualified professional if needed.';
  const goalNames = { lose: 'Lose weight', maintain: 'Maintain weight', gain: 'Gain weight' };
  return { calories, macros, maintenance, bmr: Math.round(bmr), currentWeight: weight, goalWeight, weeklyPace, weeks, estimatedDate: dateKey(date), goal, goalLabel: goalNames[goal], fiber, waterLitres, caution, age, activityLabel: ({ sedentary: 'Mostly sitting', light: 'Lightly active', moderate: 'Moderately active', very: 'Very active' })[answers.activity] || 'Moderately active' };
}
function progressChart(plan, compact = false) {
  let startY = 112, endY = 30;
  if (plan.goal === 'lose') { startY = 36; endY = 112; }
  if (plan.goal === 'maintain') { startY = 75; endY = 72; }
  const dateLabel = plan.goal === 'maintain' ? 'Your routine' : new Date(`${plan.estimatedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const line = `M18 ${startY} C92 ${startY}, 118 ${startY + (endY - startY) * .1}, 165 ${startY + (endY - startY) * .44} S248 ${endY - 8}, 297 ${endY - 9} S365 ${endY}, 452 ${endY}`;
  const area = `${line} L452 132 L18 132 Z`;
  const id = compact ? 'weightFill' : 'planFill';
  const label = `${plan.goalWeight.toFixed(1)} kg`;
  return `<svg viewBox="0 0 480 150" role="img" aria-label="Illustrative ${esc(plan.goalLabel.toLowerCase())} progress chart"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d8c9df" stop-opacity=".52"/><stop offset="1" stop-color="#f5f2f7" stop-opacity=".08"/></linearGradient></defs>
    <path class="chart-grid-line" d="M16 40H458M16 83H458M16 130H458"/><path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/><circle class="chart-node" cx="18" cy="${startY}" r="6"/><circle class="chart-node" cx="452" cy="${endY}" r="6"/><text class="chart-label" x="16" y="147">Now</text><text class="chart-label" x="408" y="147">${esc(dateLabel)}</text><rect x="349" y="${Math.max(8, endY - 28)}" width="96" height="24" rx="9" fill="#fff" stroke="#e8e5eb"/><text class="chart-label" x="361" y="${Math.max(24, endY - 12)}">${esc(label)}</text></svg>`;
}
function renderPlan() {
  if (!app.plan) app.plan = calculatePlan();
  const p = app.plan; const name = app.profile?.name?.split(' ')[0] || 'there';
  const goalLine = p.goal === 'maintain' ? 'Stay steady with flexible daily nutrition targets.' : `${p.goal === 'gain' ? 'Gain' : 'Lose'} ${Math.abs(p.goalWeight - p.currentWeight).toFixed(1)} kg by ${new Date(`${p.estimatedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  const eta = p.goal === 'maintain' ? 'Flexible timeline' : `Estimated in about ${p.weeks} ${p.weeks === 1 ? 'week' : 'weeks'}`;
  const total = currentFlow().length;
  return `<div class="flow-shell"><header class="flow-header"><button class="back-button" type="button" data-action="back" aria-label="Go back">${icon('arrowLeft')}</button><div class="flow-progress-block"><div class="flow-progress-meta"><span>YOUR PLAN</span><span>READY</span></div><div class="progress-track"><div class="progress-fill" style="width:100%"></div></div></div><div class="flow-header-brand">${brand()}</div></header>
    <main class="plan-page"><div class="plan-heading"><p class="eyebrow">YOUR PERSONAL STARTING POINT</p><h1>${esc(name)}, your plan is ready.</h1><p>Built from your goal, everyday activity, and food preferences. You can adjust it as you learn what works.</p></div>
      <div class="plan-grid"><section class="plan-card"><h2 class="plan-card-title">Your daily recommendation <span class="eyebrow">EDITABLE</span></h2><div class="plan-summary"><div class="plan-summary-calories"><strong>${fmtNumber(p.calories)}</strong><span>estimated calories / day</span></div><div class="calorie-symbol">${icon('flame', 27)}</div></div>
        <div class="plan-macro-grid"><div class="plan-macro"><strong>${p.macros.protein}g</strong><span>Protein</span><div class="plan-macro-bar"><span style="width:76%"></span></div></div><div class="plan-macro"><strong>${p.macros.carbs}g</strong><span>Carbs</span><div class="plan-macro-bar"><span style="width:64%"></span></div></div><div class="plan-macro"><strong>${p.macros.fat}g</strong><span>Fats</span><div class="plan-macro-bar"><span style="width:52%"></span></div></div></div>
        <div class="plan-chart-wrap"><div class="plan-chart-head"><strong>Illustrative progress</strong><span>${esc(eta)}</span></div><div class="plan-chart">${progressChart(p)}</div></div></section>
        <div class="plan-side-stack"><section class="plan-card"><h2 class="plan-card-title">Your goal</h2><div class="plan-facts"><div class="plan-fact"><span class="plan-fact-icon">${icon('target')}</span><span><strong>${esc(goalLine)}</strong><br><span style="color:#96929b;font-size:11px">${esc(p.goalLabel)} · ${esc(p.activityLabel)}</span></span></div><div class="plan-fact"><span class="plan-fact-icon">${icon('scale')}</span><span>${fmtWeight(p.currentWeight)} now → ${fmtWeight(p.goalWeight)} goal</span></div><div class="plan-fact"><span class="plan-fact-icon">${icon('leaf')}</span><span>${p.fiber}g fiber as a general daily reference</span></div><div class="plan-fact"><span class="plan-fact-icon">${icon('water')}</span><span>About ${p.waterLitres.toFixed(1)} L water as a starting reminder</span></div></div></section>
          <section class="plan-card"><h2 class="plan-card-title">How FITAI can help</h2><div class="plan-callout"><strong>Simple logging, useful feedback</strong><p>Log meals, check your macros, and build a routine around ${esc((app.answers.foodPrefs || []).includes('quick') ? 'quick, practical ideas' : 'foods and habits you enjoy')}.</p></div><p class="plan-disclaimer">${esc(p.caution)} Vitamins and minerals depend on the exact foods and portions you log; they can’t be inferred from profile details alone.</p></section></div></div></main>
    <footer class="plan-footer"><button class="btn" type="button" data-action="plan-continue">Continue${icon('arrowRight')}</button></footer></div>`;
}
function renderCommit() {
  const p = app.plan || calculatePlan(); const amount = Math.abs(p.goalWeight - p.currentWeight).toFixed(1);
  const statement = p.goal === 'maintain' ? 'building a balanced routine with daily food tracking' : `${p.goal === 'gain' ? 'gaining' : 'losing'} ${amount} kg by ${new Date(`${p.estimatedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return `<div class="commit-page"><header class="commit-header"><div class="flow-progress-block"><div class="flow-progress-meta"><span>YOUR PLAN</span><span>FINAL STEP</span></div><div class="progress-track"><div class="progress-fill" style="width:100%"></div></div></div></header>
    <main class="commit-main"><h1>Make this plan yours.</h1><div class="commit-statement">I’m committed to <strong>${esc(statement)}</strong>.<br><br>I’ll track meals with curiosity, fuel my body with intention, and adjust my plan when I need to.</div>
      <button type="button" class="hold-button" data-action="hold" aria-label="Press and hold to start your plan"><span class="hold-center">${icon('appleHeart', 45)}</span></button>
      <div class="hold-copy"><strong>Press and hold to start your plan</strong><span>Just for a moment—this is your commitment, not a contract.</span></div><button class="btn-text commit-skip" type="button" data-action="commit-skip">Skip for now</button></main></div>`;
}

const FOOD_DB = [
  { id: 'banana', name: 'Banana', aliases: ['banana','bananas'], serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: .4, fiber: 3.1, sodium: 1, emoji: '🍌' },
  { id: 'apple-food', name: 'Apple', aliases: ['apple','apples'], serving: '1 medium', calories: 95, protein: .5, carbs: 25, fat: .3, fiber: 4.4, sodium: 2, emoji: '🍎' },
  { id: 'oats', name: 'Oats', aliases: ['oats','oatmeal'], serving: '40 g dry', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, sodium: 2, emoji: '🥣' },
  { id: 'milk', name: 'Milk', aliases: ['milk'], serving: '1 cup', calories: 122, protein: 8, carbs: 12, fat: 5, fiber: 0, sodium: 105, emoji: '🥛' },
  { id: 'egg', name: 'Egg', aliases: ['egg','eggs'], serving: '1 large', calories: 78, protein: 6, carbs: .6, fat: 5, fiber: 0, sodium: 62, emoji: '🥚' },
  { id: 'roti', name: 'Roti / chapati', aliases: ['roti','rotis','chapati','chapatis'], serving: '1 medium', calories: 110, protein: 3.5, carbs: 22, fat: 1.5, fiber: 3, sodium: 180, emoji: '🫓' },
  { id: 'rice', name: 'Cooked rice', aliases: ['rice','white rice','basmati'], serving: '1 cup cooked', calories: 205, protein: 4.3, carbs: 45, fat: .4, fiber: .6, sodium: 2, emoji: '🍚' },
  { id: 'dal', name: 'Dal / lentils', aliases: ['dal','lentils','dahl'], serving: '1 bowl', calories: 180, protein: 12, carbs: 27, fat: 3, fiber: 8, sodium: 310, emoji: '🍲' },
  { id: 'paneer', name: 'Paneer', aliases: ['paneer'], serving: '100 g', calories: 265, protein: 18, carbs: 4, fat: 20, fiber: 0, sodium: 350, emoji: '🧀' },
  { id: 'curd', name: 'Curd / yogurt', aliases: ['curd','yogurt','dahi'], serving: '1 cup', calories: 150, protein: 9, carbs: 12, fat: 7, fiber: 0, sodium: 110, emoji: '🥣' },
  { id: 'chicken', name: 'Chicken breast', aliases: ['chicken','chicken breast'], serving: '120 g cooked', calories: 198, protein: 37, carbs: 0, fat: 4.3, fiber: 0, sodium: 74, emoji: '🍗' },
  { id: 'salad', name: 'Garden salad', aliases: ['salad'], serving: '1 bowl', calories: 85, protein: 3, carbs: 14, fat: 2, fiber: 5, sodium: 65, emoji: '🥗' },
  { id: 'poha', name: 'Poha', aliases: ['poha'], serving: '1 bowl', calories: 250, protein: 5, carbs: 43, fat: 7, fiber: 3, sodium: 390, emoji: '🍛' },
  { id: 'idli', name: 'Idli', aliases: ['idli','idlis'], serving: '2 pieces', calories: 120, protein: 4, carbs: 25, fat: .6, fiber: 2, sodium: 320, emoji: '🍚' },
  { id: 'dosa', name: 'Dosa', aliases: ['dosa','dosas'], serving: '1 medium', calories: 210, protein: 5, carbs: 32, fat: 7, fiber: 2, sodium: 360, emoji: '🥞' },
  { id: 'sambar', name: 'Sambar', aliases: ['sambar'], serving: '1 bowl', calories: 110, protein: 5, carbs: 16, fat: 3, fiber: 4, sodium: 450, emoji: '🍲' },
  { id: 'almonds', name: 'Almonds', aliases: ['almond','almonds'], serving: '28 g', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sodium: 0, emoji: '🥜' },
  { id: 'tofu', name: 'Tofu', aliases: ['tofu'], serving: '100 g', calories: 145, protein: 17, carbs: 3, fat: 9, fiber: 2, sodium: 14, emoji: '🧈' },
  { id: 'protein-shake', name: 'Protein shake', aliases: ['protein shake','protein powder','shake'], serving: '1 shake', calories: 160, protein: 25, carbs: 8, fat: 3, fiber: 1, sodium: 170, emoji: '🥤' },
  { id: 'peanut-butter', name: 'Peanut butter', aliases: ['peanut butter'], serving: '1 tbsp', calories: 94, protein: 4, carbs: 3, fat: 8, fiber: 1, sodium: 73, emoji: '🥜' },
];
function getDayMeals() { return app.logs[app.selectedDate] || []; }
function sumNutrients(items) {
  return items.reduce((acc, item) => {
    ['calories','protein','carbs','fat','fiber','sodium'].forEach(key => acc[key] += Number(item[key] || 0));
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
}
function selectedTotals() { return sumNutrients(getDayMeals()); }
function calorieTargetForDate(iso = app.selectedDate) {
  const base = Number(app.plan?.calories || 0);
  if (app.answers.rollover !== 'yes' || !iso) return { total: base, bonus: 0 };
  const previous = dateFromISO(iso); previous.setDate(previous.getDate() - 1);
  const previousLog = app.logs[dateKey(previous)] || [];
  if (!previousLog.length) return { total: base, bonus: 0 };
  const leftover = Math.max(0, base - sumNutrients(previousLog).calories);
  const bonus = Math.min(200, Math.floor(leftover));
  return { total: base + bonus, bonus };
}
function addLogEntry(entry, type = app.modalMealType || 'Breakfast') {
  const date = app.selectedDate;
  if (!app.logs[date]) app.logs[date] = [];
  app.logs[date].push({ ...entry, id: `${Date.now()}-${Math.random().toString(16).slice(2,7)}`, mealType: type, addedAt: new Date().toISOString() });
  persist();
}
function mealGroupCalories(type) { return fmtNumber(sumNutrients(getDayMeals().filter(x => x.mealType === type)).calories); }
function renderWeeklyStrip() {
  const selected = dateFromISO(app.selectedDate); const dayOfWeek = (selected.getDay() + 6) % 7; const monday = new Date(selected); monday.setDate(selected.getDate() - dayOfWeek);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i); const iso = dateKey(d);
    days.push(`<button type="button" class="week-day${iso === app.selectedDate ? ' active' : ''}${iso === todayISO() ? ' today' : ''}" data-action="select-date" data-date="${iso}" aria-label="${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}"><span class="week-day-name">${d.toLocaleDateString('en-US',{weekday:'short'})}</span><span class="week-day-number">${d.getDate()}</span></button>`);
  }
  return `<div class="week-strip">${days.join('')}</div>`;
}
function renderMacroCard(label, name, goal, consumed, iconName, index) {
  const remaining = Math.max(0, Math.round(goal - consumed)); const percent = Math.min(100, (consumed / Math.max(1, goal)) * 100);
  return `<div class="macro-card"><div class="macro-card-top"><span class="macro-icon">${icon(iconName)}</span><span class="sr-only">${Math.round(percent)} percent used</span></div><div class="macro-value">${remaining}g</div><div class="macro-name">${esc(label)} left</div><div class="macro-track"><span style="width:${percent}%"></span></div></div>`;
}
const MEAL_TYPES = [
  { name: 'Breakfast', emoji: '☀️' }, { name: 'Lunch', emoji: '🥗' }, { name: 'Dinner', emoji: '🌙' }, { name: 'Snacks', emoji: '🍓' },
];
function renderMealBlock(type) {
  const foods = getDayMeals().filter(item => item.mealType === type.name);
  const total = sumNutrients(foods);
  const rows = foods.map(food => `<div class="logged-food-row"><div class="logged-food-left"><strong>${esc(food.name)}</strong><span>${esc(food.serving || '1 serving')} · P ${Number(food.protein || 0).toFixed(0)}g · C ${Number(food.carbs || 0).toFixed(0)}g · F ${Number(food.fat || 0).toFixed(0)}g</span></div><div class="logged-food-right"><strong>${fmtNumber(food.calories)} kcal</strong><button type="button" class="delete-food" data-action="delete-food" data-id="${esc(food.id)}" aria-label="Remove ${esc(food.name)}">${icon('close')}</button></div></div>`).join('');
  return `<div class="meal-block"><div class="meal-block-head"><div class="meal-block-name"><span class="meal-emoji">${type.emoji}</span>${type.name}<span class="meal-block-total">${foods.length ? `${fmtNumber(total.calories)} kcal` : ''}</span></div><button class="add-link" type="button" data-action="open-food" data-meal-type="${type.name}">${icon('plus')}Add</button></div>${foods.length ? `<div class="logged-foods">${rows}</div>` : '<p class="meal-empty">Nothing logged here yet.</p>'}</div>`;
}
function getCoachCopy() {
  const barriers = app.answers.barriers || [];
  if (barriers.includes('busy')) return { title: 'Make busy days easier', body: 'A quick meal log and one dependable snack can be enough to keep your routine moving. Try one small choice at a time.' };
  if (barriers.includes('inspiration')) return { title: 'Need a little inspiration?', body: 'Build a balanced plate from a protein, a grain or starchy food, and something colorful. Keep it simple and choose foods you enjoy.' };
  if (barriers.includes('consistency')) return { title: 'Progress can be flexible', body: 'A single meal doesn’t define a day. Logging what you can—and returning to your routine—is more useful than chasing perfection.' };
  if (barriers.includes('forgetting')) return { title: 'Keep logging low-friction', body: 'Try adding a meal soon after eating. FITAI can estimate familiar foods from a short description, then you can review before saving.' };
  return { title: 'One meal at a time', body: 'Use these targets as helpful guideposts. Your food log will get more useful as you add meals and review your patterns.' };
}
function renderWaterCard() {
  const drank = Number(app.water[app.selectedDate] || 0); const target = Number(app.plan?.waterLitres || 2.2); const filled = Math.min(8, Math.floor(drank / .25));
  return `<section class="card-surface water-card"><div class="water-heading"><div class="water-title">${icon('water')}Hydration</div>${icon('droplet',17)}</div><div class="water-count">${drank.toFixed(2).replace(/0$/, '')}<span> L / ${target.toFixed(1)} L</span></div><div class="water-drops">${Array.from({length:8},(_,i)=>`<span class="water-drop${i < filled ? ' filled' : ''}"></span>`).join('')}</div><button type="button" class="water-add" data-action="add-water">${icon('plus')}Add 250 ml</button></section>`;
}
function renderNutrientCard() {
  const totals = selectedTotals(); const p = app.plan || calculatePlan();
  const fiberPercent = Math.min(100, totals.fiber / Math.max(1, p.fiber) * 100);
  return `<section class="card-surface nutrient-card"><div class="section-heading"><div><h2>More nutrition</h2><p>From the foods you log</p></div><span class="macro-icon">${icon('leaf')}</span></div><div class="nutrient-row"><div><span>Fiber</span><strong>${Math.round(totals.fiber)}<small> g · ${p.fiber} g guide</small></strong></div><div class="nutrient-track"><span style="width:${fiberPercent}%"></span></div></div><div class="nutrient-row sodium-row"><div><span>Sodium</span><strong>${fmtNumber(totals.sodium)}<small> mg logged</small></strong></div><p>Only available where food data includes it.</p></div><p class="nutrient-footnote">Vitamins and minerals depend on the exact food and portion; this prototype doesn’t infer them from your profile.</p></section>`;
}
function renderHomeTab() {
  const totals = selectedTotals(); const p = app.plan || calculatePlan(); const targetInfo = calorieTargetForDate(app.selectedDate); const targetCalories = targetInfo.total; const left = Math.max(0, targetCalories - totals.calories); const progress = Math.min(100, totals.calories / Math.max(1,targetCalories) * 100); const coach = getCoachCopy();
  const activeDate = app.selectedDate; const isToday = activeDate === todayISO();
  const subtitle = isToday ? localDateLabel(activeDate) : `${localDateLabel(activeDate)} · selected`;
  const weightDiff = Math.abs(p.goalWeight - (app.answers.weightKg || p.currentWeight)); const goalProgress = p.goal === 'maintain' ? 25 : clamp((1 - (weightDiff / Math.max(.1, Math.abs(p.goalWeight - p.currentWeight)))) * 100, 4, 96);
  const streak = (app.logs[todayISO()] || []).length ? '1 day' : '0 days';
  return `<div class="dashboard-inner fade-in"><div class="dash-topbar"><div class="dash-mobile-brand">${brand()}</div><div class="dash-header-actions"><span class="streak-pill">${icon('flame')}${streak}</span><button type="button" class="icon-button" data-action="set-tab" data-tab="profile" aria-label="Open profile"><span class="avatar" style="width:29px;height:29px;font-size:10px">${esc(initials(app.profile?.name))}</span></button></div></div>
    <div class="dash-welcome"><div><h1>${isToday ? `Good ${greeting()}, ${esc((app.profile?.name || 'there').split(' ')[0])}` : 'Your nutrition overview'}</h1><p>${esc(subtitle)} · one step at a time</p></div><button type="button" class="btn btn-light btn-small" data-action="open-food">${icon('plus')}Log a meal</button></div>
    ${renderWeeklyStrip()}<div class="dash-main-grid"><div class="dash-primary"><section class="calorie-card"><div><div class="calorie-card-label">${icon('flame')}Calories left ${isToday ? 'today' : 'on this day'}</div><div class="calorie-left">${fmtNumber(left)}</div><div class="calorie-goal-line"><strong>${fmtNumber(totals.calories)}</strong> eaten of ${fmtNumber(targetCalories)} kcal${targetInfo.bonus ? ` <span class="rollover-badge">+${targetInfo.bonus} carried over</span>` : ''}</div></div><div class="calorie-ring" style="--progress:${progress}%"><div class="calorie-ring-content">${icon('flame')}<strong>${fmtNumber(totals.calories)}</strong><span>eaten</span></div></div></section>
      <div class="macro-cards">${renderMacroCard('Protein','Protein',p.macros.protein,totals.protein,'drumstick',0)}${renderMacroCard('Carbs','Carbs',p.macros.carbs,totals.carbs,'wheat',1)}${renderMacroCard('Fats','Fats',p.macros.fat,totals.fat,'oil',2)}</div>
      <section class="card-surface"><div class="section-heading"><div><h2>${isToday ? 'Today’s food' : 'Food on this day'}</h2><p>Log meals to see your nutrition add up.</p></div><button type="button" class="add-link" data-action="open-food">${icon('plus')}Add food</button></div><div class="meal-list">${MEAL_TYPES.map(renderMealBlock).join('')}</div></section></div>
      <aside class="dash-secondary"><section class="coach-card"><span class="coach-icon">${icon('sparkles')}</span><h3>${esc(coach.title)}</h3><p>${esc(coach.body)}</p><button type="button" class="text-link" data-action="set-tab" data-tab="progress">View your progress ${icon('arrowRight')}</button></section>${renderWaterCard()}<section class="card-surface goal-progress-card"><div class="goal-title"><span>Your goal</span><span>${p.goal === 'maintain' ? 'A steady routine' : `${p.goal === 'gain' ? 'Gain' : 'Lose'} ${Math.abs(p.goalWeight-p.currentWeight).toFixed(1)} kg`}</span></div><div class="goal-progress-bar"><span style="width:${goalProgress}%"></span></div><p style="margin:9px 0 0;color:#99959e;font-size:10px">Targets are flexible. Progress may not be linear.</p></section>${renderNutrientCard()}</aside></div></div>`;
}
function greeting() { const hour = new Date().getHours(); return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'; }
function weightChartSvg() {
  const logs = app.weightLogs || [];
  const p = app.plan || calculatePlan();
  const start = logs.length ? Number(logs[0].kg) : Number(p.currentWeight);
  const end = logs.length > 1 ? Number(logs[logs.length - 1].kg) : start;
  const min = Math.min(start, end, p.goalWeight) - 1.5; const max = Math.max(start, end, p.goalWeight) + 1.5;
  const scale = val => 190 - ((val-min)/Math.max(.1,max-min))*145;
  const points = logs.length ? logs.map((item,i) => ({x: 25 + (i / Math.max(1, logs.length-1))*530, y: scale(Number(item.kg))})) : [{x:25,y:scale(start)}];
  const goalY = scale(p.goalWeight);
  let d = `M${points[0].x} ${points[0].y}`;
  points.slice(1).forEach(pt => { d += ` L${pt.x} ${pt.y}`; });
  const area = `${d} L555 200 L25 200 Z`;
  const actualTrend = points.length > 1 ? `<path class="chart-area" d="${area}"/><path class="chart-line" d="${d}"/>${points.map(pt=>`<circle class="chart-node" cx="${pt.x}" cy="${pt.y}" r="5"/>`).join('')}` : `<path class="chart-goal-line" d="M25 ${goalY}H555"/><circle class="chart-node" cx="25" cy="${points[0].y}" r="6"/><text class="chart-axis-label" x="42" y="${Math.max(27, points[0].y - 11)}">Starting point</text>`;
  return `<svg viewBox="0 0 580 235" role="img" aria-label="Weight check-ins and goal reference"><defs><linearGradient id="weightFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d7c8df" stop-opacity=".5"/><stop offset="1" stop-color="#f8f6fa" stop-opacity=".1"/></linearGradient></defs><path class="chart-grid-line" d="M22 45H560M22 105H560M22 165H560M22 200H560"/>${actualTrend}<text class="chart-axis-label" x="22" y="223">Start</text><text class="chart-axis-label" x="478" y="223">Goal ${p.goalWeight.toFixed(1)} kg</text></svg>`;
}
function dailyAverageCalories() {
  const vals = Object.values(app.logs || {}).map(meals => sumNutrients(meals || []).calories).filter(v => v > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
}
function renderProgressTab() {
  const p = app.plan || calculatePlan(); const logs = app.weightLogs || []; const latest = logs.length ? logs[logs.length-1].kg : p.currentWeight; const avg = dailyAverageCalories();
  const daysLogged = Object.values(app.logs || {}).filter(meals => meals && meals.length).length;
  const readings = logs.length;
  const bars = [0,1,2,3,4,5,6].map((i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i)); const iso = dateKey(d); const total = sumNutrients(app.logs[iso] || []).calories; const h = total ? clamp((total / Math.max(1,p.calories))*78, 8, 96) : 8;
    return `<div class="week-bar"><span style="height:${h}%"></span><small>${d.toLocaleDateString('en-US',{weekday:'narrow'})}</small></div>`;
  }).join('');
  return `<div class="dashboard-inner tab-page"><div class="tab-page-heading"><div><p class="eyebrow">YOUR TRENDS</p><h1>Progress</h1><p>Patterns over time, without the pressure to be perfect.</p></div><button class="btn btn-light btn-small" type="button" data-action="open-weight">${icon('plus')}Log weight</button></div>
    <div class="stats-grid"><div class="stat-card"><span>Current weight</span><strong>${Number(latest).toFixed(1)} kg</strong><small>${readings ? `${readings} weigh-in${readings===1?'':'s'} logged` : 'Starting point'}</small></div><div class="stat-card"><span>Daily calorie guide</span><strong>${fmtNumber(p.calories)}</strong><small>Personalized estimate · kcal</small></div><div class="stat-card"><span>Days with food logged</span><strong>${daysLogged}</strong><small>${avg ? `Average logged: ${fmtNumber(avg)} kcal` : 'Your history will appear here'}</small></div></div>
    <div class="progress-layout"><section class="weight-chart-card"><div class="section-heading"><div><h2>Weight trend</h2><p>Check-ins you choose to add</p></div><span class="eyebrow">KG</span></div><div class="weight-chart">${weightChartSvg()}</div><p class="metric-note">Scale weight naturally changes day to day. Look for longer-term patterns, not single readings.</p></section>
      <div class="progress-side"><section class="weight-chart-card"><div class="section-heading"><div><h2>Food log this week</h2><p>Calories recorded per day</p></div></div><div class="week-bars">${bars}</div></section><div class="progress-tip"><h3>A helpful way to read progress</h3><p>Use your targets as a flexible guide. If you track consistently for a while and feel low on energy, adjust your plan or ask a registered dietitian for support.</p></div></div></div></div>`;
}
function renderCommunityTab() {
  const loggedDays = Object.values(app.logs || {}).filter(x => x && x.length).length; const progress = Math.min(7, loggedDays);
  return `<div class="dashboard-inner tab-page"><div class="tab-page-heading"><div><p class="eyebrow">YOUR SUPPORT SPACE</p><h1>Small steps, together</h1><p>No competition—just a gentle nudge to keep showing up for yourself.</p></div></div>
    <section class="challenge-card"><p class="eyebrow">A FLEXIBLE 7-DAY CHALLENGE</p><h2>Notice one thing about your meals.</h2><p>For one week, log a meal or a snack when it feels useful. You can skip a day and start again—there’s no streak to protect.</p><div class="challenge-steps">${Array.from({length:7},(_,i)=>`<div class="challenge-day${i<progress?' done':''}"><span class="challenge-dot">${i<progress?icon('check'):i+1}</span><span>Day ${i+1}</span></div>`).join('')}</div><button class="btn ${app.joinedChallenge ? 'btn-light' : ''}" type="button" data-action="join-challenge">${app.joinedChallenge ? 'You’re in — keep going' : 'Join this gentle challenge'}</button><div class="challenge-message">${icon('heart')}<span>${app.joinedChallenge ? `You have ${progress} logged day${progress===1?'':'s'} so far. Pick up again whenever you’re ready.` : 'A supportive routine can start with a single meal. Your progress stays private on this device.'}</span></div></section>
    <div class="stats-grid" style="margin-top:15px"><div class="stat-card"><span>Logged days</span><strong>${loggedDays}</strong><small>From your food log</small></div><div class="stat-card"><span>Community feed</span><strong>Private</strong><small>Your data is not shared</small></div><div class="stat-card"><span>Challenge</span><strong>${app.joinedChallenge ? 'Joined' : 'Optional'}</strong><small>Come back on your own time</small></div></div></div>`;
}
function renderProfileTab() {
  const p = app.plan || calculatePlan(); const a = app.answers || {}; const flags = (a.allergies || []).filter(x=>x!=='none'); const diet = a.diet ? a.diet.charAt(0).toUpperCase()+a.diet.slice(1).replace('-', ' ') : 'Balanced';
  const goal = p.goal === 'maintain' ? 'Maintain weight' : `${p.goal === 'gain'?'Gain':'Lose'} ${Math.abs(p.goalWeight-p.currentWeight).toFixed(1)} kg`;
  return `<div class="dashboard-inner tab-page"><div class="tab-page-heading"><div><p class="eyebrow">YOUR DETAILS</p><h1>Profile</h1><p>Your plan and preferences in one place.</p></div></div><div class="profile-grid"><section class="profile-card"><div class="profile-person"><span class="avatar">${esc(initials(app.profile?.name))}</span><div><strong>${esc(app.profile?.name || 'FITAI member')}</strong><span>${esc(app.profile?.email || 'Local profile')}</span></div></div><div class="profile-details"><div class="profile-detail-row"><span>Your goal</span><strong>${esc(goal)}</strong></div><div class="profile-detail-row"><span>Current weight</span><strong>${fmtWeight(a.weightKg || p.currentWeight)}</strong></div><div class="profile-detail-row"><span>Height · age</span><strong>${Math.round(a.heightCm || 170)} cm · ${p.age} years</strong></div><div class="profile-detail-row"><span>Eating style</span><strong>${esc(diet)}</strong></div><div class="profile-detail-row"><span>Daily calorie guide</span><strong>${fmtNumber(p.calories)} kcal</strong></div><div class="profile-detail-row"><span>Calorie rollover</span><strong>${a.rollover === 'yes' ? 'Up to 200 kcal' : 'Off'}</strong></div><div class="profile-detail-row"><span>Allergies selected</span><strong>${flags.length ? esc(flags.map(x=>x.replace('-', ' ')).join(', ')) : 'None selected'}</strong></div></div></section>
      <div><section class="profile-card"><h2>Plan settings</h2><div class="profile-action-list"><button class="profile-action" type="button" data-action="open-calories">${icon('flame')}<span>Edit daily calorie target</span>${icon('chevron')}</button><button class="profile-action" type="button" data-action="open-weight">${icon('scale')}<span>Log a weight check-in</span>${icon('chevron')}</button><button class="profile-action" type="button" data-action="set-tab" data-tab="progress">${icon('chart')}<span>View your progress</span>${icon('chevron')}</button></div><div class="privacy-note"><strong>Privacy note:</strong> this prototype stores your profile and food log in local browser storage. It does not send your data to a server.</div></section><button class="profile-action" style="margin-top:13px" type="button" data-action="logout">${icon('logout')}<span>Log out</span>${icon('chevron')}</button></div></div></div>`;
}
function renderSidebar() {
  const items = [{id:'home',label:'Home',ico:'home'},{id:'progress',label:'Progress',ico:'chart'},{id:'community',label:'Community',ico:'users'},{id:'profile',label:'Profile',ico:'user'}];
  const p = app.plan || calculatePlan();
  return `<aside class="app-sidebar"><div class="sidebar-brand">${brand()}</div><nav class="sidebar-nav" aria-label="Main navigation">${items.map(item=>`<button type="button" class="nav-item${app.tab===item.id?' active':''}" data-action="set-tab" data-tab="${item.id}">${icon(item.ico)}<span>${item.label}</span></button>`).join('')}</nav><div class="sidebar-spacer"></div><div class="side-goal-card"><p class="eyebrow">YOUR CURRENT FOCUS</p><strong>${esc(p.goalLabel)}</strong><p>${fmtNumber(p.calories)} kcal/day · ${p.macros.protein}g protein</p></div><div class="sidebar-user"><span class="avatar">${esc(initials(app.profile?.name))}</span><div class="sidebar-user-copy"><strong>${esc(app.profile?.name || 'FITAI member')}</strong><span>${esc(app.profile?.email || 'Local profile')}</span></div><button class="logout-icon" type="button" data-action="logout" aria-label="Log out">${icon('logout')}</button></div></aside>`;
}
function renderMobileNav() {
  const items = [{id:'home',label:'Home',ico:'home'},{id:'progress',label:'Progress',ico:'chart'},{id:'community',label:'Groups',ico:'users'},{id:'profile',label:'Profile',ico:'user'}];
  return `<div class="mobile-nav-wrap"><nav class="mobile-nav" aria-label="Main navigation">${items.map(item=>`<button type="button" class="${app.tab===item.id?'active':''}" data-action="set-tab" data-tab="${item.id}">${icon(item.ico)}<span>${item.label}</span></button>`).join('')}</nav><button type="button" class="nav-fab" data-action="open-food" aria-label="Add a meal">${icon('plus')}</button></div>`;
}
function renderDashboard() {
  if (!app.plan) app.plan = calculatePlan();
  let content = app.tab === 'progress' ? renderProgressTab() : app.tab === 'community' ? renderCommunityTab() : app.tab === 'profile' ? renderProfileTab() : renderHomeTab();
  return `<div class="dashboard-shell">${renderSidebar()}<main class="dashboard-main">${content}</main>${renderMobileNav()}</div>${renderModal()}`;
}
function foodResult(food) {
  return `<div class="food-result"><span class="food-emoji">${food.emoji}</span><span class="food-result-copy"><strong>${esc(food.name)}</strong><span>${esc(food.serving)} · ${food.calories} kcal</span></span><button type="button" class="btn" data-action="add-food" data-food-id="${food.id}">${icon('plus')}Add</button></div>`;
}
function foodConflictsWithSelectedAllergen(food) {
  const selected = (app.answers.allergies || []).filter(value => value !== 'none');
  const contains = {
    dairy: ['milk','curd','paneer'], gluten: ['roti','oats'], peanuts: ['peanut-butter'],
    'tree-nuts': ['almonds'], soy: ['tofu'], eggs: ['egg'], shellfish: [],
  };
  return selected.some(allergen => (contains[allergen] || []).includes(food.id));
}
function renderFoodResults() {
  const q = (app.modal?.query || '').trim().toLowerCase();
  const results = q ? FOOD_DB.filter(f => f.name.toLowerCase().includes(q) || f.aliases.some(a=>a.includes(q))).slice(0,8) : FOOD_DB.filter(f => !foodConflictsWithSelectedAllergen(f)).slice(0,7);
  return results.length ? results.map(foodResult).join('') : '<div class="no-results">No match yet. Try a common food like rice, roti, dal, egg, or banana.</div>';
}
function renderFoodModal() {
  const tab = app.modal?.foodTab || 'quick'; const types = ['Breakfast','Lunch','Dinner','Snacks'];
  let body = '';
  if (tab === 'quick') {
    body = `<div class="food-search">${icon('search')}<input id="foodSearch" class="text-input" type="search" placeholder="Search foods…" value="${esc(app.modal?.query || '')}" autocomplete="off" /></div><div class="food-results" id="foodResults">${renderFoodResults()}</div>`;
  } else {
    const estimate = app.aiEstimate;
    body = `<div class="ai-info">${icon('sparkles')}<span>Describe familiar foods and portions. This prototype estimates from a small local food list—review it before saving; it is not a camera scan or clinical database.</span></div><textarea id="aiMealText" class="text-area" placeholder="For example: 2 rotis with a bowl of dal and curd">${esc(app.aiText || '')}</textarea><button type="button" class="btn btn-small full-width" style="margin-top:11px" data-action="estimate-food">Estimate this meal ${icon('arrowRight')}</button>${estimate ? `<div class="ai-estimate"><div class="ai-estimate-top"><strong>Approximate estimate</strong><span>${fmtNumber(estimate.calories)} kcal</span></div><div class="ai-estimate-macros"><span>Protein ${Math.round(estimate.protein)}g</span><span>Carbs ${Math.round(estimate.carbs)}g</span><span>Fat ${Math.round(estimate.fat)}g</span></div><p style="margin:9px 0 0;color:#8e8993;font-size:10px;line-height:1.5">Matched: ${esc(estimate.matchedLabel)} · Portions may differ from what you ate.</p><button class="btn" type="button" data-action="add-estimate">Add estimate to ${esc(app.modalMealType)}</button></div>` : ''}`;
  }
  return `<div class="modal-backdrop" data-action="close-backdrop"><section class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="food-modal-title"><div class="modal-header"><div><h2 id="food-modal-title">Add to your food log</h2><p>Choose a meal, then add a food or review an estimate.</p></div><button type="button" class="modal-close" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><div class="modal-body"><div class="meal-type-picker">${types.map(t=>`<button type="button" class="${app.modalMealType===t?'active':''}" data-action="set-meal-type" data-meal-type="${t}">${t}</button>`).join('')}</div><div class="food-tabs"><button type="button" class="${tab==='quick'?'active':''}" data-action="food-tab" data-food-tab="quick">Search foods</button><button type="button" class="${tab==='ai'?'active':''}" data-action="food-tab" data-food-tab="ai">AI text estimate</button></div>${body}</div></section></div>`;
}
function renderCaloriesModal() {
  const value = Number(app.modal?.value || app.plan?.calories || 2000); const min = Math.max(1100, (app.plan?.calories || 2000) - 500); const max = (app.plan?.calories || 2000) + 500; const pct = ((value-min)/(max-min))*100;
  return `<div class="modal-backdrop" data-action="close-backdrop"><section class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="calorie-modal-title"><div class="modal-header"><div><h2 id="calorie-modal-title">Adjust daily target</h2><p>Start from the estimate, then choose what feels useful.</p></div><button type="button" class="modal-close" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><div class="modal-body"><div class="modal-range-value"><span data-modal-output="calories">${fmtNumber(value)}</span> <small>kcal / day</small></div><input class="range-input" type="range" min="${min}" max="${max}" step="10" value="${value}" style="--range:${pct}%" data-modal-range="calories" aria-label="Daily calorie target"/><p class="metric-note">Calorie targets are estimates and may not suit everyone. Consider a qualified professional for individual medical advice.</p></div><div class="modal-footer"><button type="button" class="btn btn-light btn-small" data-action="close-modal">Cancel</button><button type="button" class="btn btn-small" data-action="save-calories">Save target</button></div></section></div>`;
}
function renderWeightModal() {
  const kg = Number(app.modal?.value || app.answers.weightKg || 68); const unit = app.modal?.unit || 'kg'; const display = unit === 'lb' ? kg * 2.20462262 : kg; const min = unit === 'lb' ? 77 : 35; const max = unit === 'lb' ? 397 : 180; const pct = (display-min)/(max-min)*100;
  return `<div class="modal-backdrop" data-action="close-backdrop"><section class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="weight-modal-title"><div class="modal-header"><div><h2 id="weight-modal-title">Log a weight check-in</h2><p>Optional. Your daily target won’t change automatically.</p></div><button type="button" class="modal-close" data-action="close-modal" aria-label="Close">${icon('close')}</button></div><div class="modal-body"><div class="unit-switch" style="margin-bottom:14px"><button type="button" data-action="weight-modal-unit" data-unit="kg" class="${unit==='kg'?'active':''}">kg</button><button type="button" data-action="weight-modal-unit" data-unit="lb" class="${unit==='lb'?'active':''}">lb</button></div><div class="modal-range-value"><span data-modal-output="weight">${display.toFixed(1)}</span> <small>${unit}</small></div><input class="range-input" type="range" min="${min}" max="${max}" step="0.1" value="${display.toFixed(1)}" style="--range:${pct}%" data-modal-range="weight" aria-label="Weight check-in"/><p class="metric-note">Daily weight varies naturally. A check-in is just one data point.</p></div><div class="modal-footer"><button type="button" class="btn btn-light btn-small" data-action="close-modal">Cancel</button><button type="button" class="btn btn-small" data-action="save-weight">Save check-in</button></div></section></div>`;
}
function renderModal() {
  if (!app.modal) return '';
  if (app.modal.type === 'food') return renderFoodModal();
  if (app.modal.type === 'calories') return renderCaloriesModal();
  if (app.modal.type === 'weight') return renderWeightModal();
  return '';
}

function renderAuth() {
  const signup = app.authMode === 'signup';
  const storedEmail = app.profile?.email || '';
  return `<div class="auth-layout"><aside class="auth-visual"><div>${brand()}</div><div class="visual-copy"><p class="eyebrow">PERSONAL NUTRITION, MADE SIMPLE</p><h1>Make your next meal <em>your best one.</em></h1><p>A calmer way to understand what you eat. Set a goal, get a personalized starting point, and track meals without losing sight of real life.</p><div class="visual-preview"><div class="visual-preview-top"><strong>Your day, at a glance</strong><span class="day-pill">${icon('sparkles',14)} Your plan</span></div><div class="preview-content"><div class="preview-calories"><div><div class="preview-number">2,140</div><div class="preview-caption">calories left today</div></div><div class="ring" style="--progress:34%"><span class="ring-center">${icon('flame',18)}</span></div></div><div class="preview-bars"><div class="preview-bar-row"><span>Protein</span><div class="tiny-track"><span style="width:62%"></span></div></div><div class="preview-bar-row"><span>Carbs</span><div class="tiny-track"><span style="width:43%;background:#779ac6"></span></div></div><div class="preview-bar-row"><span>Fat</span><div class="tiny-track"><span style="width:55%;background:#d06e94"></span></div></div></div></div></div></div><div class="auth-visual-footer">Thoughtful nutrition tracking, without the all-or-nothing.</div></aside>
    <main class="auth-main"><div class="auth-main-inner"><div class="auth-mobile-brand">${brand()}</div><div class="auth-switch"><button type="button" class="${!signup?'active':''}" data-action="auth-mode" data-mode="login">Log in</button><button type="button" class="${signup?'active':''}" data-action="auth-mode" data-mode="signup">Sign up</button></div><div class="auth-form-heading"><p class="eyebrow">WELCOME TO FITAI</p><h2>${signup ? 'Build a plan around you.' : 'Good to see you again.'}</h2><p>${signup ? 'Create your account, then answer a few quick questions. No typing through the plan.' : 'Log in to pick up where your nutrition routine left off.'}</p></div>
      <form class="auth-form" id="authForm"><div id="signupNameField" class="field" style="${signup?'':'display:none'}"><label class="field-label" for="signupName">Your name</label><input class="text-input" id="signupName" name="name" type="text" placeholder="First name" autocomplete="name" ${signup?'required':''}/></div><div class="field"><label class="field-label" for="authEmail">Email address</label><input class="text-input" id="authEmail" name="email" type="email" placeholder="you@example.com" value="${esc(storedEmail)}" autocomplete="email" required /></div><div class="field"><label class="field-label" for="authPassword">Password</label><input class="text-input" id="authPassword" name="password" type="password" placeholder="At least 8 characters" minlength="8" autocomplete="${signup?'new-password':'current-password'}" required /></div><p class="form-error" id="authError">${esc(app.authError || '')}</p><button class="btn full-width" type="submit">${signup ? 'Create my account' : 'Log in'}${icon('arrowRight')}</button></form>
      <p class="form-note">Your demo profile is saved only in this browser. FITAI does not send your information to a server in this prototype.</p><div class="auth-divider">or</div><button class="demo-link" type="button" data-action="demo">${icon('sparkles')}Explore a sample dashboard</button></div></main></div>`;
}

function renderToast() {
  return app.toast ? `<div class="toast" role="status">${icon('checkCircle')}<span>${esc(app.toast)}</span></div>` : '';
}
function render() {
  let content = '';
  if (app.view === 'auth') content = renderAuth();
  else if (app.view === 'onboarding') content = renderOnboarding();
  else if (app.view === 'plan') content = renderPlan();
  else if (app.view === 'commit') content = renderCommit();
  else content = renderDashboard();
  root.innerHTML = content + renderToast();
}

function startSignup(formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase(); const name = String(formData.get('name') || '').trim();
  if (!name) { app.authError = 'Please add your name to continue.'; render(); return; }
  if (app.profile && app.profile.email === email && app.plan) { app.authError = 'This email already has a profile here. Try logging in instead.'; render(); return; }
  app.profile = { name, email, createdAt: new Date().toISOString() };
  app.answers = { weightKg: 68, heightCm: 170, birthParts: { month: '', day: '', year: '' }, allergies: [], health: [], foodPrefs: [], barriers: [] };
  app.plan = null; app.logs = {}; app.water = {}; app.weightLogs = []; app.flowIndex = 0; app.tab = 'home'; app.modal = null; app.authError = '';
  app.view = 'onboarding'; persist(); render();
}
function login(formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (app.profile?.email?.toLowerCase() === email && app.plan) { app.view = 'dashboard'; app.tab = 'home'; app.authError = ''; render(); return; }
  if (app.profile?.email?.toLowerCase() === email && !app.plan) { app.view = 'onboarding'; app.authError = ''; render(); return; }
  app.authError = app.profile ? 'No saved FITAI profile for that email on this device. Use the email you signed up with, or start a new account.' : 'No local account found yet. Sign up to build your personalized plan, or explore the sample dashboard.';
  render();
}
function createDemo() {
  if (app.profile && app.plan) { app.view = 'dashboard'; app.tab = 'home'; render(); return; }
  if (app.profile && !app.plan) { app.view = 'onboarding'; render(); return; }
  app.profile = { name: 'Alex Morgan', email: 'demo@fitai.app', createdAt: new Date().toISOString() };
  app.answers = { goal: 'maintain', birthDate: '1996-04-18', birthParts: {month:'4',day:'18',year:'1996'}, sex: 'other', heightCm: 170, weightKg: 68, activity: 'moderate', workouts: '3-5', diet: 'balanced', allergies: ['none'], health: [], mealsPerDay: '3', foodPrefs: ['quick','home-cooked'], barriers: ['busy'], reminders: 'none' };
  app.plan = calculatePlan(app.answers); app.selectedDate = todayISO(); app.logs = { [app.selectedDate]: [] }; app.water = { [app.selectedDate]: .75 }; app.weightLogs = [{date: app.selectedDate, kg: 68}]; app.flowIndex = 0; app.tab = 'home'; app.view = 'dashboard'; app.modal = null; persist(); render();
}
function nextStep() {
  const flow = currentFlow(); const step = flow[app.flowIndex];
  if (!stepValid(step)) return;
  if (app.flowIndex < flow.length - 1) { app.flowIndex++; render(); return; }
  app.plan = calculatePlan();
  app.weightLogs = app.weightLogs?.length ? app.weightLogs : [{ date: todayISO(), kg: Number(app.answers.weightKg || 68) }];
  app.view = 'plan'; persist(); render();
}
function goBack() {
  if (app.modal) { app.modal = null; render(); return; }
  if (app.view === 'onboarding') {
    if (app.flowIndex > 0) app.flowIndex--;
    else { app.view = 'auth'; app.authMode = 'signup'; }
  } else if (app.view === 'plan') { app.view = 'onboarding'; app.flowIndex = Math.max(0, currentFlow().length - 1); }
  else if (app.view === 'commit') app.view = 'plan';
  else if (app.view === 'dashboard') app.tab = 'home';
  render();
}
function goDashboard() { app.view = 'dashboard'; app.tab = 'home'; app.modal = null; app.selectedDate ||= todayISO(); persist(); render(); }
function toggleSelection(key, value) {
  const current = Array.isArray(app.answers[key]) ? [...app.answers[key]] : [];
  const step = FLOW.find(s => s.key === key); const none = step?.noneValue;
  if (none && value === none) app.answers[key] = current.includes(value) ? [] : [value];
  else {
    const withoutNone = none ? current.filter(v => v !== none) : current;
    app.answers[key] = withoutNone.includes(value) ? withoutNone.filter(v => v !== value) : [...withoutNone, value];
  }
  render();
}
function setSingleAnswer(key, value) {
  if (key === 'paceKgPerWeek') app.answers[key] = Number(value);
  else app.answers[key] = value;
  if (key === 'goal') {
    app.answers.paceKgPerWeek = undefined;
    const current = Number(app.answers.weightKg || 68);
    if (value === 'maintain') delete app.answers.goalWeightKg;
    else {
      const previousTarget = Number(app.answers.goalWeightKg);
      const directionMismatch = Number.isFinite(previousTarget) && (value === 'lose' ? previousTarget >= current : previousTarget <= current);
      if (!Number.isFinite(previousTarget) || directionMismatch) app.answers.goalWeightKg = round1(current + (value === 'lose' ? -5 : 5));
    }
  }
  render();
}
function setUnit(group, unit) { app.units[group] = unit; render(); }
function updateRangeValue(input) {
  const key = input.dataset.rangeAnswer; if (!key) return;
  const n = Number(input.value);
  if (key === 'weightKg' || key === 'goalWeightKg') {
    const unit = input.dataset.weightUnit || app.units.weight;
    app.answers[key] = round1(unit === 'lb' ? n / 2.20462262 : n);
  } else if (key === 'heightCm') app.answers.heightCm = n;
  const output = root.querySelector(`[data-output="${key}"]`);
  if (output) output.innerHTML = key === 'heightCm' ? displayHeight(app.answers.heightCm) : displayWeight(app.answers[key]);
  const min = Number(input.min), max = Number(input.max); input.style.setProperty('--range', `${((n-min)/(max-min))*100}%`);
}
function handleDobChange(target) {
  const parts = { ...(app.answers.birthParts || {month:'',day:'',year:''}), [target.dataset.dobPart]: target.value };
  app.answers.birthParts = parts;
  if (parts.month && parts.day && parts.year) {
    const date = `${parts.year}-${String(parts.month).padStart(2,'0')}-${String(parts.day).padStart(2,'0')}`;
    const age = getAgeFromDate(date);
    if (age >= 18) app.answers.birthDate = date;
    else app.answers.birthDate = '';
  } else app.answers.birthDate = '';
  render();
}
function showToast(message) {
  app.toast = message; render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { app.toast = ''; if (app.view === 'dashboard') render(); }, 2200);
}
function escapedRegex(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function estimateMealText(text) {
  const lower = text.toLowerCase(); const matches = [];
  for (const food of FOOD_DB) {
    for (const alias of food.aliases) {
      const safe = escapedRegex(alias);
      const re = new RegExp(`(?:^|[^a-z])([0-9]+(?:\\.[0-9]+)?)?\\s*${safe}(?=$|[^a-z])`, 'i');
      const match = lower.match(re);
      if (match) { matches.push({ food, quantity: Math.max(.25, Number(match[1] || 1)) }); break; }
    }
  }
  if (!matches.length) return null;
  const totals = matches.reduce((acc, entry) => {
    ['calories','protein','carbs','fat','fiber','sodium'].forEach(key => acc[key] += entry.food[key] * entry.quantity);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
  const label = matches.map(m => `${m.quantity !== 1 ? `${m.quantity}× ` : ''}${m.food.name}`).join(' + ');
  return { ...totals, matchedLabel: label, name: `AI estimate · ${label}`, serving: 'Approx. described portions' };
}
function addFoodById(id) {
  const food = FOOD_DB.find(f => f.id === id); if (!food) return;
  addLogEntry({ name: food.name, serving: food.serving, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, fiber: food.fiber, sodium: food.sodium, emoji: food.emoji });
  showToast(`${food.name} added to ${app.modalMealType.toLowerCase()}`);
}
function addEstimate() {
  if (!app.aiEstimate) return;
  const { name, serving, calories, protein, carbs, fat, fiber, sodium } = app.aiEstimate;
  addLogEntry({ name, serving, calories: Math.round(calories), protein, carbs, fat, fiber, sodium, emoji: '✨' });
  app.aiEstimate = null; app.aiText = ''; app.modal = null; showToast('Meal estimate added—review portions anytime');
}

function onSubmit(event) {
  const form = event.target.closest('#authForm');
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form); const password = String(data.get('password') || '');
  if (password.length < 8) { app.authError = 'Use a password with at least 8 characters.'; render(); return; }
  if (app.authMode === 'signup') startSignup(data); else login(data);
}
function onInput(event) {
  const target = event.target;
  if (target.matches('[data-range-answer]')) { updateRangeValue(target); return; }
  if (target.id === 'foodSearch') {
    if (app.modal) app.modal.query = target.value;
    const results = root.querySelector('#foodResults'); if (results) results.innerHTML = renderFoodResults();
    return;
  }
  if (target.id === 'aiMealText') { app.aiText = target.value; return; }
  if (target.matches('[data-modal-range="calories"]')) {
    app.modal.value = Number(target.value); target.style.setProperty('--range', `${((Number(target.value)-Number(target.min))/(Number(target.max)-Number(target.min)))*100}%`);
    const output = root.querySelector('[data-modal-output="calories"]'); if (output) output.textContent = fmtNumber(target.value); return;
  }
  if (target.matches('[data-modal-range="weight"]')) {
    const unit = app.modal?.unit || 'kg'; const n = Number(target.value); app.modal.value = unit === 'lb' ? n / 2.20462262 : n;
    target.style.setProperty('--range', `${((n-Number(target.min))/(Number(target.max)-Number(target.min)))*100}%`);
    const output = root.querySelector('[data-modal-output="weight"]'); if (output) output.textContent = n.toFixed(1); return;
  }
}
function onChange(event) {
  const target = event.target;
  if (target.matches('[data-dob-part]')) { handleDobChange(target); return; }
}
let holdFrame = null; let holdStart = 0; let holdingButton = null;
function onPointerDown(event) {
  const button = event.target.closest('[data-action="hold"]'); if (!button) return;
  event.preventDefault(); holdingButton = button; holdStart = performance.now();
  try { button.setPointerCapture(event.pointerId); } catch (_) {}
  const tick = (now) => {
    if (!holdingButton) return;
    const progress = Math.min(1, (now - holdStart) / 1300);
    holdingButton.style.setProperty('--hold', progress);
    if (progress >= 1) { holdingButton = null; holdFrame = null; goDashboard(); return; }
    holdFrame = requestAnimationFrame(tick);
  };
  holdFrame = requestAnimationFrame(tick);
}
function onPointerUp() {
  if (!holdingButton) return;
  if (holdFrame) cancelAnimationFrame(holdFrame);
  holdingButton.style.setProperty('--hold', 0); holdingButton = null; holdFrame = null;
}
function onClick(event) {
  const backdrop = event.target.closest('.modal-backdrop');
  if (backdrop && event.target === backdrop) { app.modal = null; render(); return; }
  const button = event.target.closest('[data-action]'); if (!button || button.dataset.action === 'close-backdrop') return;
  const action = button.dataset.action;
  if (action === 'hold') { if (event.detail === 0) goDashboard(); return; }
  if (action === 'auth-mode') { app.authMode = button.dataset.mode; app.authError = ''; render(); return; }
  if (action === 'demo') { createDemo(); return; }
  if (action === 'back') { goBack(); return; }
  if (action === 'set-answer') { setSingleAnswer(button.dataset.key, button.dataset.value); return; }
  if (action === 'toggle-answer') { toggleSelection(button.dataset.key, button.dataset.value); return; }
  if (action === 'set-unit') { setUnit(button.dataset.unitGroup, button.dataset.unit); return; }
  if (action === 'next-step') { nextStep(); return; }
  if (action === 'plan-continue') { app.view = 'commit'; render(); return; }
  if (action === 'commit-skip') { goDashboard(); return; }
  if (action === 'set-tab') { app.tab = button.dataset.tab; app.modal = null; persist(); render(); return; }
  if (action === 'open-food') { app.modal = { type: 'food', foodTab: 'quick', query: '' }; app.modalMealType = button.dataset.mealType || 'Breakfast'; app.aiText = ''; app.aiEstimate = null; render(); return; }
  if (action === 'food-tab') { app.modal.foodTab = button.dataset.foodTab; app.aiEstimate = null; render(); return; }
  if (action === 'set-meal-type') { app.modalMealType = button.dataset.mealType; render(); return; }
  if (action === 'add-food') { addFoodById(button.dataset.foodId); return; }
  if (action === 'estimate-food') { app.aiEstimate = estimateMealText(app.aiText || ''); if (!app.aiEstimate) { showToast('Try a familiar food, like roti, rice, dal, egg, or banana'); return; } render(); return; }
  if (action === 'add-estimate') { addEstimate(); return; }
  if (action === 'close-modal' || action === 'close-backdrop') { app.modal = null; render(); return; }
  if (action === 'select-date') { app.selectedDate = button.dataset.date; persist(); render(); return; }
  if (action === 'add-water') { app.water[app.selectedDate] = Number(app.water[app.selectedDate] || 0) + .25; persist(); showToast('250 ml added to hydration'); return; }
  if (action === 'delete-food') { const arr = app.logs[app.selectedDate] || []; app.logs[app.selectedDate] = arr.filter(item => String(item.id) !== String(button.dataset.id)); persist(); render(); return; }
  if (action === 'open-calories') { app.modal = { type: 'calories', value: app.plan?.calories || 2000 }; render(); return; }
  if (action === 'save-calories') { if (app.plan) { app.plan.calories = Math.round(Number(app.modal.value) / 10) * 10; app.plan.macros = calculateMacros(app.plan.calories, app.plan.goal === 'gain' ? app.plan.goalWeight : app.plan.currentWeight); } app.modal = null; persist(); showToast('Daily target updated'); return; }
  if (action === 'open-weight') { app.modal = { type: 'weight', value: app.answers.weightKg || app.plan?.currentWeight || 68, unit: 'kg' }; render(); return; }
  if (action === 'weight-modal-unit') { const nextUnit = button.dataset.unit; app.modal.unit = nextUnit; render(); return; }
  if (action === 'save-weight') { const value = round1(Number(app.modal.value)); app.answers.weightKg = value; app.weightLogs ||= []; app.weightLogs.push({date: app.selectedDate, kg: value}); app.weightLogs.sort((a,b)=>a.date.localeCompare(b.date)); app.modal = null; persist(); showToast('Weight check-in saved'); return; }
  if (action === 'join-challenge') { app.joinedChallenge = !app.joinedChallenge; persist(); render(); return; }
  if (action === 'logout') { app.view = 'auth'; app.authMode = 'login'; app.authError = ''; app.modal = null; render(); return; }
}
root.addEventListener('submit', onSubmit);
root.addEventListener('input', onInput);
root.addEventListener('change', onChange);
root.addEventListener('click', onClick);
root.addEventListener('pointerdown', onPointerDown);
root.addEventListener('pointerup', onPointerUp);
root.addEventListener('pointercancel', onPointerUp);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && app.modal) { app.modal = null; render(); } });
render();
