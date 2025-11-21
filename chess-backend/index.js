const express = require("express");
const app = express();
app.use(express.json());

app.get("/status", (req, res) => {
  res.send({ message: "Backend ok!" });
});

app.listen(3000, () => console.log("API rodando na porta 3000"));