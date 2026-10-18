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

## Adding photos

Each photo slot shows a label with the shot that belongs there. Add a JPG to `assets/photos/` with the matching name and it replaces the label on its own, with no code changes. Landscape photos about 2000px wide work best.

| File | Shot |
| --- | --- |
| `hero-1.jpg` | Wide shot of the hall, set for an event |
| `hero-2.jpg` | Henna night stage with the couple |
| `hero-3.jpg` | Afghan food spread: palaw, kababs, mantu |
| `intro-1.jpg` | Hall interior, tall shot |
| `intro-2.jpg` | Table setting detail |
| `gallery-1.jpg` | Henna night, full room |
| `gallery-2.jpg` | Couple's stage and decor |
| `gallery-3.jpg` | Kabuli palaw and kababs |
| `gallery-4.jpg` | Dessert table |
| `gallery-5.jpg` | Dance floor |
| `gallery-6.jpg` | Banquet setup |
| `gallery-7.jpg` | Chai service |
| `gallery-8.jpg` | Engagement sweets |
| `event-henna.jpg` | Henna night |
| `event-engagement.jpg` | Engagement / shirini khori |
| `event-nikkah.jpg` | Nikkah ceremony |
| `event-wedding.jpg` | Wedding reception |
| `event-aqiqa.jpg` | Aqiqa / baby shower |
| `event-birthday.jpg` | Birthday or graduation |
| `event-eid.jpg` | Eid dinner or iftar |
| `event-community.jpg` | Community or corporate dinner |
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
