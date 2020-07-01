const express = require('express');
const path = require('path');
const { saveEntry, getEntries } = require('../db/controllers');

const app = express();
const PORT = 1337;


app.use('/', express.static('./dist'));

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(express.json());
app.use(express.urlencoded());

app.get('/query/:id', (req, res) => {
  const library = req.params.id;
  console.log('inget', library);
  getEntries(library, (err, docs) => {
    if (err) {
      console.log(`error saving: ${err}`);
      res.sendStatus(400);
    } else {
      console.log('fetched');
      res.status(200).json(docs);
    }
  });
});

app.post('/submit/', (req, res) => {
  console.log('inpost', req.body);
  saveEntry(req.body, (err) => {
    if (err) {
      console.log(`error saving: ${err}`);
      res.sendStatus(400);
    } else {
      console.log('saved id: ', req.body.id);
      res.sendStatus(201);
    }
  });
});


// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));
