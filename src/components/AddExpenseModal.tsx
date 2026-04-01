import { useState } from "react";
import { useStore, EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
}

export function AddExpenseModal({ open, onClose, vehicleId }: Props) {
  const { addExpense } = useStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Repair" as ExpenseCategory,
    description: "",
    amount: "",
    is_income: false,
  });

  if (!open) return null;

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.amount || !form.description) return;
    addExpense({
      vehicle_id: vehicleId,
      date: form.date,
      type: form.type,
      description: form.description,
      amount: Number(form.amount),
      is_income: form.is_income,
    });
    onClose();
    setForm({ date: new Date().toISOString().split("T")[0], type: "Repair", description: "", amount: "", is_income: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#131a2b] border border-white/[0.08] rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold">💰 Add Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3dd45c]/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3dd45c]/50">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this for?" className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3dd45c]/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Amount ($)</label>
            <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0" min="0" step="0.01" className="w-full bg-[#0a0e17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#3dd45c]/50" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_income ? "bg-[#3dd45c] border-[#3dd45c]" : "border-gray-600 group-hover:border-gray-400"}`}>
              {form.is_income && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <input type="checkbox" checked={form.is_income} onChange={(e) => set("is_income", e.target.checked)} className="hidden" />
            <span className="text-sm text-gray-300">This is income (sale, revenue)</span>
          </label>
          {form.is_income && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400">
              💡 Income entries are added as positive amounts to your vehicle&apos;s total income.
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.amount || !form.description} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">Add Entry</button>
        </div>
      </div>
    </div>
  );
}
