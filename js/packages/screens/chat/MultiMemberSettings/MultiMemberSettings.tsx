import Clipboard from '@react-native-clipboard/clipboard'
import { Layout } from '@ui-kitten/components'
import React, { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView, Share, StatusBar, TouchableOpacity, Platform } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import logo from '@berty/assets/images/1_berty_picto.png'
import { FloatingMenuItemWithPrimaryIcon, MembersDropdown } from '@berty/components'
import { MultiMemberAvatar } from '@berty/components/avatars'
import EnableNotificationsButton from '@berty/components/chat/EnableNotificationsButton'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useConversation, useConversationMembers, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { Maybe } from '@berty/utils/type/maybe'

const GroupChatSettingsHeader: React.FC<{ publicKey: Maybe<string> }> = ({ publicKey }) => {
	const conv = useConversation(publicKey)
	const { text, padding, border, row } = useStyles()
	const { scaleSize, scaleHeight, windowWidth, windowHeight } = useAppDimensions()
	const colors = useThemeColor()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.4
	const { navigate } = useNavigation()

	return (
		<View style={[row.center, padding.top.scale(30)]}>
			<TouchableOpacity
				style={[
					border.radius.medium,
					padding.scale(20),
					padding.top.scale(55),
					{ backgroundColor: colors['main-background'] },
				]}
				onPress={async () => {
					if (publicKey) {
						navigate('Chat.MultiMemberQR', { convId: publicKey })
					}
				}}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -(90 * scaleSize) }}>
						<MultiMemberAvatar publicKey={publicKey} size={80} />
					</View>
					<UnifiedText style={[text.size.small]}>{conv?.displayName || ''}</UnifiedText>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{conv?.link ? (
							<QRCode
								size={qrCodeSize}
								value={conv?.link && conv?.link}
								logo={logo}
								color={colors['background-header']}
								mode='circle'
								backgroundColor={colors['main-background']}
							/>
						) : null}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const MultiMemberSettingsBody: React.FC<{
	publicKey: string
	link: string
	navigation: ComponentProps<typeof MultiMemberSettings>['navigation']
}> = ({ publicKey, link, navigation }) => {
	const { padding } = useStyles()
	const members = useConversationMembers(publicKey)
	const membersCount = Object.values(members).length
	const { t } = useTranslation()

	return (
		<View style={[padding.medium]}>
			<FloatingMenuItemWithPrimaryIcon
				pack='custom'
				iconName='user-plus'
				onPress={() =>
					navigation.navigate('Chat.MultiMemberSettingsAddMembers', { convPK: publicKey })
				}
			>
				{t('chat.multi-member-settings.add-member-button')}
			</FloatingMenuItemWithPrimaryIcon>
			<View style={{ marginTop: 20 }}>
				<MembersDropdown
					items={members}
					publicKey={publicKey}
					onChangeItem={member => {
						navigation.navigate('Group.ChatSettingsMemberDetail', {
							convId: publicKey,
							memberPk: member?.publicKey!,
							displayName: member?.displayName || '',
						})
					}}
					placeholder={t('chat.multi-member-settings.members-button.title', {
						count: membersCount,
					})}
				/>
			</View>
			{Platform.OS !== 'web' && <EnableNotificationsButton conversationPk={publicKey} />}
			<FloatingMenuItemWithPrimaryIcon
				iconName='attach-outline'
				onPress={
					link
						? async () => {
								try {
									if (Platform.OS === 'web') {
										Clipboard.setString(link)
									} else {
										await Share.share({ url: link, message: link })
									}
								} catch (e) {
									console.error(e)
								}
						  }
						: undefined
				}
			>
				{t('chat.multi-member-settings.invite-button')}
			</FloatingMenuItemWithPrimaryIcon>
			{/* TODO: uncomment when replication nodes works */}
			{/* {Platform.OS !== 'web' && (
				<ButtonSetting
					name={t('chat.multi-member-settings.save-button')}
					icon='cloud-upload-outline'
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						navigation.navigate('Chat.ReplicateGroupSettings', { convId: publicKey })
					}}
				/>
			)} */}
		</View>
	)
}

export const MultiMemberSettings: ScreenFC<'Group.MultiMemberSettings'> = ({
	route,
	navigation,
}) => {
	const { convId } = route.params
	const conv = useConversation(convId)
	const colors = useThemeColor()
	const { padding } = useStyles()

	if (!conv) {
		navigation.goBack()
		return null
	}
	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<GroupChatSettingsHeader publicKey={conv.publicKey} />
				</View>
				<MultiMemberSettingsBody
					publicKey={conv.publicKey || ''}
					link={conv.link || ''}
					navigation={navigation}
				/>
			</ScrollView>
		</Layout>
	)
}
