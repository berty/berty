const exported = {
	isAvailable: async () => {
		return false
	},
	openAuth: async () => {
		throw new Error('not implemented')
	},
}

export default exported
export interface RedirectResult {
	type: 'success'
	url: string
}
