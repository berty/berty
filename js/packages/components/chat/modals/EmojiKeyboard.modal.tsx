import React, { FC } from 'react'
import { View } from 'react-native'
import EmojiBoard from 'react-native-emoji-board'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient, usePlaySound, useThemeColor } from '@berty/hooks'

export const EmojiKeyboard: FC<{
	conversationPublicKey: string
	targetCid: string
	hide: () => void
}> = ({ conversationPublicKey, targetCid, hide }) => {
	const client = useMessengerClient()
	const playSound = usePlaySound()
	const colors = useThemeColor()
	const { padding } = useStyles()

	return (
		<View style={[padding.top.small]}>
			<EmojiBoard
				showBoard={true}
				hideBackSpace
				onClick={(emoji: { name: string }) => {
					client
						?.interact({
							conversationPublicKey,
							type: beapi.messenger.AppMessage.Type.TypeUserReaction,
							payload: beapi.messenger.AppMessage.UserReaction.encode({
								emoji: `:${emoji.name}:`,
								state: true,
							}).finish(),
							targetCid,
						})
						.then(() => {
							playSound('messageSent')
							hide()
						})
						.catch((e: unknown) => {
							console.warn('e sending message:', e)
						})
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
