# Chrome Web Store Listing — Prayer Times

> Last Updated: 2026-09-30

## Store Listing

**Extension Name** [REQUIRED]
Prayer Times


**Short Description** [REQUIRED] — 127/132 characters
See today's prayer times at a glance with a live countdown, toolbar badge, and optional reminders so you never miss a prayer.


**Detailed Description** [REQUIRED]

See today's prayer times at a glance, with a live countdown so you always know how long until the next prayer begins.

FEATURES
• All six daily prayers — Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha — with the current prayer highlighted
• Live countdown in the popup showing exactly how long until the next prayer
• Toolbar badge showing the time remaining at all times, without opening the popup
• Optional reminders a set number of minutes before each prayer, plus an alert when the prayer begins
• 18 preset cities across Pakistan, Saudi Arabia, the Gulf, Turkey, Egypt, Southeast Asia, the UK, and North America
• Custom location — enter any city in the world by coordinates
• 13 calculation methods, including the regional standards used in Pakistan, Saudi Arabia, Kuwait, Qatar, Malaysia, Turkey, Egypt, and the US
• Standard or Hanafi Asr calculation
• Adjustable Maghrib offset for local sunset customs
• Light, dark, or system-matched theme

HOW TO USE
1. Click the extension icon in the toolbar to see today's prayer times
2. Check the countdown at the bottom to see how long until the next prayer
3. To change your city, calculation method, or reminders, click the gear icon in the popup
4. Pin the extension to your toolbar to keep the countdown badge visible at all times

PRIVACY
Your prayer times are calculated entirely on your device. This extension has no servers and makes no network requests of any kind. It never reads your browsing history, page content, or any website data.

Your settings — city, coordinates, calculation method, and theme — are saved in Chrome's synced storage, which means they are stored on Google's servers so they can follow you to other devices signed into the same Chrome account. You can disable this by not signing into Chrome, and you can clear your data at any time from the extension's options page.

No data is sold, rented, or shared with third parties.

PERMISSIONS
• Storage — Remembers your city, calculation method, and theme between sessions, and keeps them in sync across your devices
• Alarms — Refreshes the countdown on your toolbar icon once a minute so the time remaining stays accurate
• Notifications — Reminds you a chosen number of minutes before each prayer, and again when the prayer begins

SUPPORT
Found a bug or have a suggestion? Open an issue at
https://github.com/qsrahman/prayer-times/issues
or email qsrahmans@gmail.com

Version 0.2.0 — Added a live countdown badge on the toolbar icon, 18 city
presets, 13 calculation methods, and configurable prayer reminders.


**Category** [REQUIRED]
Productivity

<!-- Note: the CWS category list has no dedicated "Lifestyle" or "Religion"
     option. "Productivity" is the closest fit for a scheduled-reminder
     utility. Revisit if the dashboard offers a better category. -->


**Single Purpose** [REQUIRED]
Displays today's Islamic prayer times and alerts the user before each prayer begins.


**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes

The popup is only 320px wide, so capture at 1280×800 and the popup will appear
small. Two options that work well in practice:

- **Option A** — Open the options page (full browser tab, fills the frame) and
  screenshot that. Shows city, method, and reminder settings all at once.
- **Option B** — Capture the popup against a plain background at 640×400 and
  crop. Shows the actual product the user interacts with daily.

Recommended set:
1. Popup in light mode — prayer list with the current prayer highlighted
2. Popup in dark mode — demonstrates the theme feature
3. Options page — city dropdown expanded, showing the 18 presets
4. Toolbar with badge visible — shows the countdown feature in context

Do not include the full browser UI (URL bar, tabs) in screenshots. Chrome crops
or rejects those.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Saves the user's selected city, coordinates, timezone, calculation method, and theme so they persist between browser sessions instead of resetting on every launch. Without it, every popup open would show default settings and the user would have to reconfigure the extension. This permission also provides the sync capability, which lets users set up the extension once and have their configuration follow them to other devices on the same Chrome account. |
| `alarms` | permissions | Drives the once-a-minute refresh of the countdown shown on the toolbar icon badge. The badge must stay accurate for the countdown to be useful, which requires a recurring timer. This is the only way to keep a live countdown running without the user having the popup open. The extension reads no browsing data as part of this — the timer only recalculates prayer times from the user's own saved coordinates. |
| `notifications` | permissions | Delivers the prayer reminders the user explicitly opts into from the options page. Users choose a lead time (5, 10, 15, 20, or 30 minutes) and receive an alert that many minutes before each prayer, plus an alert when the prayer time begins. Without this permission the reminder feature cannot function. Notifications are disabled by default in the sense that the user must enable them in settings. |

**No `host_permissions`** — the extension requests no access to any website.
**No `tabs`, `webRequest`, `cookies`, `history`, or `identity`** permissions.

Verified: the codebase contains no `fetch()`, `XMLHttpRequest`, `WebSocket`,
or `sendBeacon` calls. All prayer time computation is local.


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

