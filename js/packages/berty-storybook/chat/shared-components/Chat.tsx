import React, { useRef, useState } from 'react'
import { TouchableOpacity, View, TextInput, Text, SafeAreaView } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Chat } from '@berty-tech/hooks'
import { AppMessageType } from '@berty-tech/store/chat/AppMessage'
//
// ChatFooter => Textinput for type message
//

// Styles
const useStylesChatFooter = () => {
	const [{ flex, maxHeight, padding }] = useStyles()
	return {
		textInput: flex.scale(10),
		focusTextInput: maxHeight(80),
		sendButton: padding.left.scale(4),
	}
}

export const ChatFooter: React.FC<{
	isFocused: boolean
	setFocus: React.Dispatch<React.SetStateAction<any>>
	convId: any
}> = ({ isFocused, setFocus, convId }) => {
	const [message, setMessage] = useState('')
	const inputRef = useRef(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ background, row, padding, flex, border, column, color }] = useStyles()
	const sendMessage = Chat.useMessageSend()
	const conversation = Chat.useGetConversation(convId)
	const isFake = conversation.kind === 'fake'

	return (
		<SafeAreaView style={background.white}>
			<View
				style={[
					row.right,
					padding.medium,
					background.white,
					_isFocused && padding.bottom.medium,
					{ alignItems: 'center' },
				]}
			>
				<View
					style={[
						flex.tiny,
						border.radius.medium,
						padding.small,
						row.fill,
						{ alignItems: 'center', backgroundColor: _isFocused ? '#E8E9FC99' : '#EDEFF3' },
					]}
				>
					<TextInput
						value={message}
						ref={inputRef}
						multiline={true}
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						onChangeText={setMessage}
						style={[
							_styles.textInput,
							_isFocused && { color: color.blue } && _styles.focusTextInput,
						]}
						placeholder='Write a secure message...'
						placeholderTextColor={_isFocused ? color.blue : color.grey}
					/>
					<TouchableOpacity
						style={[flex.tiny, _styles.sendButton]}
						disabled={isFake}
						onPress={() => {
							if (isFake) {
								return
							}
							if (message) {
								sendMessage({
									id: convId,
									type: AppMessageType.UserMessage,
									body: message,
									attachments: [],
								})
							}
							setMessage('')
						}}
					>
						<Icon
							name='paper-plane-outline'
							width={30}
							height={30}
							fill={_isFocused && !isFake ? color.blue : color.grey}
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
	date: number
}

// Styles
const useStylesChatDate = () => {
	const [{ padding, text }] = useStyles()
	return {
		date: [padding.horizontal.scale(8), padding.vertical.scale(2)],
		dateText: [text.size.small, text.color.grey, text.align.center],
	}
}

const formatTimestamp = (date: Date) => {
	const arr = date.toString().split(' ')
	return arr[1] + ' ' + arr[2] + ' ' + arr[3]
}

export const ChatDate: React.FC<ChatDateProps> = ({ date }) => {
	const _styles = useStylesChatDate()
	const [{ border, row, background }] = useStyles()
	return (
		<View style={[row.item.justify, border.radius.medium, background.light.grey, _styles.date]}>
			<Text style={_styles.dateText}>{formatTimestamp(new Date(date))}</Text>
		</View>
	)
}
