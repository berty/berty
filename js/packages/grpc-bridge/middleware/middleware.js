export const chainMiddleware =
	(...middlewares) =>
	(method, call) => {
		if (middlewares.length === 0) {
			return call
		}

		const middleware = middlewares[0]
		const next = chainMiddleware(...middlewares.slice(1))(method, call)
		return middleware ? middleware(method, next) : next
	}
