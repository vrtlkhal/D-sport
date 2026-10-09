"""Projet-D site builder:  python3 tools/build.py

Pop Flow geometry on the Braise palette. Builds the home page and one generic
template per category — the content of each page lives in the data dicts below:
  service  -> capofit, coaching, collectifs
  gallery  -> galerie
  journal  -> blog (index)      article -> article (single post)
  contact  -> contact
"""
import os
import time

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = str(int(time.time()))

WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z"/></svg>'
IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>'
FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3.1z"/></svg>'

PAGES = [('d-sport', 'Accueil', 'var(--ember)'), ('coaching', 'Personal training', 'var(--ember)'),
         ('collectifs', 'Cours collectifs', 'var(--ember)'), ('galerie', 'Galerie', 'var(--ember)'), ('blog', 'Journal', 'var(--ember)'), ('contact', 'Contact', 'var(--ember)')]
NAV = ['coaching', 'collectifs', 'galerie', 'blog']
LABEL = dict((p, l) for p, l, c in PAGES)


# ---------------------------------------------------------------- chrome
def head(page, title, desc):
    links = ''.join('<a href="%s.html"%s>%s</a>' % (p, ' aria-current="page"' if p == page else '', LABEL[p]) for p in NAV)
    menu = '\n'.join('    <a href="%s.html" data-menu-link%s><small>%02d</small>%s</a>' % (p, ' aria-current="page"' if p == page else '', i + 1, l)
                     for i, (p, l, c) in enumerate(PAGES))
    cur = ' aria-current="page"' if page == 'contact' else ''
    return f'''<!doctype html>
<html lang="fr" data-wa="262690000000">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0E0504">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/d-sport.css?v=%V%">
<script>!function(h){{h.classList.add('js');try{{if(sessionStorage.getItem('cf-seen'))h.classList.add('pt-cover')}}catch(e){{}}setTimeout(function(){{if(!window.gsap)h.classList.add('no-motion')}},4000)}}(document.documentElement)</script>
<style>.pt-cover .loader{{display:none}}</style>
</head>
<body data-page="{page}">
<div class="loader" aria-hidden="true"><div class="loader-dots"><i></i><i></i><i></i><i></i></div><div class="loader-count">000</div><div class="loader-name mono">Projet-D · St Pierre</div></div>
<div class="pt" aria-hidden="true"><div class="pt-dot"></div></div>
<header class="nav is-hidden">
  <a class="nav-logo" href="d-sport.html" aria-label="Projet-D — accueil">projet-d</a>
  <nav class="nav-links mono" aria-label="Navigation principale">{links}</nav>
  <div class="nav-right">
    <a class="nav-cta mono" href="contact.html"{cur}>Contact</a>
    <button class="nav-menu mono" data-menu-toggle aria-expanded="false" aria-controls="menu" aria-label="Menu"><span class="nav-menu-dots"><i></i><i></i></span><span class="nav-menu-t">Menu</span></button>
  </div>
</header>
<div class="menu" id="menu">
  <nav class="menu-links" aria-label="Menu">
{menu}
  </nav>
  <div class="menu-foot mono"><span>Centre de fitness Babouk — Grand Bois, St Pierre</span><span>La Réunion · <span data-clock></span></span><a data-wa>Écrire sur WhatsApp →</a></div>
</div>
<a class="fab" data-wa="Bonjour ! Je voudrais des infos sur l'entraînement." aria-label="Contacter sur WhatsApp">{WA}<span class="fab-label">Écris-moi</span></a>
<main>
'''


FOOT = f'''</main>
<footer class="foot foot--line">
  <div class="wrap"><div class="foot-bar mono"><span>© <span data-year></span> Projet-D · St-Pierre, La Réunion</span><span class="foot-soc"><a class="soc" href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">{IG}</a><a class="soc" href="https://facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">{FB}</a></span></div></div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/d-sport.js?v=%V%"></script>
<script src="assets/js/core.js?v=%V%"></script>
</body>
</html>'''


def write(name, content):
    with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f:
        f.write(content.replace('%V%', V))


def duo(name, pos, alt='', cls='', data='', attrs='', f2=False):
    """Duotone photo (colour version fades in on hover / scroll) in a framed figure."""
    c = 'duo frame' + (' f2' if f2 else '') + (' ' + cls if cls else '')
    return (f'<figure class="{c}"{attrs}><img src="assets/img/{name}-duo.jpg" alt="{alt}" style="object-position:{pos}" loading="lazy"{data}>'
            f'<img class="duo-c" src="assets/img/{name}.jpg" alt="" aria-hidden="true" style="object-position:{pos}" loading="lazy"></figure>')


def chips(items):
    return '<ul>' + ''.join('<li class="chip">%s</li>' % c for c in items) + '</ul>'


