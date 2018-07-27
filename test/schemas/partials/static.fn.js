'use strict';

module.exports = () => ({
  slug: {
    type: String,
    required: true,
    unique: true
  },

  name: String
});
