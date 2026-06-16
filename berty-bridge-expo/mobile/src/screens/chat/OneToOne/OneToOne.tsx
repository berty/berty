import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { ContactAvatar } from '@berty/components/avatars'
import { ChatDate } from '@berty/components/chat/ChatDate'
import { ChatFooter } from '@berty/components/chat/footer/ChatFooter'
import { MessageList } from '@berty/components/chat/MessageList'
import { useStyles } from '@berty/contexts/styles'
import {
	useContact,
	useConversation,
	useDismissNotificationsEffect,
	useNotificationsInhibitor,
	useReadEffect,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { CustomTitleStyle } from '@berty/navigation/stacks'
import { pbDateToNum } from '@berty/utils/convert/time'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'

const NT = beapi.messenger.StreamEvent.Notified.Type

export const OneToOne: ScreenFC<'Chat.OneToOne'> = React.memo(
	({ route: { params }, navigation }) => {
		useNotificationsInhibitor(notif => {
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

		const { opacity, flex } = useStyles()
		const colors = useThemeColor()
		useReadEffect(params?.convId, 1000)
		useDismissNotificationsEffect(params?.convId)
		const { t } = useTranslation()
		const conv = useConversation(params?.convId)
		const contact = useContact(conv?.contactPublicKey)
		const { navigate } = navigation

		const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
		const isFooterDisable = isIncoming
		const placeholder = isFooterDisable
			? t('chat.one-to-one.incoming-input-placeholder')
			: t('chat.one-to-one.input-placeholder')

		const [stickyDate, setStickyDate] = useState(conv?.lastUpdate || null)
		const [showStickyDate, setShowStickyDate] = useState(false)

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
						<ContactAvatar size={36} publicKey={conv?.contactPublicKey} />
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
						<MessageList
							id={params.convId}
							scrollToMessage={params.scrollToMessage || '0'}
							setStickyDate={setStickyDate}
							setShowStickyDate={setShowStickyDate}
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
									top: 110,
									left: 0,
									right: 0,
								}}
							>
								<ChatDate date={pbDateToNum(stickyDate)} />
							</View>
						)}
					</View>
				</View>
			</IOSOnlyKeyboardAvoidingView>
		)
	},
)
