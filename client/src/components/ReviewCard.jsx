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
    `w-full px-3 py-2.5 border rounded-card text-body focus:outline-none transition-all ${
      isLowConfidence(field)
        ? "ring-1"
        : ""
    }`;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-semibold" style={{ color: "#0F2B46" }}>
          {extractionFailed ? "Manual Entry" : "Review Details"}
        </h2>
        {imagePreview && (
          <button
            onClick={() => setShowImage(!showImage)}
            className="text-sm font-medium"
            style={{ color: "#5BA7D1" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {showImage ? "Hide" : "Show"} receipt
          </button>
        )}
      </div>

      {extractionFailed && (
        <div className="mb-6 p-4 rounded-card border shadow-soft" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
          <p className="font-semibold text-body mb-1" style={{ color: "#0F2B46" }}>Extraction failed — enter details manually</p>
          <button onClick={onRetry} className="underline text-sm mt-1" style={{ color: "#5BA7D1" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Try again with a new photo
          </button>
        </div>
      )}

      {showImage && imagePreview && (
        <img
          src={imagePreview}
          alt="Receipt"
          className="w-full max-h-64 object-contain rounded-card border mb-6 shadow-soft"
          style={{ borderColor: "#E4E8ED" }}
        />
      )}

      {/* Low confidence legend */}
      {data && !extractionFailed && (
        <div className="mb-6 flex items-center gap-2 text-xs" style={{ color: "#0F2B46", opacity: 0.7 }}>
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#CFE8F6", border: "1px solid #5BA7D1" }} />
          <span>Highlighted fields have low AI confidence — please verify</span>
        </div>
      )}

      {/* Editable form fields */}
      <div className="space-y-4 rounded-card border p-6 shadow-soft" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
            Merchant
          </label>
          <input
            type="text"
            value={formData.merchant}
            onChange={(e) => handleChange("merchant", e.target.value)}
            placeholder="e.g. Home Depot"
            className={fieldClass("merchant")}
            style={{
              backgroundColor: isLowConfidence("merchant") ? "#CFE8F6" : "#FBF7F2",
              borderColor: isLowConfidence("merchant") ? "#5BA7D1" : "#E4E8ED",
              color: "#0F2B46"
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
            onBlur={(e) => e.currentTarget.style.borderColor = isLowConfidence("merchant") ? "#5BA7D1" : "#E4E8ED"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={fieldClass("date")}
              style={{
                backgroundColor: isLowConfidence("date") ? "#CFE8F6" : "#FBF7F2",
                borderColor: isLowConfidence("date") ? "#5BA7D1" : "#E4E8ED",
                color: "#0F2B46"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
              onBlur={(e) => e.currentTarget.style.borderColor = isLowConfidence("date") ? "#5BA7D1" : "#E4E8ED"}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
              Total ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.total}
              onChange={(e) => handleChange("total", e.target.value)}
              placeholder="0.00"
              className={fieldClass("total")}
              style={{
                backgroundColor: isLowConfidence("total") ? "#CFE8F6" : "#FBF7F2",
                borderColor: isLowConfidence("total") ? "#5BA7D1" : "#E4E8ED",
                color: "#0F2B46"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
              onBlur={(e) => e.currentTarget.style.borderColor = isLowConfidence("total") ? "#5BA7D1" : "#E4E8ED"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
              Tax ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.tax}
              onChange={(e) => handleChange("tax", e.target.value)}
              placeholder="0.00"
              className={fieldClass("tax")}
              style={{
                backgroundColor: isLowConfidence("tax") ? "#CFE8F6" : "#FBF7F2",
                borderColor: isLowConfidence("tax") ? "#5BA7D1" : "#E4E8ED",
                color: "#0F2B46"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
              onBlur={(e) => e.currentTarget.style.borderColor = isLowConfidence("tax") ? "#5BA7D1" : "#E4E8ED"}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2.5 border rounded-card text-body focus:outline-none transition-colors"
              style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED", color: "#0F2B46" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#E4E8ED"}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) => handleChange("payment_method", e.target.value)}
            className="w-full px-3 py-2.5 border rounded-card text-body focus:outline-none transition-colors"
            style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED", color: "#0F2B46" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#E4E8ED"}
          >
            <option value="">Unknown</option>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0F2B46", opacity: 0.7 }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was this purchase for?"
            rows={2}
            className="w-full px-3 py-2.5 border rounded-card text-body focus:outline-none resize-none transition-colors"
            style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED", color: "#0F2B46" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#E4E8ED"}
          />
        </div>
      </div>

      {/* ── Google Sheets Preview ── */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#0F2B46", opacity: 0.7 }}>
          Airtable Preview — this is what will be added
        </p>
        <SheetPreview data={previewData} partName={partName} userName={userName} />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!formData.total}
        className="w-full mt-8 py-4 px-6 font-display font-semibold rounded-card shadow-soft transition-all duration-200 flex items-center justify-center gap-2 text-lg"
        style={{
          backgroundColor: formData.total ? "#5BA7D1" : "#E4E8ED",
          color: formData.total ? "white" : "#0F2B46",
          opacity: formData.total ? 1 : 0.5,
          cursor: formData.total ? "pointer" : "not-allowed"
        }}
        onMouseEnter={(e) => {
          if (formData.total) {
            e.currentTarget.style.opacity = "0.9";
          }
        }}
        onMouseLeave={(e) => {
          if (formData.total) {
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Confirm &amp; Submit to Airtable
      </button>

      <button
        onClick={onRetry}
        className="w-full mt-3 py-2.5 text-sm font-medium"
        style={{ color: "#0F2B46", opacity: 0.7 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
      >
        ← Retake photo
      </button>
    </div>
  );
}
