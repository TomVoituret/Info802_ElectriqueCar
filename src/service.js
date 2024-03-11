const express = require("express");
const soap = require("soap");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());

// Utilisez le protocole https si disponible
app.enable("trust proxy");

var url = "http://127.0.0.1:8000/totalTime?WSDL";

async function totalTime(a, b, c) {
  return new Promise((resolve, reject) => {
    const args = {
      nbBornes: a,
      trajBasic: b,
      tempsRecharge: c,
    };

    soap.createClient(url, { strictSSL: false }, function (err, client) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        client.totalTime(args, function (err, result) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("Add Result:", result.totalTimeResult.double[0]);
            resolve(result.totalTimeResult.double[0]);
          }
        });
      }
    });
  });
}

app.get("/totalTime/:a/:b/:c", async (req, res) => {
  const { a, b, c } = req.params;

  try {
    const resultArray = await totalTime(
      parseInt(a),
      parseFloat(b),
      parseFloat(c)
    );
    res.json(resultArray);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
