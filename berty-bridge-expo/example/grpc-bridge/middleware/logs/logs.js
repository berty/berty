import beapi from '@berty/api'

const logRequest = (name, title, req) => {
	// Berty messenger specific filters, TODO: extract
	if (req?.block?.length > 42) {
		req = { ...req, block: req.block.length }
	}
	if (title.indexOf('AppStorage') !== -1 && req?.value?.length > 42) {
		req = { ...req, value: req.value.length }
	}
	if (req?.event?.payload?.length > 42) {
		req = {
			...req,
			event: {
				...req.event,
				type: beapi.messenger.StreamEvent.Type[req.event.type],
				payload: req?.event?.payload?.length,
			},
		}
	}
	// End of berty messenger specific filters

	console.log(`>>>[${name}] ${title}: ${JSON.stringify(req)}`)
}

const logResponse = (name, title, res) => {
	// Berty messenger specific filters, TODO: extract
	if (title.indexOf('AttachmentRetrieve') !== -1) {
		return
	}
	if (title.indexOf('EventStream') !== -1) {
		const typeName = beapi.messenger.StreamEvent.Type[res?.event?.type]
		const tName = typeName?.substr('Type'.length)
		const pbobj = beapi.messenger.StreamEvent[tName]

		if (pbobj) {
			console.log(
				`<<<[${name}] ${title}: ${JSON.stringify({
					...res,
					event: {
						...res.event,
						type: typeName,
						payload: pbobj.decode(res.event.payload),
					},
				})}`,
			)
			return
		}
	}
	if (title.indexOf('AppStorage') !== -1 && res?.value?.length > 42) {
		res = { ...res, value: res.value.length }
	}
	if (res?.block?.length > 42) {
		res = { ...res, block: res.block.length }
	}
	if (res?.event?.payload?.length > 42) {
		res = {
			...res,
			event: {
				...res.event,
				type: beapi.messenger.StreamEvent.Type[res.event.type],
				payload: res?.event?.payload?.length,
			},
		}
	}
	// End of berty messenger specific filters

	console.log(`<<<[${name}] ${title}: ${JSON.stringify(res)}`)
}

const logEOF = (name, title) => {
	console.log(`EOF[${name}] ${title}`)
}

const logError = (name, title, err) => {
	// Berty messenger specific filters, TODO: extract
	if (
		title.indexOf('ConversationLoad') !== -1 &&
		`${err}`.indexOf(`#${beapi.errcode.ErrCode.ErrNotFound}`) !== -1
	) {
		console.log(`[${name}] ${title}: ${err}`)
		return
	}
	if (
		title.indexOf('AppStorageGet') !== -1 &&
		`${err}`.indexOf('datastore: key not found') !== -1
	) {
		console.log(`[${name}] ${title}: ${err}`)
		return
	}
	if (
		title.indexOf('GetGRPCListenerAddrs') !== -1 &&
		`${err}`.indexOf('init manager not initialized') !== -1
	) {
		console.log(`[${name}] ${title}: ${err}`)
		return
	}
	if (title.indexOf('EventStream') !== -1 && `${err}`.indexOf('Canceled') !== -1) {
		console.log(`[${name}] ${title}: ${err}`)
		return
	}
	// End of berty messenger specific filters

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
				if (err?.message === 'EOF') {
					logEOF(name, eventTitle)
				} else if (err) {
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
