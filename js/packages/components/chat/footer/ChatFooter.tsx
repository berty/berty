import Long from 'long'
import React, { MutableRefObject, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
	NativeSyntheticEvent,
	Platform,
	TextInputSelectionChangeEventData,
	View,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { RESULTS } from 'react-native-permissions'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty/api'
import { ChatTextInput } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useModal } from '@berty/contexts/modal.context'
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
import { useNavigation } from '@berty/navigation'
import {
	removeActiveReplyInteraction,
	resetChatInput,
	selectActiveReplyInteraction,
	selectChatInputMediaList,
	selectChatInputText,
	setChatInputText,
} from '@berty/redux/reducers/chatInputs.reducer'
import {
	selectChatInputIsFocused,
	selectChatInputIsSending,
	setChatInputIsFocused,
	setChatInputIsSending,
	setChatInputSelection,
} from '@berty/redux/reducers/chatInputsVolatile.reducer'
import rnutil from '@berty/utils/react-native'
import { PermissionType } from '@berty/utils/react-native/permissions'
import { Maybe } from '@berty/utils/type/maybe'

import { AddFileMenu } from '../modals/add-file-modal/AddFileMenu.modal'
import { CameraButton, MoreButton, RecordButton, SendButton } from './ChatFooterButtons'
import { EmojiBanner } from './emojis/EmojiBanner'
import { RecordComponent } from './record/RecordComponent'

type ChatFooterProps = {
	convPK: string
	placeholder: string
	disabled?: Maybe<boolean>
}

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

function useStateWithRef<T>(defaultValue: T): [T, (val: T) => void, MutableRefObject<T>] {
	const [_state, _setState] = React.useState<T>(defaultValue)
	const _ref = React.useRef<T>(defaultValue)

	const setState = React.useCallback((value: T) => {
		_setState(value)
		_ref.current = value
	}, [])

	return [_state, setState, _ref]
}

export const ChatFooter: React.FC<ChatFooterProps> = React.memo(
	({ placeholder, convPK, disabled }) => {
		// external
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
		const { navigate } = useNavigation()
		const activeReplyInte = useAppSelector(state => selectActiveReplyInteraction(state, convPK))
		const { scaleSize } = useAppDimensions()
		const messengerClient = useMessengerClient()
		const playSound = usePlaySound()
		const conversation = useConversation(convPK)
		const insets = useSafeAreaInsets()
		const addedMedias = useMedias(mediaCids)
		const { hide, show } = useModal()
		const isFocused = useAppSelector(state => selectChatInputIsFocused(state, convPK))

		// computed
		const isFake = !!(conversation as any)?.fake
		const sendEnabled = !sending && !!(!isFake && (message || mediaCids.length > 0))
		const horizontalGutter = 8 * scaleSize
		const showQuickButtons = useMemo(
			() => !disabled && !sending && !message && mediaCids.length <= 0 && Platform.OS !== 'web',
			[disabled, mediaCids.length, message, sending],
		)

		// callbacks

		const setIsFocused = (isFocused: boolean) => {
			dispatch(setChatInputIsFocused({ convPK, isFocused }))
		}
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
				hide()
			},
			[hide, sendMessageBouncy],
		)

		const prepareMediaAndSend = React.useCallback(
			async (res: (beapi.messenger.IMedia & { uri?: string })[]) => {
				try {
					if (sending) {
						return
					}
					setSending(true)
					if (!messengerClient) {
						throw new Error('no messenger client')
					}
					const medias = await amap(res, async doc => {
						const stream = await messengerClient.mediaPrepare({})
						await stream.emit({
							info: {
								filename: doc.filename,
								mimeType: doc.mimeType,
								displayName: doc.displayName || doc.filename || 'document',
							},
							uri: doc.uri,
						})
						const reply = await stream.stopAndRecv()
						const optimisticMedia: beapi.messenger.IMedia = {
							cid: reply.cid,
							filename: doc.filename,
							mimeType: doc.mimeType,
							displayName: doc.displayName || doc.filename || 'document',
						}
						return optimisticMedia
					})

					await handleCloseFileMenu(medias)
				} catch (err) {
					console.warn('failed to prepare media and send message:', err)
				}
				setSending(false)
			},
			[messengerClient, handleCloseFileMenu, sending, setSending],
		)

		const handlePressCamera = React.useCallback(async () => {
			const permissionStatus = await rnutil.checkPermissions(PermissionType.camera, {
				navigate,
				navigateToPermScreenOnProblem: true,
			})
			if (permissionStatus !== RESULTS.GRANTED) {
				return
			}

			try {
				await ImagePicker.clean()
			} catch (err) {
				console.warn('failed to clean image picker:', err)
			}
			try {
				const image = await ImagePicker.openCamera({
					cropping: false,
				})

				if (image) {
					await prepareMediaAndSend([
						{
							filename: '',
							uri: image.path || image.sourceURL || '',
							mimeType: image.mime,
						},
					])
				}
			} catch (err) {
				console.warn('failed to send quick picture:', err)
			}
		}, [navigate, prepareMediaAndSend])

		const handlePressMore = React.useCallback(() => {
			show(
				<AddFileMenu
					onClose={handleCloseFileMenu}
					setSending={val => {
						setSending(val)
						if (val) {
							hide()
						}
					}}
					sending={sending}
				/>,
			)
		}, [handleCloseFileMenu, hide, sending, setSending, show])

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

		const handleSelectionChange = React.useCallback(
			(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
				if (isFocused) {
					dispatch(setChatInputSelection({ convPK, selection: e.nativeEvent.selection }))
				}
			},
			[convPK, dispatch, isFocused],
		)

		// elements
		const recordIcon = React.useMemo(() => showQuickButtons && <RecordButton />, [showQuickButtons])

		// render
		return (
			<View style={{ backgroundColor: colors['main-background'] }}>
				<EmojiBanner convPk={convPK} />
				<View
					style={{
						paddingLeft: 10 * scaleSize,
						paddingTop: 10 * scaleSize,
						paddingBottom: insets.bottom || 18 * scaleSize,
						justifyContent: 'flex-end',
						alignItems: 'center',
						minHeight: 65 * scaleSize,
						backgroundColor: colors['main-background'],
					}}
				>
					<RecordComponent
						component={recordIcon}
						convPk={convPK}
						disableLockMode={false}
						disabled={!showQuickButtons}
						setSending={setSending}
						sending={sending}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<View style={{ marginRight: horizontalGutter }}>
								{Platform.OS !== 'web' && (
									<MoreButton
										n={mediaCids.length}
										onPress={handlePressMore}
										disabled={disabled || sending}
									/>
								)}
							</View>
							<ChatTextInput
								editable={!sending && !disabled}
								placeholder={sending ? t('chat.sending') : placeholder}
								onChangeText={handleTextChange}
								onSelectionChange={handleSelectionChange}
								value={message}
								onFocusChange={setIsFocused}
								handleTabletSubmit={handlePressSend}
								convPK={convPK}
								accessibilityLabel={placeholder || undefined}
							/>
							<View style={{ marginLeft: horizontalGutter }}>
								{showQuickButtons ? (
									<>
										{Platform.OS !== 'web' && (
											<View style={{ marginRight: horizontalGutter }}>
												<CameraButton onPress={handlePressCamera} />
											</View>
										)}
									</>
								) : (
									<SendButton onPress={handlePressSend} disabled={!sendEnabled} loading={sending} />
								)}
							</View>
						</View>
					</RecordComponent>
				</View>
			</View>
		)
	},
)
