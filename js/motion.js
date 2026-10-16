/* Juicy Kabob motion layer: GSAP + ScrollTrigger + SplitText + Lenis.
   Runs only when the head script set html.anim (motion allowed). Delete this file and the
   vendor <script> tags to turn all animation off; the page works the same without them. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('anim') || !window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.remove('anim', 'intro');
    return;
  }
  window.__jkAnim = true;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return gsap.utils.toArray(s); };

  function bail() {
    root.classList.remove('anim', 'intro');
    var l = $('.loader');
    if (l) l.remove();
    gsap.set('.hero-copy, .hero-photos', { clearProps: 'visibility' });
  }

  // Smooth scroll
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip')) return;
      var id = a.getAttribute('href');
      var el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(id === '#top' ? 0 : el, { offset: -72, duration: 1.4 });
    });
  }

  var fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]);

  // ---------- Loader: skewer loads up, counter runs, curtain lifts ----------
  function runLoader() {
    var loader = $('.loader');
    if (!root.classList.contains('intro') || !loader) return Promise.resolve();
    if (lenis) lenis.stop();
    return new Promise(function (resolve) {
      var count = loader.querySelector('.loader-count span');
      var n = { v: 0 };
      gsap.timeline({
        onComplete: function () {
          loader.remove();
          root.classList.remove('intro');
          try { sessionStorage.setItem('jk-intro', '1'); } catch (e) {}
          if (lenis) lenis.start();
        }
      })
        .from('.loader-stick', { scale: 0, transformOrigin: '0% 100%', duration: .5, ease: 'power3.out' }, 0)
        .from('.loader-piece', { x: 70, y: -70, opacity: 0, duration: .55, stagger: .17, ease: 'back.out(2.2)' }, .15)
        .from('.loader-word span', { yPercent: 110, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' }, .2)
        .to(n, { v: 100, duration: 1.25, ease: 'power2.inOut', onUpdate: function () { count.textContent = Math.round(n.v); } }, 0)
        .to('.loader-inner', { y: -50, opacity: 0, duration: .4, ease: 'power2.in' }, '+=.1')
        .add(resolve)
        .to(loader, { y: function () { return -(window.innerHeight + 60); }, duration: .95, ease: 'expo.inOut' }, '<');
    });
  }

  // ---------- Hero intro ----------
  function heroIntro() {
    gsap.set('.hero-copy, .hero-photos', { visibility: 'visible' });
    var juicy = SplitText.create('.t-juicy', { type: 'chars' });
    var kabob = SplitText.create('.t-kabob', { type: 'chars' });
    var pop = { yPercent: 90, rotation: 14, scale: .4, opacity: 0, duration: .85, stagger: .055, ease: 'back.out(2.4)', transformOrigin: '50% 100%' };

    return gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.header-inner', { y: -30, opacity: 0, duration: .7 }, 0)
      .from('.hero .eyebrow', { y: 16, opacity: 0, duration: .5 }, .05)
      .from(juicy.chars, pop, .1)
      .from(kabob.chars, pop, .32)
      .from('.ph', { y: 220, rotation: '+=22', opacity: 0, duration: 1.1, stagger: .12, ease: 'back.out(1.25)' }, .2)
      .from('.hero-fa [lang="fa"]', { scale: .2, rotation: -16, opacity: 0, duration: 1, ease: 'elastic.out(1, .5)' }, .65)
      .from('.hero-fa .gloss, .lead', { y: 22, opacity: 0, duration: .6, stagger: .08 }, .75)
      .from('.hero .cta-row > *', { y: 26, opacity: 0, duration: .6, stagger: .09, ease: 'back.out(1.8)' }, .9)
      .from('.proof', { y: 18, opacity: 0, duration: .6 }, 1.05)
      .from('.sticker', { scale: 0, rotation: -50, duration: 1.1, ease: 'elastic.out(1, .45)' }, 1)
      .from('.action-bar', { yPercent: 130, duration: .7 }, .95);
  }

  // ---------- Everything tied to scroll ----------
  function scrollScenes() {
    // Hero drifts apart as it leaves
    var heroOut = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-photos', { yPercent: 16, ease: 'none', scrollTrigger: heroOut });
    gsap.to('.hero-title', { yPercent: -14, ease: 'none', scrollTrigger: heroOut });

    // Photos follow the mouse at different depths
    if (fine) {
      var depth = [5, 9, 7, 18];
      var layers = $$('.ph, .sticker').map(function (el, i) {
        return {
          x: gsap.quickTo(el, 'xPercent', { duration: .9, ease: 'power3' }),
          y: gsap.quickTo(el, 'yPercent', { duration: .9, ease: 'power3' }),
          d: depth[i] || 6
        };
      });
      $('.hero').addEventListener('pointermove', function (e) {
        var r = this.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        layers.forEach(function (l) { l.x(nx * l.d); l.y(ny * l.d); });
      });
    }

    // Truck-art bands run like a marquee; scroll speed pushes them, scroll direction flips them
    var bands = $$('.band'), bx = 0, dir = 1, vel = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) { vel = self.getVelocity(); if (vel) dir = vel > 0 ? 1 : -1; }
    });
    gsap.ticker.add(function (time, dt) {
      vel *= .92;
      bx = (bx + (.5 + Math.min(Math.abs(vel) / 120, 18)) * dir * (dt / 16.67)) % 30;
      bands.forEach(function (b) { b.style.setProperty('--bx', bx.toFixed(2) + 'px'); });
    });

    // Header tucks away on the way down, returns on the way up
    var header = $('.site-header');
    var tuck = gsap.to(header, { yPercent: -110, duration: .35, ease: 'power2.out', paused: true });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        if (self.scroll() < 160 || self.direction === -1) tuck.reverse(); else tuck.play();
      }
    });

    // Section titles: English letters hop in, the Persian word bounces in after
    $$('.h2').forEach(function (h) {
      var node = Array.prototype.find.call(h.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (!node) return;
      var span = document.createElement('span');
      span.className = 'h2-en';
      node.textContent = node.textContent.trim();
      h.insertBefore(span, node);
      span.appendChild(node);
      var split = SplitText.create(span, { type: 'words,chars' });
      var fa = h.querySelector('[lang="fa"]');
      var tl = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 86%', once: true } })
        .from(split.chars, { yPercent: 85, rotation: 12, scale: .5, opacity: 0, duration: .75, stagger: .035, ease: 'back.out(2.2)', transformOrigin: '50% 100%' });
      if (fa) tl.from(fa, { scale: .2, rotation: -22, opacity: 0, duration: 1, ease: 'elastic.out(1, .5)' }, '-=.45');
    });

    // Small pieces slide up as they arrive
    gsap.set('.section-head .eyebrow, .section-head > .btn, .section-note, .chips, .menu-foot, .footer-top .btn, .footer-cols > div, .footer-legal', { y: 34, opacity: 0 });
    ScrollTrigger.batch('.section-head .eyebrow, .section-head > .btn, .section-note, .chips, .menu-foot, .footer-top .btn, .footer-cols > div, .footer-legal', {
      start: 'top 92%', once: true,
      onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out' }); }
    });

    // Menu: dishes rise, dotted leaders draw, Persian names pop
    gsap.set('.dish', { y: 44, opacity: 0 });
    gsap.set('.dish .leader', { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set('.dish-fa', { scale: .3, rotation: -12, opacity: 0 });
    ScrollTrigger.batch('.dish', {
      start: 'top 92%', once: true,
      onEnter: function (b) {
        gsap.to(b, { y: 0, opacity: 1, duration: .75, stagger: .08, ease: 'power3.out' });
        gsap.to(b.map(function (d) { return d.querySelector('.leader'); }), { scaleX: 1, duration: .9, stagger: .08, delay: .2, ease: 'power2.out' });
        gsap.to(b.map(function (d) { return d.querySelector('.dish-fa'); }), { scale: 1, rotation: 0, opacity: 1, duration: .8, stagger: .08, delay: .4, ease: 'back.out(2.6)' });
      }
    });
    $$('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var shown = $$('.dish:not([hidden])');
        gsap.fromTo(chip, { scale: .88 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' });
        gsap.set(shown.map(function (d) { return d.querySelector('.leader'); }), { scaleX: 1 });
        gsap.set(shown.map(function (d) { return d.querySelector('.dish-fa'); }), { scale: 1, rotation: 0, opacity: 1 });
        gsap.fromTo(shown, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .05, ease: 'power3.out', overwrite: true });
        ScrollTrigger.refresh();
      });
    });

    // Gallery: tiles wipe open from the bottom, photos settle from a zoom
    gsap.set('.tile', { clipPath: 'inset(100% 0% 0% 0% round 14px)' });
    gsap.set('.tile img', { scale: 1.35 });
    ScrollTrigger.batch('.tile', {
      start: 'top 90%', once: true,
      onEnter: function (b) {
        gsap.to(b, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.1, stagger: .12, ease: 'expo.out', clearProps: 'clipPath' });
        gsap.to(b.map(function (t) { return t.querySelector('img'); }), { scale: 1, duration: 1.5, stagger: .12, ease: 'expo.out', clearProps: 'transform' });
        gsap.from(b.map(function (t) { return t.querySelector('.tile-cap'); }), { y: 24, opacity: 0, duration: .6, stagger: .12, delay: .45, ease: 'back.out(2)' });
      }
    });
    gsap.matchMedia().add('(min-width: 901px)', function () {
      gsap.fromTo('.tile:nth-child(3n+2)', { y: 60 }, {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Story: portrait spins in, the Persian quote writes itself right to left
    var words = SplitText.create('.quote-en', { type: 'words' });
    gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('.story-photo img', { rotation: -140, scale: .4, opacity: 0, duration: 1.2, ease: 'back.out(1.5)' }, 0)
      .from('.story-photo .flags', { scale: 0, rotation: 25, duration: .8, ease: 'back.out(3)' }, .7)
      .from('.story-copy .eyebrow', { x: -24, opacity: 0, duration: .6 }, .1)
      .fromTo('.quote-fa', { clipPath: 'inset(-10% 0% -10% 100%)' }, { clipPath: 'inset(-10% 0% -10% 0%)', duration: 1.4, ease: 'power2.inOut' }, .2)
      .from(words.words, { y: 20, opacity: 0, duration: .5, stagger: .03 }, .8)
      .from('.story-body', { y: 22, opacity: 0, duration: .7 }, 1.2);

    // Locations: cards toss in from slight angles
    gsap.from('.loc-card', {
      y: 100, rotation: function (i) { return i ? 6 : -6; }, opacity: 0, duration: 1.1, stagger: .15, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.loc-grid', start: 'top 86%', once: true }
    });
    document.addEventListener('jk:loc', function () {
      gsap.fromTo('.loc-card.is-selected', { scale: .95 }, { scale: 1, duration: .8, ease: 'elastic.out(1, .4)' });
      gsap.fromTo('.loc-switch [aria-pressed="true"]', { scale: .8 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
      gsap.fromTo('[data-loc-call] .icon', { rotation: -25 }, { rotation: 0, duration: .9, ease: 'elastic.out(1, .25)' });
    });

    // Footer: the big wordmark drops in letter by letter and bounces; letters hop on hover
    var foot = SplitText.create('.footer-word', { type: 'chars' });
    gsap.from(foot.chars, {
      yPercent: -170, rotation: function () { return gsap.utils.random(-35, 35); }, opacity: 0,
      duration: 1.2, stagger: { each: .07, from: 'random' }, ease: 'bounce.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 80%', once: true }
    });
    foot.chars.forEach(function (c) {
      c.addEventListener('pointerenter', function () {
        gsap.to(c, { yPercent: -24, rotation: gsap.utils.random(-12, 12), duration: .18, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    // Buttons lean toward the cursor
    if (fine) {
      $$('.btn-primary, .btn-ink, .proof').forEach(function (el) {
        var xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
        var yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * .3);
          yTo((e.clientY - r.top - r.height / 2) * .45);
        });
        el.addEventListener('pointerleave', function () {
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)', overwrite: 'auto' });
        });
      });
    }
  }

  var loaderDone = runLoader();
  fontsReady.then(function () {
    try {
      scrollScenes();
      return loaderDone.then(heroIntro);
    } catch (err) {
      bail();
      throw err;
    }
  }).then(function () {
    ScrollTrigger.refresh();
  }).catch(function (err) {
    bail();
    if (window.console) console.error(err);
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
