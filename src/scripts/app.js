// Site interactions. Runs once per page view (including client-side navigations).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceQuery.matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let lenis = null;
let page = null; // per-page teardown state

function startSmoothScroll() {
  if (lenis || reduced()) return;
  lenis = new Lenis({ anchors: true, lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Navigation ---------- */

function initNav({ signal }) {
  const nav = $('[data-nav]');
  if (!nav) return;
  const toggle = $('[data-nav-toggle]', nav);
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (Math.abs(y - lastY) > 6) {
      nav.classList.toggle('is-hidden', y > lastY && y > 480);
      lastY = y;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true, signal });

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')), { signal });
  window.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false), { signal });
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => setOpen(false), { signal });
  page.cleanups.push(() => setOpen(false));
}

/* ---------- Buttons: the fill grows from where the pointer enters ---------- */

function initButtons({ signal }) {
  document.addEventListener(
    'pointerover',
    (e) => {
      const btn = e.target.closest?.('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${e.clientX - r.left}px`);
      btn.style.setProperty('--y', `${e.clientY - r.top}px`);
    },
    { signal },
  );
}

/* ---------- Type reveals ---------- */

function initType() {
  if (reduced()) return;

  $$('[data-split]').forEach((el) => {
    const onLoad = el.dataset.split === 'load';
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          delay: onLoad ? 0.1 : 0,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  const fades = $$('[data-fade]');
  if (fades.length) {
    gsap.fromTo(fades, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.55 });
  }

  // Paragraph that fills in word by word as it scrolls through the viewport.
  $$('[data-scrub-words]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          { opacity: 1, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 58%', scrub: true } },
        );
      },
    });
  });
}

/* ---------- Live clocks ---------- */

function zoneParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    weekday: 'long',
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const hour24 = Number(new Intl.DateTimeFormat('en-AU', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date));
  const match = /([+-])(\d{1,2})(?::(\d{2}))?/.exec(get('timeZoneName'));
  const offset = match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) + Number(match[3] || 0) / 60) : 0;
  return {
    clock: `${get('hour')}:${get('minute')}`,
    period: get('dayPeriod').toLowerCase().replace(/\./g, ''),
    weekday: get('weekday'),
    night: hour24 < 6 || hour24 >= 18,
    offset,
  };
}

function initClocks() {
  const clocks = $$('[data-tz]');
  const inline = $$('[data-live-time]');
  if (!clocks.length && !inline.length) return;
  const homeZone = 'Asia/Manila';
  let lastMinute = -1;

  const update = () => {
    const now = new Date();
    if (now.getMinutes() === lastMinute) return;
    lastMinute = now.getMinutes();
    const homeOffset = zoneParts(now, homeZone).offset;

    clocks.forEach((el) => {
      const z = zoneParts(now, el.dataset.tz);
      $('[data-time]', el).innerHTML = `${z.clock}<small>${z.period}</small>`;
      el.dataset.phase = z.night ? 'night' : 'day';
      const diff = Math.round((z.offset - homeOffset) * 2) / 2;
      const meta = $('[data-meta]', el);
      if (diff === 0) meta.textContent = `${z.weekday}, where your team works`;
      else {
        const n = Math.abs(diff);
        meta.textContent = `${z.weekday}, ${n} ${n === 1 ? 'hour' : 'hours'} ${diff > 0 ? 'ahead' : 'behind'}`;
      }
      const pinTime = $(`[data-pin="${el.dataset.city}"] [data-pin-time]`);
      if (pinTime) pinTime.textContent = `${z.clock} ${z.period}`;
    });

    inline.forEach((el) => {
      const z = zoneParts(now, el.dataset.liveTime);
      el.textContent = `${z.clock} ${z.period}`;
    });
  };

  update();
  const timer = setInterval(update, 1000);
  page.cleanups.push(() => clearInterval(timer));
}

/* ---------- Globe ---------- */

function initGlobe({ signal }) {
  const el = $('[data-globe]');
  if (!el) return;
  const current = page;

  import('./globe.js').then(({ createGlobe }) => {
    if (current !== page) return; // navigated away while loading
    const globe = createGlobe(el, { reducedMotion: reduced() });
    if (!globe) return;
    current.cleanups.push(globe.destroy);

    const strip = $('[data-clocks]');
    if (!strip) return;
    const buttons = $$('[data-city]', strip);
    let pinned = null;

    const show = (id) => {
      globe.focus(id);
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.city === id)));
    };

    buttons.forEach((btn) => {
      btn.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && show(btn.dataset.city), { signal });
      btn.addEventListener('focus', () => show(btn.dataset.city), { signal });
      btn.addEventListener(
        'click',
        () => {
          pinned = pinned === btn.dataset.city ? null : btn.dataset.city;
          show(pinned);
        },
        { signal },
      );
    });
    strip.addEventListener('pointerleave', () => show(pinned), { signal });
    strip.addEventListener('focusout', (e) => !strip.contains(e.relatedTarget) && show(pinned), { signal });
  });
}

