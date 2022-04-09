import { PhotoIdentifiersPage } from '../../../../../node_modules/@react-native-community/cameraroll/typings/CameraRoll' // import from original module

const exported = {
	async getPhotos(_opts: any): Promise<PhotoIdentifiersPage> {
		return {
			edges: [],
			page_info: {
				has_next_page: false,
			},
		}
	},
	async save(_uri: string, _opts: any): Promise<string> {
		throw new Error('not supported on this platform')
	},
}

export default exported
