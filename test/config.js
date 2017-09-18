'use strict';

const path = require('path');

const OPTIONS = {

  timestamps: true

};

module.exports = {

  partialsdir: path.normalize(path.join(__dirname, 'schemas', 'partials')),

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  arguments: [OPTIONS, 'A default text'],

  debug: false

};
