require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var touitsRouter = require('./routes/touits');

var app = express();

const cors = require('cors');
app.use(cors({ 
    origin:'*'
}))
app.options('*', cors())
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With', 'Content-Type', 'Accept')
    next()
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/touits', touitsRouter);
app.use('/users', usersRouter);

module.exports = app;
