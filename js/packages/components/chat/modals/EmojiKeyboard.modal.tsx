import React, { FC } from 'react'
import { View } from 'react-native'
import EmojiBoard from 'react-native-emoji-board'

import beapi from '@berty-tech/api'
import { useMessengerClient, useMessengerContext, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { useModal } from '../../providers/modal.provider'

export const EmojiKeyboard: FC<{ conversationPublicKey: string; targetCid: string }> = ({
	conversationPublicKey,
	targetCid,
}) => {
	const client = useMessengerClient()
	const ctx = useMessengerContext()
	const { hideAll } = useModal()
	const colors = useThemeColor()
	const [{ padding }] = useStyles()

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
							ctx.playSound('messageSent')
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
