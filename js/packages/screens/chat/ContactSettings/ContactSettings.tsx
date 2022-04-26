import React, { useState } from 'react'
import { View, ScrollView, ActivityIndicator, StatusBar } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'
import { ScreenFC } from '@berty/navigation'
import { useContact, useConversation } from '@berty/hooks'

import { FingerprintContent } from '@berty/components/shared-components/FingerprintContent'
import { TabBar } from '@berty/components/shared-components/TabBar'
import { ContactAvatar } from '@berty/components/avatars'
import UserDevicesList from '@berty/components/chat/DeviceList'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const ContactSettingsHeaderContent: React.FC = ({ children }) => {
	const { margin } = useStyles()
	return <View style={[margin.top.big]}>{children}</View>
}

const InfoTab: React.FC<{ contactPk: string }> = ({ contactPk }) => {
	const { t } = useTranslation()
	const contact = useContact(contactPk)
	const conv = useConversation(contact?.conversationPublicKey || '')
	const { text, padding } = useStyles()

	return (
		<>
			<UnifiedText style={[text.light, padding.left.small]}>
				{contact?.displayName || ''}
			</UnifiedText>
			<UserDevicesList conversationPk={contact?.conversationPublicKey || ''} memberPk={contactPk} />
			<UnifiedText style={[text.light, padding.left.small]}>
				{t('chat.contact-settings.my-devices')}
			</UnifiedText>
			<UserDevicesList
				conversationPk={contact?.conversationPublicKey || ''}
				memberPk={conv?.localMemberPublicKey || ''}
			/>
		</>
	)
}

const SelectedContent: React.FC<{ contentName: string; publicKey: string }> = ({
	contentName,
	publicKey,
}) => {
	switch (contentName) {
		case 'fingerprint':
			return <FingerprintContent seed={publicKey} isEncrypted={false} />
		case 'info':
			return <InfoTab contactPk={publicKey} />
		default:
			return <UnifiedText>Error: Unknown content name "{contentName}"</UnifiedText>
	}
}

const ContactSettingsHeader: React.FC<{ contact: any }> = ({ contact }) => {
	const { border, padding, row, absolute, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [selectedContent, setSelectedContent] = useState('fingerprint')

	return (
		<View style={[padding.medium, padding.top.scale(50)]}>
			<View
				style={[
					border.radius.scale(30),
					padding.horizontal.medium,
					padding.bottom.medium,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<View style={[row.item.justify, absolute.scale({ top: -50 })]}>
					<ContactAvatar size={100} publicKey={contact.publicKey} />
				</View>
				<View style={[padding.horizontal.medium, padding.bottom.medium, padding.top.scale(65)]}>
					<UnifiedText style={[text.size.big, text.align.center, text.light]}>
						{contact.displayName}
					</UnifiedText>
					<TabBar
						tabs={[
							{
								key: 'fingerprint',
								name: t('chat.contact-settings.fingerprint'),
								icon: 'fingerprint',
								iconPack: 'custom',
							},
							{
								key: 'info',
								name: t('chat.contact-settings.info'),
								icon: 'info-outline',
							},
						]}
						onTabChange={setSelectedContent}
					/>
					<ContactSettingsHeaderContent>
						<SelectedContent publicKey={contact.publicKey} contentName={selectedContent} />
					</ContactSettingsHeaderContent>
				</View>
			</View>
		</View>
	)
}

export const ContactSettings: ScreenFC<'Chat.ContactSettings'> = ({
	route,
	navigation: { goBack },
}) => {
	const { contactId } = route.params
	const colors = useThemeColor()
	const contact = useContact(contactId)
	const { padding } = useStyles()
	if (!contact) {
		goBack()
		return (
			<View
				style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}
			>
				<ActivityIndicator />
			</View>
		)
	}
	return (
		<>
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				<ScrollView
					style={{ backgroundColor: colors['main-background'], flex: 1 }}
					bounces={false}
					contentContainerStyle={[padding.bottom.medium]}
				>
					<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
						<ContactSettingsHeader contact={contact} />
					</View>
					{/* <ContactSettingsBody id={contact.publicKey} /> */}
				</ScrollView>
			</View>
		</>
	)
}
