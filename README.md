# Js Error Utils

## Features

- make error class
- chain errors
- convert error to object
- convert object to error

## Installation

In your bash

```bash
npm i -S error-utils
```

In your code

```ecmascript 6
const utils = require('error-utils')
```

## API

#### makeError

`func(name) => Error`

`func(BaseError, name) => Error`

`func(Error) => Error`

Examples:

```ecmascript 6
// MyError is subclass of Error
const MyError = makeError('MyError')

// MyError is subclass of TypeError
const MyError = makeError('MyError', TypeError)

// MyError is subclass of SyntaxError with customized constructor
const MyError = makeError(class MyError extends SyntaxError {
  constructor (message, code) {
    super(message)
    this.code = code
  }
})
```

#### causedBy

`func(error, cause) => error`

Examples:

```ecmascript 6
const innerError1 = new InnerError('inner error 1')
const innerError2 = new InnerError('inner error 2')
const outerError = new OuterError('outer error')

causedBy(innerError2, innerError1)
causedBy(outterError, innerError2)

// outerError.cause === innerError2
// outerError.rootCause === innerError1
// outerError.ownStack is the original stack of outerError
// outerError.stack is with stacks of innerError2 and innerError1 appended
```

#### errorToObject

`func(error) => object`

```ecmascript 6
const error = new MyError('my error')
const object = errorToObject(error)

// object has name, message, stack, ownStack fields from error
// object has all other direct fields of error
// object.cause and object.rootError are parsed from error.cause and error.rootError by errorToObject
```

#### objectToError

`func(object, [ErrorClass]) => error`

```ecmascript 6
const error = new MyError('my error')
const object = errorToObject(error)
const newError = objectToError(object, MyError)

// newError is instance of MyError
// newError has name, message, stack, ownStack fields from object
// newError has all other direct fields of object
// newError.cause and newError.rootError are parsed from object.cause and object.rootError by objectToError
// NOTE: newError is no longer instance of MyError
```

## License

MIT