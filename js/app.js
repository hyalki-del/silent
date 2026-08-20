/**
 * ==========================================================================
 * SPENSE - Group Expense Tracker Main Controller
 * CS Senior Architecture: Robust Global Scope + Resilient Async Fetching
 * ==========================================================================
 */

console.log("%c[SPENSE] Engine & Controller Loaded Successfully.", "color: #059669; font-weight: bold;");

// --- Global Application State ---
let currentTab = null;
let currentPin = null;
let currentLang = 'en';
let currentCurrency = 'USD';
let currentTheme = 'Silk';
let ledgerData = { members: [], expenses: [] };

// Settings Modal Staging State
let selectedModalLang = 'en';
let selectedModalCurrency = 'USD';
let selectedModalTheme = 'Silk';

// Staging & Edit State Variables
let unsavedMembers = [];
let editingExpenseId = null;

// Config Cache
let cachedSheetUrl = null;

// Safe Internationalization Namespace Resolution
if (typeof window.TRANSLATIONS === 'undefined') {
    window.TRANSLATIONS = {
        en: {
            settingsBtn: "⚙ Settings", shareLinkBtn: "Share Link", deleteBtn: "Delete",
            participantsTitle: "Participants", participantsSub: "Add or remove people from this group.",
            namePlaceholder: "Name...", addBtn: "Add", saveMembersBtn: "Save Participants",
            newExpenseTitle: "New Expense", editExpenseTitle: "Edit Expense",
            newExpenseSub: "Log a transaction to split.", editExpenseSub: "Modify or delete this expense.",
            dateLabel: "Date", categoryLabel: "Category", descLabel: "Description", descPlaceholder: "e.g. Dinner",
            amountLabel: "Amount", paidByLabel: "Paid By", splitBetweenLabel: "Split Between:", selectAllBtn: "Select All", 
            recordExpenseBtn: "Record Expense", updateExpenseBtn: "Update Expense", cancelEditBtn: "Cancel", deleteExpenseBtn: "Delete Expense",
            settlementTitle: "Settlement Matrix", copySummaryBtn: "Copy Summary",
            historyTitle: "Ledger History", generateReportBtn: "Generate Report",
            modalSub: "Create or open a confidential group ledger.", tabCreate: "Create New", tabRecall: "Recall Existing",
            ledgerNameLabel: "Ledger Name", ledgerNamePh: "e.g. dinner-club", setPinLabel: "Set 4-Digit PIN", initializeBtn: "Initialize Ledger",
            selectArchiveLabel: "Select Archive", enterPinLabel: "Enter 4-Digit PIN", accessLedgerBtn: "Access Ledger",
            shareLinkHeader: "Share Ledger Link", shareLinkSub: "Anyone with this link will only need to enter PIN.", copyBtn: "Copy",
            taglines: [
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Spend simply.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Enjoy the moment. Leave tracking to SPENSE.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Just add what you spent.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Who paid? Who shares? SPENSE does the math.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Settle easily.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">See who owes whom — and how much.</span>`
            ]
        },
        tr: {
            settingsBtn: "⚙ Ayarlar", shareLinkBtn: "Bağlantıyı Paylaş", deleteBtn: "Sil",
            participantsTitle: "Katılımcılar", participantsSub: "Bu gruba kişi ekleyin veya çıkarın.",
            namePlaceholder: "İsim...", addBtn: "Ekle", saveMembersBtn: "Katılımcıları Kaydet",
            newExpenseTitle: "Yeni Harcama", editExpenseTitle: "Harcamayı Düzenle",
            newExpenseSub: "Bölüştürmek için işlem kaydedin.", editExpenseSub: "Bu harcamayı güncelleyin veya silin.",
            dateLabel: "Tarih", categoryLabel: "Kategori", descLabel: "Açıklama", descPlaceholder: "ör. Akşam Yemeği",
            amountLabel: "Tutar", paidByLabel: "Ödeyen", splitBetweenLabel: "Paylaşanlar:", selectAllBtn: "Tümünü Seç", 
            recordExpenseBtn: "Harcamayı Kaydet", updateExpenseBtn: "Harcamayı Güncelle", cancelEditBtn: "İptal", deleteExpenseBtn: "Harcamayı Sil",
            settlementTitle: "Ödeme Matrisi", copySummaryBtn: "Özeti Kopyala",
            historyTitle: "Geçmiş Kayıtlar", generateReportBtn: "Rapor Oluştur",
            modalSub: "Gizli bir grup defteri oluşturun veya açın.", tabCreate: "Yeni Oluştur", tabRecall: "Var Olanı Aç",
            ledgerNameLabel: "Defter Adı", ledgerNamePh: "ör. aksam-yemegi", setPinLabel: "4 Haneli PIN Belirleyin", initializeBtn: "Defteri Başlat",
            selectArchiveLabel: "Arşiv Seç", enterPinLabel: "4 Haneli PIN Girin", accessLedgerBtn: "Deftere Eriş",
            shareLinkHeader: "Defter Bağlantısını Paylaş", shareLinkSub: "Bu bağlantıya sahip herkes PIN girmelidir.", copyBtn: "Kopyala",
            taglines: [
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Kolayca harca.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Anın tadını çıkar. Takibi SPENSE'e bırak.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Sadece harcamanı ekle.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Kim ödedi? Kimler paylaşıyor? Matematik işini SPENSE yapar.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Rahatça hesabı kapat.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Kimin kime borcu var — anında gör.</span>`
            ]
        },
        de: {
            settingsBtn: "⚙ Einstellungen", shareLinkBtn: "Link Teilen", deleteBtn: "Löschen",
            participantsTitle: "Teilnehmer", participantsSub: "Personen hinzufügen oder entfernen.",
            namePlaceholder: "Name...", addBtn: "Hinzufügen", saveMembersBtn: "Teilnehmer Speichern",
            newExpenseTitle: "Neue Ausgabe", editExpenseTitle: "Ausgabe Bearbeiten",
            newExpenseSub: "Transaktion eintragen.", editExpenseSub: "Ändern oder löschen Sie diese Ausgabe.",
            dateLabel: "Datum", categoryLabel: "Kategorie", descLabel: "Beschreibung", descPlaceholder: "z.B. Abendessen",
            amountLabel: "Betrag", paidByLabel: "Bezahlt von", splitBetweenLabel: "Aufteilen:", selectAllBtn: "Alle", 
            recordExpenseBtn: "Speichern", updateExpenseBtn: "Aktualisieren", cancelEditBtn: "Abbrechen", deleteExpenseBtn: "Löschen",
            settlementTitle: "Abrechnungsmatrix", copySummaryBtn: "Kopieren",
            historyTitle: "Verlauf", generateReportBtn: "Bericht Erstellen",
            modalSub: "Gruppenbuch öffnen.", tabCreate: "Neu", tabRecall: "Öffnen",
            ledgerNameLabel: "Name", ledgerNamePh: "z.B. club", setPinLabel: "PIN", initializeBtn: "Starten",
            selectArchiveLabel: "Archiv Wählen", enterPinLabel: "PIN Eingeben", accessLedgerBtn: "Zugreifen",
            shareLinkHeader: "Teilen", shareLinkSub: "PIN erforderlich.", copyBtn: "Kopieren",
            taglines: [
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach ausgeben.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Genieße den Moment. Überlasse die Nachverfolgung SPENSE.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach eintragen.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Wer hat bezahlt? Wer teilt es? SPENSE macht die Rechnung.</span>`,
                `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach abrechnen.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Sehen Sie wer wem schuldet — und wie viel.</span>`
            ]
        }
    };
}
var TRANSLATIONS = window.TRANSLATIONS;

// --- CONFIG LOADER WITH CACHING ---
async function getConfig() {
    if (cachedSheetUrl) return cachedSheetUrl;
    try {
        const configRes = await fetch('config.json');
        if (!configRes.ok) throw new Error("config.json missing");
        const config = await configRes.json();
        cachedSheetUrl = config.sheetUrl || config.googleSheetApiUrl || config.apiUrl;
        return cachedSheetUrl;
    } catch (err) {
        console.warn("[SPENSE Config Notice]", err.message);
        return null;
    }
}

// --- DETERMINISTIC DATE NORMALIZATION HELPER ---
function formatToISODate(rawDate) {
    if (!rawDate) {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    if (rawDate instanceof Date) {
        if (isNaN(rawDate.getTime())) rawDate = new Date();
        return `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`;
    }
    const str = rawDate.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const dmyMatch = str.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);
    if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
}

function findMemberCanonical(targetName) {
    if (!targetName) return targetName;
    const match = ledgerData.members.find(m => m.toLowerCase() === targetName.toLowerCase());
    return match || targetName;
}

// --- BACKEND ROUTER ---
async function callBackend(action, payload = {}) {
    try {
        const sheetUrl = await getConfig();
        if (!sheetUrl) return { status: "error", message: "Missing config.json sheetUrl" };

        const response = await fetch(sheetUrl, {
            method: 'POST',
            body: JSON.stringify({ action, tab: currentTab, pin: currentPin, ...payload })
        });
        return await response.json();
    } catch (err) {
        console.error("Backend error:", err);
        return { status: "error", message: err.toString() };
    }
}

// --- ARCHIVE LOADER ---
async function loadGoogleSheetsArchive() {
    const select = document.getElementById('archiveSelect');
    if (!select) return;

    if (select.options.length <= 1) {
        select.innerHTML = `<option value="">-- Reading Google Sheets... --</option>`;
    }

    try {
        const sheetUrl = await getConfig();
        if (!sheetUrl) {
            select.innerHTML = `<option value="">-- Missing sheetUrl in config.json --</option>`;
            return;
        }

        const res = await fetch(sheetUrl);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        
        const rawData = await res.json();
        let ledgers = Array.isArray(rawData) ? rawData : (rawData.archives || rawData.sheets || []);

        ledgers = ledgers
            .filter(Boolean)
            .filter(name => name.toString().trim().toLowerCase() !== 'metadata' && name.toString().trim().toLowerCase() !== 'counter');

        if (ledgers.length === 0) {
            select.innerHTML = `<option value="">-- No archives found --</option>`;
            return;
        }

        select.innerHTML = `<option value="">-- Select a Ledger Tab --</option>` + 
            ledgers.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');

    } catch (error) {
        console.error("Archive fetch error:", error);
        select.innerHTML = `<option value="">-- Error loading archives --</option>`;
    }
}

// --- LEDGER CREATION & RECALL ---
function switchModalTab(tabMode) {
    const createSec = document.getElementById('createSection');
    const recallSec = document.getElementById('recallSection');
    const tabCreateBtn = document.getElementById('tabCreateBtn');
    const tabRecallBtn = document.getElementById('tabRecallBtn');

    if (!createSec || !recallSec) return;

    if (tabMode === 'create') {
        createSec.classList.remove('hidden');
        recallSec.classList.add('hidden');
        if (tabCreateBtn) tabCreateBtn.className = "flex-1 theme-btn py-2 text-xs font-black uppercase tracking-wider bg-amber-300 text-slate-900 rounded-xl cursor-pointer";
        if (tabRecallBtn) tabRecallBtn.className = "flex-1 theme-btn py-2 text-xs font-black uppercase tracking-wider bg-transparent text-slate-500 rounded-xl cursor-pointer";
    } else {
        createSec.classList.add('hidden');
        recallSec.classList.remove('hidden');
        if (tabRecallBtn) tabRecallBtn.className = "flex-1 theme-btn py-2 text-xs font-black uppercase tracking-wider bg-amber-300 text-slate-900 rounded-xl cursor-pointer";
        if (tabCreateBtn) tabCreateBtn.className = "flex-1 theme-btn py-2 text-xs font-black uppercase tracking-wider bg-transparent text-slate-500 rounded-xl cursor-pointer";
        
        loadGoogleSheetsArchive();
    }
}

async function createNewLedger() {
    const nameInput = document.getElementById('newLedgerName');
    const pinInput = document.getElementById('newLedgerPin');

    const nameVal = nameInput?.value.trim().toLowerCase().replace(/\s+/g, '-');
    const pinVal = pinInput?.value.trim();

    if (!nameVal || pinVal.length !== 4) {
        alert("Please enter a valid ledger name and a 4-digit PIN.");
        return;
    }

    const initialOrder = getCurrentCardOrder();
    const res = await callBackend('createLedger', { 
        name: nameVal, 
        pin: pinVal, 
        theme: currentTheme, 
        currency: currentCurrency, 
        language: currentLang,
        cardOrder: initialOrder 
    });

    if (res && res.status === "success") {
        currentTab = res.createdTab;
        currentPin = pinVal;
        ledgerData = { members: [], expenses: [] };
        unsavedMembers = [];
        document.getElementById('welcomeModal')?.classList.add('hidden');
        render();
    } else {
        alert("Failed to create ledger: " + (res?.message || "Unknown error"));
    }
}

async function recallLedger() {
    const archiveSelect = document.getElementById('archiveSelect');
    const pinInput = document.getElementById('recallLedgerPin');

    const targetLedger = archiveSelect?.value;
    const pinVal = pinInput?.value.trim();

    if (!targetLedger || pinVal.length !== 4) {
        alert("Please select a ledger and enter your 4-digit PIN.");
        return;
    }

    try {
        const sheetUrl = await getConfig();
        if (!sheetUrl) {
            alert("Missing configuration URL.");
            return;
        }

        const res = await fetch(`${sheetUrl}?tab=${encodeURIComponent(targetLedger)}&pin=${encodeURIComponent(pinVal)}`);
        const data = await res.json();

        if (data.status === "success") {
            currentTab = targetLedger;
            currentPin = pinVal;
            currentTheme = data.theme || "Silk";
            currentCurrency = data.currency || "USD";
            currentLang = data.language || "en";
            applyTheme(currentTheme);

            if (data.cardOrder) applyCardOrder(data.cardOrder);

            const rawMembers = Array.isArray(data.members) ? data.members : [];
            const cleanMembers = rawMembers
                .map(m => (m || '').toString().trim())
                .filter(m => m.length > 0 && m.toLowerCase() !== 'members');

            ledgerData.members = cleanMembers;
            ledgerData.expenses = data.expenses || [];

            document.getElementById('welcomeModal')?.classList.add('hidden');
            render();
        } else {
            alert("Authentication failed: " + (data.message || "Invalid PIN"));
        }
    } catch (err) {
        console.error("Recall error:", err);
        alert("Failed to connect to backend ledger archive.");
    }
}

// --- LANGUAGE SWITCHING & TAGLINE CAROUSEL ---
let taglineTimer = null;
let currentTaglineIndex = 0;

function switchLanguage(lang) {
    currentLang = lang;
    render();
    initTaglineCarousel();
}

function initTaglineCarousel() {
    const spot = document.getElementById('taglineSpot');
    if (!spot) return;

    if (taglineTimer) clearInterval(taglineTimer);

    const motionClasses = ['motion-left', 'motion-right', 'motion-top', 'motion-bottom'];

    function cycleTagline() {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
        const activeTaglines = t.taglines;

        spot.className = "w-full text-center leading-snug";
        void spot.offsetWidth;

        spot.innerHTML = activeTaglines[currentTaglineIndex % activeTaglines.length];
        spot.className = "w-full text-center leading-snug " + motionClasses[Math.floor(Math.random() * motionClasses.length)];

        currentTaglineIndex++;
    }

    cycleTagline();
    taglineTimer = setInterval(cycleTagline, 3200);
}

// --- MASTER UI RENDERING ENGINE ---
function render() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (t[k]) el.innerText = t[k];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const k = el.getAttribute('data-i18n-ph');
        if (t[k]) el.placeholder = t[k];
    });

    // Update Welcome Modal Language Toggle Styles
    ['tr', 'en', 'de'].forEach(l => {
        const btn = document.getElementById(`btnLang${l.toUpperCase()}`);
        if (btn) {
            if (l === currentLang) {
                btn.className = "text-amber-600 font-black cursor-pointer transition px-1 underline";
            } else {
                btn.className = "hover:text-amber-600 cursor-pointer transition px-1 opacity-70";
            }
        }
    });

    const symbolEl = document.getElementById('currencySymbol');
    if (symbolEl) symbolEl.innerText = getCurrencySymbol();

    const indicatorEl = document.getElementById('viewModeIndicator');
    if (indicatorEl) {
        indicatorEl.innerHTML = currentTab ? 
            `<span class="text-sm font-medium uppercase tracking-wider opacity-70">Active ledger:</span><span class="text-2xl sm:text-4xl font-extrabold break-words leading-tight mt-0.5 block">${currentTab.toUpperCase()}</span>` :
            `<span class="text-sm font-medium uppercase tracking-wider opacity-70">Active ledger:</span><span class="text-2xl sm:text-4xl font-extrabold break-words leading-tight mt-0.5 block">AWAITING AUTHENTICATION...</span>`;
    }

    ['btnDeleteLedger', 'btnOpenShare', 'btnOpenSettings'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', !currentTab);
    });

    renderMembers();
    renderExpenseFormHeader();
    renderDropdowns();
    renderSplitCheckboxes();
    renderHistory();
    renderSettlement();
}

// --- AUXILIARY UI RENDERERS & UTILITIES ---
function renderMembers() {
    const container = document.getElementById('memberList');
    if (!container) return;
    container.innerHTML = ledgerData.members.length > 0 
        ? ledgerData.members.map(m => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200 text-slate-800 font-bold">
                ${escapeHTML(m)}
                <button type="button" data-member="${escapeHTML(m)}" onclick="window.deleteMember(this.getAttribute('data-member'), event)" class="text-rose-600 font-black text-xs ml-1 cursor-pointer">×</button>
            </span>
        `).join('') 
        : '<span class="opacity-60 italic">No participants yet.</span>';
}

function renderExpenseFormHeader() {
    const titleEl = document.getElementById('expenseFormTitle');
    const subEl = document.getElementById('expenseFormSub');
    if (!titleEl || !subEl) return;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    titleEl.innerText = editingExpenseId ? t.editExpenseTitle : t.newExpenseTitle;
    subEl.innerText = editingExpenseId ? t.editExpenseSub : t.newExpenseSub;
}

function renderDropdowns() {
    const catSelect = document.getElementById('expenseCategory');
    const paidSelect = document.getElementById('expensePaidBy');
    if (!catSelect || !paidSelect) return;

    catSelect.innerHTML = ["Food & Drink", "Transport", "Accommodation", "Shopping", "Entertainment", "Other"].map(c => `<option value="${c}">${c}</option>`).join('');
    paidSelect.innerHTML = ledgerData.members.length > 0 
        ? ledgerData.members.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('')
        : '<option value="">No participants</option>';
}

function renderSplitCheckboxes() {
    const container = document.getElementById('splitCheckboxes');
    if (!container) return;
    container.innerHTML = ledgerData.members.length > 0
        ? ledgerData.members.map(m => `
            <label class="flex items-center gap-1.5 cursor-pointer bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-300 font-semibold">
                <input type="checkbox" value="${escapeHTML(m)}" checked class="split-checkbox accent-slate-900 cursor-pointer"> ${escapeHTML(m)}
            </label>
        `).join('')
        : '<span class="opacity-60 italic">Add participants first.</span>';
}

function renderHistory() {
    const list = document.getElementById('expenseHistory');
    if (!list) return;

    list.innerHTML = ledgerData.expenses.length > 0
        ? ledgerData.expenses.map(e => `
            <li class="p-2.5 rounded-xl border border-current/15 flex justify-between items-center bg-current/5 gap-2">
                <div class="flex-1 min-w-0">
                    <span class="font-bold truncate block">${escapeHTML(e.desc)} (${escapeHTML(e.category)})</span>
                    <div class="text-[10px] opacity-70">Paid by <span class="font-bold">${escapeHTML(findMemberCanonical(e.paidBy))}</span></div>
                </div>
                <span class="font-extrabold text-sm">${getCurrencySymbol()}${parseFloat(e.amount).toFixed(2)}</span>
            </li>
        `).join('')
        : '<li class="opacity-60 italic text-center py-4">No expenses recorded yet.</li>';
}

function renderSettlement() {
    const container = document.getElementById('settlementList');
    if (!container) return;
    const txs = calculateSettlement();
    container.innerHTML = txs.length > 0 
        ? txs.map(t => `<div class="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-bold">${escapeHTML(t)}</div>`).join('')
        : '<p class="font-bold text-center py-2 text-emerald-600">All balances are currently settled!</p>';
}

function calculateSettlement() {
    const balances = {};
    ledgerData.members.forEach(m => balances[m.toLowerCase()] = 0);

    ledgerData.expenses.forEach(e => {
        const amt = parseFloat(e.amount) || 0;
        const splits = (Array.isArray(e.splitWith) ? e.splitWith : []).map(s => s.toLowerCase());
        if (splits.length === 0) return;
        const share = amt / splits.length;
        if (balances[e.paidBy.toLowerCase()] !== undefined) balances[e.paidBy.toLowerCase()] += amt;
        splits.forEach(s => { if (balances[s] !== undefined) balances[s] -= share; });
    });

    const debtors = [], creditors = [];
    Object.keys(balances).forEach(k => {
        const name = findMemberCanonical(k);
        if (balances[k] < -0.01) debtors.push({ member: name, amount: -balances[k] });
        else if (balances[k] > 0.01) creditors.push({ member: name, amount: balances[k] });
    });

    const txs = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const minAmt = Math.min(debtors[i].amount, creditors[j].amount);
        txs.push(`${debtors[i].member} owes ${creditors[j].member} ${getCurrencySymbol()}${minAmt.toFixed(2)}`);
        debtors[i].amount -= minAmt;
        creditors[j].amount -= minAmt;
        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }
    return txs;
}

function getCurrencySymbol() {
    return currentCurrency === 'EUR' ? '€' : currentCurrency === 'TRY' ? '₺' : '$';
}

function applyTheme(themeName) {
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName.toLowerCase());
}

function getCurrentCardOrder() {
    const container = document.getElementById('appContainer');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.theme-card')).map(c => c.getAttribute('data-card-id')).filter(Boolean);
}

function applyCardOrder(orderArray) {
    if (!Array.isArray(orderArray)) return;
    const container = document.getElementById('appContainer');
    if (!container) return;
    orderArray.forEach(id => {
        const card = container.querySelector(`[data-card-id="${id}"]`);
        if (card) container.appendChild(card);
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function goHome() {
    currentTab = null;
    currentPin = null;
    document.getElementById('welcomeModal')?.classList.remove('hidden');
    render();
}

// --- EXPORT TO GLOBAL WINDOW OBJECT ---
window.switchModalTab = switchModalTab;
window.createNewLedger = createNewLedger;
window.recallLedger = recallLedger;
window.switchLanguage = switchLanguage;
window.goHome = goHome;

// --- INITIALIZE SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    initTaglineCarousel();
    render();
});
