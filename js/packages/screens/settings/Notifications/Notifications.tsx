import { Icon } from '@ui-kitten/components'
import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, View } from 'react-native'
import { RESULTS } from 'react-native-permissions'
import { useSelector } from 'react-redux'

import { berty } from '@berty/api/root.pb'
import { DividerItem, ItemSection, MenuToggle } from '@berty/components'
import { ConversationAvatar } from '@berty/components/avatars'
import { ButtonSettingV2 } from '@berty/components/shared-components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import PermissionsContext from '@berty/contexts/permissions.context'
import { useAccount, useMessengerClient, useOneToOneContact, useThemeColor } from '@berty/hooks'
import { useAllConversations } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { numberifyLong } from '@berty/utils/convert/long'
import {
	accountPushToggleState,
	askAndSharePushTokenOnAllConversations,
	enableNotificationsForConversation,
	pushFilteringAvailable,
	pushAvailable,
} from '@berty/utils/notification/notif-push'
import { serviceTypes } from '@berty/utils/remote-services/remote-services'

const oneSecond = 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24
const oneYear = oneDay * 365

const timeoutDisplay = (t: (_: String, __?: any) => string, timeout: number): string => {
	const expiresIn = timeout - Date.now()

	if (expiresIn < oneHour) {
		return t('time-for.minutes', { minutes: parseInt(String(expiresIn / oneMinute), 10) })
	} else if (expiresIn < oneDay) {
		return t('time-for.hours', { hours: parseInt(String(expiresIn / oneHour), 10) })
	} else if (expiresIn < oneYear) {
		return t('time-for.days', { days: parseInt(String(expiresIn / oneDay), 10) })
	}

	return t('muted')
}

const MutedConversationButton = ({
	conversation,
}: {
	conversation: berty.messenger.v1.IConversation
}) => {
	const { t } = useTranslation()
	const messengerClient = useMessengerClient()

	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()

	const contact = useOneToOneContact(conversation.publicKey || '')

	return (
		<ButtonSettingV2
			text={conversation.displayName || contact?.displayName || t('chat.title-unknown')}
			key={conversation.publicKey}
			icon={<ConversationAvatar size={40 * scaleSize} publicKey={conversation.publicKey} />}
			onPress={async () => {
				if (!messengerClient) {
					return
				}

				const confirmed = await new Promise(resolve => {
					Alert.alert(t('chat.push-notifications.warning-disable-mute.title'), '', [
						{
							text: t('chat.push-notifications.warning-disable-mute.refuse'),
							onPress: () => resolve(false),
							style: 'cancel',
						},
						{
							text: t('chat.push-notifications.warning-disable-mute.accept'),
							onPress: () => resolve(true),
							style: 'default',
						},
					])
				})

				if (confirmed) {
					await enableNotificationsForConversation(t, messengerClient, conversation.publicKey!)
				}
			}}
			oppositeNode={
				conversation.sharedPushTokenIdentifier &&
				numberifyLong(conversation.mutedUntil) - Date.now() < oneYear ? (
					<UnifiedText style={{ color: colors['warning-asset'] }}>
						{timeoutDisplay(t, numberifyLong(conversation.mutedUntil))}
					</UnifiedText>
				) : (
					<Icon
						name={'bell-off'}
						width={20 * scaleSize}
						height={20 * scaleSize}
						fill={colors['warning-asset']}
					/>
				)
			}
		/>
	)
}

export const Notifications: ScreenFC<'Settings.Notifications'> = () => {
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const { permissions } = useContext(PermissionsContext)
	const messengerClient = useMessengerClient()
	const protocolClient = useSelector(selectProtocolClient)

	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const account = useAccount()
	const hasPushToken = useMemo(
		() => account.serviceTokens?.some(t => t.serviceType === serviceTypes.Push),
		[account.serviceTokens],
	)
	const accountUnmuted = useMemo(
		() => numberifyLong(account.mutedUntil) < Date.now(),
		[account.mutedUntil],
	)
	const pushPermissionGranted = useMemo(
		() =>
			permissions.notification === RESULTS.GRANTED || permissions.notification === RESULTS.LIMITED,
		[permissions.notification],
	)

	const pushEnabled = useMemo(
		() => hasPushToken && accountUnmuted && pushPermissionGranted,
		[accountUnmuted, hasPushToken, pushPermissionGranted],
	)

	const conversations = useAllConversations()
	const mutedConversations = useMemo(
		() =>
			pushEnabled && pushFilteringAvailable
				? conversations.filter(
						c => c && (!c.sharedPushTokenIdentifier || numberifyLong(c.mutedUntil) > Date.now()),
				  )
				: [],
		[pushEnabled, conversations],
	)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<ItemSection>
					{pushAvailable && (
						<MenuToggle
							isToggleOn={pushEnabled}
							onPress={async () =>
								accountPushToggleState({
									account,
									messengerClient: messengerClient,
									protocolClient: protocolClient,
									navigate,
									t,
								})
							}
						>
							{t('chat.push-notifications.receive-push')}
						</MenuToggle>
					)}
					{pushEnabled && (
						<>
							<DividerItem />
							<MenuToggle
								isToggleOn={account.hidePushPreviews}
								onPress={async () => {
									await messengerClient?.accountPushConfigure({
										hidePushPreviews: !account.hidePushPreviews,
										showPushPreviews: account.hidePushPreviews,
									})
								}}
							>
								{t('chat.push-notifications.hide-previews')}
							</MenuToggle>
							<DividerItem />
							{pushAvailable && (
								<MenuToggle
									isToggleOn={account.autoSharePushTokenFlag}
									onPress={async () => {
										if (account.autoSharePushTokenFlag) {
											await messengerClient?.pushSetAutoShare({ enabled: false })
										} else {
											await askAndSharePushTokenOnAllConversations(t, messengerClient!)
										}
									}}
								>
									{t('chat.push-notifications.auto-enable')}
								</MenuToggle>
							)}
						</>
					)}
				</ItemSection>
				<ItemSection>
					<MenuToggle
						isToggleOn={!account.hideInAppNotifications}
						onPress={async () => {
							await messengerClient?.accountPushConfigure({
								hideInAppNotifications: !account.hideInAppNotifications,
								showInAppNotifications: account.hideInAppNotifications,
							})
						}}
					>
						{t('chat.push-notifications.show-in-app')}
					</MenuToggle>
				</ItemSection>
				{mutedConversations.length > 0 && (
					<ItemSection>
						{mutedConversations.map(c => (
							<MutedConversationButton key={c.publicKey} conversation={c} />
						))}
					</ItemSection>
				)}
			</ScrollView>
		</View>
	)
}
