var express = require('express');
var router = express.Router();

require('../models/connection')
const Touit = require('../models/touits')
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody')

// POST new Touit
router.post('/', (req, res) => {

  if (!checkBody(req.body, ['token', 'content'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ token: req.body.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }
    const newTouit = new Touit({
      author: user._id,
      content: req.body.content,
      createdAt: new Date(),
    })

    newTouit.save().then(newData => {
      res.json({ result: true, touit: newData });
    })
  })
});

// DELETE Touit
router.delete('/', (req, res) => {

  if (!checkBody(req.body, ['token', 'touitId'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ token: req.body.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }

    Touit.findById(req.body.touitId)
      .populate('author')
      .then(touit => {
        if (!touit) {
          res.json({ result: false, error: 'Touit not found' })
          return
        } else if (String(touit.author._id) !== String(user._id)) {
          res.json({ result: false, error: 'Not the author of Touit' })
          return
        }

        Touit.deleteOne({ _id: touit._id }).then(() => {
          res.json({ result: true })
        })
      })
  })
})

// LOAD Touit
router.get('/all/:token', (req, res) => {

  User.findOne({ token: req.params.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }

    Touit.find() // Select specific fields to return for security
      .populate('author', ['userName', 'firstName', 'avatar'])
      .populate('like', ['userName'])
      .sort({ createdAt: 'desc' })
      .then(touit => {
        res.json({ result: true, touit })
      })
  })
})

// Liked Touit
router.put('/like', (req, res) => {

  if (!checkBody(req.body, ['token', 'touitId'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ token: req.body.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }

    Touit.findById(req.body.touitId).then(touit => {
      if (!touit) {
        res.json({ result: false, error: 'Touit not found' })
        return
      }

      if (touit.like.includes(user._id)) { // If User already likes the Touit
        Touit.updateOne({ _id: touit._id }, { $pull: { like: user._id } })
          .then(() => {
            res.json({ result: true })
          })
      } else { // User likes the Touit by add User ID
        Touit.updateOne({ _id: touit._id }, { $push: { like: user._id } })
          .then(() => {
            res.json({ result: true })
          })
      }
    })
  })
})

// Load Hashtags for Trends
router.get('/trends/:token', (req, res) => {

  User.findOne({ token: req.params.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }
    Touit.find({ content: { $regex: /#/ } })
      .then(touits => {

        const hashtags = []

        for (const touit of touits) {
          const filteredHashtags = touit.content.split(' ').filter(word => word.startsWith('#') && word.length > 1)
          hashtags.push(...filteredHashtags)
        }

        const trends = []
        for (const hashtag of hashtags) {
          const trendIndex = trends.findIndex(trend => trend.hashtag === hashtag)
          if (trendIndex === -1) {
            trends.push({ hashtag, count: 1 })
          } else {
            trends[trendIndex].count++
          }
        }

        res.json({ result: true, trends: trends.sort((a, b) => b.count - a.count) })
      })
  })
})

// Load Hashtags for Hashtags view
router.get('/hashtag/:token/:query', (req, res) => {

  User.findOne({ token: req.params.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' })
      return
    }

    Touit.find({ content: { $regex: new RegExp('#' + req.params.query, 'i') } }) // Select specific fields to return for security
      .populate('author', ['userName', 'firstName'])
      .populate('like', ['userName'])
      .sort({ createdAt: 'desc' })
      .then(touit => {
        res.json({ result: true, touit })
      })
  })
})

module.exports = router;
