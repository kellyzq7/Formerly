import React, { useState } from "react";

const PART_ICONS = {
  build: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.658-5.658a2.122 2.122 0 113-3L14.42 12.17m0 0L18.58 16.34m-4.16-4.17L6.34 4.01a2.122 2.122 0 00-3 3l8.08 8.08m4.16-4.17l3.354 3.354a2.122 2.122 0 01-3 3L14.42 12.17" />
    </svg>
  ),
  programming: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  outreach: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
};

export default function SignUp({ parts, onSignUp, onSwitchToLogin, loading }) {
  const [name, setName] = useState("");
  const [selectedParts, setSelectedParts] = useState([]);

  const togglePart = (partId) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const canSubmit = name.trim().length > 0 && selectedParts.length > 0 && !loading;

  const handleSubmit = () => {
    if (canSubmit) {
      onSignUp(name.trim(), selectedParts);
    }
  };

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div className="text-center mb-8 pt-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-nova-600 flex items-center justify-center shadow-lg">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Nova Receipt</h2>
        <p className="text-gray-500 mt-1">Create your account to get started</p>
      </div>

      {/* Name input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-nova-500 transition-colors"
          autoFocus
        />
      </div>

      {/* Club selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Your Clubs
          <span className="text-gray-400 font-normal ml-1">(pick all that apply)</span>
        </label>
        <div className="space-y-2">
          {parts.map((part) => {
            const isSelected = selectedParts.includes(part.id);
            return (
              <button
                key={part.id}
                onClick={() => togglePart(part.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left
                  ${
                    isSelected
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
      </div>

      {/* Sign up button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3.5 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg
          ${canSubmit ? "bg-nova-600 hover:bg-nova-700 text-white hover:shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
      >
        {loading ? "Creating account…" : "Get Started"}
      </button>

      {/* Switch to login */}
      <p className="text-center mt-4 text-sm text-gray-500">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-nova-600 hover:text-nova-800 font-medium">
          Log in
        </button>
      </p>
    </div>
  );
}
