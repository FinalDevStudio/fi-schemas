'use strict';

const schemas = require('../../lib');

module.exports = (Schema, options, text) => {

  const schema = new Schema(schemas.partial('user'), options);

  schema.add({

    gender: {
      type: Schema.Types.ObjectId,
      ref: 'static.gender',
      required: true
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: 'static.role',
      required: true
    }

  });

  schema.virtual('text').get(() => text);

  return schema;

};
