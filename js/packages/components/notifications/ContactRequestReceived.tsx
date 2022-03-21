import React from 'react'

import { CommonActions } from '@react-navigation/native'
import { TouchableOpacity, View, Text } from 'react-native'

import { dispatch } from '@berty-tech/navigation'
import { useConversation } from '@berty-tech/react-redux'
import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { useStylesNotification, NotificationTmpLogo } from './common'

const ContactRequestReceived: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const [{ text }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesNotification()

	const { payload } = props?.additionalProps?.payload || {}
	const conv = useConversation(payload.contact?.conversationPublicKey)

	const handlePressConvMessage = () => {
		if (conv?.publicKey) {
			dispatch(
				CommonActions.reset({
					routes: [
						{ name: 'Main.Home' },
						{
							name: 'Chat.OneToOne',
							params: {
								convId: conv.publicKey,
							},
						},
					],
				}),
			)
		} else {
			console.warn('Notif: ContactRequestReceived: Conversation not found or no public key')
		}
		if (typeof onClose === 'function') {
			onClose()
		}
	}

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

export default ContactRequestReceived
