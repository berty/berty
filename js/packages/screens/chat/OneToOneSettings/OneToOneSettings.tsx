import React, { ComponentProps } from 'react'
import { ScrollView, View, StatusBar, TouchableOpacity, Platform } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import beapi from '@berty/api'
import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useContact, useConversation } from '@berty/hooks'

import { ButtonSetting } from '@berty/components/shared-components/SettingsButtons'
import { ContactAvatar } from '@berty/components/avatars'
import EnableNotificationsButton from '@berty/components/chat/EnableNotificationsButton'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const OneToOneHeader: React.FC<{ contact: any }> = ({ contact }) => {
	const { text, padding, flex } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<View style={[flex.large, { alignItems: 'center' }]}>
			<ContactAvatar size={100 * scaleSize} publicKey={contact.publicKey} pressable />
			<UnifiedText
				numberOfLines={1}
				style={[
					text.size.scale(18),
					text.align.center,
					padding.top.small,
					{ color: colors['reverted-main-text'] },
				]}
			>
				{contact.displayName}
			</UnifiedText>
		</View>
	)
}

const OneToOneBody: React.FC<{
	publicKey: string
	isIncoming: boolean
	navigation: ComponentProps<typeof OneToOneSettings>['navigation']
}> = ({ publicKey, isIncoming, navigation }) => {
	const { padding } = useStyles()
	const { t } = useTranslation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSetting
				name={t('chat.one-to-one-settings.media-button')}
				icon='image-outline'
				onPress={() => navigation.navigate('Chat.SharedMedias', { convPk: publicKey })}
			/>
			{Platform.OS !== 'web' && <EnableNotificationsButton conversationPk={publicKey} />}
			{!isIncoming && Platform.OS !== 'web' && (
				<ButtonSetting
					name={t('chat.one-to-one-settings.save-button')}
					icon='cloud-upload-outline'
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						navigation.navigate('Chat.ReplicateGroupSettings', { convId: publicKey })
					}}
				/>
			)}
		</View>
	)
}

export const OneToOneSettings: ScreenFC<'Chat.OneToOneSettings'> = ({
	route: { params },
	navigation,
}) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { convId } = params
	const conv = useConversation(convId)
	const contact = useContact(conv?.contactPublicKey)

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity
					onPress={() =>
						navigation.navigate('Chat.ContactSettings', { contactId: conv?.contactPublicKey || '' })
					}
				>
					<Icon
						name='more-horizontal-outline'
						width={35 * scaleSize}
						height={35 * scaleSize}
						fill={colors['reverted-main-text']}
					/>
				</TouchableOpacity>
			),
		})
	})

	if (!(conv && conv.type === beapi.messenger.Conversation.Type.ContactType && contact)) {
		navigation.goBack()
		return null
	}
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	return (
		<>
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				<ScrollView
					style={{ backgroundColor: colors['main-background'] }}
					bounces={false}
					contentContainerStyle={[padding.bottom.medium]}
				>
					<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
						<OneToOneHeader contact={contact} />
					</View>
					<OneToOneBody
						publicKey={conv.publicKey || ''}
						isIncoming={isIncoming}
						navigation={navigation}
					/>
				</ScrollView>
			</View>
		</>
	)
}
