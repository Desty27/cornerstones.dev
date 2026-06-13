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
  // Always force dark mode as requested
  applyMode(false);
  modeToggle.style.display = 'none';
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

// ── WhatsApp Floating Widget ─────────────────────────────────
(function () {
  const WA_NUMBER = '916370704148';
  const WA_MESSAGE = encodeURIComponent('Hi CornerStone! I found you online and would like to know more about your services.');
  const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

  const fab = document.createElement('div');
  fab.className = 'wa-fab';
  fab.setAttribute('role', 'complementary');
  fab.setAttribute('aria-label', 'Chat with us on WhatsApp');
  fab.innerHTML = `
    <div class="wa-tooltip" role="tooltip">
      <p>💬 Chat with us!</p>
      <span>We usually reply in minutes.</span>
    </div>
    <a class="wa-btn" href="${WA_URL}" target="_blank" rel="noopener noreferrer"
       aria-label="Open WhatsApp chat with CornerStone" title="WhatsApp us">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  `;

  document.body.appendChild(fab);

  // Auto-show tooltip after 3s, dismiss on click
  let tooltipTimer = setTimeout(() => {
    fab.classList.add('tooltip-visible');
    // Hide after 5 more seconds
    setTimeout(() => fab.classList.remove('tooltip-visible'), 5000);
  }, 3000);

  fab.querySelector('.wa-btn').addEventListener('click', () => {
    clearTimeout(tooltipTimer);
    fab.classList.remove('tooltip-visible');
  });
})();
