import { cacheDirectory, copyAsync } from 'expo-file-system'

export const getPath = async (uri: string): Promise<string> => {
	const urlComponents = uri.split('/')
	const fileNameAndExtension = urlComponents[urlComponents.length - 1]
	const destPath = `${cacheDirectory}/${fileNameAndExtension}`
	await copyAsync({ from: uri, to: destPath })

	return destPath
}
