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

export default name => (method, call) => async (payload, metadata) => {
  const start = new Date().getTime()
  const request = method.resolvedRequestType.create(payload)

  try {
    const res = await call(payload, metadata)
    const end = new Date().getTime()
    const title = `[${end - start}ms] ${method.name}`
    rpcLogger(name, title, request, res, null)

    return res
  } catch (err) {
    const end = new Date().getTime()
    const title = `[${end - start}ms] ${method.name}`
    rpcLogger(name, title, request, null, err)

    throw err
  }
}
