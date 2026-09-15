# Wedding Invitation — standalone

A self-contained wedding invitation page. Plain HTML + CSS with vanilla JS for the
scroll animation, countdown and confetti. No framework, no build step, no admin,
no database.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve wedding-invitation
```

(Opening the file directly works too; the fonts and 3D cake load fine from `file://`.)

## Files

```
wedding-invitation/
├── index.html        all page content — edit the text here
├── css/styles.css    all styling
├── js/main.js        scroll reveal, countdown, confetti, links, RSVP
├── js/cake3d.js      the rotating 3D cake (three.js from CDN)
└── fonts/            Kostic Serif + Montserrat (self-hosted)
```

## Editing the invitation

Everything is plain text in `index.html`:

| What | Where |
| --- | --- |
| Wedding date/time (drives countdown, calendar link, RSVP deadline) | `data-wedding-date` on `<body>` — keep the `+03:00` offset so the countdown is right for guests abroad |
| Venue text / Maps fallback search | `data-venue-query` on `<body>` |
| Exact Maps destination | `data-venue-map-url` on `<body>` (a Google share link) |
| Couple names | `#rn` heading and the badge `M & L` |
| Invitation message | `.invitation-copy` |
| Love story entries | `.timeline-item` blocks |
| Program entries | `.program-item` blocks |
| Venue cards, IBAN, footer | the matching sections |

Dates rendered as "Sunday, November 8, 2026" and the RSVP deadline
(30 days before the wedding) are filled in automatically from `data-wedding-date`,
always formatted in Addis Ababa time (`VENUE_TZ` in `js/main.js`).
The Ethiopian calendar date and the 8:00 local reading are plain text in the
"Date & Time" card.

Colors and spacing live in the `:root` block at the top of `css/styles.css`.
Set `--radius-md` / `--radius-lg` / `--radius-full` to non-zero values if you want
rounded corners instead of the current square look.

## RSVP form

There is no server in this version. Submissions show a thank-you message and are
stored in the visitor's own `localStorage` only. To collect responses, point the
submit handler in `js/main.js` at a form service (Formspree, Google Forms, your own
endpoint) — the handler is marked with a comment.

## Offline / no-CDN use

Two things load from the network:

- **Great Vibes** (names) and **Noto Sans Ethiopic** (Amharic) from Google Fonts
- **three.js** from cdnjs, for the 3D cake

Without a connection the names fall back to the serif face, Amharic falls back to a
system Ethiopic font, and the cake shows a cake emoji; everything else works offline.
