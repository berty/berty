import ImagePicker from 'react-native-image-crop-picker'

import { PermissionType } from '@berty/utils/permissions/permissions'

import { checkPermission } from '../checkPermissions'
import { HandlePressPermissionProps } from './interfaces'
import { prepareMediaAndSend } from './prepareMediaAndSend'

export const handlePressCamera: (props: HandlePressPermissionProps) => void = async ({
	setSending,
	messengerClient,
	onClose,
	navigate,
}) => {
	await checkPermission({
		permissionType: PermissionType.camera,
		navigate,
		accept: async () => {
			try {
				await ImagePicker.clean()
			} catch (err) {
				console.warn('failed to clean image picker:', err)
			}
			try {
				console.log('handlePressCamera')
				const image = await ImagePicker.openCamera({
					cropping: false,
				})

				if (image) {
					await prepareMediaAndSend({
						setSending,
						messengerClient,
						onClose,
						res: [
							{
								filename: '',
								uri: image.path || image.sourceURL || '',
								mimeType: image.mime,
							},
						],
					})
				}
			} catch (err) {
				console.warn('failed to send quick picture:', err)
			}
		},
		deny: () => {},
	})
}
