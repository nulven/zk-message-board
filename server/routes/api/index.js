const express = require('express');
const bodyParser = require('body-parser');

const {
  addUser,
  createPoll,
  getPoll,
  getPolls,
  getVotes,
  recordVote
} = require('../../pollDb.js');
const { verifyKey, verifySignature } = require('../../verifier');
const { mimcHash } = require('../../mimc.js');

const router = express.Router();
const jsonParser = bodyParser.json()


router.post('/polls/new', jsonParser, async (req, res) => {
  const { title, maxUsers } = req.body;
  const polls = await createPoll(title, maxUsers);
  res.send({ success: true, polls });
});

router.get('/polls/:id', async (req, res) => {
  const id = req.params.id;
  const poll = await getPoll(id);
  const votes = await getVotes(id);
  res.send({ success: true, poll, votes });
});

router.get('/polls', jsonParser, async (req, res) => {
  const polls = await getPolls();
  res.send({ success: true, polls });
});

router.post('/polls/register_key', jsonParser, async (req, res) => {
  const { id, keyHash } = req.body;
  addUser(id, keyHash);
  res.send({ success: true });
});

router.post('/polls/:id/vote', jsonParser, async (req, res) => {
  const id = req.params.id;
  const { sigProof } = req.body;
  const { proof, publicSignals } = sigProof
  const voteBits = publicSignals.slice(publicSignals.length-312, publicSignals.length);
  const vote = voteBits.join('');
  const validSignature = await verifySignature(proof, publicSignals);
  if (validSignature) {
    await recordVote(id, vote, publicSignals[publicSignals.length -2]);
    res.send({ success: true });
  } else {
    res.send({ error: 'Invalid signature' });
  }
});

module.exports = {
  apiRouter: router
};
