import React, { FC } from 'react'
import { View } from 'react-native'
import EmojiBoard from 'react-native-emoji-board'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient, usePlaySound, useThemeColor } from '@berty/hooks'

export const EmojiKeyboard: FC<{
	conversationPublicKey: string
	targetCid: string
	showBoard: boolean
	hide: () => void
}> = ({ conversationPublicKey, targetCid, showBoard, hide }) => {
	const client = useMessengerClient()
	const playSound = usePlaySound()
	const colors = useThemeColor()
	const { padding } = useStyles()

	return (
		<View style={[padding.top.small]}>
			<EmojiBoard
				showBoard={showBoard}
				hideBackSpace
				onClick={async (emoji: { name: string }) => {
					console.log('HERE0')
					try {
						await client?.interact({
							conversationPublicKey,
							type: beapi.messenger.AppMessage.Type.TypeUserReaction,
							payload: beapi.messenger.AppMessage.UserReaction.encode({
								emoji: `:${emoji.name}:`,
								state: true,
							}).finish(),
							targetCid,
						})
						playSound('messageSent')
					} catch (e) {
						console.warn('e sending message:', e)
					}
					console.log('HERE1')
					hide()
				}}
				containerStyle={{
					position: 'relative',
					backgroundColor: colors['main-background'],
				}}
				labelStyle={{ color: colors['background-header'] }}
				categoryDefautColor={`${colors['background-header']}80`}
				categoryHighlightColor={colors['background-header']}
			/>
		</View>
	)
}
