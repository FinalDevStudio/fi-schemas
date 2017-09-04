# Fi Schemas [![Build Status](https://travis-ci.org/FinalDevStudio/fi-schemas.svg?branch=master)](https://travis-ci.org/FinalDevStudio/fi-schemas)

Mongoose schema loader for Node.js applications.


## Installing

```sh
npm install --save fi-schemas
```


## Usage

```js
const schemas = require('fi-schemas');
```


### Initialization

This module exports a `Function` that resturns a `Promise` and you must call it with a configuration `Object` after intializing and connecting **Mongoose**:

```js
const mongoose = require('mongoose');

const options = {
  useMongoClient: true
};

mongoose.connect('mongodb://localhost/your-database-name', options);

  .then(() => schemas(config))

  .then(() => {
    console.log('Schemas registered!');

    mongoose.model('you-model-name-here');
  })

  .catch(err => {
    throw err;
  });
```


### Configuration

An `Object` with the following parameters:
- **basedir**: This is required and must be a `String`. This must be the path where the schemas are located.
- **arguments**: This is optional and can be an `Array` to apply to each schema exported function arguments right after the default `mongoose.Schema` argument.
- **debug**: This is optional and can be a `Function` to log with or a `Boolean`. If `true` it will use `console.log`.


### Schemas

The schema files inside your `config.basedir` folder must export a `Function` that returns the compiled **Mongoose** Schema. In short, they should be like this:

```js
module.exports = Schema => {

  const schema = new Schema({

    name: {
      first: String,
      last: String
    }

  });

  schema.virtual('name.full').get(() => this.name.first + this.name.last);

  return schema;

};
```

The first parameter will always be `mongoose.Schema` so you can create your schema. The rest of the parameters will be the ones you define in the `config.arguments` `Array`.

#### Example

```js
const config = {
  arguments = [
    /* Second argument */
    'A string',

    /* Third argument */
    function aFunction() {
      //...
    }
  ]
};
```

Will be passed as:

```js
/* mongoose.Schema will always be the first argument */
module.exports = (Schema, aString, aFunction) => {

  const schema = new Schema({

    //...

  });

  return schema;

};
```


### Partials

If a schema name starts with underscore (_) it will be treated as a partial and won't be registered as a model. This is useful if you have shared objects between your schemas so you can require them freely without having garbage collections.


### Naming

The schema names will be generated from their name relative to the `config.basedir` defined folder and the slashes will be replaced with dots. So, if `config.basedir` equals to `/app/schemas` then the Mongoose model and mongo collection names will be as follows:

File Path                           | Model Name          | Collection name
----------------------------------- | ------------------- | ----------------------
`/app/schemas/_shared.js`           | Ignored             | Ignored
`/app/schemas/user.js`              | `user`              | `users`
`/app/schemas/post/index.js`        | `post`              | `posts`
`/app/schemas/post/comment.js`      | `post.comment`      | `posts.comments`
`/app/schemas/static/data/chart.js` | `static.data.chart` | `statics.datas.charts`
`/app/schemas/static/gender.js`     | `static.gender`     | `statics.genders`

This is done in order to maintain concistency and provide an easy way of grouping your schemas and collection names.


### Example configuration

```js
'use strict';

const CONST_STRING = 'This is a very important string';

/**
 * Function used in all schemas.
 */
function aFunction() {
  //...
}

module.exports = {

  debug: require('debug')('app:schemas'),

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  arguments: [
    /* Here you can reference or declare a function that you will use in all of
     * your schemas... */
    aFunction,

    /* ... add constant string or value... */
    CONST_STRING,

    /* .. you can also declare in-place, of course... */
    'Another string',

    /* ... or an array... */
    [1, 2, 3, 4],

    /* ... or an object, etc. */
    {
      prop: 'value'
    }
  ]

};
```
