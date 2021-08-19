import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import { useMsgrContext } from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

const QuickReplyOption: React.FC<{
	convPk: string
	option: beapi.messenger.IReplyOption
}> = ({ convPk, option }) => {
	const ctx: any = useMsgrContext()
	const colors = useThemeColor()
	const [{ padding, border, margin }] = useStyles()

	return (
		<TouchableOpacity
			onPress={() => {
				const usermsg = { body: option.payload, sentDate: Date.now() }
				const buf = beapi.messenger.AppMessage.UserMessage.encode(usermsg).finish()

				ctx.client
					?.interact({
						conversationPublicKey: convPk,
						type: beapi.messenger.AppMessage.Type.TypeUserMessage,
						payload: buf,
					})
					.catch((e: any) => {
						console.warn('e sending message:', e)
					})
			}}
		>
			<View
				style={[
					border.radius.top.small,
					border.radius.left.small,
					border.radius.right.small,
					margin.top.tiny,
					border.scale(2),
					padding.horizontal.scale(8),
					padding.vertical.scale(4),
					{ borderColor: colors['secondary-text'] },
				]}
			>
				<Text style={{ color: colors['secondary-text'] }}>{option.display || ''}</Text>
			</View>
		</TouchableOpacity>
	)
}

export const QuickReplyOptions: React.FC<{
	convPk: string
	options: beapi.messenger.IReplyOption[]
}> = ({ convPk, options }) => {
	const [{ flex }] = useStyles()

	return (
		<View style={[flex.align.start]}>
			{(options || []).map(opt => (
				<QuickReplyOption key={opt.display} convPk={convPk} option={opt} />
			))}
		</View>
	)
}
