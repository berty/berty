import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { styles, colors } from '@berty-tech/styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/berty-api'

//
// ChatSettingsContact
//

const ContactChatSettingsHeaderContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginTop]}>
		<FingerprintContent />
	</View>
)

const ContactChatSettingsHeader: React.FC<berty.chatmodel.IContact & {
	isToggle: boolean
}> = ({ isToggle, ...contact }) => (
	<View style={[styles.padding]}>
		<View
			style={[
				styles.modalBorderRadius,
				styles.bgWhite,
				styles.paddingHorizontal,
				styles.paddingBottom,
			]}
		>
			<RequestAvatar style={[styles.alignItems]} {...contact} isVerified={isToggle} size={90} />
			<View style={[styles.paddingHorizontal, styles.paddingBottom]}>
				<TabBar tabType='contact' />
				<ContactChatSettingsHeaderContent />
			</View>
		</View>
	</View>
)

const ContactChatSettingsBody: React.FC<{
	isToggle: boolean
	setIsToggle: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ isToggle, setIsToggle }) => (
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

export const ContactChatSettings: React.FC<ScreenProps.Chat.One2OneSettings> = ({ params }) => {
	const { goBack } = useNavigation()
	const [isToggle, setIsToggle] = useState(true)
	return (
		<ScrollView style={[styles.flex, styles.bgWhite]}>
			<HeaderSettings actionIcon='share-outline' undo={goBack}>
				<ContactChatSettingsHeader {...params} isToggle={isToggle} />
			</HeaderSettings>
			<ContactChatSettingsBody isToggle={isToggle} setIsToggle={setIsToggle} />
		</ScrollView>
	)
}
