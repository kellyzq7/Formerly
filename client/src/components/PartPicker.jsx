import React from "react";

const PART_ICONS = {
  "aws-cloud-club": (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  "bruin-ai": (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  "ieee": (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default function PartPicker({ parts, selectedPart, onSelect, userName }) {
  return (
    <div className="fade-in">
      <div className="text-center mb-8 pt-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {userName ? `Hey ${userName}!` : "Which team?"}
        </h2>
        <p className="text-gray-500 mt-1">
          {parts.length > 1
            ? "Select a club to submit a receipt"
            : "Submit a receipt for your club"}
        </p>
      </div>

      <div className="space-y-3">
        {parts.map((part) => (
          <button
            key={part.id}
            onClick={() => onSelect(part.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${
                selectedPart === part.id
                  ? "border-nova-500 bg-nova-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-nova-300 hover:shadow-sm"
              }
            `}
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
              ${selectedPart === part.id ? "bg-nova-100 text-nova-700" : "bg-gray-100 text-gray-500"}
            `}
            >
              {PART_ICONS[part.id] || (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{part.name}</p>
              <p className="text-sm text-gray-500">Submit receipts for {part.name}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
