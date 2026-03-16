import React from "react";

/**
 * Renders the receipt data as a Google Sheets–style preview table.
 * Shows exactly what the row will look like when appended.
 */
export default function SheetPreview({ data, partName, userName }) {
  // These match the column order in config.sheetColumns
  const columns = [
    { header: "Timestamp", value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
    { header: "SubmittedBy", value: userName || "—" },
    { header: "Part", value: partName || "—" },
    { header: "Merchant", value: data?.merchant || "—" },
    { header: "Item", value: data?.item || "—" },
    { header: "Date", value: data?.date || "—" },
    { header: "Total", value: data?.total != null ? `$${Number(data.total).toFixed(2)}` : "—" },
    { header: "Tax", value: data?.tax != null ? `$${Number(data.tax).toFixed(2)}` : "—" },
    { header: "Currency", value: data?.currency || "—" },
    { header: "Payment", value: data?.payment_method || "—" },
    { header: "Notes", value: data?.notes || "—" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Airtable tab header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
          </svg>
          <span className="text-xs font-semibold text-gray-600">Airtable Preview</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="px-2 py-0.5 bg-blue-100 rounded text-xs font-medium text-blue-700">
            {partName} table
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          {/* Column headers — styled like sheet cells */}
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="w-8 px-2 py-1.5 text-center text-gray-400 font-normal border-r border-gray-200">
                1
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data row — the actual preview */}
          <tbody>
            <tr className="bg-blue-50/40 border-b border-blue-200">
              <td className="w-8 px-2 py-2 text-center text-gray-400 font-normal border-r border-gray-200">
                2
              </td>
              {columns.map((col, i) => (
                <td
                  key={i}
                  className="px-3 py-2 text-gray-800 border-r border-gray-200 whitespace-nowrap max-w-[140px] truncate"
                  title={col.value}
                >
                  {col.value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom status bar */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Record will be created in Airtable</span>
        <span className="text-[10px] text-gray-400">{columns.length} columns</span>
      </div>
    </div>
  );
}
