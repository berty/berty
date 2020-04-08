import React, { useState } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import HeaderSettings from '../shared-components/Header'
import { useNavigation } from '@berty-tech/berty-navigation'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

//
// ChatSettingsContact
//

const ContactChatSettingsHeaderContent: React.FC<{}> = ({ children }) => {
	const [{ margin }] = useStyles()
	return <View style={[margin.top.big]}>{children}</View>
}

const SelectedContent = ({ contentName }: { contentName: string }) => {
	switch (contentName) {
		case 'Fingerprint':
			return <FingerprintContent />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const ContactChatSettingsHeader: React.FC<{
	isToggle: boolean
	params: any
}> = ({ isToggle, params }) => {
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
						seed={params.contact.publicKey}
						style={[border.shadow.big]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.horizontal.medium, padding.bottom.medium, padding.top.scale(60)]}>
					<Text
						style={[text.size.big, text.color.black, text.align.center, text.bold.scale('500')]}
					>
						{params.contact.name}
					</Text>
					<TabBar
						tabs={[
							{ name: 'Fingerprint', icon: 'code-outline' },
							{ name: 'Infos', icon: 'info-outline' },
							{ name: 'Devices', icon: 'smartphone-outline' },
						]}
						onTabChange={setSelectedContent}
					/>
					<ContactChatSettingsHeaderContent>
						<SelectedContent contentName={selectedContent} />
					</ContactChatSettingsHeaderContent>
				</View>
			</View>
		</View>
	)
}

const ContactChatSettingsBody: React.FC<{
	isToggle: boolean
	setIsToggle: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ isToggle, setIsToggle }) => {
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
			<ButtonSetting name='Delete contact' icon='trash-2-outline' iconColor={color.red} disabled />
		</View>
	)
}

export const ContactChatSettings: React.FC<{ route: any }> = ({ route }) => {
	const { goBack } = useNavigation()
	const [isToggle, setIsToggle] = useState(true)
	const [{ background, flex }] = useStyles()
	return (
		<ScrollView style={[flex.tiny, background.white]}>
			<HeaderSettings actionIcon='share-outline' undo={goBack}>
				<ContactChatSettingsHeader {...route} isToggle={isToggle} />
			</HeaderSettings>
			<ContactChatSettingsBody isToggle={isToggle} setIsToggle={setIsToggle} />
		</ScrollView>
	)
}
