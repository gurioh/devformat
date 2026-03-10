(function () {
  const GA_ID = 'G-VRRM1M4TJY';
  const namespace = {};

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
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
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

  namespace.copyText = async function copyText(text, successMessage) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      namespace.showToast(successMessage || 'Copied to clipboard.');
      namespace.trackEvent('copy_output', { length: text.length });
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
        handler(button.dataset.example);
      });
    });
  };

  window.DevFormat = namespace;

  document.addEventListener('DOMContentLoaded', function () {
    namespace.initAnalytics();
    namespace.setActiveNav();
  });
})();
