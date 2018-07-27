'use strict';

const path = require('path');

const options = {
  timestamps: true
};

module.exports = {
  partialsdir: path.normalize(path.join(__dirname, 'schemas', 'partials')),
  basedir: path.normalize(path.join(__dirname, 'schemas')),
  arguments: [options, 'A default text'],
  debug: false
};