def cta_button(c):
    cls = {'ghost': 'btn btn--ghost', 'ember': 'btn btn--ember', 'solid': 'btn', 'blue': 'btn btn--blue'}[c.get('style', 'solid')]
    if 'wa' in c:
        return f'<a class="{cls}" data-wa="{c["wa"]}" data-magnetic=".2">{WA} {c["label"]}</a>'
    return f'<a class="{cls}" href="{c["href"]}" data-magnetic=".2">{c["label"]}</a>'


# ---------------------------------------------------------------- shared blocks
EVENT_CARD = f'''<div class="event">
    <div class="shape shape--blue"></div>
    <div>
      <span class="tag tag--rot">Initiation gratuite</span>
      <p class="event-date" style="margin-top:28px" data-split>Sam. 17 oct · 11h<br>(durée 1h)</p>
      <p class="event-addr mono">Centre de fitness Babouk,<br>55 chemin Maxime Rivière,<br>Grand Bois, St Pierre</p>
      <p class="event-pre mono">Pour public sportif · prérequis : être à l'aise avec les mouvements au poids du corps</p>
    </div>
    <div class="event-side">
      <div><p class="mono t-blue">Compte à rebours</p><p class="event-cd" data-countdown="2026-10-17T11:00:00+04:00">J-10</p></div>
      <div style="display:grid;gap:10px;justify-items:inherit"><a class="btn btn--ember btn--big" data-wa="Bonjour ! Je réserve ma place pour l'initiation Capofit du samedi 17 octobre." data-magnetic=".2">{WA} Réserver ma place</a><span class="mono">ou contact en MP</span></div>
    </div>
  </div>'''
EVENT = '<section class="section"><div class="wrap">\n  ' + EVENT_CARD + '\n</div></section>\n'

POSTS = [
    dict(cat='capoeira', catl='Capoeira', img='jump-coast', pos='48% 25%', meta='5 min', date='12.09', title='La ginga, ton meilleur cardio', text="Le balancement de base de la capoeira fait travailler tout le corps sans jamais s'arrêter."),
    dict(cat='fitness', catl='Fitness', img='star-a', pos='50% 40%', meta='4 min', date='28.08', title='Pompes : 5 variantes inspirées de la roda', text='Du negativa à la pompe tournée, renforce le haut du corps en mouvement.'),
    dict(cat='mobilite', catl='Mobilité', img='star-b', pos='45% 50%', meta='6 min', date='14.08', title="Équilibre : l'art de tenir sur une main", text="Progression simple vers la planche latérale étoile, étape par étape."),
    dict(cat='capoeira', catl='Capoeira', img='jump-sky', pos='52% 40%', meta='3 min', date='31.07', title='Esquiver pour mieux gainer', text="Les esquives sollicitent les abdos profonds plus qu'un crunch."),
    dict(cat='fitness', catl='Fitness', img='jump-coast', pos='30% 70%', meta='7 min', date='17.07', title='Un circuit de 20 minutes au poids du corps', text="Squats, fentes, gainage, sauts : le format qu'on fait en séance."),
    dict(cat='mobilite', catl='Mobilité', img='star-a', pos='55% 40%', meta='5 min', date='03.07', title="Pourquoi s'entraîner dehors change tout", text="Vent, sol irrégulier, horizon : l'extérieur rend l'effort plus riche."),
]


def posts_html(n):
    return ''.join(
        f'<a class="post" href="article.html" data-cat="{p["cat"]}" data-cursor="Lire">{duo(p["img"], p["pos"], cls="post-img")}'
        f'<div class="post-meta mono"><span class="dot"></span>{p["catl"]} · {p["meta"]}</div><h3>{p["title"]}</h3><p>{p["text"]}</p></a>' for p in POSTS[:n])


def contact_items(items):
    return ''.join(f'<a class="citem" {a} data-cursor="{c}"><span class="mono ember">{l}</span><span class="citem-v">{v}</span><span class="citem-arrow">→</span></a>' for a, l, v, c in items)


CONTACT_ITEMS = [('data-wa', 'WhatsApp', 'Écris-moi', 'Écrire'), ('href="mailto:contact@projet-d.re"', 'Email', 'contact@projet-d.re', 'Email')]
INTERESTS = ['Personal training', 'Cours collectifs', 'Nutrition', 'Initiation Capofit']


def contact_form(radios=INTERESTS):
    seg = ''.join('<label><input type="radio" name="formule" value="%s"%s><span class="chip">%s</span></label>' % (v, ' checked' if i == 0 else '', v) for i, v in enumerate(radios))
    return f'''<form class="form" data-wa-form data-reveal>
    <div class="field"><label class="mono ember" for="nom">Prénom</label><input class="input" id="nom" name="nom" autocomplete="given-name" placeholder="Ton prénom"></div>
    <div class="field"><label class="mono ember" for="msg">Message</label><input class="input" id="msg" name="message" placeholder="Ton niveau, tes disponibilités…"></div>
    <div class="field full"><div class="seg">{seg}</div></div>
    <div class="full"><button class="btn btn--ember" type="submit" data-magnetic=".2">{WA} Envoyer sur WhatsApp</button></div>
  </form>'''


