// Měření: GA4 (gtag.js) s Google Consent Mode v2. Výchozí stav je "denied" - gtag.js
// se načte vždy (nutné pro consent mode), ale nic neukládá ani neposílá do GA4, dokud
// návštěvník neklikne "Přijmout měření". Na localhostu se gtag.js vůbec nenačítá.
(function () {
  var GA4_ID = 'G-LV31BR60C2';
  // Google Ads (účet 257-552-2698): konverze "Web – klik na telefon" a "Web – odeslaný formulář (poptávka)"
  var ADS_ID = 'AW-16766390468';
  var ADS_LABELS = { phone_click: 'of6LCOuegq0dEMSh67o-', generate_lead: 'wgVGCOiegq0dEMSh67o-' };
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var KEY = 'janak-consent';
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var page = location.pathname;
  var banner = document.querySelector('.cookie-banner');

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  if (!local) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_ID);
    if (ADS_ID) gtag('config', ADS_ID);
  }

  // Formuláře posílá odeslat.php e-mailem na info@. Bez nastaveného endpointu (lokální náhled)
  // formulář jen ukáže potvrzení.
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
    if (state !== 'unset') {
      gtag('consent', 'update', {
        analytics_storage: s,
        ad_storage: s,
        ad_user_data: s,
        ad_personalization: s
      });
    }
    if (banner) banner.hidden = state !== 'unset';
  }

  function track(name, params) {
    if (readConsent() !== 'granted') return;
    var data = Object.assign({ page_path: page }, params);
    gtag('event', name, data);
    if (ADS_ID && ADS_LABELS[name] && !local) gtag('event', 'conversion', { send_to: ADS_ID + '/' + ADS_LABELS[name] });
    if (local) console.info('[měření]', name, data);
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

  // Zobrazí záložní zprávu, když se poptávku nepodařilo odeslat (server nedostupný
  // apod.) - klonuje styl existujícího [data-thanks] prvku, aby nebylo nutné upravovat HTML.
  // Úspěch: ukázat poděkování, vyčistit formulář (včetně popisku nahrané fotky) a posunout poděkování do zorného pole
  function finishOk(form, thanks, real) {
    form.reset();
    var file = form.querySelector('input[type="file"]');
    if (file) file.dispatchEvent(new Event('change', { bubbles: true }));
    var ph = form.querySelector('input[name="phone"]');
    if (ph) { ph.setCustomValidity(''); ph.removeAttribute('aria-invalid'); }
    var fe = form.querySelector('.fld-err'); if (fe) fe.hidden = true;
    var fail = form.querySelector('[data-send-error]'); if (fail) fail.hidden = true;
    showThanksCard();
  }

  // Poděkování jako karta uprostřed obrazovky (místo textu pod formulářem)
  function showThanksCard() {
    if (!document.getElementById('jt-style')) {
      var st = document.createElement('style');
      st.id = 'jt-style';
      st.textContent =
        '.jt-ov{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(7,26,49,.62);backdrop-filter:blur(3px);animation:jt-fade .25s ease}' +
        '.jt-card{position:relative;width:min(26rem,100%);padding:2.2rem 1.8rem 1.8rem;border-radius:1.1rem;background:#fff;color:#10243A;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.4);animation:jt-pop .3s cubic-bezier(.2,.8,.2,1)}' +
        '.jt-ic{display:grid;place-items:center;width:4.2rem;height:4.2rem;margin:0 auto 1.1rem;border-radius:50%;background:#40DCE0;box-shadow:0 0 0 .55rem rgba(64,220,224,.2)}' +
        '.jt-ic svg{width:2.2rem;height:2.2rem;fill:none;stroke:#071a31;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}' +
        '.jt-card h3{margin:0 0 .5rem;font:800 1.5rem/1.2 Montserrat,system-ui,sans-serif}' +
        '.jt-card p{margin:0 0 1.4rem;font:500 1rem/1.5 Montserrat,system-ui,sans-serif;color:#44566a}' +
        '.jt-btn{display:inline-block;padding:.8rem 2rem;border:0;border-radius:.6rem;background:#40DCE0;color:#071a31;font:700 1rem/1 Montserrat,system-ui,sans-serif;cursor:pointer}' +
        '.jt-btn:hover{filter:brightness(.95)}' +
        '@keyframes jt-fade{from{opacity:0}to{opacity:1}}@keyframes jt-pop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}' +
        '@media (prefers-reduced-motion:reduce){.jt-ov,.jt-card{animation:none}}';
      document.head.appendChild(st);
    }
    var prev = document.activeElement;
    var ov = document.createElement('div');
    ov.className = 'jt-ov';
    ov.innerHTML = '<div class="jt-card" role="dialog" aria-modal="true" aria-labelledby="jt-h" tabindex="-1">' +
      '<div class="jt-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h3 id="jt-h">Děkujeme za poptávku</h3>' +
      '<p>Vaši zprávu jsme přijali a co nejdříve se vám ozveme.</p>' +
      '<button type="button" class="jt-btn">Zavřít</button></div>';
    function close() {
      document.removeEventListener('keydown', onKey);
      ov.remove();
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.jt-btn')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    ov.querySelector('.jt-btn').focus();
  }

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

    // Telefon: aspoň 9 číslic (mezery, +420 a pomlčky se nepočítají), chyba přímo u pole
    var phone = form.querySelector('input[name="phone"]');
    var phoneErr = null;
    function phoneDigits() { return (phone.value.match(/\d/g) || []).length; }
    function checkPhone(showEmpty) {
      var empty = !phone.value.trim();
      var bad = !empty && phoneDigits() < 9;
      phone.setCustomValidity(bad ? 'Zadejte telefon alespoň s 9 číslicemi.' : '');
      if (!phoneErr) {
        phoneErr = document.createElement('p');
        phoneErr.className = 'fld-err'; phoneErr.setAttribute('role', 'alert'); phoneErr.hidden = true;
        phoneErr.id = (phone.id || 'phone') + '-err';
        (phone.closest('label') || phone.parentNode).insertAdjacentElement('afterend', phoneErr);
        phone.setAttribute('aria-describedby', phoneErr.id);
      }
      phoneErr.textContent = bad ? 'Zadejte telefon alespoň s 9 číslicemi, např. 773 146 244.' : '';
      phoneErr.hidden = !bad;
      phone.setAttribute('aria-invalid', bad ? 'true' : 'false');
      return !bad;
    }
    if (phone) {
      phone.addEventListener('input', function () { if (phone.getAttribute('aria-invalid') === 'true' || phoneDigits() >= 9) checkPhone(); });
      phone.addEventListener('blur', function () { checkPhone(); });
      var sb = form.querySelector('button[type="submit"]');
      if (sb) sb.addEventListener('click', function () { checkPhone(); });
    }

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
      var thanks = form.querySelector('[data-thanks]');
      var submitBtn = form.querySelector('button[type="submit"]');
      var endpoint = leadEndpointFor(form);

      if (!endpoint) {
        // Prototyp bez nasazeného Workeru: zachovat dosavadní chování (jen potvrzení).
        track('generate_lead', { form_type: type, service: service });
        finishOk(form, thanks, false);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      // Časový limit, ať tlačítko nezůstane zablokované při výpadku sítě
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
      fetch(endpoint, { method: 'POST', body: new FormData(form), signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (!res.ok) throw new Error('send_failed');
          return res.json().catch(function () { return {}; });
        })
        .then(function (data) {
          // Služba (FormSubmit) vrací HTTP 200 i při odmítnutí, např. neaktivovaný formulář
          if (data && (data.success === false || data.success === 'false')) throw new Error('send_failed');
          // Konverze se měří až po úspěšném odeslání, aby se nepočítaly neodeslané poptávky
          track('generate_lead', { form_type: type, service: service });
          finishOk(form, thanks, true);
        })
        .catch(function () {
          submitted = false;
          showSendError(form, thanks);
        })
        .finally(function () {
          if (timer) clearTimeout(timer);
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
