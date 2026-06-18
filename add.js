'use strict';

/* ================================================================
   travel.js — Horizons Travel Agency
   ================================================================ */

/* ----------------------------------------------------------------
   1. HEADER — scroll effect + burger menu
   ---------------------------------------------------------------- */
const header    = document.getElementById('header');
const burger    = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  backTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

burger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

// Close mobile nav when link clicked
document.querySelectorAll('.mobile-nav__link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
  });
});

/* ----------------------------------------------------------------
   2. HERO SLIDESHOW — auto + dot controls
   ---------------------------------------------------------------- */
const slides    = document.querySelectorAll('.hero__slide');
const dots      = document.querySelectorAll('.hero__dot');
let currentSlide = 0;
let slideTimer;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }

function startSlider() {
  slideTimer = setInterval(nextSlide, 5500);
}

function resetSlider() {
  clearInterval(slideTimer);
  startSlider();
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.slide, 10));
    resetSlider();
  });
});

startSlider();

/* ----------------------------------------------------------------
   3. SMOOTH SCROLL for nav links
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ----------------------------------------------------------------
   4. TOUR FILTER TABS
   ---------------------------------------------------------------- */
const filterTabs  = document.querySelectorAll('.filter-tab');
const tourCards   = document.querySelectorAll('.tour-card');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;

    tourCards.forEach(card => {
      const cats = card.dataset.category || '';
      const visible = filter === 'all' || cats.includes(filter);

      if (visible) {
        card.classList.remove('hidden');
        card.style.animation = 'cardIn .35s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Inject card-in keyframe
const style = document.createElement('style');
style.textContent = '@keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }';
document.head.appendChild(style);

/* ----------------------------------------------------------------
   5. FAVOURITES
   ---------------------------------------------------------------- */
const favs = new Set(JSON.parse(localStorage.getItem('horizons_favs') || '[]'));

function saveFavs() {
  localStorage.setItem('horizons_favs', JSON.stringify([...favs]));
}

document.querySelectorAll('.tour-card__fav').forEach(btn => {
  const id = btn.dataset.id;
  if (favs.has(id)) { btn.textContent = '♥'; btn.classList.add('active'); }

  btn.addEventListener('click', () => {
    if (favs.has(id)) {
      favs.delete(id);
      btn.textContent = '♡';
      btn.classList.remove('active');
      showToast('Удалено из избранного', 'info');
    } else {
      favs.add(id);
      btn.textContent = '♥';
      btn.classList.add('active');
      showToast('Добавлено в избранное ♥', 'success');
    }
    saveFavs();
  });
});

/* ----------------------------------------------------------------
   6. SEARCH BAR
   ---------------------------------------------------------------- */
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () => {
  const dest   = document.getElementById('searchDest').value;
  const date   = document.getElementById('searchDate').value;
  const people = document.getElementById('searchPeople').value;
  const budget = document.getElementById('searchBudget').value;

  if (!dest) {
    showToast('Выберите направление', 'error');
    document.getElementById('searchDest').focus();
    return;
  }

  searchBtn.textContent = '⏳ Ищем...';
  searchBtn.disabled = true;

  setTimeout(() => {
    searchBtn.textContent = 'Найти тур';
    searchBtn.disabled = false;
    showModal({
      icon: '✈️',
      title: `Туры в ${dest}`,
      body: `Найдено предложений: ${Math.floor(Math.random() * 12) + 3}\nДата вылета: ${date || 'гибкая'} · ${people} · Бюджет: ${budget}\n\nМенеджер свяжется с вами в течение 30 минут.`
    });
  }, 1400);
});

// Set default date to tomorrow
const dateInput = document.getElementById('searchDate');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.value = tomorrow.toISOString().split('T')[0];
dateInput.min = tomorrow.toISOString().split('T')[0];

/* ----------------------------------------------------------------
   7. ANIMATED COUNTERS
   ---------------------------------------------------------------- */
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    statsObserver.unobserve(entry.target);

    document.querySelectorAll('.stat').forEach(stat => {
      const el     = stat.querySelector('.stat__num');
      const target = parseInt(stat.dataset.count, 10);
      const suffix = stat.dataset.suffix || '';
      animateCounter(el, target, suffix);
    });
  });
}, { threshold: .4 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

function animateCounter(el, target, suffix) {
  let current  = 0;
  const dur    = 1800;
  const fps    = 16;
  const inc    = target / (dur / fps);

  const t = setInterval(() => {
    current = Math.min(current + inc, target);
    el.textContent = Math.floor(current).toLocaleString('ru-RU') + suffix;
    if (current >= target) clearInterval(t);
  }, fps);
}

/* ----------------------------------------------------------------
   8. COUNTRY TILES click
   ---------------------------------------------------------------- */
document.querySelectorAll('.country-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const country = tile.dataset.country;
    showModal({
      icon: '🌍',
      title: country,
      body: `Откройте для себя ${country}! Наш менеджер подберёт лучшие туры под ваш бюджет и даты.\n\nПозвоните нам или оставьте заявку — ответим за 30 минут.`
    });
  });
});

/* ----------------------------------------------------------------
   9. REVIEWS SLIDER
   ---------------------------------------------------------------- */
const track      = document.getElementById('reviewsTrack');
const reviewPrev = document.getElementById('reviewPrev');
const reviewNext = document.getElementById('reviewNext');
const reviewCards = track.querySelectorAll('.review-card');
let reviewIndex = 0;
let reviewsPerView = getReviewsPerView();