/* ---------- Video: load the player only when asked ---------- */

function initVideo({ signal }) {
  $$('[data-video]').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.video}?autoplay=1&rel=0`;
        frame.title = 'This is Offsure';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        const holder = document.createElement('div');
        holder.className = 'video__frame';
        holder.append(frame);
        btn.replaceWith(holder);
      },
      { signal },
    );
  });
}

/* ---------- How it works: pinned scene on large screens ---------- */

function initProcess({ signal }) {
  const section = $('[data-process]');
  if (!section) return;
  const steps = $$('[data-step]', section);
  const rails = steps.map((s) => $('.step__text', s));
  const mm = gsap.matchMedia();
  page.cleanups.push(() => mm.revert());

  const pinnedQuery = '(min-width: 960px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)';

  mm.add(pinnedQuery, () => {
    section.classList.add('process--pinned');
    let active = -1;
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    };
    setActive(0);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.8}`,
      pin: true,
      onUpdate(self) {
        const p = Math.min(self.progress * steps.length, steps.length - 0.0001);
        const i = Math.floor(p);
        setActive(i);
        rails.forEach((rail, k) => rail.style.setProperty('--p', k < i ? 1 : k === i ? (p - i).toFixed(3) : 0));
      },
    });

    const jump = (k) => {
      const y = trigger.start + ((trigger.end - trigger.start) * (k + 0.35)) / steps.length;
      if (lenis) lenis.scrollTo(y, { duration: 1 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const offs = rails.map((rail, k) => {
      const handler = () => jump(k);
      rail.addEventListener('click', handler, { signal });
      return () => rail.removeEventListener('click', handler);
    });

    return () => {
      offs.forEach((off) => off());
      section.classList.remove('process--pinned');
      steps.forEach((s) => s.classList.remove('is-active'));
      rails.forEach((rail) => rail.style.removeProperty('--p'));
    };
  });

  mm.add(`not all and ${pinnedQuery}`, () => {
    if (reduced()) {
      steps.forEach((s) => s.classList.add('is-active'));
      rails.forEach((rail) => rail.style.setProperty('--p', 1));
      return;
    }
    steps.forEach((s, k) => {
      ScrollTrigger.create({
        trigger: s,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          s.classList.add('is-active');
          gsap.to(rails[k], { '--p': 1, duration: 1.2, ease: 'power2.out' });
        },
      });
    });
    return () => steps.forEach((s) => s.classList.remove('is-active'));
  });
}

/* ---------- Roles: tabs ---------- */

function initRoles({ signal }) {
  const root = $('[data-roles]');
  if (!root) return;
  const list = $('[role="tablist"]', root);
  const tabs = $$('[role="tab"]', root);
  const panels = $$('[role="tabpanel"]', root);
  const marker = $('.roles__marker', root);
  let current = 0;

  const placeMarker = () => {
    const tab = tabs[current];
    marker.style.setProperty('--y', `${tab.offsetTop + tab.offsetHeight * 0.16}px`);
    marker.style.setProperty('--h', `${tab.offsetHeight * 0.68}px`);
  };

  const select = (i, { focus = false } = {}) => {
    if (focus) tabs[i].focus();
    if (i === current) return;
    current = i;
    tabs.forEach((tab, k) => {
      tab.setAttribute('aria-selected', String(k === i));
      tab.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((panel, k) => (panel.hidden = k !== i));
    placeMarker();
    if (!reduced()) {
      const panel = panels[i];
      gsap.fromTo(panel.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04, overwrite: true });
      gsap.fromTo($$('.chip', panel), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.025, delay: 0.18, overwrite: true });
    }
  };

  const hoverable = window.matchMedia('(hover: hover) and (min-width: 901px)');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i), { signal });
    tab.addEventListener('pointerenter', () => hoverable.matches && select(i), { signal });
  });
  list.addEventListener(
    'keydown',
    (e) => {
      const last = tabs.length - 1;
      const next = { ArrowDown: current === last ? 0 : current + 1, ArrowUp: current === 0 ? last : current - 1, Home: 0, End: last }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(next, { focus: true });
    },
    { signal },
  );

  const observer = new ResizeObserver(placeMarker);
  observer.observe(list);
  page.cleanups.push(() => observer.disconnect());
  document.fonts?.ready.then(placeMarker);
  placeMarker();
}

