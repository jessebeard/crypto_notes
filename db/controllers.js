const entry = require('./index.js');

exports.saveEntry = (note, callback) => {
  console.log(note);
  const newEntry = new entry(note);
  newEntry.save((err, success) => {
    if (err) {
      callback(err, null);
    } else {
      console.log('saved entry');
      callback(null, success);
    }
  });
};


exports.getEntries = (library, callback) => {
  entry.find({ library }, (err, docs) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, docs);
    }
  });
};

exports.updateDoc = (itemId, updateKey, updateValue, callback) => {
  entry.findOneAndUpdate({ id: itemId },
    { $set: { [updateKey]: updateValue } }, { new: true, upsert: true },
    (err, item) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, item);
      }
    });
};

exports.deleteDoc = (itemId, callback) => {
  entry.findOneAndDelete({ id: itemId }, (err, item) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, item);
    }
  });
};
