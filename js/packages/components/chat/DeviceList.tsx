import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { ButtonDropDown } from '@berty/components/shared-components'
import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient } from '@berty/hooks'
import { getDevicesForConversationAndMember } from '@berty/utils/messenger/devices'
import { getSharedPushTokensForConversation } from '@berty/utils/notification/notif-push'

const UserDevicesList: React.FC<{ memberPk: string; conversationPk: string }> = ({
	memberPk,
	conversationPk,
}) => {
	const cutoff = 16
	const { padding } = useStyles()
	const { t } = useTranslation()
	const [tokens, setTokens] = useState<beapi.messenger.IPushMemberToken[]>([])
	const [devices, setDevices] = useState<beapi.messenger.IDevice[]>([])
	const messengerClient = useMessengerClient()

	useEffect(() => {
		if (!messengerClient) {
			return
		}

		getSharedPushTokensForConversation(messengerClient, conversationPk)
			.then(setTokens)
			.catch(console.warn)
	}, [conversationPk, messengerClient, setTokens])

	useEffect(() => {
		if (!messengerClient) {
			return
		}

		getDevicesForConversationAndMember(messengerClient, conversationPk, memberPk).then(setDevices)
	}, [conversationPk, messengerClient, memberPk, setDevices])

	const tokensMap = Object.fromEntries(tokens.map(t => [t.devicePk, t.tokenId]))

	return (
		<>
			{devices.map((m, key) => {
				return (
					<View key={key} style={styles.container}>
						<View style={[padding.top.small, { alignSelf: 'flex-start' }]} />

						<ButtonDropDown
							title={m?.publicKey?.substring(0, cutoff) || ''}
							body={
								tokensMap[m?.publicKey || '']
									? [
											t('chat.devices.push.enabled'),
											(tokensMap[m?.publicKey || ''] || '').substring(0, cutoff),
									  ].join(' ')
									: t('chat.devices.push.not-enabled')
							}
						/>
					</View>
				)
			})}
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
})

export default UserDevicesList
