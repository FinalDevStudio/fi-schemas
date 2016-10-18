'use strict';

const walk = require('walk');
const path = require('path');
const is = require('fi-is');

const ERR_CONFIG_BASEDIR = 'Config\'s basedir must be a [String]!';
const ERR_UNKNOWN = 'Could not compile schemas!';

const NAME_REGEX = /^\.?(.+)\.?$/gm;
const DOT_REGEX = /[\\\/\.]+/gm;
const NAME_REPLACE = '$1';
const DOT_REPLACE = '.';
const UNDER = '_';

const JS = '.js';

var debug = function () {};

function getRelativeName(root, basedir, name) {
  return path.normalize(path.join(root, path.basename(name, JS)).replace(basedir, ''));
}

function getName(root, basedir, name) {
  return getRelativeName(root, basedir, name)
    .replace(DOT_REGEX, DOT_REPLACE)
    .replace(NAME_REGEX, NAME_REPLACE);
}

function getPath(root, name) {
  return path.normalize(path.join(root, name));
}

/* Exports */
module.exports = (mongoose, config) => {

  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (config.debug, Boolean) {
    debug = console.log;
  }

  if (is.not.string(config.basedir)) {
    throw new Error(ERR_CONFIG_BASEDIR);
  }

  if (is.not.array(config.arguments)) {
    config.arguments = [];
  }

  walk.walkSync(config.basedir, {
    listeners: {
      file: (root, stats) => {
        var isPartial = is.startWith(stats.name, UNDER);
        var isJs = path.extname(stats.name) === JS;

        if (!isPartial && isJs) {
          /* Generate schema name */
          var name = getName(root, config.basedir, stats.name);
          /* Get the schema path */
          var filepath = getPath(root, stats.name);

          /* Build the controller */
          var schema = require(filepath).apply(null, [mongoose.Schema].concat(config.arguments));

          /* Declare route */
          mongoose.model(name, schema);

          debug(`${ name } --> ${ filepath }`);
        }
      },

      errors: (root, stats) => {
        console.dir(stats);
        throw new Error(ERR_UNKNOWN);
      }
    }
  });
};
