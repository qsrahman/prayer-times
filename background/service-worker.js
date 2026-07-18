importScripts('../lib/prayer-times.js');

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
};

function getUTCOffset(ianaTimezone) {
  const now = new Date();
  const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = now.toLocaleString('en-US', { timeZone: ianaTimezone });
  return (new Date(tzStr) - new Date(utcStr)) / (60 * 60 * 1000);
}

async function getSettings() {
  const stored = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
}

function calcTimes(settings) {
  prayTimes.setMethod(settings.method);
  prayTimes.adjust({ maghrib: settings.maghrib, asr: settings.asr });
  const offset = getUTCOffset(settings.timezone);
  return prayTimes.getTimes(
    new Date(),
    [settings.lat, settings.lng],
    offset,
    0,
    '12h'
  );
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

function getNextPrayer(times) {
  const now = new Date();
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time > now) {
      const diffMs = time - now;
      const diffMin = Math.ceil(diffMs / 60000);
      return { name, time, diffMin };
    }
  }
  return null;
}

function getCurrentPrayer(times) {
  const now = new Date();
  let current = null;
  for (const name of PRAYER_NAMES) {
    const time = parseTime12h(times[name.toLowerCase()]);
    if (time && time <= now) {
      current = name;
    }
  }
  return current;
}

async function updateBadge() {
  try {
    const settings = await getSettings();
    const times = calcTimes(settings);
    const next = getNextPrayer(times);

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

async function checkNotifications() {
  try {
    const settings = await getSettings();
    if (!settings.notifications) return;

    const times = calcTimes(settings);
    const next = getNextPrayer(times);

    if (next && next.diffMin === settings.notifyMinutes) {
      const { notifiedPrayers = [] } = await chrome.storage.session.get('notifiedPrayers');

      if (!notifiedPrayers.includes(next.name)) {
        await chrome.notifications.create(`prayer-${next.name}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
          title: `${next.name} in ${next.diffMin} minutes`,
          message: `Prayer time is approaching. Prepare for ${next.name}.`,
          priority: 2,
        });

        await chrome.storage.session.set({
          notifiedPrayers: [...notifiedPrayers, next.name],
        });
      }
    }

    if (next && next.diffMin === 1) {
      await chrome.notifications.create(`prayer-now-${next.name}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: `${next.name} time`,
        message: `It is now time for ${next.name} prayer.`,
        priority: 2,
      });
    }
  } catch (err) {
    console.error('Notification check failed:', err);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.sync.get('settings');
  if (!settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
  await chrome.alarms.create('prayer-check', { periodInMinutes: 1 });
  await updateBadge();
});

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
        const times = calcTimes(settings);
        const current = getCurrentPrayer(times);
        const next = getNextPrayer(times);
        sendResponse({ times, current, next, settings });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'saveSettings') {
    (async () => {
      await chrome.storage.sync.set({ settings: message.settings });
      await chrome.storage.session.set({ notifiedPrayers: [] });
      await updateBadge();
      sendResponse({ ok: true });
    })();
    return true;
  }
});
