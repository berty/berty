import React, { useRef, useState } from 'react'
import { TouchableOpacity, SafeAreaView, View, TextInput } from 'react-native'
import { Icon, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'

import BlurView from '../../shared-components/BlurView'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { timeFormat } from '../../helpers'

// import { SafeAreaView } from 'react-native-safe-area-context'
//
// ChatFooter => Textinput for type message
//

// Styles
const useStylesChatFooter = () => {
	const [{ flex, maxHeight, padding }] = useStyles()
	return {
		textInput: flex.scale(8),
		focusTextInput: maxHeight(80),
		sendButton: padding.left.scale(4),
	}
}

export const ChatFooter: React.FC<{
	isFocused: boolean
	setFocus: React.Dispatch<React.SetStateAction<any>>
	convPk: string
	disabled: boolean
}> = ({ isFocused, setFocus, convPk, disabled }) => {
	const ctx: any = useMsgrContext()

	const [message, setMessage] = useState('')
	const [isSubmit, setIsSubmit] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ row, padding, flex, border, color, text }] = useStyles()

	const usermsg = { body: message, sentDate: Date.now() }
	const buf = messengerpb.AppMessage.UserMessage.encode(usermsg).finish()

	const conversation = ctx.conversations[convPk]

	// TODO: Debug, error on restarting node
	const handleSend = React.useCallback(() => {
		ctx.client
			?.interact({
				conversationPublicKey: convPk,
				type: messengerpb.AppMessage.Type.TypeUserMessage,
				payload: buf,
			})
			.catch((e: any) => {
				console.warn('e sending message:', e)
			})
	}, [convPk, ctx.client, buf])

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
						padding.horizontal.medium,
						padding.top.medium,
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
							{
								alignItems: 'center',
								backgroundColor: _isFocused ? '#E8E9FC99' : '#F7F8FF',
								marginBottom: _isFocused ? 0 : 16,
							},
						]}
					>
						<TextInput
							value={message}
							ref={inputRef}
							multiline
							editable={disabled ? false : true}
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
									handleSend()
								}
							}}
							style={[
								_styles.textInput,
								_isFocused && { color: color.blue } && _styles.focusTextInput,
								text.bold.small,
								{ fontFamily: 'Open Sans' },
							]}
							placeholder={
								disabled ? 'Accept the request to write here...' : 'Write a secure message...'
							}
							placeholderTextColor={_isFocused ? color.blue : '#AFB1C0'}
						/>
						<TouchableOpacity
							style={[flex.tiny, { justifyContent: 'center', alignItems: 'center' }]}
							disabled={isFake}
							onPress={() => {
								if (isFake) {
									return
								}
								if (message) {
									handleSend()
								}
								setMessage('')
							}}
						>
							<Icon
								name='paper-plane-outline'
								width={26}
								height={26}
								fill={!isFake && message.length >= 1 ? color.blue : '#AFB1C0'}
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
		dateText: [text.size.small, text.align.center],
	}
}

// const formatTimestamp = (date: Date) => {
// 	const arr = date.toString().split(' ')
// 	return arr[1] + ' ' + arr[2] + ' ' + arr[3]
// }

export const ChatDate: React.FC<ChatDateProps> = ({ date }) => {
	const _styles = useStylesChatDate()
	const [{ border, row }] = useStyles()
	const backgroundColor = '#F7F8FF'
	const textColor = '#AFB1C0'
	return (
		<View style={[row.item.justify, border.radius.medium, _styles.date, { backgroundColor }]}>
			<Text style={[_styles.dateText, { color: textColor }]}>
				{/* {formatTimestamp(new Date(date))} */}
				{timeFormat.fmtTimestamp2(date)}
			</Text>
		</View>
	)
}
