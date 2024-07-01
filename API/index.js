const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
  console.log("Connected to the database");
});

// enable cors for all origins
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// import routes
const riotRoute = require("./routes/Riot");

// use routes
app.use("/riot", riotRoute);

// healthcheck route
app.get("/healthcheck", (req, res) => {
  res.send("OK");
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`nodejs: app listening on port ${port}`);
});
