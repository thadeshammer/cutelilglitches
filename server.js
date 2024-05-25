const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Send the main HTML file when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
