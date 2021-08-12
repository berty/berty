import React, { useState } from 'react'
import { TouchableOpacity, View, Platform, TextInput, StyleSheet } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import EmojiBoard from 'react-native-emoji-board'
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'

import { KeyboardAvoidingView } from '@berty-tech/components/shared-components/KeyboardAvoidingView'
import { MessageList } from '@berty-tech/components/chat/MessageList'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import {
	useConversation,
	useLastConvInteraction,
	useReadEffect,
	useNotificationsInhibitor,
	useMsgrContext,
	useThemeColor,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'
import { CustomTitleStyle } from '@berty-tech/navigation/stacks'

import { ChatFooter, ChatDate } from './common'
import { MultiMemberAvatar } from '../avatars'
import { ReplyReactionProvider } from './ReplyReactionContext'

//
// MultiMember
//

// Styles

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
	const [{ flex, opacity, border, padding, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	useReadEffect(params.convId, 1000)
	const conv = useConversation(params?.convId)
	const { t } = useTranslation()
	const ctx = useMsgrContext()
	const insets = useSafeAreaInsets()
	const navigation = useNativeNavigation()

	const [editValue, setEditValue] = useState(conv?.displayName || '')
	const [isEdit, setIsEdit] = useState(false)
	const editDisplayName = async () => {
		const buf = beapi.messenger.AppMessage.SetGroupInfo.encode({ displayName: editValue }).finish()
		await ctx.client?.interact({
			conversationPublicKey: conv?.publicKey,
			type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo,
			payload: buf,
		})
		setIsEdit(false)
	}

	const lastInte = useLastConvInteraction(params?.convId || '')
	const lastUpdate = conv?.lastUpdate || lastInte?.sentDate || conv?.createdDate || null
	const [stickyDate, setStickyDate] = useState(lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	useFocusEffect(
		React.useCallback(() => {
			AndroidKeyboardAdjust?.setAdjustResize()
			return () => AndroidKeyboardAdjust?.setAdjustPan()
		}, []),
	)

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => {
				return isEdit ? (
					<View
						style={[
							border.radius.small,
							padding.horizontal.small,
							{
								width: '70%',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								backgroundColor: colors['input-background'],
							},
						]}
					>
						<TextInput
							style={[
								text.align.center,
								text.bold.medium,
								text.size.scale(20),
								padding.vertical.small,
								{ color: colors['main-text'] },
							]}
							autoFocus
							onSubmitEditing={editDisplayName}
							onBlur={() => {
								setIsEdit(false)
								setEditValue(conv?.displayName || '')
							}}
							value={editValue}
							onChange={({ nativeEvent }) => setEditValue(nativeEvent.text)}
						/>
						<TouchableOpacity onPress={editDisplayName}>
							<Icon
								name='checkmark-outline'
								height={25 * scaleSize}
								width={25 * scaleSize}
								fill={colors['secondary-text']}
							/>
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity onLongPress={() => setIsEdit(true)}>
						<Text
							numberOfLines={1}
							style={[
								text.align.center,
								text.bold.medium,
								text.size.scale(20),
								{ color: colors['main-text'] },
							]}
						>
							{conv?.displayName || ''}
						</Text>
					</TouchableOpacity>
				)
			},
			title: (conv as any).fake ? `FAKE - ${conv?.displayName}` : conv?.displayName || '',
			...CustomTitleStyle,
			headerRight: () => (
				<TouchableOpacity
					activeOpacity={conv ? 0.2 : 0.5}
					style={[!conv ? opacity(0.5) : null]}
					onPress={() =>
						navigation.navigate('Group.MultiMemberSettings', { convId: params.convId })
					}
				>
					<MultiMemberAvatar publicKey={conv?.publicKey} size={40 * scaleSize} />
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
					<View style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
						<KeyboardAvoidingView
							style={[flex.tiny]}
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
							bottomFixedViewPadding={20}
						>
							<MessageList id={params?.convId} {...{ setStickyDate, setShowStickyDate }} />
							<ChatFooter
								convPk={params?.convId}
								placeholder={t('chat.multi-member.input-placeholder')}
							/>
							{!!stickyDate && !!showStickyDate && (
								<View
									style={{
										position: 'absolute',
										top: 110,
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
							</View>
						)}
					</View>
				)
			}}
		</ReplyReactionProvider>
	)
}
