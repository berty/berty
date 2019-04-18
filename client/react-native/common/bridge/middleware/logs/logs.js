const logStyle = {
  rpcOK:
  'font-weight:bold;color:#FFFFFF;background-color:#46868C;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  rpcERROR:
  'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  title:
  'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
}

const rpcLogger = (name, title, req, res, err) => {
  try {
    if (res) {
      console.groupCollapsed(`%c ${name} %c %s`, logStyle.rpcOK, logStyle.title, title)
    } else {
      console.group(`%c ${name} %c %s`, logStyle.rpcERROR, logStyle.title, title)
      console.warn(err.message)
    }

    if (req) {
      console.dir(req)
    }

    if (res) {
      console.dir(res)
    }

    console.groupEnd()
  } catch (err) {
    console.log(`[${name}]`, title, req, res, err)
  }
}

export default name => (service, rpcImpl) => (method, request, callback) => {
  const start = new Date().getTime()
  const req = service.lookup(method.requestType).decode(request)
  const logCallback = (err, response) => {
    const end = new Date().getTime()
    const time = end - start

    const title = `[${time}ms] ${method.name}`
    if (response) {
      const res = service.lookup(method.responseType).decode(response)
      rpcLogger(name, title, req, res, err)
    } else {
      rpcLogger(name, title, req, null, err)
    }

    callback(err, response)
  }

  rpcImpl(method, request, logCallback)
}
