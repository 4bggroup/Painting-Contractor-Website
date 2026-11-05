'use strict';
(() => {
  const config = window.PAINTING_CONFIG || {};
  const business = config.businessName || 'Stillwell Painting';
  const email = (config.contactEmail || '').trim(), phone = (config.phone || '').trim();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.PAINTING_COLOUR = 'Warm linen';
  document.querySelectorAll('[data-brand]').forEach(el => {
    el.textContent = config.brandWord || 'stillwell';
    const dot = document.createElement('span'); dot.className = 'brand-dot'; dot.textContent = '.'; el.append(dot);
  });
  document.querySelectorAll('[data-brand-name]').forEach(el => el.textContent = business);
  document.querySelectorAll('.wordmark').forEach(el => el.setAttribute('aria-label', business + ' home'));
  document.title = 'Brendale Painters | Interior & Exterior Painting | ' + business;
  document.getElementById('year').textContent = new Date().getFullYear();
  const contact = document.querySelector('.contact-details');
  contact.hidden = !(phone || email || config.serviceArea);
  const phoneLink = document.querySelector('[data-contact-phone]'), emailLink = document.querySelector('[data-contact-email]');
  phoneLink.hidden = !phone; phoneLink.textContent = phone; phoneLink.href = 'tel:' + phone.replace(/[^\d+]/g, '');
  emailLink.hidden = !email; emailLink.textContent = email; emailLink.href = 'mailto:' + email;
  const area = document.querySelector('[data-contact-area]'); area.hidden = !config.serviceArea; area.textContent = config.serviceArea || '';
  const menu = document.querySelector('.menu-toggle'), nav = document.getElementById('main-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && !nav.contains(e.target)) closeMenu(); });
  const colours = {
    linen: {name:'Warm linen',hex:'#e8e2d4',note:'NO. 01 / WARM & EASY',description:'A soft neutral that lets the rest of the room breathe.'},
    sage: {name:'Garden sage',hex:'#9da990',note:'NO. 02 / FRESH & GROUNDED',description:'A gentle, botanical green with an easy connection to the outdoors.'},
    clay: {name:'Earthy clay',hex:'#a65b43',note:'NO. 03 / WARM & CHARACTERFUL',description:'A rich earthy tone that brings warmth and a little personality.'},
    green: {name:'Quiet green',hex:'#435b56',note:'NO. 04 / CALM & CONSIDERED',description:'A deep, restful green for spaces with a little more depth.'}
  };
  document.querySelectorAll('[data-colour]').forEach(button => button.addEventListener('click', () => {
    const c = colours[button.dataset.colour]; window.PAINTING_COLOUR = c.name;
    document.querySelectorAll('[data-colour]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const sample = document.getElementById('paint-sample'); sample.style.setProperty('--paint', c.hex);
    sample.style.color = ['green','clay'].includes(button.dataset.colour) ? '#fffaf1' : '#223e35';
    document.getElementById('sample-number').textContent = c.note;
    document.getElementById('sample-name').textContent = c.name;
    document.getElementById('sample-description').textContent = c.description;
    window.dispatchEvent(new CustomEvent('paint:colour', {detail:c.name}));
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0, items = 0;
    document.querySelectorAll('[data-service-kind]').forEach(card => {
      const show = filter === 'all' || card.dataset.serviceKind.split(' ').includes(filter);
      card.hidden = !show; card.classList.remove('just-filtered');
      if (show) { visible++; items += card.querySelectorAll('li').length; card.classList.add('is-visible','just-filtered'); }
    });
    document.getElementById('service-filter-status').textContent = visible + ' service ' + (visible === 1 ? 'area' : 'areas') + ' · ' + items + ' listed services';
  }));
  const dialog = document.getElementById('image-dialog'); let previousFocus;
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    previousFocus = button;
    const image = document.getElementById('dialog-image'); image.src = button.dataset.image; image.alt = button.querySelector('img').alt;
    document.getElementById('image-caption').textContent = button.dataset.caption;
    dialog.showModal(); document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (previousFocus) previousFocus.focus({preventScroll:true}); });
  const header = document.querySelector('.header'); let framePending = false;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--reading-progress', max > 0 ? Math.min(1,Math.max(0,scrollY/max)) : 0);
    header.classList.toggle('compact', scrollY > 30); framePending = false;
  }
  window.addEventListener('scroll', () => { if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  window.addEventListener('resize', updateScroll); updateScroll();
  if ('IntersectionObserver' in window) {
    const quick = document.getElementById('quick-book'); let heroOut = false, bookingVisible = false, footerVisible = false;
    const ctaObserver = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.target.matches('.hero')) heroOut = !e.isIntersecting && e.boundingClientRect.bottom < 0; if(e.target.id === 'booking') bookingVisible = e.isIntersecting; if(e.target.matches('footer')) footerVisible = e.isIntersecting; });
      quick.hidden = !heroOut || bookingVisible || footerVisible;
    }, {threshold:0});
    [document.querySelector('.hero'), document.getElementById('booking'), document.querySelector('footer')].forEach(el=>ctaObserver.observe(el));
    if (!reducedMotion) {
      document.querySelectorAll('.team-values,.property-grid,.readiness-grid,.process-grid,.service-cards').forEach(group => [...group.children].forEach((child,i)=>child.style.setProperty('--reveal-delay',(i%3)*85+'ms')));
      document.body.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold:.06});
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
  }
})();
