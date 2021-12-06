const express = require('express');
const path = require('path');
const { watch } = require('chokidar');
const { saveEntry, getEntries, deleteEntry } = require('../db/controllers');
// Initialize watcher.
const app = express();
const PORT = 1337;
const log = console.log.bind(console);

const nodePaths = ['./server/test_index.js', './db/'];
const watcher = watch(nodePaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

// Add event listeners.
watcher
  .on('add', (listenerPath) => log(`File ${listenerPath} has been added`))
  .on('change', (listenerPath) => log(`File ${listenerPath} has been changed`))
  .on('unlink', (listenerPath) => log(`File ${listenerPath} has been removed`));

app.use('/', express.static('./test'));

app.use(express.static(path.join(__dirname, 'client', 'test')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/query/:id', (req, res) => {
  res.set('Access-Control-Allow-Origin');
  const library = req.params.id;
  log('inget', library);
  getEntries(library, (err, docs) => {
    if (err) {
      log(`error saving: ${err}`);
      res.sendStatus(500);
    }
    log('fetched');
    res.status(200).json(docs);
  });
});

app.post('/submit/', (req, res) => {
  res.set('Access-Control-Allow-Origin');
  log('inpost', req.body);
  saveEntry(req.body, (err, row) => {
    if (err) {
      log(`error saving: ${err}`);
      res.sendStatus(400);
    }
    log('saved id: ', row.id);
    res.status(201).json(row);
  });
});

app.delete('/delete/:id', (req, res) => {
  const entry = req.params.id;
  log('indelete', entry);
  deleteEntry(entry, (err, docs) => {
    if (err) {
      log(`error deleting: ${err}`);
      res.sendStatus(400);
    }
    log('deleted');
    res.status(200).json(docs);
  });
});

app.listen(PORT, () => log(`listening at http://localhost:${PORT}`));
