# Fi Schemas [![Build Status](https://travis-ci.org/FinalDevStudio/fi-schemas.svg?branch=master)](https://travis-ci.org/FinalDevStudio/fi-schemas)

Mongoose schema loader for Node.js applications.


## Installing

```sh
npm install --save fi-schemas
```


## Usage

```js
const schemas = require('fi-schemas');

schemas.load(config).then(/* ... */)
```


### Initialization

This module exports a `Function` that resturns a `Promise` and you must call it with a configuration `Object` after intializing and connecting **Mongoose**:

```js
const mongoose = require('mongoose');

const options = {
  useMongoClient: true
};

mongoose.connect('mongodb://localhost/your-database-name', options);

  .then(() => schemas.load(config)) // Configures self and loads schemas

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

| Param | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `basedir` | `String` | Yes | `undefined` | This must be the path where the schemas are located. |
| `partialsdir` | `String` | No | `undefined` | This must be the path where the schema partials are located. |
| `arguments` | `Array` | No | `[]` | This are the arguments to apply to each schema exported function arguments right after the default `mongoose.Schema` argument. |
| `debug` | `Boolean\|Function` | No | `[]` | Can be a `Function` to log with or a `Boolean`. If `true` it will use `console.log`. |


### Schemas

The schema files inside your `config.basedir` folder must export a `Function` that returns the compiled **Mongoose** Schema. In short, they should be like this:

```js
'use strict';

const schemas = require('fi-schemas');

module.exports = (Schema) => {

  const schema = new Schema(schemas.partial('user'));

  schema.add({

    roles: {
      type: String,
      enum: ['ROLE.ADMIN', 'ROLE.USER']
    }

  });

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

Any `.js` file inside the `partialsdir` path will be ignored and won't be registered as a model. This is useful if you have shared objects between your schemas so you can require them freely without having duplicate collections on your database.

You can export anything that you found useful from this modules, usually, objects.


### Naming

The schema names will be generated from their name relative to the `config.basedir` defined folder and the slashes will be replaced with dots. So, if `config.basedir` equals to `/app/schemas` and `config.partialsdir` equals to `/app/schemas/partials` then the Mongoose model and mongo collection names will be as follows:

File Path                           | Model Name          | Collection name
----------------------------------- | ------------------- | ----------------------
`/app/schemas/partials/shared.js`   | Ignored             | Ignored
`/app/schemas/partials/user.js`     | Ignored             | Ignored
`/app/schemas/user.js`              | `user`              | `users`
`/app/schemas/post/index.js`        | `post`              | `posts`
`/app/schemas/post/comment.js`      | `post.comment`      | `posts.comments`
`/app/schemas/static/data/chart.js` | `static.data.chart` | `statics.datas.charts`
`/app/schemas/static/gender.js`     | `static.gender`     | `statics.genders`

This is done in order to maintain concistency and provide an easy way of grouping your schemas and collection names.


### Example configuration

```js
'use strict';

module.exports = {

  debug: require('debug')('app:schemas'),

  partialsdir: path.normalize(path.join(__dirname, 'schemas', 'partials')),

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  // Here you can set a default options object to use in all of your schemas...
  arguments: [{

    timestamps: true

  }]

};
```


# API

The module provides the following methods:

| Method | Arguments | Description |
| --- | --- | --- |
| `configure` | `config` | This method is used to configure the module. It's also used internally by `load` if not previously configured. |
| `load` | `config` | This method is used to configure the module and load the schemas inside `config.basedir` folder. |
| `partial` | `name` | The partial's name to load. It will be loaded relative to the `config.partialsdir` folder. |
