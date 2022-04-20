import React, { ComponentProps, useState } from 'react'
import { View, ScrollView, Share, StatusBar, TouchableOpacity, Platform } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import Clipboard from '@react-native-clipboard/clipboard'
import QRCode from 'react-native-qrcode-svg'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { Maybe, useMessengerClient, useThemeColor } from '@berty/store'
import { useConversationMembersDict, useConversation } from '@berty/hooks'
import {
	ButtonSetting,
	FactionButtonSetting,
} from '@berty/components/shared-components/SettingsButtons'
import logo from '@berty/assets/images/1_berty_picto.png'
import { MemberAvatar, MultiMemberAvatar } from '@berty/components/avatars'
import EnableNotificationsButton from '@berty/components/chat/EnableNotificationsButton'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const GroupChatSettingsHeader: React.FC<{ publicKey: Maybe<string> }> = ({ publicKey }) => {
	const conv = useConversation(publicKey)
	const [picture, setPicture] = useState<ImageOrVideo | undefined>(undefined)
	const { text, padding, border, row } = useStyles()
	const { scaleSize, scaleHeight, windowWidth, windowHeight } = useAppDimensions()
	const colors = useThemeColor()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.4
	const { navigate } = useNavigation()
	const client = useMessengerClient()

	const handleSave = React.useCallback(async () => {
		try {
			if (picture) {
				const stream = await client?.mediaPrepare({})
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
				await client?.interact({
					conversationPublicKey: conv?.publicKey,
					type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo,
					payload: buf,
					mediaCids: [reply.cid],
					metadata: true,
				})
			}
		} catch (err) {
			console.warn(err)
		}
	}, [conv?.publicKey, client, picture])

	React.useEffect(() => {
		if (picture !== undefined) {
			return () => handleSave()
		}
		return () => {}
	}, [picture, handleSave])
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
					<TouchableOpacity
						style={{ position: 'absolute', top: -(90 * scaleSize) }}
						onPress={async () => {
							try {
								const pic = await ImagePicker?.openPicker({
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
	const { padding, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const members = useConversationMembersDict(publicKey)
	const membersCount = Object.values(members).length
	const { t } = useTranslation()
	const accountMember = Object.values(members).find(m => m?.isMe)

	return (
		<View style={[padding.medium]}>
			<ButtonSetting
				name={t('chat.multi-member-settings.media-button')}
				icon='image-outline'
				onPress={() => navigation.navigate('Chat.SharedMedias', { convPk: publicKey })}
			/>
			{Platform.OS !== 'web' && <EnableNotificationsButton conversationPk={publicKey} />}
			<FactionButtonSetting
				name={`${t('chat.multi-member-settings.members-button.title')} (${membersCount})`}
				icon='users'
				iconPack='custom'
				style={[margin.top.medium]}
				isDropdown
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
						onPress={() => {
							navigation.navigate('Group.ChatSettingsMemberDetail', {
								convId: publicKey,
								memberPk: accountMember?.publicKey!,
								displayName: accountMember?.displayName || '',
							})
						}}
					/>
				</View>
				{Object.entries(members)
					.filter(([, m]) => m && !m.isMe)
					.map(([k], key) => {
						return (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}
								key={key}
							>
								<MemberAvatar
									publicKey={members[k]?.publicKey}
									conversationPublicKey={publicKey}
									size={30 * scaleSize}
								/>
								<ButtonSetting
									style={[padding.horizontal.small]}
									textSize={15}
									name={members[k]?.displayName || ''}
									alone={false}
									actionIcon={null}
									onPress={() => {
										navigation.navigate('Group.ChatSettingsMemberDetail', {
											convId: publicKey,
											memberPk: members[k]?.publicKey!,
											displayName: members[k]?.displayName || '',
										})
									}}
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
					navigation.navigate('Chat.MultiMemberSettingsAddMembers', { convPK: publicKey })
				}
			/>
			<ButtonSetting
				name={t('chat.multi-member-settings.invite-button')}
				icon='attach-outline'
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
				disabled={!link || undefined}
			/>
			{Platform.OS !== 'web' && (
				<ButtonSetting
					name={t('chat.multi-member-settings.save-button')}
					icon='cloud-upload-outline'
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						navigation.navigate('Chat.ReplicateGroupSettings', { convId: publicKey })
					}}
				/>
			)}
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
