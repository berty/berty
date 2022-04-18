import React, { FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { getEmojiByName } from '@berty/components/utils'
import { useThemeColor } from '@berty/store'
import AddEmojiIcon from '@berty/assets/logo/add_emoji.svg'
import { useStyles } from '@berty/contexts/styles'
import { useLayout } from '@berty/components/hooks'
import { useAppDispatch } from '@berty/hooks'
import {
	ReplyTargetInteraction,
	setActiveReplyInteraction,
} from '@berty/redux/reducers/chatInputs.reducer'

import { useModal } from '../../providers/modal.provider'
import { EmojiKeyboard } from './EmojiKeyboard.modal'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const emojis = [
	':+1:',
	':heart:',
	':ok_hand:',
	':sunglasses:',
	':joy:',
	':wave:',
	':heart_eyes:',
	':relieved:',
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
	const { padding, border, margin } = useStyles()
	const { windowWidth } = useAppDimensions()
	const [layout, onLayout] = useLayout()
	const { show, hide } = useModal()
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
							<UnifiedText>{`${getEmojiByName(emoji as string)}`}</UnifiedText>
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
					key={title}
				>
					<Icon
						name={icon}
						fill={colors['background-header']}
						style={[margin.right.large]}
						height={30}
						width={30}
					/>
					<UnifiedText>{title}</UnifiedText>
				</TouchableOpacity>
			))}
		</View>
	)
}
