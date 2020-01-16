import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import {
	ButtonSetting,
	FactionButtonSetting,
	ButtonSettingRow,
} from '../shared-components/SettingsButtons'
import { GroupCircleAvatar } from '../shared-components/CircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'

//
// GroupChatSettings
//

// Styles
const _groupChatSettingsStyle = StyleSheet.create({
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
		<ButtonSettingRow
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

const GroupChatSettingsHeader: React.FC<berty.chatmodel.IConversation> = ({ avatarUri, title }) => {
	return (
		<View>
			<GroupCircleAvatar
				firstAvatarUri={avatarUri || ''}
				secondAvatarUri={avatarUri || ''}
				size={80}
			/>
			<Text
				numberOfLines={1}
				ellipsizeMode='tail'
				style={[styles.textCenter, styles.textWhite, styles.littleMarginTop, styles.textBold]}
			>
				{title || ''}
			</Text>
		</View>
	)
}

const GroupChatSettingsBody: React.FC<berty.chatmodel.IConversation> = ({ avatarUri, name }) => (
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

export const GroupChatSettings: React.FC<ScreenProps.Main.GroupChatSettings> = ({
	route: { params },
}) => {
	const { goBack } = useNavigation()
	return (
		<Layout style={[styles.flex]}>
			<ScrollView contentContainerStyle={[styles.paddingBottom]}>
				<HeaderSettings actionIcon='edit-outline' undo={goBack}>
					<View>
						<GroupChatSettingsHeader {...params} />
						<GroupChatSettingsHeaderButtons />
					</View>
				</HeaderSettings>
				<GroupChatSettingsBody {...params} />
			</ScrollView>
		</Layout>
	)
}
