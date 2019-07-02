export const deepFilterEqual = (a, b, opts = {}) => {
  const { exclude = [], noPrivate = true } = opts
  if (!a) {
    return true
  }
  if (typeof a !== typeof b) {
    return false
  }
  switch (typeof a) {
    case 'object':
      if (Array.isArray(a)) {
        return a.every(av => b.some(bv => deepFilterEqual(av, bv)))
      }
      return Object.keys(a).every(
        k =>
          (noPrivate && k[0] === '_') ||
          exclude.some(excludeKey => excludeKey === k) ||
          deepFilterEqual(a[k], b[k])
      )
    default:
      return a === b
  }
}

export const deepEqual = (a, b, opts = {}) => {
  const { exclude = [], noPrivate = true } = opts
  if (typeof a !== typeof b) {
    return false
  }
  switch (typeof a) {
    case 'object':
      if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
          return false
        }
        return a.every(av => b.some(bv => deepFilterEqual(av, bv)))
      }
      if (Array.isArray(b)) {
        return false
      }
      return Object.keys(a).every(
        k =>
          (noPrivate && k[0] === '_') ||
          exclude.some(excludeKey => excludeKey === k) ||
          deepFilterEqual(a[k], b[k])
      )
    default:
      return a === b
  }
}
