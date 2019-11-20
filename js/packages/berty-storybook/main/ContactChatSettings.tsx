import React, { useState } from 'react'
import { TouchableOpacity, View, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors, requestStyles } from '../styles'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { UserProps, RequestProps } from '../shared-props/User'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { TabBar } from '../shared-components/TabBar'

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
const _contactChatSettingsStyles = StyleSheet.create({
	headerAvatarVerifiedPadding: {
		paddingLeft: 6,
	},
	header: {
		marginTop: 90,
		width: '92%',
	},
})

const ContactChatSettingsHeaderContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginTop]}>
		<FingerprintContent />
	</View>
)

const ContactChatSettingsHeaderAvatar: React.FC<ContactChatSettingsHeaderAvatarProps> = ({
	avatarUri,
	name,
	isToggle,
}) => (
	<View>
		<CircleAvatar style={styles.alignItems} avatarUri={avatarUri} size={130} />
		<View style={[styles.row, styles.center, styles.alignItems, styles.marginTop]}>
			<Text category='h6' style={[styles.fontFamily, styles.textBlack, styles.textBold]}>
				{name}
			</Text>
			{isToggle && (
				<View style={[_contactChatSettingsStyles.headerAvatarVerifiedPadding]}>
					<Icon name='checkmark-circle-2' width={20} height={20} fill={colors.blue} />
				</View>
			)}
		</View>
	</View>
)

const ContactChatSettingsHeader: React.FC<ContactChatSettingsHeaderProps> = ({
	user,
	isToggle,
}) => (
	<View style={[styles.bigPadding]}>
		<View style={[requestStyles.bodyRequestContent]}>
			<ContactChatSettingsHeaderAvatar {...user} isToggle={isToggle} />
			<TabBar tabType='contact' />
			<ContactChatSettingsHeaderContent />
		</View>
	</View>
)

const ContactChatSettingsHeaderNav: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.spaceBetween, styles.flex, styles.alignItems]}>
			<TouchableOpacity>
				<Icon name='arrow-back' width={25} height={25} fill={colors.white} />
			</TouchableOpacity>
			<TouchableOpacity>
				<Icon name='share-outline' width={25} height={25} fill={colors.white} />
			</TouchableOpacity>
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
	const [layout, setLayout] = useState()
	const [isToggle, setIsToggle] = useState(true)

	return (
		<Layout style={[styles.flex]}>
			<ScrollView>
				<SafeAreaView style={[styles.bgBlue]}>
					<View style={[styles.absolute, styles.left, styles.right, styles.bigMarginTop]}>
						<View
							style={[styles.bgBlue, styles.borderBottomLeftRadius, styles.borderBottomRightRadius]}
						>
							<View
								onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
								style={[
									styles.bgWhite,
									styles.center,
									styles.shadow,
									styles.borderRadius,
									_contactChatSettingsStyles.header,
									layout && { height: layout - 90 },
								]}
							>
								<ContactChatSettingsHeader user={user} isToggle={isToggle} />
							</View>
						</View>
						<ContactChatSettingsBody isToggle={isToggle} setIsToggle={setIsToggle} />
					</View>
					<ContactChatSettingsHeaderNav />
				</SafeAreaView>
			</ScrollView>
		</Layout>
	)
}
