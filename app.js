// server.js
const express = require("express");
const { getPoliticalTalkshows } = require("./talkshow-service");
const path = require("path");

const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API endpoint for shows
app.get("/api/shows", async (req, res) => {
  try {
    const shows = await getPoliticalTalkshows();
    res.json(shows);
  } catch (error) {
    console.error("Error fetching shows:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch shows",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
