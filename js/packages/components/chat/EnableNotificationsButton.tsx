import React, { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { ButtonSetting } from '@berty/components/shared-components'
import { getSharedPushTokensForConversation } from '@berty/store'
import { checkNotifications, RESULTS, PermissionStatus } from 'react-native-permissions'
import { useNavigation } from '@berty/navigation'
import { useStyles } from '@berty/contexts/styles'
import beapi from '@berty/api'
import { GRPCError } from '@berty/grpc-bridge'
import { selectClient, selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { berty } from '@berty/api/root.pb'
import { useAccount, useConversation } from '@berty/hooks'
import { UnifiedText } from '../shared-components/UnifiedText'
import { enablePushPermission } from '@berty/store/push'

const EnableNotificationsButton: React.FC<{
	conversationPk: string
}> = ({ conversationPk }) => {
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const { padding } = useStyles()
	const protocolClient = useSelector(selectProtocolClient)

	const conv = useConversation(conversationPk)
	const account = useAccount()
	const client = useSelector(selectClient)

	const [tokens, setTokens] = useState<berty.messenger.v1.ISharedPushToken[]>([])
	const [notificationPermStatus, setNotificationPermStatus] = useState<PermissionStatus | null>(
		null,
	)

	const refreshSharedPushTokens = useCallback(() => {
		if (!client) {
			return
		}

		getSharedPushTokensForConversation(client, conversationPk).then(setTokens).catch(console.warn)
	}, [client, conversationPk])

	const refreshNotificationPermStatus = useCallback(() => {
		checkNotifications()
			.then(status => {
				setNotificationPermStatus(status.status)
			})
			.catch(console.warn)
	}, [])

	useEffect(() => {
		refreshNotificationPermStatus()
		refreshSharedPushTokens()
	}, [refreshSharedPushTokens, refreshNotificationPermStatus])

	const pushEnabledDevice = React.useMemo(
		() => tokens.find(d => d.devicePublicKey === conv?.localDevicePublicKey),
		[tokens, conv],
	)

	if (notificationPermStatus === RESULTS.UNAVAILABLE) {
		return (
			<ButtonSetting
				icon='bell-outline'
				name={t('chat.push-notifications.unsupported')}
				actionIcon={null}
				alone={true}
				disabled
			/>
		)
	}

	return (
		<>
			<ButtonSetting
				icon='bell-outline'
				name={t('chat.push-notifications.title')}
				alone={true}
				toggled={true}
				varToggle={
					pushEnabledDevice &&
					(conv?.mutedUntil ? conv?.mutedUntil : 0) < Date.now() &&
					(notificationPermStatus === RESULTS.GRANTED || notificationPermStatus === RESULTS.LIMITED)
				}
				actionToggle={async () => {
					try {
						if (!client || !protocolClient || !conv) {
							return
						}

						if (
							pushEnabledDevice &&
							(conv.mutedUntil ? conv.mutedUntil : 0) < Date.now() &&
							(notificationPermStatus === RESULTS.GRANTED ||
								notificationPermStatus === RESULTS.LIMITED)
						) {
							await client.conversationMute({
								groupPk: conversationPk,
								muteForever: true,
							})
						} else {
							await enablePushPermission(client, protocolClient!, navigate)

							// Share push token
							await client!.pushShareTokenForConversation({ conversationPk: conversationPk })
							await client.conversationMute({
								groupPk: conversationPk,
								unmute: true,
							})

							refreshNotificationPermStatus()
							refreshSharedPushTokens()
						}
					} catch (e) {
						if ((e as GRPCError).Code === beapi.errcode.ErrCode.ErrPushUnknownDestination) {
							Alert.alert('', t('chat.push-notifications.errors.no-token'))
							throw new Error()
						} else if ((e as GRPCError).Code === beapi.errcode.ErrCode.ErrPushUnknownDestination) {
							Alert.alert('', t('chat.push-notifications.errors.no-server'))
							throw new Error()
						} else {
							console.warn(e)
						}
					}
				}}
			/>
			{pushEnabledDevice &&
				(notificationPermStatus === RESULTS.BLOCKED ||
					notificationPermStatus === RESULTS.DENIED) && (
					<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
						{t('chat.push-notifications.check-device-settings')}
					</UnifiedText>
				)}
			{pushEnabledDevice && (account.mutedUntil || 0) > Date.now() && (
				<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
					{t('chat.push-notifications.check-account-settings')}
				</UnifiedText>
			)}
		</>
	)
}

export default EnableNotificationsButton
