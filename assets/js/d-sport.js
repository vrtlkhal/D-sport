/* PROJET-D — « Pop Flow × Braise » choreography (plugs into core.js through CF.hooks) */
(() => {
  const CF = (window.CF = window.CF || {});
  const H = (CF.hooks = CF.hooks || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- hero video guard: plays it, shows a ▶ if autoplay is blocked, and falls back to a
     JPEG frame sequence in browsers without a working video demuxer (VS Code's). ?debug shows a panel. ---------- */
  (function videoGuard() {
    const v = $('.hero-video'); if (!v) return;
    const dbg = /[?&]debug/.test(location.search), info = []; let panel;
    if (dbg) {
      panel = document.createElement('pre');
      panel.style.cssText = 'position:fixed;z-index:9999;left:8px;top:8px;max-width:92vw;margin:0;padding:10px;background:#000;color:#0f0;font:12px/1.4 monospace;white-space:pre-wrap;pointer-events:none';
      document.body.appendChild(panel);
      addEventListener('error', (e) => log('JS error: ' + e.message));
    }
    function log(m) { info.push(m); if (panel) panel.textContent = info.join('\n'); }
    log('UA: ' + navigator.userAgent);
    log('canPlay webm: "' + v.canPlayType('video/webm; codecs="vp9"') + '"  mp4: "' + v.canPlayType('video/mp4; codecs="avc1.42E01E"') + '"');
    ['loadstart', 'loadedmetadata', 'canplay', 'playing', 'pause', 'stalled', 'error', 'abort'].forEach((ev) =>
      v.addEventListener(ev, () => log(ev + ' rs=' + v.readyState + ' ns=' + v.networkState + (v.error ? ' ERR ' + v.error.code + ' ' + v.error.message : '') + ' src=' + v.currentSrc)));
    const showBtn = () => {
      if ($('.hero-play')) return;
      const b = document.createElement('button');
      b.className = 'hero-play mono'; b.type = 'button'; b.textContent = '▶ Lecture';
      b.addEventListener('click', () => v.play().then(() => b.remove()).catch((e) => log('click play failed: ' + e.name)));
      (v.closest('.hero') || document.body).appendChild(b);
    };
    const p = v.play();
    p && p.then(() => log('play() ok')).catch((e) => { log('play() blocked: ' + e.name); if (e.name === 'NotAllowedError') showBtn(); });
    let fb = false;
    const useFrames = () => {
      if (fb) return; fb = true;
      const img = $('.hero-media img'); if (!img) return;
      log('video unavailable -> frame sequence fallback');
      v.style.display = 'none';
      const N = 143, frames = [];
      for (let k = 1; k <= N; k++) { const im = new Image(); im.src = 'assets/video/frames/f' + String(k).padStart(3, '0') + '.jpg'; frames.push(im); }
      let idx = 0, last = 0;
      const tick = (t) => {
        if (t - last >= 100) { const f = frames[idx % N]; if (f.complete && f.naturalWidth) { img.src = f.src; idx++; last = t; } }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    v.addEventListener('error', (e) => { if (e.target !== v && e.target === v.querySelector('source:last-of-type')) useFrames(); }, true);
    setTimeout(() => { if (v.error || v.networkState === 3) useFrames(); }, 1500);
    setTimeout(() => {
      if (!v.paused && v.currentTime > 0) return;
      if (v.paused && !fb) showBtn();
      if (v.readyState < 2) useFrames();
    }, 6000);
  })();

  /* ---------- loader: bouncing dots + counter, never longer than ~3 s ---------- */
  H.loader = (done) => {
    const L = $('.loader'); if (!L) return done();
    const count = $('.loader-count', L), o = { v: 0 };
    const imgs = $$('img:not([loading="lazy"])').slice(0, 4), vid = $('.hero-video'); let loaded = 0;
    imgs.forEach((im) => { if (im.complete) loaded++; else { im.addEventListener('load', () => loaded++, { once: true }); im.addEventListener('error', () => loaded++, { once: true }); } });
    const total = imgs.length + (vid ? 1 : 0), t0 = performance.now();
    if (vid) { if (vid.readyState >= 3) loaded++; else { vid.addEventListener('canplay', () => loaded++, { once: true }); vid.addEventListener('error', () => loaded++, { once: true }); } }
    gsap.fromTo('.loader-dots i', { y: 0 }, { y: -40, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: -1, stagger: 0.12 });
    const tick = () => {
      const real = total ? (loaded / total) * 100 : 100, timed = ((performance.now() - t0) / 3000) * 100;
      o.v += (Math.max(real, timed, o.v + 0.5) - o.v) * 0.08;
      count.textContent = String(Math.min(100, Math.round(o.v))).padStart(3, '0');
      if (o.v < 99.5) requestAnimationFrame(tick); else finish();
    };
    const finish = () => {
      count.textContent = '100';
      gsap.timeline({ onComplete: () => L.remove() })
        .to('.loader-dots i', { scale: 0, duration: 0.5, stagger: 0.06, ease: 'back.in(2)' })
        .to(L, { clipPath: 'circle(0% at 50% 50%)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
        .add(done, '-=.55');
    };
    gsap.set(L, { clipPath: 'circle(150% at 50% 50%)' });
    setTimeout(tick, 400);
  };

  /* ---------- page transitions: a disc grows from the click point ---------- */
  const origin = () => { let o = { x: 0.5, y: 0.5 }; try { o = JSON.parse(sessionStorage.getItem('cf-origin')) || o; } catch (e) {} return `${(o.x * 100).toFixed(1)}% ${(o.y * 100).toFixed(1)}%`; };
  H.enter = (done) => {
    $('.loader') && $('.loader').remove();
    const at = origin();
    gsap.timeline().set('.pt', { autoAlpha: 1, clipPath: `circle(150% at ${at})` })
      .to('.pt', { clipPath: `circle(0% at ${at})`, duration: 1.1, ease: 'expo.inOut' }, 0.05)
      .set('.pt', { autoAlpha: 0 }).add(done, 0.5);
  };
  H.leave = (url, go) => {
    const at = origin();
    gsap.timeline({ onComplete: go }).set('.pt', { autoAlpha: 1, clipPath: `circle(0% at ${at})` })
      .to('.pt', { clipPath: `circle(150% at ${at})`, duration: 0.9, ease: 'expo.inOut' })
      .fromTo('.pt-dot', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.4);
  };

  /* ---------- header intro (home hero + every inner page header) ---------- */
  H.intro = () => {
    const hv = $('.hero-video'); hv && hv.play && hv.play().catch(() => {});
    const head = $('.hero, .phead'); if (!head) return;
    const shapes = $$('.shape', head), title = $('.hero-title, .phead-title', head);
    const tag = $('.hero-tag, .phead-kicker', head), tl = gsap.timeline();
    tl.fromTo(shapes, { scale: 0 }, { scale: 1, duration: 1.6, ease: 'elastic.out(1,.55)', stagger: 0.09 }, 0);
    if (head.classList.contains('hero')) {
      const media = $('.hero-media', head), imgs = $$('img, video', media);
      tl.fromTo(media, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: 1.9, ease: 'expo.inOut' }, 0)
        .fromTo(imgs, { scale: 1.35 }, { scale: 1.06, duration: 2.6, ease: 'expo.out' }, 0.2);
      if (title) {
        tl.add(CF.reveal(title), 0.75);
        tl.fromTo(title, { fontVariationSettings: '"wdth" 62' }, { fontVariationSettings: '"wdth" 125', duration: 2, ease: 'expo.out' }, 0.75);
      }
      if (tag) tl.fromTo(tag, { yPercent: -260, rotation: -24 }, { yPercent: 0, rotation: -4, duration: 1.3, ease: 'back.out(2)' }, 0.65);
      tl.fromTo($$('.hero-pres, .hero-meta > *, .hero-scroll', head), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1 }, 1.1);
    } else {
      const img = $('.phead-img', head), sub = $$('.phead-sub', head);
      if (img) tl.fromTo(img, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 1.7 }, 0.1);
      if (title) tl.add(CF.reveal(title), 0.25);
      if (tag) tl.fromTo(tag, { yPercent: -260, rotation: -24 }, { yPercent: 0, rotation: -4, duration: 1.3, ease: 'back.out(2)' }, 0.65);
      if (sub.length) tl.fromTo(sub, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1 }, 0.75);
    }
  };

  H.page = () => {
    const head = $('.hero, .phead');
    if (head) {
      const isHero = head.classList.contains('hero');
      const title = $('.hero-title, .phead-title', head), shapes = $$('.shape', head);
      title && CF.split(title, title.dataset.split === 'chars');
      gsap.set(shapes, { scale: 0 });
      let img = null;
      if (isHero) gsap.set($('.hero-media', head), { clipPath: 'circle(0% at 50% 100%)' });
      else { img = $('.phead-img', head); img && gsap.set(img, { scale: 0 }); }
      /* scroll-out: the header breathes away */
      const st = { trigger: head, start: 'top top', end: 'bottom top', scrub: true };
      if (isHero) gsap.to($$('.hero-media img, .hero-video', head), { yPercent: 14, ease: 'none', scrollTrigger: st });
      img && gsap.to(img, { yPercent: -18, ease: 'none', scrollTrigger: st });
      title && gsap.to(title, { yPercent: isHero ? -30 : 20, ease: 'none', scrollTrigger: st });
      shapes.forEach((s, i) => gsap.to(s, { y: () => (i % 2 ? -1 : 1) * innerHeight * 0.25, rotation: i % 2 ? 40 : -40, ease: 'none', scrollTrigger: { ...st, invalidateOnRefresh: true } }));
      /* pointer depth (laptop) */
      if (CF.fine && !CF.reduce) {
        const layers = [img, ...shapes].filter(Boolean).map((el, i) => ({ x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }), d: i === 0 && img ? -18 : 14 + i * 8 }));
        head.addEventListener('pointermove', (e) => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); }); });
      }
    }
    navBehaviour(); tz(); cfband(); morphPack(); titleLens(); mobileMotion(); story(); manifest(); clock(); warmOnTouch();
  };

  /* ---------- top menu hidden for the first screen, then always visible ---------- */
  function navBehaviour() {
    const nav = $('.nav'); if (!nav) return;
    const root = document.documentElement;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
      const y = s.scroll(), on = y > innerHeight * 0.9;
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', !on && !root.classList.contains('menu-open'));
      root.classList.toggle('nav-on', on);
    } });
  }

  /* ---------- St-Pierre clock ---------- */
  function tz() {
    if ($('.tz')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="tz mono" aria-hidden="true"><span class="tz-dot"></span><span>St-Pierre, Réunion</span><span data-clock></span></div>');
    const el = $('.tz'), f = $('.foot');
    el.querySelector('[data-clock]').textContent = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Indian/Reunion', hour: '2-digit', minute: '2-digit' }).format(new Date());
    f && CF.fine && matchMedia('(min-width: 1081px)').matches && ScrollTrigger.create({ trigger: f, start: 'top bottom', end: 'max', onUpdate: (s) => el.classList.toggle('is-off', s.progress > 0) });
  }

  /* ---------- Capofit band: a click opens its description as a full-screen panel (not part of the page flow) ---------- */
  function cfband() {
    const b = $('.cfband'), panel = $('#cf-panel'); if (!b || !panel) return;
    const btn = $('[data-unfold]', b), blocks = $$('.cfpanel-head > *, .cf-block, .cf-event, .cf-cta', panel);
    let open = false;
    const set = (o, e) => {
      if (o === open) return; open = o;
      btn.setAttribute('aria-expanded', o); CF.lock(o);
      const at = e && e.clientX !== undefined && (e.clientX || e.clientY) ? `${e.clientX}px ${e.clientY}px` : '50% 50%';
      gsap.killTweensOf([panel, blocks]);
      if (o) {
        panel.scrollTop = 0; panel.classList.add('is-open');
        gsap.fromTo(panel, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 1.1, ease: 'expo.inOut' });
        gsap.fromTo(blocks, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 1, delay: 0.55 });
        panel.setAttribute('data-at', at);
      } else {
        const back = panel.getAttribute('data-at') || '50% 50%';
        gsap.to(panel, { clipPath: `circle(0% at ${back})`, duration: 0.8, ease: 'expo.inOut', onComplete: () => panel.classList.remove('is-open') });
      }
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(!open, e); });
    $('.cfband-head', b).addEventListener('click', (e) => { if (!e.target.closest('a, button')) set(true, e); });
    $$('[data-close-panel]', panel).forEach((x) => x.addEventListener('click', (e) => set(false, e)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
    /* any "Initiation gratuite" link opens the panel instead of scrolling */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-open-band]'); if (!a) return;
      e.preventDefault(); e.stopImmediatePropagation(); set(true, e);
    }, true);
  }

  /* ---------- title lens: inside the cursor circle, title letters swap orange <-> blue ---------- */
  function titleLens() {
    if (!CF.fine || CF.reduce) return;
    const SEL = '.hero-title, .phead-title, .h1, .h2, .h3, .st-q, .st-big, .st-final-t, .cfband-word, .plan-name, .citem-v, .pillar h3, .ocard h3, .post h3, .event-date, .event-cd, .article h2';
    const cur = $('.cursor'); if (!cur) return;
    const R = 62, ORANGE = 'rgb(255,122,61)', BLUE = 'rgb(31,60,255)';
    const ref = { o: [255, 122, 61], b: [31, 60, 255], l: [74, 107, 255] };
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const swap = (c) => {
      const v = (c.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(Number);
      const d = [dist(v, ref.o), dist(v, ref.b), dist(v, ref.l)], m = Math.min(...d);
      return m > 130 ? ORANGE : (d[0] === m ? BLUE : ORANGE);
    };
    const seen = new Set();
    $$(SEL).forEach((el) => {
      if (seen.has(el) || el.closest('.lens')) return; seen.add(el);
      let st = null;
      el.addEventListener('pointerenter', () => {
        if (st) { st.tr = R; return; }
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        const orig = [el, ...el.querySelectorAll('*')], lens = el.cloneNode(true), kids = [lens, ...lens.querySelectorAll('*')];
        orig.forEach((o, i) => kids[i] && kids[i].style.setProperty('color', swap(getComputedStyle(o).color), 'important'));
        lens.classList.add('lens'); lens.removeAttribute('id'); lens.setAttribute('aria-hidden', 'true');
        el.appendChild(lens);
        st = { lens, r: 0, tr: R };
        cur.classList.add('is-lens');
        const loop = () => {
          if (!st) return;
          st.r += (st.tr - st.r) * 0.22;
          const rect = el.getBoundingClientRect(), x = gsap.getProperty(cur, 'x') - rect.left, y = gsap.getProperty(cur, 'y') - rect.top;
          lens.style.clipPath = `circle(${st.r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
          if (st.tr === 0 && st.r < 0.6) { lens.remove(); st = null; return; }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });
      el.addEventListener('pointerleave', () => { if (st) st.tr = 0; cur.classList.remove('is-lens'); });
    });
  }

  /* ---------- morphing: image shapes, SVG blobs, section waves ---------- */
  function morphPack() {
    if (CF.reduce) return;
    const NS = 'http://www.w3.org/2000/svg';
    $$('.post-img, .feature-media, .stack-card .duo').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(16% 16% 16% 16% round 50%)' }, { clipPath: 'inset(0% 0% 0% 0% round 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 45%', scrub: true } });
    });
    const B = ['M100,10 C150,10 190,50 190,100 C190,150 150,190 100,190 C50,190 10,150 10,100 C10,50 50,10 100,10 Z',
               'M110,5 C170,20 195,60 180,110 C165,160 120,195 80,185 C30,172 5,130 20,80 C32,35 70,-8 110,5 Z',
               'M95,15 C140,0 195,45 185,105 C178,150 140,175 95,190 C50,200 15,150 12,100 C10,60 55,28 95,15 Z'];
    $$('main > section.section:not(.contact-compact):not(.bg-rust)').forEach((sec, i) => {
      const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
      svg.setAttribute('viewBox', '0 0 200 200'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('blob');
      path.setAttribute('d', B[0]); path.setAttribute('fill', i % 2 ? '#1F3CFF' : '#FF7A3D'); svg.appendChild(path);
      svg.style.cssText = (i % 2 ? 'right:-12vw;' : 'left:-14vw;') + 'top:' + (6 + (i % 3) * 14) + '%';
      sec.classList.add('has-blob'); sec.prepend(svg);
      const tl = gsap.timeline({ repeat: -1, paused: true });
      tl.to(path, { attr: { d: B[1] }, duration: 5, ease: 'sine.inOut' }).to(path, { attr: { d: B[2] }, duration: 5, ease: 'sine.inOut' }).to(path, { attr: { d: B[0] }, duration: 5, ease: 'sine.inOut' });
      ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
      gsap.fromTo(svg, { yPercent: -20, rotate: -25, scale: 0.8 }, { yPercent: 25, rotate: 35, scale: 1.15, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    const W0 = 'M0,0 L1440,0 L1440,2 C1200,2 960,2 720,2 C480,2 240,2 0,2 Z',
          W1 = 'M0,0 L1440,0 L1440,90 C1200,130 960,10 720,70 C480,130 240,30 0,100 Z',
          W2 = 'M0,0 L1440,0 L1440,110 C1200,40 960,120 720,50 C480,-10 240,100 0,60 Z';
    $$('.wave-bot').forEach((svg) => {
      const path = $('path', svg), end = path.getAttribute('d');
      path.setAttribute('d', W0);
      gsap.timeline({ scrollTrigger: { trigger: svg.parentElement, start: 'bottom 110%', end: 'bottom 20%', scrub: true } }).to(path, { attr: { d: end }, ease: 'none' });
    });
    $$('main > section.bg-umber, main > section.bg-rust, main > section.cfband, main > section.clock, main > section.offers').forEach((sec) => {
      const prev = sec.previousElementSibling; let fill = '#0E0504';
      if (prev) { const c = getComputedStyle(prev).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') fill = c; }
      const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
      svg.setAttribute('viewBox', '0 0 1440 120'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('wave');
      path.setAttribute('d', W0); path.setAttribute('fill', fill); svg.appendChild(path);
      sec.classList.add('has-blob'); sec.prepend(svg);
      gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 95%', end: 'top -30%', scrub: true } })
        .to(path, { attr: { d: W1 }, ease: 'none', duration: 1 }).to(path, { attr: { d: W2 }, ease: 'none', duration: 1 });
    });
  }

  /* ---------- extra motion for phones / small tablets ---------- */
  function mobileMotion() {
    if (CF.reduce || !matchMedia('(max-width: 899px)').matches) return;
    $$('.post-img, .pillar .duo, .ocard-img, .gt-a, .gt-b, .gt-c').forEach((el) => el.setAttribute('data-skew', ''));
    CF.mm.add('(max-width: 899px)', () => {
      $$('.post-img, .pillar .duo, .rail-item, .stack-card .duo').forEach((el) => {
        const img = $('img', el);
        img && gsap.fromTo(img, { yPercent: -9, scale: 1.18 }, { yPercent: 9, scale: 1.18, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('.ocard, .pillar').forEach((el, i) => gsap.from(el, { xPercent: i % 2 ? 8 : -8, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
      const fab = $('.fab');
      if (fab) { gsap.set(fab, { scale: 0, autoAlpha: 0 }); ScrollTrigger.create({ start: () => innerHeight * 0.5, onEnter: () => gsap.to(fab, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2.2)' }), onLeaveBack: () => gsap.to(fab, { scale: 0, autoAlpha: 0, duration: 0.4 }) }); }
      return () => { if (fab) gsap.set(fab, { clearProps: 'all' }); };
    });
  }

  /* ---------- the pinned home narrative (Pop Flow story) ---------- */
  function story() {
    const st = $('.story'); if (!st) return;
    const l1 = $('.st-l1'), l2 = $('.st-l2'), q = $('.st-q'), finT = $('.st-final-t');
    const s1 = CF.split(l1, true), s2 = CF.split(l2, false), sq = CF.split(q, false), sf = CF.split(finT, true);
    const grid = $('.st-grid'), photo = $('.st-photo'), cards = $$('.st-cards .pcard'), items = $$('.st-ticker-list li'), idx = $('.st-ticker-idx');
    const rail = $$('.st-rail li'), railEl = $('.st-rail');
    gsap.set([s1.chars, s2.words, sq.words, sf.chars], { yPercent: 115 });
    const center = () => ({
      x: st.clientWidth / 2 - (grid.offsetLeft + photo.offsetLeft + photo.offsetHeight / 2),
      y: st.clientHeight / 2 - (grid.offsetTop + photo.offsetTop + photo.offsetHeight / 2),
    });
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, scrollTrigger: {
      trigger: st, start: 'top top', end: '+=500%', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => {
        const t = self.progress * tl.duration(), marks = [0, 1.8, 5, 7, 9.2];
        let on = 0; marks.forEach((m, i) => t >= m - 0.05 && (on = i));
        rail.forEach((li, i) => li.classList.toggle('is-on', i === on));
        railEl.classList.toggle('is-dark', t > 9.6);
      } } });
    tl.fromTo('.st-disc', { scale: 0 }, { scale: 1, duration: 1.2 }, 0)
      .to(s1.chars, { yPercent: 0, stagger: 0.03, duration: 0.8, ease: 'power4.out' }, 0)
      .fromTo('.st-ring', { rotation: -60, scale: 0.4 }, { rotation: 0, scale: 1, duration: 2 }, 0)
      .to(s1.chars, { yPercent: -115, stagger: 0.012, duration: 0.6, ease: 'power3.in' }, 1.3)
      .to(s2.words, { yPercent: 0, stagger: 0.08, duration: 0.8, ease: 'power4.out' }, 1.8)
      .fromTo('.st-ticker', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 2.1)
      .fromTo('.st-ticker-list', { y: 0 }, { y: () => -(items.length - 1) * items[0].offsetHeight, ease: 'steps(' + (items.length - 1) + ')', duration: 2.1,
        onUpdate() { idx.textContent = String(Math.round(this.progress() * (items.length - 1)) + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0'); } }, 2.2)
      .to('.st-disc', { scale: 1.2, x: '-6vw', duration: 2, ease: 'none' }, 2.2)
      .to(s2.words, { yPercent: -115, stagger: 0.04, duration: 0.6, ease: 'power3.in' }, 4.2)
      .to('.st-ticker', { autoAlpha: 0, y: -30, duration: 0.4 }, 4.3)
      .to('.st-disc', { scale: 4.2, x: 0, duration: 0.9, ease: 'power2.in' }, 4.3)
      .fromTo(photo, { autoAlpha: 0, scale: 0, rotation: -120, x: () => center().x, y: () => center().y, width: () => photo.offsetHeight },
        { autoAlpha: 1, scale: 1.7, rotation: 0, duration: 0.9, ease: 'back.out(1.4)' }, 4.9)
      .to('.st-disc', { scale: 0, duration: 0.9, ease: 'power3.in' }, 5.3)
      .to(photo, { x: 0, y: 0, scale: 1, width: '100%', duration: 1.2, ease: 'expo.inOut' }, 6)
      .to(sq.words, { yPercent: 0, stagger: 0.06, duration: 0.8, ease: 'power4.out' }, 6.4)
      .fromTo(cards.slice(0, 3), { yPercent: 160, autoAlpha: 0, rotation: (i) => [-8, 6, -5][i] }, { yPercent: 0, autoAlpha: 1, rotation: 0, stagger: 0.38, duration: 0.9, ease: 'back.out(1.1)' }, 7)
      .fromTo(cards[3], { yPercent: 160, autoAlpha: 0, rotation: 6 }, { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.1)' }, 8.3)
      .fromTo('.st-final', { yPercent: 100 }, { yPercent: 0, duration: 1, ease: 'expo.inOut' }, 9.3)
      .to(sf.chars, { yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'power4.out' }, 9.9)
      .fromTo('.st-final .mono', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 10.2)
      .to({}, { duration: 0.6 });
    CF.mm.add('(max-width: 900px)', () => {
      tl.to(q, { autoAlpha: 0, duration: 0.4 }, 8.1).to(grid, { y: () => -q.offsetHeight - 14, duration: 0.8 }, 8.1);
    });
  }

  function manifest() {
    $$('.manifest').forEach((el) => {
      const s = CF.split(el, false);
      gsap.to(s.words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
  }

  function clock() {
    const c = $('.clock'); if (!c) return;
    const segs = $$('.clock-seg i', c), steps = $$('.clock-step', c), n = $('.clock-num', c), dur = [10, 20, 20, 10];
    const o = { m: 0 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top top', end: '+=220%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    let at = 0;
    segs.forEach((s, i) => { tl.to(s, { scaleX: 1, duration: dur[i], ease: 'none' }, at); at += dur[i]; });
    tl.to(o, { m: 60, duration: 60, ease: 'none', onUpdate: () => {
      const v = Math.round(o.m); n.textContent = String(v).padStart(2, '0');
      let acc = 0, on = 0; dur.forEach((d, i) => { if (v >= acc) on = i; acc += d; });
      steps.forEach((s, i) => s.classList.toggle('is-on', i === Math.min(on, 3)));
    } }, 0);
  }

  /* touch screens have no hover: photos warm into colour as they cross the middle of the screen */
  function warmOnTouch() {
    if (CF.fine) return;
    $$('.duo').filter((d) => !d.closest('.st-photo')).forEach((d) => ScrollTrigger.create({ trigger: d, start: 'top 62%', end: 'bottom 38%', toggleClass: 'is-warm' }));
  }
})();
