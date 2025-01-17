import { cacheDirectory, copyAsync } from 'expo-file-system'
import { PermissionsAndroid } from 'react-native'
import RNFS from 'react-native-fs'

export const getPath = async (uri: string): Promise<string> => {
	const urlComponents = uri.split('/')
	const fileNameAndExtension = urlComponents[urlComponents.length - 1]
	const destPath = `${cacheDirectory}/${fileNameAndExtension}`
	await copyAsync({ from: uri, to: destPath })

	return destPath
}

export const createAndSaveFile = async (
	outFile: string,
	fileName: string,
	extension?: string,
): Promise<void> => {
	try {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
			{
				title: "Save file in your download's directory",
				message: "Save backup account's file",
				buttonNeutral: 'Ask Me Later',
				buttonNegative: 'Cancel',
				buttonPositive: 'OK',
			},
		)
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			const dest = `${RNFS.DownloadDirectoryPath}/${fileName}.${extension || 'tar'}`
			await RNFS.copyFile(outFile, dest)
				.then(() => {
					console.log('file copied')
				})
				.catch(err => {
					console.log('file copied failed', err)
				})
		} else {
			console.log('Camera permission denied')
		}
	} catch (err) {
		console.warn(err)
	}
}
