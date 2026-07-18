# Prayer Times

A Chrome extension (Manifest V3) that displays daily Islamic prayer times with configurable location, calculation method, and notifications.

## Features

- **Prayer Times Display** — Shows all 6 daily prayers (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) with current/next highlighting
- **Countdown Timer** — Live countdown to the next prayer in the popup footer
- **Badge Countdown** — Extension icon badge shows time remaining (green >30m, orange <30m, red <5m)
- **Notifications** — Configurable pre-prayer reminders (5/10/15/20/30 minutes before) and prayer-time alerts
- **18 Preset Cities** — Islamabad, Karachi, Mecca, Dubai, Istanbul, London, New York, and more
- **Custom Coordinates** — Enter any latitude, longitude, and IANA timezone
- **13 Calculation Methods** — Karachi, MWL, ISNA, Egypt, Gulf, Kuwait, Qatar, Tehran, JAKIM, Diyanet, Turkey, ISNA8, and others
- **Asr & Maghrib Adjustments** — Standard/Hanafi Asr, 0-5 minute Maghrib offset
- **Dark Mode** — System default, manual light, or manual dark

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `prayer-times/` directory
6. The extension icon appears in your toolbar

### From Chrome Web Store

*Coming soon*

## Usage

1. Click the extension icon in the toolbar to open the popup
2. View today's prayer times with the current prayer highlighted
3. See the countdown to the next prayer at the bottom
4. Click the gear icon to open Settings

### Settings

| Section | Options |
|---------|---------|
| **Location** | City dropdown or custom lat/lng/timezone |
| **Calculation** | Method, Asr type, Maghrib adjustment |
| **Appearance** | Theme (system/light/dark) |
| **Notifications** | Enable/disable, reminder timing |

## Architecture

```
prayer-times/
├── manifest.json              # Extension manifest (MV3)
├── background/
│   └── service-worker.js      # Alarms, badge, notifications, settings sync
├── popup/
│   ├── popup.html             # Prayer times display
│   ├── popup.css              # Design system (CSS variables, dark mode)
│   └── popup.js               # Renders prayer list from storage/service worker
├── options/
│   ├── options.html           # Settings form
│   ├── options.css            # Matching design system
│   └── options.js             # Load/save settings via messaging
├── lib/
│   ├── praytime.js        # Third-party prayer calculation (DO NOT MODIFY)
│   └── shared.js              # Shared constants and utility functions
├── icons/
│   └── icon-{16,32,48,128}.png
└── images/
    └── small-mosque.png       # Source icon (512×512)
```

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Persist settings in `chrome.storage.sync` |
| `alarms` | Badge countdown updates every minute |
| `notifications` | Pre-prayer and prayer-time alerts |

## Settings Schema

All settings stored under a single `"settings"` key:

```js
{
  city: string,           // Preset city name or "Custom"
  lat: number,            // Latitude
  lng: number,            // Longitude
  timezone: string,       // IANA timezone (e.g. "Asia/Karachi")
  method: string,         // Calculation method
  asr: string,            // "Standard" or "Hanafi"
  maghrib: string,        // e.g. "4 min"
  notifications: boolean, // Enable/disable notifications
  notifyMinutes: number,  // Minutes before prayer (5/10/15/20/30)
  theme: string           // "system" | "light" | "dark"
}
```

## Development

No build step required. No dependencies to install.

1. Make changes to source files
2. Go to `chrome://extensions`
3. Click the reload button on the extension card
4. Test in the popup or options page

### Key Conventions

- **Never modify `lib/praytime.js`** — third-party library
- **Shared code in `lib/shared.js`** — `PRAYER_NAMES`, `DEFAULT_SETTINGS`, custom methods, `parseTime12h()`, `getCurrentPrayer()`, `getNextPrayer()`, `applyTheme()`
- **Manifest V3 only** — no V2 APIs
- **Service worker is ephemeral** — use `chrome.storage`, no global state
- **Notification `iconUrl`** — always use `chrome.runtime.getURL()`, not relative paths
- **CSS variables** — use `--color-*` tokens, never hardcode colors
- **Dark mode** — define variables in both `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`
- **Async/await** — no `.then()` chains
- **`return true`** — in `onMessage` listeners with async responses

## Author

Qazi Sami ur Rahman

## License

MIT
