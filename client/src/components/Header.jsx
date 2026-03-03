import React, { useState } from "react";

export default function Header({ user, selectedPart, onChangePart, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nova-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Nova Receipt</h1>
        </div>

        {/* Right side — part badge + user avatar */}
        <div className="flex items-center gap-2">
          {/* Active part badge */}
          {selectedPart && onChangePart && (
            <button
              onClick={onChangePart}
              className="px-2.5 py-1 bg-nova-50 border border-nova-200 rounded-full text-xs font-medium text-nova-700 hover:bg-nova-100 transition-colors flex items-center gap-1"
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
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-gray-300 transition-colors"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown */}
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 fade-in">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.partIds?.length || 0} club{user.partIds?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowMenu(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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
