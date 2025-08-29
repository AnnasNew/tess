// File: netlify/functions/send-bug.js

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
  
  // URL API Bug yang asli
  const BUG_API_URL = "https://cella-saja.mydigital-store.me/permen";

  try {
    const response = await axios.post(BUG_API_URL, {
      chatId: target,
      type: bugType
    });

    if (response.data.status === "success") {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: `Bug '${bugType}' berhasil dikirim ke ${target}` }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: response.data.message || 'Error from external API' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: `Failed to connect to external API: ${error.message}` }),
    };
  }
};
                            
