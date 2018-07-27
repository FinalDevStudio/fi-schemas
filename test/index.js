'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');

const DATABASE = 'fi-schemas-test';
const CONFIG = require('./config');

const DATA = {
  genders: [],
  roles: []
};

mongoose.Promise = Promise;

describe('Fi Schemas', function() {
  let schemas;

  before(function(done) {
    schemas = require('..');

    const options = {
      useNewUrlParser: true
      // useMongoClient: true
    };

    mongoose
      .connect(
        `mongodb://localhost:27017/${DATABASE}`,
        options
      )
      .then(() => {
        console.log(`Mongoose connected to "${DATABASE}"...\n`);
        done();
      })

      .catch(done);
  });

  it('should be a object', function() {
    expect(schemas).to.be.an('object');
  });

  it('should have a configure method', function() {
    expect(schemas.configure).to.be.a('function');
  });

  it('should have a load method', function() {
    expect(schemas.load).to.be.a('function');
  });

  it('should have a partial method', function() {
    expect(schemas.partial).to.be.a('function');
  });

  /**
   * Configure method.
   */
  describe('configure', function() {
    before(function() {
      delete require.cache[require.resolve('..')];
      schemas = require('..');
      mongoose.models = {};
    });

    it('should throw if config is not set', function() {
      expect(schemas.configure).to.throw();
    });

    it('should throw if config is not an object', function() {
      expect(schemas.configure.bind(null, 1234)).to.throw();
    });

    it('should throw if config.basedir is not a set', function() {
      expect(schemas.configure.bind(null, {})).to.throw();
    });

    it('should throw if config.basedir is not a string', function() {
      expect(
        schemas.configure.bind(null, {
          basedir: 1234
        })
      ).to.throw();
    });

    it('should succeed with a proper configuration object', function() {
      expect(schemas.configure.bind(null, CONFIG)).to.not.throw();
    });
  });

  /**
   * Load method.
   */
  describe('load', function() {
    before(function() {
      delete require.cache[require.resolve('..')];
      schemas = require('..');
      mongoose.models = {};
    });

    it('should reject if config is not set and not configured', function(done) {
      schemas
        .load()
        .then(() => {
          done(new Error("This shouldn't be called!"));
        })
        .catch(err => {
          expect(err).to.be.an('error');
          done();
        });
    });

    it('should reject if config is not an object and not configured', function(done) {
      schemas
        .load(1234)
        .then(() => {
          done(new Error("This shouldn't be called!"));
        })
        .catch(err => {
          expect(err).to.be.an('error');
          done();
        });
    });

    it('should reject if config.basedir is not a set', function(done) {
      schemas
        .load({})
        .then(() => {
          done(new Error("This shouldn't be called!"));
        })
        .catch(err => {
          expect(err).to.be.an('error');
          done();
        });
    });

    it('should reject if config.basedir is not a string', function(done) {
      schemas
        .load({
          basedir: true
        })
        .then(() => {
          done(new Error("This shouldn't be called!"));
        })
        .catch(err => {
          expect(err).to.be.an('error');
          done();
        });
    });

    it('should load schemas with a proper configuration object', function(done) {
      schemas
        .load(CONFIG)
        .then(() => {
          expect(mongoose.models).to.be.an('object');
          expect(mongoose.models).to.not.be.empty;

          done();
        })
        .catch(done);
    });

    it('should load the schemas into a model using the relative path as the schema name', function() {
      expect(mongoose.model('user')).to.be.a('function');
      expect(mongoose.model('post')).to.be.a('function');
    });

    it('should load folders and replace slashes with dots', function() {
      expect(mongoose.model('static.gender')).to.be.a('function');
      expect(mongoose.model('static.role')).to.be.a('function');
      expect(mongoose.model('post.comment')).to.be.a('function');
    });

    it("should load schemas in sub folders named as index as the parent folder's name", function(done) {
      const models = mongoose.modelNames();

      expect(models.indexOf('index')).to.equal(-1);
      expect(models.indexOf('post')).to.be.gte(0);

      done();
    });

    it("should load schemas in sub folders using the parent folder's name and file name concatenated by a dot", function(done) {
      const models = mongoose.modelNames();

      expect(models.indexOf('post.comment')).to.be.gte(0);

      done();
    });

    it('should not load partials', function() {
      expect(Object.keys(mongoose.models).length).to.equal(5);
    });
  });

  /**
   * Partial method.
   */
  describe('partial', function() {
    before(function() {
      delete require.cache[require.resolve('..')];
      schemas = require('..');
      mongoose.models = {};
    });

    it('should throw if not configured', function() {
      expect(schemas.partial).to.throw();
    });

    it('should load a partial (as object) if configured', function() {
      expect(schemas.configure.bind(null, CONFIG)).to.not.throw();

      expect(schemas.partial('user'))
        .to.be.an('object')
        .that.has.keys('name', 'email');

      expect(schemas.partial('static'))
        .to.be.an('object')
        .that.has.keys('name', 'slug');
    });

    it('should load a partial (as function) if configured', function() {
      expect(schemas.configure.bind(null, CONFIG)).to.not.throw();

      expect(schemas.partial('user.fn'))
        .to.be.an('object')
        .that.has.keys('name', 'email');

      expect(schemas.partial('static.fn'))
        .to.be.an('object')
        .that.has.keys('name', 'slug');
    });
  });

  /**
   * General usage.
   */
  describe('usage', function() {
    before(function() {
      delete require.cache[require.resolve('..')];
      schemas = require('..');
      mongoose.models = {};
    });

    it('should self configure and load all schemas in the basedir folder', function(done) {
      schemas
        .load(CONFIG)
        .then(done)
        .catch(done);
    });

    it("mongoose should be able to create a new static.role document from it's registered schema", function(done) {
      const Role = mongoose.model('static.role');

      const data = {
        name: 'Administrator',
        slug: 'admin'
      };

      Role.create(data)

        .then(role => {
          expect(role).to.be.an('object');
          expect(role.name).to.equal('Administrator');
          expect(role.slug).to.equal('admin');

          DATA.roles.push(role);

          done();
        })

        .catch(done);
    });

    it("mongoose should be able to create a new static.gender document from it's registered schema", function(done) {
      const Gender = mongoose.model('static.gender');
      const data = {
        name: 'Female',
        slug: 'female'
      };

      Gender.create(data)

        .then(gender => {
          expect(gender).to.be.an('object');
          expect(gender.name).to.equal('Female');
          expect(gender.slug).to.equal('female');

          DATA.genders.push(gender);

          done();
        })

        .catch(done);
    });

    it("mongoose should be able to create a new user document from it's registered schema", function(done) {
      const User = mongoose.model('user');
      const data = {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        gender: DATA.genders[0]._id,
        role: DATA.roles[0]._id
      };

      User.create(data)

        .then(user => {
          expect(user).to.be.an('object');
          expect(user.name).to.equal('Jane Smith');
          expect(user.email).to.equal('jane.smith@example.com');
          expect(user.role).to.equal(DATA.roles[0]._id);
          expect(user.gender).to.equal(DATA.genders[0]._id);

          done();
        })

        .catch(done);
    });

    it('should pass the config.arguments values to the schema', function(done) {
      const User = mongoose.model('user');

      User.findOne()
        .where('email')
        .equals('jane.smith@example.com')

        .populate('gender')

        .populate('role')

        .then(user => {
          expect(user).to.be.an('object');
          expect(user.text).to.equal(CONFIG.arguments[1]);
          expect(user.gender).to.be.an('object');
          expect(user.gender.name).to.equal('Female');
          expect(user.gender.slug).to.equal('female');
          expect(user.gender._id.equals(DATA.genders[0]._id)).to.be.true;
          expect(user.role).to.be.an('object');
          expect(user.role.name).to.equal('Administrator');
          expect(user.role.slug).to.equal('admin');
          expect(user.role._id.equals(DATA.roles[0]._id)).to.be.true;

          done();
        })

        .catch(done);
    });
  });

  after(function(done) {
    mongoose.connection.db
      .dropDatabase()

      .then(() => {
        console.log(`\nDropped "${DATABASE}" database...`);
        return mongoose.disconnect();
      })

      .then(() => {
        console.log('\nMongoose disconnected.');
        done();
      })

      .catch(done);
  });
});
