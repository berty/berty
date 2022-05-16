import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<SecondaryButtonPriv onPress={props.onPress}>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='secondary' />
			</View>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginRight: 10,
	},
})

export default SecondaryButtonIconLeft
