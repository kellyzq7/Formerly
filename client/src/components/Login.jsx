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
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-card flex items-center justify-center shadow-soft" style={{ backgroundColor: "#5BA7D1" }}>
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-display font-semibold mb-2" style={{ color: "#0F2B46" }}>Welcome Back</h2>
        <p className="text-body-lg" style={{ color: "#0F2B46", opacity: 0.7 }}>Enter your name to log in</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-card border shadow-soft" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
          <p className="text-sm" style={{ color: "#0F2B46" }}>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-semibold mb-2.5" style={{ color: "#0F2B46" }}>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
          placeholder="Enter your name"
          className="w-full px-4 py-3.5 rounded-card text-body focus:outline-none transition-colors border shadow-soft"
          style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED", color: "#0F2B46" }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#5BA7D1"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#E4E8ED"}
          autoFocus
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-4 px-6 font-display font-semibold rounded-card shadow-soft transition-all duration-200 text-lg"
        style={{
          backgroundColor: canSubmit ? "#5BA7D1" : "#E4E8ED",
          color: canSubmit ? "white" : "#0F2B46",
          opacity: canSubmit ? 1 : 0.5,
          cursor: canSubmit ? "pointer" : "not-allowed"
        }}
        onMouseEnter={(e) => {
          if (canSubmit) {
            e.currentTarget.style.opacity = "0.9";
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center mt-6 text-body" style={{ color: "#0F2B46", opacity: 0.7 }}>
        New here?{" "}
        <button onClick={onSwitchToSignUp} className="font-medium" style={{ color: "#5BA7D1" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          Create an account
        </button>
      </p>
    </div>
  );
}
