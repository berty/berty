import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import { useStyles } from '@berty/styles'
import { dispatch } from '@berty/navigation'
import { useConversation } from '@berty/react-redux'

import { useStylesNotification, NotificationTmpLogo } from './common'
import { BText } from '../shared-components/BText'

const ContactRequestSent: React.FC<any> = ({ onClose, title, message, ...props }) => {
	const [{ text }] = useStyles()
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
			console.warn('Notif: ContactRequestSent: Conversation not found or no public key')
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
					<BText numberOfLines={1} style={[text.bold.medium]}>
						{title}
					</BText>
					<BText numberOfLines={1} ellipsizeMode='tail'>
						{message}
					</BText>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export default ContactRequestSent
