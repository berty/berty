const logRequest = (name, title, req) => {
	console.log(`>>>[${name}] ${title}: "${JSON.stringify(req)}"`)
}

const logResponse = (name, title, res) => {
	console.log(`<<<[${name}] ${title}: ${JSON.stringify(res)}`)
}

const logError = (name, title, err) => {
	console.warn(`[${name}] ${title}: ${err}`)
}

const create = name => (method, call) => async (payload, metadata) => {
	const request = method.resolvedRequestType.create(payload)

	const start = new Date().getTime()
	try {
		const title = `[REQ] ${method.name}`

		logRequest(name, title, request)

		const res = await call(payload, metadata)
		const end = new Date().getTime()

		// stream
		if (method.requestStream || method.responseStream) {
			const eventTitle = `[EVT] ${method.name}`
			res.onMessage((msg, err) => {
				if (err) {
					logError(name, eventTitle, err)
				} else {
					logResponse(name, eventTitle, msg)
				}
			})
			// unary
		} else {
			const title = `[${end - start}ms] [RES] ${method.name}`

			logResponse(name, title, res)
		}

		return res
	} catch (err) {
		const end = new Date().getTime()
		const title = `[${end - start}ms] [ERR] ${method.name}`

		logError(name, title, err)

		throw err
	}
}

export default { create }
