// src/services/astroApi.js
// All API calls to the Flask backend go through here.
// The base URL is read from your .env file (REACT_APP_API_URL).

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/** Save visitor lead before unlocking AI features */
export async function saveLeadApi({ name, phone, feature }) {
  const res = await fetch(`${BASE_URL}/save-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, feature }),
  });
  return res.json();
}

/** Ask an astrology question — returns AI guidance text */
export async function askGuidanceApi(question) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

/** Upload palm image — returns reading text */
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

/** Health check */
export async function healthCheckApi() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}
