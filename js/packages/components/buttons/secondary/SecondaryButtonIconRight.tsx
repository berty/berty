import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<SecondaryButtonPriv loading={props.loading} onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='secondary' />
			</View>
		</SecondaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginLeft: 10,
	},
})

export default SecondaryButtonIconRight
