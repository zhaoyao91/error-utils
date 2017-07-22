const {makeError, causedBy, errorToObject, objectToError} = require('./index')
const {isSubclass, isPlainObject} = require('./utils')

describe('Error Utils', function () {
  describe('makeError', function () {
    test('make error by name', () => {
      const MyError = makeError('MyError')
      const myError = new MyError('my error')

      expect(isSubclass(MyError, Error)).toBe(true)
      expect(myError instanceof MyError).toBe(true)
      expect(myError instanceof Error).toBe(true)
      expect(myError.name).toBe('MyError')
      expect(myError.message).toBe('my error')
    })

    test('make error by BaseError and name', () => {
      const MyError = makeError(TypeError, 'MyError')
      const myError = new MyError('my error')

      expect(isSubclass(MyError, Error)).toBe(true)
      expect(isSubclass(MyError, TypeError)).toBe(true)
      expect(myError instanceof MyError).toBe(true)
      expect(myError instanceof TypeError).toBe(true)
      expect(myError instanceof Error).toBe(true)
      expect(myError.name).toBe('MyError')
      expect(myError.message).toBe('my error')
    })

    test('make error by Error definition', () => {
      const MyError = makeError(class MyError extends TypeError {})
      const myError = new MyError('my error')

      expect(MyError.name).toBe('MyError') // only Error defined by this way will get the correct class name
      expect(isSubclass(MyError, Error)).toBe(true)
      expect(isSubclass(MyError, TypeError)).toBe(true)
      expect(myError instanceof MyError).toBe(true)
      expect(myError instanceof TypeError).toBe(true)
      expect(myError instanceof Error).toBe(true)
      expect(myError.name).toBe('MyError')
      expect(myError.message).toBe('my error')
    })

    test('invalid usage', () => {
      expect(() => makeError('MyError', Error)).toThrow('params can only be (name), (Error, name) or (Error)')
    })
  })

  describe('causedBy', () => {
    test('single cause', () => {
      const InnerError = makeError('InnerError')
      const OuterError = makeError('OuterError')

      const innerError = new InnerError('inner error')
      const outerError = new OuterError('outer error')
      const originalOuterErrorStack = outerError.stack

      causedBy(outerError, innerError)

      expect(outerError.cause).toBe(innerError)
      expect(outerError.rootCause).toBe(innerError)
      expect(outerError.ownStack).toBe(originalOuterErrorStack)
      expect(outerError.stack).toMatch(/Cause: InnerError/)
    })

    test('chain causes', () => {
      const InnerError1 = makeError('InnerError1')
      const InnerError2 = makeError('InnerError2')
      const OuterError = makeError('OuterError')

      const innerError1 = new InnerError1('inner error 1')
      const innerError2 = new InnerError2('inner error 1')
      const outerError = new OuterError('outer error')
      const originalOuterErrorStack = outerError.stack

      causedBy(innerError2, innerError1)
      causedBy(outerError, innerError2)

      expect(outerError.cause).toBe(innerError2)
      expect(outerError.rootCause).toBe(innerError1)
      expect(outerError.ownStack).toBe(originalOuterErrorStack)
      expect(outerError.stack).toMatch(/Cause: InnerError2(.|\n)*Cause: InnerError1/)
    })
  })

  describe('errorToObject', () => {
    test('error to object', () => {
      const InnerError1 = makeError('InnerError1')
      const InnerError2 = makeError('InnerError2')
      const OuterError = makeError('OuterError')

      const innerError1 = new InnerError1('inner error 1')
      const innerError2 = new InnerError2('inner error 1')
      const outerError = new OuterError('outer error')

      outerError.code = 404
      causedBy(innerError2, innerError1)
      causedBy(outerError, innerError2)

      const object = errorToObject(outerError)
      expect(isPlainObject(object)).toBe(true)
      expect(object instanceof Error).toBe(false)
      expect(object.name).toBe('OuterError')
      expect(object.message).toBe('outer error')
      expect(object.code).toBe(404)
      expect(object.stack).toBe(outerError.stack)
      expect(object.ownStack).toBe(outerError.ownStack)

      expect(isPlainObject(object.cause)).toBe(true)
      expect(object.cause instanceof Error).toBe(false)
      expect(object.cause.name).toBe('InnerError2')

      expect(isPlainObject(object.rootCause)).toBe(true)
      expect(object.cause instanceof Error).toBe(false)
      expect(object.rootCause.name).toBe('InnerError1')
    })
  })

  describe('objectToError', () => {
    test('object to error', () => {
      const InnerError1 = makeError('InnerError1')
      const InnerError2 = makeError('InnerError2')
      const OuterError = makeError('OuterError')

      const innerError1 = new InnerError1('inner error 1')
      const innerError2 = new InnerError2('inner error 1')
      const outerError = new OuterError('outer error')

      outerError.code = 404
      causedBy(innerError2, innerError1)
      causedBy(outerError, innerError2)

      const object = errorToObject(outerError)
      const error = objectToError(object)

      expect(error instanceof Error).toBe(true)
      expect(error.name).toBe('OuterError')
      expect(error.message).toBe('outer error')
      expect(error.code).toBe(404)
      expect(error.stack).toBe(outerError.stack)
      expect(error.ownStack).toBe(outerError.ownStack)

      expect(error.cause instanceof Error).toBe(true)
      expect(error.cause.name).toBe('InnerError2')

      expect(error.rootCause instanceof Error).toBe(true)
      expect(error.rootCause.name).toBe('InnerError1')
    })
  })
})