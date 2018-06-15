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

    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
            .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function() {
        return Promise.all([
            User.insertMany(seedUsers),
            User.createIndexes
        ]);
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('POST /api/login',  function(){
        it('should return a token when given valid credentials', function() {
            return User.findOne()
                .then (res => {
                    const user = { 
                        username: res.username,
                        password: 'basketball'
                    };

                    return chai.request(app)
                        .post('/api/login')
                        .send(user);
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.all.keys('authToken');
                    expect(res.body.authToken).to.be.a('string');
                });
        });

        it('should return status 400 for missing credentials', () => {
            return chai.request(app).post('/api/login').send({})
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal('Bad Request');
                    expect(res.body.name).to.equal('AuthenticationError');
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