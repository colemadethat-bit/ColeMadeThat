// ====== Mobile nav menu toggle ======
const navMenuBtn = document.querySelector('.nav-menu-btn');
const siteHeader = document.querySelector('.site-header');

if (navMenuBtn && siteHeader) {
  navMenuBtn.addEventListener('click', () => {
    const open = siteHeader.classList.toggle('nav-open');
    navMenuBtn.setAttribute('aria-expanded', open);
    navMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
}

// ====== Smooth scroll for in-page links (and close mobile menu after tap) ======
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  const href = a.getAttribute('href');
  if (href === '#') return;
  a.addEventListener('click', (e) => {
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const header = document.querySelector('.site-header');
      const btn = document.querySelector('.nav-menu-btn');
      if (header && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Open menu');
        }
      }
    }
  });
});

// ====== Nav "you are here" — underline the section currently in view ======
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
const sectionIds = ['hero', 'products', 'quote', 'samples', 'about', 'contact'];

function setActiveNav() {
  const y = window.scrollY + 180;
  let activeId = 'hero';
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.offsetTop;
    const height = el.offsetHeight;
    if (y >= top && y < top + height) {
      activeId = id;
      break;
    }
  }
  navLinks.forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '#' + activeId) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', setActiveNav);
window.addEventListener('load', setActiveNav);

// ====== Quote form: show/hide fields by product type ======
const productTypeSelect = document.getElementById('productType');
const fieldsLabels = document.getElementById('fields-labels');
const fieldsBanners = document.getElementById('fields-banners');
const fieldsPackaging = document.getElementById('fields-packaging');
const fieldsDesign = document.getElementById('fields-design');

function showQuoteFieldsFor(type) {
  [fieldsLabels, fieldsBanners, fieldsPackaging, fieldsDesign].forEach((el) => {
    if (el) el.hidden = true;
  });
  if (type === 'labels' || type === 'stickers') {
    if (fieldsLabels) fieldsLabels.hidden = false;
  } else if (type === 'banners') {
    if (fieldsBanners) fieldsBanners.hidden = false;
  } else if (type === 'packaging') {
    if (fieldsPackaging) fieldsPackaging.hidden = false;
  } else if (type === 'design') {
    if (fieldsDesign) fieldsDesign.hidden = false;
  }
}

if (productTypeSelect) {
  productTypeSelect.addEventListener('change', () => {
    showQuoteFieldsFor(productTypeSelect.value);
  });
  if (productTypeSelect.value) showQuoteFieldsFor(productTypeSelect.value);
}

// ====== Quote form: build email and submit via mailto ======
const quoteForm = document.getElementById('quoteForm');
const quoteFormMessage = document.getElementById('quoteFormMessage');

if (quoteForm) {
  quoteForm.addEventListener('submit', (e) => {
    const action = quoteForm.getAttribute('action') || '';
    if (action.includes('formspree') && !action.includes('YOUR_QUOTE_FORM_ID')) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(quoteForm);
    const type = formData.get('productType') || '';

    const lines = [
      `Quote request from: ${formData.get('name') || ''}`,
      `Email: ${formData.get('email') || ''}`,
      `Phone: ${formData.get('phone') || ''}`,
      `Brand / Company: ${formData.get('company') || ''}`,
      `Product type: ${type}`,
      '',
    ];

    if (type === 'labels' || type === 'stickers') {
      lines.push(`Shape: ${formData.get('shape') || ''}`);
      lines.push(`Size: ${formData.get('size') || ''}`);
      lines.push(`Quantity: ${formData.get('quantity') || ''}`);
      lines.push(`Number of designs: ${formData.get('numDesigns') || ''}`);
      lines.push(`Material: ${formData.get('material') || ''}`);
    } else if (type === 'banners') {
      lines.push(`Banner size: ${formData.get('bannerSize') || ''}`);
      lines.push(`Quantity: ${formData.get('bannerQty') || ''}`);
      lines.push(`Number of designs: ${formData.get('bannerNumDesigns') || ''}`);
      lines.push(`Material: ${formData.get('bannerMaterial') || ''}`);
      lines.push(`Finishing: ${formData.get('bannerFinishing') || ''}`);
    } else if (type === 'packaging') {
      lines.push(`Packaging type: ${formData.get('packagingType') || ''}`);
      lines.push(`Size / dimensions: ${formData.get('packagingSize') || ''}`);
      lines.push(`Quantity: ${formData.get('packagingQty') || ''}`);
    } else if (type === 'design') {
      lines.push(`What they need: ${formData.get('designWhat') || ''}`);
      lines.push(`Timeline: ${formData.get('designTimeline') || ''}`);
      lines.push(`Design details: ${formData.get('designDetails') || ''}`);
    }

    lines.push('', 'Additional details:', formData.get('details') || '');
    lines.push('', '--- Sent via ColeMadeThat website quote form');

    const subject = encodeURIComponent(`Quote request: ${type} from ${formData.get('name') || 'website'}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:ColeMadeThat@gmail.com?subject=${subject}&body=${body}`;

    if (quoteFormMessage) {
      quoteFormMessage.textContent = 'An email draft opened with your quote. Review and send it to reach Cole.';
      quoteFormMessage.style.color = 'var(--hero-green)';
    }
    quoteForm.reset();
    showQuoteFieldsFor('');
  });
}

// ====== Sample form: email draft to Cole ======
const sampleForm = document.getElementById('sampleForm');
const sampleMessage = document.getElementById('sampleMessage');

if (sampleForm) {
  sampleForm.addEventListener('submit', (e) => {
    const action = sampleForm.getAttribute('action') || '';
    if (action.includes('formspree') && !action.includes('YOUR_SAMPLE_FORM_ID')) {
      return;
    }
    e.preventDefault();
    const formData = new FormData(sampleForm);
    const entries = Object.fromEntries(formData.entries());
    const subject = encodeURIComponent(`Sample pack request from ${entries.name || 'website'}`);
    const bodyLines = [
      `Name: ${entries.name || ''}`,
      `Email: ${entries.email || ''}`,
      '',
      'Shipping address:',
      entries.address || '',
      '',
      `Most interested in: ${entries.interest || ''}`,
      '',
      'Sent via ColeMadeThat website.',
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:ColeMadeThat@gmail.com?subject=${subject}&body=${body}`;
    if (sampleMessage) {
      sampleMessage.textContent = 'An email draft opened with your info. Review and send to reach Cole.';
      sampleMessage.style.color = 'var(--text-main)';
    }
    sampleForm.reset();
  });
}

