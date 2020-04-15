import React, { useEffect } from 'react'
import { View, StyleProp } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { CircleAvatar } from '../../shared-components/CircleAvatar'

//
// Message => All messages (group/contact)
//

// Types
type MessageProps = {
	payload: any
	avatarUri: string
	name: string
	date: string
	// Conditions of messages
	isGroup?: boolean
	// State of messages (sending.../retry sending.../sent/failed)
	state?: {
		value: string
		icon: string
		color: string
	}[]
	// Add styles
	style?: StyleProp<any>
	styleMsg?: StyleProp<any>
}

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

export const Message: React.FC<MessageProps> = ({
	payload,
	avatarUri,
	name,
	isGroup = false,
	state = [],
	styleMsg = null,
}) => {
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color }] = useStyles()
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
								{payload.isMe && (payload.acknowledged ? 'sent' : 'sending...')}
							</Text>
						</View>
					) : (
						state.map((value) => (
							<View style={[row.left, { alignItems: 'center' }]}>
								<Text style={[text.color.grey, _styles.dateMessageWithState]}>
									{formatTimestamp(new Date(payload.sentDate))}
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
