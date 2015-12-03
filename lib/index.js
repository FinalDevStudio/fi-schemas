'use strict';

var walk = require('walk');
var path = require('path');
var is = require('is_js');

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

  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (config.debug, Boolean) {
    debug = console.log;
  }

  if (is.not.string(config.basedir)) {
    throw new Error("Config's basedir must be a [String]!");
  }

  if (is.not.array(config.arguments)) {
    config.arguments = [];
  }

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
        console.dir(stats);
        throw new Error("Could not compile schemas!");
      }
    }
  });
};
