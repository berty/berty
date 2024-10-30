import parsePhoneNumber from 'libphonenumber-js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { SecondaryButton } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { pbDateToNum } from '@berty/utils/convert/time'
import { IdentityType, mailPrefix, telPrefix } from '@berty/utils/linkedidentities/types'

import { DropdownPriv } from '../Dropdown.priv'

interface LinkedIdentityDropdownProps {
	identity: beapi.messenger.IAccountVerifiedCredential
	knownDirectoryServices: { address: string; capabilities: string[] }[]
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null
	account: beapi.messenger.IAccount
}

const registerOnDirectory = async (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	serverAddr: string,
	identifier: string,
	proofIssuer: string,
) => {
	await client.directoryServiceRegister({
		identifier: identifier,
		proofIssuer: proofIssuer,
		serverAddr: serverAddr,
	})
}

const unregisterFromDirectoryService = async (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	serverAddr: string,
	recordToken: string,
) => {
	await client.directoryServiceUnregister({
		directoryRecordToken: recordToken,
		serverAddr: serverAddr,
	})
}

const getIdentityType = (identifier: string): IdentityType | undefined => {
	if (identifier.startsWith(telPrefix)) {
		return IdentityType.PHONE
	} else if (identifier.startsWith(mailPrefix)) {
		return IdentityType.EMAIL
	}

	return undefined
}

const formatIdentifier = (identifier: string): string => {
	switch (getIdentityType(identifier)) {
		case IdentityType.EMAIL:
			return identifier.substring(mailPrefix.length)
		case IdentityType.PHONE:
			const extractedNumber = identifier.substring(telPrefix.length)

			const phoneNumber = parsePhoneNumber(extractedNumber)
			if (phoneNumber === undefined) {
				return extractedNumber
			}

			return phoneNumber.formatInternational()

		default:
			console.warn('unhandled identity type')
			return identifier
	}
}

export const LinkedIdentityDropdown: React.FC<LinkedIdentityDropdownProps> = props => {
	const { t } = useTranslation()

	const now = new Date()
	const expirationDate = new Date(pbDateToNum(props.identity.expirationDate))
	const isExpired = expirationDate < now
	const identifierType = getIdentityType(props.identity.identifier || '')

	const recordRegistrations =
		props.account.directoryServiceRecords?.filter(
			record => record.identifier === props.identity.identifier,
		) || []

	const formattedIdentifier = formatIdentifier(props.identity.identifier || '')
	const { text } = useStyles()
	const activeRegistrations =
		recordRegistrations.filter(
			record => !record.revoked && pbDateToNum(record.expirationDate) > Date.now(),
		) || []
	const firstServiceAddr = props.knownDirectoryServices.filter(e =>
		e.capabilities.some(cap => cap === identifierType),
	)[0]?.address

	if (!identifierType || props.messengerClient === null) {
		return null
	}

	return (
		<DropdownPriv placeholder={formattedIdentifier}>
			<View style={[styles.item]}>
				<UnifiedText style={[text.size.small]}>
					{/* Ignore check for i18n missing keys
						directory.phone.expired
						directory.email.expired
						directory.phone.associated
						directory.email.associated
					*/}
					{isExpired
						? t(`directory.${identifierType}.expired`, {
								identifier: formattedIdentifier,
								expiration: expirationDate,
						  })
						: t(`directory.${identifierType}.associated`, {
								identifier: formattedIdentifier,
								expiration: expirationDate,
						  })}
				</UnifiedText>
				{!isExpired && activeRegistrations.length === 0 && firstServiceAddr ? (
					<SecondaryButton
						onPress={() =>
							registerOnDirectory(
								props.messengerClient!,
								firstServiceAddr,
								props.identity.identifier!,
								props.identity.issuer!,
							)
						}
					>
						<UnifiedText>
							{
								/*
								Ignore check for i18n missing keys
									directory.phone.register-service
									directory.email.register-service
									directory.phone.unregister-service
									directory.email.unregister-service
									*/
								t(`directory.${identifierType}.register-service`, { service: firstServiceAddr })
							}
						</UnifiedText>
					</SecondaryButton>
				) : null}
				{activeRegistrations.map((e, idx) => (
					<SecondaryButton
						key={idx}
						onPress={() =>
							unregisterFromDirectoryService(
								props.messengerClient!,
								e.serverAddr!,
								e.directoryRecordToken!,
							)
						}
					>
						<UnifiedText>
							{
								/*
									Ignore check for i18n missing keys
										directory.phone.unregister-service
										directory.email.unregister-service
									*/

								t(`directory.${identifierType}.unregister-service`, { service: e.serverAddr })
							}
						</UnifiedText>
					</SecondaryButton>
				))}
			</View>
		</DropdownPriv>
	)
}

const styles = StyleSheet.create({
	item: {
		flexDirection: 'column',
		alignItems: 'center',
		paddingLeft: 32,
		paddingVertical: 12,
		paddingRight: 12,
		flex: 1,
	},
	text: {
		marginLeft: 7,
	},
})
