import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { IconNameProps, IconTypeProps } from '../interfaces'
import { IconButtonPriv } from './IconButton.priv'

export const IconWrapperRightPriv: React.FC<IconNameProps & IconTypeProps & { disabled: boolean }> =
	props => {
		const { margin } = useStyles()

		return (
			<View style={margin.left.small}>
				<IconButtonPriv name={props.name} type={props.type} />
			</View>
		)
	}
