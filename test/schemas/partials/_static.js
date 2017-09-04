'use strict';

module.exports = Schema => new Schema({

  slug: {
    type: String,
    required: true,
    unique: true
  },

  name: String

});
