'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
const schemas = require('..');

const config = require('./config');

const data = {
  roles: [],
  genders: []
};

mongoose.Promise = Promise;

describe('Fi Seed Schemas', function () {
  before(function (done) {
    mongoose.connect('mongodb://localhost/fi-schemas-test')
      .then(done).catch(done);
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

    Role.create({
      name: 'Administrator',
      slug: 'admin'
    })

    .then((role) => {
      expect(role).to.be.an('object');
      expect(role.name).to.equal('Administrator');
      expect(role.slug).to.equal('admin');

      data.roles.push(role);

      done();
    })

    .catch(done);
  });

  it('mongoose should be able to create a new static.gender document from it\'s registered schema', function (done) {
    var Gender = mongoose.model('static.gender');

    Gender.create({
      name: 'Female',
      slug: 'female'
    })

    .then((gender) => {
      expect(gender).to.be.an('object');
      expect(gender.name).to.equal('Female');
      expect(gender.slug).to.equal('female');

      data.genders.push(gender);

      done();
    })

    .catch(done);
  });

  it('mongoose should be able to create a new user document from it\'s registered schema', function (done) {
    var User = mongoose.model('user');

    User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: data.roles[0]._id,
      gender: data.genders[0]._id
    })

    .then(function (user) {
      expect(user).to.be.an('object');
      expect(user.name).to.equal('Jane Smith');
      expect(user.email).to.equal('jane.smith@example.com');
      expect(user.role).to.equal(data.roles[0]._id);
      expect(user.gender).to.equal(data.genders[0]._id);

      done();
    })

    .catch(done);
  });

  it('should pass the config.arguments values to the schema', function (done) {
    var User = mongoose.model('user');

    User.findOne()
      .where('email').equals('jane.smith@example.com')

    .populate('gender')

    .populate('role')

    .then((user) => {
      expect(user).to.be.an('object');
      expect(user.text).to.equal(config.arguments[0]);
      expect(user.gender).to.be.an('object');
      expect(user.gender.name).to.equal('Female');
      expect(user.gender.slug).to.equal('female');
      expect(user.gender._id.equals(data.genders[0]._id)).to.be.true;
      expect(user.role).to.be.an('object');
      expect(user.role.name).to.equal('Administrator');
      expect(user.role.slug).to.equal('admin');
      expect(user.role._id.equals(data.roles[0]._id)).to.be.true;

      done();
    })

    .catch(done);
  });

  it('should not register partial schemas', function (done) {
    var models = mongoose.modelNames();

    expect(models.length).to.equal(3);
    expect(models.indexOf('partials._static')).to.equal(-1);

    done();
  });

  after(function () {
    mongoose.connection.db.dropDatabase();
  });
});
