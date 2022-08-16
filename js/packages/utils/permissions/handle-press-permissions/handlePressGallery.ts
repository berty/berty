import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import { getPath } from '@berty/utils/react-native/file-system'

import { checkPermission } from '../checkPermissions'
import { PermissionType } from '../permissions'
import { HandlePressPermissionProps } from './interfaces'
import { prepareMediaAndSend } from './prepareMediaAndSend'

export const handlePressGallery: (props: HandlePressPermissionProps) => void = async ({
	setSending,
	messengerClient,
	onClose,
	navigate,
}) => {
	await checkPermission({
		permissionType: PermissionType.gallery,
		navigate,
		accept: async () => {
			try {
				const res = await DocumentPicker.pickSingle({
					type: [DocumentPicker.types.images],
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
		},
		deny: () => {},
	})
}
