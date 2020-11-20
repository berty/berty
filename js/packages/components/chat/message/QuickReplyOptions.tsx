import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '@ui-kitten/components'

import { messenger as messengerpb } from '@berty-tech/api'
import { useMsgrContext } from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'

const QuickReplyOption: React.FC<{
	convPk: string
	option: { display: string; payload: string }
}> = ({ convPk, option }) => {
	const ctx: any = useMsgrContext()
	const [{ padding, border, margin }] = useStyles()

	return (
		<TouchableOpacity
			onPress={() => {
				const usermsg = { body: option.payload, sentDate: Date.now() }
				const buf = messengerpb.AppMessage.UserMessage.encode(usermsg).finish()

				ctx.client
					?.interact({
						conversationPublicKey: convPk,
						type: messengerpb.AppMessage.Type.TypeUserMessage,
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
					border.color.grey,
					border.scale(2),
					padding.horizontal.scale(8),
					padding.vertical.scale(4),
				]}
			>
				<Text>{option.display}</Text>
			</View>
		</TouchableOpacity>
	)
}

export const QuickReplyOptions: React.FC<{
	convPk: string
	options: Array<{ display: string; payload: string }>
}> = ({ convPk, options }) => {
	const [{ flex }] = useStyles()

	return (
		<View style={[flex.align.start]}>
			{(options || []).map((opt) => (
				<QuickReplyOption key={opt.display} convPk={convPk} option={opt} />
			))}
		</View>
	)
}
