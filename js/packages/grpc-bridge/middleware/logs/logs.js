const logStyle = {
	rpcOK:
		'font-weight:bold;color:#FFFFFF;background-color:#46868C;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
	rpcERROR:
		'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
	title: 'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
}

const rpcLogger = (method, id, time, req, res, err, stream) => {
	var log = ''

	if (stream) {
		log = `GRPCLOG STREAM - method: ${method} id: ${id}`
	} else if (time) {
		log = `GRPCLOG END - method: [${method}], id: [${id}], took: [${time}]`
	} else {
		log = `GRPCLOG START - method: ${method} id: ${id}`
	}

	if (req) {
		log += `, req: [${req}]`
	}
	if (res) {
		log += `, res: [${res}]`
	}
	if (err) {
		log += `, err: [${err}]`
		console.error(log)
	} else {
		console.info(log)
	}
}

const create = (name) => (method, call) => async (payload, metadata) => {
	const request = method.resolvedRequestType.create(payload)

	const start = new Date().getTime()
	const id = '_' + Math.random().toString(36).substr(2, 9)

	rpcLogger(method.name, id, null, null, null, null, false)

	try {
		const res = await call(payload, metadata)
		const end = new Date().getTime()

		// stream
		if (method.requestStream || method.responseStream) {
			rpcLogger(method.name, id, end - start, request.toString(), null, null, true)

			res.onMessage((msg, err) => {
				if (err) {
					rpcLogger(method.name, id, end - start, null, null, err, true)
				} else {
					rpcLogger(method.name, id, end - start, null, msg.toString(), null, true)
				}
			})
		} else {
			// unary
			rpcLogger(method.name, id, end - start, request.toString(), res.toString(), null, false)
		}

		return res
	} catch (err) {
		const end = new Date().getTime()
		rpcLogger(method.name, id, end - start, request.toString(), null, err, false)

		throw err
	}
}

export default { create }
