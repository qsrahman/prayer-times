const CITIES = {
  Islamabad: { lat: 33.6995, lng: 73.0363, timezone: 'Asia/Karachi' },
  Karachi: { lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi' },
  Lahore: { lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi' },
  Peshawar: { lat: 34.0151, lng: 71.5249, timezone: 'Asia/Karachi' },
  Quetta: { lat: 30.1798, lng: 66.975, timezone: 'Asia/Karachi' },
  Riyadh: { lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  Jeddah: { lat: 21.4858, lng: 39.1925, timezone: 'Asia/Riyadh' },
  Mecca: { lat: 21.3891, lng: 39.8579, timezone: 'Asia/Riyadh' },
  Medina: { lat: 24.5247, lng: 39.5691, timezone: 'Asia/Riyadh' },
  Dubai: { lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai' },
  Istanbul: { lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  Cairo: { lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  'Kuala Lumpur': { lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  Jakarta: { lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  London: { lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  'New York': { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
  Toronto: { lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
};

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

const form = document.getElementById('settings-form');
const citySelect = document.getElementById('city');
const customCoords = document.getElementById('custom-coords');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const timezoneInput = document.getElementById('timezone');
const methodSelect = document.getElementById('method');
const asrSelect = document.getElementById('asr');
const maghribSelect = document.getElementById('maghrib');
const notificationsCheckbox = document.getElementById('notifications');
const notifyMinutesSelect = document.getElementById('notify-minutes');
const themeSelect = document.getElementById('theme');
const saveStatus = document.getElementById('save-status');

function showStatus(message) {
  saveStatus.textContent = message;
  saveStatus.classList.add('visible');
  setTimeout(() => saveStatus.classList.remove('visible'), 2000);
}

function toggleCustomCoords() {
  const isCustom = citySelect.value === 'Custom';
  customCoords.hidden = !isCustom;

  if (!isCustom) {
    const coords = CITIES[citySelect.value];
    if (coords) timezoneInput.value = coords.timezone;
  }
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get('settings');
  const settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };

  const isKnownCity = CITIES[settings.city];
  if (isKnownCity) {
    citySelect.value = settings.city;
  } else {
    citySelect.value = 'Custom';
    latInput.value = settings.lat;
    lngInput.value = settings.lng;
  }

  timezoneInput.value = settings.timezone || 'Asia/Karachi';
  toggleCustomCoords();

  methodSelect.value = settings.method;
  asrSelect.value = settings.asr;
  maghribSelect.value = settings.maghrib;
  notificationsCheckbox.checked = settings.notifications;
  notifyMinutesSelect.value = String(settings.notifyMinutes);
  themeSelect.value = settings.theme || 'system';
  applyTheme(settings.theme || 'system');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let lat, lng, city;

  if (citySelect.value === 'Custom') {
    city = 'Custom';
    lat = parseFloat(latInput.value);
    lng = parseFloat(lngInput.value);

    if (isNaN(lat) || isNaN(lng)) {
      showStatus('Please fill in all coordinate fields');
      return;
    }
  } else {
    city = citySelect.value;
    const coords = CITIES[city];
    lat = coords.lat;
    lng = coords.lng;
  }

  const timezone = timezoneInput.value.trim();
  if (!timezone || !timezone.includes('/')) {
    showStatus('Please enter a valid IANA timezone (e.g. Asia/Karachi)');
    return;
  }

  const settings = {
    city,
    lat,
    lng,
    timezone,
    method: methodSelect.value,
    asr: asrSelect.value,
    maghrib: maghribSelect.value,
    notifications: notificationsCheckbox.checked,
    notifyMinutes: parseInt(notifyMinutesSelect.value, 10),
    theme: themeSelect.value,
  };

  applyTheme(settings.theme);
  await chrome.runtime.sendMessage({ type: 'saveSettings', settings });
  showStatus('Settings saved');
});

citySelect.addEventListener('change', toggleCustomCoords);
themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));

loadSettings();
