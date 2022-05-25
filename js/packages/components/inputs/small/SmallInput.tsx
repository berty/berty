import React from 'react'
import { StyleSheet } from 'react-native'

import { InputPriv } from '../Input.priv'
import { InputProps } from '../interfaces'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const SmallInput: React.FC<InputProps> = props => {
	return (
		<TouchableWrapperPriv style={styles.button}>
			<InputPriv
				value={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
				disabled={props.disabled}
			/>
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
