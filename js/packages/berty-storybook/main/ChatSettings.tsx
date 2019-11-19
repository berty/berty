import React, { useState } from 'react'
import { TouchableOpacity, View, Image, SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { ButtonSetting, HeaderButtonsSetting } from '../shared-components/SettingsButtons'
import { UserProps, RequestProps } from '../shared-props/User'
import { CircleAvatar } from '../shared-components/CircleAvatar'

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
	<View style={[styles.padding, styles.bgBlue, styles.row]}>
		<TouchableOpacity style={[styles.flex]}>
			<Icon name='arrow-back' width={30} height={30} fill={colors.white} />
		</TouchableOpacity>
		<View style={[_chatSettingsStyle.headerAvatar]}>
			<CircleAvatar style={styles.alignItems} avatarUri={avatarUri} size={100} />
			<Text
				numberOfLines={1}
				style={[styles.textWhite, styles.center, styles.littlePaddingTop, styles.textBold]}
			>
				{name}
			</Text>
		</View>
		<TouchableOpacity style={[styles.flex, styles.rowRev]}>
			<Icon name='more-horizontal' width={30} height={30} fill={colors.white} />
		</TouchableOpacity>
	</View>
)

const ChatSettingsHeaderButtons: React.FC<{}> = () => (
	<View style={[styles.paddingLeft, styles.paddingRight, styles.paddingTop]}>
		<HeaderButtonsSetting
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
			<SafeAreaView
				style={[styles.bgBlue, styles.borderBottomLeftRadius, styles.borderBottomRightRadius]}
			>
				<ChatSettingsHeader {...user} />
			</SafeAreaView>
			<ChatSettingsHeaderButtons />
			<ChatSettingsBody />
		</ScrollView>
	</Layout>
)
