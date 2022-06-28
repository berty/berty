import { Icon } from '@ui-kitten/components'
import React, { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, StatusBar, TouchableOpacity, Platform } from 'react-native'

import beapi from '@berty/api'
import { ContactAvatar } from '@berty/components/avatars'
import EnableNotificationsButton from '@berty/components/chat/EnableNotificationsButton'
import { ButtonSetting } from '@berty/components/shared-components/SettingsButtons'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useContact, useConversation, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

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
	isAccepted: boolean
	navigation: ComponentProps<typeof OneToOneSettings>['navigation']
}> = ({ publicKey, isAccepted, navigation }) => {
	const { padding } = useStyles()
	const { t } = useTranslation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSetting
				name={t('chat.one-to-one-settings.media-button')}
				icon='image-outline'
				onPress={() => navigation.navigate('Chat.SharedMedias', { convPk: publicKey })}
			/>
			{isAccepted && Platform.OS !== 'web' && (
				<EnableNotificationsButton conversationPk={publicKey} />
			)}
			{/* TODO: uncomment when replication nodes works */}
			{/* {Platform.OS !== 'web' && (
				<ButtonSetting
					name={t('chat.one-to-one-settings.save-button')}
					icon='cloud-upload-outline'
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						navigation.navigate('Chat.ReplicateGroupSettings', { convId: publicKey })
					}}
				/>
			)} */}
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
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted

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
						isAccepted={isAccepted}
						navigation={navigation}
					/>
				</ScrollView>
			</View>
		</>
	)
}
