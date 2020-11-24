import React, { useRef, useState } from 'react'
import { TouchableOpacity, SafeAreaView, View, TextInput } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useMsgrContext } from '@berty-tech/store/hooks'

import { timeFormat } from '../../helpers'
import { playSound } from '../../sounds'
import BlurView from '../../shared-components/BlurView'

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
	disabled?: boolean
	placeholder: string
}> = ({ isFocused, setFocus, convPk, disabled = false, placeholder }) => {
	const ctx: any = useMsgrContext()

	const [message, setMessage] = useState('')
	const inputRef = useRef<TextInput>(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ row, padding, flex, border, color, text }] = useStyles()

	const usermsg = { body: message, sentDate: Date.now() }
	const buf = beapi.messenger.AppMessage.UserMessage.encode(usermsg).finish()

	const conversation = ctx.conversations[convPk]

	// TODO: Debug, error on restarting node
	const handleSend = React.useCallback(() => {
		ctx.client
			?.interact({
				conversationPublicKey: convPk,
				type: beapi.messenger.AppMessage.Type.TypeUserMessage,
				payload: buf,
			})
			.then(() => {
				playSound('messageSent')
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
							onChange={({ nativeEvent }) => setMessage(nativeEvent.text)}
							autoCorrect={false}
							style={[
								_styles.textInput,
								_isFocused && { color: color.blue } && _styles.focusTextInput,
								text.bold.small,
								{ fontFamily: 'Open Sans' },
							]}
							placeholder={placeholder}
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

export const ChatDate: React.FC<ChatDateProps> = ({ date }) => {
	const _styles = useStylesChatDate()
	const [{ border, row }] = useStyles()
	const backgroundColor = '#F7F8FF'
	const textColor = '#AFB1C0'
	return (
		<View style={[row.item.justify, border.radius.medium, _styles.date, { backgroundColor }]}>
			<Text style={[_styles.dateText, { color: textColor }]}>{timeFormat.fmtTimestamp2(date)}</Text>
		</View>
	)
}
