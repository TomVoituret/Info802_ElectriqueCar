const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
