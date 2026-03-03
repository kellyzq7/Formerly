import React, { useRef, useState } from "react";

export default function ReceiptCapture({ onCapture }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    onCapture(file);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div className="fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-semibold mb-2" style={{ color: "#0F2B46" }}>Scan Receipt</h2>
        <p className="text-body-lg" style={{ color: "#0F2B46", opacity: 0.7 }}>Take a photo or upload an image</p>
      </div>

      {/* Camera capture button (primary action on mobile) */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-4 px-6 font-display font-semibold rounded-card shadow-soft transition-all duration-200 flex items-center justify-center gap-3 text-lg"
        style={{ backgroundColor: "#5BA7D1", color: "white" }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Take Photo
      </button>

      {/* Hidden file input with camera access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Divider */}
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 h-px" style={{ backgroundColor: "#E4E8ED" }} />
        <span className="text-sm font-medium" style={{ color: "#0F2B46", opacity: 0.6 }}>or</span>
        <div className="flex-1 h-px" style={{ backgroundColor: "#E4E8ED" }} />
      </div>

      {/* Drag & drop zone (for desktop) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          // Open file picker without camera on desktop
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => handleFile(e.target.files?.[0]);
          input.click();
        }}
        className="border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all duration-200 shadow-soft"
        style={{
          backgroundColor: dragActive ? "#CFE8F6" : "#FBF7F2",
          borderColor: dragActive ? "#5BA7D1" : "#E4E8ED"
        }}
        onMouseEnter={(e) => {
          if (!dragActive) {
            e.currentTarget.style.borderColor = "#5BA7D1";
          }
        }}
        onMouseLeave={(e) => {
          if (!dragActive) {
            e.currentTarget.style.borderColor = "#E4E8ED";
          }
        }}
      >
        <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#5BA7D1" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="font-medium text-body" style={{ color: "#0F2B46" }}>Upload from files</p>
        <p className="text-sm mt-1" style={{ color: "#0F2B46", opacity: 0.7 }}>Drag & drop or click to browse</p>
        <p className="text-xs mt-2" style={{ color: "#0F2B46", opacity: 0.6 }}>JPG, PNG, WebP — Max 10MB</p>
      </div>
    </div>
  );
}
