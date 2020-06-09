const mongoose = require('mongoose');

const { Schema } = mongoose;

const entrySchema = new Schema({
  id: mongoose.ObjectId,
  library: String,
  body: Buffer,
  title: Buffer,
  salt: Buffer,
  iv: Buffer,
});

module.exports = { entrySchema };
