import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useConversation } from '@berty-tech/store/hooks'
import { navigate, Routes } from '@berty-tech/navigation'

import { useStylesNotification } from './common'
import { ConversationAvatar } from '../avatars'

const MessageReceived: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const [{ text }] = useStyles()
	const _styles = useStylesNotification()

	const { payload } = props?.additionalProps?.payload || {}
	const convExists = useConversation(payload.conversation?.publicKey)
	// const inteExists = useInteraction(payload?.interaction?.cid, payload.conversation?.publicKey)
	const inteExists = true // TODO : scroll to time

	const handlePressConvMessage = () => {
		if (convExists && inteExists) {
			// TODO: Investigate: doesn't work if app crashes and is restarted
			navigate(
				payload.conversation.type === beapi.messenger.Conversation.Type.ContactType
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

	return (
		<TouchableOpacity
			style={_styles.touchable}
			activeOpacity={convExists ? 0.3 : 1}
			//underlayColor='transparent'
			onPress={handlePressConvMessage}
		>
			<View style={_styles.innerTouchable}>
				<ConversationAvatar publicKey={payload.conversation?.publicKey} size={40} />
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
