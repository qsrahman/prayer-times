const PRAYER_LIST = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const DEFAULT_SETTINGS = {
  city: 'Islamabad',
  lat: 33.6995,
  lng: 73.0363,
  method: 'Karachi',
  asr: 'Hanafi',
  maghrib: '4 min',
  timezone: 5,
  theme: 'system',
};

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  for (const name of PRAYER_LIST) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time <= now) current = name;
  }
  return current;
}

function getNextPrayer(times) {
  const now = new Date();
  for (const name of PRAYER_LIST) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time > now) {
      const diffMin = Math.ceil((time - now) / 60000);
      return { name, diffMin };
    }
  }
  return null;
}

function showError(message) {
  const content = document.getElementById('content');
  content.innerHTML = '';
  const el = document.createElement('p');
  el.className = 'error-message';
  el.textContent = message;
  content.appendChild(el);
}

async function init() {
  const dateEl = document.getElementById('date');
  const locationEl = document.getElementById('location');
  const contentEl = document.getElementById('content');
  const countdownEl = document.getElementById('countdown');
  const settingsBtn = document.getElementById('settings-btn');

  dateEl.textContent = formatDate(new Date());

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  const stored = await chrome.storage.sync.get('settings');
  const storedSettings = stored.settings || {};
  applyTheme(storedSettings.theme || 'system');

  try {
    let data;

    if (chrome.runtime?.sendMessage) {
      data = await chrome.runtime.sendMessage({ type: 'getPrayerData' });
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    let times, current, next, settings;

    if (data?.times) {
      times = data.times;
      current = data.current;
      next = data.next;
      settings = data.settings;
    } else {
      settings = DEFAULT_SETTINGS;
      prayTimes.setMethod(settings.method);
      prayTimes.adjust({ maghrib: settings.maghrib, asr: settings.asr });
      times = prayTimes.getTimes(
        new Date(),
        [settings.lat, settings.lng],
        settings.timezone,
        0,
        '12h'
      );
      current = getCurrentPrayer(times);
      next = getNextPrayer(times);
    }

    locationEl.textContent = settings.city;

    contentEl.innerHTML = '';

    for (const name of PRAYER_LIST) {
      const row = document.createElement('div');
      row.className = 'prayer-row';

      if (name === current) row.classList.add('prayer-row--active');
      if (next && name === next.name) row.classList.add('prayer-row--next');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'prayer-name';
      nameSpan.textContent = name;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'prayer-time';
      timeSpan.textContent = times[name.toLowerCase()];

      row.appendChild(nameSpan);
      row.appendChild(timeSpan);
      contentEl.appendChild(row);
    }

    if (next) {
      const h = Math.floor(next.diffMin / 60);
      const m = next.diffMin % 60;
      let text;
      if (next.diffMin <= 60) {
        text = `${next.diffMin}m until ${next.name}`;
      } else {
        text = m > 0 ? `${h}h ${m}m until ${next.name}` : `${h}h until ${next.name}`;
      }
      countdownEl.textContent = text;
    } else {
      countdownEl.textContent = 'All prayers passed for today';
    }
  } catch (err) {
    console.error('Failed to load prayer times:', err);
    showError('Could not load prayer times. Check your settings.');
  }
}

init();
