const test = require('tape')

const fs = require('fs')
const path = require('path')
const protobufs = fs.readFileSync(path.join(__dirname, './test.proto'))

const protobufToJoi = require('../src')(protobufs)

const Joi = require('joi')
const validateDataAgainstJoiValidation = (data, joiValidation) => new Promise((resolve, reject) => {
  Joi.validate(data, joiValidation, (err, value) => {
    if (err) return reject(err)
    return resolve(value)
  })
})

test('protobufToJoi with test.proto', t => {
  t.test('should validate Basic with basicTestData', t => {
    t.plan(1)

    const basicTestData = {
      num: 1.2,
      payload: new Buffer('lol')
    }

    validateDataAgainstJoiValidation(basicTestData, protobufToJoi.Basic)
      .then(res => t.deepEqual(res, basicTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Basic with invalid basicTestData.num', t => {
    t.plan(1)

    const basicTestData = {
      num: 'sdfsd',
      payload: 'test'
    }

    validateDataAgainstJoiValidation(basicTestData, protobufToJoi.Basic)
      .catch(err => t.equal(err.message, 'child "num" fails because ["num" must be a number]'))
  })

  t.test('should not validate Basic with invalid basicTestData.payload', t => {
    t.plan(1)

    const basicTestData = {
      num: 1.2,
      payload: {}
    }

    validateDataAgainstJoiValidation(basicTestData, protobufToJoi.Basic)
      .catch(err => t.equal(err.message, 'child "payload" fails because ["payload" must be a buffer or a string]'))
  })

  t.test('should validate Map with mapTestData', t => {
    t.plan(1)

    const mapTestData = {
      foo: 'test',
      bar: 17
    }

    validateDataAgainstJoiValidation(mapTestData, protobufToJoi.Map)
      .then(res => t.deepEqual(res, mapTestData))
      .catch(err => console.error(err))
  })

  t.test('should validate UTF8 with utf8TestData', t => {
    t.plan(1)

    const utf8TestData = {
      foo: 'ビッグデータ「人間の解釈が必要」「量の問題ではない」論と、もう一つのビッグデータ「人間の解釈が必要」「量の問題ではない」論と、もう一つの',
      bar: 42
    }

    validateDataAgainstJoiValidation(utf8TestData, protobufToJoi.UTF8)
      .then(res => t.deepEqual(res, utf8TestData))
      .catch(err => console.error(err))
  })

  t.test('should validate Nested with nestedTestData', t => {
    t.plan(1)

    const nestedTestData = {
      num: 1,
      payload: new Buffer('lol'),
      meh: {
        num: 2,
        payload: new Buffer('bar')
      }
    }

    validateDataAgainstJoiValidation(nestedTestData, protobufToJoi.Nested)
      .then(res => t.deepEqual(res, nestedTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Nested with invalid nestedTestData.meh.num', t => {
    t.plan(1)

    const nestedTestData = {
      num: 1,
      payload: new Buffer('lol'),
      meh: {
        num: 'sdfsd',
        payload: new Buffer('bar')
      }
    }

    validateDataAgainstJoiValidation(nestedTestData, protobufToJoi.Nested)
      .catch(err => t.equal(err.message, 'child "meh" fails because [child "num" fails because ["num" must be a number]]'))
  })

  t.test('should validate EmbeddedNested with nestedTestData', t => {
    t.plan(1)

    const nestedTestData = {
      nest: {
        nested_string: 'string'
      }
    }

    validateDataAgainstJoiValidation(nestedTestData, protobufToJoi.EmbeddedNested)
      .then(res => t.deepEqual(res, nestedTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Nested with invalid nestedTestData.meh.num', t => {
    t.plan(1)

    const nestedTestData = {
      num: 1,
      payload: new Buffer('lol'),
      meh: {
        num: 'sdfsd',
        payload: new Buffer('bar')
      }
    }

    validateDataAgainstJoiValidation(nestedTestData, protobufToJoi.Nested)
      .catch(err => t.equal(err.message, 'child "meh" fails because [child "num" fails because ["num" must be a number]]'))
  })

  t.test('should validate Repeated with repeatedTestData', t => {
    t.plan(1)

    const repeatedTestData = {
      list: [{
        num: 1,
        payload: new Buffer('lol')
      }, {
        num: 2,
        payload: new Buffer('lol1')
      }]
    }

    validateDataAgainstJoiValidation(repeatedTestData, protobufToJoi.Repeated)
      .then(res => t.deepEqual(res, repeatedTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Repeated with invalid repeatedTestData.list[0].num', t => {
    t.plan(1)

    const repeatedTestData = {
      list: [{
        num: 'sdfjhsd',
        payload: new Buffer('lol')
      }, {
        num: 2,
        payload: new Buffer('lol1')
      }]
    }

    validateDataAgainstJoiValidation(repeatedTestData, protobufToJoi.Repeated)
      .catch(err => t.equal(err.message, 'child "list" fails because ["list" at position 0 fails because [child "num" fails because ["num" must be a number]]]'))
  })

  t.test('should validate Integers with integerTestData', t => {
    t.plan(1)

    const integerTestData = {
      sint32: 1,
      sint64: 2,
      int32: 3,
      uint32: 4,
      int64: 5
    }

    validateDataAgainstJoiValidation(integerTestData, protobufToJoi.Integers)
      .then(res => t.deepEqual(res, integerTestData))
      .catch(err => console.error(err))
  })

  t.test('should validate Integers with integerPositiveNegativeTestData', t => {
    t.plan(1)

    const integerPositiveNegativeTestData = {
      sint32: -1,
      sint64: -2,
      int32: -3,
      uint32: 0,
      int64: -1 * Math.pow(2, 52) - 5
    }

    validateDataAgainstJoiValidation(integerPositiveNegativeTestData, protobufToJoi.Integers)
      .then(res => t.deepEqual(res, integerPositiveNegativeTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Integers with integerPositiveNegativeTestData.uint32 with negative number', t => {
    t.plan(1)

    const integerPositiveNegativeTestData = {
      sint32: -1,
      sint64: -2,
      int32: -3,
      uint32: -20,
      int64: -1 * Math.pow(2, 52) - 5
    }

    validateDataAgainstJoiValidation(integerPositiveNegativeTestData, protobufToJoi.Integers)
      .catch(err => t.equal(err.message, 'child "uint32" fails because ["uint32" must be larger than or equal to 0]'))
  })

  t.test('should validate Float with floatTestData', t => {
    t.plan(1)

    var arr = new Float32Array(3)
    arr[0] = 1.1
    arr[1] = 0
    arr[2] = -2.3

    const floatTestData = {
      float1: arr[0],
      float2: arr[1],
      float3: arr[2]
    }

    validateDataAgainstJoiValidation(floatTestData, protobufToJoi.Float)
      .then(res => t.deepEqual(res, floatTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Float with invalid floatTestData.float1', t => {
    t.plan(1)

    const floatTestData = {
      float1: 'sdkfhsd',
      float2: 1.1
    }

    validateDataAgainstJoiValidation(floatTestData, protobufToJoi.Float)
      .catch(err => t.equal(err.message, 'child "float1" fails because ["float1" must be a number]'))
  })

  t.test('should validate Packed with packedTestData.packed', t => {
    t.plan(1)

    const packedTestData = {
      list: [],
      packed: [
        'hello world',
        'hej verden',
        'hola mundo'
      ]
    }

    validateDataAgainstJoiValidation(packedTestData, protobufToJoi.Packed)
      .then(res => t.deepEqual(res, packedTestData))
      .catch(err => console.error(err))
  })

  t.test('should validate Packed with packedTestData.list', t => {
    t.plan(1)

    const packedTestData = {
      list: [{
        num: 1,
        payload: new Buffer('lol')
      }, {
        num: 2,
        payload: new Buffer('lol1')
      }],
      packed: []
    }

    validateDataAgainstJoiValidation(packedTestData, protobufToJoi.Packed)
      .then(res => t.deepEqual(res, packedTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Packed with invalid packedTestData.packed', t => {
    t.plan(1)

    const packedTestData = {
      packed: [
        123,
        'hej verden',
        'hola mundo'
      ]
    }

    validateDataAgainstJoiValidation(packedTestData, protobufToJoi.Packed)
      .catch(err => t.equal(err.message, 'child "packed" fails because ["packed" at position 0 fails because ["0" must be a string]]'))
  })

  t.test('should not validate Packed with invalid packedTestData.list', t => {
    t.plan(1)

    const packedTestData = {
      list: [{
        num: 1,
        payload: new Buffer('lol')
      }, {
        num: 'sdfsdf',
        payload: new Buffer('lol1')
      }]
    }

    validateDataAgainstJoiValidation(packedTestData, protobufToJoi.Packed)
      .catch(err => t.equal(err.message, 'child "list" fails because ["list" at position 1 fails because [child "num" fails because ["num" must be a number]]]'))
  })

  t.test('should validate NotPacked with notPackedTestData', t => {
    t.plan(1)

    const notPackedTestData = {
      id: [ 9847136125 ],
      value: 10000
    }

    validateDataAgainstJoiValidation(notPackedTestData, protobufToJoi.NotPacked)
      .then(res => t.deepEqual(res, notPackedTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate NotPacked with invalid notPackedTestData.id', t => {
    t.plan(1)

    const notPackedTestData = {
      id: [ 'sdfsdf' ],
      value: 10000
    }

    validateDataAgainstJoiValidation(notPackedTestData, protobufToJoi.NotPacked)
      .catch(err => t.equal(err.message, 'child "id" fails because ["id" at position 0 fails because ["0" must be a number]]'))
  })

  t.test('should validate FalsePacked with falsePackedTestData', t => {
    t.plan(1)

    const falsePackedTestData = {
      id: [ 9847136125 ],
      value: 10000
    }

    validateDataAgainstJoiValidation(falsePackedTestData, protobufToJoi.FalsePacked)
      .then(res => t.deepEqual(res, falsePackedTestData))
      .catch(err => console.error(err))
  })

  t.test('should validate Defaults with a defaultsTestData with all defaults', t => {
    t.plan(1)

    const defaultsTestData = {}

    validateDataAgainstJoiValidation(defaultsTestData, protobufToJoi.Defaults)
      .then(res => t.deepEqual(res, {
        num: 42,
        foo1: 'B'
      }))
      .catch(err => console.error(err))
  })

  t.test('should validate Defaults with a defaultsTestData with one default', t => {
    t.plan(1)

    const defaultsTestData = {
      num: 10,
      foo2: 'B'
    }

    validateDataAgainstJoiValidation(defaultsTestData, protobufToJoi.Defaults)
      .then(res => t.deepEqual(res, {
        num: 10,
        foo1: 'B',
        foo2: 'B'
      }))
      .catch(err => console.error(err))
  })

  t.test('should validate Property with propertyTestData', t => {
    t.plan(1)

    const propertyTestData = {
      name: 'Foo',
      desc: 'optional description',
      int_value: 12345
    }

    validateDataAgainstJoiValidation(propertyTestData, protobufToJoi.Property)
      .then(res => t.deepEqual(res, propertyTestData))
      .catch(err => console.error(err))
  })

  t.test('should not validate Property with propertyTestData.bool_value', t => {
    t.plan(1)

    const propertyTestData = {
      name: 'Foo',
      desc: 'optional description',
      bool_value: 'dfsd'
    }

    validateDataAgainstJoiValidation(propertyTestData, protobufToJoi.Property)
      .catch(err => t.equal(err.message, 'child "bool_value" fails because ["bool_value" must be a boolean]'))
  })

  t.test('should not validate Property with invalid propertyTestData oneof', t => {
    t.plan(1)

    const propertyTestData = {
      name: 'Foo',
      desc: 'optional description',
      int32_value: 12345
    }

    validateDataAgainstJoiValidation(propertyTestData, protobufToJoi.Property)
      .catch(err => t.equal(err.message, '"int32_value" is not allowed. "value" must contain at least one of [bool_value, float_value, int_value, string_value]'))
  })

  t.test('should not validate Property with invalid propertyTestData oneof', t => {
    t.plan(1)

    const propertyTestData = {
      name: 'Foo',
      desc: 'optional description',
      string_value: 'Bar',
      bool_value: true,
      int_value: 12345
    }

    validateDataAgainstJoiValidation(propertyTestData, protobufToJoi.Property)
      .catch(err => t.equal(err.message, '"value" contains a conflict between exclusive peers [bool_value, float_value, int_value, string_value]'))
  })

  t.test('should validate PropertyNoOneof with propertyNoOneofTestData', t => {
    t.plan(1)

    const propertyNoOneofTestData = {
      name: 'Foo',
      desc: 'optional description',
      string_value: 'Bar',
      bool_value: true,
      int_value: 12345
    }

    validateDataAgainstJoiValidation(propertyNoOneofTestData, protobufToJoi.PropertyNoOneof)
      .then(res => t.deepEqual(res, propertyNoOneofTestData))
      .catch(err => console.error(err))
  })

  t.end()
})
