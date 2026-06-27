const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
const hasLoco = typeof LocomotiveScroll !== 'undefined';
const useSmoothScroll = false;

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

document.querySelectorAll('.reveal-text').forEach((text) => {
  const words = text.textContent.trim().split(/\s+/);
  text.innerHTML = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.animationDelay = `${i * 0.08}s`;
    text.appendChild(span);
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

const modeToggle = document.querySelector('.mode-toggle');
function applyMode(isLight){
  if(isLight) document.body.classList.add('light'); else document.body.classList.remove('light');
  if(modeToggle){
    modeToggle.setAttribute('aria-pressed', String(isLight));
    modeToggle.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  if (!useSmoothScroll) {
    if (isLight) document.body.classList.remove('no-anim');
    else document.body.classList.add('no-anim');
  }
}

if (modeToggle) {
  applyMode(false);
  modeToggle.addEventListener('click', function() {
    const isLight = document.body.classList.contains('light');
    applyMode(!isLight);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!useSmoothScroll && !document.body.classList.contains('light')) {
    document.body.classList.add('no-anim');
  }
});

window.addEventListener('load', () => {
  if (prefersReduced) return;
  const container = document.querySelector('#smooth-container');
  if (useSmoothScroll && (!container || !hasLoco)) return;
  if (!hasGSAP || !hasScrollTrigger) return;
  try { gsap.registerPlugin(ScrollTrigger); } catch (e) { }
  let locoScroll = null;
  if (useSmoothScroll) {
    locoScroll = new LocomotiveScroll({ el: container, smooth: true, smartphone: { smooth: true }, tablet: { smooth: true } });
    ScrollTrigger.scrollerProxy(container, {
      scrollTop(value) { return arguments.length ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true }) : locoScroll.scroll.instance.scroll.y; },
      getBoundingClientRect() { return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; },
      pinType: container.style.transform ? 'transform' : 'fixed',
    });
    locoScroll.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  }
  gsap.utils.toArray('.reveal').forEach((el) => {
    const st = { trigger: el, start: 'top 80%' };
    if (useSmoothScroll) st.scroller = container;
    gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: st });
  });
  if (locoScroll) locoScroll.update();
  ScrollTrigger.refresh();
});

(() => {
  const burger = document.querySelector('.mobile-hamburger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!burger || !menu) return;
  function openMenu() { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', () => { const isOpen = menu.classList.contains('open'); if (isOpen) closeMenu(); else openMenu(); });
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });
})();

(function(){
  const callBtns = document.querySelectorAll('.call-sign');
  const overlay = document.getElementById('contact-popup-overlay');
  const closeBtn = document.getElementById('contact-popup-close');
  if (!overlay || !callBtns.length) return;
  function openPopup(e){ if (e && typeof e.preventDefault === 'function') e.preventDefault(); if (e && typeof e.stopPropagation === 'function') e.stopPropagation(); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
  function closePopup(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }
  callBtns.forEach(btn => btn.addEventListener('click', openPopup));
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
})();

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
  let tooltipTimer = setTimeout(() => {
    fab.classList.add('tooltip-visible');
    setTimeout(() => fab.classList.remove('tooltip-visible'), 5000);
  }, 3000);
  fab.querySelector('.wa-btn').addEventListener('click', () => {
    clearTimeout(tooltipTimer);
    fab.classList.remove('tooltip-visible');
  });
})();

/* ══ ROTATING TEXT CYCLE ══ */
(function() {
  var el = document.getElementById('rotating-text');
  if (!el) return;
  var phrases = [
    'DIGITAL ARCHITECTURE THAT CONVERTS.',
    'AI WORKFLOWS THAT SCALE.',
    'WEB ENGINEERING THAT PAYS FOR ITSELF.'
  ];
  var idx = 0;
  setInterval(function() {
    el.style.opacity = '0';
    setTimeout(function() {
      idx = (idx + 1) % phrases.length;
      el.textContent = phrases[idx];
      el.style.opacity = '1';
    }, 400);
  }, 3500);
})();

