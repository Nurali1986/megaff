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
  window.toggleTierCard = function (tier) {
    const chk = document.getElementById('tier-chk-' + tier);
    const box = document.getElementById('tier-box-' + tier);
    const card = document.getElementById('tier-card-' + tier);
    const input = document.getElementById('tier-qty-' + tier);
    if (!chk || !input) return;

    if (chk.checked) {
      if (box) box.classList.remove('hidden');
      if (card) card.classList.add('tier-active');
      if ((parseInt(input.value, 10) || 0) === 0) {
        input.value = tier === 't6' ? 5 : 100;
      }
    } else {
      if (box) box.classList.add('hidden');
      if (card) card.classList.remove('tier-active');
      input.value = 0;
    }

    // Show/hide optional add-ons panel if any tier is checked
    const anyChecked = ['t1', 't2', 't3', 't4', 't5', 't6'].some(function (k) {
      const c = document.getElementById('tier-chk-' + k);
      return c && c.checked;
    });
    const addonsPanel = document.getElementById('calc-addons-panel');
    if (addonsPanel) {
      if (anyChecked) addonsPanel.classList.remove('hidden');
      else addonsPanel.classList.add('hidden');
    }

    window.calcMega();
  };

  window.changeTierQty = function (tier, delta) {
    const input = document.getElementById('tier-qty-' + tier);
    const chk = document.getElementById('tier-chk-' + tier);
    const box = document.getElementById('tier-box-' + tier);
    const card = document.getElementById('tier-card-' + tier);
    if (!input) return;
    let val = parseInt(input.value, 10) || 0;
    val = Math.max(0, val + delta);
    input.value = val;
    if (chk) {
      chk.checked = val > 0;
      if (val > 0) {
        if (box) box.classList.remove('hidden');
        if (card) card.classList.add('tier-active');
      } else {
        if (box) box.classList.add('hidden');
        if (card) card.classList.remove('tier-active');
      }
    }
    window.calcMega();
  };

  window.setPresetQty = function (tier, qty) {
    ['t1', 't2', 't3', 't4', 't5', 't6'].forEach(function (k) {
      const inp = document.getElementById('tier-qty-' + k);
      const chk = document.getElementById('tier-chk-' + k);
      const box = document.getElementById('tier-box-' + k);
      const card = document.getElementById('tier-card-' + k);
      const active = k === tier && qty > 0;
      if (inp) inp.value = active ? qty : 0;
      if (chk) chk.checked = active;
      if (box) box.classList.toggle('hidden', !active);
      if (card) card.classList.toggle('tier-active', active);
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

  // --- 7. INTERACTIVE DOT BACKGROUND ---
  function initDotField() {
    const SPACING = 24;
    const RADIUS = 170;
    const PULL = 0.38;
    const DOT_SIZE = 0.9;

    const canvas = document.createElement('canvas');
    canvas.className = 'dot-field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const interactive = window.matchMedia('(hover: hover)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0, strength: 0, targetStrength: 0 };
    let width = 0;
    let height = 0;
    let dotColor = '';
    let linkColor = '';
    let frame = 0;

    function readColors() {
      const styles = getComputedStyle(document.documentElement);
      dotColor = styles.getPropertyValue('--dot-color').trim();
      linkColor = styles.getPropertyValue('--dot-link-color').trim();
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      // The grid scrolls with the page while the canvas itself stays fixed
      const offsetY = -(window.scrollY % SPACING);
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 2;
      const reach = mouse.strength > 0.01 ? RADIUS : 0;
      const near = new Map();

      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * SPACING + SPACING / 2;
          const y = row * SPACING + SPACING / 2 + offsetY;
          const dx = mouse.smoothX - x;
          const dy = mouse.smoothY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < reach) {
            const influence = 1 - dist / RADIUS;
            const pull = influence * influence * mouse.strength * PULL;
            near.set(row * cols + col, {
              row: row,
              col: col,
              x: x + dx * pull,
              y: y + dy * pull,
              influence: influence * mouse.strength
            });
          } else {
            ctx.moveTo(x + DOT_SIZE, y);
            ctx.arc(x, y, DOT_SIZE, 0, Math.PI * 2);
          }
        }
      }
      ctx.fill();

      if (near.size === 0) return;

      // Join each dot to its right, lower and diagonal neighbours
      ctx.strokeStyle = linkColor;
      ctx.lineWidth = 0.8;
      near.forEach(function (dot) {
        [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(function (step) {
          const other = near.get((dot.row + step[0]) * cols + dot.col + step[1]);
          if (!other || other.col !== dot.col + step[1]) return;
          ctx.globalAlpha = Math.min(dot.influence, other.influence) * 0.6;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        });
      });

      ctx.fillStyle = linkColor;
      near.forEach(function (dot) {
        ctx.globalAlpha = 0.35 + dot.influence * 0.65;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE + dot.influence * 1.3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function tick() {
      frame = 0;
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.18;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.18;
      mouse.strength += (mouse.targetStrength - mouse.strength) * 0.12;
      draw();

      const settled = Math.abs(mouse.x - mouse.smoothX) < 0.1 &&
        Math.abs(mouse.y - mouse.smoothY) < 0.1 &&
        Math.abs(mouse.targetStrength - mouse.strength) < 0.005;
      if (settled) {
        mouse.strength = mouse.targetStrength;
      } else {
        requestRedraw();
      }
    }

    function requestRedraw() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    readColors();
    resize();
    draw();

    window.addEventListener('scroll', requestRedraw, { passive: true });
    window.addEventListener('resize', function () {
      resize();
      requestRedraw();
    }, { passive: true });

    // Dark mode toggle changes the dot colors
    new MutationObserver(function () {
      readColors();
      requestRedraw();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (!interactive) return;

    window.addEventListener('mousemove', function (e) {
      if (mouse.strength < 0.01) {
        mouse.smoothX = e.clientX;
        mouse.smoothY = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.targetStrength = 1;
      requestRedraw();
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      mouse.targetStrength = 0;
      requestRedraw();
    });
  }

  // --- 8. CARD ANIMATIONS ---
  function initCardMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const CARD_SELECTOR = '.floating-card, .tier-card';
    const MAX_TILT = 6;

    // Staggered entrance. Floating hero cards keep their own loop animation.
    if ('IntersectionObserver' in window) {
      const enterObs = new IntersectionObserver(function (entries) {
        let order = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          enterObs.unobserve(card);
          card.style.setProperty('--card-order', order++);
          card.classList.remove('card-pending');
          card.classList.add('card-enter');
          card.addEventListener('animationend', function done(e) {
            if (e.target !== card) return;
            card.classList.remove('card-enter');
            card.removeEventListener('animationend', done);
          });
        });
      }, { threshold: 0.1 });

      document.querySelectorAll(CARD_SELECTOR).forEach(function (card) {
        if (card.classList.contains('animate-float')) return;
        card.classList.add('card-pending');
        enterObs.observe(card);
      });
    }

    if (!window.matchMedia('(hover: hover)').matches) return;

    // Cursor tilt and spotlight. Cards holding form fields stay flat so inputs don't move.
    let activeCard = null;
    let activeTilts = false;

    function resetCard(card) {
      card.style.removeProperty('--card-tilt-x');
      card.style.removeProperty('--card-tilt-y');
    }

    document.addEventListener('mousemove', function (e) {
      const card = e.target.closest ? e.target.closest(CARD_SELECTOR) : null;
      if (card !== activeCard) {
        if (activeCard) resetCard(activeCard);
        activeCard = card;
        activeTilts = !!card && !card.querySelector('input, select, textarea');
      }
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      card.style.setProperty('--card-glow-x', px + 'px');
      card.style.setProperty('--card-glow-y', py + 'px');

      if (activeTilts) {
        // Wide cards like FAQ rows tilt less, or their edges swing too far
        const tilt = MAX_TILT * Math.min(1, 380 / rect.width);
        card.style.setProperty('--card-tilt-x', ((0.5 - py / rect.height) * tilt).toFixed(2) + 'deg');
        card.style.setProperty('--card-tilt-y', ((px / rect.width - 0.5) * tilt).toFixed(2) + 'deg');
      }
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      if (activeCard) resetCard(activeCard);
      activeCard = null;
    });
  }

  // --- 9. INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', function () {
    // Apply saved language
    window.setLang(currentLang, true);

    // Initialize calculator
    window.calcMega();

    initDotField();
    initCardMotion();

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

    // Left Fixed Side Dot Navigation Scroll Spy (Baraka 1:1)
    const dotLinks = Array.from(document.querySelectorAll('[data-section-dot]'));
    if (dotLinks.length > 0) {
      const sectionIds = dotLinks.map(function (a) {
        return a.getAttribute('data-section-dot');
      });

      const updateActiveSideDot = function () {
        const triggerLine = window.innerHeight * 0.38;
        let activeId = sectionIds[0];

        for (let i = 0; i < sectionIds.length; i++) {
          const sec = document.getElementById(sectionIds[i]);
          if (!sec) continue;
          const rect = sec.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            activeId = sectionIds[i];
          }
        }

        // If scrolled to the very bottom of the page, highlight last section
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 40)) {
          activeId = sectionIds[sectionIds.length - 1];
        }

        dotLinks.forEach(function (link) {
          const id = link.getAttribute('data-section-dot');
          if (id === activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      };

      window.addEventListener('scroll', updateActiveSideDot, { passive: true });
      window.addEventListener('resize', updateActiveSideDot, { passive: true });
      updateActiveSideDot();
    }
  });
})();
