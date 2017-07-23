const {isSubclass, isPlainObject} = require('./utils')

function makeError (ErrorClass, name) {
  if (isSubclass(ErrorClass, Error) && name === undefined) {
    return _makeError(ErrorClass)
  }
  else if (isSubclass(ErrorClass, Error) && typeof name === 'string') {
    return _inheritError(ErrorClass, name)
  }
  else if (typeof ErrorClass === 'string' && name === undefined) {
    return _inheritError(Error, ErrorClass)
  }
  else {
    throw new TypeError('params can only be (name), (Error, name) or (Error)')
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

function objectToError (object) {
  if (!isPlainObject(object)) throw new TypeError('input must be a plain object')
  const error = new ErrorFromObject()
  Object.assign(error, object)
  if (error.cause) error.cause = objectToError(error.cause)
  if (error.rootCause) error.rootCause = objectToError(error.rootCause)
  return error
}

const ErrorFromObject = makeError('ErrorFromObject')

module.exports = {
  makeError,
  causedBy,
  errorToObject,
  objectToError,
  isSubclass,
}