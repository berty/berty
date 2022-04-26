import React, { useState } from 'react'
import { TouchableOpacity, View, Platform, TextInput, Keyboard } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useHeaderHeight } from '@react-navigation/elements'

import { useStyles } from '@berty/contexts/styles'
import { ScreenFC } from '@berty/navigation'
import {
	useReadEffect,
	useNotificationsInhibitor,
	useThemeColor,
	pbDateToNum,
	useMessengerClient,
} from '@berty/store'
import beapi from '@berty/api'
import { IOSOnlyKeyboardAvoidingView } from '@berty/rnutil/keyboardAvoiding'
import { useConversation, useLastConvInteraction } from '@berty/hooks'
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { ChatDate } from '@berty/components/chat/common'
import { MultiMemberAvatar } from '@berty/components/avatars'
import { MessageList } from '@berty/components/chat/MessageList'
import { ChatFooter } from '@berty/components/chat/footer/ChatFooter'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

//
// MultiMember
//

// Styles

const NT = beapi.messenger.StreamEvent.Notified.Type

export const MultiMember: ScreenFC<'Chat.Group'> = ({ route: { params }, navigation }) => {
	useNotificationsInhibitor(notif => {
		if (
			notif.type === NT.TypeMessageReceived &&
			(notif.payload as any)?.payload?.interaction?.conversationPublicKey === params?.convId
		) {
			return 'sound-only'
		}
		return false
	})
	const { flex, opacity, border, padding, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	useReadEffect(params.convId, 1000)
	const conv = useConversation(params?.convId)
	const { t } = useTranslation()
	const client = useMessengerClient()

	const [editValue, setEditValue] = useState(conv?.displayName || '')
	const [isEdit, setIsEdit] = useState(false)
	const [keyboardIsHidden, setKeyboardIsHidden] = useState(false)
	const editDisplayName = async () => {
		const buf = beapi.messenger.AppMessage.SetGroupInfo.encode({ displayName: editValue }).finish()
		await client?.interact({
			conversationPublicKey: conv?.publicKey,
			type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo,
			payload: buf,
			metadata: true,
		})
		setIsEdit(false)
	}

	const lastInte = useLastConvInteraction(params?.convId || '')
	const lastUpdate = conv?.lastUpdate || lastInte?.sentDate || conv?.createdDate || null
	const [stickyDate, setStickyDate] = useState(lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	useFocusEffect(
		React.useCallback(() => {
			if (Platform.OS === 'android') {
				AndroidKeyboardAdjust?.setAdjustResize()
				return () => AndroidKeyboardAdjust?.setAdjustPan()
			}
		}, []),
	)

	useFocusEffect(
		React.useCallback(() => {
			if (Platform.OS === 'android') {
				Keyboard.dismiss()
				setTimeout(() => {
					setKeyboardIsHidden(true)
				}, 50)
			}
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
								text.bold,
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
						<UnifiedText numberOfLines={1} style={[text.align.center, text.size.large, text.bold]}>
							{conv?.displayName || ''}
						</UnifiedText>
					</TouchableOpacity>
				)
			},
			title: (conv as any)?.fake ? `FAKE - ${conv?.displayName}` : conv?.displayName || '',
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

	const headerHeight = useHeaderHeight()

	if (Platform.OS === 'android' && !keyboardIsHidden) {
		return null
	}

	return (
		<IOSOnlyKeyboardAvoidingView
			behavior='padding'
			keyboardVerticalOffset={headerHeight}
			style={[{ flex: 1, backgroundColor: colors['main-background'] }]}
		>
			<View style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
				{Platform.OS === 'ios' ? (
					<View style={[flex.tiny]}>
						<MessageList id={params?.convId} {...{ setStickyDate, setShowStickyDate }} />
						<ChatFooter
							convPK={params?.convId}
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
								<ChatDate date={pbDateToNum(stickyDate)} />
							</View>
						)}
					</View>
				) : (
					<>
						<MessageList id={params?.convId} {...{ setStickyDate, setShowStickyDate }} />
						<ChatFooter
							convPK={params?.convId}
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
								<ChatDate date={pbDateToNum(stickyDate)} />
							</View>
						)}
					</>
				)}
			</View>
		</IOSOnlyKeyboardAvoidingView>
	)
}
