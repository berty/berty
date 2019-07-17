// eslint-disable-next-line
let TextDecoder = TextDecoder || undefined

if (TextDecoder === undefined) {
  const encoding = require('text-encoding')
  TextDecoder = encoding.TextDecoder
}

const decoder = new TextDecoder('utf-8')

export const parseEmbedded = serialized => decoder.decode(serialized)
