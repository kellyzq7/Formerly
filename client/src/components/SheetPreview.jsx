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
    { header: "Date", value: data?.date || "—" },
    { header: "Total", value: data?.total != null ? `$${Number(data.total).toFixed(2)}` : "—" },
    { header: "Tax", value: data?.tax != null ? `$${Number(data.tax).toFixed(2)}` : "—" },
    { header: "Currency", value: data?.currency || "—" },
    { header: "Payment", value: data?.payment_method || "—" },
    { header: "Notes", value: data?.notes || "—" },
  ];

  return (
    <div className="rounded-card border overflow-hidden shadow-soft" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
      {/* Airtable tab header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#5BA7D1" }}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
          </svg>
          <span className="text-xs font-semibold" style={{ color: "#0F2B46" }}>Airtable Preview</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#CFE8F6", color: "#0F2B46" }}>
            {partName} table
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          {/* Column headers — styled like sheet cells */}
          <thead>
            <tr className="border-b" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
              <th className="w-8 px-2 py-1.5 text-center font-normal border-r" style={{ color: "#0F2B46", opacity: 0.5, borderColor: "#E4E8ED" }}>
                1
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-1.5 text-left font-semibold border-r whitespace-nowrap"
                  style={{ color: "#0F2B46", borderColor: "#E4E8ED" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data row — the actual preview */}
          <tbody>
            <tr className="border-b" style={{ backgroundColor: "#CFE8F6", borderColor: "#E4E8ED" }}>
              <td className="w-8 px-2 py-2 text-center font-normal border-r" style={{ color: "#0F2B46", opacity: 0.5, borderColor: "#E4E8ED" }}>
                2
              </td>
              {columns.map((col, i) => (
                <td
                  key={i}
                  className="px-3 py-2 border-r whitespace-nowrap max-w-[140px] truncate"
                  style={{ color: "#0F2B46", borderColor: "#E4E8ED" }}
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
      <div className="px-3 py-1.5 border-t flex items-center justify-between" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
        <span className="text-[10px]" style={{ color: "#0F2B46", opacity: 0.6 }}>Record will be created in Airtable</span>
        <span className="text-[10px]" style={{ color: "#0F2B46", opacity: 0.6 }}>{columns.length} columns</span>
      </div>
    </div>
  );
}
