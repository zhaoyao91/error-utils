module.exports = {
  isSubclass(A, B) {
    return (typeof A === 'function' && typeof B === 'function') && (A === B || A.prototype instanceof B)
  },

  isPlainObject(object) {
    return typeof object === 'object' && object !== null && !Array.isArray(object)
  }
}