// ══════════════════════════════════════
//  THEME TOGGLE — Light / Dark Mode
// ══════════════════════════════════════
(function () {
  var html = document.documentElement;
  var btn  = document.getElementById('theme-toggle');

  // Restore saved preference
  var saved = localStorage.getItem('theme');
  if (saved === 'light') {
    html.setAttribute('data-theme', 'light');
  }

  if (btn) {
    btn.addEventListener('click', function () {
      if (html.getAttribute('data-theme') === 'light') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    });
  }
})();

// CURSOR — disabled on touch/iOS devices
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (!isTouchDevice && dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '60px';
      ring.style.height = '60px';
      dot.style.transform = 'translate(-50%,-50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '44px';
      ring.style.height = '44px';
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}

// MOBILE NAV
const burger = document.getElementById('navBurger');
const drawer = document.getElementById('navDrawer');
const close = document.getElementById('drawerClose');
burger.onclick = () => drawer.classList.add('open');
close.onclick = () => drawer.classList.remove('open');
function closeDrawer() { drawer.classList.remove('open'); }

// SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => revealObs.observe(r));

// TOOLKIT BARS
const bars = document.querySelectorAll('.tool-fill');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.width = e.target.dataset.pct + '%';
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
bars.forEach(b => barObs.observe(b));

// ── SWIPE CAROUSEL + TAB FILTER ──
(function() {
  var track = document.getElementById('swTrack');
  var dotsWrap = document.getElementById('swDots');
  var prevBtn = document.getElementById('swPrev');
  var nextBtn = document.getElementById('swNext');
  var tabs = document.querySelectorAll('.work-tab');

  var cur = 0;
  var perView = getPerView();
  var visibleCards = [];

  function getPerView() {
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  }

  function getCardWidth() {
    var allCards = track.querySelectorAll('.sw-card');
    for (var i = 0; i < allCards.length; i++) {
      if (!allCards[i].classList.contains('hidden-card')) {
        return allCards[i].offsetWidth + 24;
      }
    }
    return 400;
  }

  function rebuildVisible() {
    visibleCards = [];
    var allCards = track.querySelectorAll('.sw-card');
    allCards.forEach(function(c) {
      if (!c.classList.contains('hidden-card')) visibleCards.push(c);
    });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    var maxIdx = Math.max(0, visibleCards.length - perView);
    for (var i = 0; i <= maxIdx; i++) {
      var d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      (function(idx){ d.onclick = function(){ goTo(idx); }; })(i);
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    var dots = dotsWrap.querySelectorAll('.dot');
    dots.forEach(function(d, i) { d.classList.toggle('active', i === cur); });
  }

  function goTo(idx) {
    var maxIdx = Math.max(0, visibleCards.length - perView);
    cur = Math.max(0, Math.min(idx, maxIdx));
    var cardW = getCardWidth();
    var offset = cur * cardW;
    track.style.transform = 'translateX(-' + offset + 'px)';
    updateDots();
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur >= Math.max(0, visibleCards.length - perView);
  }

  function resetCarousel() {
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    cur = 0;
    perView = getPerView();
    rebuildVisible();
    buildDots();
    setTimeout(function() {
      track.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 50);
    prevBtn.disabled = true;
    nextBtn.disabled = visibleCards.length <= perView;
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      var allCards = track.querySelectorAll('.sw-card');
      allCards.forEach(function(card) {
        if (filter === 'all') {
          card.classList.remove('hidden-card');
        } else {
          var cat = card.querySelector('.sw-card-cat');
          if (cat && cat.textContent.trim() === filter) {
            card.classList.remove('hidden-card');
          } else {
            card.classList.add('hidden-card');
          }
        }
      });
      resetCarousel();
    });
  });

  prevBtn.onclick = function() { goTo(cur - 1); };
  nextBtn.onclick = function() { goTo(cur + 1); };

  var isDragging = false, startX = 0, startCur = 0, dragOffset = 0;
  track.addEventListener('mousedown', function(e) {
    isDragging = true; startX = e.clientX; startCur = cur; dragOffset = 0;
    track.style.transition = 'none'; track.classList.add('dragging'); e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var cardW = getCardWidth();
    var maxIdx = Math.max(0, visibleCards.length - perView);
    var newOffset = Math.max(0, Math.min(startCur * cardW - dx, maxIdx * cardW));
    track.style.transform = 'translateX(-' + newOffset + 'px)';
    dragOffset = dx;
  });
  document.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false; track.classList.remove('dragging');
    track.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    var cardW = getCardWidth();
    var threshold = cardW * 0.25;
    if (dragOffset < -threshold) goTo(startCur + 1);
    else if (dragOffset > threshold) goTo(startCur - 1);
    else goTo(startCur);
  });

  var touchStartX = 0, touchStartCur = 0;
  track.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX; touchStartCur = cur;
    track.style.transition = 'none';
  }, { passive: true });
  track.addEventListener('touchmove', function(e) {
    var dx = e.touches[0].clientX - touchStartX;
    var cardW = getCardWidth();
    var maxIdx = Math.max(0, visibleCards.length - perView);
    var newOffset = Math.max(0, Math.min(touchStartCur * cardW - dx, maxIdx * cardW));
    track.style.transform = 'translateX(-' + newOffset + 'px)';
  }, { passive: true });
  track.addEventListener('touchend', function(e) {
    track.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    var dx = e.changedTouches[0].clientX - touchStartX;
    var cardW = getCardWidth(); var threshold = cardW * 0.2;
    if (dx < -threshold) goTo(touchStartCur + 1);
    else if (dx > threshold) goTo(touchStartCur - 1);
    else goTo(touchStartCur);
  }, { passive: true });

  window.addEventListener('resize', function() {
    perView = getPerView(); rebuildVisible(); buildDots();
    goTo(Math.min(cur, Math.max(0, visibleCards.length - perView)));
  });

  resetCarousel();
})();