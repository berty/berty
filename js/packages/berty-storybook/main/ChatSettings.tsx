import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { UserProps, RequestProps } from '../shared-props/User'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import HeaderSettings from '../shared-components/Header'

//
// ChatSettings
//

// Styles
const _chatSettingsStyle = StyleSheet.create({
	headerAvatar: {
		flex: 5,
	},
	firstHeaderButton: {
		marginRight: 20,
		height: 90,
	},
	secondHeaderButton: {
		marginRight: 20,
		height: 90,
	},
	thirdHeaderButton: {
		height: 90,
	},
})

const ChatSettingsHeader: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[_chatSettingsStyle.headerAvatar]}>
		<CircleAvatar style={styles.alignItems} avatarUri={avatarUri} size={100} />
		<Text
			numberOfLines={1}
			style={[styles.textWhite, styles.center, styles.littlePaddingTop, styles.textBold]}
		>
			{name}
		</Text>
	</View>
)

const ChatSettingsHeaderButtons: React.FC<{}> = () => (
	<View style={[styles.paddingLeft, styles.paddingRight, styles.paddingTop]}>
		<ButtonSettingRow
			state={[
				{
					name: 'Search',
					icon: 'search-outline',
					color: colors.blue,
					style: _chatSettingsStyle.firstHeaderButton,
				},
				{
					name: 'Call',
					icon: 'phone-outline',
					color: colors.green,
					style: _chatSettingsStyle.secondHeaderButton,
				},
				{
					name: 'Share',
					icon: 'share-outline',
					color: colors.blue,
					style: _chatSettingsStyle.thirdHeaderButton,
				},
			]}
		/>
	</View>
)

const ChatSettingsBody: React.FC<{}> = () => (
	<View style={[styles.paddingLeft, styles.paddingRight]}>
		<ButtonSetting name='Medias, links & docs' icon='image-outline' />
		<ButtonSetting name='Receive notifications' icon='bell-outline' toggled />
		<ButtonSetting
			name='Mutual groups'
			icon='people-outline'
			state={{ value: '3 mutuals', color: colors.blue, bgColor: colors.lightBlue }}
		/>
		<ButtonSetting name='Erase conversation' icon='message-circle-outline' iconColor={colors.red} />
	</View>
)

export const ChatSettings: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex]}>
		<ScrollView>
			<HeaderSettings actionIcon='more-horizontal-outline'>
				<View>
					<ChatSettingsHeader {...user} />
					<ChatSettingsHeaderButtons />
				</View>
			</HeaderSettings>
			<ChatSettingsBody />
		</ScrollView>
	</Layout>
)
