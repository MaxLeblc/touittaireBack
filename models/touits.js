const mongoose = require('mongoose')

const touitSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    content: String,
    like: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    createdAt: Date,
})

const Touit = mongoose.model('touits', touitSchema)

module.exports = Touit