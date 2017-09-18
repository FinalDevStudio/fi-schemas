module.exports = {

  extends: 'eslint:recommended',

  root: true,

  parserOptions: {
    sourceType: 'module'
  },

  env: {
    node: true,
    es6: true
  },

  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'generator-star-spacing': 0,
    'no-console': 'off',
    'require-jsdoc': 'warn',
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error'],
    'arrow-parens': ['error'],
    'valid-jsdoc': ['warn', {
      'requireReturn': false,
      'prefer': {
        'return': 'returns'
      }
    }]
  }

}
