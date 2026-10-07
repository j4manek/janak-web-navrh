// Měření: události jdou do window.dataLayer (standard pro Google Tag Manager), ale jen po souhlasu
// návštěvníka. Stav souhlasu se předává jako Google Consent Mode v2. Samo nic neposílá do Google.
// Až bude web ostrý, přidá se GTM kontejner a události se mapují na tagy bez zásahu do HTML.
(function () {
  window.dataLayer = window.dataLayer || [];
  var KEY = 'janak-consent';
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var page = location.pathname;
  var banner = document.querySelector('.cookie-banner');

  // Napojení formuláře na Telegram (outputs/lead-telegram-automation). [doplnit] až bude
  // Worker nasazený - do té doby formulář jen ukáže potvrzení lokálně (prototyp).
  var FALLBACK_PHONE = '+420 773 146 244';

  // Formulář může mít vlastní cíl (jiný e-mail/kanál než hlavní poptávka) přes
  // data-lead-endpoint-var="JMENO_PROMENNE" - jinak se použije společný JANAK_LEAD_ENDPOINT.
  function leadEndpointFor(form) {
    var varName = form.dataset.leadEndpointVar;
    if (varName && window[varName]) return window[varName];
    return window.JANAK_LEAD_ENDPOINT || '';
  }

  function readConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveConsent(value) {
    try {
      if (value) localStorage.setItem(KEY, value);
      else localStorage.removeItem(KEY);
    } catch (e) { /* bez úložiště se volba nezapamatuje, banner se zobrazí znovu */ }
  }

  // 'unset' = návštěvník zatím nerozhodl; štítky u tlačítek podle toho ukazují stav
  function applyConsent(value) {
    var state = value || 'unset';
    var s = state === 'granted' ? 'granted' : 'denied';
    document.body.dataset.consent = state;
    window.dataLayer.push({
      event: 'consent_update',
      analytics_storage: s,
      ad_storage: s,
      ad_user_data: s,
      ad_personalization: s
    });
    if (banner) banner.hidden = state !== 'unset';
  }

  function track(name, params) {
    if (readConsent() !== 'granted') return;
    var data = Object.assign({ event: name, page_path: page }, params);
    window.dataLayer.push(data);
    if (local) console.info('[měření]', data);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookie-reset]')) {
      saveConsent(null);
      applyConsent(null);
      return;
    }
    var el = e.target.closest('a');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      track('phone_click', { phone_location: el.dataset.telLoc || 'neznamo' });
    } else if (href.indexOf('mailto:') === 0) {
      track('email_click', { email_location: el.dataset.emailLoc || 'neznamo' });
    } else if (el.dataset.cta) {
      track('cta_click', { cta_name: el.dataset.cta });
    }
  });

  if (banner) {
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent-set]');
      if (!btn) return;
      var value = btn.dataset.consentSet;
      saveConsent(value);
      applyConsent(value);
    });
  }

  // Zobrazí záložní zprávu, když se poptávku nepodařilo odeslat na Telegram (Worker nedostupný
  // apod.) - klonuje styl existujícího [data-thanks] prvku, aby nebylo nutné upravovat HTML.
  function showSendError(form, thanks) {
    var fail = form.querySelector('[data-send-error]');
    if (!fail) {
      fail = document.createElement('p');
      fail.setAttribute('data-send-error', '');
      fail.setAttribute('role', 'status');
      if (thanks) fail.className = thanks.className;
      fail.textContent = 'Nepodařilo se odeslat poptávku. Zavolejte nám prosím na ' + FALLBACK_PHONE + ', nebo zkuste formulář odeslat znovu.';
      if (thanks && thanks.parentNode) thanks.parentNode.insertBefore(fail, thanks.nextSibling);
      else form.appendChild(fail);
    }
    fail.hidden = false;
  }

  // Formulář: kde lidé začnou, kde odcházejí a kde se zaseknou. Hodnoty polí neposíláme, jen názvy polí.
  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var type = form.dataset.formType || 'neznamo';
    var started = false;
    var submitted = false;
    var seen = {};
    var lastField = '';

    form.addEventListener('focusin', function (e) {
      var name = e.target.name || '';
      if (!name) return;
      lastField = name;
      if (!started) {
        started = true;
        track('form_start', { form_type: type, first_field: name });
      }
      if (!seen[name]) {
        seen[name] = true;
        track('form_field', { form_type: type, field: name });
      }
    });

    // Neplatné pole při odeslání (chybějící údaj, špatný formát)
    form.addEventListener('invalid', function (e) {
      track('form_error', { form_type: type, field: e.target.name || '' });
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;
      var service = form.elements.service ? form.elements.service.value : '';
      track('generate_lead', { form_type: type, service: service });

      var thanks = form.querySelector('[data-thanks]');
      var submitBtn = form.querySelector('button[type="submit"]');
      var endpoint = leadEndpointFor(form);

      if (!endpoint) {
        // Prototyp bez nasazeného Workeru: zachovat dosavadní chování (jen potvrzení).
        if (thanks) thanks.hidden = false;
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      fetch(endpoint, { method: 'POST', body: new FormData(form) })
        .then(function (res) {
          if (!res.ok) throw new Error('send_failed');
          if (thanks) thanks.hidden = false;
        })
        .catch(function () {
          showSendError(form, thanks);
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    // Začal, ale neodeslal: odešel z stránky nebo přepnul záložku
    function abandon() {
      if (started && !submitted) {
        track('form_abandon', { form_type: type, last_field: lastField });
        started = false;
      }
    }
    window.addEventListener('pagehide', abandon);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') abandon();
    });
  });

  applyConsent(readConsent());
})();
