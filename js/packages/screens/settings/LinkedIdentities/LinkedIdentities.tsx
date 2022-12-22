import * as WebBrowser from 'expo-web-browser'
import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, View } from 'react-native'

import beapi from '@berty/api'
import {
	DividerItem,
	ItemSection,
	LinkedIdentityDropdown,
	LinkedIdentityProofServerDropdown,
	MenuItem,
} from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { useAccount, useMessengerClient, useProtocolClient, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { IdentityType } from '@berty/utils/linkedidentities/types'

const acquireProof = async ({
	account,
	messengerClient,
	protocolClient,
	proofServerURL,
	identifierType,
	t,
}: {
	account: beapi.messenger.IAccount
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null
	identifierType: IdentityType
	proofServerURL: string
	t: (arg0: string) => string
}) => {
	if (messengerClient === null || protocolClient === null) {
		return
	}

	const shareableBertyID = await messengerClient?.instanceShareableBertyID({
		displayName: account.displayName,
	})

	let flowInitReply = null as beapi.protocol.CredentialVerificationServiceInitFlow.Reply | null
	try {
		flowInitReply = await protocolClient?.credentialVerificationServiceInitFlow({
			link: shareableBertyID.webUrl,
			serviceUrl: proofServerURL,
			publicKey: shareableBertyID.link!.bertyId!.accountPk,
		})
	} catch (e) {
		/* Ignore check for i18n missing keys
			directory.phone.proof-service-unavailable
			directory.email.proof-service-unavailable
			*/
		Alert.alert(t(`directory.${identifierType}.proof-service-unavailable`))
		return
	}

	const authResult = await WebBrowser.openAuthSessionAsync(flowInitReply.url, 'berty://', {})
	if (authResult.type === 'success') {
		await protocolClient.credentialVerificationServiceCompleteFlow({
			callbackUri: authResult.url,
		})
	}
}

export const LinkedIdentities: ScreenFC<'Settings.LinkedIdentities'> = () => {
	const { scaleSize } = useAppDimensions()
	const protocolClient = useProtocolClient()
	const messengerClient = useMessengerClient()
	const account = useAccount()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [proofServerURL, setProofServerURL] = useState('http://localhost:7001')
	const [knownDirectoryServices] = useState({
		'http://localhost:7002': { supports: [IdentityType.PHONE] },
	})

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<ItemSection>
					<LinkedIdentityProofServerDropdown onChange={setProofServerURL} value={proofServerURL} />
				</ItemSection>

				<ItemSection>
					<MenuItem
						onPress={() =>
							acquireProof({
								account,
								protocolClient,
								messengerClient,
								proofServerURL,
								identifierType: IdentityType.PHONE,
								t,
							})
						}
					>
						{t('directory.phone.register')}
					</MenuItem>
					<DividerItem />
					<MenuItem
						onPress={() =>
							acquireProof({
								account,
								protocolClient,
								messengerClient,
								proofServerURL,
								identifierType: IdentityType.EMAIL,
								t,
							})
						}
					>
						{t('directory.email.register')}
					</MenuItem>
				</ItemSection>

				<ItemSection>
					{account.verifiedCredentials?.map((e, index) => {
						return (
							<Fragment key={`${e.identifier}:${e.issuer}`}>
								<LinkedIdentityDropdown
									identity={e}
									knownDirectoryServices={knownDirectoryServices}
								/>
								{index !== (account.verifiedCredentials?.length || 0) - 1 ? <DividerItem /> : null}
							</Fragment>
						)
					})}
				</ItemSection>
			</ScrollView>
		</View>
	)
}
