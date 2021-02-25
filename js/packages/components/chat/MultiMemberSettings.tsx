import React from 'react'
import { View, ScrollView, Share } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { useConversation, useMsgrContext } from '@berty-tech/store/hooks'

import {
	ButtonSetting,
	FactionButtonSetting,
	ButtonSettingRow,
	ButtonDropDown,
} from '../shared-components/SettingsButtons'
import HeaderSettings from '../shared-components/Header'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { MemberAvatar, MultiMemberAvatar } from '../avatars'

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

const GroupChatSettingsHeaderButtons: React.FC<any> = ({ link, publicKey }) => {
	const { navigate } = useNavigation()
	const _styles = useStylesChatSettings()
	const [{ padding, margin, color }] = useStyles()
	const { t } = useTranslation()
	return (
		<View style={[padding.top.medium, margin.top.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: t('chat.multi-member-settings.header-left-button'),
						icon: 'search-outline',
						color: color.blue,
						style: _styles.firstHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.multi-member-settings.header-middle-button'),
						icon: 'phone-outline',
						color: color.green,
						style: _styles.secondHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.multi-member-settings.header-right-button'),
						icon: 'upload',
						color: color.blue,
						style: _styles.thirdHeaderButton,
						disabled: !link || undefined,
						onPress: link ? () => navigate.chat.multiMemberQR({ convId: publicKey }) : undefined,
					},
				]}
			/>
		</View>
	)
}

const GroupChatSettingsHeader: React.FC<any> = ({ displayName }) => {
	const [{ text, margin, row }] = useStyles()
	// pass null as avatar public key to show the default multimember avatar
	return (
		<View>
			<View style={[row.center]}>
				<MultiMemberAvatar publicKey={null} size={80} />
			</View>
			<Text
				numberOfLines={1}
				ellipsizeMode='tail'
				style={[text.align.center, text.color.white, margin.top.small, text.bold.medium]}
			>
				{displayName || ''}
			</Text>
		</View>
	)
}

const MultiMemberSettingsBody: React.FC<any> = ({ publicKey, link }) => {
	const [{ padding, margin, color }] = useStyles()
	const ctx = useMsgrContext()
	const pk = publicKey
	const members = ctx.members[pk] || {}
	const navigation = useNavigation()
	const memberLength = Object.values(members).length + 1
	const memberText = memberLength < 2 ? 'member' : 'members'
	const { t } = useTranslation()
	const accountMember = Object.values(members).find((m) => m?.isMe)

	return (
		<View style={[padding.medium]}>
			<ButtonSetting
				name={t('chat.multi-member-settings.media-button')}
				icon='image-outline'
				onPress={() => navigation.navigate.chat.sharedMedias({ convPk: publicKey })}
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.notifications-button')}
				icon='bell-outline'
				toggled
				disabled
			/>
			<FactionButtonSetting
				name={t('chat.multi-member-settings.members-button.title')}
				icon='users'
				iconPack='custom'
				state={{
					value: `${memberLength} ${memberText}`,
					color: color.blue,
					bgColor: color.light.blue,
				}}
				style={[margin.top.medium]}
			>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<MemberAvatar
						publicKey={accountMember?.publicKey}
						conversationPublicKey={publicKey}
						size={30}
					/>
					<ButtonSetting
						style={[padding.horizontal.small]}
						name={accountMember?.displayName || ''}
						alone={false}
						actionIcon={null}
					/>
				</View>
				{Object.entries(members)
					.filter(([, m]) => m && !m.isMe)
					.map(([k, m]) => {
						return (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<View
									style={[
										padding.top.small,
										{
											alignSelf: 'flex-start',
										},
									]}
								>
									<MemberAvatar
										publicKey={members[k]?.publicKey}
										conversationPublicKey={publicKey}
										size={30}
									/>
								</View>

								<ButtonDropDown
									title={m?.displayName || t('chat.multi-member-settings.members-button.unknown')}
									body={m?.publicKey || ''}
								/>
							</View>
						)
					})}
			</FactionButtonSetting>
			<ButtonSetting
				name={t('chat.multi-member-settings.add-member-button')}
				icon='user-plus'
				iconPack='custom'
				disabled
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.invite-button')}
				icon='attach-outline'
				onPress={
					link
						? async () => {
								try {
									await Share.share({ url: link })
								} catch (e) {
									console.error(e)
								}
						  }
						: undefined
				}
				disabled={!link || undefined}
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.save-button')}
				icon='cloud-upload-outline'
				iconSize={30}
				actionIcon='arrow-ios-forward'
				onPress={() => {
					navigation.navigate.chat.replicateGroupSettings({ convId: publicKey })
				}}
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.erase-button')}
				icon='message-circle-outline'
				iconColor={color.red}
				disabled
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.leave-button')}
				icon='log-out-outline'
				iconColor={color.red}
				disabled
			/>
		</View>
	)
}

export const MultiMemberSettings: React.FC<ScreenProps.Chat.MultiMemberSettings> = ({ route }) => {
	const { convId } = route.params
	const conv = useConversation(convId)
	const { goBack } = useNavigation()
	const [{ flex, padding }] = useStyles()

	if (!conv) {
		goBack()
		return null
	}
	return (
		<Layout style={[flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
					<HeaderSettings actionIcon='edit-outline' undo={goBack}>
						<View>
							<GroupChatSettingsHeader {...conv} />
							<GroupChatSettingsHeaderButtons {...conv} />
						</View>
					</HeaderSettings>
					<MultiMemberSettingsBody {...conv} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
