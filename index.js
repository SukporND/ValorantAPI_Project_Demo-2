const express = require("express");
const app = express();

app.use(require("./backend/backend").apiApp);

module.exports = app;
