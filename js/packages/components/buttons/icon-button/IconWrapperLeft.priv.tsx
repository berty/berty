import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { IconNameProps, IconTypeProps } from '../interfaces'
import { IconButtonPriv } from './IconButton.priv'

export const IconWrapperLeftPriv: React.FC<IconNameProps & IconTypeProps> = props => {
	const { margin } = useStyles()

	return (
		<View style={margin.right.small}>
			<IconButtonPriv name={props.name} type={props.type} />
		</View>
	)
}
