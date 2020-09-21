import React, { useState } from 'react'
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { useContacts } from '@berty-tech/store/hooks'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

const ContactSettingsHeaderContent: React.FC = ({ children }) => {
	const [{ margin }] = useStyles()
	return <View style={[margin.top.big]}>{children}</View>
}

const SelectedContent: React.FC<{ contentName: string; publicKey: string }> = ({
	contentName,
	publicKey,
}) => {
	switch (contentName) {
		case 'Fingerprint':
			return <FingerprintContent seed={publicKey} />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const ContactSettingsHeader: React.FC<{ contact: any }> = ({ contact }) => {
	const [{ border, background, padding, row, absolute, text }] = useStyles()
	const [selectedContent, setSelectedContent] = useState('Fingerprint')
	return (
		<View style={[padding.medium, padding.top.scale(50)]}>
			<View
				style={[
					border.radius.scale(30),
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
				]}
			>
				<View style={[row.item.justify, absolute.scale({ top: -50 })]}>
					<ProceduralCircleAvatar
						seed={contact.publicKey}
						style={[border.shadow.big]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.horizontal.medium, padding.bottom.medium, padding.top.scale(65)]}>
					<Text style={[text.size.big, text.color.black, text.align.center, text.bold.small]}>
						{contact.displayName}
					</Text>
					<TabBar
						tabs={[
							{ name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' },
							{ name: 'Infos', icon: 'info-outline', buttonDisabled: true },
							{
								name: 'Devices',
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
	const [{ color }] = useStyles()
	// const deleteContact = Messenger.useDeleteContact()
	const deleteContact = () => {}
	return (
		<ButtonSetting
			name='Delete contact'
			icon='trash-2-outline'
			iconColor={color.red}
			onPress={() => deleteContact({ id })}
		/>
	)
}

const ContactSettingsBody: React.FC<{ id: string }> = ({ id }) => {
	const [{ padding, color }] = useStyles()
	return (
		<View style={padding.medium}>
			<ButtonSetting
				icon='checkmark-circle-2'
				name='Mark as verified'
				iconDependToggle
				toggled
				disabled
			/>
			<ButtonSetting name='Block contact' icon='slash-outline' iconColor={color.red} disabled />
			<DeleteContactButton id={id} />
		</View>
	)
}

export const ContactSettings: React.FC<ScreenProps.Chat.ContactSettings> = ({ route }) => {
	const { contactId } = route.params
	const { goBack } = useNavigation()
	const contact: any = (useContacts() as any)[contactId] || null
	const [{ background, flex, padding }] = useStyles()
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
		<ScrollView
			style={[flex.tiny, background.white]}
			contentContainerStyle={[padding.bottom.huge]}
			bounces={false}
		>
			<SwipeNavRecognizer>
				<HeaderSettings actionIcon='upload' undo={goBack}>
					<ContactSettingsHeader contact={contact} />
				</HeaderSettings>
				<ContactSettingsBody id={contact.publicKey} />
			</SwipeNavRecognizer>
		</ScrollView>
	)
}
