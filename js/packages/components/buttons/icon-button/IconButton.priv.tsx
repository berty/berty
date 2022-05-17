import { Icon } from '@ui-kitten/components'
import React, { useMemo } from 'react'

import { useThemeColor } from '@berty/store'

import { IIconName, IIconType } from '../interfaces'

const IconButtonPriv = (props?: IIconType & IIconName): JSX.Element => {
	const colors = useThemeColor()

	const color = useMemo((): string => {
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
	}, [props?.type, colors])

	return <Icon fill={color} name={props?.name ?? 'checkmark-outline'} width={20} height={20} />
}

export default IconButtonPriv
