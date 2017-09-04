'use strict';

module.exports = Schema => {

  const schema = new Schema({

    title: {
      type: String,
      required: true
    },

    body: {
      type: String,
      required: true,
      unique: true
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
