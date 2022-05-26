import { Icon } from '@ui-kitten/components'
import React from 'react'

import { useThemeColor } from '@berty/store'

import { IconNameProps, IconTypeProps } from '../interfaces'

export const IconButtonPriv: React.FC<
	Partial<IconTypeProps & IconNameProps & { disabled: boolean }>
> = props => {
	const colors = useThemeColor()

	const getColor = (): string => {
		switch (props?.type) {
			case 'secondary':
				return props.disabled ? '#D0D0D6' : colors['background-header']
			case 'tertiary':
				// TODO: replace with value from theme
				return '#D2D3E1'
			case 'error':
				// TODO: replace with value from theme
				return props.disabled ? '#D0D0D6' : '#E35179'
			default:
				return '#F2F2F2'
		}
	}

	return <Icon fill={getColor()} name={props?.name ?? 'checkmark-outline'} width={25} height={25} />
}
