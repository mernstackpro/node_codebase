"use strict";
const fs = require("fs"),
  path = require("path");
const connectDB = require("./db/connect");

require("dotenv").config({
  path: __dirname + "/.env",
});
const bodyParser = require("body-parser");

// Set Global
global.appRoot = __dirname;

const express = require("express");
const cors = require("cors");

// initiate App with express module.
let app = express();
app.use(cors());
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Include Services API File
app.use(require("./src/Services"));
 app.use(express.static(path.join(__dirname, "./react/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./react/dist/index.html"));
});

/*** Create HTTPs server. ***/
let http_options = {};
let https = require("https");

 if (process.env.SITE_ENVIREMENT == "production") {
  console.log('production entry')
  http_options = {
    ...http_options,
    key: fs.readFileSync("/path_to_key.pem"),
    cert: fs.readFileSync("/path_to_certificate.pem"),
  };
}

/** Create an HTTPS service identical to the HTTP service. **/
const https_port = process.env.HTTPS_PORT || "8006";
var httpsServer = https.createServer(http_options, app);
httpsServer.listen(https_port, () => {
    console.log(`httpsServer App started on port ${https_port}`);
});
