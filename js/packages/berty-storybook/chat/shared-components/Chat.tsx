import React, { useRef } from 'react'
import {
	TouchableOpacity,
	View,
	TextInput,
	StyleSheet,
	Text,
	KeyboardAvoidingView,
	SafeAreaView,
} from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'

//
// ChatFooter => Textinput for type message
//

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

export const ChatFooter: React.FC<{
	isFocused: boolean
	setFocus: React.Dispatch<React.SetStateAction<any>>
}> = ({ isFocused, setFocus }) => {
	const inputRef = useRef(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	return (
		<SafeAreaView style={[styles.bgWhite]}>
			<View
				style={[
					styles.row,
					styles.centerItems,
					styles.padding,
					_isFocused && styles.paddingBottom,
					styles.bgWhite,
					styles.end,
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
						{ backgroundColor: _isFocused ? colors.lightMsgBlueGrey : colors.lightGrey },
					]}
				>
					<TextInput
						ref={inputRef}
						multiline={true}
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						style={[
							_chatFooterStyles.textInput,
							_isFocused && { color: colors.blue } && _chatFooterStyles.focusTextInput,
						]}
						placeholder='Write a secure message...'
						placeholderTextColor={_isFocused ? colors.blue : colors.grey}
					/>
					<TouchableOpacity style={[styles.flex, _chatFooterStyles.sendButton]}>
						<Icon
							name='paper-plane-outline'
							width={30}
							height={30}
							fill={_isFocused ? colors.blue : colors.grey}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

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
