import React, { useState } from "react";

export default function Header({ user, selectedPart, onChangePart, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b shadow-soft" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-card flex items-center justify-center" style={{ backgroundColor: "#5BA7D1" }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-display font-semibold" style={{ color: "#0F2B46" }}>Nova Receipt</h1>
        </div>

        {/* Right side — part badge + user avatar */}
        <div className="flex items-center gap-2">
          {/* Active part badge */}
          {selectedPart && onChangePart && (
            <button
              onClick={onChangePart}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 border shadow-soft"
              style={{ backgroundColor: "#CFE8F6", borderColor: "#E4E8ED", color: "#0F2B46" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5BA7D1"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#CFE8F6"}
            >
              {selectedPart.name}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </button>
          )}

          {/* User avatar / menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors border shadow-soft"
                style={{ backgroundColor: "#CFE8F6", borderColor: "#E4E8ED", color: "#0F2B46" }}
                title={user.name}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5BA7D1"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#CFE8F6"}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown */}
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

                  <div className="absolute right-0 mt-2 w-48 rounded-card shadow-soft border py-1 z-20 fade-in" style={{ backgroundColor: "#FBF7F2", borderColor: "#E4E8ED" }}>
                    <div className="px-3 py-2.5 border-b" style={{ borderColor: "#E4E8ED" }}>
                      <p className="text-sm font-semibold" style={{ color: "#0F2B46" }}>{user.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#0F2B46", opacity: 0.7 }}>
                        {user.partIds?.length || 0} club{user.partIds?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowMenu(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: "#0F2B46" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#CFE8F6"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
