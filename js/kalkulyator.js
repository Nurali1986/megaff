// ============================================================================
// MEGA FULFILMENT (megaff.uz) — LITR KALKULYATORI (kalkulyator.js)
// Supports 4 Categories (by volume in L) × 3 Quantity Tiers | 4 Languages
// ============================================================================

(function () {
  // 4 Volume Categories:
  // Cat 0 (1-toifa): 0 – 5 L
  // Cat 1 (2-toifa): 5 – 30 L
  // Cat 2 (3-toifa): 30 – 100 L
  // Cat 3 (4-toifa): 100 – 200 L
  const CAT_LIMITS = [
    { id: 1, max: 5, range: "0 – 5 l" },
    { id: 2, max: 30, range: "5 – 30 l" },
    { id: 3, max: 100, range: "30 – 100 l" },
    { id: 4, max: 200, range: "100 – 200 l" }
  ];

  // Base service (Asosiy xizmat: qabul qilish, saralash va 1 dona shtrix-kod):
  // Rows = Category (0..3), Cols = Tier (0: ≤10, 1: ≤100, 2: 100+)
  const BASE = [
    [1500, 1200, 1000],  // 1-toifa (0–5 L)
    [3000, 2500, 2000],  // 2-toifa (5–30 L)
    [6000, 5000, 4000],  // 3-toifa (30–100 L)
    [12000, 10000, 8000] // 4-toifa (100–200 L)
  ];

  // Extra selectable services (Qo'shimcha xizmatlar):
  const EXTRA = [
    {
      id: "barcode_extra",
      rates: [
        [400, 350, 300],
        [500, 400, 350],
        [600, 500, 400],
        [800, 700, 600]
      ],
      names: {
        uz: "Qõşimça ştrix-kod / markirovka",
        ru: "Доп. штрихкод / маркировка",
        en: "Extra barcode / labeling",
        zh: "附加条形码 / 贴标"
      },
      desc: {
        uz: "Çestniy Znak (Asl Belgisi), EAC yoki ikkinçi etiketka",
        ru: "Честный Знак, ЕАС или вторая термоэтикетка",
        en: "DataMatrix, EAC tag, or secondary thermal label",
        zh: "防伪溯源码、EAC标签或第二张热敏标"
      }
    },
    {
      id: "bopp_bag",
      rates: [
        [700, 600, 500],
        [1500, 1200, 1000],
        [3000, 2500, 2000],
        [5000, 4500, 4000]
      ],
      names: {
        uz: "BOPP paket (yopişqoq lentali)",
        ru: "БОПП пакет (с клеевым клапаном)",
        en: "BOPP self-adhesive bag",
        zh: "BOPP 自封透明包装袋"
      },
      desc: {
        uz: "Tiniq yopişqoq paketga soliş va qadoqlaş",
        ru: "Упаковка в прозрачный пакет с липким краем",
        en: "Clear protective BOPP polybag packaging",
        zh: "透明高质感自粘袋包装"
      }
    },
    {
      id: "ziplock",
      rates: [
        [1000, 800, 700],
        [2000, 1600, 1300],
        [3500, 3000, 2500],
        [6000, 5000, 4500]
      ],
      names: {
        uz: "Zip-lock paketga qadoqlaş",
        ru: "Упаковка в Zip-lock пакет",
        en: "Zip-lock slider bag packaging",
        zh: "Zip-lock 拉链袋包装"
      },
      desc: {
        uz: "Kiyim-keçak va tekstil uçun mustahkam zip-paket",
        ru: "Плотный пакет с бегунком для одежды и текстиля",
        en: "Heavy-duty frosted zipper bag for apparel",
        zh: "服装家纺专用加厚磨砂拉链袋"
      }
    },
    {
      id: "stretch",
      rates: [
        [600, 500, 400],
        [1200, 1000, 800],
        [2500, 2000, 1600],
        [4500, 3800, 3200]
      ],
      names: {
        uz: "Streç-plyonka bilan õraş",
        ru: "Обмотка стрейч-пленкой",
        en: "Stretch film wrapping",
        zh: "高强缠绕膜加固包裹"
      },
      desc: {
        uz: "Chang va namlikdan himoyalovçi streç qadoq",
        ru: "Защита от пыли, влаги и вскрытия при транспортировке",
        en: "Dust & moisture protection with stretch wrap",
        zh: "防尘防潮防拆缠绕膜包裹"
      }
    },
    {
      id: "bubble",
      rates: [
        [800, 700, 600],
        [1600, 1300, 1100],
        [3200, 2700, 2200],
        [6000, 5000, 4200]
      ],
      names: {
        uz: "Pufakçali plyonka (pupirka)",
        ru: "Воздушно-пузырчатая пленка (пупырка)",
        en: "Bubble wrap protection",
        zh: "防震气泡膜包裹"
      },
      desc: {
        uz: "Sinuvçan va nozik tovarlarni zarbadan himoyalaş",
        ru: "Амортизирующая защита для хрупких товаров и электроники",
        en: "Shock-absorbing wrap for fragile items & electronics",
        zh: "易碎品及电子产品防震保护"
      }
    },
    {
      id: "qc_check",
      rates: [
        [500, 400, 300],
        [900, 700, 600],
        [1800, 1500, 1200],
        [3500, 3000, 2500]
      ],
      names: {
        uz: "Brakni tekşiriş va komplektatsiya",
        ru: "Проверка на брак и комплектация",
        en: "QC inspection & kitting",
        zh: "次品排查质检与套装组装"
      },
      desc: {
        uz: "Vizual tekşiruv, ip kesimi va tõplam yiğış",
        ru: "Визуальный осмотр, обрезка ниток и сборка наборов",
        en: "100% defect check, thread trimming, and bundle assembly",
        zh: "100%外观质检、剪线头与组合包装"
      }
    }
  ];

  // Page-specific i18n dictionary extension
  const LC_I18N = {
    uz: {
      lc_meta_title: "Litr kalkulyatori — MegaFulfilment (megaff.uz)",
      lc_back: "Oddiy kalkulyatorga qaytiş",
      lc_tag: "LITR KALKULYATORI",
      lc_titleA: "Narxni tõliq şaklda",
      lc_titleB: "litrda hisoblaş",
      lc_lead: "Tovar õlçamini va sonini kiriting — narx darhol hisoblanadi. Asosiy xizmat (bir dona ştrix kod qiliş) va saralaş narxga avtomatik kiradi, qolgan xizmatlarni xohişingizga qarab qõşasiz. 10 donadan kam buyurtmada minimal summa — 20 000 sõm.",
      lc_h1t: "1. Õlçam",
      lc_h1d: "Uzunlik × kenglik × balandlik → 4 toifadan biri",
      lc_h2t: "2. Miqdor",
      lc_h2d: "10, 100 yoki 1000 tagaça — qança kõp bõlsa, şunça arzon",
      lc_h3t: "3. Qõşimça",
      lc_h3d: "Kerakli xizmatlarni tanlang",
      lc_s1t: "Tovar õlçami",
      lc_s1d: "Bitta dona tovarning qadoqdagi õlçami",
      lc_modeCm: "Santimetrda",
      lc_modeL: "Litrda",
      lc_len: "Uzunlik",
      lc_wid: "Kenglik",
      lc_hei: "Balandlik",
      lc_cm: "sm",
      lc_vol: "Hajm",
      lc_l: "litr",
      lc_lShort: "l",
      lc_big: "200 litrdan katta tovarlar uçun narx biz bilan alohida kelişiladi.",
      lc_s2t: "Mahsulot soni",
      lc_s2d: "Qança kõp bõlsa, bir dona uçun narx şunça arzon",
      lc_tierLbl: "Daraja",
      lc_calcLbl: "Hisoblangan narx",
      lc_s3t: "Qõşimça xizmatlar",
      lc_s3d: "Agar biror xizmat qõşmoqçi bõlsangiz, pastdagi xizmatlarni tanlang",
      lc_perItem: "1 dona uçun",
      lc_total: "Jami",
      lc_pcs: "dona",
      lc_note: "Narxlar maqul kelgan bõlsa, biz bilan boğlaning",
      lc_contact: "Biz bilan boğlaniş",
      lc_tableLink: "Narxlar jadvali",
      lc_ptTag: "NARXLAR JADVALI",
      lc_ptA: "Toifa bõyiça",
      lc_ptB: "1 dona narxi",
      lc_ptLead: "Narxlar sõmda, bitta dona uçun. Siz tanlagan toifa ustuni ajratib kõrsatilgan.",
      lc_tier1: "10 tagaça",
      lc_tier2: "100 tagaça",
      lc_tier3: "1000 tagaça",
      lc_ptSvc: "Xizmat",
      lc_cat_word: "-toifa",
      lc_base_svc: "Asosiy xizmat (saralaş + 1 dona ştrix-kod)",
      lc_min_note: "10 donadan kam buyurtmada minimal summa — 20 000 sõm qõllaniladi."
    },
    ru: {
      lc_meta_title: "Калькулятор в литрах — MegaFulfilment (megaff.uz)",
      lc_back: "Вернуться к обычному калькулятору",
      lc_tag: "КАЛЬКУЛЯТОР В ЛИТРАХ",
      lc_titleA: "Полный расчет стоимости",
      lc_titleB: "в литрах",
      lc_lead: "Введите габариты и количество товара — стоимость рассчитается мгновенно. Базовая услуга (сортировка и 1 штрихкод) входит автоматически, остальные опции вы выбираете по желанию. При заказе менее 10 шт. минимальная сумма — 20 000 сум.",
      lc_h1t: "1. Размер",
      lc_h1d: "Длина × ширина × высота → одна из 4 категорий",
      lc_h2t: "2. Количество",
      lc_h2d: "До 10, 100 или 1000 шт. — чем больше партия, тем дешевле",
      lc_h3t: "3. Дополнительно",
      lc_h3d: "Выберите нужные услуги упаковки",
      lc_s1t: "Габариты товара",
      lc_s1d: "Размер одной единицы товара в упаковке",
      lc_modeCm: "В сантиметрах",
      lc_modeL: "В литрах",
      lc_len: "Длина",
      lc_wid: "Ширина",
      lc_hei: "Высота",
      lc_cm: "см",
      lc_vol: "Объем",
      lc_l: "литр",
      lc_lShort: "л",
      lc_big: "Для товаров объемом свыше 200 литров цена согласовывается индивидуально.",
      lc_s2t: "Количество товара",
      lc_s2d: "Чем больше количество, тем ниже цена за 1 единицу",
      lc_tierLbl: "Уровень",
      lc_calcLbl: "Расчетная сумма",
      lc_s3t: "Дополнительные услуги",
      lc_s3d: "Отметьте дополнительные опции, если они необходимы для вашей партии",
      lc_perItem: "За 1 единицу",
      lc_total: "Итого",
      lc_pcs: "шт.",
      lc_note: "Если расчет вам подходит, свяжитесь с нами для оформления",
      lc_contact: "Связаться с нами",
      lc_tableLink: "Таблица тарифов",
      lc_ptTag: "ТАБЛИЦА ТАРИФОВ",
      lc_ptA: "Стоимость за 1 шт.",
      lc_ptB: "по категориям",
      lc_ptLead: "Цены указаны в сумах за 1 единицу. Столбец вашей текущей категории выделен цветом.",
      lc_tier1: "До 10 шт.",
      lc_tier2: "До 100 шт.",
      lc_tier3: "До 1000 шт.",
      lc_ptSvc: "Услуга",
      lc_cat_word: " категория",
      lc_base_svc: "Базовый сервис (сортировка + 1 штрихкод)",
      lc_min_note: "Для заказов менее 10 шт. действует минимальная сумма заказа — 20 000 сум."
    },
    en: {
      lc_meta_title: "Volume (Liter) Calculator — MegaFulfilment (megaff.uz)",
      lc_back: "Back to standard calculator",
      lc_tag: "LITER CALCULATOR",
      lc_titleA: "Full price calculation",
      lc_titleB: "in liters",
      lc_lead: "Enter product dimensions and quantity for an instant quote. Base service (sorting + 1 barcode label) is automatically included; add optional packaging services as needed. Minimum order total for under 10 items is 20,000 UZS.",
      lc_h1t: "1. Dimensions",
      lc_h1d: "Length × width × height → 1 of 4 volume categories",
      lc_h2t: "2. Quantity",
      lc_h2d: "Up to 10, 100, or 1000+ pcs — higher volume means lower unit rate",
      lc_h3t: "3. Add-ons",
      lc_h3d: "Select required packaging options",
      lc_s1t: "Item Dimensions",
      lc_s1d: "Packaged dimensions of a single item",
      lc_modeCm: "In centimeters",
      lc_modeL: "In liters",
      lc_len: "Length",
      lc_wid: "Width",
      lc_hei: "Height",
      lc_cm: "cm",
      lc_vol: "Volume",
      lc_l: "liter",
      lc_lShort: "L",
      lc_big: "For items exceeding 200 liters, pricing is arranged individually.",
      lc_s2t: "Product Quantity",
      lc_s2d: "The larger the batch, the lower the price per unit",
      lc_tierLbl: "Tier",
      lc_calcLbl: "Calculated price",
      lc_s3t: "Additional Services",
      lc_s3d: "Select any optional packaging or prep services below",
      lc_perItem: "Per 1 unit",
      lc_total: "Total",
      lc_pcs: "pcs",
      lc_note: "Happy with the estimate? Contact us to book your shipment",
      lc_contact: "Contact Us",
      lc_tableLink: "Price Table",
      lc_ptTag: "PRICE TABLE",
      lc_ptA: "Unit price",
      lc_ptB: "by category",
      lc_ptLead: "Prices in UZS per single unit. Your currently selected category column is highlighted.",
      lc_tier1: "Up to 10",
      lc_tier2: "Up to 100",
      lc_tier3: "Up to 1000",
      lc_ptSvc: "Service",
      lc_cat_word: " Category",
      lc_base_svc: "Base fulfillment (sorting + 1 barcode label)",
      lc_min_note: "For orders under 10 units, a minimum order fee of 20,000 UZS applies."
    },
    zh: {
      lc_meta_title: "按升（体积）费用计算器 — MegaFulfilment (megaff.uz)",
      lc_back: "返回标准计算器",
      lc_tag: "按升体积计算器",
      lc_titleA: "按体积（升）",
      lc_titleB: "完整核算代发费用",
      lc_lead: "输入单件商品尺寸和数量，系统立即计算价格。基础服务（分拣+粘贴1张条形码）已自动包含，其余包装耗材可按需勾选。少于 10 件的订单最低收费为 20,000 苏姆。",
      lc_h1t: "1. 商品尺寸",
      lc_h1d: "长 × 宽 × 高 → 自动匹配 4 大体积档位",
      lc_h2t: "2. 发货数量",
      lc_h2d: "10、100 或 1000 件以上 — 数量越多单价越低",
      lc_h3t: "3. 增值服务",
      lc_h3d: "按需勾选包装与质检服务",
      lc_s1t: "单件商品尺寸",
      lc_s1d: "单件商品包装后的外径尺寸",
      lc_modeCm: "按厘米 (cm)",
      lc_modeL: "按升 (L)",
      lc_len: "长度",
      lc_wid: "宽度",
      lc_hei: "高度",
      lc_cm: "厘米",
      lc_vol: "体积",
      lc_l: "升",
      lc_lShort: "升",
      lc_big: "超过 200 升的超大件商品请联系客服单独议价。",
      lc_s2t: "商品数量",
      lc_s2d: "批量越大，单件操作成本越优惠",
      lc_tierLbl: "数量档位",
      lc_calcLbl: "核算金额",
      lc_s3t: "可选附加服务",
      lc_s3d: "如需额外换包、防震保护或质检，请在下方勾选",
      lc_perItem: "单件成本",
      lc_total: "总计",
      lc_pcs: "件",
      lc_note: "如对预算满意，请立即联系我们预约入仓",
      lc_contact: "联系我们",
      lc_tableLink: "查看完整价目表",
      lc_ptTag: "完整价目表",
      lc_ptA: "各体积档位",
      lc_ptB: "单件收费标准",
      lc_ptLead: "以下价格均为单件商品收费（单位：苏姆），当前匹配的体积档位已高亮显示。",
      lc_tier1: "10件以内",
      lc_tier2: "100件以内",
      lc_tier3: "1000件以内",
      lc_ptSvc: "服务项目",
      lc_cat_word: "档",
      lc_base_svc: "基础代发服务（清点分拣 + 1张条码贴标）",
      lc_min_note: "少于 10 件的订单按最低起步价 20,000 苏姆计费。"
    }
  };

  // Merge LC_I18N into global MEGA_I18N
  if (window.MEGA_I18N) {
    ['uz', 'ru', 'en', 'zh'].forEach(function (lang) {
      if (window.MEGA_I18N[lang] && LC_I18N[lang]) {
        Object.assign(window.MEGA_I18N[lang], LC_I18N[lang]);
      }
    });
  }

  let currentMode = 'cm'; // 'cm' | 'l'
  let selectedExtras = new Set();
  let currentCatIdx = 0;  // 0..3
  let currentTierIdx = 1; // 0: ≤10, 1: ≤100, 2: 100+
  let ptTierIdx = 1;      // price table active tab

  function getLang() {
    return localStorage.getItem('mega_lang') || 'uz';
  }

  function getDict() {
    const l = getLang();
    return (window.MEGA_I18N && window.MEGA_I18N[l]) || LC_I18N.uz;
  }

  // Switch between CM and Liter mode
  window.setLcMode = function (mode) {
    currentMode = mode === 'l' ? 'l' : 'cm';
    const dimsCm = document.getElementById('dimsCm');
    const dimsL = document.getElementById('dimsL');
    if (dimsCm) dimsCm.classList.toggle('hidden', currentMode !== 'cm');
    if (dimsL) dimsL.classList.toggle('hidden', currentMode !== 'l');

    document.querySelectorAll('#modeSeg button').forEach(function (btn) {
      const active = btn.getAttribute('data-mode') === currentMode;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active) {
        btn.classList.add('bg-[#2563EB]', 'text-white', 'shadow-sm');
      } else {
        btn.classList.remove('bg-[#2563EB]', 'text-white', 'shadow-sm');
      }
    });

    window.recalcLc();
  };

  // Quantity controls
  window.stepLcQty = function (delta) {
    const inp = document.getElementById('lcQtyInput');
    if (!inp) return;
    let val = parseInt(inp.value, 10) || 1;
    val = Math.max(1, val + delta);
    inp.value = val;
    window.recalcLc();
  };

  window.setLcQty = function (qty) {
    const inp = document.getElementById('lcQtyInput');
    if (!inp) return;
    inp.value = Math.max(1, qty);
    window.recalcLc();
  };

  // Toggle extra service
  window.toggleLcExtra = function (id) {
    if (selectedExtras.has(id)) {
      selectedExtras.delete(id);
    } else {
      selectedExtras.add(id);
    }
    window.recalcLc();
  };

  // Price Table Tier Tab
  window.setPtTier = function (tierIdx) {
    ptTierIdx = tierIdx;
    const buttons = document.querySelectorAll('#ptTabs .pt-tab-btn');
    buttons.forEach(function (btn, idx) {
      const active = idx === ptTierIdx;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active) {
        btn.classList.add('bg-[#2563EB]', 'text-white', 'shadow-sm');
      } else {
        btn.classList.remove('bg-[#2563EB]', 'text-white', 'shadow-sm');
      }
    });
    renderPriceTable();
  };

  // Render 4-Category Visual Scale
  function renderCatScale() {
    const container = document.getElementById('catScale');
    if (!container) return;
    const dict = getDict();
    container.innerHTML = CAT_LIMITS.map(function (c, idx) {
      const isActive = idx === currentCatIdx;
      return (
        '<div class="p-3 rounded-xl border transition ' +
        (isActive
          ? 'border-[#2563EB] bg-[#E6F0FE] dark:bg-[#1C3158] shadow-sm'
          : 'border-[#DAE6F8] dark:border-[#233652] bg-white/60 dark:bg-[#0C1930]/60 opacity-75') +
        '">' +
        '<div class="flex items-center justify-between text-xs font-extrabold ' +
        (isActive ? 'text-[#2563EB]' : 'text-[#0B2345] dark:text-white') +
        '">' +
        '<span>' + c.id + dict.lc_cat_word + '</span>' +
        (isActive ? '<span class="w-2 h-2 rounded-full bg-[#2563EB]"></span>' : '') +
        '</div>' +
        '<div class="text-[11px] text-[#5B6D8A] dark:text-slate-400 font-semibold mt-0.5">' +
        c.range +
        '</div>' +
        '</div>'
      );
    }).join('');
  }

  // Render Step 3 Extra Services List
  function renderExtraList() {
    const container = document.getElementById('extraList');
    if (!container) return;
    const lang = getLang();
    const dict = getDict();
    const cur = dict.currency || "sõm";

    container.innerHTML = EXTRA.map(function (item) {
      const checked = selectedExtras.has(item.id);
      const price = item.rates[currentCatIdx][currentTierIdx];
      const title = item.names[lang] || item.names.uz;
      const desc = item.desc[lang] || item.desc.uz;

      return (
        '<label class="tier-card p-4 flex items-start gap-3.5 cursor-pointer select-none ' +
        (checked ? 'tier-active' : '') +
        '">' +
        '<input type="checkbox" ' +
        (checked ? 'checked' : '') +
        ' onchange="toggleLcExtra(\'' + item.id + '\')" class="mt-1 w-5 h-5 rounded-md border-[#C0D1EC] accent-[#2563EB] shrink-0 cursor-pointer">' +
        '<div class="flex-1 space-y-1">' +
        '<div class="flex items-center justify-between gap-2">' +
        '<span class="text-xs sm:text-sm font-bold text-[#0B2345] dark:text-white">' + title + '</span>' +
        '</div>' +
        '<div class="text-[11px] text-[#5B6D8A] dark:text-slate-400 leading-snug">' + desc + '</div>' +
        '<div class="text-xs font-extrabold text-[#2563EB] pt-0.5">+' + price.toLocaleString('ru-RU') + ' ' + cur + ' / ' + (dict.lc_pcs || 'dona') + '</div>' +
        '</div>' +
        '</label>'
      );
    }).join('');
  }

  // Render Price Table (#prices)
  function renderPriceTable() {
    const tbody = document.getElementById('ptBody');
    const thead = document.getElementById('ptHead');
    if (!tbody || !thead) return;
    const lang = getLang();
    const dict = getDict();
    const cur = dict.currency || "sõm";

    // Highlight active category column in header
    thead.querySelectorAll('[data-cat-col]').forEach(function (th) {
      const colCat = parseInt(th.getAttribute('data-cat-col'), 10) - 1;
      th.textContent = (colCat + 1) + dict.lc_cat_word + " (" + CAT_LIMITS[colCat].range + ")";
      if (colCat === currentCatIdx) {
        th.classList.add('bg-[#2563EB]/20', 'text-[#2563EB]');
      } else {
        th.classList.remove('bg-[#2563EB]/20', 'text-[#2563EB]');
      }
    });

    const rows = [];
    // Row 1: Base service
    rows.push({
      name: dict.lc_base_svc,
      isBase: true,
      vals: [0, 1, 2, 3].map(function (cIdx) {
        return BASE[cIdx][ptTierIdx];
      })
    });

    // Extra rows
    EXTRA.forEach(function (item) {
      rows.push({
        name: item.names[lang] || item.names.uz,
        isBase: false,
        vals: [0, 1, 2, 3].map(function (cIdx) {
          return item.rates[cIdx][ptTierIdx];
        })
      });
    });

    tbody.innerHTML = rows.map(function (r) {
      return (
        '<tr class="hover:bg-[#F2F7FF]/70 dark:hover:bg-[#152644] transition">' +
        '<td class="p-4 sm:p-5 font-bold text-[#0B2345] dark:text-white">' +
        r.name +
        (r.isBase ? ' <span class="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Avto</span>' : '') +
        '</td>' +
        r.vals.map(function (v, cIdx) {
          const isCurrentCat = cIdx === currentCatIdx;
          return (
            '<td class="p-4 sm:p-5 text-center font-extrabold ' +
            (isCurrentCat
              ? 'bg-[#2563EB]/10 text-[#2563EB]'
              : 'text-[#475A78] dark:text-slate-300') +
            '">' +
            v.toLocaleString('ru-RU') + ' ' + cur +
            '</td>'
          );
        }).join('') +
        '</tr>'
      );
    }).join('');
  }

  // Main Recalculation Function
  window.recalcLc = function () {
    const lang = getLang();
    const dict = getDict();
    const cur = dict.currency || "sõm";
    const pcs = dict.lc_pcs || "dona";

    // 1. Volume calculation
    let vol = 3;
    const dimL = document.getElementById('dimL');
    const dimW = document.getElementById('dimW');
    const dimH = document.getElementById('dimH');
    const dimLit = document.getElementById('dimLit');

    if (currentMode === 'cm') {
      const l = Math.max(0.1, parseFloat(dimL ? dimL.value : 20) || 0);
      const w = Math.max(0.1, parseFloat(dimW ? dimW.value : 15) || 0);
      const h = Math.max(0.1, parseFloat(dimH ? dimH.value : 10) || 0);
      vol = +((l * w * h) / 1000).toFixed(2);
      if (dimLit) dimLit.value = vol;
    } else {
      vol = Math.max(0.1, +(parseFloat(dimLit ? dimLit.value : 3) || 0).toFixed(2));
    }

    const volOut = document.getElementById('volOut');
    if (volOut) volOut.textContent = vol;

    // Determine Category (0..3)
    if (vol <= 5) currentCatIdx = 0;
    else if (vol <= 30) currentCatIdx = 1;
    else if (vol <= 100) currentCatIdx = 2;
    else currentCatIdx = 3;

    const bigNote = document.getElementById('bigNote');
    if (bigNote) bigNote.classList.toggle('hidden', vol <= 200);

    const catBadge = document.getElementById('catActiveBadge');
    if (catBadge) {
      catBadge.textContent = (currentCatIdx + 1) + dict.lc_cat_word + " (" + CAT_LIMITS[currentCatIdx].range + ")";
    }

    // 2. Quantity & Tier
    const qtyInp = document.getElementById('lcQtyInput');
    const qty = Math.max(1, parseInt(qtyInp ? qtyInp.value : 100, 10) || 1);

    if (qty <= 10) currentTierIdx = 0;
    else if (qty <= 100) currentTierIdx = 1;
    else currentTierIdx = 2;

    const tierNames = [dict.lc_tier1, dict.lc_tier2, dict.lc_tier3];
    const currentTierName = tierNames[currentTierIdx];

    // Highlight matching chip
    document.querySelectorAll('#lcChips .lc-chip').forEach(function (chip) {
      const chipQty = parseInt(chip.getAttribute('data-qty'), 10);
      if (chipQty === qty) {
        chip.classList.add('border-[#2563EB]', 'bg-[#2563EB]', 'text-white');
      } else {
        chip.classList.remove('border-[#2563EB]', 'bg-[#2563EB]', 'text-white');
      }
    });

    // 3. Base + Extras Unit Rate
    const baseUnitRate = BASE[currentCatIdx][currentTierIdx];
    let extraUnitRate = 0;
    const breakdownRows = [
      {
        label: dict.lc_base_svc,
        unit: baseUnitRate,
        total: baseUnitRate * qty
      }
    ];

    EXTRA.forEach(function (item) {
      if (selectedExtras.has(item.id)) {
        const r = item.rates[currentCatIdx][currentTierIdx];
        extraUnitRate += r;
        breakdownRows.push({
          label: item.names[lang] || item.names.uz,
          unit: r,
          total: r * qty
        });
      }
    });

    const perItemRate = baseUnitRate + extraUnitRate;
    let totalSum = perItemRate * qty;
    let minApplied = false;

    if (qty < 10 && totalSum < 20000) {
      totalSum = 20000;
      minApplied = true;
    }

    // Update UI Elements
    const tierOut = document.getElementById('tierOut');
    const inlineTotal = document.getElementById('inlineTotal');
    const minNote = document.getElementById('minNote');
    const lcCat = document.getElementById('lcCat');
    const lcTier = document.getElementById('lcTier');
    const lcPerItem = document.getElementById('lcPerItem');
    const lcCount = document.getElementById('lcCount');
    const lcTotal = document.getElementById('lcTotal');
    const lcBreakdown = document.getElementById('lcBreakdown');

    if (tierOut) tierOut.textContent = currentTierName;
    if (inlineTotal) inlineTotal.textContent = totalSum.toLocaleString('ru-RU') + " " + cur;
    if (minNote) {
      minNote.textContent = dict.lc_min_note;
      minNote.classList.toggle('hidden', !minApplied);
    }

    if (lcCat) lcCat.textContent = (currentCatIdx + 1) + dict.lc_cat_word;
    if (lcTier) lcTier.textContent = dict.lc_tierLbl + ": " + currentTierName;
    if (lcPerItem) lcPerItem.textContent = perItemRate.toLocaleString('ru-RU') + " " + cur;
    if (lcCount) lcCount.textContent = qty.toLocaleString('ru-RU');
    if (lcTotal) lcTotal.textContent = totalSum.toLocaleString('ru-RU');

    if (lcBreakdown) {
      lcBreakdown.innerHTML = breakdownRows.map(function (row) {
        return (
          '<div class="flex items-center justify-between gap-2 text-slate-300">' +
          '<span class="truncate">' + row.label + '</span>' +
          '<span class="font-bold text-white shrink-0">' + row.total.toLocaleString('ru-RU') + ' ' + cur + '</span>' +
          '</div>'
        );
      }).join('');
    }

    renderCatScale();
    renderExtraList();
    renderPriceTable();
  };

  // Hook into global language switcher so switching languages updates kalkulyator.html immediately
  const origSetLang = window.setLang;
  if (typeof origSetLang === 'function') {
    window.setLang = function (lang, silent) {
      origSetLang(lang, silent);
      window.recalcLc();
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.setLcMode('cm');
    window.setPtTier(1);
    window.recalcLc();
  });
})();
