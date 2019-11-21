import React from 'react'
import { TouchableOpacity, View, TextInput, StyleSheet, Text } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../../styles'

//
// ChatFooter => Textinput for type message
//

// Types
type ChatFooterProps = {
	isFocus: boolean
	setIsFocus: React.Dispatch<React.SetStateAction<any>>
}

// Styles
const _chatFooterStyles = StyleSheet.create({
	textInput: {
		flex: 10,
	},
	focusTextInput: {
		maxHeight: 80,
	},
	sendButton: {
		paddingLeft: 4,
	},
})

export const ChatFooter: React.FC<ChatFooterProps> = ({ isFocus, setIsFocus }) => (
	<View
		style={[
			styles.row,
			styles.centerItems,
			styles.padding,
			isFocus && styles.paddingBottom,
			styles.bgWhite,
		]}
	>
		<View
			style={[
				styles.flex,
				styles.borderRadius,
				styles.row,
				styles.littlePadding,
				styles.spaceBetween,
				styles.centerItems,
				{ backgroundColor: isFocus ? colors.lightMsgBlueGrey : colors.lightGrey },
			]}
		>
			<TextInput
				multiline={true}
				onFocus={() => setIsFocus(true)}
				onBlur={() => setIsFocus(false)}
				style={[
					_chatFooterStyles.textInput,
					isFocus && { color: colors.blue } && _chatFooterStyles.focusTextInput,
				]}
				placeholder='Write a secure message...'
				placeholderTextColor={isFocus ? colors.blue : colors.grey}
			/>
			<TouchableOpacity style={[styles.flex, _chatFooterStyles.sendButton]}>
				<Icon
					name='paper-plane-outline'
					width={30}
					height={30}
					fill={isFocus ? colors.blue : colors.grey}
				/>
			</TouchableOpacity>
		</View>
	</View>
)

//
// DateChat
//

// Types
type ChatDateProps = {
	date: string
}

// Styles
const _chatDateStyles = StyleSheet.create({
	date: {
		paddingTop: 2,
		paddingBottom: 2,
		paddingRight: 8,
		paddingLeft: 8,
		opacity: 0.5,
	},
	dateText: {
		fontSize: 12,
	},
})

export const ChatDate: React.FC<ChatDateProps> = ({ date }) => (
	<View style={[styles.borderRadius, styles.center, styles.bgLightGrey, _chatDateStyles.date]}>
		<Text style={[styles.center, styles.textBlack, _chatDateStyles.dateText]}>Today</Text>
	</View>
)