function getReviewsPerView() {
  return window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;
}

function getCardWidth() {
  return reviewCards[0].offsetWidth + 24; // +gap
}

function updateReviews() {
  const maxIndex = Math.max(0, reviewCards.length - reviewsPerView);
  reviewIndex = Math.min(reviewIndex, maxIndex);
  track.style.transform = `translateX(-${reviewIndex * getCardWidth()}px)`;
}

reviewNext.addEventListener('click', () => {
  const maxIndex = reviewCards.length - reviewsPerView;
  reviewIndex = reviewIndex >= maxIndex ? 0 : reviewIndex + 1;
  updateReviews();
});

reviewPrev.addEventListener('click', () => {
  const maxIndex = reviewCards.length - reviewsPerView;
  reviewIndex = reviewIndex <= 0 ? maxIndex : reviewIndex - 1;
  updateReviews();
});

// Auto-advance reviews
let reviewTimer = setInterval(() => reviewNext.click(), 4500);
track.addEventListener('mouseenter', () => clearInterval(reviewTimer));
track.addEventListener('mouseleave', () => { reviewTimer = setInterval(() => reviewNext.click(), 4500); });

window.addEventListener('resize', () => {
  reviewsPerView = getReviewsPerView();
  updateReviews();
}, { passive: true });

/* ----------------------------------------------------------------
   10. BOOKING BUTTON
   ---------------------------------------------------------------- */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action="book"]');
  if (!btn) return;

  const tour = btn.dataset.tour;
  showModal({
    icon: '🌟',
    title: `«${tour}»`,
    body: `Отличный выбор! Для бронирования тура свяжитесь с нашим менеджером — он подберёт оптимальные даты и условия.\n\n📞 +7 (7152) 32-10-00\n📧 hello@horizons.kz`
  });
});

/* ----------------------------------------------------------------
   11. NEWSLETTER
   ---------------------------------------------------------------- */
const newsletterBtn   = document.getElementById('newsletterBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

newsletterBtn.addEventListener('click', () => {
  const email = newsletterEmail.value.trim();
  if (!email || !email.includes('@')) {
    newsletterEmail.style.borderColor = '#E74C3C';
    showToast('Введите корректный email', 'error');
    setTimeout(() => { newsletterEmail.style.borderColor = ''; }, 2000);
    return;
  }

  newsletterBtn.textContent = '⏳';
  newsletterBtn.disabled = true;

  setTimeout(() => {
    newsletterBtn.textContent = '✓ Подписка оформлена';
    newsletterEmail.value = '';
    showToast('Вы подписаны на горящие туры! 🎉', 'success');
    setTimeout(() => {
      newsletterBtn.textContent = 'Подписаться';
      newsletterBtn.disabled = false;
    }, 4000);
  }, 1000);
});

/* ----------------------------------------------------------------
   12. CONTACT FORM
   ---------------------------------------------------------------- */
const contactSubmit = document.getElementById('contactSubmit');

contactSubmit.addEventListener('click', () => {
  const name  = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const dest  = document.getElementById('cDest').value;
  const msg   = document.getElementById('cMessage').value.trim();

  const errors = [];
  if (!name)  errors.push('cName');
  if (!phone) errors.push('cPhone');
  if (!dest)  errors.push('cDest');

  if (errors.length) {
    errors.forEach(id => {
      const el = document.getElementById(id);
      el.style.borderColor = '#E74C3C';
      setTimeout(() => { el.style.borderColor = ''; }, 2500);
    });
    showToast('Заполните обязательные поля', 'error');
    document.getElementById(errors[0]).focus();
    return;
  }

  contactSubmit.textContent = '⏳ Отправляем...';
  contactSubmit.disabled = true;

  setTimeout(() => {
    contactSubmit.textContent = 'Отправить заявку';
    contactSubmit.disabled = false;
    ['cName', 'cPhone', 'cDest', 'cMessage'].forEach(id => { document.getElementById(id).value = ''; });

    showModal({
      icon: '✅',
      title: `Заявка принята, ${name}!`,
      body: `Ваш менеджер свяжется по номеру ${phone} в течение 30 минут.\n\nНаправление: ${dest || 'не указано'}`
    });
  }, 1600);
});

/* ----------------------------------------------------------------
   13. SCROLL REVEAL — IntersectionObserver
   ---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.tour-card, .why-card, .stat, .country-tile, .review-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  revealObserver.observe(el);
});

/* ----------------------------------------------------------------
   14. MODAL
   ---------------------------------------------------------------- */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose    = document.getElementById('modalClose');
const modalOk       = document.getElementById('modalOk');
const modalIcon     = document.getElementById('modalIcon');
const modalTitle    = document.getElementById('modalTitle');
const modalBody     = document.getElementById('modalBody');

function showModal({ icon = '✈️', title = '', body = '' }) {
  modalIcon.textContent  = icon;
  modalTitle.textContent = title;
  modalBody.textContent  = body;
  modalBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOk.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ----------------------------------------------------------------
   15. TOAST
   ---------------------------------------------------------------- */
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info', duration = 3200) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icons[type] || '·'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ----------------------------------------------------------------
   16. BACK TO TOP
   ---------------------------------------------------------------- */
const backTop = document.getElementById('backTop');
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
