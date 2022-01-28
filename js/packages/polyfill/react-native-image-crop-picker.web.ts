const ImagePicker = {
	openPicker: async (_props: any) => {
		return null
	},
	openCamera: async (_props: any) => {
		const obj = {
			path: undefined,
			sourceURL: undefined,
			mime: undefined,
		}
		return obj
	},
	clean: async () => {},
}

export type ImageOrVideo = any

export default ImagePicker
