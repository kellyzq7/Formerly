import React, { useState } from "react";

export default function Login({ onLogin, onSwitchToSignUp, loading, error }) {
  const [name, setName] = useState("");

  const canSubmit = name.trim().length > 0 && !loading;

  const handleSubmit = () => {
    if (canSubmit) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="fade-in">
      <div className="text-center mb-8 pt-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-nova-600 flex items-center justify-center shadow-lg">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-1">Enter your name to log in</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p>{error}</p>
        </div>
      )}

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

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3.5 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg
          ${canSubmit ? "bg-nova-600 hover:bg-nova-700 text-white hover:shadow-xl" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
      >
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center mt-4 text-sm text-gray-500">
        New here?{" "}
        <button onClick={onSwitchToSignUp} className="text-nova-600 hover:text-nova-800 font-medium">
          Create an account
        </button>
      </p>
    </div>
  );
}
