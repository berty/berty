import React from 'react'
import { useTranslation } from 'react-i18next'

import { NetworkProps } from '../interfaces'
import { NetworkAltDropdownPriv } from '../NetworkAltDropdown.priv'
import { BootstrapItemsPriv } from './BootstrapItems.priv'

export const BootstrapAltDropdown: React.FC<NetworkProps> = props => {
	const { t } = useTranslation()

	return (
		<NetworkAltDropdownPriv
			placeholder={t('settings.network.bootstrap-button')}
			accessibilityLabel={props.accessibilityLabel}
		>
			<BootstrapItemsPriv />
		</NetworkAltDropdownPriv>
	)
}
