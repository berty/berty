import deepmerge from 'deepmerge'

export default objects =>
  deepmerge.all(objects, { arrayMerge: (dst, src) => src })
