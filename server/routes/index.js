const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const router = express.Router();
const jsonParser = bodyParser.json()

router.get('/confessions/*', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/confessions', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/groups/*', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/groups', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/polls/*', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/polls', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});
router.get('/', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.redirect(url.parse(req.url).pathname);
  } else {
    res.sendFile(path.join(__dirname + '/../../public/index.html'));
  }
});

module.exports = {
  router
};