# ---------------------------------------------------------------- page header (generic)
def page_header(h):
    shapes = h.get('shapes', ('ember', 'blue'))
    img = duo(h['media'], h['pos'], alt=h.get('alt', ''), cls='phead-img ' + h.get('shape', 'circle'))
    cta = cta_button(h['cta']) if h.get('cta') else ''
    return (f'<section class="phead phead--{h.get("variant", "a")}" data-screen-label="Header">\n'
            f'  <div class="shape shape--{shapes[0]} s1"></div><div class="shape shape--ring s2"></div><div class="shape shape--{shapes[1]} s3"></div>\n'
            f'  <span class="tag tag--rot phead-kicker">{h["kicker"]}</span>\n  {img}\n'
            f'  <h1 class="phead-title" data-split="chars" data-manual>{h["title"]}</h1>\n'
            f'  <div class="phead-sub"><p class="lead">{h["lead"]}</p>{cta}</div>\n</section>\n')


# ================================================================ HOME
home = f'''
<section class="hero" data-screen-label="Hero">
  <figure class="hero-media"><img src="assets/img/jump-sky-duo.jpg" alt="" style="object-position:52% 30%"><video class="hero-video" autoplay muted loop playsinline preload="auto" poster="assets/img/jump-sky-duo.jpg"><source src="assets/video/d-sport-vid.webm" type="video/webm"><source src="assets/video/d-sport-vid-web.mp4" type="video/mp4"></video></figure>
  <div class="shape shape--blue s-disc"></div><div class="shape shape--ring s-ring"></div><div class="shape shape--ember s-dot"></div>
  <a class="tag tag--rot hero-tag" href="#capofit" data-open-band>Initiation gratuite · 17 oct</a>
  <h1 class="hero-title" data-split data-manual>Bouger fort,<br><span class="o">au poids<br>du corps.</span></h1>
  <p class="hero-pres">Personal training et cours collectifs, fitness et conseils en nutrition. Un entraînement construit avant tout sur le poids du corps.</p>
  <div class="hero-meta mono"><span>Personal training</span><span>Cours collectifs</span><span>Fitness</span><span>Nutrition</span></div>
  <a class="hero-scroll mono" href="#journal"><span>Scroll</span><i></i></a>
</section>

<div class="mq" data-marquee="26" aria-hidden="true"><div class="mq-track"><span>Squats</span><i></i><span>Pompes</span><i></i><span>Gainage</span><i></i><span>Mobilité</span><i></i><span>Équilibre</span><i></i><span>Mountain climbers</span><i></i><span>Cardio</span><i></i><span>Nutrition</span><i></i></div></div>

<section class="section" id="journal"><div class="wrap">
  <div class="sec-head"><h2 class="h2" data-split>Journal.</h2><a class="btn btn--ghost" href="blog.html" data-magnetic=".2">Tous les articles →</a></div>
  <div class="posts" data-stagger>{posts_html(3)}</div>
</div></section>

<section class="cfband" id="capofit" data-screen-label="Capofit — événement">
  <figure class="cfband-bg" aria-hidden="true"><img src="assets/img/jump-coast-duo.jpg" alt="" style="object-position:48% 25%" loading="lazy"></figure>
  <div class="cfband-head wrap" data-cursor="Découvrir">
    <div class="cfband-top mono"><span class="tag tag--rot">À venir · Initiation gratuite</span><span class="cfband-when">Sam. 17 oct · 11h · Grand Bois, St Pierre</span><span class="cfband-cd" data-countdown="2026-10-17T11:00:00+04:00">J-10</span></div>
    <p class="logo cfband-word" data-split="chars">CAPOFIT.</p>
    <div class="cfband-row">
      <p class="lead">Capoeira, fitness et préparation physique&nbsp;: un cours dynamique, musical et semi-chorégraphié.</p>
      <button class="unfold" data-unfold aria-expanded="false" aria-controls="cf-panel"><span class="unfold-t mono">Découvrir</span><span class="unfold-ico" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
  <svg class="wave-bot" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,0 L1440,0 L1440,60 C1200,100 960,20 720,70 C480,115 240,30 0,80 Z" fill="#0E0504"/></svg>
</section>

<div class="cfpanel" id="cf-panel" role="dialog" aria-modal="true" aria-label="Capofit — description" data-lenis-prevent>
  <button class="cfpanel-close mono" type="button" data-close-panel>Fermer <span aria-hidden="true">✕</span></button>
  <div class="cfpanel-in wrap">
    <div class="cfpanel-head"><span class="tag tag--rot">Événement · Initiation gratuite</span><h2 class="cfpanel-title logo">CAPOFIT.</h2><p class="lead">Capoeira, fitness et préparation physique&nbsp;: un cours dynamique, musical et semi-chorégraphié.</p></div>
    <div class="cfband-in">
    <div class="cf-block"><p class="mono">Le principe</p><p class="h3">Fusionner capoeira, fitness et préparation physique.</p><p class="muted">La richesse gestuelle de la capoeira sert à développer différentes qualités physiques, sans perdre la dimension ludique et rythmée.</p></div>
    <div class="cf-block"><p class="mono">Une séance</p><p class="h3">Réveil articulaire, puis enchaînements.</p><p class="muted">Mobilité d'abord, puis de vraies phrases motrices : ginga, esquives, coups de pied, déplacements, mouvements au sol, associés à des squats, pompes, gainages, mountain climbers.</p></div>
    <div class="cf-block"><p class="mono">Progression</p><p class="h3">L'enchaînement d'abord, la vitesse ensuite.</p><ul class="cf-chips"><li class="chip">4, 6 ou 8 répétitions</li><li class="chip">2 ou 3 séries</li><li class="chip">Unilatéral ou bilatéral</li><li class="chip">Durée des maintiens</li><li class="chip">Complexité</li><li class="chip">Vitesse</li></ul></div>
    <div class="cf-block"><p class="mono">La musique</p><p class="h3">Capoeira et techno.</p><p class="muted">Musiques de capoeira et sonorités électroniques donnent l'énergie du cours. Elle n'impose pas toujours le mouvement : certaines transitions demandent de ralentir ou de sortir du tempo.</p></div>
    <div class="cf-block"><p class="mono">Multidirectionnel</p><p class="h3">Appuis, niveaux, orientations.</p><ul class="cf-chips"><li class="chip">Proprioception</li><li class="chip">Équilibre</li><li class="chip">Coordination</li><li class="chip">Latéralité</li><li class="chip">Agilité</li><li class="chip">Repérage spatial</li></ul></div>
    <div class="cf-block"><p class="mono">Pour qui</p><p class="h3">Un public déjà actif.</p><p class="muted">Débutants en capoeira avec une bonne condition physique, capoeiristes qui veulent se conditionner, pratiquants de musculation, CrossFit, sports collectifs, arts martiaux ou fitness. Dans sa forme actuelle, le cours n'est pas pensé comme une reprise d'activité pour une personne très sédentaire, ni pour l'obésité : ce sont la condition physique, la mobilité et la sécurité des mouvements qui guident l'accès.</p></div>
    <div class="cf-event">{EVENT_CARD}</div>
    <div class="cf-cta"><a class="btn btn--ghost" href="contact.html" data-magnetic=".2">Une question ? Contact →</a><button class="btn btn--ember" type="button" data-close-panel>Réduire ↑</button></div>
    </div>
  </div>
</div>


<section class="story" id="histoire" data-screen-label="Narrative">
  <div class="st-disc"></div><div class="st-ring"></div>
  <h2 class="st-big st-l1" data-split="chars" data-manual>Ton corps.</h2>
  <h2 class="st-big st-l2" data-split="words" data-manual>Ton premier outil.</h2>
  <div class="st-ticker"><div class="st-ticker-win"><ul class="st-ticker-list"><li>Squat</li><li>Pompe</li><li>Gainage</li><li>Mountain climbers</li><li>Fentes</li><li>Équilibre</li><li>Mobilité</li><li>Cardio</li><li>Souplesse</li><li>Coordination</li><li>Agilité</li><li>Nutrition</li></ul></div><span class="mono st-ticker-idx">01 / 12</span></div>
  <div class="st-grid">
    <div class="st-what">
      <h2 class="st-q" data-split="words" data-manual>Comment on s'entraîne&nbsp;?</h2>
      {duo('star-b', '45% 50%', alt="Planche latérale étoile au bord de l'océan", cls='st-photo', f2=True)}
    </div>
    <div class="st-cards">
      <article class="pcard pcard--ember"><p class="mono">Personal training</p><p class="pcard-t">un programme construit pour toi, ton niveau et tes objectifs</p></article>
      <article class="pcard pcard--blue"><p class="mono">Cours collectifs</p><p class="pcard-t">l'énergie du groupe, l'exigence du coach</p></article>
      <article class="pcard pcard--rust"><p class="mono">Fitness &amp; nutrition</p><p class="pcard-t">renforcement au poids du corps, avec un regard nutrition</p></article>
      <a class="pcard pcard--umber" href="#capofit" data-open-band><p class="mono ember">À venir · sam. 17 oct · 11h</p><p class="mono pcard-m">Initiation gratuite Capofit : capoeira et fitness en un seul flow →</p></a>
    </div>
  </div>
  <div class="st-final"><p class="mono">Projet-D</p><p class="st-final-t" data-split="chars" data-manual>On<br>bouge.</p></div>
  <ol class="st-rail mono"><li><span>Corps</span></li><li><span>Mouvements</span></li><li><span>Formats</span></li><li><span>Événement</span></li><li><span>Go</span></li></ol>
</section>

<section class="offers" data-hscroll data-screen-label="Offres">
  <div class="h-track">
    <div class="offers-intro"><p class="mono ember">Comment s'entraîner</p><h2 class="h2" data-split>Choisis ton terrain de jeu.</h2><p class="lead">Seul avec le coach ou en groupe — et un événement à venir.</p></div>
    <a class="ocard ocard--ember" href="coaching.html" data-cursor="Découvrir"><span class="mono">01 — Sur-mesure</span>{duo('star-a', '50% 40%', cls='circle ocard-img', data=' data-h-par')}<h3>Personal training</h3><p>Un programme construit pour toi, ton niveau et tes objectifs.</p><span class="ocard-go">→</span></a>
    <a class="ocard ocard--blue" href="collectifs.html" data-cursor="Découvrir"><span class="mono">02 — Ensemble</span>{duo('jump-sky', '52% 40%', cls='circle ocard-img', data=' data-h-par', f2=True)}<h3>Cours collectifs</h3><p>L'énergie du groupe, l'exigence du coach, en salle ou en plein air.</p><span class="ocard-go">→</span></a>
    <a class="ocard ocard--cream" href="#capofit" data-open-band data-cursor="Réserver"><span class="mono">À venir · sam. 17 oct · 11h</span>{duo('star-b', '45% 50%', cls='circle ocard-img', data=' data-h-par', f2=True)}<h3>Initiation Capofit</h3><p>Capoeira et fitness en un seul flow. Une heure pour découvrir, gratuite, à Grand Bois.</p><span class="ocard-go">→</span></a>
  </div>
</section>

<section class="section"><div class="wrap">
  <div class="gt-head"><h2 class="h2" data-split>Le terrain, c'est l'île.</h2><a class="btn" href="galerie.html" data-magnetic=".2">Voir la galerie →</a></div>
  <div class="gt-grid">
    <div class="shape shape--ring" data-rotate="180"></div>
    {duo('jump-coast', '48% 25%', cls='circle gt-a', data=' data-parallax-img', attrs=' data-speed="-.2"')}
    {duo('star-a', '50% 45%', cls='pill gt-b', data=' data-parallax-img', attrs=' data-speed=".3"', f2=True)}
    {duo('jump-sky', '52% 40%', cls='round gt-c', data=' data-parallax-img', attrs=' data-speed=".1"')}
  </div>
</div></section>

<section class="section bg-umber contact-compact" id="contact"><div class="wrap">
  <div class="sec-head"><h2 class="h2" data-split>On bouge&nbsp;?</h2><p class="mono ember">Contact</p></div>
  <div class="clist" data-stagger>{contact_items(CONTACT_ITEMS)}</div>
  <div style="margin-top:clamp(22px,3vw,40px)">{contact_form()}</div>
</div></section>
'''
write('d-sport', head('d-sport', 'Personal training, cours collectifs, fitness — Projet-D · St Pierre, La Réunion',
                      'Personal training et cours collectifs, fitness et nutrition, au poids du corps, à St Pierre, La Réunion. Prochain événement : initiation gratuite Capofit.') + home + FOOT)


