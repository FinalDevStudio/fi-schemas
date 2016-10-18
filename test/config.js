'use strict';

const path = require('path');

module.exports = {

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  debug: console.log,

  arguments: [
    'A default text'
  ]

};
