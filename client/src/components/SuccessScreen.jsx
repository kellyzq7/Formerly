import React from "react";

export default function SuccessScreen({ partName, onAddAnother, onStartOver }) {
  return (
    <div className="text-center fade-in" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      {/* Animated checkmark */}
      <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CFE8F6" }}>
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ color: "#5BA7D1" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
              animation: "drawCheck 0.5s ease-out 0.2s forwards",
            }}
          />
        </svg>
      </div>

      <h2 className="text-3xl font-display font-semibold mb-3" style={{ color: "#0F2B46" }}>Submitted!</h2>
      <p className="text-body-lg" style={{ color: "#0F2B46", opacity: 0.7 }}>
        Receipt added to the <span className="font-semibold" style={{ color: "#5BA7D1" }}>{partName}</span> table in Airtable
      </p>

      {/* Actions */}
      <div className="mt-10 space-y-3">
        <button
          onClick={onAddAnother}
          className="w-full py-4 px-6 font-display font-semibold rounded-card shadow-soft transition-all duration-200 text-lg"
          style={{ backgroundColor: "#5BA7D1", color: "white" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          Add Another Receipt
        </button>

        <button
          onClick={onStartOver}
          className="w-full py-2.5 text-sm font-medium"
          style={{ color: "#0F2B46", opacity: 0.7 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
        >
          Change team
        </button>
      </div>

      <style>{`
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
