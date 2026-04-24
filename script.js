const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
const hasLoco = typeof LocomotiveScroll !== 'undefined';
// Toggle smooth/virtual scrolling. Set to `false` for native, snappier scroll.
const useSmoothScroll = false;

// Scroll reveal animation (skips if reduced motion)
if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// Gentle parallax on hero card (desktop only)
const heroCard = document.querySelector('.hero-card');
const enableParallax = heroCard && !prefersReduced && window.innerWidth > 900;
if (enableParallax) {
  heroCard.addEventListener('mousemove', (e) => {
    const rect = heroCard.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 5;
    heroCard.style.transform = `translateY(-2px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
  });
}

// Cursor light trail (throttled, disabled on small screens/reduced motion)
const trail = document.querySelector('.trail');
let rafId = null;
let pendingPos = null;
const trailEnabled = trail && !prefersReduced && window.innerWidth > 900;
if (trailEnabled) {
  window.addEventListener('pointermove', (e) => {
    pendingPos = {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    };
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        trail.style.setProperty('--x', `${pendingPos.x}%`);
        trail.style.setProperty('--y', `${pendingPos.y}%`);
        rafId = null;
      });
    }
  });
} else if (trail) {
  trail.style.display = 'none';
}

// Text reveal / staggered word animation on load
document.querySelectorAll('.reveal-text').forEach((text) => {
  const words = text.textContent.trim().split(/\s+/);
  text.innerHTML = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.animationDelay = `${i * 0.08}s`;
    text.appendChild(span);
    // append a real text node for spacing so inline-block spans keep a visible gap
    text.appendChild(document.createTextNode(' '));
  });
  if (prefersReduced) {
    text.querySelectorAll('span').forEach((span) => {
      span.style.animation = 'none';
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    });
  }
});

// Light mode toggle
const modeToggle = document.querySelector('.mode-toggle');
function applyMode(isLight){
  if(isLight) document.body.classList.add('light'); else document.body.classList.remove('light');
  if(modeToggle){
    modeToggle.setAttribute('aria-pressed', String(isLight));
    modeToggle.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  // control heavy animations when not using smooth scroll
  if (!useSmoothScroll) {
    if (isLight) document.body.classList.remove('no-anim');
    else document.body.classList.add('no-anim');
  }
}

if (modeToggle) {
  // initialize from saved preference or system preference
  const saved = localStorage.getItem('cornerstone-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const startLight = saved ? (saved === 'light') : prefersLight;
  applyMode(startLight);

  modeToggle.addEventListener('click', () => {
    const nowLight = !document.body.classList.contains('light');
    applyMode(nowLight);
    localStorage.setItem('cornerstone-theme', nowLight ? 'light' : 'dark');
  });
}

// If not using smooth scroll, disable some heavy background animations in dark mode
document.addEventListener('DOMContentLoaded', () => {
  if (!useSmoothScroll && !document.body.classList.contains('light')) {
    document.body.classList.add('no-anim');
  }
});

// Optional: Locomotive Scroll + GSAP ScrollTrigger integration
window.addEventListener('load', () => {
  if (prefersReduced) return;
  const container = document.querySelector('#smooth-container');
  // If using smooth (virtual) scrolling, require Locomotive. Otherwise proceed with native scrolling.
  if (useSmoothScroll && (!container || !hasLoco)) return;
  if (!hasGSAP || !hasScrollTrigger) return;

  // register the plugin so ScrollTrigger hooks into GSAP correctly
  try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* ignore if already registered */ }

  let locoScroll = null;
  if (useSmoothScroll) {
    locoScroll = new LocomotiveScroll({
      el: container,
      smooth: true,
      smartphone: { smooth: true },
      tablet: { smooth: true },
    });

    ScrollTrigger.scrollerProxy(container, {
      scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true }) : locoScroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: container.style.transform ? 'transform' : 'fixed',
    });

    locoScroll.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  }

  // Simple fade/slide for reveal elements via GSAP
  gsap.utils.toArray('.reveal').forEach((el) => {
    const st = { trigger: el, start: 'top 80%' };
    if (useSmoothScroll) st.scroller = container;
    gsap.fromTo(el,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: st,
      }
    );
  });

  // ensure measurements are up-to-date, then refresh ScrollTrigger
  if (locoScroll) locoScroll.update();
  ScrollTrigger.refresh();
});

// Note: cursor trail is handled via a lightweight RAF-based updater above.

// Mobile menu toggle
(() => {
  const burger = document.querySelector('.mobile-hamburger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!burger || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    if (isOpen) closeMenu(); else openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // close when clicking outside the inner panel
  menu.addEventListener('click', (e) => {
    if (e.target === menu) closeMenu();
  });
})();

  // Contact popup (call-sign) toggle
  (function(){
    const callBtns = document.querySelectorAll('.call-sign');
    const overlay = document.getElementById('contact-popup-overlay');
    const closeBtn = document.getElementById('contact-popup-close');
    if (!overlay || !callBtns.length) return;

    function openPopup(e){
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden','false');
      // prevent background scroll
      document.body.style.overflow = 'hidden';
    }
    function closePopup(){
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }

    callBtns.forEach(btn => btn.addEventListener('click', openPopup));
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
  })();
