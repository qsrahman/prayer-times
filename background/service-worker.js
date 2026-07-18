importScripts('../lib/praytime.js', '../lib/shared.js');

async function getSettings() {
  const stored = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
}

function calcTimes(settings) {
  return praytime
    .method(settings.method)
    .location([settings.lat, settings.lng])
    .timezone(settings.timezone)
    .adjust({ maghrib: settings.maghrib, asr: settings.asr })
    .format('12h')
    .getTimes();
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

    if (next && next.diffMin <= settings.notifyMinutes) {
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

    if (next && next.diffMin <= 1) {
      const { prayedPrayers = [] } = await chrome.storage.session.get('prayedPrayers');

      if (!prayedPrayers.includes(next.name)) {
        await chrome.notifications.create(`prayer-now-${next.name}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
          title: `${next.name} time`,
          message: `It is now time for ${next.name} prayer.`,
          priority: 2,
        });

        await chrome.storage.session.set({
          prayedPrayers: [...prayedPrayers, next.name],
        });
      }
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
      await chrome.storage.session.set({ notifiedPrayers: [], prayedPrayers: [] });
      await updateBadge();
      sendResponse({ ok: true });
    })();
    return true;
  }
});

const praytime = new PrayTime();
setupPrayTime(praytime);
