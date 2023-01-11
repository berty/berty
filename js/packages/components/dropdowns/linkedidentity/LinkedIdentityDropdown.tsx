import parsePhoneNumber from 'libphonenumber-js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { pbDateToNum } from '@berty/utils/convert/time'
import { IdentityType, mailPrefix, telPrefix } from '@berty/utils/linkedidentities/types'

import { DropdownPriv } from '../Dropdown.priv'

interface LinkedIdentityDropdownProps {
	identity: beapi.messenger.IAccountVerifiedCredential
	knownDirectoryServices: {
		[key: string]: {
			supports: IdentityType[]
		}
	}
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
	// TODO: announce on discovery service

	const formattedIdentifier = formatIdentifier(props.identity.identifier || '')
	const { text } = useStyles()

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
					{identifierType !== undefined &&
						(isExpired
							? t(`directory.${identifierType}.expired`, {
									identifier: formattedIdentifier,
									expiration: expirationDate,
							  })
							: t(`directory.${identifierType}.associated`, {
									identifier: formattedIdentifier,
									expiration: expirationDate,
							  }))}
				</UnifiedText>
			</View>
		</DropdownPriv>
	)
}

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
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
