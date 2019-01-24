# protobuf-to-joi

## Installation

```
npm install @shoaltogether/protobuf-to-joi
```

## Usage

### Basic

```
const fs = require('fs');
const protobufToJoi = require('protobuf-to-joi');

const proto = fs.readFileSync('./test.proto');

const joiSchemas = protobufToJoi(proto);
```

### With 'empty' values

See https://github.com/hapijs/joi/blob/master/API.md#anyemptyschema

```
const fs = require('fs');
const protobufToJoi = require('protobuf-to-joi');

const proto = fs.readFileSync('./test.proto');

const emptyValues = ['', null];
const joiSchemas = protobufToJoi(proto, emptyValues);
```

### With enums as integers

```
const fs = require('fs');
const protobufToJoi = require('protobuf-to-joi');

const proto = fs.readFileSync('./test.proto');

const joiSchemas = protobufToJoi(proto, null, true);
```

## Credits

Forked from https://github.com/williamcotton/protobuf-to-joi.
