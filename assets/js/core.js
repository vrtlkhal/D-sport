/* CAPOFIT — motion engine (shared by site-a & site-b)
   GSAP 3 + ScrollTrigger + Lenis. Sites plug in through CF.hooks:
   CF.hooks = { loader(done), enter(), leave(url, done), intro(), page() } */
(() => {
  const CF = (window.CF = window.CF || {});
  CF.hooks = CF.hooks || {};
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  Object.assign(CF, { reduce, fine, velocity: 0 });
  if (fine) html.classList.add('fine');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  CF.$ = $; CF.$$ = $$;

  /* ---------- WhatsApp & small utilities (work without GSAP) ---------- */
  const waNumber = html.dataset.wa || '262690000000';
  CF.waLink = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg || 'Bonjour ! Je souhaite des infos sur Projet-D.')}`;
  $$('[data-wa]').forEach((a) => { a.href = CF.waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-wa-form]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f), lines = ['Bonjour, je suis ' + (d.get('nom') || '…') + '.'];
    if (d.get('formule')) lines.push('Je suis intéressé·e par : ' + d.get('formule') + '.');
    if (d.get('message')) lines.push(d.get('message'));
    window.open(CF.waLink(lines.join('\n')), '_blank');
  }));
  const clockFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Indian/Reunion', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => $$('[data-clock]').forEach((el) => (el.textContent = clockFmt.format(new Date())));
  tickClock(); setInterval(tickClock, 20000);
  $$('[data-countdown]').forEach((el) => {
    const d = Math.ceil((new Date(el.dataset.countdown) - new Date()) / 864e5);
    el.textContent = d > 1 ? 'J-' + d : d === 1 ? 'Demain' : d === 0 ? "Aujourd'hui" : 'Prochaine date bientôt';
  });
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  if (!window.gsap || !window.ScrollTrigger) { html.classList.add('no-motion'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (/[?&]capture/.test(location.search)) ScrollTrigger.defaults({ pinType: 'transform' }); /* for static screenshot tools */
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });
  const mm = (CF.mm = gsap.matchMedia());

  /* ---------- Lenis (wheel smoothing only; touch stays native for iOS feel) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  }
  CF.lenis = lenis;
  CF.lock = (on) => { html.classList.toggle('is-locked', on); lenis && (on ? lenis.stop() : lenis.start()); };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* global velocity (px/s), decays every frame */
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => (CF.velocity = s.getVelocity()) });
  gsap.ticker.add(() => (CF.velocity *= 0.9));

  /* ---------- Split text: words → masked spans; optional chars; lines computed ---------- */
  CF.split = (el, chars) => {
    if (el._split) return el._split;
    const words = [], letters = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi';
            if (chars) [...part].forEach((ch) => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; wi.appendChild(c); letters.push(c); });
            else wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w); words.push(wi);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    const lines = [];
    let top = null;
    words.forEach((wi) => { const t = Math.round(wi.parentNode.offsetTop); if (t !== top) { lines.push([]); top = t; } lines[lines.length - 1].push(wi); });
    el._split = { words, chars: letters, lines };
    gsap.set(el, { visibility: 'visible' });
    return el._split;
  };
  CF.splitIn = (el, opt = {}) => {
    const mode = el.dataset.split || 'lines';
    const s = CF.split(el, mode === 'chars');
    const targets = mode === 'chars' ? s.chars : mode === 'words' ? s.words : s.lines;
    gsap.set(mode === 'chars' ? s.chars : s.words, { yPercent: 115 });
    return gsap.to(targets.flat ? targets.flat() : targets, {
      yPercent: 0, duration: opt.duration || 1.15, ease: 'expo.out', paused: !!opt.paused, delay: opt.delay || 0,
      stagger: mode === 'chars' ? 0.025 : mode === 'words' ? 0.05 : { each: 0.09, from: 'start' },
      ...(mode === 'lines' ? {} : {}),
    });
  };
  /* lines mode needs per-line staggering of word groups */
  const lineTween = (el, delay = 0) => {
    const s = CF.split(el, false);
    gsap.set(s.words, { yPercent: 115 });
    const tl = gsap.timeline({ delay });
    s.lines.forEach((ln, i) => tl.to(ln, { yPercent: 0, duration: 1.15 }, i * 0.08));
    return tl;
  };
  CF.reveal = (el, delay = 0) => ((el.dataset.split || 'lines') === 'lines' ? lineTween(el, delay) : CF.splitIn(el, { delay }));

  /* ---------- Auto behaviours ---------- */
  function autoReveals() {
    /* horizontal pinned rails (desktop only) */
    mm.add('(min-width: 900px)', () => {
      $$('[data-hscroll]').forEach((sec) => {
        const track = $('.h-track', sec);
        const dist = () => track.scrollWidth - innerWidth;
        const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$('[data-h-par]', track).forEach((img) => gsap.fromTo(img, { xPercent: -12 }, { xPercent: 12, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
      });
    });
    $$('[data-split]:not([data-manual])').forEach((el) => {
      CF.split(el, el.dataset.split === 'chars');
      const tl = CF.reveal(el); tl.pause();
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tl.play() });
    });
    $$('[data-reveal]:not([data-manual])').forEach((el) => {
      const kind = el.dataset.reveal;
      const from = kind === 'clip' ? { clipPath: 'inset(100% 0% 0% 0%)' } : kind === 'scale' ? { scale: 0.6, autoAlpha: 0 } : kind === 'fade' ? { autoAlpha: 0 } : { y: 60, autoAlpha: 0 };
      const to = kind === 'clip' ? { clipPath: 'inset(0% 0% 0% 0%)' } : kind === 'scale' ? { scale: 1, autoAlpha: 1 } : { y: 0, autoAlpha: 1 };
      gsap.fromTo(el, from, { ...to, duration: 1.3, delay: +el.dataset.delay || 0, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-stagger]').forEach((g) => {
      const kids = [...g.children];
      gsap.fromTo(kids, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1.1, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });
    $$('[data-speed]').forEach((el) => {
      const sp = parseFloat(el.dataset.speed);
      gsap.fromTo(el, { y: () => -sp * innerHeight * 0.25 }, { y: () => sp * innerHeight * 0.25, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    $$('[data-parallax-img]').forEach((img) => {
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-rotate]').forEach((el) => gsap.to(el, { rotation: +el.dataset.rotate, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }));
    $$('[data-count]').forEach((el) => {
      const o = { v: 0 }, end = +el.dataset.count, pad = (el.dataset.pad || '').length;
      gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(pad, '0')) });
    });
    /* progress bar for long reads */
    $$('[data-progress]').forEach((bar) => {
      const target = $(bar.dataset.progress) || document.body;
      gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: target, start: 'top top', end: 'bottom bottom', scrub: true } });
    });
    /* velocity-reactive marquees */
    $$('[data-marquee]').forEach((m) => {
      const track = $('.mq-track', m); track.innerHTML += track.innerHTML;
      const tw = gsap.to(track, { xPercent: -50, ease: 'none', duration: +m.dataset.marquee || 28, repeat: -1 });
      let dir = m.dataset.dir === 'rev' ? -1 : 1, base = dir;
      gsap.ticker.add(() => {
        const v = CF.velocity; if (Math.abs(v) > 20) dir = Math.sign(v) * base;
        tw.timeScale(gsap.utils.interpolate(tw.timeScale(), dir * (1 + Math.min(Math.abs(v) / 450, 6)), 0.12));
      });
    });
    /* velocity skew on media */
    const skews = $$('[data-skew]');
    if (skews.length && !reduce) {
      const setters = skews.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }));
      gsap.ticker.add(() => { const s = gsap.utils.clamp(-6, 6, CF.velocity / -300); setters.forEach((f) => f(s)); });
    }
    /* sticky stack: each card recedes as the next lands */
    $$('[data-stack]').forEach((st) => {
      const cards = $$('.stack-card', st);
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.to(c, { scale: 0.9, yPercent: -4, filter: 'brightness(.75)', ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
      });
    });
  }

  /* ---------- Magnetic + cursor (fine pointers only) ---------- */
  function pointer() {
    if (!fine || reduce) return;
    $$('[data-magnetic]').forEach((el) => {
      const xT = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), yT = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      const k = +el.dataset.magnetic || 0.35;
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * k); yT((e.clientY - r.top - r.height / 2) * k); });
      el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1,.35)' }); });
    });
    const cur = document.createElement('div'); cur.className = 'cursor'; cur.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(cur);
    const label = $('.cursor-label', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (!t) return cur.classList.remove('is-big', 'is-link');
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; cur.classList.add('is-big'); cur.classList.remove('is-link'); }
      else { cur.classList.add('is-link'); cur.classList.remove('is-big'); }
    });
  }

  /* ---------- Menu ---------- */
  function menu() {
    const m = $('.menu'); if (!m) return;
    const links = $$('.menu [data-menu-link]');
    links.forEach((l) => CF.split(l, false));
    const toggle = (open) => {
      html.classList.toggle('menu-open', open); CF.lock(open);
      $$('[data-menu-toggle]').forEach((b) => b.setAttribute('aria-expanded', open));
      if (open) gsap.fromTo(links.flatMap((l) => l._split.words), { yPercent: 115 }, { yPercent: 0, stagger: 0.04, duration: 1, delay: 0.25 });
    };
    $$('[data-menu-toggle]').forEach((b) => b.addEventListener('click', () => toggle(!html.classList.contains('menu-open'))));
    addEventListener('keydown', (e) => e.key === 'Escape' && html.classList.contains('menu-open') && toggle(false));
  }

  /* ---------- Lightbox ---------- */
  function lightbox() {
    const items = $$('[data-lightbox]'); if (!items.length) return;
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<div class="lb-bg"></div><figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure><button class="lb-btn lb-prev" aria-label="Précédente">←</button><button class="lb-btn lb-next" aria-label="Suivante">→</button><button class="lb-btn lb-close" aria-label="Fermer">✕</button><div class="lb-count"></div>';
    document.body.appendChild(lb);
    const img = $('img', lb), cap = $('.lb-cap', lb), cnt = $('.lb-count', lb);
    let i = 0, open = false;
    const show = (n, dir = 0) => {
      i = (n + items.length) % items.length;
      const it = items[i];
      gsap.fromTo(img, { xPercent: dir * 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.8 });
      img.src = it.dataset.full || it.currentSrc || it.src; img.alt = it.alt || '';
      cap.textContent = it.dataset.caption || it.alt || '';
      cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    };
    const setOpen = (o, n) => {
      open = o; CF.lock(o); lb.classList.toggle('is-open', o);
      if (o) { show(n); gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }); gsap.fromTo('.lb-fig', { scale: 0.92 }, { scale: 1, duration: 1 }); }
      else gsap.to(lb, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
    };
    items.forEach((it, n) => { it.style.cursor = 'zoom-in'; it.addEventListener('click', () => setOpen(true, n)); });
    $('.lb-prev', lb).onclick = () => show(i - 1, -1);
    $('.lb-next', lb).onclick = () => show(i + 1, 1);
    $('.lb-close', lb).onclick = $('.lb-bg', lb).onclick = () => setOpen(false);
    addEventListener('keydown', (e) => { if (!open) return; if (e.key === 'Escape') setOpen(false); if (e.key === 'ArrowLeft') show(i - 1, -1); if (e.key === 'ArrowRight') show(i + 1, 1); });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => (sx = e.clientX));
    lb.addEventListener('pointerup', (e) => { if (sx === null) return; const d = e.clientX - sx; if (Math.abs(d) > 50) show(i + (d < 0 ? 1 : -1), d < 0 ? 1 : -1); sx = null; });
  }

  /* ---------- Filter chips ---------- */
  function filters() {
    $$('[data-filter-group]').forEach((g) => {
      const list = $(g.dataset.filterGroup); if (!list) return;
      $$('[data-filter]', g).forEach((b) => b.addEventListener('click', () => {
        $$('[data-filter]', g).forEach((x) => x.classList.toggle('is-active', x === b));
        const f = b.dataset.filter, items = $$('[data-cat]', list);
        gsap.to(items, { autoAlpha: 0, y: 20, duration: 0.25, ease: 'power2.in', onComplete: () => {
          items.forEach((it) => (it.style.display = f === 'all' || it.dataset.cat === f ? '' : 'none'));
          gsap.to(items.filter((it) => it.style.display !== 'none'), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.8 });
          ScrollTrigger.refresh();
        } });
      }));
    });
  }

  /* ---------- Page transitions ---------- */
  function transitions() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a) return;
      const href = a.getAttribute('href') || '';
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href) || !/\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      sessionStorage.setItem('cf-origin', JSON.stringify({ x: e.clientX / innerWidth, y: e.clientY / innerHeight }));
      const go = () => (location.href = href);
      if (reduce || !CF.hooks.leave) return go();
      if (html.classList.contains('menu-open')) { html.classList.remove('menu-open'); }
      CF.hooks.leave(href, go);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  }

  /* ---------- Boot ---------- */
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => {
    menu(); lightbox(); filters(); transitions(); pointer();
    CF.hooks.page && CF.hooks.page();
    autoReveals();
    const first = !sessionStorage.getItem('cf-seen'); sessionStorage.setItem('cf-seen', '1');
    const start = () => { CF.hooks.intro && CF.hooks.intro(); ScrollTrigger.refresh(); };
    if (reduce) { gsap.set('.pt, .loader', { autoAlpha: 0 }); return start(); }
    if (first && CF.hooks.loader) CF.hooks.loader(start);
    else if (CF.hooks.enter) CF.hooks.enter(start);
    else start();
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
