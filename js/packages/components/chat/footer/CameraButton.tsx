import { useNavigation } from '@react-navigation/native'
import React from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import rnutil from '@berty/utils/react-native'
import { PermissionType } from '@berty/utils/react-native/permissions'

import { ChatInputButton } from './ChatFooterButtons'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const CameraButton: React.FC<{
	sending: boolean
	setSending: (sending: boolean) => void
	messengerClient: WelshMessengerServiceClient | null
	handleCloseFileMenu: (value: beapi.messenger.IMedia[] | undefined) => Promise<void>
}> = React.memo(props => {
	const { navigate } = useNavigation()

	const prepareMediaAndSend = async (res: (beapi.messenger.IMedia & { uri?: string })[]) => {
		try {
			if (props.sending) {
				return
			}
			props.setSending(true)

			const medias = await amap(res, async doc => {
				if (!props.messengerClient) {
					throw new Error('no messenger client')
				}

				const stream = await props.messengerClient.mediaPrepare({})
				await stream.emit({
					info: {
						filename: doc.filename,
						mimeType: doc.mimeType,
						displayName: doc.displayName || doc.filename || 'document',
					},
					uri: doc.uri,
				})
				const reply = await stream.stopAndRecv()
				const optimisticMedia: beapi.messenger.IMedia = {
					cid: reply.cid,
					filename: doc.filename,
					mimeType: doc.mimeType,
					displayName: doc.displayName || doc.filename || 'document',
				}
				return optimisticMedia
			})

			await props.handleCloseFileMenu(medias)
		} catch (err) {
			console.warn('failed to prepare media and send message:', err)
		}
		props.setSending(false)
	}

	const handlePressCamera = async () => {
		const permissionStatus = await rnutil.checkPermissions(PermissionType.camera, {
			navigate,
			navigateToPermScreenOnProblem: true,
		})
		if (permissionStatus !== RESULTS.GRANTED) {
			return
		}

		try {
			await ImagePicker.clean()
		} catch (err) {
			console.warn('failed to clean image picker:', err)
		}
		try {
			const image = await ImagePicker.openCamera({
				cropping: false,
			})

			if (image) {
				await prepareMediaAndSend([
					{
						filename: '',
						uri: image.path || image.sourceURL || '',
						mimeType: image.mime,
					},
				])
			}
		} catch (err) {
			console.warn('failed to send quick picture:', err)
		}
	}

	return (
		<ChatInputButton
			iconName='camera'
			iconPack='custom'
			vOffset={1.5}
			iconRatio={0.44}
			onPress={handlePressCamera}
		/>
	)
})
