/* Majlis — site interactions. No dependencies. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page');

  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };

  function icon(id) { return '<svg class="ic" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseISO(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return null;
    var p = v.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function formatDate(v) {
    var d = parseISO(v);
    return d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
  }

  /* ---------------------------------------------------------------------
     Shared data
     --------------------------------------------------------------------- */
  var EVENT_TYPES = [
    { id: 'henna', label: 'Henna night', term: 'Shab-e Khina', icon: 'i-henna' },
    { id: 'engagement', label: 'Engagement', term: 'Shirini Khori', icon: 'i-rings' },
    { id: 'nikkah', label: 'Nikkah', term: 'The ceremony', icon: 'i-crescent' },
    { id: 'wedding', label: 'Wedding reception', term: 'Arosi', icon: 'i-arch' },
    { id: 'aqiqa', label: 'Aqiqa / baby shower', term: 'Welcoming the little one', icon: 'i-cradle' },
    { id: 'birthday', label: 'Birthday / graduation', term: 'Jashn', icon: 'i-cake' },
    { id: 'eid', label: 'Eid / holiday', term: 'Eid · Nawroz · Iftar', icon: 'i-lantern' },
    { id: 'community', label: 'Community / corporate', term: 'Gatherings of every kind', icon: 'i-people' },
    { id: 'other', label: 'Something else', term: 'Tell us about it', icon: 'i-sparkle' }
  ];

  var PACKAGES = { gathering: 'The Gathering', celebration: 'The Celebration', grand: 'The Grand Majlis' };

  var MENU = [
    {
      id: 'starters', title: 'Starters', ar: 'پیش غذا', blurb: 'Set on the table as guests sit down.',
      items: [
        { id: 'bolani', name: 'Bolani', desc: 'Thin flatbread stuffed with potato and green onion, pan-crisped and served with chutney and yogurt.', tags: ['v'] },
        { id: 'sambosa', name: 'Sambosa', desc: 'Crisp golden pastries filled with spiced beef or chickpeas.', tags: [] },
        { id: 'burani', name: 'Burani Banjan', desc: 'Fried eggplant layered with stewed tomato and garlic yogurt.', tags: ['v'] },
        { id: 'shornakhod', name: 'Shor Nakhod', desc: 'Chickpea and potato salad with a bright cilantro and vinegar dressing.', tags: ['v'] },
        { id: 'pakawra', name: 'Pakawra', desc: 'Battered potato slices fried crisp, with green chutney.', tags: ['v'] },
        { id: 'salata', name: 'Salata', desc: 'Tomato, cucumber, red onion, cilantro and lemon. The fresh crunch on every plate.', tags: ['v'] }
      ]
    },
    {
      id: 'dumplings', title: 'Dumplings & soups', ar: 'آشک و منتو', blurb: 'Folded by hand the morning of your event.',
      items: [
        { id: 'mantu', name: 'Mantu', desc: 'Steamed dumplings with seasoned beef and onion, garlic yogurt, split-pea sauce and dried mint.', tags: ['sig'] },
        { id: 'ashak', name: 'Ashak', desc: 'Leek and scallion dumplings with garlic yogurt and mint, finished with a tomato-beef or lentil sauce.', tags: ['v'] },
        { id: 'aush', name: 'Aush', desc: 'Hand-cut noodle soup with beans, yogurt and dried mint. A winter favorite.', tags: ['v'] },
        { id: 'shorwa', name: 'Shorwa', desc: 'Slow-simmered lamb and vegetable soup, served with fresh naan.', tags: [] }
      ]
    },
    {
      id: 'grill', title: 'From the grill', ar: 'کباب', blurb: 'Charcoal-kissed and grilled to order.',
      items: [
        { id: 'lambtikka', name: 'Lamb Tikka Kabab', desc: 'Marinated lamb on skewers, char-grilled and served with naan and chutney.', tags: ['sig'] },
        { id: 'chickentikka', name: 'Chicken Tikka Kabab', desc: 'Yogurt and garlic marinated chicken, grilled over open flame.', tags: [] },
        { id: 'chapli', name: 'Chapli Kabab', desc: 'Flat, spiced beef patties with tomato, onion and fresh coriander.', tags: ['s'] },
        { id: 'chopan', name: 'Chopan Kabab', desc: 'Shepherd-style lamb chops, simply seasoned and grilled.', tags: [] },
        { id: 'kofta', name: 'Kofta Kabab', desc: 'Seasoned ground beef skewers with onion and herbs.', tags: [] },
        { id: 'mixedgrill', name: 'Mixed Kabab Platter', desc: 'Lamb, chicken and kofta on one board. Built for the head table.', tags: ['sig'] }
      ]
    },
    {
      id: 'palaw', title: 'Palaw & mains', ar: 'پلو', blurb: 'The heart of every Afghan celebration.',
      items: [
        { id: 'kabuli', name: 'Kabuli Palaw', desc: 'Long-grain rice with tender lamb, caramelized carrots, raisins and slivered almonds.', tags: ['sig', 'n'] },
        { id: 'narenj', name: 'Narenj Palaw', desc: 'The wedding rice: saffron, candied orange peel, pistachios and almonds over chicken.', tags: ['n'] },
        { id: 'sabzi', name: 'Qorma-e Sabzi', desc: 'Spinach and leeks slow-cooked with lamb or chickpeas, served with challow.', tags: ['v'] },
        { id: 'qormamurgh', name: 'Qorma-e Murgh', desc: 'Chicken braised in a rich onion and tomato gravy with warm spices.', tags: [] },
        { id: 'koftachallow', name: 'Kofta Challow', desc: 'Tender meatballs in tomato sauce over fluffy white rice.', tags: [] },
        { id: 'dal', name: 'Dal Challow', desc: 'Golden yellow lentils with white rice.', tags: ['v'] }
      ]
    },
    {
      id: 'sweets', title: 'Sweets', ar: 'شیرینی', blurb: 'For the dessert table and the long goodbyes.',
      items: [
        { id: 'firni', name: 'Firni', desc: 'Cardamom and rosewater milk pudding with crushed pistachio.', tags: ['v', 'n'] },
        { id: 'sheeryakh', name: 'Sheer Yakh', desc: 'Afghan ice cream with rosewater, cardamom and pistachio.', tags: ['v', 'n'] },
        { id: 'goshefeel', name: 'Gosh-e Feel', desc: 'Crisp "elephant ear" pastry dusted with sugar and pistachio.', tags: ['v', 'n'] },
        { id: 'jalebi', name: 'Jalebi', desc: 'Crisp, syrup-soaked spirals, best eaten warm.', tags: ['v'] },
        { id: 'baklava', name: 'Baklava', desc: 'Layered phyllo with walnuts, pistachios and syrup.', tags: ['v', 'n'] },
        { id: 'nuql', name: 'Nuql', desc: 'Sugar-coated almonds and chickpeas for the welcome table and the henna tray.', tags: ['v', 'n'] }
      ]
    },
    {
      id: 'chai', title: 'Chai & drinks', ar: 'چای', blurb: 'Poured from arrival to farewell.',
      items: [
        { id: 'qaimaq', name: 'Qaimaq Chai', desc: 'Rosy, cardamom-scented tea crowned with thick cream. Made for celebrations.', tags: ['sig'] },
        { id: 'kahwa', name: 'Kahwa', desc: 'Green tea with cardamom, kept flowing all night.', tags: ['v'] },
        { id: 'chaisiah', name: 'Chai Siah', desc: 'Black tea with cardamom.', tags: ['v'] },
        { id: 'doogh', name: 'Doogh', desc: 'Chilled yogurt drink with mint and cucumber.', tags: ['v'] },
        { id: 'sharbat', name: 'Sharbat', desc: 'Rosewater and seasonal fruit cooler.', tags: ['v'] }
      ]
    }
  ];
  var TAGS = { sig: ['SIG', 'Signature dish'], v: ['V', 'Vegetarian or vegetarian option'], n: ['N', 'Contains nuts'], s: ['S', 'Spicy'] };
  var DISH_INDEX = {};
  MENU.forEach(function (sec) { sec.items.forEach(function (d) { DISH_INDEX[d.id] = d; }); });
  var TRAY_KEY = 'majlis-menu';

  function tagsHTML(tags) {
    return '<span class="diet">' + tags.map(function (t) {
      return '<abbr class="' + (t === 'sig' ? 'sig' : '') + '" title="' + TAGS[t][1] + '">' + TAGS[t][0] + '</abbr>';
    }).join('') + '</span>';
  }

  /* ---------------------------------------------------------------------
     Header, menu, action bar
     --------------------------------------------------------------------- */
  var header = $('.site-header');
  var actionBar = $('.action-bar');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (actionBar) actionBar.classList.toggle('is-visible', page !== 'home' || y > window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = $('.menu-toggle');
  var mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', String(!open));
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  if (mobileMenu) $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Active nav link on the home page */
  if (page === 'home' && 'IntersectionObserver' in window) {
    var navLinks = $$('.nav a[href^="#"]');
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + entry.target.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = $(a.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealEls = $$('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------------------
     Photo slots: drop real photos into assets/photos/ and they replace the art
     --------------------------------------------------------------------- */
  $$('.photo[data-src]').forEach(function (fig) {
    var img = new Image();
    img.onload = function () {
      img.className = 'photo-img';
      img.alt = fig.getAttribute('data-alt') || '';
      img.decoding = 'async';
      fig.appendChild(img);
      requestAnimationFrame(function () { fig.classList.add('has-photo'); });
    };
    img.src = fig.getAttribute('data-src');
  });

  /* ---------------------------------------------------------------------
     Accessible tabs (catering preview)
     --------------------------------------------------------------------- */
  $$('.tabs-list[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); select(next); }
      });
    });
  });

  /* ---------------------------------------------------------------------
     Quick check (hero)
     --------------------------------------------------------------------- */
  var qcDate = $('#qc-date');
  if (qcDate) qcDate.min = todayISO();

  /* ---------------------------------------------------------------------
     Floor plans
     --------------------------------------------------------------------- */
  var C = { wall: '#17172a', floor: '#fcf9f3', table: '#c9a15b', chair: '#1d3074', stage: '#8d1f33', dance: '#e8dcc4', service: '#1d3074', sofa: '#b23a4c', text: '#6b6676' };

  function roundTable(x, y, seats, r) {
    r = r || 16;
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C.table + '" stroke="#fff" stroke-width="1.5"/>';
    for (var i = 0; i < seats; i++) {
      var a = (Math.PI * 2 * i) / seats;
      s += '<circle cx="' + (x + Math.cos(a) * (r + 7)).toFixed(1) + '" cy="' + (y + Math.sin(a) * (r + 7)).toFixed(1) + '" r="3" fill="' + C.chair + '"/>';
    }
    return s;
  }
  function rect(x, y, w, h, fill, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 4) + '" fill="' + fill + '" ' + (extra || '') + '/>';
  }
  function label(x, y, text, color, rotate, size) {
    return '<text x="' + x + '" y="' + y + '" fill="' + (color || C.text) + '" font-family="Manrope, sans-serif" font-size="' + (size || 11) + '" font-weight="700" letter-spacing="1.5" text-anchor="middle"' +
      (rotate ? ' transform="rotate(' + rotate + ' ' + x + ' ' + y + ')"' : '') + '>' + text.toUpperCase() + '</text>';
  }
  function dance(x, y, w, h) {
    return rect(x, y, w, h, C.dance, 8, 'stroke="#9a8f7a" stroke-dasharray="5 4"') + label(x + w / 2, y + h / 2 + 4, 'Dance floor', '#7a6f5a');
  }
  function shell(inner) {
    return '<svg viewBox="0 0 656 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Floor plan">' +
      rect(10, 10, 620, 400, C.floor, 14, 'stroke="' + C.wall + '" stroke-width="3"') +
      rect(285, 404, 70, 12, C.floor, 0) +
      '<path d="M285 410 a35 35 0 0 1 35 -35" fill="none" stroke="' + C.wall + '" stroke-width="1" stroke-dasharray="3 3"/>' +
      label(320, 426, 'Entrance', C.wall, 0, 10) +
      rect(626, 340, 8, 44, C.floor, 0) + label(646, 362, 'Kitchen', C.text, 90, 10) +
      inner + '</svg>';
  }

  var LAYOUTS = {
    banquet: {
      cap: 150, capLabel: 'guests seated at 15 rounds',
      desc: 'The classic. Round tables of ten around a central dance floor, with a stage for the couple and a buffet line along the kitchen wall.',
      best: ['Weddings', 'Receptions', 'Eid dinners', 'Fundraisers'],
      draw: function () {
        var s = rect(250, 26, 140, 44, C.stage, 6) + label(320, 52, 'Stage', '#fff');
        s += dance(228, 115, 184, 140);
        s += rect(588, 110, 20, 200, C.service, 4) + label(598, 210, 'Buffet', '#fff', 90, 10);
        [[70, 110], [150, 110], [70, 185], [150, 185], [70, 260], [150, 260], [70, 340], [150, 340],
         [480, 110], [480, 185], [480, 260], [480, 340], [228 + 22, 330], [412 - 22, 330]].forEach(function (p) { s += roundTable(p[0], p[1], 10); });
        s += roundTable(545, 150, 10);
        s += rect(530, 230, 34, 120, '#e4ca93', 4) + label(547, 290, 'Sweets', C.wall, 90, 9);
        return s;
      }
    },
    lounge: {
      cap: 130, capLabel: 'guests in lounge and table seating',
      desc: 'Majlis-style sofas line the walls, rounds fill the middle, and a candlelit aisle runs from the door to the couple\'s stage for the khancha procession.',
      best: ['Henna nights', 'Engagements', 'Shirini khori'],
      draw: function () {
        var s = rect(220, 24, 200, 54, C.stage, 8) + label(320, 55, 'Couple\'s stage', '#fff');
        s += '<path d="M320 400 V250" stroke="' + C.table + '" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>';
        s += label(334, 330, 'Procession', C.table, 90, 9);
        s += dance(240, 110, 160, 120);
        for (var i = 0; i < 5; i++) {
          var y = 70 + i * 66;
          s += rect(22, y, 22, 54, C.sofa, 8) + rect(50, y + 16, 12, 22, '#e4ca93', 3);
          s += rect(596, y, 22, 54, C.sofa, 8) + rect(578, y + 16, 12, 22, '#e4ca93', 3);
        }
        s += rect(70, 380, 100, 20, C.sofa, 8) + rect(180, 380, 95, 20, C.sofa, 8);
        s += rect(365, 380, 95, 20, C.sofa, 8) + rect(470, 380, 100, 20, C.sofa, 8);
        [[115, 130], [195, 130], [115, 215], [195, 215], [115, 300], [210, 310], [445, 130], [525, 130], [445, 215], [525, 215], [430, 310], [525, 300]].forEach(function (p) { s += roundTable(p[0], p[1], 8, 14); });
        return s;
      }
    },
    ceremony: {
      cap: 150, capLabel: 'guests in theater rows',
      desc: 'Rows facing the stage with a wide center aisle. Ideal for a nikkah, with welcome sweets by the door while the room resets for dinner.',
      best: ['Nikkah', 'Community meetings', 'Presentations'],
      draw: function () {
        var s = rect(230, 24, 180, 54, C.stage, 8) + label(320, 55, 'Ceremony stage', '#fff');
        for (var r = 0; r < 15; r++) {
          var y = 106 + r * 18.5;
          for (var c = 0; c < 5; c++) {
            s += rect(150 + c * 26, y, 16, 11, C.table, 3);
            s += rect(374 + c * 26, y, 16, 11, C.table, 3);
          }
        }
        s += '<path d="M320 96 V392" stroke="' + C.stage + '" stroke-width="1.5" stroke-dasharray="4 5"/>';
        s += rect(34, 300, 60, 90, '#e4ca93', 6) + label(64, 350, 'Sweets', C.wall, 90, 9);
        s += rect(570, 120, 40, 150, C.service, 6) + label(590, 195, 'Chai', '#fff', 90, 10);
        return s;
      }
    },
    reception: {
      cap: 150, capLabel: 'guests mingling',
      desc: 'High-tops, lounge corners, a long buffet and a chai bar. Perfect for open-house style events where guests come and go.',
      best: ['Aqiqa', 'Graduations', 'Corporate mixers', 'Open houses'],
      draw: function () {
        var s = rect(260, 24, 120, 40, C.stage, 6) + label(320, 49, 'DJ', '#fff');
        s += rect(26, 90, 22, 250, C.service, 4) + label(37, 215, 'Buffet', '#fff', 90, 10);
        s += rect(560, 120, 50, 26, C.service, 5) + label(585, 137, 'Chai', '#fff', 0, 9);
        [[90, 100], [90, 300], [530, 300]].forEach(function (p) {
          s += rect(p[0], p[1], 64, 18, C.sofa, 7) + rect(p[0], p[1] + 46, 64, 18, C.sofa, 7) + rect(p[0] + 18, p[1] + 24, 28, 16, '#e4ca93', 3);
        });
        [[200, 110], [270, 140], [370, 140], [440, 110], [500, 180], [200, 200], [320, 210], [440, 230],
         [250, 280], [390, 290], [180, 360], [470, 360], [320, 330], [500, 250]].forEach(function (p) {
          s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="' + C.table + '" stroke="#fff" stroke-width="1.5"/>';
        });
        return s;
      }
    }
  };

  var planWrap = $('#plan-svg');
  if (planWrap) {
    var segButtons = $$('.segmented [data-layout]');
    var renderLayout = function (key) {
      var L = LAYOUTS[key];
      $('#layout-cap').textContent = L.cap;
      $('#layout-cap-label').textContent = L.capLabel;
      $('#layout-desc').textContent = L.desc;
      $('#layout-best').innerHTML = '<span class="tag">Best for</span>' + L.best.map(function (b) { return '<span class="tag">' + b + '</span>'; }).join('');
      planWrap.style.opacity = '0';
      setTimeout(function () {
        planWrap.innerHTML = shell(L.draw());
        planWrap.style.transition = 'opacity .45s cubic-bezier(.22,1,.36,1)';
        planWrap.style.opacity = '1';
      }, reduceMotion ? 0 : 160);
      segButtons.forEach(function (b) {
        var on = b.getAttribute('data-layout') === key;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
    };
    segButtons.forEach(function (b, i) {
      b.addEventListener('click', function () { renderLayout(b.getAttribute('data-layout')); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = segButtons[(i + 1) % segButtons.length];
        if (e.key === 'ArrowLeft') n = segButtons[(i - 1 + segButtons.length) % segButtons.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
    renderLayout('banquet');
  }

  /* ---------------------------------------------------------------------
     Menu page: render menu + event-menu tray
     --------------------------------------------------------------------- */
  var tray = store.get(TRAY_KEY, []).filter(function (id) { return DISH_INDEX[id]; });
  function saveTray() { store.set(TRAY_KEY, tray); }

  var menuRoot = $('#menu-root');
  if (menuRoot) {
    var nav = $('#menu-nav-list');
    nav.innerHTML = MENU.map(function (sec) { return '<a href="#' + sec.id + '">' + esc(sec.title) + '</a>'; }).join('');
    menuRoot.innerHTML = MENU.map(function (sec) {
      return '<section class="menu-section" id="' + sec.id + '" aria-labelledby="h-' + sec.id + '">' +
        '<div class="container">' +
        '<div class="menu-section-head reveal is-in"><div><span class="ar" lang="fa">' + sec.ar + '</span><h2 id="h-' + sec.id + '">' + esc(sec.title) + '</h2></div><p class="lede">' + esc(sec.blurb) + '</p></div>' +
        '<div class="menu-grid">' + sec.items.map(function (d) {
          return '<article class="menu-item" data-dish="' + d.id + '">' +
            '<div class="dish-top"><h4>' + esc(d.name) + '</h4><span class="leader"></span>' + tagsHTML(d.tags) + '</div>' +
            '<p>' + esc(d.desc) + '</p>' +
            '<div class="menu-item-foot"><span class="help" style="font-size:13px;color:var(--muted)">Priced per guest</span>' +
            '<button type="button" class="add-btn" aria-pressed="false" data-add="' + d.id + '">' + icon('i-plus') + '<span>Add to menu</span></button></div>' +
            '</article>';
        }).join('') + '</div></div></section>';
    }).join('');

    var trayEl = $('#tray');
    var syncTray = function () {
      $$('[data-add]').forEach(function (btn) {
        var on = tray.indexOf(btn.getAttribute('data-add')) > -1;
        btn.setAttribute('aria-pressed', String(on));
        btn.innerHTML = icon(on ? 'i-check' : 'i-plus') + '<span>' + (on ? 'Added' : 'Add to menu') + '</span>';
        btn.closest('.menu-item').classList.toggle('is-added', on);
      });
      $('#tray-count').textContent = tray.length;
      $('#tray-label').textContent = tray.length === 1 ? 'dish in your event menu' : 'dishes in your event menu';
      trayEl.classList.toggle('is-visible', tray.length > 0);
    };
    menuRoot.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-add]');
      if (!btn) return;
      var id = btn.getAttribute('data-add');
      var idx = tray.indexOf(id);
      if (idx > -1) tray.splice(idx, 1); else tray.push(id);
      saveTray();
      syncTray();
    });
    $('#tray-clear').addEventListener('click', function () { tray = []; saveTray(); syncTray(); });
    syncTray();

    if ('IntersectionObserver' in window) {
      var navAs = $$('a', nav);
      var menuObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navAs.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + entry.target.id;
            a.classList.toggle('is-active', on);
            if (on && a.scrollIntoView && nav.scrollWidth > nav.clientWidth) {
              nav.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
            }
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      $$('.menu-section').forEach(function (s) { menuObserver.observe(s); });
    }
  }

  /* ---------------------------------------------------------------------
     Plan page: multi-step inquiry
     --------------------------------------------------------------------- */
  var form = $('#plan-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    var steps = $$('.step', form);
    var progressItems = $$('.progress li');
    var btnBack = $('#btn-back');
    var btnNext = $('#btn-next');
    var current = 0;

    // Occasion choices
    $('#type-choices').innerHTML = EVENT_TYPES.map(function (t) {
      return '<div class="choice"><input type="radio" name="type" id="type-' + t.id + '" value="' + t.id + '">' +
        '<label for="type-' + t.id + '">' + icon(t.icon) + '<strong>' + esc(t.label) + '</strong><small>' + esc(t.term) + '</small></label></div>';
    }).join('');

    var dateInput = $('#f-date');
    var flexible = $('#f-flexible');
    var guests = $('#f-guests');
    var guestsRange = $('#f-guests-range');
    var dateNote = $('#date-note');
    var capNote = $('#cap-note');
    dateInput.min = todayISO();

    // Prefill from URL
    var pType = params.get('type');
    if (pType && $('#type-' + pType)) $('#type-' + pType).checked = true;
    var pDate = params.get('date');
    if (pDate && parseISO(pDate)) dateInput.value = pDate;
    var pGuests = parseInt(params.get('guests'), 10);
    if (pGuests) guests.value = Math.max(10, Math.min(300, pGuests));
    var pPkg = params.get('package');
    if (pPkg && PACKAGES[pPkg]) $('#f-package').value = pPkg;
    if (params.get('tour')) $('#f-tour').checked = true;

    // Guests stepper
    function setGuests(n) {
      n = Math.max(10, Math.min(300, Math.round(n) || 10));
      guests.value = n;
      guestsRange.value = Math.min(n, 200);
      capNote.hidden = n <= 150;
      updateSummary();
    }
    $('#g-minus').addEventListener('click', function () { setGuests(+guests.value - 5); });
    $('#g-plus').addEventListener('click', function () { setGuests(+guests.value + 5); });
    guests.addEventListener('change', function () { setGuests(+guests.value); });
    guestsRange.addEventListener('input', function () { setGuests(+guestsRange.value); });

    function updateDateNote() {
      var d = parseISO(dateInput.value);
      if (flexible.checked && !d) { dateNote.hidden = false; dateNote.querySelector('span').textContent = 'No problem. We will send you the open dates that fit your guest count.'; return; }
      if (!d) { dateNote.hidden = true; return; }
      var day = d.getDay();
      var weekend = day === 0 || day === 5 || day === 6;
      var months = (d - new Date()) / (1000 * 60 * 60 * 24 * 30);
      var msg = weekend
        ? 'Weekend dates book quickly. We will confirm availability within 24 hours.'
        : 'Weeknight dates often have more flexibility on timing and pricing.';
      if (months < 1.5) msg = 'That is coming up soon. Call us at (510) 574-6273 for the fastest answer.';
      dateNote.hidden = false;
      dateNote.querySelector('span').textContent = msg;
    }
    dateInput.addEventListener('change', function () { updateDateNote(); updateSummary(); });
    flexible.addEventListener('change', function () { updateDateNote(); updateSummary(); });

    // Selected dishes from the menu tray
    function renderDishes() {
      var wrap = $('#selected-dishes');
      if (!tray.length) {
        wrap.innerHTML = '<p class="help" style="color:var(--muted);font-size:14px">No dishes picked yet. <a href="menu.html">Browse the menu</a> and tap "Add to menu", or leave it to our chef.</p>';
        return;
      }
      wrap.innerHTML = '<div class="selected-dishes">' + tray.map(function (id) {
        return '<span class="tag">' + esc(DISH_INDEX[id].name) + '</span>';
      }).join('') + '</div><p style="margin-top:10px;font-size:13.5px"><a href="menu.html">Edit your menu</a></p>';
    }
    renderDishes();

    // Summary
    function val(name) {
      var el = form.querySelector('[name="' + name + '"]:checked');
      return el ? el.value : '';
    }
    function setRow(key, text) {
      var dd = $('[data-sum="' + key + '"]');
      if (!dd) return;
      dd.textContent = text || 'Not set yet';
      dd.classList.toggle('empty', !text);
    }
    function labelFor(input) {
      var l = form.querySelector('label[for="' + input.id + '"] strong');
      return l ? l.textContent : input.value;
    }
    function updateSummary() {
      var t = EVENT_TYPES.filter(function (x) { return x.id === val('type'); })[0];
      setRow('type', t ? t.label : '');
      setRow('date', dateInput.value ? formatDate(dateInput.value) + (flexible.checked ? ' (flexible)' : '') : (flexible.checked ? 'Flexible' : ''));
      var time = form.querySelector('[name="time"]:checked');
      setRow('guests', guests.value + ' guests' + (time ? ' · ' + labelFor(time) : ''));
      var pkg = $('#f-package').value;
      setRow('package', PACKAGES[pkg] || '');
      var svc = form.querySelector('[name="service"]:checked');
      setRow('service', svc ? labelFor(svc) : '');
      setRow('menu', tray.length ? tray.length + (tray.length === 1 ? ' dish' : ' dishes') + ' selected' : '');
      var extras = $$('[name="extras"]:checked', form).map(labelFor);
      setRow('extras', extras.join(', '));
    }
    form.addEventListener('change', updateSummary);
    form.addEventListener('input', function (e) { if (e.target.name !== 'notes') updateSummary(); });

    // Validation
    function fieldError(input, show) {
      var f = input.closest('.field');
      if (f) f.classList.toggle('invalid', show);
      input.setAttribute('aria-invalid', String(show));
    }
    function validate(i) {
      var ok = true;
      var stepErr = $('.step-error', steps[i]);
      if (stepErr) stepErr.classList.remove('is-shown');
      if (i === 0 && !val('type')) {
        stepErr.textContent = 'Pick the occasion you are planning to continue.';
        stepErr.classList.add('is-shown');
        ok = false;
      }
      if (i === 1) {
        var d = parseISO(dateInput.value);
        var bad = (!d && !flexible.checked) || (d && dateInput.value < todayISO());
        fieldError(dateInput, bad);
        if (bad) ok = false;
      }
      if (i === 3) {
        var name = $('#f-name'), phone = $('#f-phone'), email = $('#f-email');
        var badName = name.value.trim().length < 2;
        var badPhone = phone.value.replace(/\D/g, '').length < 10;
        var badEmail = email.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        fieldError(name, badName); fieldError(phone, badPhone); fieldError(email, badEmail);
        ok = !(badName || badPhone || badEmail);
      }
      if (!ok) {
        var firstBad = steps[i].querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
      }
      return ok;
    }

    function go(i, initial) {
      current = i;
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      progressItems.forEach(function (li, n) {
        li.classList.toggle('is-done', n < i);
        li.classList.toggle('is-current', n === i);
        if (n === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      btnBack.hidden = i === 0;
      btnNext.innerHTML = i === steps.length - 1 ? 'Send request ' + icon('i-arrow') : 'Continue ' + icon('i-arrow');
      if (initial) return;
      var h = $('h2', steps[i]);
      if (h) h.focus({ preventScroll: true });
      var top = $('.wizard').getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    btnBack.addEventListener('click', function () { if (current > 0) go(current - 1); });
    btnNext.addEventListener('click', function () {
      if (!validate(current)) return;
      if (current < steps.length - 1) go(current + 1); else submit();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); btnNext.click(); });
    // Pressing Enter in a text input moves forward instead of submitting early
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
        e.preventDefault(); btnNext.click();
      }
    });

    function submit() {
      var data = new FormData(form);
      data.append('dishes', tray.map(function (id) { return DISH_INDEX[id].name; }).join(', '));
      var endpoint = form.getAttribute('data-endpoint');
      btnNext.disabled = true;
      btnNext.textContent = 'Sending…';
      var done = function () {
        var ref = 'MJ-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        $('#success-ref').textContent = 'Request ' + ref;
        $('#success-name').textContent = ($('#f-name').value.trim().split(' ')[0]) || 'friend';
        var method = form.querySelector('[name="contact"]:checked');
        $('#success-method').textContent = method ? labelFor(method).toLowerCase() : 'call';
        steps.forEach(function (s) { s.classList.remove('is-active'); });
        $('.progress').hidden = true;
        $('.wizard-nav').hidden = true;
        $('#success').classList.add('is-shown');
        $('#success h2').focus();
        tray = []; saveTray();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      };
      if (!endpoint) { setTimeout(done, 700); return; }
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(function () {
          btnNext.disabled = false;
          btnNext.innerHTML = 'Send request ' + icon('i-arrow');
          var err = $('.step-error', steps[current]);
          err.textContent = 'Something went wrong sending your request. Please call or text (510) 574-6273.';
          err.classList.add('is-shown');
        });
    }

    setGuests(+guests.value);
    updateDateNote();
    updateSummary();
    go(pType && $('#type-' + pType) ? 1 : 0, true);
  }
})();
