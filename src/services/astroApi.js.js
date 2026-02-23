/**
 * astroApi.js
 * -----------
 * Centralised API layer for DiaAstro React website.
 * All backend calls go through this file so the base URL is
 * only defined in ONE place (via the .env files below).
 *
 * Usage in App.js:
 *   import { askGuidanceApi, palmReadingApi, saveLeadApi } from './services/astroApi';
 */

// Reads REACT_APP_API_URL from .env / .env.production automatically.
// In development  → http://localhost:5000
// In production   → https://api.diaastro.in  (or wherever you host Flask)
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── /save-lead ────────────────────────────────────────────────────────────────
/**
 * Save a visitor lead before unlocking AI features.
 * @param {{ name: string, phone: string, feature: string }} params
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function saveLeadApi({ name, phone, feature }) {
  const res = await fetch(`${BASE_URL}/save-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, feature }),
  });
  return res.json();
}

// ── /ask ──────────────────────────────────────────────────────────────────────
/**
 * Ask an astrology question and receive AI guidance.
 * @param {string} question
 * @returns {Promise<{ success: boolean, response?: string, error?: string }>}
 */
export async function askGuidanceApi(question) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

// ── /palm-reading ─────────────────────────────────────────────────────────────
/**
 * Upload a palm image and receive a reading.
 * @param {File}   imageFile   - The image File object from the file input
 * @param {string} style       - 'mystic' | 'modern' | 'vedic'
 * @returns {Promise<{ success: boolean, reading?: string, error?: string }>}
 */
export async function palmReadingApi(imageFile, style = 'mystic') {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('style', style);

  const res = await fetch(`${BASE_URL}/palm-reading`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

// ── /health ───────────────────────────────────────────────────────────────────
/**
 * Quick health-check — useful for showing a status indicator.
 * @returns {Promise<{ status: string, agent_available: boolean }>}
 */
export async function healthCheckApi() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}
