const create = () => (method, call) => async (payload, metadata) => {
	console.log(`i love ${method.name}`)
	return call(payload, metadata)
}

export default { create }
