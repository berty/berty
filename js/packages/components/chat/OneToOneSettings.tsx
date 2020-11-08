import React from 'react'
import { ScrollView, View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useContact, useConversation, usePersistentOptions } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import HeaderSettings from '../shared-components/Header'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import Logo from '../main/1_berty_picto.svg'

//
// OneToOneSettings
//

// Styles
const useStylesOneToOne = () => {
	const [{ flex, height, margin }] = useStyles()
	return {
		headerAvatar: flex.large,
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
	}
}

const OneToOneHeader: React.FC<{ contact: any }> = ({ contact }) => {
	const _styles = useStylesOneToOne()
	const [{ text, padding, border, row, background, margin }] = useStyles()

	const persistOpts = usePersistentOptions()
	const isBetabot =
		persistOpts &&
		persistOpts.betabot &&
		persistOpts.betabot.convPk &&
		contact.publicKey.toString() === persistOpts.betabot.convPk.toString()
	const betabotAvatarSize = 100
	return (
		<View style={[_styles.headerAvatar]}>
			{!isBetabot ? (
				<ProceduralCircleAvatar
					seed={contact.publicKey}
					style={[border.shadow.big, row.center]}
					diffSize={30}
				/>
			) : (
				<View
					style={[
						border.radius.scale(betabotAvatarSize),
						border.shadow.medium,
						background.white,
						margin.right.small,
						{
							justifyContent: 'center',
							alignItems: 'center',
							display: 'flex',
							width: betabotAvatarSize,
							height: betabotAvatarSize,
							alignSelf: 'center',
						},
					]}
				>
					<Logo
						width={betabotAvatarSize - 35}
						height={betabotAvatarSize - 35}
						style={{ right: -1, top: -1 }}
					/>
				</View>
			)}
			<Text
				numberOfLines={1}
				style={[text.size.scale(18), text.color.white, text.align.center, padding.top.small]}
			>
				{contact.displayName}
			</Text>
		</View>
	)
}

const OneToOneHeaderButtons: React.FC<{}> = () => {
	const _styles = useStylesOneToOne()
	const [{ padding, color }] = useStyles()
	const { t } = useTranslation()
	return (
		<View style={[padding.horizontal.medium, padding.top.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: t('chat.one-to-one-settings.header-left-button'),
						icon: 'search-outline',
						color: color.blue,
						style: _styles.firstHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.one-to-one-settings.header-middle-button'),
						icon: 'phone-outline',
						color: color.green,
						style: _styles.secondHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.one-to-one-settings.header-right-button'),
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

const OneToOneBody: React.FC<any> = ({ publicKey, isIncoming }) => {
	const [{ padding, color }] = useStyles()
	const navigation = useNavigation()
	const { t } = useTranslation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSetting
				name={t('chat.one-to-one-settings.media-button')}
				icon='image-outline'
				disabled
			/>
			<ButtonSetting
				name={t('chat.one-to-one-settings.notifications-button')}
				icon='bell-outline'
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('chat.one-to-one-settings.mutual-button')}
				icon='users'
				iconPack='custom'
				state={{ value: '3 mutuals', color: color.blue, bgColor: color.light.blue }}
				disabled
			/>
			{!isIncoming && (
				<ButtonSetting
					name={t('chat.one-to-one-settings.save-button')}
					icon='cloud-upload-outline'
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						navigation.navigate.chat.replicateGroupSettings({ convId: publicKey })
					}}
				/>
			)}
			<ButtonSetting
				name={t('chat.one-to-one-settings.erase-button')}
				icon='message-circle-outline'
				iconColor={color.red}
				disabled
			/>
		</View>
	)
}

export const OneToOneSettings: React.FC<ScreenProps.Chat.OneToOneSettings> = ({
	route: { params },
}) => {
	const { goBack, navigate } = useNavigation()
	const [{ flex, background, padding }] = useStyles()
	const { convId } = params
	const conv = useConversation(convId)
	const contact = useContact(conv.contactPublicKey)
	if (!(conv && conv.type === messengerpb.Conversation.Type.ContactType && contact)) {
		goBack()
		return null
	}
	const isIncoming = contact && contact.state === messengerpb.Contact.State.IncomingRequest

	return (
		<ScrollView
			style={[flex.tiny, background.white]}
			contentContainerStyle={[padding.bottom.huge]}
			bounces={false}
		>
			<SwipeNavRecognizer>
				<HeaderSettings
					action={() => navigate.chat.contactSettings({ contactId: conv.contactPublicKey })}
					actionIcon='more-horizontal-outline'
					undo={goBack}
				>
					<View>
						<OneToOneHeader contact={contact} />
						<OneToOneHeaderButtons />
					</View>
				</HeaderSettings>
				<OneToOneBody {...conv} isIncoming={isIncoming} />
			</SwipeNavRecognizer>
		</ScrollView>
	)
}
