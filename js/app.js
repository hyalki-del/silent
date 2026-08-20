/**
 * ==========================================================================
 * SPENSE - Master Web Controller
 * ==========================================================================
 */

console.log("%c[SPENSE] Master Controller Initialized.", "color: #059669; font-weight: bold;");

// Global Application State
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

let unsavedMembers = [];
let editingExpenseId = null;

// Safe Translation Resolver
function getTranslations() {
    return (window.TRANSLATIONS && window.TRANSLATIONS[currentLang]) 
        ? window.TRANSLATIONS[currentLang] 
        : (window.TRANSLATIONS && window.TRANSLATIONS['en']) 
            ? window.TRANSLATIONS['en'] 
            : {};
}

// Config Loader
async function getConfig() {
    try {
        const configRes = await fetch('config.json');
        if (!configRes.ok) throw new Error("config.json missing");
        const config = await configRes.json();
        return config.sheetUrl || config.googleSheetApiUrl || config.apiUrl;
    } catch (err) {
        console.warn("[SPENSE Config Notice]", err.message);
        return null;
    }
}

// Backend API Router
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

// Date Normalizer
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

// 4-Directional Random Tagline Animation Engine
let taglineTimer = null;
let currentTaglineIndex = 0;

function initTaglineCarousel() {
    const spot = document.getElementById('taglineSpot');
    if (!spot) return;

    if (taglineTimer) clearInterval(taglineTimer);

    const motionClasses = ['motion-left', 'motion-right', 'motion-top', 'motion-bottom'];

    function cycleTagline() {
        const t = getTranslations();
        const activeTaglines = t.taglines || [];

        if (activeTaglines.length === 0) return;

        // Force synchronous DOM reflow to re-trigger CSS keyframe animations
        spot.className = "w-full text-center leading-snug";
        void spot.offsetWidth;

        spot.innerHTML = activeTaglines[currentTaglineIndex % activeTaglines.length];

        const randomMotion = motionClasses[Math.floor(Math.random() * motionClasses.length)];
        spot.className = "w-full text-center leading-snug " + randomMotion;

        currentTaglineIndex++;
    }

    cycleTagline();
    taglineTimer = setInterval(cycleTagline, 3200);
}

function switchLanguage(lang) {
    currentLang = lang;
    render();
    initTaglineCarousel();
}

// Settings Modal Management
function selectSettingsLang(lang) {
    selectedModalLang = lang;
    ['tr', 'en', 'de'].forEach(l => {
        const btn = document.getElementById(`setLang${l.toUpperCase()}`);
        if (btn) {
            btn.className = (l === lang)
                ? "theme-btn py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-xl transition cursor-pointer option-btn-selected"
                : "theme-btn py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold border-2 border-slate-200 rounded-xl hover:border-slate-400 bg-slate-50 transition cursor-pointer opacity-50";
        }
    });
}

function selectSettingsCurrency(curr) {
    selectedModalCurrency = curr;
    ['USD', 'EUR', 'TRY'].forEach(c => {
        const btn = document.getElementById(`setCurr${c}`);
        if (btn) {
            btn.className = (c === curr)
                ? "theme-btn py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer option-btn-selected"
                : "theme-btn py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-extrabold border-2 border-slate-200 rounded-xl hover:border-slate-400 bg-slate-50 transition cursor-pointer opacity-50";
        }
    });
}

function selectSettingsTheme(theme) {
    selectedModalTheme = theme;
    const themeStyles = { Silk: 'bg-slate-50 text-slate-900', Toon: 'bg-amber-100 text-slate-900', Neon: 'bg-slate-950 text-cyan-400' };

    ['Silk', 'Toon', 'Neon'].forEach(t => {
        const btn = document.getElementById(`setTheme${t}`);
        if (btn) {
            const baseBg = themeStyles[t] || 'bg-slate-50';
            btn.className = (t === theme)
                ? `theme-btn py-3 px-2 ${baseBg} rounded-xl text-center transition cursor-pointer option-btn-selected`
                : `theme-btn py-3 px-2 border-2 border-slate-200 ${baseBg} rounded-xl text-center transition cursor-pointer opacity-50`;
        }
    });
}

function openSettingsModal() { 
    selectedModalLang = currentLang;
    selectedModalCurrency = currentCurrency;
    selectedModalTheme = currentTheme;

    selectSettingsLang(selectedModalLang);
    selectSettingsCurrency(selectedModalCurrency);
    selectSettingsTheme(selectedModalTheme);

    document.getElementById('settingsModal')?.classList.remove('hidden'); 
}

function closeSettingsModal() { 
    document.getElementById('settingsModal')?.classList.add('hidden'); 
}

