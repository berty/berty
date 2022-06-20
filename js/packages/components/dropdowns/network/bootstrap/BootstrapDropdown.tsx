import React, { ForwardedRef, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { DropdownRef } from '../../interfaces'
import { NetworkProps } from '../interfaces'
import { NetworkDropdownPriv } from '../NetworkDropdown.priv'
import { BootstrapDropdownPriv } from './BootstrapDropdown.priv'

export const BootstrapDropdown = forwardRef(
	(props: NetworkProps, ref: ForwardedRef<DropdownRef>) => {
		const { t } = useTranslation()

		return (
			<NetworkDropdownPriv
				placeholder={t('onboarding.custom-mode.settings.access.bootstrap-button')}
				accessibilityLabel={props.accessibilityLabel}
				icon='earth'
				ref={ref}
			>
				<BootstrapDropdownPriv />
			</NetworkDropdownPriv>
		)
	},
)
