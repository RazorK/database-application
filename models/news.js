var mongoose = require('mongoose');

var ptSchema = new mongoose.Schema({
  title:String,
  link:String,
  description:String,
  author:String,
  category:String,
  domain:String,
  comments:String,
  pubDate:String,
  board:String
});
ptSchema.plugin(require('mongoose-timestamp'));
exports.sjtu_pt = mongoose.model('sjtu_pt', ptSchema);