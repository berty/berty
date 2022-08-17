import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import { getPath } from '@berty/utils/react-native/file-system'

import { SendingFilesProps } from './interfaces'
import { prepareMediaAndSend } from './prepareMediaAndSend'

export const handlePressFiles: (props: SendingFilesProps) => void = async ({
	setSending,
	messengerClient,
	onClose,
}) => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: [DocumentPicker.types.allFiles],
		})
		let uri = res.uri
		if (Platform.OS === 'android') {
			uri = await getPath(uri)
		}
		await prepareMediaAndSend({
			setSending,
			messengerClient,
			onClose,
			res: [
				{
					filename: res.name,
					uri: uri,
					mimeType: res.type,
				},
			],
		})
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.warn(err)
		}
	}
}
