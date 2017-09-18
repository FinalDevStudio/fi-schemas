'use strict';

const schemas = require('../../../lib');

module.exports = (Schema) => {

  return new Schema(schemas.partial('static'));

};
