const express = require("express");
const morgan = require("morgan");

const { ping } = require("./controller/ping");
const { error } = require("./controller/error");

const SLSLabeler = require("./controller/sls-labeler");
const SLSTransaction = require("./controller/sls-transaction");

const app = express();

//trust proxy
app.set("trust proxy", true);

//middlewares
process.env.NODE_ENV === "production" || app.use(morgan("dev"));
app.use(express.json({ type: "application/json" }));

//routes
app.get("/ping", ping);

app.post("/fhir/sls/label", SLSLabeler.post);
app.post("/fhir/sls/transaction", SLSTransaction.post);

app.use(error);

module.exports = {
  app
};
