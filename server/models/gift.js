var mongoose = require('mongoose');

var Gift = mongoose.model('Gift',{
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

module.exports = {Gift}