'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');
const app = require('../server');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const seedUsers = require('../db/seed/users');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Noteful API - Login', function(){

    let token;
    const _id = '333333333333333333333333';
    const fullname = 'Example User';
    const username = 'exampleUser';
    const password = 'examplePassword';

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
            .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return User.hashPassword(password)
            .then(digest => User.create({
                _id,
                fullname,
                username,
                password: digest
            }));
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('POST /api/login',  function(){
        it('should return a token when given valid credentials', function() {
            return chai.request(app)
                .post('/api/login')
                .send({ username, password })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.authToken).to.be.a('string');

                    const payload = jwt.verify(res.body.authToken, JWT_SECRET);

                    expect(payload.user).to.not.have.property('password');
                    expect(payload.user.id).to.equal(_id);
                    expect(payload.user.username).to.deep.equal(username);
                });
        });

        it('should reject requests without credentials', () => {
            return chai.request(app)
                .post('/api/login')
                .send({})
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal('Bad Request');
                    expect(res.body.name).to.equal('AuthenticationError');
                });
        });

        it('Should reject requests with empty string username', function () {
            return chai.request(app)
                .post('/api/login')
                .send({ username: '', password })
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal('Bad Request');
                });
        });

        it('Should reject requests with empty string password', function () {
            return chai.request(app)
                .post('/api/login')
                .send({ username, password: '' })
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal('Bad Request');
                });
        });

        it('should respond with a 401 for a invalid credentials', function() {
            return chai.request(app)
                .post('/api/login')
                .send({ username: 'testuser', password: 'notpassword'})
                .then(res => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal('Unauthorized');
                    expect(res.body.name).to.equal('AuthenticationError');
                });
        });


    });

});