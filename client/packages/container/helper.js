export const deepFilterEqual = (a, b, opts = { exclude: [] }) => {
  const { exclude } = opts
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
          exclude.some(excludeKey => excludeKey === k) ||
          deepFilterEqual(a[k], b[k])
      )
    default:
      return a === b
  }
}

export const deepEqual = (a, b, opts = { exclude: [] }) => {
  const { exclude } = opts
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
          exclude.some(excludeKey => excludeKey === k) ||
          deepFilterEqual(a[k], b[k])
      )
    default:
      return a === b
  }
}
