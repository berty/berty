import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { RESULTS } from '../../../rnutil/react-native-permissions'
import Long from 'long'
import { useTranslation } from 'react-i18next'

import { Maybe, useMessengerClient, useMessengerContext, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import {
	resetChatInput,
	selectChatInputMediaList,
	selectChatInputText,
	setChatInputText,
} from '@berty-tech/redux/reducers/chatInputs.reducer'
import {
	selectChatInputSending,
	setChatInputSending,
} from '@berty-tech/redux/reducers/chatInputsVolatile.reducer'
import beapi from '@berty-tech/api'
import { useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import { useAppDispatch, useAppSelector, useMedias, useConversation } from '@berty-tech/react-redux'
import { setChecklistItemDone } from '@berty-tech/redux/reducers/checklist.reducer'

import { useReplyReaction } from '../ReplyReactionContext'
import { CameraButton, MoreButton, RecordButton, SendButton } from './ChatFooterButtons'
import { ChatTextInput } from './ChatTextInput'
import { RecordComponent } from './record/RecordComponent'
import { AddFileMenu } from './file-uploads/AddFileMenu'

export type ChatFooterProps = {
	convPK: string
	disabled?: Maybe<boolean>
	placeholder?: Maybe<string>
}

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const ChatFooter: React.FC<ChatFooterProps> = React.memo(
	({ placeholder, convPK, disabled }) => {
		// external
		const { t } = useTranslation()
		const dispatch = useAppDispatch()
		const sending = useAppSelector(state => selectChatInputSending(state, convPK))
		const setSending = React.useCallback(
			(value: boolean) => dispatch(setChatInputSending({ convPK, value })),
			[dispatch, convPK],
		)
		const message = useAppSelector(state => selectChatInputText(state, convPK))
		const mediaCids = useAppSelector(state => selectChatInputMediaList(state, convPK))
		const colors = useThemeColor()
		const { navigate } = useNavigation()
		const { activeReplyInte, setActiveReplyInte } = useReplyReaction() // FIXME: move to redux
		const [, { scaleSize }] = useStyles()
		const messengerClient = useMessengerClient()
		const ctx = useMessengerContext()
		const conversation = useConversation(convPK)
		const insets = useSafeAreaInsets()
		const addedMedias = useMedias(mediaCids)

		// local
		const [isFocused, setIsFocused] = React.useState<boolean>(false)
		const [showAddFileMenu, setShowAddFileMenu] = React.useState(false)

		// computed
		const isFake = !!(conversation as any)?.fake
		const sendEnabled = !sending && !!(!isFake && (message || mediaCids.length > 0))
		const horizontalGutter = 8 * scaleSize
		const showQuickButtons =
			!disabled && !sending && !message && !isFocused && mediaCids.length <= 0

		// callbacks
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
					console.log('media', medias)
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
					setActiveReplyInte()
					dispatch(setChecklistItemDone({ key: 'message' }))
					dispatch(resetChatInput(convPK))
					ctx.playSound('messageSent')
				} catch (e) {
					console.warn('e sending message:', e)
					setSending(false)
				}
			},
			[
				message,
				convPK,
				ctx,
				activeReplyInte?.cid,
				setActiveReplyInte,
				dispatch,
				messengerClient,
				addedMedias,
				setSending,
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
				setShowAddFileMenu(false)
			},
			[sendMessageBouncy],
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
			const permissionStatus = await rnutil.checkPermissions('camera', navigate, {
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

				await prepareMediaAndSend([
					{
						filename: '',
						uri: image.path || image.sourceURL || '',
						mimeType: image.mime,
					},
				])
			} catch (err) {
				console.warn('failed to send quick picture:', err)
			}
		}, [navigate, prepareMediaAndSend])

		const handlePressMore = React.useCallback(() => {
			setShowAddFileMenu(true)
		}, [setShowAddFileMenu])

		const handleTextChange = React.useCallback(
			(text: string) => {
				if (sending) {
					return
				}
				dispatch(setChatInputText({ convPK, text }))
			},
			[dispatch, sending, convPK],
		)

		// elements
		const recordIcon = React.useMemo(() => showQuickButtons && <RecordButton />, [showQuickButtons])

		// render
		return (
			<View style={{ backgroundColor: colors['main-background'] }}>
				<View
					style={{
						paddingLeft: 10 * scaleSize,
						paddingTop: 10 * scaleSize,
						marginBottom: (isFocused ? 0 : insets.bottom) || 18 * scaleSize,
						justifyContent: 'flex-end',
						alignItems: 'center',
						minHeight: 65 * scaleSize,
					}}
				>
					{showAddFileMenu && (
						<AddFileMenu
							onClose={handleCloseFileMenu}
							setSending={val => {
								setSending(val)
								if (val) {
									setShowAddFileMenu(false)
								}
							}}
							sending={sending}
						/>
					)}
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
								alignItems: 'flex-end',
							}}
						>
							<View style={{ marginRight: horizontalGutter }}>
								<MoreButton
									n={mediaCids.length}
									onPress={handlePressMore}
									disabled={disabled || sending}
								/>
							</View>
							<ChatTextInput
								disabled={(!isFocused && sending) || disabled}
								handleTabletSubmit={handlePressSend}
								placeholder={sending ? t('chat.sending') : placeholder}
								onFocusChange={setIsFocused}
								onChangeText={handleTextChange}
								value={message}
							/>
							<View style={{ marginLeft: horizontalGutter }}>
								{showQuickButtons ? (
									<View style={{ marginRight: horizontalGutter }}>
										<CameraButton onPress={handlePressCamera} />
									</View>
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
