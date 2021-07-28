import React from 'react'
import { ScrollView, View, StatusBar } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import beapi from '@berty-tech/api'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useContact, useConversation, useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import HeaderSettings from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ContactAvatar } from '../avatars'

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
	const [{ text, padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[_styles.headerAvatar, { alignItems: 'center' }]}>
			<ContactAvatar size={100 * scaleSize} publicKey={contact.publicKey} pressable />
			<Text
				numberOfLines={1}
				style={[
					text.size.scale(18),
					text.align.center,
					padding.top.small,
					{ color: colors['reverted-main-text'] },
				]}
			>
				{contact.displayName}
			</Text>
		</View>
	)
}

const OneToOneHeaderButtons: React.FC<{}> = () => {
	const _styles = useStylesOneToOne()
	const colors = useThemeColor()
	const [{ padding }] = useStyles()
	const { t } = useTranslation()
	return (
		<View style={[padding.horizontal.medium, padding.top.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: t('chat.one-to-one-settings.header-left-button'),
						icon: 'search-outline',
						color: colors['background-header'],
						style: _styles.firstHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.one-to-one-settings.header-middle-button'),
						icon: 'phone-outline',
						color: colors['background-header'],
						style: _styles.secondHeaderButton,
						disabled: true,
					},
					{
						name: t('chat.one-to-one-settings.header-right-button'),
						icon: 'upload',
						color: colors['background-header'],
						style: _styles.thirdHeaderButton,
						disabled: true,
					},
				]}
			/>
		</View>
	)
}

const OneToOneBody: React.FC<any> = ({ publicKey, isIncoming }) => {
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t } = useTranslation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSetting
				name={t('chat.one-to-one-settings.media-button')}
				icon='image-outline'
				onPress={() => navigation.navigate.chat.sharedMedias({ convPk: publicKey })}
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
				state={{
					value: '3 mutuals',
					color: colors['background-header'],
					bgColor: colors['positive-asset'],
				}}
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
				iconColor={colors['secondary-background-header']}
				disabled
			/>
		</View>
	)
}

export const OneToOneSettings: React.FC<ScreenProps.Chat.OneToOneSettings> = ({
	route: { params },
}) => {
	const colors = useThemeColor()
	const { goBack, navigate } = useNavigation()
	const { convId } = params
	const conv = useConversation(convId)
	const contact = useContact(conv?.contactPublicKey)
	if (!(conv && conv.type === beapi.messenger.Conversation.Type.ContactType && contact)) {
		goBack()
		return null
	}
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	return (
		<>
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				<ScrollView style={{ flex: 1, backgroundColor: colors['main-background'] }} bounces={false}>
					<SwipeNavRecognizer>
						<HeaderSettings
							action={() =>
								navigate.chat.contactSettings({ contactId: conv.contactPublicKey || '' })
							}
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
			</View>
		</>
	)
}
