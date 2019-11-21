import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { UserProps, RequestProps } from '../shared-props/User'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import HeaderSettings from '../shared-components/Header'

//
// ChatSettingsContact
//

// Types
type ContactChatSettingsHeaderAvatarProps = {
	avatarUri: string
	name: string
	isToggle: boolean
}

type ContactChatSettingsHeaderProps = {
	user: UserProps
	isToggle: boolean
}

type ContactChatSettingsBodyProps = {
	isToggle: boolean
	setIsToggle: React.Dispatch<React.SetStateAction<any>>
}

// Styles

const ContactChatSettingsHeaderContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginTop]}>
		<FingerprintContent />
	</View>
)

const ContactChatSettingsHeader: React.FC<ContactChatSettingsHeaderProps> = ({
	user,
	isToggle,
}) => (
	<View style={[styles.padding]}>
		<View
			style={[
				styles.modalBorderRadius,
				styles.bgWhite,
				styles.paddingHorizontal,
				styles.paddingBottom,
			]}
		>
			<RequestAvatar style={[styles.alignItems]} {...user} isVerified={isToggle} size={90} />
			<View style={[styles.paddingHorizontal, styles.paddingBottom]}>
				<TabBar tabType='contact' />
				<ContactChatSettingsHeaderContent />
			</View>
		</View>
	</View>
)

const ContactChatSettingsBody: React.FC<ContactChatSettingsBodyProps> = ({
	isToggle,
	setIsToggle,
}) => (
	<View style={[styles.padding]}>
		<ButtonSetting
			icon='checkmark-circle-2'
			name='Mark as verified'
			iconDependToggle
			toggled
			varToggle={isToggle}
			actionToggle={setIsToggle}
		/>
		<ButtonSetting name='Block contact' icon='slash-outline' iconColor={colors.red} />
		<ButtonSetting name='Delete contact' icon='trash-2-outline' iconColor={colors.red} />
	</View>
)

export const ContactChatSettings: React.FC<RequestProps> = ({ user }) => {
	const [isToggle, setIsToggle] = useState(true)

	return (
		<Layout style={[styles.flex]}>
			<ScrollView>
				<HeaderSettings actionIcon='share-outline'>
					<ContactChatSettingsHeader user={user} isToggle={isToggle} />
				</HeaderSettings>
				<ContactChatSettingsBody isToggle={isToggle} setIsToggle={setIsToggle} />
			</ScrollView>
		</Layout>
	)
}
