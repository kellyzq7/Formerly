import React, { useState, useEffect, useCallback } from "react";
import { getClubReceipts, deleteClubReceipt } from "../utils/api";

const COLUMNS = [
  { key: "Timestamp", label: "Timestamp", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
  { key: "SubmittedBy", label: "Submitted By" },
  { key: "Merchant", label: "Merchant" },
  { key: "Date", label: "Date" },
  { key: "Total", label: "Total", render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
  { key: "Tax", label: "Tax", render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
  { key: "Currency", label: "Currency" },
  { key: "PaymentMethod", label: "Payment" },
  { key: "Notes", label: "Notes" },
  { key: "Status", label: "Status" },
];

export default function AdminDashboard({ user, allParts, onSubmitReceipt }) {
  const adminClubIds = user?.adminClubs || [];
  const adminParts = allParts.filter((p) => adminClubIds.includes(p.id));

  const [activeClubId, setActiveClubId] = useState(adminParts[0]?.id || null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!activeClubId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getClubReceipts(activeClubId);
      setRecords(result.records || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (recordId) => {
    if (!window.confirm("Delete this receipt record? This cannot be undone.")) return;
    setDeletingId(recordId);
    // Optimistic removal
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    try {
      await deleteClubReceipt(activeClubId, recordId);
    } catch (err) {
      // Restore on failure
      setError(err.response?.data?.error || "Failed to delete record");
      fetchRecords();
    } finally {
      setDeletingId(null);
    }
  };

  const activeClub = adminParts.find((p) => p.id === activeClubId);

  return (
    <div className="fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Viewing receipts submitted to Airtable
          </p>
        </div>
        <button
          onClick={onSubmitReceipt}
          className="flex items-center gap-2 px-4 py-2 bg-nova-600 text-white rounded-lg text-sm font-medium hover:bg-nova-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit a Receipt
        </button>
      </div>

      {/* Club tabs */}
      {adminParts.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {adminParts.map((part) => (
            <button
              key={part.id}
              onClick={() => setActiveClubId(part.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeClubId === part.id
                  ? "bg-nova-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {part.name}
            </button>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            {activeClub?.name || "—"}
            {!loading && (
              <span className="ml-2 text-gray-400 font-normal">
                ({records.length} {records.length === 1 ? "record" : "records"})
              </span>
            )}
          </span>
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="p-8 text-center text-sm text-gray-400">
            <div className="w-6 h-6 border-2 border-nova-300 border-t-nova-600 rounded-full animate-spin mx-auto mb-3" />
            Loading records…
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && records.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No receipts submitted yet for {activeClub?.name}.
          </div>
        )}

        {/* Spreadsheet table */}
        {!loading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2.5 text-gray-500 font-medium whitespace-nowrap border-b border-gray-100"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-gray-500 font-medium border-b border-gray-100" />
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      i !== records.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[160px] truncate"
                        title={String(record.fields?.[col.key] ?? "")}
                      >
                        {col.render
                          ? col.render(record.fields?.[col.key])
                          : record.fields?.[col.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-30"
                        title="Delete record"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
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
