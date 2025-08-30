// File: netlify/functions/pair-code.js
// Ini adalah FUNGSI PLACEHOLDER. Anda harus menggantinya dengan logika nyata.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }
  
  const { number, code } = JSON.parse(event.body);

  if (!number || !code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Missing number or code' }),
    };
  }

  try {
    // --- TEMPATKAN LOGIKA BAILEYS UNTUK MEMASANGKAN DENGAN KODE DI SINI ---
    // Contoh: call API server Baileys Anda yang memiliki fungsi untuk pair-code
    
    // Contoh respons placeholder:
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Pairing successful" }),
    };

  } catch (error) {
    console.error('Error in pair-code function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to pair with code" }),
    };
  }
};
