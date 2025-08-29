const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the current directory

// Function to simulate sending a bug. Replace this with your actual logic.
// This is a placeholder function to demonstrate how the server would work.
async function sendBugToWhatsApp(target, bugType) {
  console.log(`Sending bug of type "${bugType}" to target "${target}"...`);
  // Simulate an async operation, e.g., a real API call
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Bug successfully sent to ${target}.`);
      resolve({ success: true, message: "Bug sent successfully!" });
    }, 1500);
  });
}

// API endpoint to handle bug requests from the client
app.post("/api/send-bug", async (req, res) => {
  const { target, bugType } = req.body;
  if (!target || !bugType) {
    return res.status(400).json({ success: false, message: "Target number and bug type are required." });
  }

  try {
    const result = await sendBugToWhatsApp(target, bugType);
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send bug.", error: err.message });
  }
});

// A new endpoint to handle the original /api/lol for backward compatibility, if needed.
app.post("/api/lol", async (req, res) => {
  const { target } = req.body;
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    const result = await sendBugToWhatsApp(target, "default_bug_type"); // Use a default bug type
    res.json({ success: true, message: `Bug successfully sent to ${target}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send bug.", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