/* ---------- Small scroll-triggered moments ---------- */

function initMoments() {
  $$('[data-ticks]').forEach((el) => {
    if (reduced()) return el.classList.add('is-in');
    ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => el.classList.add('is-in') });
  });

  if (reduced()) return;

  $$('[data-equation]').forEach((el) => {
    const [a, b] = $$('.equation__term', el);
    const plus = $('.equation__plus', el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true }, defaults: { ease: 'expo.out', duration: 1 } })
      .from(a, { x: -40, opacity: 0 })
      .from(b, { x: 40, opacity: 0 }, '<')
      .from(plus, { scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(2.2)' }, '<0.25');
  });

  $$('[data-cta]').forEach((el) => {
    const paths = $$('.cta__smile path', el);
    gsap.set(paths, { strokeDasharray: 1 });
    gsap.fromTo(
      paths,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, ease: 'none', stagger: 0.25, scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 50%', scrub: 0.6 } },
    );
  });

  $$('[data-count]').forEach((group) => {
    gsap.from(group.children, {
      scale: 0,
      transformOrigin: '50% 100%',
      duration: 0.5,
      ease: 'back.out(2)',
      stagger: 0.035,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });
}

/* ---------- Talent: values accordion ---------- */

function initValues({ signal }) {
  const items = $$('[data-value]');
  items.forEach((item) => {
    const head = $('button', item);
    head.addEventListener(
      'click',
      () => {
        const open = !item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.toggle('is-open', other === item && open);
          $('button', other).setAttribute('aria-expanded', String(other === item && open));
        });
        setTimeout(() => ScrollTrigger.refresh(), 600);
      },
      { signal },
    );
  });
}

/* ---------- Solutions: highlight the section being read ---------- */

function initSectionNav() {
  const links = $$('[data-spy] a');
  if (!links.length) return;
  links.forEach((link) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('is-current', self.isActive),
    });
  });
}

/* ---------- Contact form: validates, then hands the message to the visitor's email app ---------- */

function initForm({ signal }) {
  const form = $('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);

  const messages = {
    name: 'Enter your name.',
    email: 'Enter an email address we can reply to, like name@company.com.',
    message: 'Tell us a little about what you need.',
  };

  const check = (input) => {
    const field = input.closest('.field');
    const error = $('.field__error', field);
    const bad = !input.checkValidity();
    field.classList.toggle('is-invalid', bad);
    input.setAttribute('aria-invalid', String(bad));
    error.textContent = bad ? messages[input.name] || 'Check this field.' : '';
    return !bad;
  };

  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('blur', () => input.value && check(input), { signal });
    input.addEventListener('input', () => input.closest('.field').classList.contains('is-invalid') && check(input), { signal });
  });

  form.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
      const inputs = $$('input, textarea', form);
      const firstBad = inputs.filter((input) => !check(input))[0];
      if (firstBad) {
        firstBad.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      const subject = `Enquiry from ${data.name}${data.company ? `, ${data.company}` : ''}`;
      const body = `${data.message}\n\n${data.name}\n${data.email}${data.company ? `\n${data.company}` : ''}`;
      window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = `Your email app should now be open with the message ready to send. If nothing happened, email ${form.dataset.to} directly.`;
    },
    { signal },
  );
}

/* ---------- Lifecycle ---------- */

function init() {
  document.documentElement.classList.add('js');
  const controller = new AbortController();
  page = { cleanups: [() => controller.abort()] };
  const ctx = { signal: controller.signal };

  startSmoothScroll();
  lenis?.resize();

  const gsapContext = gsap.context(() => {
    initNav(ctx);
    initButtons(ctx);
    initType();
    initClocks();
    initGlobe(ctx);
    initVideo(ctx);
    initProcess(ctx);
    initRoles(ctx);
    initMoments();
    initValues(ctx);
    initSectionNav();
    initForm(ctx);
  });
  page.cleanups.push(() => gsapContext.revert());

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function destroy() {
  if (!page) return;
  page.cleanups.reverse().forEach((fn) => fn());
  page = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
