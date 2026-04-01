import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, fmtCurrency, fmtDate, vehicleLabel } from "@/lib/store";
import { MiniValuationRange } from "@/components/ValuationDashboard";

function AppraisalsPage() {
  const { appraisals } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">🔥 Appraisals</h1>
          <p className="text-sm text-gray-400 mt-0.5">{appraisals.length} appraisal{appraisals.length !== 1 ? "s" : ""} on record</p>
        </div>
        <Link
          to="/appraisals/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity"
        >
          + New Appraisal
        </Link>
      </div>

      <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
        {appraisals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-500 text-sm mb-3">No appraisals yet</p>
            <Link to="/appraisals/new" className="text-[#3dd45c] text-sm font-medium hover:underline">🔥 Get your first appraisal</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Vehicle</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden sm:table-cell">Miles</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Retail</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden md:table-cell">Trade-In</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden md:table-cell">Private Party</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden lg:table-cell">Auction</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden lg:table-cell">Wholesale</th>
                  <th className="text-center px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium hidden xl:table-cell">Range</th>
                  <th className="text-right px-4 py-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {appraisals.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{vehicleLabel(a)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-400 hidden sm:table-cell">{a.miles?.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-red-400">{fmtCurrency(a.retail)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-orange-400 hidden md:table-cell">{fmtCurrency(a.trade_in)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-purple-400 hidden md:table-cell">{fmtCurrency(a.private_party)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-blue-400 hidden lg:table-cell">{fmtCurrency(a.auction)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-400 hidden lg:table-cell">{fmtCurrency(a.wholesale)}</td>
                    <td className="px-4 py-3.5 hidden xl:table-cell"><MiniValuationRange retail={a.retail} wholesale={a.wholesale} /></td>
                    <td className="px-4 py-3.5 text-right text-gray-400">{fmtDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/appraisals/")({
  component: AppraisalsPage,
});
