// File: netlify/functions/send-bug.js

const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }

  try {
    const { target, bugType } = JSON.parse(event.body);

    if (!target || !bugType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing required parameters: target or bugType' }),
      };
    }

    // --- MULAI IMPLEMENTASI PENGIRIMAN BUG WHATSAPP DI SINI ---
    // Kode di bawah ini adalah placeholder dan tidak berfungsi secara nyata.
    // Anda harus menggantinya dengan implementasi API WhatsApp yang valid.
    
    // Simulasi respons sukses dari API eksternal
    console.log(`Simulasi pengiriman bug '${bugType}' ke ${target}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay API
    
    // Logika payload bug: (contoh)
    let payload = {};
    switch (bugType) {
      case 'Crashtotalvis':
        payload = { type: 'interactive_message', size: 'large' };
        break;
      case 'Forclose':
        payload = { type: 'text', content: 'bug_payload_for_close' };
        break;
      case 'Delay':
        payload = { type: 'text', content: 'bug_payload_delay' };
        break;
      case 'Blank Chat':
        payload = { type: 'text', content: 'bug_payload_blank' };
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Invalid bugType specified.' }),
        };
    }

    // Mengembalikan respons sukses simulasi
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: `Bug '${bugType}' berhasil dikirim ke ${target}` }),
    };

  } catch (error) {
    console.error('Error in send-bug Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Server error: ${error.message || 'Unknown error'}` }),
    };
  }
};
