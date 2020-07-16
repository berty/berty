import React from 'react'
import { View, ScrollView, Share } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import {
	ButtonSetting,
	FactionButtonSetting,
	ButtonSettingRow,
} from '../shared-components/SettingsButtons'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { messenger } from '@berty-tech/store'
import { Messenger, Groups } from '@berty-tech/hooks'
import { scaleHeight } from '@berty-tech/styles/constant'

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

const GroupChatSettingsHeaderButtons: React.FC<
	| messenger.conversation.FakeConversation
	| messenger.conversation.OneToOneConversation
	| messenger.conversation.MultiMemberConversation
> = ({ shareableGroup, id }) => {
	const { navigate } = useNavigation()
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
						disabled: !shareableGroup || undefined,
						onPress: () => navigate.chat.multiMemberQR({ convId: id }),
					},
				]}
			/>
		</View>
	)
}

const GroupChatSettingsHeader: React.FC<messenger.conversation.Entity> = ({ title, id }) => {
	const [{ text, margin }] = useStyles()
	return (
		<View>
			<ConversationProceduralAvatar
				conversationId={id}
				size={120 * scaleHeight}
				diffSize={20}
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

const GroupSettingsBody: React.FC<
	| messenger.conversation.FakeConversation
	| messenger.conversation.OneToOneConversation
	| messenger.conversation.MultiMemberConversation
> = ({ pk, shareableGroup }) => {
	const [{ padding, margin, color }] = useStyles()
	const { membersNames } = Messenger.useGetConversation(pk)
	const { membersDevices } = Groups.useGroups()[pk] || { membersDevices: {} }
	return (
		<View style={[padding.medium]}>
			<ButtonSetting name='Medias, links & docs' icon='image-outline' disabled />
			<ButtonSetting name='Receive notifications' icon='bell-outline' toggled disabled />
			<FactionButtonSetting
				name='Members'
				icon='users'
				iconPack='custom'
				state={{
					value: `${Object.values(membersDevices).length} members`,
					color: color.blue,
					bgColor: color.light.blue,
				}}
				style={[margin.top.medium]}
			>
				{Object.entries(membersDevices).map(([k, v]) => {
					return (
						<ButtonSetting
							style={[padding.horizontal.small]}
							name={`${(membersNames && membersNames[k]) || 'Unknown'}: ${v}`}
							// image={seed}
							// previewValue="Me"
							// previewValueColor={color.blue}
							// state={{ value: 'Not a contact', color: color.grey, bgColor: color.light.grey }}
							alone={false}
						/>
					)
				})}
			</FactionButtonSetting>
			<ButtonSetting name='Add member' icon='user-plus' iconPack='custom' disabled />
			<ButtonSetting
				name='Invite by link'
				icon='attach-outline'
				onPress={
					shareableGroup
						? async () => {
								try {
									await Share.share({ url: shareableGroup })
								} catch (e) {
									console.error(e)
								}
						  }
						: undefined
				}
				disabled={!shareableGroup || undefined}
			/>
			<ButtonSetting
				name='Erase conversation'
				icon='message-circle-outline'
				iconColor={color.red}
				disabled
			/>
			<ButtonSetting name='Leave group' icon='log-out-outline' iconColor={color.red} disabled />
		</View>
	)
}

export const GroupSettings: React.FC<ScreenProps.Chat.GroupSettings> = ({ route }) => {
	const { convId } = route.params
	const conv = Messenger.useGetConversation(convId)
	const { goBack } = useNavigation()
	const [{ flex, padding }] = useStyles()

	if (!conv) {
		goBack()
		return null
	}
	return (
		<Layout style={[flex.tiny]}>
			<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
				<HeaderSettings actionIcon='edit-outline' undo={goBack}>
					<View>
						<GroupChatSettingsHeader {...conv} />
						<GroupChatSettingsHeaderButtons {...conv} />
					</View>
				</HeaderSettings>
				<GroupSettingsBody {...conv} />
			</ScrollView>
		</Layout>
	)
}
