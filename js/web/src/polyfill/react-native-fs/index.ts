import { ReadDirItem, StatResult, FileOptions } from 'react-native-fs'

export const DownloadDirectoryPath = ''

export const TemporaryDirectoryPath = ''

export const writeFile = async (
	_filepath: string,
	_contents: string,
	_encodingOrOptions?: any,
): Promise<void> => {
	throw new Error('unsupported')
}

export const unlink = async (_filepath: string): Promise<void> => {
	throw new Error('unsupported')
}

export const readDir = async (_dirpath: string): Promise<ReadDirItem[]> => {
	return []
}

export const stat = async (_filepath: string): Promise<StatResult> => {
	throw new Error('unsupported')
}

export const copyAssetsFileIOS = async (
	_imageUri: string,
	_destPath: string,
	_width: number,
	_height: number,
	_scale?: number,
	_compression?: number,
	_resizeMode?: string,
): Promise<string> => {
	throw new Error('ios only function')
}

export const readFile = (_filepath: string, _encodingOrOptions?: any): Promise<string> => {
	throw new Error('unsupported')
}

export const copyFile = async (
	_filepath: string,
	_destPath: string,
	_options?: FileOptions,
): Promise<void> => {
	throw new Error('unsupported')
}

export const write = async (
	_filepath: string,
	_contents: string,
	_position?: number,
	_encodingOrOptions?: any,
): Promise<void> => {
	throw new Error('unsupported')
}

const exported = {
	DownloadDirectoryPath,
	TemporaryDirectoryPath,
	writeFile,
	unlink,
	readDir,
	stat,
	copyAssetsFileIOS,
	readFile,
	copyFile,
	write,
}

export default exported