# ================================================================ SERVICE TEMPLATE
def service_page(d):
    out = page_header(d['header'])
    if d.get('statement'):
        out += f'<section class="section"><div class="wrap"><p class="manifest">{d["statement"]}</p></div></section>\n'
    f = d.get('features')
    if f:
        cards = ''.join(
            f'<article class="pillar pillar--{a["color"]}" data-reveal><span class="pillar-n">{i + 1:02d}</span><div><p class="mono">{a["kicker"]}</p><h3>{a["title"]}</h3>{chips(a["chips"])}</div>'
            f'{duo(a["img"], a["pos"], alt=a.get("alt", ""), cls="circle", f2=(i % 2 == 1))}</article>' for i, a in enumerate(f['items']))
        out += (f'<section class="section" id="features"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>{f["title"]}</h2><p class="lead">{f["lead"]}</p></div>\n'
                f'  <div class="pillars">{cards}</div>\n</div></section>\n')
    t = d.get('timeline')
    if t:
        segs = '<div class="clock-seg"><i></i></div>' * len(t['steps'])
        steps = ''.join(f'<div class="clock-step{" is-on" if i == 0 else ""}"><p class="mono ember">{s["range"]}</p><h3>{s["title"]}</h3><p>{s["text"]}</p></div>' for i, s in enumerate(t['steps']))
        out += (f'<section class="clock" data-screen-label="Timeline">\n  <p class="mono ember">{t["kicker"]}</p>\n  <p class="clock-n"><span class="clock-num">00</span><small>min</small></p>\n'
                f'  <div class="clock-bar">{segs}</div>\n  <div class="clock-steps">{steps}</div>\n</section>\n')
    s = d.get('steps')
    if s:
        cards = ''.join(
            f'<article class="stack-card"><div><p class="stack-n">{i + 1:02d}</p><h3 class="h2">{x["title"]}</h3><p class="lead">{x["text"]}</p></div>{duo(s["images"][i][0], s["images"][i][1], cls="round")}</article>'
            for i, x in enumerate(s['items']))
        out += (f'<section class="section"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>{s["title"]}</h2><p class="lead">{s["lead"]}</p></div>\n'
                f'  <div class="stack" data-stack>{cards}</div>\n</div></section>\n')
    fa = d.get('facts')
    if fa:
        head_ = f'<div class="sec-head"><h2 class="h2" data-split>{fa["title"]}</h2></div>\n  ' if fa.get('title') else ''
        cols = ''.join(f'<div class="format"><p class="mono ember">{c["label"]}</p><h3 class="h3">{c["title"]}</h3><p>{c["text"]}</p></div>' for c in fa['cols'])
        out += f'<section class="section"><div class="wrap">\n  {head_}<div class="formats" data-stagger>{cols}</div>\n</div></section>\n'
    r = d.get('rows')
    if r:
        rows = ''.join(
            f'<a class="plan-row" data-wa="{x["wa"]}" data-cursor="Réserver"><span class="h3">{x["a"]}</span><span class="mono plan-time">{x["b"]}</span><span class="plan-name">{x["title"]}</span><span class="mono plan-place">{x["c"]}</span><span class="ring"></span></a>'
            for x in r['items'])
        out += (f'<section class="section bg-umber" id="rows"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>{r["title"]}</h2><p class="mono ember">{r["note"]}</p></div>\n'
                f'  <div class="plan" data-stagger>{rows}</div>\n</div></section>\n')
    if d.get('cta', True):
        out += EVENT
    return head(d['key'], d['title'], d['desc']) + out + FOOT


