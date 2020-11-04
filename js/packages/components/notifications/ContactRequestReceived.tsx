import React, { useEffect } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { useConversation } from '@berty-tech/store/hooks'
import { navigate, Routes } from '@berty-tech/navigation'

import { playSound } from '../sounds'
import { useStylesNotification, NotificationTmpLogo } from './common'

const ContactRequestReceived: React.FC<any> = ({
	onClose,
	title,
	message,
	justOpened,
	...props
}) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()

	const { payload } = props?.additionalProps?.payload || {}
	const conv = useConversation(payload.contact?.conversationPublicKey)

	const handlePressConvMessage = () => {
		if (conv) {
			navigate(Routes.Chat.OneToOne, { convId: conv.publicKey })
		} else {
			console.warn('Notif: ContactRequestReceived: Conversation not found')
		}
		if (typeof onClose === 'function') {
			onClose()
		}
	}

	useEffect(() => {
		if (justOpened) {
			playSound('contactRequestReceived')
		}
	}, [justOpened])

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={conv ? 0.3 : 1}
			//underlayColor='transparent'
			onPress={handlePressConvMessage}
		>
			<View style={_styles.innerTouchable}>
				<NotificationTmpLogo />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.color.black, text.bold.medium]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={[text.color.black]}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default ContactRequestReceived
