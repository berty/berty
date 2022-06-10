import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RESULTS } from 'react-native-permissions'
import { useSelector } from 'react-redux'

import { FloatingMenuItemWithPrimaryIcon, FloatingMenuToggle } from '@berty/components'
import PermissionsContext from '@berty/contexts/permissions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAccount, useConversation } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { useMessengerClient } from '@berty/store'
import { numberifyLong } from '@berty/utils/convert/long'
import { conversationPushToggleState, pushAvailable } from '@berty/utils/notification/notif-push'

import { UnifiedText } from '../shared-components/UnifiedText'

const EnableNotificationsButton: React.FC<{
	conversationPk: string
}> = ({ conversationPk }) => {
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const { padding } = useStyles()
	const protocolClient = useSelector(selectProtocolClient)

	const conv = useConversation(conversationPk)
	const account = useAccount()
	const messengerClient = useMessengerClient()
	const { permissions } = useContext(PermissionsContext)

	const pushTokenShared = useMemo(
		() => conv?.sharedPushTokenIdentifier !== undefined && conv?.sharedPushTokenIdentifier !== '',
		[conv],
	)
	const conversationNotMuted = useMemo(
		() => numberifyLong(conv?.mutedUntil) < Date.now(),
		[conv?.mutedUntil],
	)
	const pushPermissionGranted = useMemo(
		() =>
			permissions.notification === RESULTS.GRANTED || permissions.notification === RESULTS.LIMITED,
		[permissions.notification],
	)
	const accountMuted = useMemo(
		() => numberifyLong(account.mutedUntil) > Date.now(),
		[account.mutedUntil],
	)

	console.log(
		'results:',
		permissions.notification,
		conv?.sharedPushTokenIdentifier,
		conversationNotMuted,
	)
	if (!pushAvailable || permissions.notification === RESULTS.UNAVAILABLE) {
		return (
			<FloatingMenuItemWithPrimaryIcon iconName='bell-outline'>
				{t('chat.push-notifications.unsupported')}
			</FloatingMenuItemWithPrimaryIcon>
		)
	}

	return (
		<>
			<FloatingMenuToggle
				iconName='bell-outline'
				isToggleOn={pushTokenShared && conversationNotMuted && pushPermissionGranted}
				onPress={async () => {
					await conversationPushToggleState({
						t,
						messengerClient,
						protocolClient,
						conversation: conv,
						navigate,
					})
				}}
			>
				{t('chat.push-notifications.title')}
			</FloatingMenuToggle>
			{pushTokenShared && !pushPermissionGranted && (
				<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
					{t('chat.push-notifications.check-device-settings')}
				</UnifiedText>
			)}
			{pushTokenShared && accountMuted && (
				<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
					{t('chat.push-notifications.check-account-settings')}
				</UnifiedText>
			)}
		</>
	)
}

export default EnableNotificationsButton
