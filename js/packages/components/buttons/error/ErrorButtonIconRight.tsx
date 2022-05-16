import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import ErrorButtonPriv from './ErrorButton.priv'
import ErrorTextPriv from './ErrorText.priv'

const ErrorButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='error' />
			</View>
		</ErrorButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginLeft: 10,
	},
})

export default ErrorButtonIconRight
