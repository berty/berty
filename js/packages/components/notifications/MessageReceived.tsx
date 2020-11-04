import React, { useEffect } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useStyles } from '@berty-tech/styles'
import { useInteraction, useConversation } from '@berty-tech/store/hooks'
import { navigate, Routes } from '@berty-tech/navigation'

import { playSound } from '../sounds'
import { useStylesNotification, NotificationTmpLogo } from './common'

const MessageReceived: React.FC<any> = ({ onClose, title, message, justOpened, ...props }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()

	const { payload } = props?.additionalProps?.payload || {}
	const convExists = useConversation(payload.conversation?.publicKey)
	const inteExists = useInteraction(payload?.interaction?.cid, payload.conversation?.publicKey)

	const handlePressConvMessage = () => {
		if (convExists && inteExists) {
			// TODO: Investigate: doesn't work if app crashes and is restarted
			navigate(
				payload.conversation.type === messengerpb.Conversation.Type.ContactType
					? Routes.Chat.OneToOne
					: Routes.Chat.Group,
				{ convId: payload.conversation?.publicKey, scrollToMessage: payload?.interaction?.cid },
			)
		} else {
			console.warn('Notif: Conversation or interaction not found')
		}
		if (typeof onClose === 'function') {
			onClose()
		}
	}

	useEffect(() => {
		if (justOpened) {
			playSound('messageReceived')
		}
	}, [justOpened])

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={convExists ? 0.3 : 1}
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

export default MessageReceived
