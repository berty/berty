import React, { useCallback } from 'react'
import { Keyboard, StyleSheet, TouchableHighlight, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
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

	const openConversation = useCallback(() => {
		navigate({
			name:
				props.type === beapi.messenger.Conversation.Type.MultiMemberType
					? 'Chat.MultiMember'
					: 'Chat.OneToOne',
			params: {
				convId: props.publicKey,
			},
		})
	}, [navigate, props.publicKey, props.type])

	// hide the keyboard before navigating to a conversation (else we have UI issue)
	const handlePress = useCallback(() => {
		if (!Keyboard.isVisible()) {
			openConversation()
			return
		}
		const subscription = Keyboard.addListener('keyboardDidHide', () => {
			subscription.remove()
			openConversation()
		})
		Keyboard.dismiss()
	}, [openConversation])

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
			onPress={handlePress}
		>
			<View style={[row.center, !props.isLast && styles.divider,
							!props.isLast && { borderColor: colors['secondary-background'] }, padding.vertical.scale(7)]}>
				{props.children}
			</View>
		</TouchableHighlight>
	)
}

const styles = StyleSheet.create({
	divider: {
		borderBottomWidth: 1,
	},
})
