import React from 'react'
import { useTranslation } from 'react-i18next'

import { NetworkProps } from '../interfaces'
import { NetworkAltDropdownPriv } from '../NetworkAltDropdown.priv'
import { RelayItemsPriv } from './RelayItems.priv'

export const RelayAltDropdown: React.FC<NetworkProps> = props => {
	const { t } = useTranslation()

	return (
		<NetworkAltDropdownPriv placeholder={t('settings.network.relay-button')} testID={props.testID}>
			<RelayItemsPriv />
		</NetworkAltDropdownPriv>
	)
}
