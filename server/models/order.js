var mongoose = require('mongoose');
// const autoIncrement = require('mongoose-auto-increment');

var orderSchema = new mongoose.Schema({
    date:{
        type: Date,
        required: true,
    },
    gift:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Gift',
    }],
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    location:{
        type: String,
        required: true,
    }
});

// Order.plugin(autoIncrement.plugin, 'Order');

var Order = mongoose.model('Order', orderSchema);
module.exports = {Order}