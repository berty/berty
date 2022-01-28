import { PhotoIdentifiersPage } from '@react-native-community/cameraroll/typings/CameraRoll'

export default {
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
