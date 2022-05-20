import { Icon } from '@ui-kitten/components'
import React from 'react'

import { useThemeColor } from '@berty/store'

import { IIconName, IIconType } from '../interfaces'

const IconButtonPriv: React.FC<Partial<IIconType & IIconName>> = props => {
	const colors = useThemeColor()

	const getColor = (): string => {
		switch (props?.type) {
			case 'secondary':
				return colors['background-header']
			case 'tertiary':
				// TODO: replace with value from theme
				return '#D2D3E1'
			case 'error':
				// TODO: replace with value from theme
				return '#E35179'
			default:
				return 'white'
		}
	}

	return <Icon fill={getColor()} name={props?.name ?? 'checkmark-outline'} width={25} height={25} />
}

export default IconButtonPriv
