import { useNavigation } from '@react-navigation/native'
import React from 'react'

import {
	handlePressCamera,
	SendingFilesProps,
} from '@berty/utils/permissions/handle-press-permissions'

import { ChatInputButton } from './ChatFooterButtons'

export const CameraButton: React.FC<
	SendingFilesProps & {
		sending: boolean
	}
> = React.memo(({ sending, setSending, messengerClient, onClose }) => {
	const { navigate } = useNavigation()

	return (
		<ChatInputButton
			iconName='camera'
			iconPack='custom'
			vOffset={1.5}
			iconRatio={0.44}
			onPress={() => {
				if (sending) {
					return
				}
				handlePressCamera({ setSending, messengerClient, onClose, navigate })
			}}
		/>
	)
})
