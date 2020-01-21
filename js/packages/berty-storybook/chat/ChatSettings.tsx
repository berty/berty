import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'

//
// ChatSettings
//

// Styles
const useStylesChatSettings = () => {
	const [{ flex, height, margin }] = useStyles()
	return {
		headerAvatar: flex.large,
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
	}
}

const ChatSettingsHeader: React.FC<berty.chatmodel.IConversation> = ({ avatarUri, title }) => {
	const _styles = useStylesChatSettings()
	const [{ text, padding, row }] = useStyles()
	return (
		<View style={[_styles.headerAvatar]}>
			<CircleAvatar style={row.item.justify} avatarUri={avatarUri || ''} size={100} />
			<Text
				numberOfLines={1}
				style={[text.color.white, text.align.center, padding.top.small, text.bold]}
			>
				{title || ''}
			</Text>
		</View>
	)
}

const ChatSettingsHeaderButtons: React.FC<{}> = () => {
	const _styles = useStylesChatSettings()
	const [{ padding, color }] = useStyles()
	return (
		<View style={[padding.horizontal.medium, padding.top.medium]}>
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

const ChatSettingsBody: React.FC<{}> = () => {
	const [{ padding, color }] = useStyles()
	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSetting name='Medias, links & docs' icon='image-outline' />
			<ButtonSetting name='Receive notifications' icon='bell-outline' toggled />
			<ButtonSetting
				name='Mutual groups'
				icon='people-outline'
				state={{ value: '3 mutuals', color: color.blue, bgColor: color.light.blue }}
			/>
			<ButtonSetting
				name='Erase conversation'
				icon='message-circle-outline'
				iconColor={color.red}
			/>
		</View>
	)
}

export const ChatSettings: React.FC<ScreenProps.Chat.Settings> = ({ route: { params } }) => {
	console.log('params', params)
	const { goBack, navigate } = useNavigation()
	const [{ flex, background }] = useStyles()
	return (
		<ScrollView style={[flex.tiny, background.white]}>
			<HeaderSettings
				action={() => navigate.chat.one2OneSettings()}
				actionIcon='more-horizontal-outline'
				undo={goBack}
			>
				<View>
					<ChatSettingsHeader {...params} />
					<ChatSettingsHeaderButtons />
				</View>
			</HeaderSettings>
			<ChatSettingsBody />
		</ScrollView>
	)
}
