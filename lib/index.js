'use strict';

const inflection = require('inflection');
const mongoose = require('mongoose');
const walk = require('walk');
const path = require('path');
const is = require('fi-is');

const ERR_CONFIG_BASEDIR = "Config's basedir must be a String!";
const ERR_PARTIALS_DIR = 'Configure partials dir first!';
const ERR_CONFIG_EMPTY = 'Config must be an Object!';
const ERR_PARTIAL_NAME = 'PArtial name must be a String!';
const ERR_CONFIGURE = 'Run configure first!';

const NAME_REGEX = /^\.?(.+)\.?$/gm;
const INDEX_REGEX = /\/?index/gim;
const DOT_REGEX = /[\\/.]+/gm;
const INDEX_REPLACE = '';
const NAME_REPLACE = '$1';
const DOT_REPLACE = '.';
const JS = '.js';

const defaults = {
  basedir: null,
  arguments: []
};

let configured = false;
let debug = () => {};

/**
 * Gets the schema's relative name.
 *
 * @param {String} root The schema's root folder.
 * @param {String} basedir The schemas base dir.
 * @param {String} name The schema name.
 *
 * @returns {String} The schema's relative name.
 */
function getRelativeName(root, basedir, name) {
  const joined = path.join(root, path.basename(name, JS));
  return path.normalize(joined.replace(basedir, ''));
}

/**
 * Gets the schema's name.
 *
 * @param {String} root The schema's root folder.
 * @param {String} basedir The schemas base dir.
 * @param {String} name The schema's name.
 *
 * @returns {String} The schema's name.
 */
function getSchemaName(root, basedir, name) {
  return getRelativeName(root, basedir, name)
    .replace(INDEX_REGEX, INDEX_REPLACE)
    .replace(DOT_REGEX, DOT_REPLACE)
    .replace(NAME_REGEX, NAME_REPLACE);
}

/**
 * Generates the collection's name.
 *
 * @param {String} name The model's name.
 *
 * @returns {String} The collection's name.
 */
function getCollectionName(name) {
  let colname = name.split(DOT_REPLACE);

  for (let i = 0, l = colname.length; i < l; i++) {
    colname[i] = inflection.pluralize(colname[i]);
  }

  return colname.join(DOT_REPLACE);
}

/**
 * Gets the schema file path.
 *
 * @param {String} root The schema's root path.
 * @param {String} name The schema's name.
 *
 * @returns {String} The schema's file path.
 */
function getFilePath(root, name) {
  return path.normalize(path.join(root, name));
}

/**
 * Configures the module.
 *
 * @param {Object} config The configuration object.
 *
 * @throws {Error} Configuration error.
 */
function configure(config) {
  if (is.not.object(config)) {
    throw new Error(ERR_CONFIG_EMPTY);
  }

  if (is.not.string(config.basedir)) {
    throw new Error(ERR_CONFIG_BASEDIR);
  }

  defaults.basedir = config.basedir;

  if (is.string(config.partialsdir)) {
    defaults.partialsdir = config.partialsdir;
  }

  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (is.boolean(config.debug) && config.debug) {
    debug = console.log;
  }

  if (is.array(config.arguments)) {
    defaults.arguments = defaults.arguments.concat(config.arguments);
  }

  configured = true;
}

/**
 * Loads schemas.
 *
 * @param {Object} config Configuration object.
 *
 * @returns {Promise} The schema load promise.
 */
function load(config) {
  return new Promise(resolve => {
    if (!configured) {
      configure(config);
    }

    const walker = walk.walk(defaults.basedir);

    walker.on('file', (root, stats, next) => {
      const isPartial =
        path.normalize(path.resolve(root)).indexOf(path.normalize(path.resolve(defaults.partialsdir))) !== -1;

      if (isPartial || path.extname(stats.name) !== JS) {
        return next();
      }

      /* Generate collection and model name */
      const name = getSchemaName(root, defaults.basedir, stats.name);
      const collection = getCollectionName(name);

      /* Get the schema path */
      const filepath = getFilePath(root, stats.name);

      debug(`Building schema "${name}" (${filepath})`);

      /* Build the schema */
      const args = [mongoose.Schema].concat(defaults.arguments);
      const schema = require(filepath).apply(null, args);

      /* Register Mongoose schema */
      debug(`Registering model "${name}" [${collection}]`);

      mongoose.model(name, schema, collection);

      next();
    });

    walker.once('errors', (root, stats, next) => {
      debug('Schema error:', root, stats);
      next();
    });

    walker.once('end', resolve);
  });
}

/**
 * Loads a partial.
 *
 * @param {Object} name Configuration object.
 *
 * @returns {Mixed} The required partial's content.
 *
 * @throws {Error} Configuration error.
 */
function partial(name) {
  if (!configured) {
    throw new Error(ERR_CONFIGURE);
  }

  if (is.not.string(defaults.partialsdir)) {
    throw new Error(ERR_PARTIALS_DIR);
  }

  if (is.not.string(name)) {
    throw new Error(ERR_PARTIAL_NAME);
  }

  const basename = path.basename(name);
  const dirname = path.dirname(name);

  const partial = path.normalize(path.resolve(path.join(defaults.partialsdir, dirname, basename + '.js')));

  const data = require(partial);

  if (is.function(data)) {
    return data();
  }

  return data;
}

/**
 * Fi Schemas.
 */
module.exports = {
  configure,
  partial,
  load
};
