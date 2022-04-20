import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { dispatch } from '@berty/navigation'
import { useConversation } from '@berty/hooks'

import { useStylesNotification } from './common'
import { ConversationAvatar } from '../avatars'
import { UnifiedText } from '../shared-components/UnifiedText'

const MessageReceived: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const { text } = useStyles()
	const _styles = useStylesNotification()

	const { payload } = props?.additionalProps?.payload || {}
	const convExists = useConversation(payload.conversation?.publicKey)
	// const inteExists = useInteraction(payload?.interaction?.cid, payload.conversation?.publicKey)
	const inteExists = true // TODO : scroll to time

	const handlePressConvMessage = () => {
		if (convExists && inteExists) {
			// TODO: Investigate: doesn't work if app crashes and is restarted
			dispatch(
				CommonActions.reset({
					routes: [
						{ name: 'Chat.Home' },
						{
							name:
								payload.conversation.type === beapi.messenger.Conversation.Type.ContactType
									? 'Chat.OneToOne'
									: 'Chat.Group',
							params: {
								convId: payload.conversation?.publicKey,
								scrollToMessage: payload?.interaction?.cid,
							},
						},
					],
				}),
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
					<UnifiedText numberOfLines={1} style={[text.bold]}>
						{title}
					</UnifiedText>
					<UnifiedText numberOfLines={1} ellipsizeMode='tail'>
						{message}
					</UnifiedText>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default MessageReceived