async function saveSettings() {
    currentLang = selectedModalLang;
    currentCurrency = selectedModalCurrency;
    applyTheme(selectedModalTheme);

    document.getElementById('settingsModal')?.classList.add('hidden');
    render();
    initTaglineCarousel();

    if (currentTab) {
        await callBackend('updateSettings', { language: currentLang, currency: currentCurrency, theme: currentTheme });
    }
}

// Participant Management
async function addMemberDirect() {
    const input = document.getElementById('memberName');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;

    if (!currentTab) { 
        alert("Please create or open a ledger first."); 
        return; 
    }

    if (ledgerData.members.some(m => m.toLowerCase() === name.toLowerCase())) { 
        alert("Participant already exists."); 
        input.value = ''; 
        return; 
    }

    ledgerData.members.push(name);
    if (!unsavedMembers.includes(name)) unsavedMembers.push(name);
    input.value = '';
    render();

    const res = await callBackend('addMembers', { names: [name] });
    if (res && res.status === "success") {
        unsavedMembers = unsavedMembers.filter(m => m !== name);
        render();
    }
}

async function deleteMember(name, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    if (!name) return;

    const canonicalName = findMemberCanonical(name);
    if (!confirm(`Are you sure you want to remove participant '${canonicalName}'?`)) return;

    const targetLower = canonicalName.toLowerCase();
    ledgerData.members = ledgerData.members.filter(m => m.toLowerCase() !== targetLower);
    unsavedMembers = unsavedMembers.filter(m => m.toLowerCase() !== targetLower);

    render();
    await callBackend('removeMember', { name: canonicalName });
}

// Welcome Modal Tab Routing
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

