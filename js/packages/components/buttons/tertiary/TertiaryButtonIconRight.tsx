import React from 'react'
import { StyleSheet, View } from 'react-native'

import IconButtonPriv from '../IconButton.priv'
import { IButtonPress, IIconName } from '../interfaces'
import TertiaryButtonPriv from './TertiaryButton.priv'
import TertiaryTextPriv from './TertiaryText.priv'

const TertiaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
			<View style={styles.icon}>
				<IconButtonPriv name={props.name} type='tertiary' />
			</View>
		</TertiaryButtonPriv>
	)
}

const styles = StyleSheet.create({
	icon: {
		marginLeft: 10,
	},
})

export default TertiaryButtonIconRight
