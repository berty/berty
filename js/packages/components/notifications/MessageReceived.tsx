import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useConversation, useThemeColor } from '@berty-tech/store/hooks'

import { useStylesNotification } from './common'
import { ConversationAvatar } from '../avatars'

const MessageReceived: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const [{ text }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesNotification()
	const { navigate } = useNavigation()

	const { payload } = props?.additionalProps?.payload || {}
	const convExists = useConversation(payload.conversation?.publicKey)
	// const inteExists = useInteraction(payload?.interaction?.cid, payload.conversation?.publicKey)
	const inteExists = true // TODO : scroll to time

	const handlePressConvMessage = () => {
		if (convExists && inteExists) {
			// TODO: Investigate: doesn't work if app crashes and is restarted
			navigate(
				payload.conversation.type === beapi.messenger.Conversation.Type.ContactType
					? 'Chat.OneToOne'
					: 'Chat.Group',
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
			onPress={handlePressConvMessage}
		>
			<View style={_styles.innerTouchable}>
				<ConversationAvatar publicKey={payload.conversation?.publicKey} size={40} />
				<View style={_styles.titleAndTextWrapper}>
					<Text numberOfLines={1} style={[text.bold.medium, { color: colors['main-text'] }]}>
						{title}
					</Text>
					<Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors['main-text'] }}>
						{message}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default MessageReceived
