'use strict';

module.exports = Schema => {

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

  }, {

    timestamps: true

  });

  return schema;

};
