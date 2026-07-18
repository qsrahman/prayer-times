const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const DEFAULT_SETTINGS = {
  city: 'Islamabad',
  lat: 33.6995,
  lng: 73.0363,
  method: 'Karachi',
  asr: 'Hanafi',
  maghrib: '4 min',
  timezone: 'Asia/Karachi',
  notifications: true,
  notifyMinutes: 10,
  theme: 'system',
};

function setupPrayTime(praytime) {
  praytime.methods['Gulf'] = { fajr: 19.5, isha: '90 min' };
  praytime.methods['Kuwait'] = { fajr: 18, isha: 17 };
  praytime.methods['Qatar'] = { fajr: 18, isha: '90 min' };
  praytime.methods['JAKIM'] = { fajr: 18, isha: 18 };
  praytime.methods['DIYANET'] = { fajr: 18, isha: 17 };
  praytime.methods['ISNA8'] = { fajr: 8, isha: 8 };
  praytime.methods['Turkey'] = { fajr: 18, isha: 17 };
}

function parseTime12h(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
}

function getCurrentPrayer(times) {
  const now = new Date();
  let current = null;
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time <= now) current = name;
  }
  return current;
}

function getNextPrayer(times) {
  const now = new Date();
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time > now) {
      const diffMin = Math.ceil((time - now) / 60000);
      return { name, diffMin };
    }
  }
  return null;
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
