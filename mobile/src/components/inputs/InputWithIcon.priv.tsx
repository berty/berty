import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { InputProps } from './interfaces'
import { StyledInputPriv } from './StyledInput.priv'

export const InputWithIconPriv = React.forwardRef<TextInput, InputProps>((props, ref) => {
	const { margin } = useStyles()

	return (
		<View style={[margin.left.small, styles.input]}>
			<StyledInputPriv {...props} ref={ref} />
		</View>
	)
})

const styles = StyleSheet.create({
	input: { flex: 6, flexDirection: 'row', alignItems: 'flex-start' },
})
