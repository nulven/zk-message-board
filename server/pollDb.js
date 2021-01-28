const fs = require('fs');
const path = require('path');

const { mimcHash } = require('./mimc.js');


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parsePoll(data) {
  var lines = data.split('\n').filter(v => v !== '');
  const [id, title, maxUsers] = lines[0].split(',');
  lines = lines.filter(line => line !== '');
  const users = lines.slice(1);
  return { id, title, maxUsers, users };
}

function parseVotes(data) {
  var lines = data.split('\n').filter(v => v !== '');
  const votes = lines.map(line => line.split(',')[0]);
  let ones = 0;
  let zeros = 0;
  votes.forEach(vote => {
    if (vote === processVote(1)) {
      ones += 1;
    } else if (vote === processVote(0)) {
      zeros += 1;
    }
  });
  return { ones, zeros };
}

function createPoll(title, maxUsers) {
  const pollId = uuidv4();
  const id = `${pollId},${title},${maxUsers}\n`;
  fs.writeFile(__dirname + '/polls/' + pollId + '.txt', id, (err) => {});
  fs.writeFile(__dirname + '/votes/' + pollId + '.txt', '', (err) => {});
}

function addUser(pollId, userHash) {
  fs.appendFile(__dirname + '/polls/' + pollId + '.txt', userHash + '\n', err => {});
}

function buffer2bits(buff) {
  const res = [];
  for (let i = 0; i < buff.length; i++) {
    for (let j = 0; j < 8; j++) {
      if ((buff[i] >> j) & 1) {
        res.push('1');
      } else {
        res.push('0');
      }
    }
  }
  return res;
}

function processVote(bit) {
  const hash = mimcHash(bit).toString().padStart(78, '0');
  const buffer = Buffer.from(hash, 'hex');
  return buffer2bits(buffer).join('');
}

async function recordVote(pollId, vote, signature) {
  if (vote !== processVote(1) && vote !== processVote(0)) {
    throw new Error('Invalid vote');
  }
  const line = vote + ',' + signature + '\n';
  fs.appendFile(__dirname + '/votes/' + pollId + '.txt', line, err => {});
}

async function getPoll(pollId) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/polls/' + pollId + '.txt', (err, data) => {
      if (!!err) {
        resolve(null);
      } else {
        resolve(parsePoll(data.toString()));
      }
    });
  });
}

async function getVotes(pollId) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/votes/' + pollId + '.txt', (err, data) => {
      if (!!err) {
        resolve(null);
      } else {
        resolve(parseVotes(data.toString()));
      }
    });
  });
}

async function getPolls() {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(__dirname + '/polls', async (err, files) => {
      resolve(files);
    });
  });
  const parsed = [];
  const requests = files.map((file, index) => {
    return new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/polls/' + file, (err, data) => {
        parsed.push(parsePoll(data.toString()));
        resolve(data);
      });
    });
  });
  return Promise.all(requests).then(() => {
    return parsed;
  });
}

module.exports = {
  addUser,
  createPoll,
  getPoll,
  getPolls,
  getVotes,
  recordVote
}
