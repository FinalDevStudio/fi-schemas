# Fi Schemas
Mongoose's schema loader for Node.js Express apps

## Installing

```
npm install --save fi-schemas
```

## Usage

```js
var schemas = require('fi-schemas');
```

### Initialization
This component only exports a `Function` and you must call it with your **mongoose** instance and a configuration `Object` after intializing **mongoose**:

```js
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/your-database-name');

mongoose.connection.on('error', function (err) {
  throw err;
});

mongoose.connection.once('open', function () {

  schemas(mongoose, config);

});
```

### Configuration
An `Object` with the following parameters:
- **basedir**: This is required and must be a `String`. This is the absolute path where the schemas are located.
- **arguments**: This is optional and must be an `Array` to apply to each schema exports right after the default `mongoose.Schema` argument.
- **debug**: This is optional and can be a `Function` to log into or a `Boolean`. If `true` it will use `console.log`.

### Schemas
The schema files inside your `config.basedir` defined folder must export a `Function` that returns the compiled mongoose Schema or model. In short, they should be like this:

```js
module.exports = function (Schema) {

  var schema = new Schema({

    name: {
      first: String,
      last: String
    }

  });

  schema.virtual('name.full').get(function () {
    return this.name.first + this.name.last;
  });

  return schema;

};
```

The first parameter will always be `mongoose.Schema` so you can create your schema. The rest of the parameters will be the ones you define in the `config.arguments` `Array`:

```js
config.arguments = [
  /* Second argument */
  'A string',

  /* Third argument */
  function aFunction() {
    //...
  }

  /* And so on... */
];
```

Will be passed as:

```js
/* mongoose.Schema will always be the first argument */
module.exports = function (Schema, aString, aFunction) {

  var schema = new Schema({

    //...

  });

  return schema;

};
```

The schema names will be generated from their name relative to the `config.basedir` defined folder and the slashes will be replaced with dots. So, if `config.basedir` equals to `/app/schemas` then the Mongoose model and mongo table names will be as follows:

File Path                         | Model Name
--------------------------------- | -----------------
/app/schemas/user.js              | user
/app/schemas/static/data/chart.js | static.data.chart

### Example configuration

```js
{

  debug: require('debug')('app:schemas'),

  basedir: path.normalize(path.join(__dirname, 'schemas')),

  arguments: [
    /* Here you can put a function that you will use in all of your schemas */
    function () {
      //...
    },

    /* And a constant */
    'This is a very important string',

    /* Or anything else */
    [1, 2, 3, 4],

    {
      prop: 'value'
    }
  ]

}
```
