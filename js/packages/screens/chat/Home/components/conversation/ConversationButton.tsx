import React, { useEffect, useState } from 'react'
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

export const ConversationButton: React.FC<ConversationButtonProps> = props => {
	const { navigate } = useNavigation()
	const colors = useThemeColor()
	const { padding, row, opacity } = useStyles()
	const keyboardStatus = useKeyboardStatus()
	const [isPressed, setIsPressed] = useState<boolean>(false)

	// this effect is usefull to hide keyboard before navigate to a conversation (else we have UI issue)
	useEffect(() => {
		if (isPressed && keyboardStatus === KeyboardStatus.KEYBOARD_HIDDEN) {
			setIsPressed(false)
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
	}, [isPressed, keyboardStatus, navigate, props.publicKey, props.type])

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
				setIsPressed(true)
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