SERVICES = {
    'coaching': dict(
        key='coaching', title='Personal training — Projet-D · St Pierre, La Réunion',
        desc='Personal training à St Pierre : bilan, programme sur-mesure, séances et suivi, au poids du corps.',
        header=dict(variant='a', shape='circle', media='jump-sky', pos='52% 32%', alt='Saut écart', shapes=('ember', 'blue'), kicker='Personal training',
                    title='Ton rythme.<br>Ton flow.', lead='Un coach, un programme construit pour toi, en extérieur, à domicile ou en salle.',
                    cta=dict(label='Réserver un bilan', wa='Bonjour ! Je souhaite réserver un bilan personal training.', style='ember')),
        statement="Un programme construit pour toi&nbsp;: au poids du corps, avec un regard nutrition.",
        steps=dict(title='Comment ça<br>se passe.', lead='Quatre étapes. Chacune se pose sur la précédente.',
                   images=[('star-a', '50% 40%'), ('jump-coast', '48% 25%'), ('jump-sky', '52% 40%'), ('star-b', '45% 50%')], items=[
            dict(title='Bilan', text='On fait le point : ton niveau, ton historique, tes envies. Quelques mouvements tests au poids du corps.'),
            dict(title='Programme', text='Un plan sur-mesure qui mélange force, cardio et mouvements issus de la capoeira.'),
            dict(title='Séances', text='Un coach rien que pour toi. Chaque mouvement corrigé, chaque séance ajustée.'),
            dict(title='Suivi', text='On mesure tes progrès et on fait évoluer le programme. Disponible sur WhatsApp entre les séances.')]),
        facts=dict(title="Où on s'entraîne.", cols=[
            dict(label='01', title='En extérieur', text="Côte, sentiers, parcs : l'île comme salle de sport."),
            dict(label='02', title='À domicile', text='Le coach vient à toi. Aucun matériel nécessaire.'),
            dict(label='03', title='En salle', text='Au centre de fitness Babouk, Grand Bois.')])),
    'collectifs': dict(
        key='collectifs', title='Cours collectifs — Projet-D · St Pierre, La Réunion',
        desc='Cours collectifs à St Pierre : capoeira, circuits fitness et mobilité en groupe.',
        header=dict(variant='c', shape='round', media='jump-coast', pos='48% 22%', alt='Saut au-dessus des rochers', shapes=('blue', 'ember'), kicker='Cours collectifs',
                    title='Ensemble,<br>plus loin.', lead="L'énergie du groupe, l'exigence du coach.",
                    cta=dict(label='Voir le planning ↓', href='#rows', style='ghost')),
        statement="En groupe, on se pousse, on se répond, on se surprend. Comme dans une roda&nbsp;: chacun son tour, tout le monde dans le flow.",
        facts=dict(cols=[
            dict(label='Niveau', title='Public sportif', text="Être à l'aise avec les mouvements au poids du corps."),
            dict(label='Durée', title='1 heure', text='Échauffement, circuits, flow, retour au calme.'),
            dict(label='À prévoir', title='Tenue souple', text="Une bouteille d'eau, des baskets ou pieds nus, et l'envie de bouger.")]),
        rows=dict(title='Planning.', note='Planning indicatif — confirme ta place sur WhatsApp', items=[
            dict(a='Samedi', b='11h00', title='Initiation Capofit (événement)', c='Babouk, Grand Bois', wa="Bonjour ! Je voudrais rejoindre l'initiation Capofit du samedi 11h00."),
            dict(a='Mardi', b='18h30', title='Circuit fitness', c='Plein air, St Pierre', wa='Bonjour ! Je voudrais rejoindre le cours Circuit fitness du mardi 18h30.'),
            dict(a='Jeudi', b='18h30', title='Cours mobilité & flow', c='Babouk, Grand Bois', wa='Bonjour ! Je voudrais rejoindre le cours mobilité & flow du jeudi 18h30.'),
            dict(a='Dimanche', b='08h00', title='Mobilité & équilibre', c='Front de mer', wa='Bonjour ! Je voudrais rejoindre le cours Mobilité & équilibre du dimanche 08h00.')])),
}
for _name, _data in SERVICES.items():
    write(_name, service_page(_data))


