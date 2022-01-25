import React, { useState } from 'react'
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EmojiBoard from 'react-native-emoji-board'
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'
import { useHeaderHeight } from '@react-navigation/elements'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import beapi from '@berty-tech/api'
import {
	useMessengerContext,
	useReadEffect,
	useNotificationsInhibitor,
	useThemeColor,
	pbDateToNum,
	useMessengerClient,
} from '@berty-tech/store'
import { CustomTitleStyle } from '@berty-tech/navigation/stacks'
import { IOSOnlyKeyboardAvoidingView } from '@berty-tech/rnutil/keyboardAvoiding'
import { useContact, useConversation } from '@berty-tech/react-redux'

import { ContactAvatar } from '../avatars'
import { ChatDate } from './common'
import { ReplyReactionProvider } from './ReplyReactionContext'
import { MessageList } from '../chat/MessageList'
import { ChatFooter } from './footer/ChatFooter'

//
// Chat
//

const NT = beapi.messenger.StreamEvent.Notified.Type

export const OneToOne: ScreenFC<'Chat.OneToOne'> = React.memo(
	({ route: { params }, navigation }) => {
		useNotificationsInhibitor((_ctx, notif) => {
			if (
				(notif.type === NT.TypeContactRequestSent &&
					(notif.payload as any)?.payload?.contact?.conversationPublicKey === params?.convId) ||
				(notif.type === NT.TypeMessageReceived &&
					(notif.payload as any)?.payload?.interaction?.conversationPublicKey === params?.convId)
			) {
				return 'sound-only'
			}
			return false
		})

		const insets = useSafeAreaInsets()
		const [{ opacity, flex }, { scaleSize }] = useStyles()
		const colors = useThemeColor()
		useReadEffect(params?.convId, 1000)
		const { t } = useTranslation()
		const conv = useConversation(params?.convId)
		const contact = useContact(conv?.contactPublicKey)
		const ctx = useMessengerContext()
		const client = useMessengerClient()
		const { navigate } = navigation

		const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
		const isFooterDisable = isIncoming
		const placeholder = isFooterDisable
			? t('chat.one-to-one.incoming-input-placeholder')
			: t('chat.one-to-one.input-placeholder')

		const [stickyDate, setStickyDate] = useState(conv?.lastUpdate || null)
		const [showStickyDate, setShowStickyDate] = useState(false)
		const [keyboardIsHidden, setKeyboardIsHidden] = useState(false)
		const headerHeight = useHeaderHeight()

		useFocusEffect(
			React.useCallback(() => {
				AndroidKeyboardAdjust?.setAdjustResize()
				return () => AndroidKeyboardAdjust?.setAdjustPan()
			}, []),
		)

		useFocusEffect(
			React.useCallback(() => {
				Keyboard.dismiss()
				setTimeout(() => {
					setKeyboardIsHidden(true)
				}, 50)
			}, []),
		)

		React.useLayoutEffect(() => {
			navigation.setOptions({
				title: (conv as any)?.fake ? `FAKE - ${contact?.displayName}` : contact?.displayName || '',
				...CustomTitleStyle,
				headerRight: () => (
					<TouchableOpacity
						activeOpacity={contact ? 0.2 : 0.5}
						style={[!contact ? opacity(0.5) : null]}
						onPress={() => navigate('Chat.OneToOneSettings', { convId: params.convId })}
					>
						<ContactAvatar size={40 * scaleSize} publicKey={conv?.contactPublicKey} />
					</TouchableOpacity>
				),
			})
		})

		if (!keyboardIsHidden) {
			return null
		}

		return (
			<IOSOnlyKeyboardAvoidingView
				behavior='padding'
				keyboardVerticalOffset={headerHeight}
				style={[{ flex: 1, backgroundColor: colors['main-background'] }]}
			>
				<ReplyReactionProvider>
					{({ activeEmojiKeyboardCid, setActiveEmojiKeyboardCid, setActivePopoverCid }: any) => {
						const onRemoveEmojiBoard = () => {
							setActivePopoverCid(activeEmojiKeyboardCid)
							setActiveEmojiKeyboardCid(null)
						}
						return (
							<View style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
								<View style={[flex.tiny]}>
									<MessageList
										id={params.convId}
										scrollToMessage={params.scrollToMessage || '0'}
										{...{ setStickyDate, setShowStickyDate }}
									/>
									<ChatFooter
										convPK={params.convId}
										disabled={isFooterDisable}
										placeholder={placeholder}
									/>
									{stickyDate && showStickyDate && (
										<View
											style={{
												position: 'absolute',
												top: 110, // TODO Redifine
												left: 0,
												right: 0,
											}}
										>
											<ChatDate date={pbDateToNum(stickyDate)} />
										</View>
									)}
								</View>
								{!!activeEmojiKeyboardCid && (
									<View style={StyleSheet.absoluteFill}>
										<TouchableOpacity
											style={[StyleSheet.absoluteFill, { flex: 1 }]}
											activeOpacity={0.9}
											onPress={onRemoveEmojiBoard}
										/>
										<EmojiBoard
											showBoard={true}
											onClick={(emoji: { name: string }) => {
												client
													?.interact({
														conversationPublicKey: conv?.publicKey,
														type: beapi.messenger.AppMessage.Type.TypeUserReaction,
														payload: beapi.messenger.AppMessage.UserReaction.encode({
															emoji: `:${emoji.name}:`,
															state: true,
														}).finish(),
														targetCid: activeEmojiKeyboardCid,
													})
													.then(() => {
														ctx.playSound('messageSent')
														setActivePopoverCid(null)
														setActiveEmojiKeyboardCid(null)
													})
													.catch((e: unknown) => {
														console.warn('e sending message:', e)
													})
											}}
											onRemove={onRemoveEmojiBoard}
											containerStyle={{
												position: 'absolute',
												bottom: 0,
												paddingBottom: insets.bottom,
											}}
										/>
									</View>
								)}
							</View>
						)
					}}
				</ReplyReactionProvider>
			</IOSOnlyKeyboardAvoidingView>
		)
	},
)
