const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routeRoutes = require("./routes/routeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EcoRoute AI Backend is running successfully!"
  });
});

app.use("/api", routeRoutes);

app.listen(PORT, () => {
  console.log(`EcoRoute AI Backend running at http://localhost:${PORT}`);
});