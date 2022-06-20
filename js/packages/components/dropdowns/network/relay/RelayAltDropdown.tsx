import React from 'react'
import { useTranslation } from 'react-i18next'

import { NetworkProps } from '../interfaces'
import { NetworkAltDropdownPriv } from '../NetworkAltDropdown.priv'
import { RelayDropdownPriv } from './RelayDropdown.priv'

export const RelayAltDropdown: React.FC<NetworkProps> = props => {
	const { t } = useTranslation()

	return (
		<NetworkAltDropdownPriv
			placeholder={t('settings.network.relay-button')}
			accessibilityLabel={props.accessibilityLabel}
		>
			<RelayDropdownPriv />
		</NetworkAltDropdownPriv>
	)
}
