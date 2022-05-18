import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { IIconName, IIconType } from '../interfaces'
import IconButtonPriv from './IconButton.priv'

const IconWrapperLeftPriv: React.FC<IIconName & IIconType> = props => {
	const { margin } = useStyles()

	return (
		<View style={margin.right.small}>
			<IconButtonPriv name={props.name} type={props.type} />
		</View>
	)
}

export default IconWrapperLeftPriv
