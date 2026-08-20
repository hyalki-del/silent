function renderHistory() {
    const list = document.getElementById('expenseHistory');
    if (!list) return;

    list.innerHTML = ledgerData.expenses.length > 0
        ? ledgerData.expenses.map(e => {
            const displayDate = formatToISODate(e.date);
            const canonicalPayer = findMemberCanonical(e.paidBy);
            const rawSplits = Array.isArray(e.splitWith) ? e.splitWith : (e.splitBetween || []);
            const displaySplits = rawSplits.map(s => findMemberCanonical(s)).join(', ');

            return `
            <li class="p-2.5 rounded-xl border border-current/15 flex justify-between items-center bg-current/5 gap-2">
                <div class="flex-1 min-w-0">
                    <span class="font-bold truncate block">${escapeHTML(e.desc)} (${escapeHTML(e.category)})</span>
                    <div class="text-[10px] opacity-70">Paid by <span class="font-bold">${escapeHTML(canonicalPayer)}</span> • ${displayDate} • Split: ${escapeHTML(displaySplits)}</div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-extrabold text-sm">${getCurrencySymbol()}${parseFloat(e.amount).toFixed(2)}</span>
                    <button type="button" data-id="${e.id}" onclick="window.startEditExpense(this.getAttribute('data-id'))" class="theme-btn px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-300 text-slate-900 cursor-pointer hover:bg-amber-400">Edit</button>
                </div>
            </li>
        `;
        }).join('')
        : '<li class="opacity-60 italic text-center py-4">No expenses recorded yet.</li>';
}
