var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client')

var indexRouter = require('../routes/index');
var authRouter = require('../routes/auth');
var usersRouter = require('../routes/users');
var sessionsRouter = require('../routes/sessions');

var app = express();

const prisma = new PrismaClient()

app.use(async (req, res, next) => {
  req.prisma = prisma
  next()
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

module.exports = app;
