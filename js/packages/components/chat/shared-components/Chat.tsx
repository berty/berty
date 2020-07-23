import React, { useRef, useState, useEffect } from 'react'
import { TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native'
import { Icon, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Messenger } from '@berty-tech/hooks'
import { messenger } from '@berty-tech/store'
import { BlurView } from '@react-native-community/blur'
import { scaleHeight } from '@berty-tech/styles/constant'
//
// ChatFooter => Textinput for type message
//

// Styles
const useStylesChatFooter = () => {
	const [{ flex, maxHeight, padding, maxWidth, row }] = useStyles()
	return {
		textInput: { ...flex.small, flexGrow: 2, ...padding.right.scale(10) },
		focusTextInput: maxHeight(80),
		sendButton: {
			...flex.tiny,
			flexGrow: 1,
			...maxWidth(30),
			...row.item.center,
		},
	}
}

export const ChatFooter: React.FC<{
	isFocused: boolean
	setFocus: React.Dispatch<React.SetStateAction<any>>
	convId: string
}> = ({ isFocused, setFocus, convId }) => {
	const [message, setMessage] = useState('')
	const [isSubmit, setIsSubmit] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ row, padding, flex, border, color, background }] = useStyles()
	const sendMessage = Messenger.useMessageSend()
	const conversation = Messenger.useGetConversation(convId)

	if (!conversation) {
		return null
	}
	const isFake = conversation.fake
	return (
		<BlurView blurType='light' blurAmount={30}>
			<SafeAreaView>
				<View
					style={[
						row.right,
						padding.medium,
						_isFocused && padding.bottom.medium,
						flex.align.center,
					]}
				>
					<View
						style={[
							flex.tiny,
							border.radius.medium,
							padding.small,
							row.fill,
							flex.align.center,
							{ backgroundColor: _isFocused ? '#E8E9FC99' : '#EDEFF3' },
						]}
					>
						<TextInput
							value={message}
							ref={inputRef}
							multiline
							autoFocus
							onFocus={() => setFocus(true)}
							onBlur={() => setFocus(false)}
							onChange={({ nativeEvent }) => {
								isSubmit ? setMessage('') : setMessage(nativeEvent.text)
								setIsSubmit(false)
							}}
							autoCorrect={false}
							onSubmitEditing={() => {
								setIsSubmit(true)
								if (isFake) {
									return
								}
								if (message) {
									sendMessage({
										id: convId,
										type: messenger.AppMessageType.UserMessage,
										body: message,
										attachments: [],
										sentDate: Date.now(),
									})
								}
							}}
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
										type: messenger.AppMessageType.UserMessage,
										body: message,
										attachments: [],
										sentDate: Date.now(),
									})
								}
								setMessage('')
							}}
						>
							<Icon
								name='paper-plane-outline'
								width={30 * scaleHeight}
								height={30 * scaleHeight}
								fill={!isFake && message.length >= 1 ? color.blue : color.grey}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</BlurView>
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
