import { useNavigation } from '@react-navigation/native'
import React from 'react'

import beapi from '@berty/api'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { handlePressCamera } from '@berty/utils/permissions/handle-press-permissions/handlePressCamera'

import { ChatInputButton } from './ChatFooterButtons'

export const CameraButton: React.FC<{
	sending: boolean
	setSending: (sending: boolean) => void
	messengerClient: WelshMessengerServiceClient | null
	onClose: (value: beapi.messenger.IMedia[] | undefined) => Promise<void>
}> = React.memo(({ sending, setSending, messengerClient, onClose }) => {
	const { navigate } = useNavigation()

	return (
		<ChatInputButton
			iconName='camera'
			iconPack='custom'
			vOffset={1.5}
			iconRatio={0.44}
			onPress={async () => {
				await handlePressCamera({ sending, setSending, messengerClient, onClose, navigate })
			}}
		/>
	)
})
