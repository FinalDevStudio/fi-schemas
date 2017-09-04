'use strict';

const path = require('path');

module.exports = {

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  debug: true,

  arguments: [
    'A default text'
  ]

};
