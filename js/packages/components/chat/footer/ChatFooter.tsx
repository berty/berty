import Long from 'long'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty/api'
import {
	useAppDispatch,
	useAppSelector,
	useConversation,
	usePlaySound,
	useThemeColor,
	useMessengerClient,
	useMountEffect,
} from '@berty/hooks'
import {
	resetChatInput,
	selectChatInputText,
	setChatInputText,
} from '@berty/redux/reducers/chatInputs.reducer'
import {
	selectChatInputIsSending,
	setChatInputIsSending,
} from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { useStateWithRef } from '@berty/utils/react-native/useStateWithRef'

import { SendButton } from './ChatFooterButtons'
import { ChatTextInput } from './ChatTextInput'

type ChatFooterProps = {
	convPK: string
	placeholder: string
	disabled?: boolean
}

export const ChatFooter: React.FC<ChatFooterProps> = React.memo(
	({ placeholder, convPK, disabled }) => {
		const { t } = useTranslation()
		const dispatch = useAppDispatch()
		const sending = useAppSelector(state => selectChatInputIsSending(state, convPK))
		const setSending = React.useCallback(
			(isSending: boolean) => dispatch(setChatInputIsSending({ convPK, isSending })),
			[dispatch, convPK],
		)

		const draftMessage = useAppSelector(state => selectChatInputText(state, convPK))
		const [message, setMessage, messageRef] = useStateWithRef(draftMessage)

		const colors = useThemeColor()
		const messengerClient = useMessengerClient()
		const playSound = usePlaySound()
		const conversation = useConversation(convPK)
		const insets = useSafeAreaInsets()

		const isFake = !!(conversation as any)?.fake
		const sendEnabled = !sending && !!(!isFake && message)

		const sendMessageBouncy = React.useCallback(async () => {
			try {
				if (!messengerClient) {
					throw new Error('no messenger client')
				}
				const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: message }).finish()
				const reply = await messengerClient.interact({
					conversationPublicKey: convPK,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
				const optimisticInteraction: beapi.messenger.IInteraction = {
					cid: reply.cid,
					conversationPublicKey: convPK,
					isMine: true,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
					sentDate: Long.fromNumber(Date.now()).toString() as unknown as Long,
				}
				dispatch({
					type: 'messenger/InteractionUpdated',
					payload: { interaction: optimisticInteraction },
				})
				dispatch(resetChatInput(convPK))
				setMessage('')
				playSound('messageSent')
			} catch (e) {
				console.warn('e sending message:', e)
				setSending(false)
			}
		}, [convPK, playSound, dispatch, message, messengerClient, setSending, setMessage])

		const handlePressSend = React.useCallback(async () => {
			if (sending) {
				return
			}
			setSending(true)
			await sendMessageBouncy()
		}, [setSending, sendMessageBouncy, sending])

		const handleTextChange = React.useCallback(
			(text: string) => {
				if (sending) {
					return
				}
				setMessage(text)
			},
			[sending, setMessage],
		)

		useMountEffect(() => {
			// Saving the draft is debounced because doing encryption + storage on every keystroke takes too much cpu
			const interval = setInterval(() => {
				dispatch(setChatInputText({ convPK, text: messageRef.current }))
			}, 5000)
			return () => {
				clearInterval(interval)
				dispatch(setChatInputText({ convPK, text: messageRef.current }))
			}
		})

		// render
		return (
			<View style={{ backgroundColor: colors['main-background'] }}>
				<View
					style={[
						styles.container,
						{
							paddingBottom: insets.bottom || 18,
							backgroundColor: colors['main-background'],
						},
					]}
				>
					<View style={styles.wrapper}>
						<ChatTextInput
							editable={!sending && !disabled}
							placeholder={sending ? t('chat.sending') : placeholder}
							onChangeText={handleTextChange}
							value={message}
							handleTabletSubmit={handlePressSend}
							convPK={convPK}
						/>
						<View style={styles.send}>
							<SendButton onPress={handlePressSend} disabled={!sendEnabled} loading={sending} />
						</View>
					</View>
				</View>
			</View>
		)
	},
)

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	send: {
		marginLeft: 10,
	},
	container: {
		paddingLeft: 10,
		paddingTop: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		minHeight: 65,
	},
})
