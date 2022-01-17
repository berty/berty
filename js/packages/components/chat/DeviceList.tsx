import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ButtonDropDown } from '@berty-tech/components/shared-components'
import { berty } from '@berty-tech/api/root.pb'
import { useStyles } from '@berty-tech/styles'
import {
	getDevicesForConversationAndMember,
	getSharedPushTokensForConversation,
	useMessengerContext,
} from '@berty-tech/store'

const UserDevicesList: React.FC<{ memberPk: string; conversationPk: string }> = ({
	memberPk,
	conversationPk,
}) => {
	const cutoff = 16
	const [{ padding }] = useStyles()
	const { t } = useTranslation()
	const ctx = useMessengerContext()
	const [tokens, setTokens] = useState<berty.messenger.v1.ISharedPushToken[]>([])
	const [devices, setDevices] = useState<berty.messenger.v1.IDevice[]>([])

	useEffect(() => {
		if (!ctx.client) {
			return
		}

		getSharedPushTokensForConversation(ctx.client, conversationPk)
			.then(setTokens)
			.catch(console.warn)
	}, [conversationPk, ctx.client, setTokens])

	useEffect(() => {
		if (!ctx.client) {
			return
		}

		getDevicesForConversationAndMember(ctx.client, conversationPk, memberPk).then(setDevices)
	}, [conversationPk, ctx.client, memberPk, setDevices])

	const tokensMap = Object.fromEntries(tokens.map(t => [t.devicePublicKey, t.token]))

	return (
		<>
			{devices.map((m, key) => {
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
						/>

						<ButtonDropDown
							title={
								m?.memberPublicKey?.substring(0, cutoff) ||
								t('chat.multi-member-settings.members-devices-button.unknown')
							}
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

export default UserDevicesList
