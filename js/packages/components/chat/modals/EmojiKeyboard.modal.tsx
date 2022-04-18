import React, { FC } from 'react'
import { View } from 'react-native'
import EmojiBoard from 'react-native-emoji-board'

import beapi from '@berty/api'
import { useMessengerClient, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { usePlaySound } from '@berty/hooks'

import { useModal } from '../../providers/modal.provider'

export const EmojiKeyboard: FC<{ conversationPublicKey: string; targetCid: string }> = ({
	conversationPublicKey,
	targetCid,
}) => {
	const client = useMessengerClient()
	const playSound = usePlaySound()
	const { hideAll } = useModal()
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
							hideAll()
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
