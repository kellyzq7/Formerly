import React, { useState, useEffect } from "react";
import SheetPreview from "./SheetPreview";

const EMPTY_DATA = {
  merchant: "",
  date: "",
  total: "",
  tax: "",
  currency: "USD",
  payment_method: "",
  confidence: { merchant: 0, date: 0, total: 0, tax: 0 },
};

const CONFIDENCE_THRESHOLD = 0.8;

export default function ReviewCard({
  data,
  imagePreview,
  onSubmit,
  onRetry,
  extractionFailed,
  partName,
  userName,
}) {
  const [formData, setFormData] = useState(EMPTY_DATA);
  const [notes, setNotes] = useState("");
  const [showImage, setShowImage] = useState(false);

  // Initialize form with extracted data
  useEffect(() => {
    if (data) {
      setFormData({
        merchant: data.merchant || "",
        date: data.date || "",
        total: data.total != null ? String(data.total) : "",
        tax: data.tax != null ? String(data.tax) : "",
        currency: data.currency || "USD",
        payment_method: data.payment_method || "",
        confidence: data.confidence || EMPTY_DATA.confidence,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLowConfidence = (field) => {
    return formData.confidence[field] < CONFIDENCE_THRESHOLD;
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      total: formData.total ? parseFloat(formData.total) : null,
      tax: formData.tax ? parseFloat(formData.tax) : null,
    };
    onSubmit(submitData, notes);
  };

  // Build live preview data from current form state
  const previewData = {
    ...formData,
    total: formData.total ? parseFloat(formData.total) : null,
    tax: formData.tax ? parseFloat(formData.tax) : null,
    notes,
  };

  const fieldClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nova-500 transition-all ${
      isLowConfidence(field)
        ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
        : "border-gray-300 bg-white"
    }`;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4 pt-2">
        <h2 className="text-xl font-bold text-gray-900">
          {extractionFailed ? "Manual Entry" : "Review Details"}
        </h2>
        {imagePreview && (
          <button
            onClick={() => setShowImage(!showImage)}
            className="text-sm text-nova-600 hover:text-nova-800 font-medium"
          >
            {showImage ? "Hide" : "Show"} receipt
          </button>
        )}
      </div>

      {extractionFailed && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium">Extraction failed — enter details manually</p>
          <button onClick={onRetry} className="underline mt-1 text-amber-700 hover:text-amber-900">
            Try again with a new photo
          </button>
        </div>
      )}

      {showImage && imagePreview && (
        <img
          src={imagePreview}
          alt="Receipt"
          className="w-full max-h-64 object-contain rounded-lg border border-gray-200 mb-4"
        />
      )}

      {/* Low confidence legend */}
      {data && !extractionFailed && (
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-700">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
          <span>Highlighted fields have low AI confidence — please verify</span>
        </div>
      )}

      {/* Editable form fields */}
      <div className="space-y-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Merchant
          </label>
          <input
            type="text"
            value={formData.merchant}
            onChange={(e) => handleChange("merchant", e.target.value)}
            placeholder="e.g. Home Depot"
            className={fieldClass("merchant")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={fieldClass("date")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => handleChange("total", e.target.value)}
              placeholder="0.00"
              className={fieldClass("total")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Tax ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.tax}
              onChange={(e) => handleChange("tax", e.target.value)}
              placeholder="0.00"
              className={fieldClass("tax")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nova-500 bg-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) => handleChange("payment_method", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nova-500 bg-white"
          >
            <option value="">Unknown</option>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was this purchase for?"
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nova-500 resize-none"
          />
        </div>
      </div>

      {/* ── Google Sheets Preview ── */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Sheet Preview — this is what will be added
        </p>
        <SheetPreview data={previewData} partName={partName} userName={userName} />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!formData.total}
        className={`w-full mt-5 py-3.5 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg
          ${
            formData.total
              ? "bg-green-600 hover:bg-green-700 text-white hover:shadow-xl"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Confirm &amp; Submit to Sheets
      </button>

      <button
        onClick={onRetry}
        className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        ← Retake photo
      </button>
    </div>
  );
}