# ================================================================ GALLERY TEMPLATE
def gallery_page(d):
    grid = ''.join(
        f'<div class="gitem{" wide" if w else ""}" data-reveal="clip">'
        + duo(n, p, alt=a, cls=s + ' ', data=f' data-lightbox data-full="assets/img/{n}.jpg" data-caption="{a}"', attrs=' style="height:100%"', f2=(i % 2 == 1)) + '</div>'
        for i, (s, w, n, p, a) in enumerate(d['items']))
    rail = ''.join(duo(n, p, cls=f'rail-item r{r}', data=' data-h-par', f2=(i % 2 == 1)) for i, (n, p, r) in enumerate(d['rail']['images']))
    out = page_header(d['header']) + (
        f'<section class="section"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>{d["title"]}</h2><p class="mono ember">{d["note"]}</p></div>\n'
        f'  <div class="ggrid">{grid}</div>\n</div></section>\n'
        f'<section class="rail" data-hscroll data-screen-label="Rail">\n  <div class="h-track">\n'
        f'    <div class="rail-title"><p class="mono ember">{d["rail"]["kicker"]}</p><h2 class="h2" data-split>{d["rail"]["title"]}</h2></div>\n    {rail}\n  </div>\n</section>')
    return head(d['key'], d['page_title'], d['desc']) + out + FOOT


