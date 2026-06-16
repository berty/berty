import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { MultiMemberAvatar } from '@berty/components/avatars'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import {
	useConversation,
	useDismissNotificationsEffect,
	useNotificationsInhibitor,
	useReadEffect,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'

import { HeaderTitle } from './components/HeaderTitle'
import { MultiMemberContent } from './components/MultiMemberContent'

const NT = beapi.messenger.StreamEvent.Notified.Type

export const MultiMember: ScreenFC<'Chat.MultiMember'> = ({ route: { params }, navigation }) => {
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
	useDismissNotificationsEffect(params.convId)
	const conv = useConversation(params.convId)

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: () => <HeaderTitle conv={conv} />,
			title: (conv as any)?.fake ? `FAKE - ${conv?.displayName}` : conv?.displayName || '',
			headerRight: () => (
				<TouchableOpacity
					activeOpacity={conv ? 0.2 : 0.5}
					style={[!conv ? opacity(0.5) : null]}
					onPress={() => navigation.navigate('Chat.MultiMemberSettings', { convId: params.convId })}
				>
					<MultiMemberAvatar publicKey={conv?.publicKey} size={40 * scaleSize} />
				</TouchableOpacity>
			),
		})
	})

	if (!params.convId || !params.convId.length) {
		return null
	}
	return (
		<IOSOnlyKeyboardAvoidingView
			style={[{ flex: 1, backgroundColor: colors['main-background'] }]}
		>
			<View style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
				<View style={[flex.tiny]}>
					<MultiMemberContent conv={conv} convId={params.convId} />
				</View>
			</View>
		</IOSOnlyKeyboardAvoidingView>
	)
}
