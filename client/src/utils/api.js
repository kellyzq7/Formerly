/**
 * API utility — all backend calls for both teams to reference
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000, // 60s — Nova extraction can take a moment
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Authenticate with Google — send the JWT credential from Google Sign-In
 * Backend verifies it and returns/creates the user
 * @param {string} credential - JWT ID token from Google
 * @returns {Promise<{user: object, isNew: boolean}>}
 */
export async function googleAuth(credential) {
  const { data } = await api.post("/users/google-auth", { credential });
  return data;
}

/**
 * Update a user's club memberships (used after initial Google sign-in)
 * @param {string} userId
 * @param {string[]} partIds
 * @returns {Promise<{user: object}>}
 */
export async function updateUserParts(userId, partIds) {
  const { data } = await api.put(`/users/${userId}/parts`, { partIds });
  return data;
}

/**
 * Get user profile by ID
 * @param {string} userId
 * @returns {Promise<{user: object}>}
 */
export async function getUser(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Parts endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Fetch available parts/clubs
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function fetchParts() {
  const { data } = await api.get("/parts");
  return data.parts;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Receipt endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Upload a receipt image
 * @param {File} imageFile - The image file from input
 * @returns {Promise<{receiptId: string, status: string}>}
 */
export async function uploadReceipt(imageFile) {
  const formData = new FormData();
  formData.append("receipt", imageFile);

  const { data } = await api.post("/receipts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

/**
 * Trigger Nova AI extraction on an uploaded receipt
 * @param {string} receiptId
 * @returns {Promise<{receiptId: string, status: string, data: object}>}
 */
export async function extractReceipt(receiptId) {
  const { data } = await api.post(`/receipts/${receiptId}/extract`);
  return data;
}

/**
 * Get receipt status and data
 * @param {string} receiptId
 * @returns {Promise<object>}
 */
export async function getReceipt(receiptId) {
  const { data } = await api.get(`/receipts/${receiptId}`);
  return data;
}

/**
 * Submit receipt data to Google Sheets
 * @param {string} receiptId
 * @param {string} partId - Club/team ID
 * @param {object} editedData - The (possibly edited) receipt data
 * @param {string} userName - Name of the submitting user
 * @param {string} [notes] - Optional notes
 * @returns {Promise<object>}
 */
export async function submitReceipt(receiptId, partId, editedData, userName, notes = "") {
  const { data } = await api.post(`/receipts/${receiptId}/submit`, {
    partId,
    data: { ...editedData, notes },
    userName,
  });

  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// Admin endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━

function getStoredUserId() {
  return localStorage.getItem("userId") || "";
}

/**
 * Fetch all receipt records for a club (admin only)
 * @param {string} clubId
 * @returns {Promise<{clubId: string, records: Array}>}
 */
export async function getClubReceipts(clubId) {
  const { data } = await api.get(`/admin/clubs/${clubId}/receipts`, {
    headers: { "x-user-id": getStoredUserId() },
  });
  return data;
}

/**
 * Delete a receipt record from a club's Airtable table (admin only)
 * @param {string} clubId
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<{success: boolean, recordId: string}>}
 */
export async function deleteClubReceipt(clubId, recordId) {
  const { data } = await api.delete(`/admin/clubs/${clubId}/receipts/${recordId}`, {
    headers: { "x-user-id": getStoredUserId() },
  });
  return data;
}

export default api;
