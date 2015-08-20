# fi-seed-component-schemas
Fi Seed's Schemas component

## Installing

```
npm install --save fi-seed-component-schemas
```

## Usage
### Use on fi-seed

```js
var schemas = component('schemas');
```

### Use on Express/Node app

```js
var schemas = require('fi-seed-component-schemas');
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

  schemas(mongoose, {
    basedir: path.normalize(path.join(__dirname, 'schemas')),
    arguments: [],
    debug: true
  });

});
```

### Configuration
An `Object` with the following parameters:
- **basedir**: This is required and must be a `string`. This is the absolute path where the schemas are located.
- **arguments**: This is optional and must be an `Array` to apply to each schema exports right after the default `mongoose.Schema` argument.
- **debug**: This is optional and can be a `Function` to log into or a `Boolean`. If `true` it will use `console.log`.

### Schemas
The schema files inside your `config.basedir` folder must export a `Function` that returns the compiled mongoose Schema or model. In short, they should be like this:

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

The first parameter will always be `mongoose.Schema` so you can create your schema. The rest of the parameters will be the ones you define in `config.arguments` array:

```js
config.arguments = [
  'This is the string',

  function () {
    //...
  }
];
```

Will be passed as:

```js
module.exports = function (Schema, theString, theFunction) {

  var schema = new Schema({

    //...

  });

  return schema;

};
```

The schema names will be generated from their name relative to the `config.basedir` folder and the slashes will be replaced with dots. So, if `config.basedir` equals to `/app/schemas` then the mongoose's model names will be as follows:

File Path                         | Model Name
--------------------------------- | -----------------
/app/schemas/user.js              | user
/app/schemas/static/data/chart.js | static.data.chart
