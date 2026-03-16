import React, { useEffect, useRef } from "react";

/**
 * Renders Google's official "Sign in with Google" button.
 *
 * Uses the Google Identity Services (GIS) library loaded in index.html.
 * On success, Google returns a JWT credential containing the user's
 * name, email, picture, and unique Google ID (sub).
 *
 * @param {string} clientId - Your Google OAuth Client ID
 * @param {function} onSuccess - Called with the JWT credential string
 */
export default function GoogleAuth({ clientId, onSuccess, loading }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Wait for the Google GSI library to load
    const initGoogle = () => {
      if (!window.google?.accounts?.id) {
        // Library not loaded yet — retry in 100ms
        setTimeout(initGoogle, 100);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          // response.credential is the JWT ID token
          onSuccess(response.credential);
        },
      });

      // Render the button into our ref
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: buttonRef.current.offsetWidth,
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    };

    initGoogle();
  }, [clientId, onSuccess]);

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div className="text-center mb-8 pt-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-nova-600 flex items-center justify-center shadow-lg">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Formerly</h2>
        <p className="text-gray-500 mt-1">AI-powered receipt reimbursement</p>
      </div>

      {/* Google Sign-In button */}
      <div className="flex justify-center mb-6">
        {loading ? (
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-lg text-gray-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in…
          </div>
        ) : (
          <div ref={buttonRef} className="w-full flex justify-center" />
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 px-4">
        Sign in with your Google account to submit receipts for your clubs
      </p>
    </div>
  );
}
