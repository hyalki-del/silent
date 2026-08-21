/**
 * ==========================================================================
 * SPENSE - Group Expense Tracker Main Controller
 * ==========================================================================
 */

console.log("%c[SPENSE] Engine Loaded.", "color: #059669; font-weight: bold;");

// --- Application State ---
let currentTab = null;
let currentPin = null;
let currentLang = 'en';
let currentCurrency = 'USD';
let currentTheme = 'Silk';
let ledgerData = { members: [], expenses: [] };

// Staging & Modal States
let selectedModalLang = 'en';
let selectedModalCurrency = 'USD';
let selectedModalTheme = 'Silk';
let unsavedMembers = [];
let editingExpenseId = null;

// Async Background Prefetching Flags
let isArchiveLoaded = false;
let isArchiveLoading = false;

// --- Multilingual Dictionary ---
var TRANSLATIONS = {
    en: {
        activeLedgerLabel: "Active ledger:",
        awaitingAuthLabel: "AWAITING AUTHENTICATION...",
        settingsBtn: "⚙ Settings", shareLinkBtn: "Share Link", deleteBtn: "Delete",
        participantsTitle: "Participants", participantsSub: "Add or remove people from this group.",
        namePlaceholder: "Name...", addBtn: "Add", noParticipantsYet: "No participants yet.",
        newExpenseTitle: "New Expense", editExpenseTitle: "Edit Expense",
        newExpenseSub: "Log a transaction to split.", editExpenseSub: "Modify or delete this expense.",
        dateLabel: "Date", categoryLabel: "Category", descLabel: "Description", descPlaceholder: "e.g. Dinner",
        amountLabel: "Amount", paidByLabel: "Paid By", splitBetweenLabel: "Split Between:", selectAllBtn: "Select All", 
        recordExpenseBtn: "Record Expense", updateExpenseBtn: "Update Expense", cancelEditBtn: "Cancel", deleteExpenseBtn: "Delete Expense",
        noParticipantsSelect: "No participants available", addParticipantsFirst: "Add participants first.",
        settlementTitle: "Settlement Matrix", copySummaryBtn: "Copy Summary",
        historyTitle: "Ledger History", clickToEditSub: "(Click item to edit)", generateReportBtn: "Generate Report",
        historyPaidBy: "Paid by", historySplit: "Split", editBtn: "Edit", noExpensesRecorded: "No expenses recorded yet.",
        settlementPlaceholder: "Settlement matrix will appear once expenses are added.", allBalancesSettled: "All balances are currently settled!",
        settlementTpl: "{debtor} owes {creditor} {amount}",
        modalSub: "Create or open a confidential group ledger.", tabCreate: "Create New", tabRecall: "Recall Existing",
        ledgerNameLabel: "Ledger Name", ledgerNamePh: "e.g. dinner-club", setPinLabel: "Set 4-Digit PIN", initializeBtn: "Initialize Ledger",
        selectArchiveLabel: "Select Archive", enterPinLabel: "Enter 4-Digit PIN", accessLedgerBtn: "Access Ledger",
        shareLinkHeader: "Share Ledger Link", shareLinkSub: "Anyone with this link will only need to enter PIN.", copyBtn: "Copy",
        ledgerSettingsHeader: "Ledger Settings", languageSettingLabel: "Language", currencySettingLabel: "Currency", themeSettingLabel: "Visual Template", saveSettingsBtn: "Save Settings",
        categories: {
            "Food & Drink": "Food & Drink",
            "Transport": "Transport",
            "Accommodation": "Accommodation",
            "Shopping": "Shopping",
            "Entertainment": "Entertainment",
            "Other": "Other"
        },
        alertValidLedgerPin: "Please enter a valid ledger name and a 4-digit PIN.",
        alertSelectLedgerPin: "Please select a ledger and enter your 4-digit PIN.",
        alertAccessLedgerFirst: "Access or initialize a ledger first.",
        alertParticipantExists: "Participant already exists.",
        confirmRemoveParticipant: "Are you sure you want to remove participant",
        alertFillFields: "Please fill out all expense fields properly.",
        alertSelectSplitParticipant: "Select at least one participant to split with.",
        confirmDeleteExpense: "Are you sure you want to delete this expense entry?",
        confirmDeleteLedger: "Delete active ledger?",
        noBalancesToCopy: "No settlement balances to copy.",
        summaryCopied: "Settlement summary copied to clipboard!",
        copyFailed: "Failed to copy automatically. Summary:\n\n",
        reportTitle: "SPENSE LEDGER REPORT", reportNameLabel: "Ledger Name", reportGeneratedOn: "Generated On", reportParticipants: "Participants",
        reportTotalSpend: "Total Spend", reportSettlementMatrix: "SETTLEMENT MATRIX", reportAllSettled: "All balances are currently settled!",
        reportHistoryTitle: "ITEMIZED TRANSACTION HISTORY", reportNoExpenses: "No expenses recorded.", reportPaidBy: "Paid By", reportSplitWith: "Split With",
        taglines: [
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Spend simply.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Enjoy the moment. Leave tracking to SPENSE.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Just add what you spent.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Who paid? Who shares? SPENSE does the math.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Settle easily.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">See who owes whom — and how much.</span>`
        ]
    },
    tr: {
        activeLedgerLabel: "Aktif Hesap:",
        awaitingAuthLabel: "KİMLİK DOĞRULAMA BEKLENİYOR...",
        settingsBtn: "⚙ Ayarlar", shareLinkBtn: "Bağlantıyı Paylaş", deleteBtn: "Sil",
        participantsTitle: "Katılımcılar", participantsSub: "Bu gruba kişi ekleyin veya çıkarın.",
        namePlaceholder: "İsim...", addBtn: "Ekle", noParticipantsYet: "Henüz katılımcı yok.",
        newExpenseTitle: "Yeni Harcama", editExpenseTitle: "Harcamayı Düzenle",
        newExpenseSub: "Bölüştürmek için işlem kaydedin.", editExpenseSub: "Bu harcamayı güncelleyin veya silin.",
        dateLabel: "Tarih", categoryLabel: "Kategori", descLabel: "Açıklama", descPlaceholder: "ör. Akşam Yemeği",
        amountLabel: "Tutar", paidByLabel: "Ödeyen", splitBetweenLabel: "Paylaşanlar:", selectAllBtn: "Tümünü Seç", 
        recordExpenseBtn: "Harcamayı Kaydet", updateExpenseBtn: "Harcamayı Güncelle", cancelEditBtn: "İptal", deleteExpenseBtn: "Harcamayı Sil",
        noParticipantsSelect: "Katılımcı bulunamadı", addParticipantsFirst: "Önce katılımcı ekleyin.",
        settlementTitle: "Ödeme Matrisi", copySummaryBtn: "Özeti Kopyala",
        historyTitle: "Geçmiş Kayıtlar", clickToEditSub: "(Düzenlemek için tıkla)", generateReportBtn: "Rapor Oluştur",
        historyPaidBy: "Ödeyen", historySplit: "Paylaşanlar", editBtn: "Düzenle", noExpensesRecorded: "Henüz harcama kaydedilmedi.",
        settlementPlaceholder: "Harcamalar eklendikten sonra ödeme matrisi görünecektir.", allBalancesSettled: "Tüm borçlar kapatılmıştır!",
        settlementTpl: "{debtor}, {creditor} adlı kişiye {amount} ödeyecek.",
        modalSub: "Gizli bir grup hesabı oluşturun veya açın.", tabCreate: "Yeni Oluştur", tabRecall: "Var Olanı Aç",
        ledgerNameLabel: "Hesap Adı", ledgerNamePh: "ör. aksam-yemegi", setPinLabel: "4 Haneli PIN Belirleyin", initializeBtn: "Hesabı Başlat",
        selectArchiveLabel: "Arşiv Seç", enterPinLabel: "4 Haneli PIN Girin", accessLedgerBtn: "Hesaba Eriş",
        shareLinkHeader: "Hesap Bağlantısını Paylaş", shareLinkSub: "Bu bağlantıya sahip herkes PIN girmelidir.", copyBtn: "Kopyala",
        ledgerSettingsHeader: "Hesap Ayarları", languageSettingLabel: "Dil", currencySettingLabel: "Para Birimi", themeSettingLabel: "Görsel Tema", saveSettingsBtn: "Ayarları Kaydet",
        categories: {
            "Food & Drink": "Yiyecek & İçecek",
            "Transport": "Ulaşım",
            "Accommodation": "Konaklama",
            "Shopping": "Alışveriş",
            "Entertainment": "Eğlence",
            "Other": "Diğer"
        },
        alertValidLedgerPin: "Lütfen geçerli bir hesap adı ve 4 haneli PIN girin.",
        alertSelectLedgerPin: "Lütfen bir hesap seçin ve 4 haneli PIN girin.",
        alertAccessLedgerFirst: "Önce bir Hesaba erişin veya yeni Hesap başlatın.",
        alertParticipantExists: "Bu katılımcı zaten mevcut.",
        confirmRemoveParticipant: "Katılımcıyı silmek istediğinizden emin misiniz",
        alertFillFields: "Lütfen tüm harcama alanlarını doğru doldurun.",
        alertSelectSplitParticipant: "Paylaşacak en az bir kişi seçin.",
        confirmDeleteExpense: "Bu harcamayı silmek istediğinizden emin misiniz?",
        confirmDeleteLedger: "Aktif hesabı silmek istediğinizden emin misiniz?",
        noBalancesToCopy: "Kopyalanacak ödeme dengesi yok.",
        summaryCopied: "Ödeme özeti panoya kopyalandı!",
        copyFailed: "Otomatik kopyalanamadı. Özet:\n\n",
        reportTitle: "SPENSE HESAP RAPORU", reportNameLabel: "Hesap Adı", reportGeneratedOn: "Oluşturulma Tarihi", reportParticipants: "Katılımcılar",
        reportTotalSpend: "Toplam Harcama", reportSettlementMatrix: "ÖDEME MATRİSİ", reportAllSettled: "Tüm borçlar kapatılmıştır!",
        reportHistoryTitle: "DETAYLI İŞLEM GEÇMİŞİ", reportNoExpenses: "Henüz harcama kaydedilmedi.", reportPaidBy: "Ödeyen", reportSplitWith: "Paylaşanlar",
        taglines: [
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Kolayca harca.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Anın tadını çıkar. Takibi SPENSE'e bırak.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Sadece harcamanı ekle.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Kim ödedi? Kimler paylaşıyor? Matematik işini SPENSE yapar.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Rahatça hesabı kapat.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Kimin kime borcu var — anında gör.</span>`
        ]
    },
    de: {
        activeLedgerLabel: "Aktives Buch:",
        awaitingAuthLabel: "AUTHENTIFIZIERUNG ERFORDERLICH...",
        settingsBtn: "⚙ Einstellungen", shareLinkBtn: "Link Teilen", deleteBtn: "Löschen",
        participantsTitle: "Teilnehmer", participantsSub: "Personen hinzufügen oder entfernen.",
        namePlaceholder: "Name...", addBtn: "Hinzufügen", noParticipantsYet: "Noch keine Teilnehmer.",
        newExpenseTitle: "Neue Ausgabe", editExpenseTitle: "Ausgabe Bearbeiten",
        newExpenseSub: "Transaktion eintragen.", editExpenseSub: "Ändern oder löschen Sie diese Ausgabe.",
        dateLabel: "Datum", categoryLabel: "Kategorie", descLabel: "Beschreibung", descPlaceholder: "z.B. Abendessen",
        amountLabel: "Betrag", paidByLabel: "Bezahlt von", splitBetweenLabel: "Aufteilen:", selectAllBtn: "Alle", 
        recordExpenseBtn: "Speichern", updateExpenseBtn: "Aktualisieren", cancelEditBtn: "Abbrechen", deleteExpenseBtn: "Löschen",
        noParticipantsSelect: "Keine Teilnehmer vorhanden", addParticipantsFirst: "Fügen Sie zuerst Teilnehmer hinzu.",
        settlementTitle: "Abrechnungsmatrix", copySummaryBtn: "Kopieren",
        historyTitle: "Verlauf", clickToEditSub: "(Zum Bearbeiten anklicken)", generateReportBtn: "Bericht Erstellen",
        historyPaidBy: "Bezahlt von", historySplit: "Aufgeteilt", editBtn: "Bearbeiten", noExpensesRecorded: "Noch keine Ausgaben erfasst.",
        settlementPlaceholder: "Die Abrechnungsmatrix wird angezeigt, sobald Ausgaben hinzugefügt wurden.", allBalancesSettled: "Alle Salden sind ausgeglichen!",
        settlementTpl: "{debtor} schuldet {creditor} {amount}",
        modalSub: "Gruppenbuch öffnen.", tabCreate: "Neu", tabRecall: "Öffnen",
        ledgerNameLabel: "Name", ledgerNamePh: "z.B. club", setPinLabel: "PIN", initializeBtn: "Starten",
        selectArchiveLabel: "Archiv Wählen", enterPinLabel: "PIN Eingeben", accessLedgerBtn: "Zugreifen",
        shareLinkHeader: "Teilen", shareLinkSub: "PIN erforderlich.", copyBtn: "Kopieren",
        ledgerSettingsHeader: "Einstellungen", languageSettingLabel: "Sprache", currencySettingLabel: "Währung", themeSettingLabel: "Design-Vorlage", saveSettingsBtn: "Einstellungen Speichern",
        categories: {
            "Food & Drink": "Essen & Trinken",
            "Transport": "Transport",
            "Accommodation": "Unterkunft",
            "Shopping": "Einkaufen",
            "Entertainment": "Unterhaltung",
            "Other": "Sonstiges"
        },
        alertValidLedgerPin: "Bitte geben Sie einen gültigen Namen und eine 4-stellige PIN ein.",
        alertSelectLedgerPin: "Bitte wählen Sie ein Buch und geben Sie die PIN ein.",
        alertAccessLedgerFirst: "Greifen Sie zuerst auf ein Buch zu.",
        alertParticipantExists: "Teilnehmer existiert bereits.",
        confirmRemoveParticipant: "Möchten Sie diesen Teilnehmer wirklich entfernen",
        alertFillFields: "Bitte füllen Sie alle Felder korrekt aus.",
        alertSelectSplitParticipant: "Wählen Sie mindestens einen Teilnehmer zum Aufteilen aus.",
        confirmDeleteExpense: "Möchten Sie diese Ausgabe wirklich löschen?",
        confirmDeleteLedger: "Aktives Buch löschen?",
        noBalancesToCopy: "Keine Salden zum Kopieren vorhanden.",
        summaryCopied: "Abrechnung in die Zwischenablage kopiert!",
        copyFailed: "Automatisches Kopieren fehlgeschlagen. Zusammenfassung:\n\n",
        reportTitle: "SPENSE BERICHT", reportNameLabel: "Name des Buches", reportGeneratedOn: "Erstellt am", reportParticipants: "Teilnehmer",
        reportTotalSpend: "Gesamtausgaben", reportSettlementMatrix: "ABRECHNUNGSMATRIX", reportAllSettled: "Alle Salden sind ausgeglichen!",
        reportHistoryTitle: "TRANSAKTIONSVERLAUF", reportNoExpenses: "Keine Ausgaben erfasst.", reportPaidBy: "Bezahlt von", reportSplitWith: "Aufgeteilt mit",
        taglines: [
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach ausgeben.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Genieße den Moment. Überlasse die Nachverfolgung SPENSE.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach eintragen.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Wer hat bezahlt? Wer teilt es? SPENSE macht die Rechnung.</span>`,
            `<strong class="block font-black text-slate-900 text-2xl sm:text-3xl leading-tight">Einfach abrechnen.</strong><span class="block text-slate-600 text-xs sm:text-sm font-medium mt-1">Sehen Sie wer wem schuldet — und wie viel.</span>`
        ]
    }
};

function getTranslationDictionary() {
    return TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
}

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
    if (!isNaN(parsed.getTime())) return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
}

function findMemberCanonical(targetName) {
    if (!targetName) return targetName;
    const match = ledgerData.members.find(m => m.toLowerCase() === targetName.toLowerCase());
    return match || targetName;
}

function selectSettingsLang(lang) {
    selectedModalLang = lang;
    ['tr', 'en', 'de'].forEach(l => {
        const btn = document.getElementById(`setLang${l.toUpperCase()}`);
        if (btn) {
            btn.className = (l === lang) ? 
                "theme-btn py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold rounded-xl transition cursor-pointer option-btn-selected" :
                "theme-btn py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-extrabold border-2 border-slate-200 rounded-xl hover:border-slate-400 bg-slate-50 transition cursor-pointer opacity-50";
        }
    });
}

function selectSettingsCurrency(curr) {
    selectedModalCurrency = curr;
    ['USD', 'EUR', 'TRY'].forEach(c => {
        const btn = document.getElementById(`setCurr${c}`);
        if (btn) {
            btn.className = (c === curr) ?
                "theme-btn py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer option-btn-selected" :
                "theme-btn py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-extrabold border-2 border-slate-200 rounded-xl hover:border-slate-400 bg-slate-50 transition cursor-pointer opacity-50";
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
            btn.className = (t === theme) ?
                `theme-btn py-3 px-2 ${baseBg} rounded-xl text-center transition cursor-pointer option-btn-selected` :
                `theme-btn py-3 px-2 border-2 border-slate-200 ${baseBg} rounded-xl text-center transition cursor-pointer opacity-50`;
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

let taglineTimer = null;
let currentTaglineIndex = 0;

function initTaglineCarousel() {
    const spot = document.getElementById('taglineSpot');
    if (!spot) return;
    if (taglineTimer) clearInterval(taglineTimer);
    const motionClasses = ['motion-left', 'motion-right', 'motion-top', 'motion-bottom'];

    function cycleTagline() {
        const t = getTranslationDictionary();
        const activeTaglines = t.taglines;
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

function initCardDragging() {
    const container = document.getElementById('appContainer');
    if (!container) return;
    const handles = container.querySelectorAll('.card-drag-handle');

    handles.forEach(handle => {
        const card = handle.closest('.theme-card');
        if (!card) return;

        handle.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', '');
            card.classList.add('opacity-40', 'scale-95');
            window._draggedCard = card;
        });

        handle.addEventListener('dragend', () => {
            card.classList.remove('opacity-40', 'scale-95');
            container.querySelectorAll('.theme-card').forEach(c => c.classList.remove('border-amber-400', 'border-4', 'border-dashed'));
            window._draggedCard = null;
        });

        card.addEventListener('dragover', (e) => { e.preventDefault(); });

        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (window._draggedCard && window._draggedCard !== card) card.classList.add('border-amber-400', 'border-4', 'border-dashed');
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('border-amber-400', 'border-4', 'border-dashed');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('border-amber-400', 'border-4', 'border-dashed');
            if (window._draggedCard && window._draggedCard !== card) {
                const dragged = window._draggedCard;
                const parent = card.parentNode;
                const tempNode = document.createTextNode('');
                parent.replaceChild(tempNode, dragged);
                parent.replaceChild(dragged, card);
                parent.replaceChild(card, tempNode);
                saveCardLayout();
            }
        });
    });
}

function getCurrentCardOrder() {
    const container = document.getElementById('appContainer');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.theme-card')).map(card => card.getAttribute('data-card-id')).filter(Boolean);
}

function applyCardOrder(orderArray) {
    if (!Array.isArray(orderArray) || orderArray.length === 0) return;
    const container = document.getElementById('appContainer');
    if (!container) return;
    orderArray.forEach(id => {
        const card = container.querySelector(`[data-card-id="${id}"]`);
        if (card) container.appendChild(card);
    });
}

async function saveCardLayout() {
    if (!currentTab) return;
    const newOrder = getCurrentCardOrder();
    await callBackend('updateSettings', { cardOrder: newOrder });
}

async function getConfig() {
    try {
        const configRes = await fetch('config.json');
        if (!configRes.ok) throw new Error("config.json missing");
        const config = await configRes.json();
        return config.sheetUrl || config.googleSheetApiUrl || config.apiUrl;
    } catch (err) {
        return null;
    }
}

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
        return { status: "error", message: err.toString() };
    }
}

// --- ARCHIVE LOADER WITH ASYNC BACKGROUND PREFETCH & LOCKING ---
async function loadGoogleSheetsArchive() {
    const select = document.getElementById('archiveSelect');
    if (!select) return;

    if (isArchiveLoaded || isArchiveLoading) return;
    isArchiveLoading = true;

    try {
        const sheetUrl = await getConfig();
        if (!sheetUrl) {
            select.innerHTML = `<option value="">-- Missing sheetUrl in config.json --</option>`;
            isArchiveLoading = false;
            return;
        }

        const res = await fetch(sheetUrl);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const rawData = await res.json();
        let ledgers = [];

        if (Array.isArray(rawData)) {
            ledgers = rawData;
        } else if (typeof rawData === 'object' && rawData !== null) {
            ledgers = rawData.archives || rawData.sheets || rawData.ledgers || Object.keys(rawData);
        }

        ledgers = ledgers
            .filter(Boolean)
            .filter(name => name.toString().trim().toLowerCase() !== 'metadata');

        if (ledgers.length === 0) {
            select.innerHTML = `<option value="">-- No archives found --</option>`;
        } else {
            select.innerHTML = `<option value="">-- Select Ledger --</option>` + 
                ledgers.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');
            isArchiveLoaded = true;
        }
    } catch (error) {
        console.error("Archive fetch error:", error);
        select.innerHTML = `<option value="">-- Archive Load Error --</option>`;
    } finally {
        isArchiveLoading = false;
    }
}

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

        if (!isArchiveLoaded && !isArchiveLoading) {
            loadGoogleSheetsArchive();
        }
    }
}

async function createNewLedger() {
    const t = getTranslationDictionary();
    const nameInput = document.getElementById('newLedgerName');
    const pinInput = document.getElementById('newLedgerPin');
    const nameVal = nameInput?.value.trim().toLowerCase().replace(/\s+/g, '-');
    const pinVal = pinInput?.value.trim();

    if (!nameVal || pinVal.length !== 4) {
        alert(t.alertValidLedgerPin);
        return;
    }

    const res = await callBackend('createLedger', { 
        name: nameVal, pin: pinVal, theme: currentTheme, currency: currentCurrency, language: currentLang, cardOrder: getCurrentCardOrder() 
    });

    if (res && res.status === "success") {
        currentTab = res.createdTab;
        currentPin = pinVal;
        ledgerData = { members: [], expenses: [] };
        document.getElementById('welcomeModal')?.classList.add('hidden');
        render();
    }
}

async function recallLedger() {
    const t = getTranslationDictionary();
    const archiveSelect = document.getElementById('archiveSelect');
    const pinInput = document.getElementById('recallLedgerPin');
    const targetLedger = archiveSelect?.value;
    const pinVal = pinInput?.value.trim();

    if (!targetLedger || pinVal.length !== 4) {
        alert(t.alertSelectLedgerPin);
        return;
    }

    const sheetUrl = await getConfig();
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
        ledgerData.members = data.members || [];
        ledgerData.expenses = data.expenses || [];
        document.getElementById('welcomeModal')?.classList.add('hidden');
        render();
    }
}

function openShareModal() {
    document.getElementById('shareModal')?.classList.remove('hidden');
    const input = document.getElementById('shareLinkInput');
    if (input && currentTab) input.value = `${window.location.origin}${window.location.pathname}?ledger=${encodeURIComponent(currentTab)}`;
}
function closeShareModal() { document.getElementById('shareModal')?.classList.add('hidden'); }
function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    if (input) { input.select(); navigator.clipboard.writeText(input.value); }
}

function goHome() {
    currentTab = null; currentPin = null; ledgerData = { members: [], expenses: [] }; editingExpenseId = null;
    document.getElementById('welcomeModal')?.classList.remove('hidden');
    render();
    initTaglineCarousel();
}

async function deleteActiveLedger() {
    const t = getTranslationDictionary();
    if (!confirm(t.confirmDeleteLedger)) return;
    await callBackend('deleteLedger');
    goHome();
}

async function addMemberDirect() {
    const t = getTranslationDictionary();
    const input = document.getElementById('memberName');
    const name = input?.value.trim();
    if (!name) return;
    if (!currentTab) { alert(t.alertAccessLedgerFirst); return; }
    if (ledgerData.members.some(m => m.toLowerCase() === name.toLowerCase())) { alert(t.alertParticipantExists); input.value = ''; return; }

    ledgerData.members.push(name);
    input.value = '';
    render();
    await callBackend('addMembers', { names: [name] });
}

async function deleteMember(name, event) {
    if (event) event.stopPropagation();
    const t = getTranslationDictionary();
    const canonicalName = findMemberCanonical(name);
    if (!confirm(`${t.confirmRemoveParticipant} '${canonicalName}'?`)) return;

    ledgerData.members = ledgerData.members.filter(m => m.toLowerCase() !== canonicalName.toLowerCase());
    render();
    await callBackend('removeMember', { name: canonicalName });
}

function startEditExpense(id) {
    const exp = ledgerData.expenses.find(e => e.id.toString() === id.toString());
    if (!exp) return;
    editingExpenseId = id.toString();
    render();

    document.getElementById('expenseDate').value = formatToISODate(exp.date);
    document.getElementById('expenseDesc').value = exp.desc || '';
    document.getElementById('expenseAmount').value = exp.amount || '';
    document.getElementById('expenseCategory').value = exp.category || 'Food & Drink';
    document.getElementById('expensePaidBy').value = findMemberCanonical(exp.paidBy);

    const splitArr = (Array.isArray(exp.splitWith) ? exp.splitWith : (exp.splitBetween || [])).map(s => s.toLowerCase());
    document.querySelectorAll('.split-checkbox').forEach(cb => { cb.checked = splitArr.includes(cb.value.toLowerCase()); });
    document.getElementById('expenseFormSection')?.scrollIntoView({ behavior: 'smooth' });
}

function cancelEditExpense() {
    editingExpenseId = null;
    resetExpenseForm();
    render();
}

function resetExpenseForm() {
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').value = formatToISODate(new Date());
    document.querySelectorAll('.split-checkbox').forEach(cb => cb.checked = true);
}

async function updateExpense() {
    const t = getTranslationDictionary();
    if (!editingExpenseId) return;

    const date = formatToISODate(document.getElementById('expenseDate')?.value);
    const desc = document.getElementById('expenseDesc')?.value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount')?.value);
    const paidBy = findMemberCanonical(document.getElementById('expensePaidBy')?.value);

    if (!date || !desc || isNaN(amount) || amount <= 0 || !paidBy) { alert(t.alertFillFields); return; }

    const checkboxes = document.querySelectorAll('.split-checkbox:checked');
    const splitWith = Array.from(checkboxes).map(cb => findMemberCanonical(cb.value));
    if (splitWith.length === 0) { alert(t.alertSelectSplitParticipant); return; }

    const category = document.getElementById('expenseCategory')?.value || "General";
    const idx = ledgerData.expenses.findIndex(e => e.id.toString() === editingExpenseId);
    if (idx !== -1) ledgerData.expenses[idx] = { id: editingExpenseId, date, category, desc, amount, paidBy, splitWith };

    const targetId = editingExpenseId;
    editingExpenseId = null;
    resetExpenseForm();
    render();
    await callBackend('updateExpense', { id: targetId, date, category, desc, amount, paidBy, splitWith });
}

async function deleteExpenseFromEdit() {
    const t = getTranslationDictionary();
    if (!editingExpenseId) return;
    if (!confirm(t.confirmDeleteExpense)) return;

    const targetId = editingExpenseId;
    ledgerData.expenses = ledgerData.expenses.filter(e => e.id.toString() !== targetId);
    editingExpenseId = null;
    resetExpenseForm();
    render();
    await callBackend('deleteExpense', { id: targetId });
}

async function addExpense() {
    const t = getTranslationDictionary();
    const date = formatToISODate(document.getElementById('expenseDate')?.value);
    const desc = document.getElementById('expenseDesc')?.value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount')?.value);
    const paidBy = findMemberCanonical(document.getElementById('expensePaidBy')?.value);

    if (!date || !desc || isNaN(amount) || amount <= 0 || !paidBy) { alert(t.alertFillFields); return; }

    const checkboxes = document.querySelectorAll('.split-checkbox:checked');
    const splitWith = Array.from(checkboxes).map(cb => findMemberCanonical(cb.value));
    if (splitWith.length === 0) { alert(t.alertSelectSplitParticipant); return; }

    const category = document.getElementById('expenseCategory')?.value || "General";
    const id = Date.now().toString();

    ledgerData.expenses.push({ id, date, category, desc, amount, paidBy, splitWith });
    resetExpenseForm();
    render();
    await callBackend('addExpense', { id, date, category, desc, amount, paidBy, splitWith });
}

function calculateSettlement() {
    const t = getTranslationDictionary();
    const balances = {};
    const lowerMap = {};

    ledgerData.members.forEach(m => {
        balances[m.toLowerCase()] = 0;
        lowerMap[m.toLowerCase()] = m;
    });

    ledgerData.expenses.forEach(e => {
        const amt = parseFloat(e.amount) || 0;
        const splitList = (Array.isArray(e.splitWith) ? e.splitWith : (e.splitBetween || [])).map(s => s.toLowerCase());
        if (splitList.length === 0) return;

        const share = amt / splitList.length;
        const payerKey = (e.paidBy || '').toLowerCase();
        if (balances[payerKey] !== undefined) balances[payerKey] += amt;
        splitList.forEach(mKey => { if (balances[mKey] !== undefined) balances[mKey] -= share; });
    });

    const debtors = [], creditors = [];
    Object.keys(balances).forEach(key => {
        const bal = balances[key];
        if (bal < -0.01) debtors.push({ member: lowerMap[key] || key, amount: -bal });
        else if (bal > 0.01) creditors.push({ member: lowerMap[key] || key, amount: bal });
    });

    const transactions = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const minAmt = Math.min(debtors[i].amount, creditors[j].amount);
        const formattedAmount = `${getCurrencySymbol()}${minAmt.toFixed(2)}`;
        
        const template = t.settlementTpl || "{debtor} owes {creditor} {amount}";
        const txStr = template
            .replace('{debtor}', debtors[i].member)
            .replace('{creditor}', creditors[j].member)
            .replace('{amount}', formattedAmount);

        transactions.push(txStr);

        debtors[i].amount -= minAmt; creditors[j].amount -= minAmt;
        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }
    return transactions;
}

function copySettlementSummary() {
    const t = getTranslationDictionary();
    const txs = calculateSettlement();
    if (txs.length === 0) { alert(t.noBalancesToCopy); return; }

    const summaryText = `=== SPENSE SETTLEMENT MATRIX ===\nLedger: ${currentTab || 'General'}\nDate: ${new Date().toLocaleDateString()}\n--------------------------------\n` + txs.join('\n') + `\n================================`;
    navigator.clipboard.writeText(summaryText).then(() => alert(t.summaryCopied)).catch(() => alert(t.copyFailed + summaryText));
}

function generateLedgerReport() {
    if (!currentTab) return;
    const t = getTranslationDictionary();
    const sym = getCurrencySymbol();
    let totalSpent = 0;
    ledgerData.expenses.forEach(e => totalSpent += (parseFloat(e.amount) || 0));

    const settlement = calculateSettlement();
    let report = `====================================================\n               ${t.reportTitle}\n====================================================\n`;
    report += `${t.reportNameLabel}  : ${currentTab}\n${t.reportGeneratedOn} : ${new Date().toLocaleString()}\n${t.reportParticipants} : ${ledgerData.members.join(', ') || 'None'}\n${t.reportTotalSpend}  : ${sym}${totalSpent.toFixed(2)}\n====================================================\n\n`;
    report += `--- ${t.reportSettlementMatrix} ---\n`;
    report += (settlement.length > 0) ? settlement.map(s => `• ${s}\n`).join('') : `${t.reportAllSettled}\n`;
    report += `\n----------------------------------------------------\n\n--- ${t.reportHistoryTitle} ---\n`;

    if (ledgerData.expenses.length > 0) {
        ledgerData.expenses.forEach((e, idx) => {
            const splitArr = Array.isArray(e.splitWith) ? e.splitWith : (e.splitBetween || []);
            const localizedCat = (t.categories && t.categories[e.category]) ? t.categories[e.category] : e.category;
            report += `${idx + 1}. [${formatToISODate(e.date)}] ${e.desc} (${localizedCat})\n   ${t.amountLabel}: ${sym}${parseFloat(e.amount).toFixed(2)} | ${t.reportPaidBy}: ${findMemberCanonical(e.paidBy)}\n   ${t.reportSplitWith}: ${splitArr.map(s => findMemberCanonical(s)).join(', ')}\n\n`;
        });
    } else report += `${t.reportNoExpenses}\n`;
    report += `====================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
}

function getCurrencySymbol() { return currentCurrency === 'EUR' ? '€' : currentCurrency === 'TRY' ? '₺' : '$'; }
function applyTheme(themeName) { currentTheme = themeName; document.documentElement.setAttribute('data-theme', themeName.toLowerCase()); }
function switchLanguage(lang) { currentLang = lang; render(); initTaglineCarousel(); }
function selectAllSplits() { document.querySelectorAll('.split-checkbox').forEach(cb => cb.checked = true); }

function render() {
    const t = getTranslationDictionary();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (t[k]) el.innerText = t[k];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const k = el.getAttribute('data-i18n-ph');
        if (t[k]) el.placeholder = t[k];
    });

    const symbolEl = document.getElementById('currencySymbol');
    if (symbolEl) symbolEl.innerText = getCurrencySymbol();

    const nameEl = document.getElementById('activeLedgerName');
    if (nameEl) nameEl.innerText = currentTab ? currentTab.toUpperCase() : t.awaitingAuthLabel;

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

function renderMembers() {
    const t = getTranslationDictionary();
    const container = document.getElementById('memberList');
    if (!container) return;
    container.innerHTML = ledgerData.members.length > 0 
        ? ledgerData.members.map(m => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200 text-slate-800 font-bold">
                ${escapeHTML(m)}
                <button type="button" data-member="${escapeHTML(m)}" onclick="window.deleteMember(this.getAttribute('data-member'), event)" class="text-rose-600 hover:text-rose-800 font-black text-xs ml-1 cursor-pointer">×</button>
            </span>
        `).join('') 
        : `<span class="opacity-60 italic">${t.noParticipantsYet}</span>`;
}

function renderExpenseFormHeader() {
    const t = getTranslationDictionary();
    const titleEl = document.getElementById('expenseFormTitle');
    const subEl = document.getElementById('expenseFormSub');
    const actionsContainer = document.getElementById('expenseFormActions');
    if (!titleEl || !subEl || !actionsContainer) return;

    if (editingExpenseId) {
        titleEl.innerText = t.editExpenseTitle;
        subEl.innerText = t.editExpenseSub;
        actionsContainer.innerHTML = `
            <div class="grid grid-cols-3 gap-2">
                <button type="button" onclick="window.deleteExpenseFromEdit()" class="theme-btn bg-rose-500 hover:bg-rose-600 text-white py-3 text-xs font-black uppercase tracking-wider cursor-pointer rounded-xl">${t.deleteExpenseBtn}</button>
                <button type="button" onclick="window.cancelEditExpense()" class="theme-btn bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 text-xs font-black uppercase tracking-wider cursor-pointer rounded-xl">${t.cancelEditBtn}</button>
                <button type="button" onclick="window.updateExpense()" class="theme-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 py-3 text-xs font-black uppercase tracking-wider cursor-pointer rounded-xl">${t.updateExpenseBtn}</button>
            </div>`;
    } else {
        titleEl.innerText = t.newExpenseTitle;
        subEl.innerText = t.newExpenseSub;
        actionsContainer.innerHTML = `<button id="btnRecordExpense" type="button" onclick="window.addExpense()" class="w-full theme-btn py-3 text-sm font-extrabold cursor-pointer rounded-xl">${t.recordExpenseBtn}</button>`;
    }
}

function renderDropdowns() {
    const t = getTranslationDictionary();
    const catSelect = document.getElementById('expenseCategory');
    const paidSelect = document.getElementById('expensePaidBy');
    if (!catSelect || !paidSelect) return;

    const baseCategories = ["Food & Drink", "Transport", "Accommodation", "Shopping", "Entertainment", "Other"];
    catSelect.innerHTML = baseCategories.map(c => {
        const translatedCat = (t.categories && t.categories[c]) ? t.categories[c] : c;
        return `<option value="${c}">${escapeHTML(translatedCat)}</option>`;
    }).join('');

    paidSelect.innerHTML = ledgerData.members.length > 0 
        ? ledgerData.members.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('')
        : `<option value="">${t.noParticipantsSelect}</option>`;
}

function renderSplitCheckboxes() {
    const t = getTranslationDictionary();
    const container = document.getElementById('splitCheckboxes');
    if (!container) return;
    const selectedValues = Array.from(document.querySelectorAll('.split-checkbox:checked')).map(cb => cb.value.toLowerCase());

    container.innerHTML = ledgerData.members.length > 0
        ? ledgerData.members.map(m => `
            <label class="flex items-center gap-1.5 cursor-pointer bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-300 font-semibold">
                <input type="checkbox" value="${escapeHTML(m)}" ${selectedValues.length === 0 || selectedValues.includes(m.toLowerCase()) ? 'checked' : ''} class="split-checkbox accent-slate-900 cursor-pointer"> ${escapeHTML(m)}
            </label>
        `).join('')
        : `<span class="opacity-60 italic">${t.addParticipantsFirst}</span>`;
}

function renderHistory() {
    const t = getTranslationDictionary();
    const list = document.getElementById('expenseHistory');
    if (!list) return;

    list.innerHTML = ledgerData.expenses.length > 0
        ? ledgerData.expenses.map(e => {
            const localizedCat = (t.categories && t.categories[e.category]) ? t.categories[e.category] : e.category;
            const splitArr = Array.isArray(e.splitWith) ? e.splitWith : (e.splitBetween || []);
            const displaySplits = splitArr.map(s => findMemberCanonical(s)).join(', ');

            return `
            <li class="p-2.5 rounded-xl border border-current/15 flex justify-between items-center bg-current/5 gap-2">
                <div class="flex-1 min-w-0">
                    <span class="font-bold truncate block">${escapeHTML(e.desc)} (${escapeHTML(localizedCat)})</span>
                    <div class="text-[10px] opacity-70">${t.historyPaidBy} <span class="font-bold">${escapeHTML(findMemberCanonical(e.paidBy))}</span> • ${formatToISODate(e.date)} • ${t.historySplit}: ${escapeHTML(displaySplits)}</div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-extrabold text-sm">${getCurrencySymbol()}${parseFloat(e.amount).toFixed(2)}</span>
                    <button type="button" data-id="${e.id}" onclick="window.startEditExpense(this.getAttribute('data-id'))" class="theme-btn px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-300 text-slate-900 cursor-pointer hover:bg-amber-400">${t.editBtn}</button>
                </div>
            </li>`;
        }).join('')
        : `<li class="opacity-60 italic text-center py-4">${t.noExpensesRecorded}</li>`;
}

function renderSettlement() {
    const t = getTranslationDictionary();
    const container = document.getElementById('settlementList');
    if (!container) return;

    if (ledgerData.expenses.length === 0 || ledgerData.members.length === 0) {
        container.innerHTML = `<p class="opacity-60 italic text-center py-4">${t.settlementPlaceholder}</p>`;
        return;
    }

    const txs = calculateSettlement();
    container.innerHTML = txs.length > 0 
        ? txs.map(tx => `<div class="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-bold">${escapeHTML(tx)}</div>`).join('')
        : `<p class="font-bold text-center py-2 text-emerald-600">${t.allBalancesSettled}</p>`;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Window Exports
window.switchModalTab = switchModalTab; window.createNewLedger = createNewLedger; window.recallLedger = recallLedger;
window.openSettingsModal = openSettingsModal; window.closeSettingsModal = closeSettingsModal;
window.selectSettingsLang = selectSettingsLang; window.selectSettingsCurrency = selectSettingsCurrency; window.selectSettingsTheme = selectSettingsTheme;
window.openShareModal = openShareModal; window.closeShareModal = closeShareModal; window.copyShareLink = copyShareLink;
window.goHome = goHome; window.deleteActiveLedger = deleteActiveLedger; window.addMemberDirect = addMemberDirect; window.deleteMember = deleteMember;
window.addExpense = addExpense; window.startEditExpense = startEditExpense; window.cancelEditExpense = cancelEditExpense; window.updateExpense = updateExpense;
window.deleteExpenseFromEdit = deleteExpenseFromEdit; window.copySettlementSummary = copySettlementSummary; window.generateLedgerReport = generateLedgerReport;
window.switchLanguage = switchLanguage; window.saveCardLayout = saveCardLayout; window.selectAllSplits = selectAllSplits; window.saveSettings = saveSettings;

document.addEventListener('DOMContentLoaded', () => {
    initTaglineCarousel();
    initCardDragging();
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = formatToISODate(new Date());
    render();

    // Trigger background prefetching immediately on DOM load
    loadGoogleSheetsArchive();
});
