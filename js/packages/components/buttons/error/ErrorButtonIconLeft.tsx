import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import ErrorButtonPriv from './ErrorButton.priv'
import ErrorTextPriv from './ErrorText.priv'

const ErrrorButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='error' />
			</View>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginRight: 10,
	},
})

export default ErrrorButtonIconLeft
