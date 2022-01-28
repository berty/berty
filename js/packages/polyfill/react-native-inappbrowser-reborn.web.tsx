export default {
	isAvailable: async () => {
		return false
	},
	openAuth: async () => {
		throw new Error('not implemented')
	},
}

export interface RedirectResult {
	type: 'success'
	url: string
}
