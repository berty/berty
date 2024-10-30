import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface IconPrivProps {
	iconColor: string
	iconName?: string
	value?: string
	disabled?: boolean
}

export const IconPriv: React.FC<IconPrivProps> = props => {
	const { row } = useStyles()

	const getIconColor = (): string => {
		if (props.value && props.value.length > 0) {
			return '#393C63'
		}
		if (props.disabled) {
			return '#D0D0D6'
		}

		return props.iconColor
	}

	return (
		<View style={[row.center]}>
			<Icon name={props.iconName} fill={getIconColor()} width={20} height={20} />
		</View>
	)
}
