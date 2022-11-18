var express = require('express');
var router = express.Router();

require('../models/connection')
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody')
const bcrypt = require('bcrypt');
const uid2 = require('uid2');

router.post('/signup', (req, res) => {

  if (!checkBody(req.body, ['firstName', 'userName', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ userName: { $regex: new RegExp(req.body.userName, 'i') } }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10)

      const newUser = new User({
        firstName: req.body.firstName,
        userName: req.body.userName,
        password: hash,
        token: uid2(32),
      })

      newUser.save().then(data => {
        res.json({ result: true, token: data.token })
      })

    } else {
      res.json({ result: false, error: 'User already exists' })
    }
  })
});

router.post('/signin', (req, res) => {

  if (!checkBody(req.body, ['userName', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ userName: { $regex: new RegExp(req.body.userName, 'i') } }).then(data => {
    if (bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, userName: data.userName, firstName: data.firstName })
    } else {
      res.json({ result: false, error: 'User not found or wrong password' })
    }
  })
})

module.exports = router;
