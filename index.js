const {isSubclass, isPlainObject} = require('./utils')

function makeError (name, ErrorClass) {
  if (typeof name === 'string' && ErrorClass === undefined) {
    return _inheritError(Error, name)
  }
  else if (typeof name === 'string' && isSubclass(ErrorClass, Error)) {
    return _inheritError(ErrorClass, name)
  }
  else if (isSubclass(name, Error) && ErrorClass === undefined) {
    return _makeError(name)
  }
  else {
    throw new TypeError('params can only be (name), (name, Error) or (Error)')
  }
}

function _makeError (Error) {
  if (Error.name) {
    Error.prototype.name = Error.name
  }
  return Error
}

function _inheritError (BaseError, name) {
  class Error extends BaseError {}
  Error.prototype.name = name
  return Error
}

function causedBy (error, cause) {
  if (!(error instanceof Error)) {
    throw new TypeError('error must be an instance of Error')
  }

  if (!(cause instanceof Error)) {
    throw new TypeError('cause must be an instance of Error')
  }

  error.cause = cause
  if (cause.rootCause instanceof Error) {
    error.rootCause = cause.rootCause
  }
  else {
    error.rootCause = cause
  }

  error.ownStack = error.stack
  error.stack = error.stack + '\nCause: ' + cause.stack

  return error
}

function errorToObject (error) {
  return Object.assign({}, error, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ownStack: error.ownStack,
    cause: error.cause && errorToObject(error.cause),
    rootCause: error.rootCause && errorToObject(error.rootCause)
  })
}

function objectToError (object, ErrorClass = Error) {
  if (!isPlainObject(object)) throw new TypeError('input must be a plain object')
  const error = new ErrorClass()
  Object.assign(error, object)
  if (error.cause) error.cause = objectToError(error.cause)
  if (error.rootCause) error.rootCause = objectToError(error.rootCause)
  return error
}

module.exports = {
  makeError,
  causedBy,
  errorToObject,
  objectToError,
  isSubclass,
}