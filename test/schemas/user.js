'use strict';

module.exports = function (Schema, text) {

  var schema = new Schema({

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

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

  }, {

    timestamps: true

  });

  schema.virtual('text').get(function () {
    return text;
  });

  return schema;

};
