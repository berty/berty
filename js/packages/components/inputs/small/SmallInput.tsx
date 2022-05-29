import React from 'react'
import { StyleSheet, TextInputProps } from 'react-native'

import { InputPriv } from '../Input.priv'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const SmallInput: React.FC<Omit<TextInputProps, 'style'>> = props => {
	return (
		<TouchableWrapperPriv style={styles.button}>
			<InputPriv {...props} />
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: '#F7F8FE',
		borderRadius: 8,
		height: 36,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
})
