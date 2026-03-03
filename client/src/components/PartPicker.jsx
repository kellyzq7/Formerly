import React from "react";

const PART_ICONS = {
  build: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.658-5.658a2.122 2.122 0 113-3L14.42 12.17m0 0L18.58 16.34m-4.16-4.17L6.34 4.01a2.122 2.122 0 00-3 3l8.08 8.08m4.16-4.17l3.354 3.354a2.122 2.122 0 01-3 3L14.42 12.17" />
    </svg>
  ),
  programming: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  outreach: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
};

export default function PartPicker({ parts, selectedPart, onSelect, userName }) {
  return (
    <div className="fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-semibold mb-2" style={{ color: "#0F2B46" }}>
          {userName ? `Hey ${userName}!` : "Which team?"}
        </h2>
        <p className="text-body-lg" style={{ color: "#0F2B46", opacity: 0.7 }}>
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
            className="w-full flex items-center gap-4 p-5 rounded-card border transition-all duration-200 text-left shadow-soft"
            style={{
              backgroundColor: selectedPart === part.id ? "#CFE8F6" : "#FBF7F2",
              borderColor: selectedPart === part.id ? "#5BA7D1" : "#E4E8ED"
            }}
            onMouseEnter={(e) => {
              if (selectedPart !== part.id) {
                e.currentTarget.style.borderColor = "#5BA7D1";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPart !== part.id) {
                e.currentTarget.style.borderColor = "#E4E8ED";
              }
            }}
          >
            <div
              className="w-14 h-14 rounded-card flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: selectedPart === part.id ? "#5BA7D1" : "#CFE8F6",
                color: selectedPart === part.id ? "white" : "#0F2B46"
              }}
            >
              {PART_ICONS[part.id] || (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-body-lg mb-0.5" style={{ color: "#0F2B46" }}>{part.name}</p>
              <p className="text-sm" style={{ color: "#0F2B46", opacity: 0.7 }}>Submit receipts for {part.name}</p>
            </div>
            <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#5BA7D1" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
