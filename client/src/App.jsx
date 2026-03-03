import React, { useState, useEffect } from "react";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import PartPicker from "./components/PartPicker";
import ReceiptCapture from "./components/ReceiptCapture";
import ReviewCard from "./components/ReviewCard";
import SuccessScreen from "./components/SuccessScreen";
import Header from "./components/Header";
import {
  fetchParts,
  signUp,
  login,
  getUser,
  uploadReceipt,
  extractReceipt,
  submitReceipt,
} from "./utils/api";

/**
 * Screen flow:
 * signup/login → select-part → capture → extracting → review → submitting → success
 */

const SCREENS = {
  SIGNUP: "signup",
  LOGIN: "login",
  SELECT_PART: "select-part",
  CAPTURE: "capture",
  EXTRACTING: "extracting",
  REVIEW: "review",
  SUBMITTING: "submitting",
  SUCCESS: "success",
};

export default function App() {
  // ── Auth state ──
  const [user, setUser] = useState(null); // { id, name, partIds, parts }
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ── App state ──
  const [screen, setScreen] = useState(SCREENS.SIGNUP);
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
          { id: "build", name: "Build" },
          { id: "programming", name: "Programming" },
          { id: "outreach", name: "Outreach" },
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
          setScreen(SCREENS.SELECT_PART);
          const lastPart = localStorage.getItem("lastPartId");
          if (lastPart && data.user.partIds.includes(lastPart)) {
            setSelectedPart(lastPart);
          }
        })
        .catch(() => {
          localStorage.removeItem("userId");
          setScreen(SCREENS.SIGNUP);
        });
    }
  }, []);

  // ── User's clubs only (filtered from all parts) ──
  const userParts = allParts.filter((p) => user?.partIds?.includes(p.id));

  // ━━━━━━━━━━━━━━━━━━━━━
  // Auth handlers
  // ━━━━━━━━━━━━━━━━━━━━━

  const handleSignUp = async (name, partIds) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signUp(name, partIds);
      setUser(result.user);
      localStorage.setItem("userId", result.user.id);
      setScreen(SCREENS.SELECT_PART);
    } catch (err) {
      setAuthError(err.response?.data?.error || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (name) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await login(name);
      setUser(result.user);
      localStorage.setItem("userId", result.user.id);
      setScreen(SCREENS.SELECT_PART);
    } catch (err) {
      if (err.response?.status === 404) {
        setAuthError("No account found with that name. Try signing up instead.");
      } else {
        setAuthError(err.response?.data?.error || "Login failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPart(null);
    setReceiptId(null);
    setExtractedData(null);
    setImagePreview(null);
    setError(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("lastPartId");
    setScreen(SCREENS.LOGIN);
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

  // ── Render ──
  const isAuthScreen = screen === SCREENS.SIGNUP || screen === SCREENS.LOGIN;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthScreen && (
        <Header
          user={user}
          selectedPart={userParts.find((p) => p.id === selectedPart)}
          onChangePart={
            screen !== SCREENS.EXTRACTING && screen !== SCREENS.SUBMITTING
              ? handleChangePart
              : undefined
          }
          onLogout={handleLogout}
        />
      )}

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm fade-in">
            <p className="font-medium">Something went wrong</p>
            <p>{error}</p>
          </div>
        )}

        {/* ── Auth screens ── */}
        {screen === SCREENS.SIGNUP && (
          <SignUp
            parts={allParts}
            onSignUp={handleSignUp}
            onSwitchToLogin={() => { setAuthError(null); setScreen(SCREENS.LOGIN); }}
            loading={authLoading}
            error={authError}
          />
        )}

        {screen === SCREENS.LOGIN && (
          <Login
            onLogin={handleLogin}
            onSwitchToSignUp={() => { setAuthError(null); setScreen(SCREENS.SIGNUP); }}
            loading={authLoading}
            error={authError}
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
            <h2 className="text-xl font-semibold text-gray-800">Submitting to Sheets…</h2>
          </div>
        )}

        {screen === SCREENS.SUCCESS && (
          <SuccessScreen
            partName={userParts.find((p) => p.id === selectedPart)?.name}
            onAddAnother={handleAddAnother}
            onStartOver={handleChangePart}
          />
        )}
      </main>
    </div>
  );
}
