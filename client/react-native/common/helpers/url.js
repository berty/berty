const splitKeyValue = input => {
  if (input === undefined || input.length < 2) {
    return {}
  }

  return decodeURIComponent(input.substring(1)).split('&')
    .map(part => part.split('='))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value === undefined ? true : value,
    }), {})
}

export const parse = url => {
  // We don't need to be fully compliant with URL spec yet
  // this is a quick and dirty replacement for whatwg-url

  // eslint-disable-next-line
  const parts = url.match(/([^:]+):\/+([^/]+)([^#?]*)(\?[^#]*)?(#.*)?/)

  if (parts === null) {
    return {}
  }

  return {
    scheme: parts[1],
    host: parts[2],
    pathname: parts[3],
    querystring: parts[4] || '',
    querystringParts: splitKeyValue(parts[4]),
    hash: parts[5] || '',
    hashParts: splitKeyValue(parts[5]),
  }
}
