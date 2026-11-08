/* Catalogue, large preview and page behaviour.
 * Requires config/site-config.js and js/templates.js to be loaded first.
 */

(function () {
  'use strict';

  var CONFIG = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
  var REGISTRY = typeof templates !== 'undefined' && Array.isArray(templates) ? templates : [];
  var COLLECTIONS = Array.isArray(CONFIG.collections) ? CONFIG.collections : [];
  var BRAND = CONFIG.brandName || 'RagaHru';
  var DAY_MS = 24 * 60 * 60 * 1000;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  /* Templates keyed by design code (and by id, where that differs). */
  var byCode = {};

  function noop() {}

  /* ---- helpers ---- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(amount) {
    var n = Number(amount);
    return isFinite(n) ? '₹' + rupees.format(n) : '';
  }

  function icon(name) {
    return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  }

  function whatsappUrl(text) {
    var digits = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    return 'https://wa.me/' + (digits.length >= 8 ? digits : '') +
           (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function withCode(message, code) {
    return String(message || '').replace('{template}', code);
  }

  function timestamp(value) {
    var t = Date.parse(value);
    return isNaN(t) ? 0 : t;
  }

  function pad2(value) {
    var s = String(parseInt(value, 10));
    return s.length < 2 ? '0' + s : s;
  }

  function titleCase(key) {
    return String(key).replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function collectionConfig(key) {
    for (var i = 0; i < COLLECTIONS.length; i += 1) {
      if (String(COLLECTIONS[i].key).toLowerCase() === key) { return COLLECTIONS[i]; }
    }
    return {};
  }

  function collectionLabel(key) {
    return collectionConfig(key).label || titleCase(key);
  }

  /* ---- data ---- */

  /* Fills in media paths and the design code for every usable entry. A folder
     already named like a code (HN01, hn-1) is used as is; otherwise entries
     are numbered within their collection, oldest first, so existing codes
     never change when new designs are added. */
  function prepare(list) {
    var valid = list.filter(function (t) { return t && t.collection && (t.folder || t.id); });
    var counters = {};

    valid.forEach(function (t) {
      t.collection = String(t.collection).toLowerCase();
      var base = 'templates/' + t.collection + '/' + (t.folder || t.id) + '/preview/';
      t.posterPath = t.posterPath || base + 'poster.jpg';
      t.previewPath = t.previewPath || base + 'preview.mp4';
    });

    valid.slice()
      .sort(function (a, b) { return timestamp(a.createdAt) - timestamp(b.createdAt); })
      .forEach(function (t) {
        counters[t.collection] = (counters[t.collection] || 0) + 1;
        if (!t.code) {
          var match = String(t.folder || '').match(/^([a-z]{2,4})[-_]?(\d{1,3})$/i);
          var prefix = collectionConfig(t.collection).code || t.collection.slice(0, 2);
          t.code = match
            ? match[1].toUpperCase() + pad2(match[2])
            : String(prefix).toUpperCase() + pad2(counters[t.collection]);
        }
        byCode[t.code] = t;
        if (t.id) { byCode[t.id] = t; }
      });

    return valid;
  }

  /* Configured collections first, in their order; any others after them. */
  function groupByCollection(list) {
    var order = COLLECTIONS.map(function (c) { return String(c.key).toLowerCase(); });
    var groups = {};

    list.forEach(function (t) {
      if (!groups[t.collection]) {
        groups[t.collection] = [];
        if (order.indexOf(t.collection) === -1) { order.push(t.collection); }
      }
      groups[t.collection].push(t);
    });

    return order
      .filter(function (key) { return groups[key]; })
      .map(function (key) {
        return {
          key: key,
          label: collectionLabel(key),
          items: groups[key].sort(function (a, b) {
            return (timestamp(b.createdAt) - timestamp(a.createdAt)) || a.code.localeCompare(b.code);
          })
        };
      });
  }

  function isNew(t) {
    var added = timestamp(t.createdAt);
    var age = Date.now() - added;
    return added > 0 && age >= 0 && age <= (Number(CONFIG.newForDays) || 0) * DAY_MS;
  }

  /* ---- markup ---- */

  function featureItems(t) {
    return (t.music ? '<li class="features__item">' + icon('music') + 'Music</li>' : '') +
           (t.rsvp ? '<li class="features__item">' + icon('rsvp') + 'RSVP</li>' : '') +
           (t.multilingual ? '<li class="features__item features__item--lang">' + icon('lang') + 'Languages</li>' : '');
  }

  function priceItems(t) {
    var reduced = Number(t.originalPrice) > Number(t.price);
    return '<span class="price__now">' + money(t.price) + '</span>' +
           (reduced ? '<s class="price__was"><span class="visually-hidden">was </span>' + money(t.originalPrice) + '</s>' : '');
  }

  function phoneMarkup(poster) {
    return '<span class="phone">' +
        '<span class="phone__body"><span class="phone__screen">' +
          '<img class="phone__poster" src="' + esc(poster) + '" alt="" loading="lazy" decoding="async" draggable="false">' +
          '<span class="phone__coming" hidden>Preview<br>coming soon</span>' +
          '<span class="phone__sheen"></span>' +
          '<span class="phone__play">' + icon('play') + '</span>' +
          '<span class="watermark">' + esc(BRAND) + '</span>' +
        '</span></span>' +
        '<span class="phone__shadow"></span>' +
      '</span>';
  }

  function cardMarkup(t) {
    var code = esc(t.code);
    var features = featureItems(t);
    var enquiry = whatsappUrl(withCode(CONFIG.enquiryMessage, t.code));

    return '<article class="card">' +
        '<button class="card__trigger" type="button" data-template="' + code + '" aria-label="Play the preview of ' + code + '">' +
          phoneMarkup(t.posterPath) +
        '</button>' +
        '<h3 class="card__name">' + code + (isNew(t) ? ' <span class="card__badge">New</span>' : '') + '</h3>' +
        '<p class="card__desc">' + esc(t.description) + '</p>' +
        (features ? '<ul class="features">' + features + '</ul>' : '') +
        '<div class="card__foot">' +
          '<p class="price">' + priceItems(t) + '</p>' +
          '<a class="btn card__cta" href="' + esc(enquiry) + '" target="_blank" rel="noopener"' +
            ' aria-label="Enquire on WhatsApp about ' + code + '">' + icon('wa') + '<span>Enquire</span></a>' +
          '<button class="link-cta" type="button" data-template="' + code + '" aria-label="Play the preview of ' + code + '">' +
            icon('play') + '<span>Play preview</span>' +
          '</button>' +
        '</div>' +
      '</article>';
  }

  function collectionMarkup(group) {
    var key = esc(group.key);
    var count = group.items.length;

    return '<section class="collection" id="' + key + '" data-accent="' + key + '" aria-labelledby="title-' + key + '">' +
        '<div class="wrap">' +
          '<header class="collection__head">' +
            '<span class="collection__mark" aria-hidden="true"></span>' +
            '<h2 class="collection__title" id="title-' + key + '">' + esc(group.label) + '</h2>' +
            '<span class="collection__rule" aria-hidden="true"></span>' +
            '<span class="collection__count">' + count + (count === 1 ? ' design' : ' designs') + '</span>' +
          '</header>' +
          '<div class="grid" data-count="' + Math.min(count, 4) + '">' + group.items.map(cardMarkup).join('') + '</div>' +
        '</div>' +
      '</section>';
  }

  /* ---- catalogue ---- */

  function renderCatalogue() {
    var host = document.getElementById('collections');
    var empty = document.getElementById('collections-empty');
    var groups = groupByCollection(prepare(REGISTRY));

    host.innerHTML = groups.map(collectionMarkup).join('');
    host.classList.add('is-rendered');
    empty.hidden = groups.length > 0;

    // The header lists only the collections that actually have designs.
    var nav = document.querySelector('.site-nav__list');
    if (nav) {
      nav.innerHTML = groups.map(function (group) {
        return '<li><a class="site-nav__link" href="#' + esc(group.key) + '">' + esc(titleCase(group.key)) + '</a></li>';
      }).join('');
    }

    host.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-template]');
      if (trigger) { openPreview(trigger.getAttribute('data-template'), trigger); }
    });

    // A missing poster is replaced by the "coming soon" plate.
    host.addEventListener('error', function (event) {
      var img = event.target;
      if (!img.classList || !img.classList.contains('phone__poster')) { return; }
      img.hidden = true;
      img.parentNode.querySelector('.phone__coming').hidden = false;
    }, true);
  }

  /* ---- large preview ---- */

  var modal = {};

  function setupPreview() {
    var dialog = document.getElementById('preview-modal');
    if (!dialog || typeof dialog.showModal !== 'function') { return; }

    modal = {
      dialog: dialog,
      phone: document.getElementById('modal-phone'),
      poster: document.getElementById('modal-poster'),
      video: document.getElementById('modal-video'),
      coming: document.getElementById('modal-coming'),
      replay: document.getElementById('modal-replay'),
      code: '',
      opener: null,
      active: false,
      closeTimer: null
    };

    var video = modal.video;
    video.muted = true;

    dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-close]')) { closePreview(); }
    });
    // Esc: run the closing animation instead of closing at once.
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      closePreview();
    });
    dialog.addEventListener('close', finishClose);

    document.getElementById('modal-share').addEventListener('click', shareDesign);

    video.addEventListener('loadeddata', function () { video.classList.add('is-ready'); });
    video.addEventListener('play', function () { modal.replay.hidden = true; });
    // The preview plays once, then offers to play again.
    video.addEventListener('ended', function () { modal.replay.hidden = false; });
    video.addEventListener('error', function () {
      if (!video.getAttribute('src')) { return; }
      video.classList.remove('is-ready');
      if (modal.poster.hidden) { modal.coming.hidden = false; }
    });

    modal.poster.addEventListener('error', function () {
      modal.poster.hidden = true;
      if (!video.classList.contains('is-ready')) { modal.coming.hidden = false; }
    });

    modal.replay.addEventListener('click', function () {
      video.currentTime = 0;
      video.play().catch(noop);
    });

    video.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  }

  /* The transform that puts the large phone exactly over the card's phone. */
  function transformFrom(source, target) {
    if (!source || !target) { return ''; }
    var s = source.getBoundingClientRect();
    var t = target.getBoundingClientRect();
    if (!s.height || !t.height) { return ''; }

    var dx = (s.left + s.width / 2) - (t.left + t.width / 2);
    var dy = (s.top + s.height / 2) - (t.top + t.height / 2);
    return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + (s.height / t.height).toFixed(4) + ')';
  }

  function sourcePhone(code) {
    return document.querySelector('.card__trigger[data-template="' + CSS.escape(code) + '"] .phone');
  }

  function fillPreview(t) {
    document.getElementById('modal-eyebrow').textContent = collectionLabel(t.collection);
    document.getElementById('modal-title').textContent = t.code;
    document.getElementById('modal-desc').textContent = t.description || '';

    var features = document.getElementById('modal-features');
    features.innerHTML = featureItems(t);
    features.hidden = !features.innerHTML;

    document.getElementById('modal-price').innerHTML = priceItems(t);

    var deal = document.getElementById('modal-deal');
    var saving = Number(t.originalPrice) - Number(t.price);
    deal.hidden = !(CONFIG.saleLabel && saving > 0);
    deal.innerHTML = deal.hidden ? '' :
      '<span class="price__deal-label">' + esc(CONFIG.saleLabel) + '</span>' +
      '<span class="price__deal-save">Save ' + money(saving) + '</span>';

    var enquire = document.getElementById('modal-wa');
    enquire.href = whatsappUrl(withCode(CONFIG.enquiryMessage, t.code));
    enquire.setAttribute('aria-label', 'Enquire on WhatsApp about ' + t.code);

    document.getElementById('modal-share').setAttribute('aria-label', 'Share ' + t.code + ' with family');
  }

  function loadMedia(t) {
    modal.coming.hidden = true;
    modal.replay.hidden = true;
    modal.poster.hidden = false;
    modal.poster.src = t.posterPath;

    modal.video.classList.remove('is-ready');
    if (t.previewPath) {
      modal.video.src = t.previewPath;
      modal.video.play().catch(noop);
    }
  }

  function stopMedia() {
    var video = modal.video;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.classList.remove('is-ready');
    modal.replay.hidden = true;
  }

  function openPreview(code, opener) {
    var t = byCode[code];
    var dialog = modal.dialog;
    if (!t || !dialog) { return; }

    clearTimeout(modal.closeTimer);
    if (!dialog.open) {
      modal.opener = opener || document.querySelector('.card__trigger[data-template="' + CSS.escape(t.code) + '"]');
    }
    modal.code = t.code;

    fillPreview(t);
    loadMedia(t);

    if (!dialog.open) {
      document.body.classList.add('is-locked');
      dialog.showModal();
      modal.active = true;
    }

    // Start the large phone over the card's phone, then let it travel to centre.
    var from = reducedMotion.matches ? '' : transformFrom(sourcePhone(t.code), modal.phone);
    if (from) {
      modal.phone.style.transition = 'none';
      modal.phone.style.transform = from;
      modal.phone.getBoundingClientRect();
      modal.phone.style.transition = '';
    }
    dialog.getBoundingClientRect();
    dialog.classList.add('is-open');
    modal.phone.style.transform = '';
  }

  function closePreview() {
    var dialog = modal.dialog;
    if (!dialog || !dialog.open || !dialog.classList.contains('is-open')) { return; }

    dialog.classList.remove('is-open');
    var back = reducedMotion.matches ? '' : transformFrom(sourcePhone(modal.code), modal.phone);
    if (back) { modal.phone.style.transform = back; }

    modal.closeTimer = setTimeout(function () {
      dialog.close();
      finishClose();
    }, reducedMotion.matches ? 0 : (back ? 600 : 400));
  }

  /* Runs once per opening: after our own close, or on the dialog's close
     event when the browser closes it some other way. */
  function finishClose() {
    if (!modal.active) { return; }
    modal.active = false;
    clearTimeout(modal.closeTimer);
    modal.dialog.classList.remove('is-open');
    document.body.classList.remove('is-locked');

    modal.phone.style.transition = 'none';
    modal.phone.style.transform = '';
    modal.phone.getBoundingClientRect();
    modal.phone.style.transition = '';

    stopMedia();
    modal.code = '';
    if (modal.opener && modal.opener.isConnected) {
      modal.opener.focus({ preventScroll: true });
    }
  }

  function shareDesign() {
    var t = byCode[modal.code];
    if (!t) { return; }

    var url = window.location.href.split('#')[0] + '#' + encodeURIComponent(t.code);
    var text = withCode(CONFIG.shareMessage || 'Have a look at this wedding invitation design, {template}:', t.code);

    if (navigator.share) {
      navigator.share({ title: BRAND + ' ' + t.code, text: text, url: url }).catch(noop);
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
    }
  }

  /* ---- a link for every design (#HN01) ----
     A shared link brings the visitor to that design's card. The preview
     itself only ever opens when someone taps it. */

  function scrollToDesign(smooth) {
    var code = '';
    try { code = decodeURIComponent(window.location.hash.slice(1)); } catch (err) { return; }

    var card = byCode[code] && sourcePhone(byCode[code].code);
    if (!card) { return; }

    var html = document.documentElement;
    if (!smooth) { html.style.scrollBehavior = 'auto'; }
    card.closest('.card').scrollIntoView({ block: 'center' });
    html.style.scrollBehavior = '';
  }

  /* ---- links, prices, testimonials ---- */

  function setupLinks() {
    var general = whatsappUrl(CONFIG.generalMessage);
    ['hero-wa', 'header-wa', 'process-wa', 'faq-wa', 'float-wa'].forEach(function (id) {
      var link = document.getElementById(id);
      if (link) { link.href = general; }
    });

    document.getElementById('custom-wa').href = whatsappUrl(CONFIG.customMessage);
    document.getElementById('footer-whatsapp').href = whatsappUrl('');

    var instagram = document.getElementById('footer-instagram');
    if (CONFIG.instagramUrl) { instagram.href = CONFIG.instagramUrl; }
    else { instagram.parentNode.hidden = true; }

    // Discourage saving the preview media. Page text stays selectable.
    document.addEventListener('contextmenu', function (event) {
      if (event.target.closest('.phone, .hero__rail')) { event.preventDefault(); }
    });
  }

  /* Elements marked data-price carry a sensible default in the HTML; this
     keeps them in step with templates.js and the config. */
  function setupPrices() {
    var prices = REGISTRY
      .map(function (t) { return Number(t && t.price); })
      .filter(function (n) { return n > 0; });

    var values = {
      from: prices.length ? Math.min.apply(null, prices) : 0,
      custom: Number(CONFIG.customPrice) || 0
    };

    document.querySelectorAll('[data-price]').forEach(function (el) {
      var value = values[el.getAttribute('data-price')];
      if (value > 0) { el.textContent = money(value); }
    });
  }

  function setupTestimonials() {
    var section = document.getElementById('kind-words');
    var list = document.getElementById('words-list');
    var notes = (Array.isArray(CONFIG.testimonials) ? CONFIG.testimonials : [])
      .filter(function (note) { return note && note.quote && note.name; });
    if (!section || !notes.length) { return; }

    list.innerHTML = notes.map(function (note) {
      var design = byCode[note.design]
        ? '<span>Their design: <a class="word__design" href="#' + esc(byCode[note.design].code) + '">' + esc(byCode[note.design].code) + '</a></span>'
        : '';
      return '<figure class="word">' +
          '<blockquote class="word__quote"><p>' + esc(note.quote) + '</p></blockquote>' +
          '<figcaption class="word__by">' +
            '<span><span class="word__name">' + esc(note.name) + '</span>' + (note.place ? ', ' + esc(note.place) : '') + '</span>' +
            design +
          '</figcaption>' +
        '</figure>';
    }).join('');
    section.hidden = false;
  }

  /* ---- header, floating button, section highlight ---- */

  function setupScrollState() {
    var header = document.querySelector('.site-header');
    var hero = document.querySelector('.hero');
    var footer = document.querySelector('.site-footer');
    var floatWa = document.getElementById('float-wa');

    // Two or three rect reads per scroll event: cheap, and never out of step.
    function update() {
      var headerBottom = header.getBoundingClientRect().bottom;
      var heroBottom = hero.getBoundingClientRect().bottom;
      var footerTop = footer.getBoundingClientRect().top;
      var overSilk = heroBottom > headerBottom || footerTop < headerBottom;
      var scrolled = window.scrollY > 8;

      header.classList.toggle('is-over-masthead', overSilk);
      header.classList.toggle('is-stuck', !overSilk && scrolled);
      header.classList.toggle('is-scrolled', scrolled);

      // Shown between the masthead and the footer, which has its own link.
      floatWa.classList.toggle('is-shown',
        heroBottom < window.innerHeight * 0.25 && footerTop > window.innerHeight - 80);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (document.fonts) { document.fonts.ready.then(update); }
    update();
  }

  function setupSectionHighlight() {
    var sections = document.querySelectorAll('.collection');
    if (!sections.length || !('IntersectionObserver' in window)) { return; }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });

      var current = '';
      sections.forEach(function (section) { if (visible[section.id]) { current = section.id; } });

      document.querySelectorAll('.site-nav__link').forEach(function (link) {
        var active = link.getAttribute('href') === '#' + current;
        link.classList.toggle('is-active', active);
        if (active) { link.setAttribute('aria-current', 'location'); }
        else { link.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* On a wide screen the custom-build offer sits before the catalogue. On a
     phone that put a full screen of it ahead of the first design, so there it
     moves to just after the collections. Moving the element (rather than CSS
     reordering) keeps reading and tab order matching what is on screen. */
  function setupCustomPlacement() {
    var custom = document.querySelector('.custom');
    var process = document.querySelector('.process');
    var home = custom.nextElementSibling;
    var narrow = window.matchMedia('(max-width: 600px)');

    function place() {
      var hasDesigns = !!document.querySelector('.collection');
      if (narrow.matches && hasDesigns) {
        process.parentNode.insertBefore(custom, process);
        custom.classList.add('is-after-collections');
      } else if (custom.nextElementSibling !== home) {
        home.parentNode.insertBefore(custom, home);
        custom.classList.remove('is-after-collections');
      }
    }

    place();
    narrow.addEventListener('change', place);
  }

  /* ---- start ---- */

  function init() {
    renderCatalogue();
    setupPreview();
    setupLinks();
    setupPrices();
    setupTestimonials();
    setupCustomPlacement();
    setupScrollState();
    setupSectionHighlight();

    document.getElementById('footer-year').textContent = String(new Date().getFullYear());

    window.addEventListener('hashchange', function () { scrollToDesign(true); });
    scrollToDesign(false);

    // The header's initial state is set; from here on its changes animate.
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('is-booting');
    });
  }

  init();
}());
