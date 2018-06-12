'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();
const options = { session: false, failWithError: true };

const localAuth = passport.authenticate('local', options);

router.post('/api/login', localAuth, (req, res) => {
    console.log('in the login');
    return res.json(req.user);
});

module.exports = router;