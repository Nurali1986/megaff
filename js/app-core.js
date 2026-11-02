// ============================================================================
// MEGA FULFILMENT (megaff.uz) — CORE INTERACTIVE ENGINE
// Supports Variant 1, Variant 2, Variant 3 | 4 Languages (UZ, RU, EN, ZH)
// ============================================================================

(function () {
  const RATES = {
    t1: 600,
    t2: 1000,
    t3: 1300,
    t4: 3000,
    t5: 6000,
    t6: 50000
  };

  const ADDON_RATES = {
    zip: 500,      // per item
    bubble: 700,   // per item
    box: 12000,    // per master box (approx 1 box per 25 items or manual)
    delivery: 80000 // flat per trip
  };

  let currentLang = localStorage.getItem('mega_lang') || 'uz';

  // --- 1. TRANSLATION & DROPDOWN ENGINE ---
  window.toggleLangDropdown = function (event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('langMenu');
    const chevron = document.getElementById('langChevron');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      menu.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  };

  document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('langDropdown');
    const menu = document.getElementById('langMenu');
    const chevron = document.getElementById('langChevron');
    if (dropdown && menu && !dropdown.contains(e.target)) {
      menu.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  });

  window.setLang = function (lang, silent) {
    if (!window.MEGA_I18N || !window.MEGA_I18N[lang]) lang = 'uz';
    currentLang = lang;
    localStorage.setItem('mega_lang', lang);
    document.documentElement.lang = lang;

    const dict = window.MEGA_I18N[lang];

    // Update dropdown trigger label & close menu
    const labelMap = { uz: 'UZ', ru: 'RU', en: 'EN', zh: '中文' };
    const currentLabelEl = document.getElementById('currentLangLabel');
    if (currentLabelEl) currentLabelEl.textContent = labelMap[lang] || lang.toUpperCase();
    const menu = document.getElementById('langMenu');
    const chevron = document.getElementById('langChevron');
    if (menu) menu.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';

    // Update all [data-i18n] text nodes
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // Update all [data-i18n-html] nodes
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Update all [data-i18n-placeholder] inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update active state on language buttons
    ['uz', 'ru', 'en', 'zh'].forEach(function (l) {
      document.querySelectorAll('[data-lang-btn="' + l + '"]').forEach(function (btn) {
        if (l === lang) {
          btn.classList.add('active-lang');
        } else {
          btn.classList.remove('active-lang');
        }
      });
    });

    // Recalculate calculator to refresh localized units
    if (typeof window.calcMega === 'function') {
      window.calcMega();
    }
    if (typeof window.calcLitr === 'function') {
      window.calcLitr();
    }

    if (!silent) {
      const langNames = { uz: "Õzbek tili (UZ)", ru: "Русский язык (RU)", en: "English (EN)", zh: "中文 (ZH)" };
      window.showToast(langNames[lang] || lang.toUpperCase());
    }
  };

  // --- 2. CALCULATOR ENGINE ---
  window.changeTierQty = function (tier, delta) {
    const input = document.getElementById('tier-qty-' + tier);
    if (!input) return;
    let val = parseInt(input.value, 10) || 0;
    val = Math.max(0, val + delta);
    input.value = val;
    window.calcMega();
  };

  window.setPresetQty = function (tier, qty) {
    ['t1', 't2', 't3', 't4', 't5', 't6'].forEach(function (k) {
      const inp = document.getElementById('tier-qty-' + k);
      if (inp) inp.value = (k === tier ? qty : 0);
    });
    window.calcMega();
  };

  window.calcMega = function () {
    const dict = (window.MEGA_I18N && window.MEGA_I18N[currentLang]) || window.MEGA_I18N.uz;
    let baseSum = 0;
    let totalQty = 0;

    for (const k in RATES) {
      const inp = document.getElementById('tier-qty-' + k);
      if (!inp) continue;
      const qty = Math.max(0, parseInt(inp.value, 10) || 0);
      totalQty += qty;
      baseSum += qty * RATES[k];
    }

    // Add-ons
    let addonSum = 0;
    const chkZip = document.getElementById('addon-zip');
    const chkBubble = document.getElementById('addon-bubble');
    const chkBox = document.getElementById('addon-box');
    const chkDelivery = document.getElementById('addon-delivery');

    if (chkZip && chkZip.checked) addonSum += totalQty * ADDON_RATES.zip;
    if (chkBubble && chkBubble.checked) addonSum += totalQty * ADDON_RATES.bubble;
    if (chkBox && chkBox.checked && totalQty > 0) {
      const boxesNeeded = Math.max(1, Math.ceil(totalQty / 25));
      addonSum += boxesNeeded * ADDON_RATES.box;
    }
    if (chkDelivery && chkDelivery.checked) addonSum += ADDON_RATES.delivery;

    const totalSum = baseSum + addonSum;
    const cur = dict.currency || "sõm";
    const pcs = dict.unit_pcs || "dona";

    const totalEl = document.getElementById('baraka-total');
    const countEl = document.getElementById('sum-items-count');
    const avgEl = document.getElementById('avg-per-item');
    const addonEl = document.getElementById('addons-sum-val');

    if (totalEl) totalEl.textContent = totalSum.toLocaleString('ru-RU') + " " + cur;
    if (countEl) countEl.textContent = totalQty.toLocaleString('ru-RU') + " " + pcs;
    if (addonEl) addonEl.textContent = addonSum.toLocaleString('ru-RU') + " " + cur;

    if (avgEl) {
      if (totalQty > 0) {
        const avg = Math.round(totalSum / totalQty);
        avgEl.textContent = avg.toLocaleString('ru-RU') + " " + cur;
      } else {
        avgEl.textContent = "0 " + cur;
      }
    }

    // Also update ROI comparison if present (Variant 3)
    const roiSelfEl = document.getElementById('roi-self-cost');
    const roiMegaEl = document.getElementById('roi-mega-cost');
    const roiSaveEl = document.getElementById('roi-save-val');
    if (roiMegaEl && roiSaveEl) {
      const effectiveQty = totalQty > 0 ? totalQty : 1000;
      const sampleMega = totalQty > 0 ? totalSum : effectiveQty * 1300;
      const sampleSelf = 14500000 + effectiveQty * 950; // warehouse rent + staff + retail pack
      const saved = Math.max(0, sampleSelf - sampleMega);
      if (roiSelfEl) roiSelfEl.textContent = sampleSelf.toLocaleString('ru-RU') + " " + cur;
      roiMegaEl.textContent = sampleMega.toLocaleString('ru-RU') + " " + cur;
      roiSaveEl.textContent = saved.toLocaleString('ru-RU') + " " + cur;
    }
  };

  // Backwards compatibility alias
  window.calcBaraka = window.calcMega;

  // --- 3. VOLUME (LITR) MODAL CALCULATOR ---
  window.openLitrModal = function () {
    const m = document.getElementById('litr-modal');
    if (m) {
      m.classList.remove('hidden');
      window.calcLitr();
    }
  };

  window.closeLitrModal = function () {
    const m = document.getElementById('litr-modal');
    if (m) m.classList.add('hidden');
  };

  window.calcLitr = function () {
    const dict = (window.MEGA_I18N && window.MEGA_I18N[currentLang]) || window.MEGA_I18N.uz;
    const cur = dict.currency || "sõm";
    const lenEl = document.getElementById('litr-len');
    const widEl = document.getElementById('litr-wid');
    const hgtEl = document.getElementById('litr-hgt');
    const litrDirectEl = document.getElementById('litr-input');
    const qtyEl = document.getElementById('litr-qty');

    let litr = 1.5;
    if (lenEl && widEl && hgtEl) {
      const l = parseFloat(lenEl.value) || 20;
      const w = parseFloat(widEl.value) || 15;
      const h = parseFloat(hgtEl.value) || 10;
      litr = Math.max(0.1, +((l * w * h) / 1000).toFixed(2));
      if (litrDirectEl) litrDirectEl.value = litr;
    } else if (litrDirectEl) {
      litr = Math.max(0.1, parseFloat(litrDirectEl.value) || 1.5);
    }

    const qty = Math.max(1, parseInt(qtyEl ? qtyEl.value : 500, 10) || 500);
    let ratePerUnit = 600;
    if (litr <= 0.5) ratePerUnit = 600;
    else if (litr <= 2) ratePerUnit = 1000;
    else if (litr <= 5) ratePerUnit = 1300;
    else if (litr <= 15) ratePerUnit = 3000;
    else if (litr <= 50) ratePerUnit = 6000;
    else ratePerUnit = 50000;

    const res = ratePerUnit * qty;
    const resEl = document.getElementById('litr-result');
    const unitRateEl = document.getElementById('litr-unit-rate');
    if (resEl) resEl.textContent = res.toLocaleString('ru-RU') + " " + cur;
    if (unitRateEl) unitRateEl.textContent = ratePerUnit.toLocaleString('ru-RU') + " " + cur + " (" + litr + " L)";
  };

  // Transfer calculator quote to Contact Form
  window.applyQuoteToForm = function () {
    const totalEl = document.getElementById('baraka-total');
    const countEl = document.getElementById('sum-items-count');
    const msgInput = document.getElementById('contact-msg');
    if (msgInput && totalEl && countEl) {
      msgInput.value = "Kalkulyator bõyiça buyurtma: " + countEl.textContent + " | Taxminiy summa: " + totalEl.textContent;
      if (typeof window.updateCharCount === 'function') window.updateCharCount();
    }
    const contactSec = document.getElementById('contact');
    if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
  };

  // --- 4. LEAD SUBMISSION (TELEGRAM, VIP GROUP & WHATSAPP) ---
  window.updateCharCount = function () {
    const msg = document.getElementById('contact-msg');
    const cnt = document.getElementById('char-count');
    if (msg && cnt) cnt.textContent = msg.value.length + " / 1000";
  };

  window.submitMegaLead = function (event, channel) {
    if (event) event.preventDefault();
    const form = document.getElementById('contact-form');
    if (form && typeof form.reportValidity === 'function' && !form.reportValidity()) {
      return;
    }
    const name = (document.getElementById('contact-name') || {}).value || "Seller";
    const phone = (document.getElementById('contact-phone') || {}).value || "";
    const mp = (document.getElementById('contact-mp') || {}).value || "Uzum / WB / Yandex";
    const msg = (document.getElementById('contact-msg') || {}).value || "";
    const totalEl = document.getElementById('baraka-total');
    const calcSummary = totalEl ? totalEl.textContent : "";

    const leadText =
      "Yangi Ariza — MegaFulfilment (megaff.uz)\n" +
      "Ism / Dõkon: " + name + "\n" +
      "Telefon: +998 " + phone + "\n" +
      "Marketpleys: " + mp + "\n" +
      (calcSummary && calcSummary !== "0 sõm" ? "Kalkulyator hisobi: " + calcSummary + "\n" : "") +
      "Xabar: " + msg;

    // Copy to clipboard so user can paste immediately in Telegram if needed
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(leadText).catch(function () {});
    }

    if (channel === 'whatsapp') {
      const waUrl = "https://wa.me/" + window.MEGA_CONFIG.whatsapp + "?text=" + encodeURIComponent(leadText);
      window.open(waUrl, '_blank');
      window.showToast("Ariza WhatsApp (+998 95 980 88 17) orqali yõnaltirildi!");
    } else if (channel === 'vip') {
      window.open(window.MEGA_CONFIG.telegramLeadGroup, '_blank');
      window.showToast("Arizangiz nusxalandi! Yopiq Telegram guruhga qõşiling.");
    } else {
      // Default: Telegram @megaffuz with pre-filled text
      const tgUrl = "https://t.me/" + window.MEGA_CONFIG.telegramUser + "?text=" + encodeURIComponent(leadText);
      window.open(tgUrl, '_blank');
      window.showToast("Ariza @megaffuz Telegram'ga yõnaltirildi!");
    }
  };

  // --- 5. TOAST NOTIFICATION ---
  window.showToast = function (text) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(window._megaToastTimer);
    window._megaToastTimer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 4000);
  };

  // --- 6. FAQ ACCORDION ---
  window.toggleFaq = function (btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const body = item.querySelector('.faq-body');
    const icon = item.querySelector('.faq-icon');
    const isOpen = !body.classList.contains('hidden');
    document.querySelectorAll('.faq-item .faq-body').forEach(function (b) {
      b.classList.add('hidden');
    });
    document.querySelectorAll('.faq-item .faq-icon').forEach(function (ic) {
      ic.style.transform = 'rotate(0deg)';
    });
    if (!isOpen) {
      body.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    }
  };

  // --- 7. INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', function () {
    // Apply saved language
    window.setLang(currentLang, true);

    // Initialize calculator
    window.calcMega();

    // Scroll reveal animation observer
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal-up').forEach(function (el) {
        obs.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal-up').forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  });
})();
