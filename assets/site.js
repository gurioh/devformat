(function () {
  const GA_ID = 'G-VRRM1M4TJY';
  const namespace = {};
  const eventTimers = {};

  function emitEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  function getPageName() {
    return document.body.dataset.page || 'unknown';
  }

  namespace.initAnalytics = function initAnalytics() {
    if (window.__dfAnalyticsLoaded) return;
    window.__dfAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  };

  namespace.trackEvent = function trackEvent(eventName, params) {
    const payload = Object.assign({ page: getPageName() }, params || {});

    if (eventName === 'tool_convert') {
      const key = eventName + ':' + (payload.tool || payload.page);
      clearTimeout(eventTimers[key]);
      eventTimers[key] = setTimeout(function () {
        emitEvent(eventName, payload);
      }, 700);
      return;
    }

    emitEvent(eventName, payload);
  };

  namespace.showToast = function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__dfToastTimer);
    window.__dfToastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  };

  namespace.copyText = async function copyText(text, successMessage, extraParams) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      namespace.showToast(successMessage || 'Copied to clipboard.');
      namespace.trackEvent('copy_output', Object.assign({ tool: getPageName(), length: text.length }, extraParams || {}));
      return true;
    } catch (error) {
      namespace.showToast('Clipboard access failed.');
      return false;
    }
  };

  namespace.setActiveNav = function setActiveNav() {
    const current = document.body.dataset.page;
    if (!current) return;
    document.querySelectorAll('[data-page-link]').forEach(function (link) {
      if (link.dataset.pageLink === current) {
        link.classList.add('active');
      }
    });
  };

  namespace.wireExampleButtons = function wireExampleButtons(handler) {
    document.querySelectorAll('[data-example]').forEach(function (button) {
      button.addEventListener('click', function () {
        namespace.trackEvent('example_click', {
          tool: getPageName(),
          example: button.dataset.example
        });
        handler(button.dataset.example);
      });
    });
  };

  namespace.collapseToolSections = function collapseToolSections() {
    if (document.body.dataset.layout !== 'tool') return;

    const sections = document.querySelectorAll('main.page-shell > .split-layout, main.page-shell > .section-stack, main.page-shell > .faq-card');
    sections.forEach(function (section) {
      if (section.parentElement && section.parentElement.classList.contains('tool-fold')) return;

      const details = document.createElement('details');
      details.className = 'tool-fold';

      const summary = document.createElement('summary');
      if (section.classList.contains('faq-card')) {
        summary.textContent = 'FAQ';
      } else {
        const headings = Array.from(section.querySelectorAll('h2')).map(function (heading) {
          return heading.textContent.trim();
        }).filter(Boolean);
        summary.textContent = headings.some(function (text) {
          return /step|example/i.test(text);
        }) ? 'Examples & notes' : 'Usage notes';
      }

      section.parentNode.insertBefore(details, section);
      details.appendChild(summary);
      details.appendChild(section);

      details.addEventListener('toggle', function () {
        if (!details.open) return;
        namespace.trackEvent('fold_open', {
          tool: getPageName(),
          section: summary.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        });
      });
    });
  };

  window.DevFormat = namespace;

  document.addEventListener('DOMContentLoaded', function () {
    namespace.initAnalytics();
    namespace.setActiveNav();
    namespace.collapseToolSections();
  });
})();
