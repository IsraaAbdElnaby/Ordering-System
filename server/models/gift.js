var mongoose = require('mongoose');
// const autoIncrement = require('mongoose-auto-increment');

var giftSchema = new mongoose.Schema({
    image:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
        minlength: 1,
        trim: true,
    },
});

// giftSchema.plugin(autoIncrement.plugin, 'Gift');

var Gift = mongoose.model('Gift', giftSchema);
module.exports = {Gift}