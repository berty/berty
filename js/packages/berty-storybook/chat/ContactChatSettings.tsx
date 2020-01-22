import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'

//
// ChatSettingsContact
//

const ContactChatSettingsHeaderContent: React.FC<{}> = () => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<FingerprintContent />
		</View>
	)
}

const ContactChatSettingsHeader: React.FC<berty.chatmodel.IContact & {
	isToggle: boolean
}> = ({ isToggle, ...contact }) => {
	const [{ border, background, padding }] = useStyles()
	return (
		<View style={padding.medium}>
			<View
				style={[
					border.radius.scale(30),
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
				]}
			>
				<RequestAvatar
					style={{ alignItems: 'center' }}
					{...contact}
					isVerified={isToggle}
					size={90}
				/>
				<View style={[padding.horizontal.medium, padding.bottom.medium]}>
					<TabBar tabType='contact' />
					<ContactChatSettingsHeaderContent />
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
				varToggle={isToggle}
				actionToggle={setIsToggle}
			/>
			<ButtonSetting name='Block contact' icon='slash-outline' iconColor={color.red} />
			<ButtonSetting name='Delete contact' icon='trash-2-outline' iconColor={color.red} />
		</View>
	)
}

export const ContactChatSettings: React.FC<ScreenProps.Chat.One2OneSettings> = ({ params }) => {
	const { goBack } = useNavigation()
	const [isToggle, setIsToggle] = useState(true)
	const [{ background, flex }] = useStyles()
	return (
		<ScrollView style={[flex.tiny, background.white]}>
			<HeaderSettings actionIcon='share-outline' undo={goBack}>
				<ContactChatSettingsHeader {...params} isToggle={isToggle} />
			</HeaderSettings>
			<ContactChatSettingsBody isToggle={isToggle} setIsToggle={setIsToggle} />
		</ScrollView>
	)
}
