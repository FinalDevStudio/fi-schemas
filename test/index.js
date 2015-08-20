'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var schemas = require('..');
var path = require('path');

var config = require('./config');

var data = {
  roles: [],
  genders: []
};

describe('Fi Seed Schemas', function () {
  before(function (done) {
    mongoose.connect('mongodb://localhost/fi-seed-component-schemas');

    mongoose.connection.on('error', function (err) {
      throw err;
    });

    mongoose.connection.once('open', function () {
      done();
    });
  });

  it('should be a function', function () {
    expect(schemas).to.be.a('function');
  });

  it('should compile all schemas in the config.basedir folder', function () {
    schemas(mongoose, config);
  });

  it('should compile the schemas into a model using the relative path as the schema name', function () {
    expect(mongoose.model('user')).to.be.a('function');
  });

  it('should respect folders and replace slashes with dots', function () {
    expect(mongoose.model('static.gender')).to.be.a('function');
    expect(mongoose.model('static.role')).to.be.a('function');
  });

  it('mongoose should be able to create a new static.role document from it\'s registered schema', function (done) {
    var Role = mongoose.model('static.role');

    new Role({
      slug: 'admin',
      name: 'Administrator'
    }).save(function (err, role) {
      expect(err).to.be.null;
      expect(role).to.be.an('object');

      data.roles.push(role);

      done();
    });
  });

  it('mongoose should be able to create a new static.gender document from it\'s registered schema', function (done) {
    var Gender = mongoose.model('static.gender');

    new Gender({
      slug: 'male',
      name: 'Male'
    }).save(function (err, gender) {
      expect(err).to.be.null;
      expect(gender).to.be.an('object');

      data.genders.push(gender);

      done();
    });
  });

  it('mongoose should be able to create a new user document from it\'s registered schema', function (done) {
    var User = mongoose.model('user');

    new User({
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: data.roles[0]._id,
      gender: data.genders[0]._id
    }).save(function (err, role) {
      expect(err).to.be.null;
      expect(role).to.be.an('object');

      data.roles.push(role);

      done();
    });
  });

  it('should pass the config.arguments values to the schema', function (done) {
    var User = mongoose.model('user');

    User.findOne().

    where('email').equals('john.smith@example.com').

    populate('gender').
    populate('role').

    exec(function (err, user) {
      expect(err).to.be.null;
      expect(user).to.be.an('object');
      expect(user.text).to.equal(config.arguments[0]);

      done();
    });
  });

  after(function () {
    mongoose.connection.db.dropDatabase();
  });
});
