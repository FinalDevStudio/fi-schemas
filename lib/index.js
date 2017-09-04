'use strict';

const inflection = require('inflection');
const mongoose = require('mongoose');
const walk = require('walk');
const path = require('path');
const is = require('fi-is');

const ERR_CONFIG_BASEDIR = 'Config\'s basedir must be a [String]!';
const ERR_CONFIG_EMPTY = 'Config must be an [Object]!';

const NAME_REGEX = /^\.?(.+)\.?$/gm;
const INDEX_REGEX = /\/?index/gim;
const DOT_REGEX = /[\\/.]+/gm;
const INDEX_REPLACE = '';
const NAME_REPLACE = '$1';
const DOT_REPLACE = '.';
const UNDER = '_';
const JS = '.js';

let debug = function () {};

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

module.exports = config => new Promise((resolve, reject) => {
  console.log('\n');

  if (is.not.object(config)) {
    return reject(new Error(ERR_CONFIG_EMPTY));
  }

  if (is.not.string(config.basedir)) {
    return reject(new Error(ERR_CONFIG_BASEDIR));
  }

  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (is.boolean(config.debug) && config.debug) {
    debug = console.log;
  }

  if (is.not.array(config.arguments)) {
    config.arguments = [];
  }

  const walker = walk.walk(config.basedir);

  walker.on('file', (root, stats, next) => {
    const isPartial = is.startWith(stats.name, UNDER);
    const isJs = path.extname(stats.name) === JS;

    if (!isPartial && isJs) {
      /* Generate collection and model name */
      const name = getSchemaName(root, config.basedir, stats.name);
      const collection = getCollectionName(name);

      /* Get the schema path */
      const filepath = getFilePath(root, stats.name);

      /* Build the schema */
      const args = [mongoose.Schema].concat(config.arguments);
      const schema = require(filepath).apply(null, args);

      /* Register Mongoose schema */
      debug(`Registered model "${ name }" --> [${ collection }] (${ filepath })`);

      mongoose.model(name, schema, collection);
    }

    next();
  });

  walker.once('errors', (root, stats, next) => {
    debug('Schema error:', root, stats);
    next();
  });

  walker.once('end', () => {
    console.log('');
    resolve();
  });
});
