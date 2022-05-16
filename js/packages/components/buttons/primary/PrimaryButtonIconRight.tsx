import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import PrimaryButtonPriv from './PrimaryButton.priv'
import PrimaryTextPriv from './PrimaryText.priv'

const PrimaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} />
			</View>
		</PrimaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginLeft: 10,
	},
})

export default PrimaryButtonIconRight
