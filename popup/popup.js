const praytime = new PrayTime();
setupPrayTime(praytime);

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
      times = praytime
        .method(settings.method)
        .location([settings.lat, settings.lng])
        .timezone(settings.timezone)
        .adjust({ maghrib: settings.maghrib, asr: settings.asr })
        .format('12h')
        .getTimes();
      current = getCurrentPrayer(times);
      next = getNextPrayer(times);
    }

    locationEl.textContent = settings.city;

    contentEl.innerHTML = '';

    for (const name of PRAYER_NAMES) {
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
