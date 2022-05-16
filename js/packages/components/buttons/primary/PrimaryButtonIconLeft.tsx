import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import PrimaryButtonPriv from './PrimaryButton.priv'
import PrimaryTextPriv from './PrimaryText.priv'

const PrimaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} />
			</View>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginRight: 10,
	},
})

export default PrimaryButtonIconLeft
