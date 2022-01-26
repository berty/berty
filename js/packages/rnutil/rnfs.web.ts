import { ReadDirItem, StatResult, FileOptions } from 'react-native-fs'

const all = {
	DownloadDirectoryPath: '',
	TemporaryDirectoryPath: '',
	writeFile: async (
		_filepath: string,
		_contents: string,
		_encodingOrOptions?: any,
	): Promise<void> => {
		throw new Error('unsupported')
	},
	unlink: async (_filepath: string): Promise<void> => {
		throw new Error('unsupported')
	},
	readDir: async (_dirpath: string): Promise<ReadDirItem[]> => {
		return []
	},
	stat: async (_filepath: string): Promise<StatResult> => {
		throw new Error('unsupported')
	},
	copyAssetsFileIOS: async (
		_imageUri: string,
		_destPath: string,
		_width: number,
		_height: number,
		_scale?: number,
		_compression?: number,
		_resizeMode?: string,
	): Promise<string> => {
		throw new Error('ios only function')
	},
	readFile: (_filepath: string, _encodingOrOptions?: any): Promise<string> => {
		throw new Error('unsupported')
	},
	copyFile: async (_filepath: string, _destPath: string, _options?: FileOptions): Promise<void> => {
		throw new Error('unsupported')
	},
	write: async (
		_filepath: string,
		_contents: string,
		_position?: number,
		_encodingOrOptions?: any,
	): Promise<void> => {
		throw new Error('unsupported')
	},
}

export default all
