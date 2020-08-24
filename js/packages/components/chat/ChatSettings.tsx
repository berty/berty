import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

import { Messenger } from '@berty-tech/store/oldhooks'

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

const ChatSettingsHeader: React.FC<{ contact: messenger.contact.Entity }> = ({ contact }) => {
	const _styles = useStylesChatSettings()
	const [{ text, padding, border, row }] = useStyles()
	return (
		<View style={[_styles.headerAvatar]}>
			<ProceduralCircleAvatar
				seed={contact.publicKey}
				style={[border.shadow.big, row.center]}
				diffSize={30}
			/>
			<Text
				numberOfLines={1}
				style={[text.size.scale(18), text.color.white, text.align.center, padding.top.small]}
			>
				{contact.name}
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
						disabled: true,
					},
					{
						name: 'Call',
						icon: 'phone-outline',
						color: color.green,
						style: _styles.secondHeaderButton,
						disabled: true,
					},
					{
						name: 'Share',
						icon: 'upload',
						color: color.blue,
						style: _styles.thirdHeaderButton,
						disabled: true,
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
			<ButtonSetting name='Medias, links & docs' icon='image-outline' disabled />
			<ButtonSetting name='Receive notifications' icon='bell-outline' toggled disabled />
			<ButtonSetting
				name='Mutual groups'
				icon='users'
				iconPack='custom'
				state={{ value: '3 mutuals', color: color.blue, bgColor: color.light.blue }}
				disabled
			/>
			<ButtonSetting
				name='Erase conversation'
				icon='message-circle-outline'
				iconColor={color.red}
				disabled
			/>
		</View>
	)
}

export const ChatSettings: React.FC<ScreenProps.Chat.Settings> = ({ route: { params } }) => {
	const { goBack, navigate } = useNavigation()
	const [{ flex, background }] = useStyles()
	const { convId } = params
	const conv = Messenger.useGetConversation(convId)
	const contact = Messenger.useContact({
		id:
			(conv && conv.kind === messenger.conversation.ConversationKind.OneToOne && conv.contactId) ||
			'none',
	})
	if (!(conv && conv.kind === messenger.conversation.ConversationKind.OneToOne && contact)) {
		goBack()
		return null
	}
	return (
		<ScrollView style={[flex.tiny, background.white]} bounces={false}>
			<HeaderSettings
				action={() => navigate.chat.oneToOneSettings({ contactId: conv.contactId })}
				actionIcon='more-horizontal-outline'
				undo={goBack}
			>
				<View>
					<ChatSettingsHeader contact={contact} />
					<ChatSettingsHeaderButtons />
				</View>
			</HeaderSettings>
			<ChatSettingsBody />
		</ScrollView>
	)
}
