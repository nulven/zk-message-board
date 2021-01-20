const fs = require('fs');
const path = require('path');

const { mimcHash } = require('./mimc.js');


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randpassword() {
  return Math.floor(Math.random() * 100000000000);
}

function parseConfession(data) {
  const [header, message, proofRaw, publicSignalsRaw] = data.split('\n');
  const proof = JSON.parse(proofRaw);
  const publicSignals = publicSignalsRaw.split(',');
  const [id, date] = header.split(',');
  return { id, date, message, proof, publicSignals };
}

function parseGroup(data) {
  var [header, ...users] = data.split('\n').filter(v => v !== '');
  const [id, name, passwordHash] = header.split(',');
  return { id, name, passwordHash, users };
}

function createGroup(name) {
  const id = uuidv4();
  const password = randpassword();
  const passwordHash = mimcHash(password).toString();
  const header = `${id},${name},${passwordHash}\n`;
  fs.writeFile(__dirname + '/data/groups/' + id + '.txt', header, (err) => {});
  return { id, password };
}

function addGroupMember(groupId, keyHash) {
  fs.appendFile(__dirname + '/data/groups/' + groupId + '.txt', keyHash + '\n', err => {});
}

async function recordConfession(message, proof, publicSignals) {
  const confessionId = uuidv4();
  const date = Date.now();
  const header = `${confessionId},${date}`;
  const confession = [header, message, proof, publicSignals.toString()].join('\n');
  fs.appendFile(__dirname + '/data/confessions/' + confessionId + '.txt', confession, err => {});
}

async function getGroup(groupId) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/data/groups/' + groupId + '.txt', (err, data) => {
      resolve(parseGroup(data.toString()));
    });
  });
}

async function getConfession(confessionId) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/data/confessions/' + confessionId + '.txt', (err, data) => {
      resolve(parseConfession(data.toString()));
    });
  });
}

async function getGroups() {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(__dirname + '/data/groups', async (err, files) => {
      resolve(files);
    });
  });
  const parsed = [];
  const requests = files.map((file, index) => {
    const groupId = file.split('.')[0];
    return getGroup(groupId).then(data => {
      parsed.push(data);
    });
  });
  return Promise.all(requests).then(() => {
    return parsed;
  });
}

async function getConfessions() {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(__dirname + '/data/confessions', async (err, files) => {
      resolve(files);
    });
  });
  const parsed = [];
  const requests = files.map((file, index) => {
    const confessionId = file.split('.')[0];
    return getConfession(confessionId).then(data => {
      parsed.push(parseConfession(data.toString()));
    });
  });
  return Promise.all(requests).then(() => {
    return parsed;
  });
}

module.exports = {
  createGroup,
  addGroupMember,
  getGroup,
  getGroups,
  getConfession,
  getConfessions,
  recordConfession
}
