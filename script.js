const menuButton = document.querySelector('[data-menu-toggle]');
const siteNav = document.querySelector('[data-site-nav]');

function setMenuOpen(open) {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  siteNav.toggleAttribute('data-open', open);
}

menuButton?.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

const navigationLinks = [...document.querySelectorAll('.nav-link')];
const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navigationLinks.forEach((link) => {
        link.toggleAttribute('aria-current', link.getAttribute('href') === `#${visible.target.id}`);
      });
    },
    { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.25, 0.5] },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const backToTop = document.querySelector('[data-back-to-top]');

function updateBackToTop() {
  backToTop?.setAttribute('data-visible', String(window.scrollY > 720));
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) setMenuOpen(false);
});
