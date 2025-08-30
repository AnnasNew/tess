// File: netlify/functions/send-bug.js
// Ini adalah FUNGSI PLACEHOLDER. Anda harus menggantinya dengan logika nyata.

const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }
  
  const { target, bugType } = JSON.parse(event.body);

  if (!target || !bugType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Missing required parameters: target or bugType' }),
    };
  }

  try {
    // --- TEMPATKAN LOGIKA BAILEYS UNTUK MENGIRIM BUG DI SINI ---
    // Contoh: call API server Baileys Anda yang memiliki fungsi untuk send-bug
    
    // Contoh respons placeholder:
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: `Bug '${bugType}' berhasil dikirim ke ${target}` }),
    };

  } catch (error) {
    console.error('Error in send-bug function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to send bug" }),
    };
  }
};
