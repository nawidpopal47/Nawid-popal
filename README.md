# Juicy Kabob website

One-page site for [@juicykabob__](https://www.tiktok.com/@juicykabob__). Plain HTML, no build step.

```
index.html     the whole site (styles and script inline)
images/        photos, cropped from the TikTok profile
js/motion.js   all animation (GSAP + ScrollTrigger + SplitText, Lenis smooth scroll)
vendor/        those libraries, self-hosted
```

Animation turns off for visitors with "reduce motion" set. To remove it, delete the five `<script>` tags above `</body>` that load `vendor/` and `js/motion.js`.

## Before going live

- **Menu**: the dishes in `index.html` (search `MENU:`) are a draft. Confirm names, add prices, fix the chip counts.
- **Hours**: each location card says "Call for today's hours". Swap in real hours (search `LOCATIONS:`).
- **Photos**: the images are low-res TikTok thumbnails. Replace the files in `images/` with real photos, keeping the same names.
- **Phones**: West Hills uses (702) 302-6493 and Las Vegas uses (702) 675-6283, as shown on the TikTok profile. Change them in the `LOCS` object in the script and in the location cards and footer.

## Publish

GitHub Pages: repo **Settings → Pages → Deploy from branch**, pick the branch and `/ (root)`.
Netlify Drop also works: drag the folder onto app.netlify.com/drop.
