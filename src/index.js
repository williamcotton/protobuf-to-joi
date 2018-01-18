const Joi = require('joi')
const schema = require('protocol-buffers-schema')

module.exports = (protobufs, emptyMatchers) => {
  const protobufSchema = schema.parse(protobufs)
  return protobufSchema.messages.reduce((joiValidations, message) => {
    const createJoiValidationFromMessage = (message) => {
      return Joi.object().keys(message.fields.reduce((schema, field) => {
        let validation

        switch (field.type) {
          case 'bool':
            validation = Joi.boolean()
            break

          case 'float':
          case 'double':
            validation = Joi.number()
            break

          case 'uint64':
          case 'uint32':
            validation = Joi.number().integer().min(0)
            break

          case 'int32':
          case 'sint32':
          case 'int64':
          case 'sint64':
            validation = Joi.number().integer()
            break

          case 'bytes':
            validation = Joi.binary()
            break

          case 'string':
            validation = Joi.string()
            break

          case 'map': // FIXME
            validation = Joi.any()
            break

          default:
            const childEnum = message.enums.find(_enum => _enum.name === field.type) || protobufSchema.enums.find(_enum => _enum.name === field.type)
            const childMessage = message.messages.find(_message => _message.name === field.type) || protobufSchema.messages.find(message => message.name === field.type)

            validation = childEnum
              ? Joi.string().valid(Object.keys(childEnum.values))
              : childMessage
              ? createJoiValidationFromMessage(childMessage)
              : validation

        }

        const toType = val => {
          switch (field.type) {
            case 'bool':
              return !!val
            case 'float':
            case 'double':
              return parseFloat(val)
            case 'uint64':
            case 'uint32':
            case 'int32':
            case 'sint32':
            case 'int64':
            case 'sint64':
              return parseInt(val)
            case 'string':
              return String(val)
            default:
              return String(val)
          }
        }

        validation = field.options && field.options.default
          ? validation.default(toType(field.options.default))
          : validation

        validation = field.repeated
          ? Joi.array().items(validation)
          : validation

        validation = field.required
          ? validation.required()
          : validation

        const setDefaultMatchers = (val) => v.empty(emptyMatchers);

        validation = emptyMatchers
          ? validation.empty(emptyMatchers)
          : validation

        schema[field.name] = validation

        return schema
      }, {}))
    }

    let joiValidation = createJoiValidationFromMessage(message)

    const oneOfFields = message.fields.reduce((oneOfFields, field) => {
      if (!field.oneof) return oneOfFields
      oneOfFields[field.oneof] = oneOfFields[field.oneof] || []
      oneOfFields[field.oneof].push(field.name)
      return oneOfFields
    }, {})

    Object.keys(oneOfFields).forEach(oneOf => {
      joiValidation = joiValidation.xor(oneOfFields[oneOf])
    })

    joiValidations[message.name] = joiValidation

    return joiValidations
  }, {})
}