async function loadGoogleSheetsArchive() {
    const select = document.getElementById('archiveSelect');
    if (!select) return;

    select.innerHTML = `<option value="">-- Reading Google Sheets... --</option>`;

    try {
        const sheetUrl = await getConfig();
        if (!sheetUrl) {
            select.innerHTML = `<option value="">-- Missing config.json --</option>`;
            return;
        }

        const res = await fetch(sheetUrl);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        
        const rawData = await res.json();
        let ledgers = Array.isArray(rawData) ? rawData : (rawData.archives || rawData.sheets || []);

        ledgers = ledgers.filter(Boolean).filter(name => {
            const lower = name.toString().trim().toLowerCase();
            return lower !== 'metadata' && lower !== 'counter';
        });

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

async function createNewLedger() {
    const nameInput = document.getElementById('newLedgerName');
    const pinInput = document.getElementById('newLedgerPin');

    const nameVal = nameInput?.value.trim().toLowerCase().replace(/\s+/g, '-');
    const pinVal = pinInput?.value.trim();

    if (!nameVal || pinVal.length !== 4) {
        alert("Please enter a valid ledger name and a 4-digit PIN.");
        return;
    }

    const res = await callBackend('createLedger', { 
        name: nameVal, 
        pin: pinVal, 
        theme: currentTheme, 
        currency: currentCurrency, 
        language: currentLang,
        cardOrder: ["header", "participants", "expense", "settlement", "history"] 
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

            const rawMembers = Array.isArray(data.members) ? data.members : [];
            ledgerData.members = rawMembers.map(m => (m || '').toString().trim()).filter(m => m.length > 0 && m.toLowerCase() !== 'members');
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

// Expense Management
async function addExpense() {
    const rawDate = document.getElementById('expenseDate')?.value;
    const date = formatToISODate(rawDate);
    const desc = document.getElementById('expenseDesc')?.value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount')?.value);
    const rawPaidBy = document.getElementById('expensePaidBy')?.value;
    const paidBy = findMemberCanonical(rawPaidBy);

    if (!date || !desc || isNaN(amount) || amount <= 0 || !paidBy) {
        alert("Fill all expense fields correctly.");
        return;
    }

    const checkboxes = document.querySelectorAll('.split-checkbox:checked');
    const splitWith = Array.from(checkboxes).map(cb => findMemberCanonical(cb.value));

    if (splitWith.length === 0) {
        alert("Select at least one participant to split with.");
        return;
    }

    const category = document.getElementById('expenseCategory')?.value || "General";
    const id = Date.now().toString();

    ledgerData.expenses.push({ id, date, category, desc, amount, paidBy, splitWith });
    resetExpenseForm();
    render();

    await callBackend('addExpense', { id, date, category, desc, amount, paidBy, splitWith });
}

function resetExpenseForm() {
    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    if (descInput) descInput.value = '';
    if (amountInput) amountInput.value = '';
    
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = formatToISODate(new Date());

    document.querySelectorAll('.split-checkbox').forEach(cb => cb.checked = true);
}

// Settlement Matrix Calculation
function calculateSettlement() {
    const balances = {};
    const lowerMap = {};

    ledgerData.members.forEach(m => {
        const lower = m.toLowerCase();
        balances[lower] = 0;
        lowerMap[lower] = m;
    });

    ledgerData.expenses.forEach(e => {
        const amt = parseFloat(e.amount) || 0;
        const splits = (Array.isArray(e.splitWith) ? e.splitWith : []).map(s => s.toLowerCase());

        if (splits.length === 0) return;
        const share = amt / splits.length;
        const payerKey = (e.paidBy || '').toLowerCase();

        if (balances[payerKey] !== undefined) balances[payerKey] += amt;
        splits.forEach(s => { if (balances[s] !== undefined) balances[s] -= share; });
    });

    const debtors = [], creditors = [];
    Object.keys(balances).forEach(k => {
        const bal = balances[k];
        const name = lowerMap[k] || k;
        if (bal < -0.01) debtors.push({ member: name, amount: -bal });
        else if (bal > 0.01) creditors.push({ member: name, amount: bal });
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

function copySettlementSummary() {
    const txs = calculateSettlement();
    if (txs.length === 0) { alert("No settlement balances to copy."); return; }

    const summaryText = `=== SPENSE SETTLEMENT MATRIX ===\nLedger: ${currentTab || 'General'}\nDate: ${new Date().toLocaleDateString()}\n--------------------------------\n` + 
        txs.join('\n') + `\n================================`;

    navigator.clipboard.writeText(summaryText).then(() => alert("Settlement summary copied!"))
        .catch(() => alert("Summary:\n\n" + summaryText));
}

// Master UI Rendering Engine
function render() {
    const t = getTranslations();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (t[k]) el.innerText = t[k];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const k = el.getAttribute('data-i18n-ph');
        if (t[k]) el.placeholder = t[k];
    });

    ['tr', 'en', 'de'].forEach(l => {
        const btn = document.getElementById(`btnLang${l.toUpperCase()}`);
        if (btn) {
            btn.className = (l === currentLang)
                ? "text-amber-600 font-black cursor-pointer transition px-1 underline"
                : "hover:text-amber-600 cursor-pointer transition px-1 opacity-70";
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

    ['btnDeleteLedger', 'btnOpenShare', 'btnOpenSettings', 'settingsBtn', 'shareBtn', 'deleteLedgerBtn'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', !currentTab);
    });

    renderMembers();
    renderExpenseFormHeader();
    renderDropdowns();
    renderSplitCheckboxes();
    renderHistory();
    renderSettlement();
}

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
    const t = getTranslations();
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

function getCurrencySymbol() { return currentCurrency === 'EUR' ? '€' : currentCurrency === 'TRY' ? '₺' : '$'; }

function applyTheme(themeName) {
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName.toLowerCase());
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
    initTaglineCarousel();
}

function openShareModal() {
    document.getElementById('shareModal')?.classList.remove('hidden');
    const input = document.getElementById('shareLinkInput');
    if (input && currentTab) input.value = `${window.location.origin}${window.location.pathname}?ledger=${encodeURIComponent(currentTab)}`;
}
function closeShareModal() { document.getElementById('shareModal')?.classList.add('hidden'); }
function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    if (input) { input.select(); navigator.clipboard.writeText(input.value); alert("Copied share link!"); }
}

async function deleteActiveLedger() {
    if (!confirm("Delete active ledger?")) return;
    await callBackend('deleteLedger');
    goHome();
}

function selectAllSplits() {
    document.querySelectorAll('.split-checkbox').forEach(cb => cb.checked = true);
}

// Global Window Function Attachments
window.switchModalTab = switchModalTab;
window.createNewLedger = createNewLedger;
window.recallLedger = recallLedger;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.selectSettingsLang = selectSettingsLang;
window.selectSettingsCurrency = selectSettingsCurrency;
window.selectSettingsTheme = selectSettingsTheme;
window.saveSettings = saveSettings;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.copyShareLink = copyShareLink;
window.goHome = goHome;
window.deleteActiveLedger = deleteActiveLedger;
window.addMemberDirect = addMemberDirect;
window.deleteMember = deleteMember;
window.addExpense = addExpense;
window.copySettlementSummary = copySettlementSummary;
window.switchLanguage = switchLanguage;
window.selectAllSplits = selectAllSplits;

// System Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTaglineCarousel();
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = formatToISODate(new Date());

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ledger')) switchModalTab('recall');

    render();
});
