const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const listEndpoints = require("express-list-endpoints");
const StatsD = require('hot-shots');
require("dotenv").config();

const dogstatsd = new StatsD();

const tracer = require("dd-trace").init({
  service: "yoga-server", // replace with your service name
  env: "PROD", // replace with your environment
  logInjection: true,
  analytics: true,
  runtimeMetrics: true,
});

const { PrismaClient } = require("@prisma/client");

var indexRouter = require("../routes/index");
var authRouter = require("../routes/auth");
var usersRouter = require("../routes/users");
var sessionsRouter = require("../routes/sessions");

var app = express();

const prisma = new PrismaClient();

app.use(async (req, res, next) => {
  req.prisma = prisma;
  req.tracer = tracer;
  req.dogstatsd = dogstatsd;
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

module.exports = app;

const routes = listEndpoints(app);
console.log(routes);
