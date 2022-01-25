import React, { useState, useEffect } from 'react'
import { Text, Alert } from 'react-native'
import { ButtonSetting } from '@berty-tech/components/shared-components'
import {
	getSharedPushTokensForConversation,
	requestAndPersistPushToken,
	servicesAuthViaDefault,
	serviceTypes,
	useAccountServices,
} from '@berty-tech/store'
import { useTranslation } from 'react-i18next'
import { checkNotifications, RESULTS, PermissionStatus } from 'react-native-permissions'
import rnutil from '@berty-tech/rnutil'
import { useNavigation } from '@berty-tech/navigation'
import { berty } from '@berty-tech/api/root.pb'
import { useConversation } from '@berty-tech/react-redux'
import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { GRPCError } from '@berty-tech/grpc-bridge'
import { useSelector } from 'react-redux'
import { selectClient, selectProtocolClient } from '@berty-tech/redux/reducers/ui.reducer'

const EnableNotificationsButton: React.FC<{
	conversationPk: string
}> = ({ conversationPk }) => {
	const services = useAccountServices()
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const conv = useConversation(conversationPk)
	const [{ padding }] = useStyles()
	const client = useSelector(selectClient)
	const protocolClient = useSelector(selectProtocolClient)

	const [notificationPermStatus, setNotificationPermStatus] = useState<PermissionStatus>(
		RESULTS.UNAVAILABLE,
	)
	const [tokens, setTokens] = useState<berty.messenger.v1.ISharedPushToken[]>([])
	const [refreshCounter, setRefresh] = useState(0)

	useEffect(() => {
		checkNotifications()
			.then(status => {
				setNotificationPermStatus(status.status)
			})
			.catch(console.warn)

		if (!client) {
			return
		}

		getSharedPushTokensForConversation(client, conversationPk).then(setTokens).catch(console.warn)
	}, [setNotificationPermStatus, conversationPk, client, setTokens, refreshCounter])

	const pushEnabledDevice = tokens.find(d => d.devicePublicKey === conv?.localDevicePublicKey)
	const hasKnownPushServer = services.some(t => t.serviceType === serviceTypes.Push)

	if (pushEnabledDevice) {
		return (
			<>
				<ButtonSetting
					icon='bell-outline'
					name={t('chat.push-notifications.enabled')}
					actionIcon={
						notificationPermStatus === RESULTS.BLOCKED || notificationPermStatus === RESULTS.DENIED
							? 'alert-triangle-outline'
							: 'checkmark-circle-2'
					}
					alone={true}
					onPress={() => Alert.alert(t('chat.push-notifications.why-cant-disable'))}
				/>
				{(notificationPermStatus === RESULTS.BLOCKED ||
					notificationPermStatus === RESULTS.DENIED) && (
					<Text style={[padding.left.small, padding.right.small, padding.top.small]}>
						{t('chat.push-notifications.check-device-settings')}
					</Text>
				)}
			</>
		)
	}

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
		<ButtonSetting
			icon='bell-outline'
			name={t('chat.push-notifications.enable')}
			alone={true}
			actionIcon={null}
			onPress={async () => {
				try {
					// Get or ask for permission
					const status = await rnutil.checkPermissions('notification', navigate)
					if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
						await new Promise(resolve =>
							rnutil.checkPermissions('notification', navigate, {
								navigateToPermScreenOnProblem: true,
								onComplete: () =>
									new Promise(subResolve => {
										subResolve()
										setTimeout(resolve, 800)
									}),
							}),
						)
					}

					// Persist push token if needed
					await requestAndPersistPushToken(protocolClient!)

					// Register push server secrets if needed
					if (!hasKnownPushServer) {
						try {
							await servicesAuthViaDefault(protocolClient)
							await new Promise(r => setTimeout(r, 300))
						} catch (e) {
							console.warn('no push server known')
							return
						}
					}

					// Confirm push token sharing
					await new Promise((resolve, reject) => {
						Alert.alert(
							t('chat.push-notifications.warning-disable.title'),
							t('chat.push-notifications.warning-disable.subtitle'),
							[
								{
									text: t('chat.push-notifications.warning-disable.refuse'),
									onPress: () => reject(new Error('user cancelled action')),
									style: 'cancel',
								},
								{
									text: t('chat.push-notifications.warning-disable.accept'),
									onPress: () => resolve(null),
									style: 'default',
								},
							],
						)
					})

					// Share push token
					await client!.pushShareTokenForConversation({ conversationPk: conversationPk })
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

				setRefresh(refreshCounter + 1)
			}}
		/>
	)
}

export default EnableNotificationsButton
