import React from 'react'
import { useTranslation } from 'react-i18next'

import { NetworkProps } from '../interfaces'
import { NetworkAltDropdownPriv } from '../NetworkAltDropdown.priv'
import { RendezvousItemsPriv } from './RendezvousItems.priv'

export const RendezvousAltDropdown: React.FC<NetworkProps> = props => {
	const { t } = useTranslation()

	return (
		<NetworkAltDropdownPriv placeholder={t('settings.network.rdvp-button')} testID={props.testID}>
			<RendezvousItemsPriv />
		</NetworkAltDropdownPriv>
	)
}
