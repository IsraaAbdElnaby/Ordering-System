var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const uri = process.env.DATABASE_URL || 'mongodb+srv://user_1:user_1DB@orderingsystem-cabl1.mongodb.net/test' ;
mongoose.connect(uri, { useNewUrlParser: true });


module.exports = {mongoose};