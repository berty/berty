import React from 'react'
import { useTranslation } from 'react-i18next'

import { NetworkProps } from '../interfaces'
import { NetworkAltDropdownPriv } from '../NetworkAltDropdown.priv'
import { RendezvousDropdownPriv } from './RendezvousDropdown.priv'

export const RendezvousAltDropdown: React.FC<NetworkProps> = props => {
	const { t } = useTranslation()

	return (
		<NetworkAltDropdownPriv
			placeholder={t('settings.network.rdvp-button')}
			accessibilityLabel={props.accessibilityLabel}
		>
			<RendezvousDropdownPriv />
		</NetworkAltDropdownPriv>
	)
}
