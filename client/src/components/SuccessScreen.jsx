import React from "react";

export default function SuccessScreen({ partName, onAddAnother, onStartOver, isAdmin }) {
  return (
    <div className="text-center py-12 fade-in">
      {/* Animated checkmark */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
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

      <h2 className="text-2xl font-bold text-gray-900">Submitted!</h2>
      <p className="text-gray-500 mt-2">
        Receipt added to the <span className="font-semibold text-nova-700">{partName}</span> table in Airtable
      </p>

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <button
          onClick={onAddAnother}
          className="w-full py-3.5 px-6 bg-nova-600 hover:bg-nova-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
        >
          Add Another Receipt
        </button>

        <button
          onClick={onStartOver}
          className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          {isAdmin ? "Back to Dashboard" : "Change team"}
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
