const express = require('express');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');
const url = require('url');

const config = require('../webpack.config.js');
const app = express();
const compiler = webpack(config);
const router = express.Router();

const {
  createPoll,
  addUser,
  getPolls,
  getPoll,
  recordVote,
  getVotes
} = require('./pollDb.js');
const { mimcHash } = require('./mimc.js');
const { verifyKey, verifySignature } = require('./verifier');

const jsonParser = bodyParser.json()


if (!fs.existsSync(__dirname + '/polls')) {
  fs.mkdirSync(__dirname + '/polls');
}
if (!fs.existsSync(__dirname + '/votes')) {
  fs.mkdirSync(__dirname + '/votes');
}

app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}))
app.use(express.static(__dirname + '/../'));

router.get('/api/polls', jsonParser, async (req, res) => {
  const polls = await getPolls();
  res.send({ success: true, polls });
});

router.post('/api/polls/register_key', jsonParser, async (req, res) => {
  const { id, keyHash } = req.body;
  addUser(id, keyHash);
  res.send({ success: true });
});

router.post('/api/poll/new', jsonParser, async (req, res) => {
  const { title, maxUsers } = req.body;
  const polls = await createPoll(title, maxUsers);
  res.send({ success: true, polls });
});

router.get('/api/poll/:id', async (req, res) => {
  const id = req.params.id;
  const poll = await getPoll(id);
  const votes = await getVotes(id);
  res.send({ success: true, poll, votes });
});

router.post('/api/polls/:id/vote', jsonParser, async (req, res) => {
  const id = req.params.id;
  const { vote, sigProof } = req.body;
  const { proof, publicSignals } = sigProof
  const validSignature = await verifySignature(proof, publicSignals);
  await recordVote(id, vote, publicSignals[publicSignals.length -2]);
  res.send({ success: true });
});

router.get('*', function(req, res) {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
  }
});

app.use('/', router);

app.listen(8080, '127.0.0.1');
