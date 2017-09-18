module.exports = {

  extends: '../.eslintrc.js',

  root: false,

  parserOptions: {
    sourceType: 'module'
  },

  env: {
    mocha: true,
    node: true,
    es6: true
  }

}
