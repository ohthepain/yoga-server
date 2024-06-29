"use strict";

const { config } = require("dotenv");

function checkConfigVersion(req, res, next) {
  let configVersion = req.headers["config-version"];
  if (!configVersion) {
    return res.status(400).send({
      message: "No config version provided!",
    });
  }

  if (configVersion !== process.env.CONFIG_VERSION) {
    return res.status(400).send({
      message: "Config version mismatch!",
      requiredVersion: process.env.CONFIG_VERSION
    });
  }

  next();
}

module.exports = { checkConfigVersion };
