import { useHeaderHeight } from '@react-navigation/elements'
import { useFocusEffect } from '@react-navigation/native'
import React, { useState } from 'react'
import { TouchableOpacity, View, Platform, Keyboard } from 'react-native'
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'

import beapi from '@berty/api'
import { MultiMemberAvatar } from '@berty/components/avatars'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import {
	useConversation,
	useNotificationsInhibitor,
	useReadEffect,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'

import { HeaderTitle } from './components/HeaderTitle'
import { MultiMemberContent } from './components/MultiMemberContent'

const NT = beapi.messenger.StreamEvent.Notified.Type

export const MultiMember: ScreenFC<'Chat.Group'> = ({ route: { params }, navigation }) => {
	useNotificationsInhibitor(notif => {
		if (
			notif.type === NT.TypeMessageReceived &&
			(notif.payload as any)?.payload?.interaction?.conversationPublicKey === params.convId
		) {
			return 'sound-only'
		}
		return false
	})
	const { flex, opacity } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	useReadEffect(params.convId, 1000)
	const conv = useConversation(params.convId)

	const [keyboardIsHidden, setKeyboardIsHidden] = useState(false)

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
			headerTitle: () => <HeaderTitle conv={conv} />,
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

	if ((Platform.OS === 'android' && !keyboardIsHidden) || !params.convId || !params.convId.length) {
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
						<MultiMemberContent conv={conv} convId={params.convId} />
					</View>
				) : (
					<MultiMemberContent conv={conv} convId={params.convId} />
				)}
			</View>
		</IOSOnlyKeyboardAvoidingView>
	)
}
