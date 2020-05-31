import React from 'react'
import { View } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { CircleAvatar } from '../../shared-components/CircleAvatar'
import { chat } from '@berty-tech/store'

//
// Message => All messages (group/contact)
//

// Types
type MessageProps = chat.message.Entity

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

export const Message: React.FC<MessageProps> = (props) => {
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color }] = useStyles()
	if (props.type !== chat.AppMessage.AppMessageType.UserMessage) {
		return null
	}
	const isGroup = false
	const state: any[] = []
	const avatarUri = 'unknown'
	const name = 'unknown'
	const { isMe, acknowledged, sentDate, body } = props
	return (
		<View
			style={[
				row.left,
				isMe ? _styles.isMeMessage : _styles.isOtherMessage,
				padding.horizontal.medium,
				{ paddingTop: 2 },
			]}
		>
			{!isMe && isGroup && (
				<CircleAvatar
					style={_styles.circleAvatar}
					avatarUri={avatarUri}
					withCircle={false}
					size={35}
				/>
			)}
			<View style={[column.top, _styles.messageItem]}>
				{!isMe && isGroup && (
					<View style={[margin.left.small]}>
						<Text
							style={[
								text.bold.medium,
								_styles.personNameInGroup,
								{ color: isMe ? color.white : color.blue },
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
						isMe ? border.radius.left.medium : border.radius.right.medium,
						isMe && border.color.blue,
						isMe && border.scale(2),
						padding.horizontal.scale(isMe ? 11 : 13),
						padding.vertical.scale(isMe ? 7 : 9),
						{
							backgroundColor: isMe ? (acknowledged ? color.blue : color.white) : '#CED2FF99',

							alignSelf: isMe ? 'flex-end' : 'flex-start',
						},
					]}
				>
					<Text
						style={[
							{
								color: isMe ? (acknowledged ? color.white : color.blue) : color.blue,
								fontSize: 12,
								lineHeight: 17,
							},
						]}
					>
						{body}
					</Text>
				</View>
				<View style={[isMe && row.item.bottom]}>
					{!state.length ? (
						<View style={[row.left, { alignItems: 'center' }]}>
							<Text
								style={[
									text.color.grey,
									padding.right.scale(5),
									_styles.dateMessage,
									{ fontSize: 9 },
								]}
							>
								{formatTimestamp(new Date(sentDate))}{' '}
							</Text>
							{isMe && (
								<Icon
									name={acknowledged ? 'navigation-2' : 'navigation-2-outline'}
									width={12}
									height={12}
									fill={color.blue}
								/>
							)}
							{isMe && (
								<Text
									style={[
										text.color.blue,
										padding.left.scale(2),
										_styles.dateMessage,
										{ fontSize: 10, lineHeight: 11, textAlignVertical: 'center' },
									]}
								>
									{acknowledged ? 'sent' : 'sending...'}
								</Text>
							)}
						</View>
					) : (
						state.map((value) => (
							<View style={[row.left, { alignItems: 'center' }]}>
								<Text style={[text.color.grey, _styles.dateMessageWithState]}>
									{formatTimestamp(new Date(sentDate))}
								</Text>
								<Icon name={value.icon} width={12} height={12} fill={value.color} />
								<Text style={[_styles.stateMessageValue, { color: value.color }]}>
									{value.value}
								</Text>
							</View>
						))
					)}
				</View>
			</View>
		</View>
	)
}