The extension stores the user's chosen location and preferences. Because these
are saved with Chrome's sync feature, they are transmitted to Google and stored
on Google's servers. This must be declared accurately — a mismatch between this
form and the privacy policy is a common rejection cause.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | — |
| Health info | No | No | — | — |
| Financial info | No | No | — | — |
| Authentication info | No | No | — | — |
| Personal communications | No | No | — | — |
| **Location** | **Yes** | **Yes** | The user's city name and latitude/longitude, used to calculate prayer times for that location. Stored in synced storage so settings follow the user across devices. | No |
| Web history | No | No | — | — |
| User activity | No | No | — | — |
| Website content | No | No | — | — |

**Exactly what is stored and synced:**

| Field | Example | Why |
|-------|---------|-----|
| `city` | `Karachi` | Display label and city preset lookup |
| `lat`, `lng` | `24.8607`, `67.0011` | Required inputs for prayer time calculation |
| `timezone` | `Asia/Karachi` | Required for converting UTC to local time |
| `method` | `Karachi` | Calculation method selection |
| `asr` | `Hanafi` | Asr shadow-length convention |
| `maghrib` | `4 min` | Local sunset offset adjustment |
| `notifications` | `true` | Whether the user wants reminders |
| `notifyMinutes` | `10` | The user's chosen lead time |
| `theme` | `system` | Light/dark preference |

**Stored locally only** (`chrome.storage.session`, cleared when the browser closes):
a short list of prayer names already notified, to prevent duplicate alerts. This
contains no personal data and never leaves the device.

**Never collected:** browsing history, page content, URLs, tabs, keystrokes,
cookies, or any website data. The extension has no host permissions and cannot
read any page.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [REQUIRED] — must be live before submission

Suggested: publish `PRIVACY.md` from this repo via GitHub Pages, e.g.
`https://qsrahman.github.io/prayer-times/privacy.html`

A draft policy covering synced-storage disclosure is required. Key points it must
state to stay consistent with the disclosure form above:

- No network requests; all prayer time calculation happens on device
- Location coordinates are stored in Chrome's synced storage and therefore
  transmitted to Google — this is the one piece of user data that leaves the device
- No data sold or shared with third parties
- No cookies, no analytics, no third-party services
- Users can clear all stored data by clearing extension storage or uninstalling
- Contact email for privacy questions: qsrahmans@gmail.com

⚠️ **A dead or unlisted URL causes automatic submission rejection.** Verify the
page returns 200 without a login before submitting.


## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
Qazi Sami ur Rahman

**Contact Email** [REQUIRED]
qsrahmans@gmail.com

**Support URL / Email** [RECOMMENDED]
https://github.com/qsrahman/prayer-times/issues
qsrahmans@gmail.com

**Homepage URL** [RECOMMENDED]
https://github.com/qsrahman/prayer-times


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.2.0 | 2026-09-30 | Live toolbar badge countdown, 18 city presets, 13 calculation methods (added Gulf, Kuwait, Qatar, JAKIM, Diyanet, ISNA8, Turkey), prayer-time notifications, dark mode, IANA timezone support | Draft |
| 0.1.0 | — | Initial popup with 6 prayer times, city selection, calculation method, pre-prayer notifications | Unpublished |


## Review Notes

### Known Issues / Limitations

- **Badge precision** — The toolbar badge updates once a minute, so it can be up to
  ~60 seconds behind. This is a Chrome scheduling limit, not a bug.
- **Prayer time accuracy** — Times are calculated astronomically and can differ
  from your local mosque by 1–3 minutes. Users can adjust the Maghrib offset to
  compensate. This is worth noting in the listing to preempt "times don't match
  my mosque" feedback.
- **Reminder reliability** — Reminders fire on a once-a-minute timer. If the
  browser is closed or the device suspended at the prayer time, no notification
  is delivered. Worth a line in the description if reviewers test this.
- **No offline caching** — Not applicable. The extension makes no network calls,
  so it works fully offline by design.

### Pre-Submission Checklist

- [x] `manifest_version: 3`
- [x] All icon files exist at correct dimensions (16/32/48/128 verified)
- [x] `action` key present in manifest
- [x] No `eval()` / `new Function()`
- [x] No inline scripts or event handlers
- [x] `async/await` throughout, no `.then()` chains
- [x] No global mutable state in the service worker
- [x] Notification `iconUrl` resolves to a real file
- [x] `return true` in async `onMessage` listeners
- [x] No `host_permissions` declared
- [x] No network calls anywhere in the codebase
- [x] Privacy policy draft content specified
- [x] Contact email added (qsrahmans@gmail.com)
- [ ] Privacy policy URL live and returning 200
- [ ] At least 1 screenshot at 1280×800 or 640×400
- [ ] Version number bumped if resubmitting after fixes
- [ ] ZIP excludes `.git/`, `CHROMEWEBSTORE.md`, and any local files

### Rejection History

| Date | Reason | Fix Applied | Resubmitted |
|------|--------|-------------|-------------|
| — | — | — | — |
