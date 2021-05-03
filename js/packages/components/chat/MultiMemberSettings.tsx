import React, { useState } from 'react'
import { View, ScrollView, Share, StatusBar, TouchableOpacity } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'

import { useStyles } from '@berty-tech/styles'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { Maybe, useConversation, useMsgrContext } from '@berty-tech/store/hooks'

import {
	ButtonSetting,
	FactionButtonSetting,
	ButtonSettingRow,
	ButtonDropDown,
} from '../shared-components/SettingsButtons'
import HeaderSettings from '../shared-components/Header'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { MemberAvatar, MultiMemberAvatar } from '../avatars'
import beapi from '@berty-tech/api'

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

const GroupChatSettingsHeader: React.FC<{ publicKey: Maybe<string> }> = ({ publicKey }) => {
	const conv = useConversation(publicKey)
	const ctx = useMsgrContext()
	const [picture, setPicture] = useState<ImageOrVideo | undefined>(undefined)
	const [{ text, margin, row }] = useStyles()

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
				style={[text.align.center, text.color.white, margin.top.small, text.bold.medium]}
			>
				{conv?.displayName || ''}
			</Text>
		</View>
	)
}

const MultiMemberSettingsBody: React.FC<any> = ({ publicKey, link }) => {
	const [{ padding, margin, color }, { scaleSize }] = useStyles()
	const ctx = useMsgrContext()
	const pk = publicKey
	const members = ctx.members[pk] || {}
	const navigation = useNavigation()
	const memberLength = Object.values(members).length
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
				onPress={() =>
					navigation.navigate.chat.multiMemberSettingsAddMembers({ convPK: publicKey })
				}
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
	const [{ flex, padding, color }] = useStyles()

	if (!conv) {
		goBack()
		return null
	}
	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={color.blue} barStyle='light-content' />
			<SwipeNavRecognizer>
				<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
					<HeaderSettings actionIcon='edit-outline' undo={goBack}>
						<View>
							<GroupChatSettingsHeader publicKey={conv.publicKey} />
							<GroupChatSettingsHeaderButtons {...conv} />
						</View>
					</HeaderSettings>
					<MultiMemberSettingsBody {...conv} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
