import React, { ForwardedRef, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { DropdownRef } from '../../interfaces'
import { NetworkProps } from '../interfaces'
import { NetworkDropdownPriv } from '../NetworkDropdown.priv'
import { RelayItemsPriv } from './RelayItems.priv'

export const RelayDropdown = forwardRef((props: NetworkProps, ref: ForwardedRef<DropdownRef>) => {
	const { t } = useTranslation()

	return (
		<NetworkDropdownPriv
			placeholder={t('onboarding.custom-mode.settings.access.relay-button')}
			testID={props.testID}
			icon='earth'
			ref={ref}
		>
			<RelayItemsPriv />
		</NetworkDropdownPriv>
	)
})