/* ══ PROJECT DATA ─ shared between hero stack & portfolio ══ */
var PROJECTS = [
  { name:"Foodies Corner", flag:"🇺🇸", tagline:"High-Scale Headless E-Commerce", niche:"ecommerce", tech:["Hugo","Shopify Plus","Cloudflare Pages"], rating:"5.0 ★★★★★", metric:"Core conversion rates scaled by 34%", comment:"The headless store is incredibly fast. Conversion rates jumped 34% in the first week!", image_url:"assets/ui-foodies.jpg", bg:"#1a1a2e" },
  { name:"Horizon Venture Capital", flag:"🇨🇭", tagline:"B2B Fintech & Investment Group", niche:"fintech", tech:["Next.js","Sanity CMS","Vercel Edge"], rating:"4.9 ★★★★★", metric:"Zero-downtime global rollout", comment:"Flawless global rollout. Jamstack architecture handles our massive traffic with ease.", image_url:"assets/ui-horizon.jpg", bg:"#0f1923" },
  { name:"Veloce Systems", flag:"🇺🇸", tagline:"AI-Driven Cloud Infrastructure", niche:"cloud", tech:["React","Tailwind","CRM Middleware"], rating:"5.0 ★★★★★", metric:"58% more high-intent leads", comment:"Stunning performance. The cloud dashboard is responsive and helped capture 58% more leads.", image_url:"assets/ui-veloce.jpg", bg:"#0d1a14" },
  { name:"Nexus Logistics", flag:"🇬🇧", tagline:"Custom CRM/SRM Software", niche:"logistics", tech:["Vue.js","Node.js","AWS Lambda"], rating:"5.0 ★★★★★", metric:"Manual dispatch time cut by 40 hrs/wk", comment:"Custom CRM cuts down manual tasks by 40 hours a week. Truly game-changing engineering.", image_url:"assets/ui-crm.jpg", bg:"#141a26" },
  { name:"Aura Media Group", flag:"🇨🇦", tagline:"Headless CMS Architecture", niche:"media", tech:["Next.js","Strapi","Vercel"], rating:"4.9 ★★★★★", metric:"Editorial velocity increased by 300%", comment:"Editorial workflow has never been smoother. Next.js + Headless CMS increased page load speeds by 300%.", image_url:"assets/ui-cms.jpg", bg:"#1a0f1a" },
  { name:"FinServe Global", flag:"🇦🇺", tagline:"RAG-Powered AI Chatbot", niche:"fintech", tech:["Python","LangChain","Pinecone"], rating:"5.0 ★★★★★", metric:"Tier-1 support tickets reduced by 82%", comment:"Our customer service workload dropped by 82% thanks to this intelligent Pinecone RAG chatbot.", image_url:"assets/ui-chatbot.jpg", bg:"#0a1628" },
  { name:"Prime Dental Network", flag:"🇩🇪", tagline:"AI Voice Receptionist", niche:"healthcare", tech:["Twilio","OpenAI","Node.js"], rating:"4.9 ★★★★★", metric:"450+ autonomous bookings monthly", comment:"AI Voice receptionist booked 450+ appointments autonomously this month. Highly recommended.", image_url:"assets/ui-voice.jpg", bg:"#14181a" },
  { name:"Apex Real Estate", flag:"🇸🇬", tagline:"Automated Lead Gen Routing", niche:"realestate", tech:["Next.js","HubSpot","Vercel"], rating:"5.0 ★★★★★", metric:"Cost-per-lead dropped by 65%", comment:"Automated routing system works flawlessly. Our cost-per-lead dropped by 65%.", image_url:"assets/ui-leadgen.jpg", bg:"#1a1410" }
];

