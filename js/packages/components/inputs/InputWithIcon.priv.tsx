import React from 'react'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { InputPriv } from './Input.priv'

export const InputWithIconPriv = React.forwardRef<TextInput, Omit<TextInputProps, 'style'>>(
	(props, ref) => {
		const { margin } = useStyles()

		return (
			<View style={[margin.left.small, styles.input]}>
				<InputPriv {...props} ref={ref} />
			</View>
		)
	},
)

const styles = StyleSheet.create({
	input: { flex: 6, flexDirection: 'row', alignItems: 'flex-start' },
})
