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
  let h = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(match[2], 10);
}

// Current date and time-of-day in the settings timezone (not the browser's),
// since prayer times are computed for that zone.
function nowInZone(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, +value]));
  return {
    date: [p.year, p.month, p.day],
    minutes: p.hour * 60 + p.minute + p.second / 60,
  };
}

function getCurrentPrayer(times, nowMin) {
  let current = null;
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time !== null && time <= nowMin) current = name;
  }
  return current;
}

// Falls back to tomorrow's first prayer once today's are all past.
function getNextPrayer(times, nowMin, tomorrowTimes) {
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time !== null && time > nowMin) {
      return { name, diffMin: Math.ceil(time - nowMin) };
    }
  }
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(tomorrowTimes[name.toLowerCase()]);
    if (time !== null) {
      return { name, diffMin: Math.ceil(1440 - nowMin + time) };
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
