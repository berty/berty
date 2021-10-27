const logStyle = {
	rpcOK:
		'font-weight:bold;color:#FFFFFF;background-color:#46868C;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
	rpcERROR:
		'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
	title: 'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
}

const rpcLogger = (name, title, req, res, err) => {
	try {
		if (err) {
			console.group(`%c ${name} %c %s`, logStyle.rpcERROR, logStyle.title, title)
			console.warn(err.message)
		} else {
			console.groupCollapsed(`%c ${name} %c %s`, logStyle.rpcOK, logStyle.title, title)
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

const create = name => (method, call) => async (payload, metadata) => {
	const request = method.resolvedRequestType.create(payload)

	const start = new Date().getTime()
	try {
		const res = await call(payload, metadata)
		const end = new Date().getTime()

		// stream
		if (method.requestStream || method.responseStream) {
			const title = `[${end - start}ms] ${method.name}`
			rpcLogger(name, title, request, null, null)

			const eventTitle = `<= ${method.name} event`
			res.onMessage((msg, err) => {
				if (err) {
					rpcLogger(name, eventTitle, null, null, err)
				} else {
					rpcLogger(name, eventTitle, null, msg, null)
				}
			})
		} else {
			// unary
			const title = `[${end - start}ms] ${method.name}`
			rpcLogger(name, title, request, res, null)
		}

		return res
	} catch (err) {
		const end = new Date().getTime()
		const title = `[${end - start}ms] ${method.name}`
		rpcLogger(name, title, request, null, err)

		throw err
	}
}

export default { create }
