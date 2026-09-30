importScripts('../lib/praytime.js', '../lib/shared.js');

const praytime = new PrayTime();
setupPrayTime(praytime);

async function getSettings() {
  const stored = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
}

function calcTimes(settings, date) {
  return praytime
    .method(settings.method)
    .location([settings.lat, settings.lng])
    .timezone(settings.timezone)
    .adjust({ maghrib: settings.maghrib, asr: settings.asr })
    .format('12h')
    .times(date);
}

function getPrayerState(settings) {
  const now = nowInZone(settings.timezone);
  const [y, m, d] = now.date;
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1));

  const times = calcTimes(settings, now.date);
  const tomorrowTimes = calcTimes(settings, [
    tomorrow.getUTCFullYear(),
    tomorrow.getUTCMonth() + 1,
    tomorrow.getUTCDate(),
  ]);

  return {
    times,
    current: getCurrentPrayer(times, now.minutes),
    next: getNextPrayer(times, now.minutes, tomorrowTimes),
    dateKey: now.date.join('-'),
  };
}

async function updateBadge() {
  try {
    const { next } = getPrayerState(await getSettings());

    if (next) {
      const text = next.diffMin <= 60 ? `${next.diffMin}m` : `${Math.floor(next.diffMin / 60)}h`;
      await chrome.action.setBadgeText({ text });
      const color =
        next.diffMin <= 5 ? '#EF4444' : next.diffMin <= 30 ? '#F59E0B' : '#0D9488';
      await chrome.action.setBadgeBackgroundColor({ color });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (err) {
    console.error('Badge update failed:', err);
  }
}

// Session storage outlives a day, so dedupe ids are scoped to the current date.
async function notifyOnce(id, dateKey, { title, message }) {
  const { notified } = await chrome.storage.session.get('notified');
  const ids = notified?.date === dateKey ? notified.ids : [];
  if (ids.includes(id)) return;

  await chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title,
    message,
    priority: 2,
  });
  await chrome.storage.session.set({ notified: { date: dateKey, ids: [...ids, id] } });
}

async function checkNotifications() {
  try {
    const settings = await getSettings();
    if (!settings.notifications) return;

    const { next, dateKey } = getPrayerState(settings);
    if (!next || next.name === 'Sunrise') return;

    if (next.diffMin <= settings.notifyMinutes) {
      await notifyOnce(`prayer-${next.name}`, dateKey, {
        title: `${next.name} in ${next.diffMin} minutes`,
        message: `Prayer time is approaching. Prepare for ${next.name}.`,
      });
    }

    if (next.diffMin <= 1) {
      await notifyOnce(`prayer-now-${next.name}`, dateKey, {
        title: `${next.name} time`,
        message: `It is now time for ${next.name} prayer.`,
      });
    }
  } catch (err) {
    console.error('Notification check failed:', err);
  }
}

// Alarms aren't guaranteed to survive a browser restart, so recreate if missing.
async function start() {
  if (!(await chrome.alarms.get('prayer-check'))) {
    await chrome.alarms.create('prayer-check', { periodInMinutes: 1 });
  }
  await updateBadge();
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.sync.get('settings');
  if (!settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
  await start();
});

chrome.runtime.onStartup.addListener(start);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'prayer-check') {
    updateBadge();
    checkNotifications();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPrayerData') {
    (async () => {
      try {
        const settings = await getSettings();
        const { times, current, next } = getPrayerState(settings);
        sendResponse({ times, current, next, settings });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'saveSettings') {
    (async () => {
      try {
        await chrome.storage.sync.set({ settings: message.settings });
        await chrome.storage.session.remove('notified');
        await updateBadge();
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }
});
