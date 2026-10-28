document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuButton = document.querySelector('#menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.hidden = !open;
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) setMenu(false);
});

const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach(element => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  reveals.forEach(element => revealObserver.observe(element));
}

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
}

const counters = document.querySelectorAll('[data-count]');
function animateCounter(element) {
  const target = Number(element.dataset.count);
  if (reduceMotion) return;
  const start = performance.now();
  const duration = 1100;
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if ('IntersectionObserver' in window && !reduceMotion) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  counters.forEach(counter => counterObserver.observe(counter));
}

const form = document.querySelector('#student-form');
const status = document.querySelector('#form-status');
const requiredFields = [...form.querySelectorAll('[required]')];

function validateField(field) {
  const wrapper = field.closest('.form-field');
  const error = wrapper.querySelector('.error-message');
  let message = '';
  if (!field.value.trim()) message = 'Preenche este campo.';
  if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    message = 'Indica um email válido.';
  }
  wrapper.classList.toggle('invalid', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
  return !message;
}

requiredFields.forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
  });
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const valid = requiredFields.map(validateField).every(Boolean);
  if (!valid) {
    status.textContent = 'Reveja os campos assinalados.';
    status.style.color = '#8d2020';
    requiredFields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }
  const data = new FormData(form);
  const subject = `Inscrição ILDL — ${data.get('nome')}`;
  const body = [
    `Nome: ${data.get('nome')}`,
    `Email: ${data.get('email')}`,
    `Universidade: ${data.get('universidade') || 'Não indicada'}`,
    `Curso: ${data.get('curso') || 'Não indicado'}`,
    `Área de interesse: ${data.get('interesse')}`
  ].join('\n');
  status.style.color = '#356044';
  status.textContent = 'Inscrição preparada. O teu programa de email será aberto para concluíres o envio.';
  window.location.href = `mailto:geral@ildl.ao?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
