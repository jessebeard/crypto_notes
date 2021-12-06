const Entry = require('./index');

exports.saveEntry = (note, callback) => {
  console.log(note);
  const newEntry = new Entry(note);
  newEntry.save((err, success) => {
    if (err) {
      callback(err, null);
    } else {
      console.log('saved entry');
      // eslint-disable-next-line no-underscore-dangle
      delete Object.assign(success, { id: success._id });
      callback(null, success);
    }
  });
};

exports.getEntries = (library, callback) => {
  Entry.find({ library }, (err, docs) => {
    if (err) {
      callback(err, null);
    } else {
      // eslint-disable-next-line no-underscore-dangle
      docs.forEach((doc) => delete Object.assign(doc, { id: doc._id }));
      callback(null, docs);
    }
  });
};

exports.updateDoc = (itemId, updateKey, updateValue, callback) => {
  Entry.findOneAndUpdate({ id: itemId },
    { $set: { [updateKey]: updateValue } }, { new: true, upsert: true },
    (err, item) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, item);
      }
    });
};

exports.deleteEntry = (itemId, callback) => {
  Entry.findOneAndDelete({ _id: itemId }, (err, item) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, item);
    }
  });
};
