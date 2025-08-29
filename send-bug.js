

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" })
    };
  }
  const { target, bugType } = JSON.parse(event.body);
  if (!target || !bugType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Nomor target dan jenis bug dibutuhkan." })
    };
  }
  async function sendBugToWhatsApp(target, bugType) {
    console.log(`[Netlify Function] Mengirim bug tipe "${bugType}" ke target "${target}"...`);
    /*
    const whatsappApiUrl = "https://api.your-whatsapp-gateway.com/send";
    const apiKey = "YOUR_API_KEY"; // Ganti dengan API Key WhatsApp Gateway Anda

    const payload = {
      target: target,
      message: `Mengirim bug ${bugType}...`, // Pesan yang akan dikirim
      // Tambahkan parameter lain sesuai kebutuhan API Gateway Anda
    };

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menghubungi API WhatsApp Gateway");
    }

    const responseData = await response.json();
    return { success: true, message: responseData.message || "Bug berhasil dikirim!" };
    */
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`[Netlify Function] Bug berhasil dikirim ke ${target}.`);
        resolve({ success: true, message: "Bug sent successfully!" });
      }, 1500); // Simulasi penundaan 1.5 detik
    });
  }
  try {
    const result = await sendBugToWhatsApp(target, bugType);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: result.message })
    };
  } catch (err) {
    console.error("[Netlify Function Error]:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Gagal mengirim bug.", error: err.message })
    };
  }
};
