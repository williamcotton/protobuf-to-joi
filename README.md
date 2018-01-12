# protobuf-to-joi

## Installation
```
npm install @shoaltogether/protobuf-to-joi
```

## Usage
```
const fs = require('fs');
const protobufToJoi = require('protobuf-to-joi');

const proto = fs.readFileSync('./test.proto');

const joiSchemas = protobufToJoi(proto);
```

## Credits

Forked from https://github.com/williamcotton/protobuf-to-joi.