write('galerie', gallery_page(dict(
    key='galerie', page_title='Galerie — Projet-D · St Pierre, La Réunion', desc='Galerie Projet-D : sauts, équilibres et flow sur les côtes de La Réunion.',
    header=dict(variant='a', shape='circle', media='jump-coast', pos='48% 20%', alt='Saut au-dessus de la côte', shapes=('ember', 'blue'), kicker='Galerie',
                title="Le corps<br>en l'air.", lead="Côtes volcaniques, ciel, océan : l'île est notre studio."),
    title='Saut, équilibre, flow.', note='Clique pour agrandir · ← → au clavier',
    items=[('round', True, 'star-a', '50% 45%', 'Planche latérale étoile'), ('circle', False, 'jump-sky', '52% 40%', 'Saut écart, ciel'), ('round', False, 'jump-coast', '48% 20%', 'Au-dessus des rochers'),
           ('pill', True, 'star-b', '45% 50%', 'Équilibre sur une main'), ('circle', False, 'jump-coast', '30% 70%', "La côte et l'océan"), ('round', True, 'jump-sky', '52% 35%', 'Un seul flow')],
    rail=dict(kicker='Défile →', title='Sous le soleil de St Pierre.', images=[('jump-sky', '52% 40%', 1), ('star-a', '50% 45%', 2), ('jump-coast', '48% 25%', 3), ('star-b', '45% 50%', 1)]))))


# ================================================================ JOURNAL + ARTICLE TEMPLATES
ARTICLE = dict(
    kicker='Capoeira · 5 min', title='La ginga, ton meilleur cardio.', img='jump-coast', pos='48% 25%',
    blocks=[('p', "La ginga, c'est le balancement de base de la capoeira : un déplacement continu, d'un appui à l'autre, bras en garde. Elle a l'air simple. Elle ne l'est pas."),
            ('h3', "Un mouvement qui ne s'arrête jamais"),
            ('p', "Pendant une ginga, les jambes fléchissent en continu, le tronc tourne, les bras protègent. C'est un squat en mouvement, répété des centaines de fois, avec un gainage permanent."),
            ('quote', "« D'abord l'enchaînement. La vitesse vient après. »"),
            ('h3', "Comment on l'utilise en séance"),
            ('p', "En Capofit, la ginga sert d'échauffement, puis de fil rouge : on revient toujours à elle entre deux esquives, deux coups de pied, deux séries de pompes. C'est elle qui crée le flow."),
            ('p', "Résultat : le cardio monte sans qu'on le sente passer, et le corps apprend à se déplacer avec fluidité.")],
    cta=dict(label='Essayer en séance', wa="Bonjour ! J'ai lu l'article, je veux essayer.", style='ember'))


