/* Masthead: the three-phone showcase and the drifting poster rows behind it. */

(function () {
  'use strict';

  var CONFIG = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
  var BRAND = CONFIG.brandName || 'RagaHru';

  var POSITIONS = ['left', 'center', 'right'];
  var ROTATE_MS = 2600;
  var RAIL_SPEED = 24; // px per second

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function imageList(list) {
    return Array.isArray(list)
      ? list.filter(function (src) { return typeof src === 'string' && src; })
      : [];
  }

  function onLoad(fn) {
    if (document.readyState === 'complete') { fn(); }
    else { window.addEventListener('load', fn, { once: true }); }
  }

  /* ---- phones ---- */

  function phoneElement(src, eager) {
    var phone = document.createElement('div');
    phone.className = 'phone hero__phone';
    phone.innerHTML =
      '<span class="phone__body"><span class="phone__screen">' +
        '<img class="phone__poster" alt="" decoding="async" draggable="false">' +
        '<span class="phone__sheen"></span>' +
        '<span class="watermark">' + BRAND + '</span>' +
      '</span></span>' +
      '<span class="phone__shadow"></span>';

    var img = phone.querySelector('img');
    if (eager) { img.setAttribute('fetchpriority', 'high'); }
    img.src = src;
    return phone;
  }

  function buildStage() {
    var stage = document.getElementById('hero-stage');
    if (!stage) { return; }

    var posters = imageList(CONFIG.heroPhonePosters).slice(0, POSITIONS.length);
    if (!posters.length) {
      stage.remove();
      document.querySelector('.hero').classList.add('hero--solo');
      return;
    }

    var slots = posters.length === 3 ? POSITIONS
              : posters.length === 2 ? ['left', 'center']
              : ['center'];

    var phones = posters.map(function (src, i) {
      var el = phoneElement(src, slots[i] === 'center');
      stage.appendChild(el);
      return { el: el, slot: i };
    });

    function place() {
      phones.forEach(function (phone) {
        phone.el.setAttribute('data-pos', slots[phone.slot]);
      });
    }

    function rotate() {
      phones.forEach(function (phone) { phone.slot = (phone.slot + 1) % slots.length; });
      place();
    }

    place();
    stage.classList.add('is-built');

    // Settle instantly while the window is being resized.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      stage.classList.add('is-resizing');
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { stage.classList.remove('is-resizing'); }, 180);
    }, { passive: true });

    if (reducedMotion || phones.length < 2) { return; }

    // Rotate only while the masthead is on screen and the tab is visible.
    var timer = null;
    var inView = true;

    function sync() {
      var run = inView && !document.hidden;
      if (run && !timer) { timer = setInterval(rotate, ROTATE_MS); }
      if (!run && timer) { clearInterval(timer); timer = null; }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.15 }).observe(stage);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* ---- poster rows ----
     Each track holds the poster list an even number of times and slides by
     exactly half its width, so the loop never shows a seam. The distance and
     duration are measured, so the drift speed is the same at every width. */

  function buildRail() {
    var hero = document.querySelector('.hero');
    var tint = hero && hero.querySelector('.hero__tint');
    var sources = imageList(CONFIG.heroRail);
    if (!tint || !sources.length) { return; }

    var rows = [
      { modifier: 'hero__rail--back', delay: '-18s' },
      { modifier: 'hero__rail--low', delay: '-52s' },
      { modifier: '', delay: '0s' }
    ];

    var tracks = rows.map(function (row) {
      var layer = document.createElement('div');
      layer.className = 'hero__rail' + (row.modifier ? ' ' + row.modifier : '');
      layer.setAttribute('aria-hidden', 'true');

      var track = document.createElement('div');
      track.className = 'hero__rail-track';
      track.style.animationDelay = row.delay;

      layer.appendChild(track);
      hero.insertBefore(layer, tint);
      fill(track, 2);
      return track;
    });

    function fill(track, copies) {
      track.textContent = '';
      for (var c = 0; c < copies; c += 1) {
        sources.forEach(function (src) {
          var img = document.createElement('img');
          img.className = 'hero__rail-poster';
          img.src = src;
          img.alt = '';
          img.decoding = 'async';
          img.draggable = false;
          track.appendChild(img);
        });
      }
      track.dataset.copies = String(copies);
    }

    function measure() {
      var viewport = window.innerWidth;
      var refilled = false;

      tracks.forEach(function (track) {
        var copies = Number(track.dataset.copies);
        var setWidth = track.scrollWidth / copies;
        if (!setWidth) { return; }

        // One half of the track must be at least a viewport wide.
        var wanted = Math.max(2, 2 * Math.ceil(viewport / setWidth));
        if (wanted !== copies) {
          fill(track, wanted);
          refilled = true;
        }
      });

      if (refilled) {
        requestAnimationFrame(measure);
        return;
      }

      tracks.forEach(function (track) {
        var pass = track.scrollWidth / 2;
        track.style.setProperty('--rail-shift', pass + 'px');
        track.style.setProperty('--rail-seconds', (pass / RAIL_SPEED).toFixed(2) + 's');
      });
      document.documentElement.classList.add('has-hero-rail');
    }

    // Widths are only known once the first set of posters has decoded.
    var first = tracks[0].querySelectorAll('img');
    Promise.all(Array.prototype.slice.call(first, 0, sources.length).map(function (img) {
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    })).then(measure);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 220);
    }, { passive: true });

    // Pause the rows while the masthead is off screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var state = entries[0].isIntersecting ? '' : 'paused';
        tracks.forEach(function (track) { track.style.animationPlayState = state; });
      }).observe(hero);
    }
  }

  buildStage();
  // The rows are background; they wait until the headline and phones have loaded.
  onLoad(buildRail);
}());
