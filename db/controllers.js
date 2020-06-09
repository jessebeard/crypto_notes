const entry = require('./index.js');

exports.saveEntry = (note, callback) => {
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


exports.getEntries = (callback) => {
  entry.findAll((err, item) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, item);
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