def article_body(a):
    tpl = {'p': '<p>%s</p>', 'h3': '<h3>%s</h3>', 'quote': '<blockquote>%s</blockquote>'}
    return ''.join(tpl[k] % t for k, t in a['blocks'])


def journal_page(d):
    a = d['featured']
    filters = ''.join('<button class="chip" data-filter="%s">%s</button>' % (k, v) for k, v in d['cats'])
    out = '<div class="progress" data-progress="#article"></div>' + page_header(d['header']) + (
        f'<section class="section" id="article"><div class="wrap feature">\n  {duo(a["img"], a["pos"], cls="feature-media")}\n'
        f'  <article class="article">\n    <p class="mono ember">À la une · {a["kicker"]}</p>\n    <h2 data-split>{a["title"]}</h2>\n'
        f'    {article_body(a)}\n    <div><a class="btn btn--ember" href="article.html">Lire l\'article →</a></div>\n  </article>\n</div></section>\n'
        f'<section class="section bg-umber"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>Tous les articles.</h2>\n'
        f'    <div class="filters" data-filter-group="#posts"><button class="chip is-active" data-filter="all">Tout</button>{filters}</div>\n  </div>\n'
        f'  <div class="posts" id="posts">{posts_html(len(POSTS))}</div>\n</div></section>')
    return head(d['key'], d['page_title'], d['desc']) + out + FOOT


write('blog', journal_page(dict(
    key='blog', page_title='Journal — Projet-D · St Pierre, La Réunion', desc='Le journal Projet-D : capoeira, fitness et mobilité, conseils et séances.',
    header=dict(variant='c', shape='round', media='star-b', pos='45% 50%', alt='Équilibre sur une main', shapes=('blue', 'ember'), kicker='Journal',
                title='Le journal.', lead='Mouvements, conseils, coulisses des séances.', cta=dict(label='Article à la une ↓', href='#article', style='ghost')),
    featured=ARTICLE, cats=[('capoeira', 'Capoeira'), ('fitness', 'Fitness'), ('mobilite', 'Mobilité')])))


def article_page(d):
    a = d['post']
    out = '<div class="progress" data-progress="#article"></div>' + page_header(d['header']) + (
        f'<section class="section" id="article"><div class="wrap feature">\n  {duo(a["img"], a["pos"], cls="feature-media")}\n'
        f'  <article class="article">\n    <p class="mono ember">{a["kicker"]}</p>\n    <h2 data-split>{a["title"]}</h2>\n'
        f'    {article_body(a)}\n    <div>{cta_button(a["cta"])}</div>\n  </article>\n</div></section>\n'
        f'<section class="section bg-umber"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>À lire aussi.</h2>'
        f'<a class="btn btn--ghost" href="blog.html" data-magnetic=".2">Tous les articles →</a></div>\n  <div class="posts">{posts_html(3)}</div>\n</div></section>')
    return head(d['key'], d['page_title'], d['desc']) + out + FOOT


write('article', article_page(dict(
    key='article', page_title='Article — Projet-D · St Pierre, La Réunion', desc='Article du journal Projet-D.',
    header=dict(variant='a', shape='circle', media='jump-coast', pos='48% 22%', alt='Saut au-dessus des rochers', shapes=('ember', 'blue'), kicker='Journal · Capoeira · 5 min',
                title='La ginga,<br>ton meilleur<br>cardio.', lead='Le balancement de base de la capoeira, vu comme un entraînement complet.', cta=dict(label='Lire ↓', href='#article', style='ghost')),
    post=ARTICLE)))


# ================================================================ CONTACT TEMPLATE
def contact_page(d):
    out = page_header(d['header']) + (
        f'<section class="section contact-compact"><div class="wrap">\n  <div class="clist" data-stagger>{contact_items(d["items"])}</div>\n</div></section>\n'
        f'<section class="section bg-umber contact-compact"><div class="wrap">\n  <div class="sec-head"><h2 class="h2" data-split>{d["form_title"]}</h2><p class="mono ember">{d["form_note"]}</p></div>\n'
        f'  {contact_form(d["interests"])}\n</div></section>\n') + EVENT
    return head(d['key'], d['page_title'], d['desc']) + out + FOOT


write('contact', contact_page(dict(
    key='contact', page_title='Contact — Projet-D · St Pierre, La Réunion', desc='Contacter Projet-D : WhatsApp et email. Centre de fitness Babouk, Grand Bois, St Pierre.',
    header=dict(variant='a', shape='circle', media='star-b', pos='42% 50%', alt='Équilibre sur une main', shapes=('blue', 'ember'), kicker='Contact',
                title='On bouge&nbsp;?', lead="Une question, une séance d'essai, l'initiation du 17 octobre : écris-moi.", cta=dict(label='WhatsApp', wa='Bonjour !', style='ember')),
    items=CONTACT_ITEMS, interests=INTERESTS, form_title='Message express.', form_note='Le formulaire prépare ton message WhatsApp')))

print('ok — built into', OUT)
