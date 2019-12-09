import React from 'react'
import { View, StyleProp, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles } from '../../styles'
import { CircleAvatar } from '../../shared-components/CircleAvatar'

//
// Message => All messages (group/contact)
//

// Types
type MessageProps = {
	avatarUri: string
	name: string
	date: string
	message: string
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
const _messageStyles = StyleSheet.create({
	isMeMessage: {
		marginLeft: 70,
		alignSelf: 'flex-end',
	},
	isOtherMessage: {
		marginRight: 70,
		alignSelf: 'flex-start',
	},
	circleAvatar: {
		flex: 1,
		marginRight: 12,
		alignSelf: 'flex-end',
	},
	messageItem: {
		flex: 8,
	},
	personNameInGroup: {
		fontSize: 10,
	},
	messageText: {
		fontSize: 11,
	},
	dateMessage: {
		fontSize: 10,
	},
	dateMessagewithState: {
		fontSize: 10,
		paddingRight: 5,
	},
	stateMessageValue: {
		fontSize: 10,
		paddingLeft: 1.5,
	},
})

export const Message: React.FC<MessageProps> = ({
	avatarUri,
	name,
	date,
	message,
	color,
	bgColor,
	isMe = false,
	isGroup = false,
	state = [],
	style = null,
	styleMsg = null,
}) => (
	<View
		style={[
			styles.row,
			styles.stretch,
			isMe ? _messageStyles.isMeMessage : _messageStyles.isOtherMessage,
			styles.littleMarginTop,
			styles.padding,
		]}
	>
		{!isMe && isGroup && (
			<CircleAvatar
				style={_messageStyles.circleAvatar}
				avatarUri={avatarUri}
				withCircle={false}
				size={35}
			/>
		)}
		<View style={[styles.col, _messageStyles.messageItem]}>
			{!isMe && isGroup && (
				<View style={[styles.littleMarginLeft]}>
					<Text style={[styles.textBold, _messageStyles.personNameInGroup, { color: color }]}>
						{name}
					</Text>
				</View>
			)}
			<View
				style={[styles.littlePadding, styles.borderRadius, styleMsg, { backgroundColor: bgColor }]}
			>
				<Text style={[styles.textBold, _messageStyles.messageText, { color: color }]}>
					{message}
				</Text>
			</View>
			<View style={[isMe && styles.end]}>
				{!state.length ? (
					<Text style={[styles.textGrey, _messageStyles.dateMessage]}>{date}</Text>
				) : (
					state.map((value) => (
						<View style={[styles.row, styles.centerItems]}>
							<Text style={[styles.textGrey, _messageStyles.dateMessagewithState]}>{date}</Text>
							<Icon name={value.icon} width={12} height={12} fill={value.color} />
							<Text style={[_messageStyles.stateMessageValue, { color: value.color }]}>
								{value.value}
							</Text>
						</View>
					))
				)}
			</View>
		</View>
	</View>
)
