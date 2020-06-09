const express = require('express');
const path = require('path');
const { saveEntry, getEntries } = require('../db/controllers');

const app = express();
const PORT = 1337;


app.use('/', express.static('./dist'));

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(express.json());
// app.use(express.urlencoded());

app.get('/submit/', (req, res) => {
  getEntries(req.params.id)
    .then((document) => res.status(200).json(document))
    .catch((err) => res.status(422).json({ message: `Error: ${err}` }));
});

app.post('/submit/', (req, res) => {
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
