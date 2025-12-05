const fetch = require('node-fetch'); // Netlify Functions perlu node-fetch

exports.handler = async (event) => {
  // CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // ganti dengan domain-mu di production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { prompt, systemInstructionFile } = JSON.parse(event.body);

    // Ambil API key dari environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    // Kalau ada systemInstructionFile (URL), fetch dulu
    if (systemInstructionFile) {
      const res = await fetch(systemInstructionFile);
      if (!res.ok) throw new Error('Gagal fetch system instruction');
      const systemText = await res.text();
      requestBody.system_instruction = {
        parts: [{ text: systemText }],
      };
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: resultText }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};