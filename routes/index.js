"use strict";
var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(200).send("hi from yoga server");
});

router.get('/health', function(req, res, next) {
  res.status(200).send("yoga is healthy!");
});

module.exports = router;
