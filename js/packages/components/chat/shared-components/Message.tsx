import React from 'react'
import { View, StyleProp } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { CircleAvatar } from '../../shared-components/CircleAvatar'
import { messenger } from '@berty-tech/store'
import { Messenger } from '@berty-tech/hooks'

//
// Message => All messages (group/contact)
//

// Types
// Styles
const useStylesMessage = () => {
	const [{ margin, row, flex, text, padding }] = useStyles()
	return {
		isMeMessage: [row.item.bottom, { maxWidth: '90%' }],
		isOtherMessage: [row.item.top, { maxWidth: '90%' }],
		circleAvatar: [flex.tiny, margin.right.small, row.item.bottom],
		messageItem: [],
		personNameInGroup: text.size.tiny,
		dateMessage: text.size.tiny,
		dateMessageWithState: [padding.right.scale(5), text.size.tiny],
		stateMessageValue: [padding.left.scale(1.5), text.size.tiny],
	}
}

const formatTimestamp = (date: Date) => {
	const arr = date.toString().split(' ')
	const hours = arr[4].split(':')
	const hour = hours[0] + ':' + hours[1]
	return hour
}

export const Message: React.FC<{ id: string }> = ({ id }) => {
	const message = Messenger.useGetMessage(id)
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color }] = useStyles()
	if (!message) {
		return null
	}
	const isGroup = false
	const styleMsg = null
	const avatarUri = undefined
	const name = undefined
	if (message.type === messenger.AppMessageType.UserMessage) {
		const payload = message
		return (
			<View
				style={[
					row.left,
					payload.isMe ? _styles.isMeMessage : _styles.isOtherMessage,
					padding.horizontal.medium,
					{ paddingTop: 2 },
				]}
			>
				{!payload.isMe && isGroup && (
					<CircleAvatar
						style={_styles.circleAvatar}
						avatarUri={avatarUri}
						withCircle={false}
						size={35}
					/>
				)}
				<View style={[column.top, _styles.messageItem]}>
					{!payload.isMe && isGroup && (
						<View style={[margin.left.small]}>
							<Text
								style={[
									text.bold.medium,
									_styles.personNameInGroup,
									{ color: payload.isMe ? color.white : color.blue },
								]}
							>
								{name}
							</Text>
						</View>
					)}
					<View
						style={[
							padding.small,
							border.radius.top.medium,
							payload.isMe ? border.radius.left.medium : border.radius.right.medium,
							styleMsg,
							payload.isMe && border.color.blue,
							payload.isMe && border.scale(2),
							padding.horizontal.scale(payload.isMe ? 11 : 13),
							padding.vertical.scale(payload.isMe ? 7 : 9),
							{
								backgroundColor: payload.isMe
									? payload.acknowledged
										? color.blue
										: color.white
									: '#CED2FF99',

								alignSelf: payload.isMe ? 'flex-end' : 'flex-start',
							},
						]}
					>
						<Text
							style={[
								{
									color: payload.isMe
										? payload.acknowledged
											? color.white
											: color.blue
										: color.blue,
									fontSize: 12,
									lineHeight: 17,
								},
							]}
						>
							{payload.body}
						</Text>
					</View>
					<View style={[payload.isMe && row.item.bottom]}>
						<View style={[row.left, { alignItems: 'center' }]}>
							<Text
								style={[
									text.color.grey,
									padding.right.scale(5),
									_styles.dateMessage,
									{ fontSize: 9 },
								]}
							>
								{formatTimestamp(new Date(payload.sentDate))}{' '}
							</Text>
							{payload.isMe && (
								<Icon
									name={payload.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
									width={12}
									height={12}
									fill={color.blue}
								/>
							)}
							<Text
								style={[
									text.color.blue,
									padding.left.scale(2),
									_styles.dateMessage,
									{ fontSize: 10, lineHeight: 11, textAlignVertical: 'center' },
								]}
							>
								{(payload.isMe && (payload.acknowledged ? 'sent' : 'sending...')) || ''}
							</Text>
						</View>
					</View>
				</View>
			</View>
		)
	} else if (message.type === messenger.AppMessageType.GroupInvitation) {
		return (
			<View>
				<Text>Group invitation for {message.name}</Text>
			</View>
		)
	} else {
		return null
	}
}
