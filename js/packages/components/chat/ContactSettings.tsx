import React, { useState } from 'react'
import { View, ScrollView, ActivityIndicator, StatusBar } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useContacts, useThemeColor } from '@berty-tech/store/hooks'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'

import { ButtonSetting } from '../shared-components/SettingsButtons'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import { ContactAvatar } from '../avatars'

const ContactSettingsHeaderContent: React.FC = ({ children }) => {
	const [{ margin }] = useStyles()
	return <View style={[margin.top.big]}>{children}</View>
}

const SelectedContent: React.FC<{ contentName: string; publicKey: string }> = ({
	contentName,
	publicKey,
}) => {
	switch (contentName) {
		case 'fingerprint':
			return <FingerprintContent seed={publicKey} isEncrypted={false} />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const ContactSettingsHeader: React.FC<{ contact: any }> = ({ contact }) => {
	const [{ border, padding, row, absolute, text }] = useStyles()
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
					<Text
						style={[
							text.size.big,
							text.align.center,
							text.bold.small,
							{ color: colors['main-text'] },
						]}
					>
						{contact.displayName}
					</Text>
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
								buttonDisabled: true,
							},
							{
								key: 'devices',
								name: t('chat.contact-settings.devices'),
								icon: 'smartphone',
								iconPack: 'feather',
								iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
								buttonDisabled: true,
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

const DeleteContactButton: React.FC<{ id: string }> = ({ id }) => {
	const deleteContact = ({ id }: { id: string }) => {
		console.warn(`attempted to delete ${id}, operation not implemented`)
	}
	const { t } = useTranslation()
	const colors = useThemeColor()
	return (
		<ButtonSetting
			name={t('chat.contact-settings.delete-button')}
			icon='trash-2-outline'
			iconColor={colors['secondary-background-header']}
			onPress={() => deleteContact({ id })}
			disabled
		/>
	)
}

const ContactSettingsBody: React.FC<{ id: string }> = ({ id }) => {
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	return (
		<View style={padding.medium}>
			<ButtonSetting
				name={t('chat.contact-settings.mark-button')}
				icon='checkmark-circle-2'
				iconDependToggle
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('chat.contact-settings.block-button')}
				icon='slash-outline'
				iconColor={colors['secondary-background-header']}
				disabled
			/>
			<DeleteContactButton id={id} />
		</View>
	)
}

export const ContactSettings: React.FC<ScreenProps.Chat.ContactSettings> = ({ route }) => {
	const { contactId } = route.params
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const contact: any = (useContacts() as any)[contactId] || null
	const [{ padding }] = useStyles()
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
					<ContactSettingsBody id={contact.publicKey} />
				</ScrollView>
			</View>
		</>
	)
}
