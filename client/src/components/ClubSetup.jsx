import React, { useState } from "react";

const PART_ICONS = {
  "aws-cloud-club": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  "bruin-ai": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  "ieee": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default function ClubSetup({ parts, userName, userPicture, onComplete, loading }) {
  const [selectedParts, setSelectedParts] = useState([]);

  const togglePart = (partId) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const canSubmit = selectedParts.length > 0 && !loading;

  return (
    <div className="fade-in">
      {/* Welcome with Google profile */}
      <div className="text-center mb-8 pt-6">
        {userPicture && (
          <img
            src={userPicture}
            alt={userName}
            className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-nova-200 shadow-md"
            referrerPolicy="no-referrer"
          />
        )}
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {userName}!
        </h2>
        <p className="text-gray-500 mt-1">Select the clubs you belong to</p>
      </div>

      {/* Club selection */}
      <div className="space-y-2 mb-6">
        {parts.map((part) => {
          const isSelected = selectedParts.includes(part.id);
          return (
            <button
              key={part.id}
              onClick={() => togglePart(part.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? "border-nova-500 bg-nova-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected ? "bg-nova-600 border-nova-600" : "border-gray-300 bg-white"}
                `}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-nova-100 text-nova-700" : "bg-gray-100 text-gray-400"}`}>
                {PART_ICONS[part.id] || (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <span className={`font-medium text-base ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                {part.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={() => canSubmit && onComplete(selectedParts)}
        disabled={!canSubmit}
        className={`w-full py-3.5 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg
          ${canSubmit ? "bg-nova-600 hover:bg-nova-700 text-white hover:shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
