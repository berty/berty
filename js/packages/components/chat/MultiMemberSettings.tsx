import React, { useState } from 'react'
import { View, ScrollView, Share, StatusBar, TouchableOpacity } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import { Maybe, useConversation, useMessengerContext, useThemeColor } from '@berty-tech/store'

import {
	ButtonSetting,
	FactionButtonSetting,
	ButtonSettingRow,
	ButtonDropDown,
} from '../shared-components/SettingsButtons'

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
	const [{ padding, margin }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	return (
		<View style={[padding.top.medium, margin.top.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: t('chat.multi-member-settings.header-left-button'),
						icon: 'search-outline',
						color: colors['background-header'],
						style: _styles.firstHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.multi-member-settings.header-middle-button'),
						icon: 'phone-outline',
						color: colors['background-header'],
						style: _styles.secondHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.multi-member-settings.header-right-button'),
						icon: 'upload',
						color: colors['background-header'],
						style: _styles.thirdHeaderButton,
						disabled: !link || undefined,
						onPress: link ? () => navigate('Chat.MultiMemberQR', { convId: publicKey }) : undefined,
					},
				]}
			/>
		</View>
	)
}

const GroupChatSettingsHeader: React.FC<{ publicKey: Maybe<string> }> = ({ publicKey }) => {
	const conv = useConversation(publicKey)
	const ctx = useMessengerContext()
	const [picture, setPicture] = useState<ImageOrVideo | undefined>(undefined)
	const [{ text, margin, row }] = useStyles()
	const colors = useThemeColor()

	const handleSave = React.useCallback(async () => {
		try {
			if (picture) {
				const stream = await ctx.client?.mediaPrepare({})
				if (!stream) {
					throw new Error('failed to open prepareAttachment stream')
				}

				const avatarURI = picture?.path
				await stream.emit({
					info: {
						mimeType: picture.mime,
						filename: picture.filename,
						displayName: picture.filename,
					},
					uri: avatarURI,
				})

				const reply = await stream.stopAndRecv()
				if (!reply?.cid) {
					throw new Error('invalid PrepareAttachment reply, missing cid')
				}

				const buf = beapi.messenger.AppMessage.SetGroupInfo.encode({
					avatarCid: reply.cid,
				}).finish()
				await ctx.client?.interact({
					conversationPublicKey: conv?.publicKey,
					type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo,
					payload: buf,
					mediaCids: [reply.cid],
				})
			}
		} catch (err) {
			console.warn(err)
		}
	}, [conv?.publicKey, ctx.client, picture])

	React.useEffect(() => {
		if (picture !== undefined) {
			return () => handleSave()
		}
		return () => {}
	}, [picture, handleSave])
	return (
		<View>
			<TouchableOpacity
				style={[row.center]}
				onPress={async () => {
					try {
						const pic = await ImagePicker.openPicker({
							width: 400,
							height: 400,
							cropping: true,
							cropperCircleOverlay: true,
							mediaType: 'photo',
						})
						if (pic) {
							setPicture(pic)
						}
					} catch (err) {
						console.log(err)
					}
				}}
			>
				<MultiMemberAvatar publicKey={publicKey} size={80} />
			</TouchableOpacity>
			<Text
				numberOfLines={1}
				ellipsizeMode='tail'
				style={[
					text.align.center,
					margin.top.small,
					text.bold.medium,
					{ color: colors['reverted-main-text'] },
				]}
			>
				{conv?.displayName || ''}
			</Text>
		</View>
	)
}

const MultiMemberSettingsBody: React.FC<any> = ({ publicKey, link }) => {
	const [{ padding, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const pk = publicKey
	const members = ctx.members[pk] || {}
	const { navigate } = useNavigation()
	const memberLength = Object.values(members).length
	const memberText = memberLength < 2 ? 'member' : 'members'
	const { t } = useTranslation()
	const accountMember = Object.values(members).find(m => m?.isMe)

	return (
		<View style={[padding.medium]}>
			<ButtonSetting
				name={t('chat.multi-member-settings.media-button')}
				icon='image-outline'
				onPress={() => navigate('Chat.SharedMedias', { convPk: publicKey })}
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
					color: colors['background-header'],
					bgColor: colors['positive-asset'],
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
						size={30 * scaleSize}
					/>
					<ButtonSetting
						style={[padding.horizontal.small]}
						textSize={15}
						name={accountMember?.displayName || ''}
						alone={false}
						actionIcon={null}
					/>
				</View>
				{Object.entries(members)
					.filter(([, m]) => m && !m.isMe)
					.map(([k, m], key) => {
						return (
							<View
								key={key}
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
										size={30 * scaleSize}
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
				onPress={() => navigate('Chat.MultiMemberSettingsAddMembers', { convPK: publicKey })}
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
					navigate('Chat.ReplicateGroupSettings', { convId: publicKey })
				}}
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.erase-button')}
				icon='message-circle-outline'
				iconColor={colors['secondary-background-header']}
				disabled
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.leave-button')}
				icon='log-out-outline'
				iconColor={colors['secondary-background-header']}
				disabled
			/>
		</View>
	)
}

export const MultiMemberSettings: React.FC<ScreenProps.Chat.MultiMemberSettings> = ({ route }) => {
	const { convId } = route.params
	const conv = useConversation(convId)
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const [{ padding }] = useStyles()

	if (!conv) {
		goBack()
		return null
	}
	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<GroupChatSettingsHeader publicKey={conv.publicKey} />
					<GroupChatSettingsHeaderButtons {...conv} />
				</View>
				<MultiMemberSettingsBody {...conv} />
			</ScrollView>
		</Layout>
	)
}
