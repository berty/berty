import React, { useEffect, useRef } from 'react'
import { Keyboard, StyleSheet, TouchableHighlight, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { KeyboardStatus, useKeyboardStatus, useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import * as testIDs from '@berty/utils/testing/testIDs.json'

interface ConversationButtonProps {
	publicKey: string
	type: beapi.messenger.Conversation.Type | null
	isAccepted: boolean | undefined
	isLast: boolean
}

export const ConversationButton: React.FC<React.PropsWithChildren<ConversationButtonProps>> = props => {
	const { navigate } = useNavigation()
	const colors = useThemeColor()
	const { padding, row, opacity } = useStyles()
	const keyboardStatus = useKeyboardStatus()
	// Only gates the effect below, never rendered, so a ref avoids a state
	// update inside the effect.
	const isPressed = useRef(false)

	// this effect is usefull to hide keyboard before navigate to a conversation (else we have UI issue)
	useEffect(() => {
		if (isPressed.current && keyboardStatus === KeyboardStatus.KEYBOARD_HIDDEN) {
			isPressed.current = false
			navigate({
				name:
					props.type === beapi.messenger.Conversation.Type.MultiMemberType
						? 'Chat.MultiMember'
						: 'Chat.OneToOne',
				params: {
					convId: props.publicKey,
				},
			})
		}
	}, [keyboardStatus, navigate, props.publicKey, props.type])

	return (
		<TouchableHighlight
			testID={testIDs.conversation}
			underlayColor={`${colors['secondary-text']}80`}
			style={[
				padding.horizontal.medium,
				!props.isAccepted &&
					props.type !== beapi.messenger.Conversation.Type.MultiMemberType &&
					opacity(0.6),
			]}
			onPress={() => {
				Keyboard.dismiss()
				isPressed.current = true
			}}
		>
			<View style={[row.center, !props.isLast && styles.divider, padding.vertical.scale(7)]}>
				{props.children}
			</View>
		</TouchableHighlight>
	)
}

const styles = StyleSheet.create({
	divider: {
		borderBottomWidth: 1,
		borderColor: '#EDF1F7',
	},
})
