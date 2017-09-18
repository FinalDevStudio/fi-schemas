'use strict';

module.exports = (Schema, options) => {

  const schema = new Schema({

    body: {
      type: String,
      required: true
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: 'post'
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    }

  }, options);

  return schema;

};