/* ══ HERO ROTATING STACK ══ */
(function() {
  var container = document.getElementById('rotating-stack');
  if (!container) return;

  var order = PROJECTS.map(function(_,i){ return i; });

  function posClasses(pos) {
    if (pos === 0) return 'z-30 scale-100 translate-y-0 translate-x-0 opacity-100';
    if (pos === 1) return 'z-20 scale-95 translate-y-4 translate-x-4 opacity-70';
    if (pos === 2) return 'z-10 scale-90 translate-y-8 translate-x-8 opacity-40';
    return 'z-0 scale-75 translate-y-12 translate-x-12 opacity-0 pointer-events-none';
  }

  function buildCards() {
    container.innerHTML = '';
    PROJECTS.forEach(function(p, idx) {
      var card = document.createElement('div');
      card.dataset.idx = idx;
      var pos = order.indexOf(idx);
      card.className = 'absolute inset-0 m-auto h-fit w-[90%] max-w-[340px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out ' + posClasses(pos);
      card.innerHTML =
        '<div class="relative w-full h-[280px] bg-zinc-900 border-b border-zinc-800 overflow-hidden">' +
          '<img src="' + p.image_url + '" alt="' + p.name + '" class="w-full h-full object-cover object-top">' +
        '</div>' +
        '<div class="flex flex-col bg-black px-4 py-3">' +
          '<div class="flex items-center justify-between mb-1">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-xl leading-none">' + p.flag + '</span>' +
              '<span class="text-white font-bold text-sm tracking-wide">' + p.name + '</span>' +
            '</div>' +
            '<span class="text-lime-400 font-bold text-xs tracking-widest">' + p.rating + '</span>' +
          '</div>' +
          '<p class="text-zinc-400 text-xs font-medium leading-relaxed italic mt-1">"' + p.comment + '"</p>' +
        '</div>';
      container.appendChild(card);
    });
  }

  function cycleStack() {
    var first = order.shift();
    order.push(first);
    var cards = container.children;
    Array.prototype.forEach.call(cards, function(card){
      var idx = parseInt(card.dataset.idx, 10);
      var pos = order.indexOf(idx);
      card.className = 'absolute inset-0 m-auto h-fit w-[90%] max-w-[340px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out ' + posClasses(pos);
    });
  }

  buildCards();
  setInterval(cycleStack, 3500);
})();

/* ══ PORTFOLIO GRID GENERATION ══ */
(function() {
  var grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  
  PROJECTS.forEach(function(p){
    // Exclude Foodies Corner and Horizon Venture Capital to make a 2x3 (6 cards) grid
    if (p.name.includes("Foodies") || p.name.includes("Horizon")) return;

    var card = document.createElement('article');
    card.className = 'group flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(180,208,58,0.1)] transition-all duration-300';
    card.innerHTML =
      '<div class="w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden relative" style="aspect-ratio: 384/688;">' +
        '<img src="' + p.image_url + '" alt="' + p.name + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src=\'https://via.placeholder.com/600x400/18181b/ffffff?text=Project+UI\'" loading="lazy">' +
      '</div>' +
      '<div class="flex flex-col flex-grow p-6">' +
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<span class="px-2 py-1 text-[10px] uppercase tracking-wider text-lime-400 bg-lime-400/10 border border-lime-400/20 rounded-full">' + p.tagline + '</span>' +
        '</div>' +
        '<div class="flex items-center gap-2 mb-6">' +
          '<span class="text-2xl leading-none">' + p.flag + '</span>' +
          '<h3 class="text-xl font-bold text-white">' + p.name + '</h3>' +
        '</div>' +
        '<div class="flex-grow"></div>' +
        '<div class="mt-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800">' +
          '<p class="text-zinc-400 font-medium text-xs italic">"' + p.comment + '"</p>' +
          '<div class="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800 text-[11px] text-lime-400">' +
            '<span>' + p.rating + '</span>' +
            '<span class="font-bold text-white">' + p.metric + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  });
})();