// WEB rpc implem

export const DefautlWebURL = 'http://localhost:8989/daemon'

export const rpcWebWithUrl = uri => serviceName => (
  method,
  request,
  callback
) => {
  const methodName = `/${serviceName}/${method.name}`
  fetch(uri, {
    headers: {
      'X-Method': methodName,
    },
    method: 'POST',
    body: request,
  })
    .then(res => {
      if (res.ok) {
        return res.arrayBuffer()
      }

      return res
        .text()
        .catch(() => {
          throw new Error(`[${res.status}] ${methodName}: ${res.statusText}`)
        })
        .then(err => {
          throw new Error(`${methodName}: ${err}`)
        })
    })
    .then(buff => {
      callback(null, new Uint8Array(buff))
    })
    .catch(e => {
      callback(e, null)
    })
}

export default rpcWebWithUrl(DefautlWebURL)
