// File: netlify/functions/send-otp.js
// Ini adalah FUNGSI PLACEHOLDER. Anda harus menggantinya dengan logika nyata.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }
  
  const { number } = JSON.parse(event.body);

  if (!number) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Missing number' }),
    };
  }

  try {
    // --- TEMPATKAN LOGIKA BAILEYS UNTUK MENGIRIM OTP DI SINI ---
    // Contoh: call API server Baileys Anda yang memiliki fungsi untuk send-otp
    
    // Contoh respons placeholder:
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "OTP sent successfully" }),
    };

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to send OTP" }),
    };
  }
};
