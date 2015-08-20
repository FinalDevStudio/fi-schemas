'use strict';

var type = require('type-of-is');
var walk = require('walk');
var path = require('path');

var debug = function () {};

function getRelativeName(root, basedir, name) {
  return path.normalize(path.join(root, path.basename(name, '.js')).replace(basedir, ''));
}

function getName(root, basedir, name) {
  return getRelativeName(root, basedir, name).
  replace(/[\\\/\.]+/gm, '.').
  replace(/^\.?(.+)\.?$/gm, '$1');
}

function getPath(root, name) {
  return path.normalize(path.join(root, name));
}

/* Exports */
module.exports = function (mongoose, config) {

  if (type.is(config.debug, Function)) {
    debug = config.debug;
  } else if (type.is(config.debug, Boolean) && config.debug) {
    debug = console.log;
  }

  if (!type.is(config.basedir, String)) {
    throw new Error("Config's basedir cannot be empty!");
  }

  config.arguments = config.arguments || [];

  walk.walkSync(config.basedir, {
    listeners: {
      file: function (root, stats) {
        if (path.extname(stats.name) === '.js') {
          /* Generate schema name */
          var name = getName(root, config.basedir, stats.name);
          /* Get the schema path */
          var filepath = getPath(root, stats.name);

          /* Build the controller */
          var schema = require(filepath).apply(this, [mongoose.Schema].concat(config.arguments));

          /* Declare route */
          mongoose.model(name, schema);

          debug(name + " --> " + filepath);
        }
      },

      errors: function (root, stats) {
        debug("Could not compile schemas!");
        debug(stats);
      }
    }
  });
};
