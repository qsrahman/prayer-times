# Prayer Times — Chrome Extension

Chrome extension (Manifest V3) that displays daily Islamic prayer times with configurable location, calculation method, and notifications.

## Architecture

```
prayer-times/
├── manifest.json
├── background/
│   └── service-worker.js   # Alarms, badge countdown, notifications, settings sync
├── popup/
│   ├── popup.html           # Prayer times display
│   ├── popup.css            # Design system (CSS variables, dark mode)
│   └── popup.js             # Renders prayer list from service worker data
├── options/
│   ├── options.html         # Settings form (location, method, notifications, theme)
│   ├── options.css          # Matches popup design system
│   └── options.js           # Load/save settings via chrome.storage.sync
├── lib/
│   └── prayer-times.js      # Third-party prayer time calculation library (DO NOT MODIFY)
└── icons/
    └── icon-{16,32,48,128}.png  # Sized PNGs generated from images/small-mosque.png
```

## Key Conventions

### Settings schema (`chrome.storage.sync`)

All settings stored under a single `"settings"` key:

```js
{
  city: string,           // Known city name or "Custom"
  lat: number,            // Latitude
  lng: number,            // Longitude
  timezone: number,       // UTC offset (e.g. 5 for Pakistan)
  method: string,         // Calculation method (Karachi, MWL, ISNA, etc.)
  asr: string,            // "Standard" or "Hanafi"
  maghrib: string,        // Adjustment e.g. "4 min"
  notifications: boolean, // Enable/disable prayer notifications
  notifyMinutes: number,  // Minutes before prayer to notify (5/10/15/20/30)
  theme: string           // "system" | "light" | "dark"
}
```

### Message passing

Popup and options communicate with the service worker via `chrome.runtime.sendMessage`:

| Message type | Direction | Purpose |
|---|---|---|
| `getPrayerData` | popup → SW | Returns `{ times, current, next, settings }` |
| `saveSettings` | options → SW | Persists settings, resets notifications, updates badge |

### Design system

CSS variables in `popup/popup.css` and `options/options.css`. Dark mode via:
- `prefers-color-scheme: dark` (OS default)
- `data-theme="dark"` attribute on `<html>` (manual override)
- `data-theme="light"` suppresses OS dark mode

Both files must stay in sync when adding/changing variables.

### Icons

All icon files referenced in `manifest.json` MUST exist at the correct pixel dimensions. Generated from `images/small-mosque.png` (512×512) using macOS `sips`:

```bash
sips -z {size} {size} images/small-mosque.png --out icons/icon-{size}.png
```

Notification icon URLs MUST use `chrome.runtime.getURL()` — relative paths resolve from the service worker's directory, not the extension root.

## Rules

1. **Never modify `lib/prayer-times.js`** — it's a third-party library.
2. **Always Manifest V3** — no V2 APIs (`chrome.browserAction`, `chrome.tabs.executeScript`, etc.).
3. **Service worker is ephemeral** — no global state variables. Use `chrome.storage`.
4. **Notification `iconUrl`** — always use `chrome.runtime.getURL('icons/icon-128.png')`, never a relative path.
5. **CSS variables** — use `--color-*` tokens, never hardcode colors in popup/options CSS.
6. **Dark mode** — always define variables in both `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]` blocks.
7. **Async/await** — no `.then()` chains.
8. **`return true`** in `onMessage` listeners that send async responses.

## Loading for Development

1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select the `prayer-times/` directory
4. The extension icon appears in the toolbar; click to open popup
5. Right-click → "Options" to open settings page

No build step required. No dependencies to install.

## Chrome Web Store

See `CHROMEWEBSTORE.md` (if present) for listing metadata, permissions justifications, and publishing checklist.
