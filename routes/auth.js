'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();
const options = { sessions: false, failWithError: true };

const localAuth = passport.authenticate('local', options);

router.post('/', localAuth, (req, res) => {
    return req.json(req.user);
});

module.exports = router;