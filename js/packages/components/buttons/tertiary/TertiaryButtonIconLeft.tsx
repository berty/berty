import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import TertiaryButtonPriv from './TertiaryButton.priv'
import TertiaryTextPriv from './TertiaryText.priv'

const TertiaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='tertiary' />
			</View>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginRight: 10,
	},
})

export default TertiaryButtonIconLeft
