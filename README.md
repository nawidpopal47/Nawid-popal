# Majlis website concept

A demo website for **Majlis**, an Afghan banquet hall and catering kitchen in Union City, CA ([@majlisuc](https://www.instagram.com/majlisuc/)).

It's a static site with no build step and no dependencies, so it runs as is on GitHub Pages.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: photo hero, availability check, gallery, celebrations, packages, catering, floor plans, FAQ, map |
| `menu.html` | Full catering menu. Guests tap "Add to menu" and the dishes carry into their request |
| `plan.html` | 4-step pricing and availability request with a live summary |

Every page has a "Schedule a Tour" sheet where guests pick a day and time.

## Publish on GitHub Pages

1. On GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch with this site and the `/ (root)` folder, then save.
4. The site goes live at `https://nawidpopal47.github.io/Nawid-popal/` within a minute or two.

## Photos

The site ships with stand-in photos from the [Open Images](https://storage.googleapis.com/openimages/web/index.html) dataset. Their photographers shared them on Flickr under [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), and `credits.html` credits each one, as the license requires.

To use real Majlis photos, replace the file in `assets/photos/` with the same name. Landscape photos about 2000px wide work best. When every stand-in is replaced, delete `credits.html` and the "Photo credits" line in the footer.

| File | Shot |
| --- | --- |
| `hero-1.jpg` | Wide shot of the hall, set for an event |
| `hero-2.jpg` | Henna night |
| `hero-3.jpg` | Afghan food spread |
| `intro-1.jpg` | Hall interior, tall shot |
| `intro-2.jpg` | Table setting detail |
| `gallery-1.jpg` to `gallery-8.jpg` | Banquet setup, henna, palaw, centerpieces, dance floor, rice and kabab, chai service, table settings |
| `event-*.jpg` | One per celebration card: henna, engagement, nikkah, wedding, aqiqa, birthday, eid, community |
| `catering-1.jpg` | Close-up of Kabuli palaw or mantu |
| `cta.jpg` | Evening shot of the hall, lights on |

## Confirm with Majlis before launch

These details came from public listings and still need Majlis to confirm them:

- Address (32140 Alvarado Blvd, Union City, CA 94587) and phone ((510) 574-6273)
- Capacity of 150, 2026 renovation, outside caterers allowed, ADA access, Wi-Fi
- Halal kitchen, menu items, package inclusions and tour times
- The henna night vendor credits and the TikTok like count

## Inquiry forms

The forms run in demo mode and show a confirmation screen without sending anything. To receive real inquiries, create a free [Formspree](https://formspree.io) form and paste its URL into `data-endpoint=""` on the `<form id="plan-form">` tag in `plan.html`.
