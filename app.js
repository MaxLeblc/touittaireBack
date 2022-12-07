require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var touitsRouter = require('./routes/touits');

var app = express();

// const corsWhiteList = [
//     "https://touittaire-front.vercel.app/",
//     "https://touittaire-front.vercel.app/login/",
//     "https://touittaire-front.vercel.app/signIn/",
//     "https://touittaire-front.vercel.app/signUp/",
// ]

const cors = require('cors');
app.use(cors({'Access-Control-Allow-Credentials': true}))
app.use(cors({ "Access-Control-Allow-Origin": corsWhiteList }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/touits', touitsRouter);
app.use('/users', usersRouter);

module.exports = app;
