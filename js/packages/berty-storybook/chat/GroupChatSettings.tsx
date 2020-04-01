import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
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
const useStylesChatSettings = () => {
	const [{ margin, height }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
	}
}

const GroupChatSettingsHeaderButtons: React.FC<{}> = () => {
	const _styles = useStylesChatSettings()
	const [{ padding, margin, color }] = useStyles()
	return (
		<View style={[padding.top.medium, margin.top.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Search',
						icon: 'search-outline',
						color: color.blue,
						style: _styles.firstHeaderButton,
					},
					{
						name: 'Call',
						icon: 'phone-outline',
						color: color.green,
						style: _styles.secondHeaderButton,
					},
					{
						name: 'Share',
						icon: 'share-outline',
						color: color.blue,
						style: _styles.thirdHeaderButton,
					},
				]}
			/>
		</View>
	)
}

const GroupChatSettingsHeader: React.FC<berty.chatmodel.IConversation> = ({ avatarUri, title }) => {
	const [{ text, margin }] = useStyles()
	return (
		<View>
			<GroupCircleAvatar
				firstAvatarUri={avatarUri || ''}
				secondAvatarUri={avatarUri || ''}
				size={80}
				style={{ alignItems: 'center' }}
			/>
			<Text
				numberOfLines={1}
				ellipsizeMode='tail'
				style={[text.align.center, text.color.white, margin.top.small, text.bold.medium]}
			>
				{title || ''}
			</Text>
		</View>
	)
}

const GroupChatSettingsBody: React.FC<berty.chatmodel.IConversation> = ({ avatarUri, name }) => {
	const [{ padding, margin, color }] = useStyles()
	return (
		<View style={[padding.medium]}>
			<ButtonSetting name='Medias, links & docs' icon='image-outline' />
			<ButtonSetting name='Receive notifications' icon='bell-outline' toggled />
			<FactionButtonSetting
				name='Members'
				icon='people-outline'
				state={{ value: '4 members', color: color.blue, bgColor: color.light.blue }}
				style={[margin.top.medium]}
			>
				<ButtonSetting
					style={[padding.horizontal.small]}
					name={name}
					image={avatarUri}
					previewValue='Me'
					previewValueColor={color.blue}
					alone={false}
				/>
				<ButtonSetting
					name={name}
					image={avatarUri}
					alone={false}
					style={[padding.horizontal.small]}
				/>
				<ButtonSetting
					name={name}
					image={avatarUri}
					alone={false}
					style={[padding.horizontal.small]}
				/>
				<ButtonSetting
					name={name}
					image={avatarUri}
					alone={false}
					style={[padding.horizontal.small]}
				/>
				<ButtonSetting
					name={name}
					image={avatarUri}
					style={[padding.horizontal.small]}
					alone={false}
					state={{ value: 'Not a contact', color: color.grey, bgColor: color.light.grey }}
				/>
			</FactionButtonSetting>
			<ButtonSetting name='Add member' icon='person-add-outline' />
			<ButtonSetting name='Invite by link' icon='attach-outline' />
			<ButtonSetting
				name='Erase conversation'
				icon='message-circle-outline'
				iconColor={color.red}
			/>
			<ButtonSetting name='Leave group' icon='log-out-outline' iconColor={color.red} />
		</View>
	)
}

export const GroupChatSettings: React.FC<ScreenProps.Main.GroupChatSettings> = ({
	route: { params },
}) => {
	const { goBack } = useNavigation()
	const [{ flex, padding }] = useStyles()
	return (
		<Layout style={[flex.tiny]}>
			<ScrollView contentContainerStyle={[padding.bottom.medium]}>
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
