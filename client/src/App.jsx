import React, { useState, useEffect, useCallback } from "react";
import GoogleAuth from "./components/GoogleAuth";
import ClubSetup from "./components/ClubSetup";
import PartPicker from "./components/PartPicker";
import ReceiptCapture from "./components/ReceiptCapture";
import ReviewCard from "./components/ReviewCard";
import SuccessScreen from "./components/SuccessScreen";
import Header from "./components/Header";
import AdminDashboard from "./components/AdminDashboard";
import {
  fetchParts,
  googleAuth,
  updateUserParts,
  getUser,
  uploadReceipt,
  extractReceipt,
  submitReceipt,
} from "./utils/api";

/**
 * Screen flow:
 * google-sign-in → (club-setup if new user) → select-part → capture → extracting → review → submitting → success
 */

const SCREENS = {
  GOOGLE_SIGN_IN: "google-sign-in",
  CLUB_SETUP: "club-setup",
  ADMIN_DASHBOARD: "admin-dashboard",
  SELECT_PART: "select-part",
  CAPTURE: "capture",
  EXTRACTING: "extracting",
  REVIEW: "review",
  SUBMITTING: "submitting",
  SUCCESS: "success",
};

// Google Client ID — set in client/.env as VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  // ── Auth state ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ── App state ──
  const [screen, setScreen] = useState(SCREENS.GOOGLE_SIGN_IN);
  const [allParts, setAllParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  // ── Load all parts on mount ──
  useEffect(() => {
    fetchParts()
      .then(setAllParts)
      .catch(() => {
        setAllParts([
          { id: "aws-cloud-club", name: "AWS Cloud Club" },
          { id: "bruin-ai", name: "Bruin AI" },
          { id: "ieee", name: "IEEE" },
        ]);
      });
  }, []);

  // ── Restore session from localStorage ──
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      getUser(savedUserId)
        .then((data) => {
          setUser(data.user);
          if (data.user.role === "admin") {
            setScreen(SCREENS.ADMIN_DASHBOARD);
          } else if (data.user.partIds?.length > 0) {
            setScreen(SCREENS.SELECT_PART);
          } else {
            setScreen(SCREENS.CLUB_SETUP);
          }
          const lastPart = localStorage.getItem("lastPartId");
          if (lastPart && data.user.partIds?.includes(lastPart)) {
            setSelectedPart(lastPart);
          }
        })
        .catch(() => {
          localStorage.removeItem("userId");
          setScreen(SCREENS.GOOGLE_SIGN_IN);
        });
    }
  }, []);

  // ── User's clubs only ──
  const userParts = allParts.filter((p) => user?.partIds?.includes(p.id));

  // ━━━━━━━━━━━━━━━━━━━━━
  // Google Auth handler
  // ━━━━━━━━━━━━━━━━━━━━━

  const handleGoogleSuccess = useCallback(async (credential) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleAuth(credential);
      setUser(result.user);
      localStorage.setItem("userId", result.user.id);

      if (result.user.role === "admin") {
        setScreen(SCREENS.ADMIN_DASHBOARD);
      } else if (result.isNew || !result.user.partIds?.length) {
        setScreen(SCREENS.CLUB_SETUP);
      } else {
        setScreen(SCREENS.SELECT_PART);
      }
    } catch (err) {
      console.error("Google auth failed:", err);
      setAuthError(err.response?.data?.error || "Sign-in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━
  // Club setup handler (new users)
  // ━━━━━━━━━━━━━━━━━━━━━

  const handleClubSetup = async (partIds) => {
    setAuthLoading(true);
    try {
      const result = await updateUserParts(user.id, partIds);
      setUser(result.user);
      setScreen(SCREENS.SELECT_PART);
    } catch (err) {
      console.error("Club setup failed:", err);
      setAuthError(err.response?.data?.error || "Failed to save clubs");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    // Disable Google auto-select so the user can pick a different account
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setSelectedPart(null);
    setReceiptId(null);
    setExtractedData(null);
    setImagePreview(null);
    setError(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("lastPartId");
    setScreen(SCREENS.GOOGLE_SIGN_IN);
  };

  // ━━━━━━━━━━━━━━━━━━━━━
  // Receipt flow handlers
  // ━━━━━━━━━━━━━━━━━━━━━

  const handlePartSelect = (partId) => {
    setSelectedPart(partId);
    localStorage.setItem("lastPartId", partId);
    setScreen(SCREENS.CAPTURE);
  };

  const handleImageCapture = async (file) => {
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setScreen(SCREENS.EXTRACTING);

    try {
      const uploadResult = await uploadReceipt(file);
      setReceiptId(uploadResult.receiptId);

      const extractResult = await extractReceipt(uploadResult.receiptId);
      setExtractedData(extractResult.data);
      setScreen(SCREENS.REVIEW);
    } catch (err) {
      console.error("Extraction failed:", err);
      setError(err.response?.data?.message || err.message || "Extraction failed");
      setScreen(SCREENS.REVIEW);
    }
  };

  const handleSubmit = async (editedData, notes) => {
    setError(null);
    setScreen(SCREENS.SUBMITTING);

    try {
      await submitReceipt(receiptId, selectedPart, editedData, user.name, notes);
      setScreen(SCREENS.SUCCESS);
    } catch (err) {
      console.error("Submit failed:", err);
      setError(err.response?.data?.message || "Failed to submit");
      setScreen(SCREENS.REVIEW);
    }
  };

  const handleAddAnother = () => {
    setReceiptId(null);
    setExtractedData(null);
    setImagePreview(null);
    setError(null);
    setScreen(SCREENS.CAPTURE);
  };

  const handleChangePart = () => {
    setReceiptId(null);
    setExtractedData(null);
    setImagePreview(null);
    setError(null);
    setScreen(SCREENS.SELECT_PART);
  };

  const handleRetryExtract = () => {
    setError(null);
    setScreen(SCREENS.CAPTURE);
  };

  // Admin: switch from dashboard to receipt upload flow
  const handleSubmitReceipt = () => {
    if (!user?.partIds?.length) {
      setScreen(SCREENS.CLUB_SETUP);
    } else {
      setScreen(SCREENS.SELECT_PART);
    }
  };

  // Admin: return to dashboard after submitting a receipt
  const handleReturnToAdmin = () => {
    setReceiptId(null);
    setExtractedData(null);
    setImagePreview(null);
    setError(null);
    setSelectedPart(null);
    setScreen(SCREENS.ADMIN_DASHBOARD);
  };

  // ── Render ──
  const isPreAuthScreen = screen === SCREENS.GOOGLE_SIGN_IN || screen === SCREENS.CLUB_SETUP;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPreAuthScreen && (
        <Header
          user={user}
          selectedPart={userParts.find((p) => p.id === selectedPart)}
          onChangePart={
            !isAdmin && screen !== SCREENS.EXTRACTING && screen !== SCREENS.SUBMITTING && screen !== SCREENS.ADMIN_DASHBOARD
              ? handleChangePart
              : undefined
          }
          onReturnToAdmin={
            isAdmin && screen !== SCREENS.ADMIN_DASHBOARD && screen !== SCREENS.EXTRACTING && screen !== SCREENS.SUBMITTING
              ? handleReturnToAdmin
              : undefined
          }
          onLogout={handleLogout}
        />
      )}

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Error banners */}
        {authError && isPreAuthScreen && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm fade-in">
            <p>{authError}</p>
          </div>
        )}

        {error && !isPreAuthScreen && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm fade-in">
            <p className="font-medium">Something went wrong</p>
            <p>{error}</p>
          </div>
        )}

        {/* Missing client ID warning */}
        {screen === SCREENS.GOOGLE_SIGN_IN && !GOOGLE_CLIENT_ID && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <p className="font-medium">Google Client ID not configured</p>
            <p>Set <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100 px-1 rounded">client/.env</code></p>
          </div>
        )}

        {/* ── Auth screens ── */}
        {screen === SCREENS.GOOGLE_SIGN_IN && (
          <GoogleAuth
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={handleGoogleSuccess}
            loading={authLoading}
          />
        )}

        {screen === SCREENS.CLUB_SETUP && (
          <ClubSetup
            parts={allParts}
            userName={user?.name}
            userPicture={user?.picture}
            onComplete={handleClubSetup}
            loading={authLoading}
          />
        )}

        {/* ── Admin dashboard ── */}
        {screen === SCREENS.ADMIN_DASHBOARD && (
          <AdminDashboard
            user={user}
            allParts={allParts}
            onSubmitReceipt={handleSubmitReceipt}
          />
        )}

        {/* ── App screens ── */}
        {screen === SCREENS.SELECT_PART && (
          <PartPicker
            parts={userParts}
            selectedPart={selectedPart}
            onSelect={handlePartSelect}
            userName={user?.name}
          />
        )}

        {screen === SCREENS.CAPTURE && (
          <ReceiptCapture onCapture={handleImageCapture} />
        )}

        {screen === SCREENS.EXTRACTING && (
          <div className="text-center py-16 fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-nova-100 flex items-center justify-center pulse-glow">
              <svg className="w-10 h-10 text-nova-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Nova is reading your receipt…</h2>
            <p className="text-gray-500 mt-2">This usually takes a few seconds</p>
            {imagePreview && (
              <img src={imagePreview} alt="Receipt preview" className="mt-6 max-h-48 mx-auto rounded-lg shadow-md opacity-60" />
            )}
          </div>
        )}

        {screen === SCREENS.REVIEW && (
          <ReviewCard
            data={extractedData}
            imagePreview={imagePreview}
            onSubmit={handleSubmit}
            onRetry={handleRetryExtract}
            extractionFailed={!extractedData}
            partName={userParts.find((p) => p.id === selectedPart)?.name}
            userName={user?.name}
          />
        )}

        {screen === SCREENS.SUBMITTING && (
          <div className="text-center py-16 fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Submitting to Airtable…</h2>
          </div>
        )}

        {screen === SCREENS.SUCCESS && (
          <SuccessScreen
            partName={userParts.find((p) => p.id === selectedPart)?.name}
            onAddAnother={handleAddAnother}
            onStartOver={isAdmin ? handleReturnToAdmin : handleChangePart}
            isAdmin={isAdmin}
          />
        )}
      </main>
    </div>
  );
}
