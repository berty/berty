import React, { FC } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Icon } from '@ui-kitten/components'

import { getEmojiByName } from '@berty-tech/components/utils'
import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import AddEmojiIcon from '@berty-tech/assets/add_emoji.svg'
import { useLayout } from '@berty-tech/components/hooks'
import { useAppDispatch } from '@berty-tech/react-redux'
import {
	ReplyTargetInteraction,
	setActiveReplyInteraction,
} from '@berty-tech/redux/reducers/chatInputs.reducer'

import { useConversationModal } from '../ConversationModalContext'
import { EmojiKeyboard } from './EmojiKeyboard.modal'

const emojis = [
	':+1:',
	':heart:',
	':ok_hand:',
	':sunglasses:',
	':joy:',
	':wave:',
	':heart_eyes:',
	':relieved:',
	':heart:',
	':grin:',
	':sleeping:',
	':kissing_heart:',
	':grimacing:',
	':worried:',
]

export const MessageMenu: FC<{
	convPk: string
	cid: string
	onSelectEmoji: (emoji: string) => void
	replyInteraction: ReplyTargetInteraction
}> = ({ convPk, cid, onSelectEmoji, replyInteraction }) => {
	const colors = useThemeColor()
	const [{ padding, border, margin }, { windowWidth }] = useStyles()
	const [layout, onLayout] = useLayout()
	const { show, hide } = useConversationModal()
	const emojisToDisplay: number = (Math.floor(windowWidth / layout.width) - 1) * 0.6
	const dispatch = useAppDispatch()
	const menuItems = [
		{
			icon: 'undo',
			title: 'Reply',
			callback: () => {
				dispatch(
					setActiveReplyInteraction({ convPK: convPk, activeReplyInteraction: replyInteraction }),
				)
			},
		},
	]

	return (
		<View>
			<View style={[margin.top.medium, { flexDirection: 'row' }]}>
				<View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-evenly' }}>
					{emojis.slice(0, emojisToDisplay).map((emoji, index) => (
						<TouchableOpacity
							style={[
								padding.small,
								border.radius.big,

								{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: colors['input-background'],
								},
							]}
							key={`conversation-menu-${emoji}-${index}`}
							onPress={() => {
								onSelectEmoji(emoji)
								hide()
							}}
						>
							<Text>{`${getEmojiByName(emoji as string)}`}</Text>
						</TouchableOpacity>
					))}
					<TouchableOpacity
						onLayout={onLayout}
						style={[
							padding.small,
							border.radius.big,
							{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: colors['input-background'],
							},
						]}
						onPress={() => {
							show(<EmojiKeyboard conversationPublicKey={convPk} targetCid={cid} />)
						}}
					>
						<AddEmojiIcon width={17} height={17} fill={colors['background-header']} />
					</TouchableOpacity>
				</View>
			</View>
			{menuItems.map(({ icon, title, callback }) => (
				<TouchableOpacity
					style={[padding.large, { flexDirection: 'row', alignItems: 'center' }]}
					onPress={() => {
						callback()
						hide()
					}}
				>
					<Icon
						name={icon}
						fill={colors['background-header']}
						style={[margin.right.large]}
						height={30}
						width={30}
					/>
					<Text style={{ color: colors['main-text'] }}>{title}</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}
