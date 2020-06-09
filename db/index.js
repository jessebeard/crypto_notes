const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/crypto-notes',
  { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('err', console.error.bind(console, 'connection error:'));
// eslint-disable-next-line no-console
db.once('open', () => console.log('Database connected...'));

const { Schema } = mongoose;

const entrySchema = new Schema({
  id: mongoose.ObjectId,
  library: String,
  body: Buffer,
  title: Buffer,
  salt: [Number],
  iv: [Number],
});

const entry = mongoose.model('entry', entrySchema);

module.exports = entry;
