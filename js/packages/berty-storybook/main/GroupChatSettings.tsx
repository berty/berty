import React from 'react'
import { TouchableOpacity, View, Image, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import {
	ButtonSetting,
	FactionButtonSetting,
	HeaderButtonsSetting,
} from '../shared-components/SettingsButtons'
import { UserProps, RequestProps } from '../shared-props/User'
import { GroupCircleAvatar } from '../shared-components/CircleAvatar'

//
// GroupChatSettings
//

// Styles
const _groupChatSettingsStyle = StyleSheet.create({
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

const GroupChatSettingsHeaderButtons: React.FC<{}> = () => (
	<View style={[styles.paddingTop, styles.marginTop]}>
		<HeaderButtonsSetting
			state={[
				{
					name: 'Search',
					icon: 'search-outline',
					color: colors.blue,
					style: _groupChatSettingsStyle.firstHeaderButton,
				},
				{
					name: 'Call',
					icon: 'phone-outline',
					color: colors.green,
					style: _groupChatSettingsStyle.secondHeaderButton,
				},
				{
					name: 'Share',
					icon: 'share-outline',
					color: colors.blue,
					style: _groupChatSettingsStyle.thirdHeaderButton,
				},
			]}
		/>
	</View>
)

const GroupChatSettingsHeader: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View
		style={[
			styles.bgBlue,
			styles.padding,
			styles.borderBottomLeftRadius,
			styles.borderBottomRightRadius,
		]}
	>
		<View style={[styles.row, styles.spaceCenter]}>
			<View style={[styles.flex]}>
				<Icon name='arrow-back' width={25} height={25} fill={colors.white} />
			</View>
			<View style={[_groupChatSettingsStyle.headerAvatar]}>
				<GroupCircleAvatar firstAvatarUri={avatarUri} secondAvatarUri={avatarUri} size={80} />
				<Text
					style={[styles.textCenter, styles.textWhite, styles.littleMarginTop, styles.textBold]}
				>
					{name}
				</Text>
			</View>
			<View style={[styles.flex, styles.rowRev]}>
				<Icon name='edit-outline' width={25} height={25} fill={colors.white} />
			</View>
		</View>
		<GroupChatSettingsHeaderButtons />
	</View>
)

const GroupChatSettingsBody: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding]}>
		<ButtonSetting name='Medias, links & docs' icon='image-outline' />
		<ButtonSetting name='Receive notifications' icon='bell-outline' toggled />
		<FactionButtonSetting
			name='Members'
			icon='people-outline'
			state={{ value: '4 members', color: colors.blue, bgColor: colors.lightBlue }}
			style={[styles.marginTop]}
		>
			<ButtonSetting
				style={[styles.littlePaddingLeft, styles.littlePaddingRight]}
				name={name}
				image={avatarUri}
				previewValue='Me'
				previewValueColor={colors.blue}
				alone={false}
			/>
			<ButtonSetting
				name={name}
				image={avatarUri}
				alone={false}
				style={[styles.littlePaddingLeft, styles.littlePaddingRight]}
			/>
			<ButtonSetting
				name={name}
				image={avatarUri}
				alone={false}
				style={[styles.littlePaddingLeft, styles.littlePaddingRight]}
			/>
			<ButtonSetting
				name={name}
				image={avatarUri}
				alone={false}
				style={[styles.littlePaddingLeft, styles.littlePaddingRight]}
			/>
			<ButtonSetting
				name={name}
				image={avatarUri}
				style={[styles.littlePaddingLeft, styles.littlePaddingRight]}
				alone={false}
				state={{ value: 'Not a contact', color: colors.grey, bgColor: colors.lightGrey }}
			/>
		</FactionButtonSetting>
		<ButtonSetting name='Add member' icon='person-add-outline' />
		<ButtonSetting name='Invite by link' icon='attach-outline' />
		<ButtonSetting name='Erase conversation' icon='message-circle-outline' iconColor={colors.red} />
		<ButtonSetting name='Leave group' icon='log-out-outline' iconColor={colors.red} />
	</View>
)

export const GroupChatSettings: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex]}>
		<ScrollView contentContainerStyle={[styles.paddingBottom]}>
			<SafeAreaView
				style={[styles.bgBlue, styles.borderBottomLeftRadius, styles.borderBottomRightRadius]}
			>
				<GroupChatSettingsHeader {...user} />
			</SafeAreaView>
			<GroupChatSettingsBody {...user} />
		</ScrollView>
	</Layout>
)
