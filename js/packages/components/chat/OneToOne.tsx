import React, { useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EmojiBoard from 'react-native-emoji-board'
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import beapi from '@berty-tech/api'
import {
	useContact,
	useMsgrContext,
	useConversation,
	useReadEffect,
	useNotificationsInhibitor,
	useThemeColor,
	useConvInteractions,
} from '@berty-tech/store/hooks'
import { CustomTitleStyle } from '@berty-tech/navigation/stacks'

import { ContactAvatar } from '../avatars'
import { useLayout } from '../hooks'
import { ChatDate, ChatFooter } from './common'
import { ReplyReactionProvider } from './ReplyReactionContext'
import { KeyboardAvoidingView } from '../shared-components/KeyboardAvoidingView'
import { MessageList } from '../chat/MessageList'

//
// Chat
//

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

export const ChatHeader: React.FC<{ convPk: any; stickyDate: any; showStickyDate: any }> = ({
	convPk,
	stickyDate,
	showStickyDate,
}) => {
	const insets = useSafeAreaInsets()
	const { navigate, goBack } = useNavigation()
	const conv = useConversation(convPk)
	const contact = useContact(conv?.contactPublicKey || null)

	const [{ flex, padding, text, opacity, row }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	const [layoutHeader, onLayoutHeader] = useLayout() // to position date under blur

	if (!conv || !contact) {
		goBack()
		console.warn('OneToOne: no conv', conv, contact)
		return <CenteredActivityIndicator />
	}
	const title = (conv as any).fake ? `FAKE - ${contact.displayName}` : contact?.displayName || ''
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				backgroundColor: colors['main-background'],
			}}
			onLayout={onLayoutHeader}
		>
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
				<TouchableOpacity onPress={goBack} style={[flex.tiny, flex.justify.center]}>
					<Icon
						name='arrow-back-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={colors['main-text']}
					/>
				</TouchableOpacity>
				<View style={[flex.large]}>
					<Text
						numberOfLines={1}
						style={[
							text.align.center,
							text.bold.medium,
							text.size.scale(20),
							{ color: colors['main-text'] },
						]}
					>
						{title}
					</Text>
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						activeOpacity={contact ? 0.2 : 0.5}
						style={[!contact ? opacity(0.5) : null, flex.small, row.right]}
						onPress={() => navigate.chat.oneToOneSettings({ convId: convPk })}
					>
						<ContactAvatar size={40 * scaleSize} publicKey={conv.contactPublicKey} />
					</TouchableOpacity>
				</View>
			</View>
			{stickyDate && showStickyDate && layoutHeader?.height && (
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

export const OneToOne: React.FC<ScreenProps.Chat.OneToOne> = ({ route: { params } }) => {
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
	const [{ flex, opacity }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	useReadEffect(params?.convId, 1000)
	const { t } = useTranslation()
	const conv = useConversation(params?.convId)
	const contact = useContact(conv?.contactPublicKey)
	const ctx = useMsgrContext()
	const navigation = useNativeNavigation()
	const { navigate } = useNavigation()
	const rawMessages = useConvInteractions(params.convId)
	const isMessages = rawMessages.length > 0

	const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
	const isFooterDisable = isIncoming
	const placeholder = isFooterDisable
		? t('chat.one-to-one.incoming-input-placeholder')
		: t('chat.one-to-one.input-placeholder')

	const [stickyDate, setStickyDate] = useState(conv?.lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	useFocusEffect(
		React.useCallback(() => {
			AndroidKeyboardAdjust?.setAdjustResize()
			return () => AndroidKeyboardAdjust?.setAdjustPan()
		}, []),
	)

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title: (conv as any).fake ? `FAKE - ${contact?.displayName}` : contact?.displayName || '',
			...CustomTitleStyle,
			headerRight: () => (
				<TouchableOpacity
					activeOpacity={contact ? 0.2 : 0.5}
					style={[!contact ? opacity(0.5) : null]}
					onPress={() => navigate.chat.oneToOneSettings({ convId: params.convId })}
				>
					<ContactAvatar size={40 * scaleSize} publicKey={conv?.contactPublicKey} />
				</TouchableOpacity>
			),
		})
	})

	return (
		<ReplyReactionProvider>
			{({ activeEmojiKeyboardCid, setActiveEmojiKeyboardCid, setActivePopoverCid }) => {
				const onRemoveEmojiBoard = () => {
					setActivePopoverCid(activeEmojiKeyboardCid)
					setActiveEmojiKeyboardCid(null)
				}
				return (
					<View style={[{ flex: 1, backgroundColor: colors['main-background'] }]}>
						<KeyboardAvoidingView
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
							style={[flex.tiny, { justifyContent: 'flex-start' }]}
							bottomFixedViewPadding={Platform.OS === 'ios' ? 0 : isMessages ? 20 : 85}
						>
							<MessageList
								id={params?.convId}
								scrollToMessage={params?.scrollToMessage || '0'}
								{...{ setStickyDate, setShowStickyDate }}
							/>
							<ChatFooter
								convPk={params?.convId}
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
									<ChatDate date={stickyDate} />
								</View>
							)}
						</KeyboardAvoidingView>
						{!!activeEmojiKeyboardCid && (
							<View style={StyleSheet.absoluteFill}>
								<TouchableOpacity
									style={[StyleSheet.absoluteFill, { flex: 1 }]}
									activeOpacity={0.9}
									onPress={onRemoveEmojiBoard}
								/>
								<EmojiBoard
									showBoard={true}
									onClick={emoji => {
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
											.catch(e => {
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
	)
}
