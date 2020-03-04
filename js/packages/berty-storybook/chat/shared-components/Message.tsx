import React from 'react'
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
	color: string
	bgColor: string
	// Conditions of messages
	isMe?: boolean
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
	const [{ margin, row, column, flex, text, padding }] = useStyles()
	return {
		isMeMessage: [margin.left.scale(70), row.item.bottom],
		isOtherMessage: [margin.right.scale(70), row.item.top],
		circleAvatar: [flex.tiny, margin.right.small, row.item.bottom],
		messageItem: flex.big,
		personNameInGroup: text.size.tiny,
		messageText: text.size.scale(11),
		dateMessage: text.size.tiny,
		dateMessageWithState: [padding.right.scale(5), text.size.tiny],
		stateMessageValue: [padding.left.scale(1.5), text.size.tiny],
	}
}

export const Message: React.FC<MessageProps> = ({
	payload,
	avatarUri,
	name,
	date,
	color,
	bgColor,
	isMe = false,
	isGroup = false,
	state = [],
	style = null,
	styleMsg = null,
}) => {
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border }] = useStyles()
	return (
		<View
			style={[
				row.left,
				isMe ? _styles.isMeMessage : _styles.isOtherMessage,
				padding.horizontal.medium,
				padding.vertical.small,
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
						<Text style={[text.bold, _styles.personNameInGroup, { color }]}>{name}</Text>
					</View>
				)}
				<View style={[padding.small, border.radius.medium, styleMsg, { backgroundColor: bgColor }]}>
					<Text style={[text.bold, _styles.messageText, { color }]}>{payload.body}</Text>
				</View>
				<View style={[isMe && row.item.bottom]}>
					{!state.length ? (
						<Text style={[text.color.grey, _styles.dateMessage]}>{date}</Text>
					) : (
						state.map((value) => (
							<View style={[row.left, { alignItems: 'center' }]}>
								<Text style={[text.color.grey, _styles.dateMessageWithState]}>{date}</Text>
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
