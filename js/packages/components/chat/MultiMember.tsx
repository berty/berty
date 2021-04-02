import React, { useState } from 'react'
import { TouchableOpacity, View, Platform } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { CommonActions } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import EmojiBoard from 'react-native-emoji-board'

import { KeyboardAvoidingView } from '@berty-tech/components/shared-components/KeyboardAvoidingView'
import { useStyles } from '@berty-tech/styles'
import { Routes, ScreenProps, useNavigation } from '@berty-tech/navigation'
import {
	useConversation,
	useLastConvInteraction,
	useReadEffect,
	useNotificationsInhibitor,
	useMsgrContext,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'

import { ChatFooter, ChatDate } from './common'
import BlurView from '../shared-components/BlurView'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { useLayout } from '../hooks'
import { MultiMemberAvatar } from '../avatars'
import { MessageList } from '@berty-tech/components/chat/MessageList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ReplyReactionProvider } from './ReplyReactionContext'

//
// MultiMember
//

// Styles

const HeaderMultiMember: React.FC<{
	id: string
	stickyDate?: number
	showStickyDate?: boolean
}> = ({ id, stickyDate, showStickyDate }) => {
	const { navigate, goBack } = useNavigation()
	const insets = useSafeAreaInsets()
	const [{ row, padding, flex, text, color }, { scaleSize }] = useStyles()
	const conversation = useConversation(id)
	const [layoutHeader, onLayoutHeader] = useLayout() // to position date under blur

	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={onLayoutHeader}>
			<BlurView
				blurType='light'
				blurAmount={30}
				style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
			/>
			<View
				style={[
					{
						alignItems: 'center',
						flexDirection: 'row',
						justifyContent: 'space-between',
						marginTop: insets.top,
					},
					padding.medium,
				]}
			>
				<TouchableOpacity style={[flex.tiny]} onPress={goBack}>
					<Icon
						name='arrow-back-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={color.black}
					/>
				</TouchableOpacity>
				<View style={[flex.large]}>
					<Text
						numberOfLines={1}
						style={[text.align.center, text.bold.medium, text.size.scale(20)]}
					>
						{conversation?.displayName || ''}
					</Text>
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						style={[flex.small, row.right]}
						onPress={() => navigate.chat.groupSettings({ convId: id })}
					>
						<MultiMemberAvatar publicKey={conversation?.publicKey} size={40 * scaleSize} />
					</TouchableOpacity>
				</View>
			</View>
			{!!stickyDate && !!showStickyDate && layoutHeader?.height && (
				<View
					style={{
						position: 'absolute',
						top: layoutHeader.height + 10,
						left: 0,
						right: 0,
					}}
				>
					<ChatDate date={stickyDate} />
				</View>
			)}
		</View>
	)
}

const NT = beapi.messenger.StreamEvent.Notified.Type

export const MultiMember: React.FC<ScreenProps.Chat.Group> = ({ route: { params } }) => {
	useNotificationsInhibitor((_ctx, notif) => {
		if (
			notif.type === NT.TypeMessageReceived &&
			(notif.payload as any)?.payload?.interaction?.conversationPublicKey === params?.convId
		) {
			return 'sound-only'
		}
		return false
	})
	const [{ background, flex }] = useStyles()
	const { dispatch } = useNavigation()
	useReadEffect(params.convId, 1000)
	const conv = useConversation(params?.convId)
	const { t } = useTranslation()
	const ctx = useMsgrContext()
	const insets = useSafeAreaInsets()

	const lastInte = useLastConvInteraction(params?.convId || '')
	const lastUpdate = conv?.lastUpdate || lastInte?.sentDate || conv?.createdDate || null
	const [stickyDate, setStickyDate] = useState(lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	const [isSwipe, setSwipe] = useState(true)

	return (
		<ReplyReactionProvider>
			{({ activeEmojiKeyboardCid, setActiveEmojiKeyboardCid, setActivePopoverCid }) => (
				<View style={[flex.tiny, background.white]}>
					<SwipeNavRecognizer
						onSwipeLeft={() =>
							isSwipe &&
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.MultiMemberSettings,
									params: { convId: params?.convId },
								}),
							)
						}
					>
						<KeyboardAvoidingView
							style={[flex.tiny]}
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						>
							<MessageList id={params?.convId} {...{ setStickyDate, setShowStickyDate }} />
							<ChatFooter
								convPk={params?.convId}
								placeholder={t('chat.multi-member.input-placeholder')}
								setSwipe={setSwipe}
							/>
							<HeaderMultiMember id={params?.convId} {...({ stickyDate, showStickyDate } as any)} />
						</KeyboardAvoidingView>
					</SwipeNavRecognizer>
					{!!activeEmojiKeyboardCid && (
						<EmojiBoard
							showBoard={true}
							onClick={(emoji) => {
								ctx.client
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
									.catch((e) => {
										console.warn('e sending message:', e)
									})
							}}
							onRemove={() => {
								setActivePopoverCid(activeEmojiKeyboardCid)
								setActiveEmojiKeyboardCid(null)
							}}
							containerStyle={{
								position: 'absolute',
								bottom: 0,
								paddingBottom: insets.bottom,
							}}
						/>
					)}
				</View>
			)}
		</ReplyReactionProvider>
	)
}
