var mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

mongoose.Promise = global.Promise;
const uri = process.env.DATABASE_URL ;
mongoose.connect(uri, { useNewUrlParser: true });


module.exports = {mongoose};