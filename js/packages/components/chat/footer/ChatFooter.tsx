import Long from 'long'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty/api'
import { BottomModal } from '@berty/components'
import {
	useAppDispatch,
	useAppSelector,
	useMedias,
	useConversation,
	usePlaySound,
	useThemeColor,
	useMessengerClient,
	useMountEffect,
} from '@berty/hooks'
import {
	removeActiveReplyInteraction,
	resetChatInput,
	selectActiveReplyInteraction,
	selectChatInputMediaList,
	selectChatInputText,
	setChatInputText,
} from '@berty/redux/reducers/chatInputs.reducer'
import {
	selectChatInputIsSending,
	setChatInputIsSending,
} from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { useStateWithRef } from '@berty/utils/react-native/useStateWithRef'

import { AddFileMenu } from '../modals/add-file-modal/AddFileMenu.modal'
import { CameraButton } from './CameraButton'
import { MoreButton, RecordButton, SendButton } from './ChatFooterButtons'
import { ChatTextInput } from './ChatTextInput'
import { RecorderWrapper } from './recorder/RecorderWrapper'

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

		const mediaCids = useAppSelector(state => selectChatInputMediaList(state, convPK))
		const colors = useThemeColor()
		const activeReplyInte = useAppSelector(state => selectActiveReplyInteraction(state, convPK))
		const messengerClient = useMessengerClient()
		const playSound = usePlaySound()
		const conversation = useConversation(convPK)
		const insets = useSafeAreaInsets()
		const addedMedias = useMedias(mediaCids)
		const [isVisible, setIsVisible] = useState<boolean>(false)

		const isFake = !!(conversation as any)?.fake
		const sendEnabled = !sending && !!(!isFake && (message || mediaCids.length > 0))
		const horizontalGutter = 8
		const showQuickButtons = useMemo(
			() => !disabled && !sending && !message && mediaCids.length <= 0 && Platform.OS !== 'web',
			[disabled, mediaCids.length, message, sending],
		)

		const sendMessageBouncy = React.useCallback(
			async (additionalMedia: beapi.messenger.IMedia[] = []) => {
				try {
					if (!messengerClient) {
						throw new Error('no messenger client')
					}
					const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: message }).finish()
					const medias = [...addedMedias, ...additionalMedia].filter(
						m => m?.cid,
					) as beapi.messenger.IMedia[]
					const reply = await messengerClient.interact({
						conversationPublicKey: convPK,
						type: beapi.messenger.AppMessage.Type.TypeUserMessage,
						payload: buf,
						mediaCids: medias.map(media => media.cid) as string[],
						targetCid: activeReplyInte?.cid,
					})
					const optimisticInteraction: beapi.messenger.IInteraction = {
						medias,
						cid: reply.cid,
						conversationPublicKey: convPK,
						isMine: true,
						type: beapi.messenger.AppMessage.Type.TypeUserMessage,
						payload: buf,
						targetCid: activeReplyInte?.cid,
						sentDate: Long.fromNumber(Date.now()).toString() as unknown as Long,
					}
					dispatch({
						type: 'messenger/InteractionUpdated',
						payload: { interaction: optimisticInteraction },
					})
					dispatch(removeActiveReplyInteraction({ convPK }))
					dispatch(resetChatInput(convPK))
					setMessage('')
					playSound('messageSent')
				} catch (e) {
					console.warn('e sending message:', e)
					setSending(false)
				}
			},
			[
				activeReplyInte?.cid,
				addedMedias,
				convPK,
				playSound,
				dispatch,
				message,
				messengerClient,
				setSending,
				setMessage,
			],
		)

		const handlePressSend = React.useCallback(async () => {
			if (sending) {
				return
			}
			setSending(true)
			await sendMessageBouncy()
		}, [setSending, sendMessageBouncy, sending])

		const handleCloseFileMenu = React.useCallback(
			async (newMedias: beapi.messenger.IMedia[] | undefined) => {
				if (newMedias) {
					await sendMessageBouncy(newMedias)
				}
				setIsVisible(false)
			},
			[sendMessageBouncy],
		)

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

		// elements
		const recordIcon = React.useMemo(() => showQuickButtons && <RecordButton />, [showQuickButtons])

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
					<RecorderWrapper
						component={recordIcon}
						convPk={convPK}
						disableLockMode={false}
						disabled={!showQuickButtons}
						setSending={setSending}
						sending={sending}
					>
						<View style={styles.wrapper}>
							<View style={{ marginRight: horizontalGutter }}>
								{Platform.OS !== 'web' && (
									<MoreButton
										n={mediaCids.length}
										onPress={() => setIsVisible(true)}
										disabled={disabled || sending}
									/>
								)}
							</View>
							<ChatTextInput
								editable={!sending && !disabled}
								placeholder={sending ? t('chat.sending') : placeholder}
								onChangeText={handleTextChange}
								value={message}
								handleTabletSubmit={handlePressSend}
								convPK={convPK}
							/>
							<View style={{ marginLeft: horizontalGutter }}>
								{showQuickButtons ? (
									<>
										{Platform.OS !== 'web' && (
											<View style={{ marginRight: horizontalGutter }}>
												<CameraButton
													sending={sending}
													setSending={setSending}
													messengerClient={messengerClient}
													onClose={handleCloseFileMenu}
												/>
											</View>
										)}
									</>
								) : (
									<SendButton onPress={handlePressSend} disabled={!sendEnabled} loading={sending} />
								)}
							</View>
						</View>
					</RecorderWrapper>
				</View>
				<BottomModal isVisible={isVisible} setIsVisible={setIsVisible}>
					<AddFileMenu
						onClose={handleCloseFileMenu}
						setSending={val => {
							setSending(val)
							if (val) {
								setIsVisible(false)
							}
						}}
						sending={sending}
					/>
				</BottomModal>
			</View>
		)
	},
)

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		paddingLeft: 10,
		paddingTop: 10,
		justifyContent: 'flex-end',
		alignItems: 'center',
		minHeight: 65,
	},
})
