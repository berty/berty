import React, { useCallback, useRef, useState } from 'react'
import {
	TouchableOpacity,
	SafeAreaView,
	View,
	TextInput,
	NativeModules,
	Platform,
} from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useMsgrContext } from '@berty-tech/store/hooks'

import { AddFileMenu } from './file-uploads/AddFileMenu'
import { timeFormat } from '../helpers'
import BlurView from '../shared-components/BlurView'

const {
	PlatformConstants: { interfaceIdiom: deviceType },
} = NativeModules

const isTablet = deviceType === 'pad'
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
	setSwipe: (val: boolean) => void
}> = ({ isFocused, setFocus, convPk, disabled = false, placeholder, setSwipe }) => {
	const ctx = useMsgrContext()

	const [message, setMessage] = useState('')
	const [showAddFileMenu, setShowAddFileMenu] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ row, padding, flex, border, color, text, margin }] = useStyles()
	const [mediaCids, setMediaCids] = useState<string[]>([])

	const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: message }).finish()

	const conversation = ctx.conversations[convPk]

	const isFake = (conversation as { fake: boolean }).fake
	const sendEnabled = !!(!isFake && (message || mediaCids.length > 0))

	const sendMessage = useCallback(
		(medias: string[] = []) => {
			ctx.client
				?.interact({
					conversationPublicKey: convPk,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
					mediaCids: medias,
				})
				.then(() => {
					setMessage('')
					setMediaCids([])
					ctx.playSound('messageSent')
				})
				.catch((e) => {
					console.warn('e sending message:', e)
				})
		},
		[buf, convPk, ctx],
	)

	// TODO: Debug, error on restarting node
	const handlePressSend = React.useCallback(() => {
		console.log('recompute handleSend', mediaCids)
		if (!sendEnabled) {
			return
		}
		sendMessage()
	}, [mediaCids, sendEnabled, sendMessage])

	const handleCloseFileMenu = (newMedias: string[] | undefined) => {
		if (newMedias) {
			sendMessage([...mediaCids, ...newMedias])
		}
		setShowAddFileMenu(false)
		setSwipe(true)
	}

	if (!conversation) {
		return null
	}

	return (
		<BlurView blurType='light' blurAmount={30}>
			<SafeAreaView>
				{showAddFileMenu ? <AddFileMenu onClose={handleCloseFileMenu} /> : null}
				<View
					style={[
						row.right,
						padding.horizontal.medium,
						padding.top.medium,
						_isFocused && padding.bottom.medium,
						{ alignItems: 'center', backgroundColor: 'transparent' },
					]}
				>
					<TouchableOpacity
						style={[
							{
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: '#F7F8FF',
								marginBottom: _isFocused ? 0 : 16,
							},
							padding.small,
							border.radius.small,
							margin.right.small,
						]}
						onPress={() => {
							setSwipe(false)
							setShowAddFileMenu(true)
						}}
					>
						{mediaCids.length > 0 && <Text>{mediaCids.length}</Text>}
						<Icon name='plus' width={26} height={26} fill='#C7C8D8' />
					</TouchableOpacity>
					<View
						style={[
							flex.tiny,
							border.radius.medium,
							Platform.OS === 'android' ? padding.horizontal.small : padding.small,
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
							autoCorrect
							style={[
								_styles.textInput,
								_isFocused && { color: color.blue } && _styles.focusTextInput,
								text.bold.small,
								{ fontFamily: 'Open Sans' },
							]}
							placeholder={placeholder}
							placeholderTextColor={_isFocused ? color.blue : '#AFB1C0'}
							returnKeyType={isTablet ? 'send' : 'default'}
							onSubmitEditing={() => isTablet && handlePressSend()}
						/>
						<TouchableOpacity
							style={[flex.tiny, { justifyContent: 'center', alignItems: 'center' }]}
							disabled={!sendEnabled}
							onPress={handlePressSend}
						>
							<Icon
								name='paper-plane-outline'
								width={26}
								height={26}
								fill={sendEnabled ? color.blue : '#AFB1C0'}
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
