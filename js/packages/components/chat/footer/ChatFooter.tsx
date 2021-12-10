import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ImagePicker from 'react-native-image-crop-picker'
import { RESULTS } from 'react-native-permissions'

import {
	Maybe,
	setCheckListItemDone,
	useConversation,
	useMessengerClient,
	useMessengerContext,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import {
	resetChatInput,
	selectChatInputMediaList,
	selectChatInputText,
	setChatInputText,
} from '@berty-tech/redux/reducers/chatInputs.reducer'
import beapi from '@berty-tech/api'
import { useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import { useAppDispatch, useAppSelector } from '@berty-tech/redux/react-redux'

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
		const dispatch = useAppDispatch()
		const message = useAppSelector(state => selectChatInputText(state, convPK))
		const mediaCids = useAppSelector(state => selectChatInputMediaList(state, convPK))

		const { navigate } = useNavigation()
		const { activeReplyInte, setActiveReplyInte } = useReplyReaction() // FIXME: move to redux
		const [, { scaleSize }] = useStyles()
		const messengerClient = useMessengerClient()
		const ctx = useMessengerContext()
		const conversation = useConversation(convPK)
		const insets = useSafeAreaInsets()

		// local
		const [sending, setSending] = React.useState<boolean>(false)
		const [isFocused, setIsFocused] = React.useState<boolean>(false)
		const [showAddFileMenu, setShowAddFileMenu] = React.useState(false)

		// computed
		const isFake = !!conversation?.fake
		const sendEnabled = !sending && !!(!isFake && (message || mediaCids.length > 0))
		const horizontalGutter = 8 * scaleSize
		const showQuickButtons = !sending && !message && !isFocused && mediaCids.length <= 0

		// callbacks
		const sendMessageBouncy = React.useCallback(
			async (additionalMedia: string[] = []) => {
				try {
					if (!messengerClient) {
						throw new Error('no messenger client')
					}
					const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: message }).finish()
					const media = [...mediaCids, ...additionalMedia]
					console.log('media', media)
					await messengerClient.interact({
						conversationPublicKey: convPK,
						type: beapi.messenger.AppMessage.Type.TypeUserMessage,
						payload: buf,
						mediaCids: media,
						targetCid: activeReplyInte?.cid,
					})
					dispatch(resetChatInput(convPK))
					ctx.playSound('messageSent')
					setActiveReplyInte()
					await setCheckListItemDone(ctx, 'message')
				} catch (e) {
					console.warn('e sending message:', e)
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
				mediaCids,
			],
		)

		const handlePressSend = React.useCallback(async () => {
			if (sending) {
				return
			}
			setSending(true)
			await sendMessageBouncy()
			setSending(false)
		}, [setSending, sendMessageBouncy, sending])

		const handleCloseFileMenu = React.useCallback(
			async (newMedias: string[] | undefined) => {
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
					const mediaCids = (
						await amap(res, async doc => {
							const stream = await messengerClient.mediaPrepare({})
							await stream?.emit({
								info: { filename: doc.filename, mimeType: doc.mimeType, displayName: doc.filename },
								uri: doc.uri,
							})
							const reply = await stream?.stopAndRecv()
							return reply?.cid
						})
					).filter(cid => !!cid)

					await handleCloseFileMenu(mediaCids)
				} catch (err) {
					console.warn('failed to prepare media and send message:', err)
				}
				setSending(false)
			},
			[messengerClient, handleCloseFileMenu, sending],
		)

		const handlePressCamera = React.useCallback(async () => {
			const permissionStatus = await rnutil.checkPermissions('camera', navigate)
			if (permissionStatus !== RESULTS.GRANTED) {
				console.warn('camera permission:', permissionStatus)
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
			<View style={{ backgroundColor: 'white' }}>
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
					{showAddFileMenu && <AddFileMenu onClose={handleCloseFileMenu} />}
					<RecordComponent
						component={recordIcon}
						convPk={convPK}
						disableLockMode={false}
						disabled={!showQuickButtons}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'flex-end',
							}}
						>
							<View style={{ marginRight: horizontalGutter }}>
								<MoreButton n={mediaCids.length} onPress={handlePressMore} />
							</View>

							<ChatTextInput
								disabled={disabled}
								handleTabletSubmit={handlePressSend}
								placeholder={placeholder}
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
