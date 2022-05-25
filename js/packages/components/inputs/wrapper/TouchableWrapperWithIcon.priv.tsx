import React from 'react'
import { StyleSheet } from 'react-native'

import { TouchableWrapperProps } from '../interfaces'
import { ResetInputPriv } from '../ResetInput.priv'
import { TouchableWrapperPriv } from './TouchableWrapper.priv'

interface TouchableWrapperWithIconPrivProps extends TouchableWrapperProps {
	onClear?: () => void
}

export const TouchableWrapperWithIconPriv: React.FC<TouchableWrapperWithIconPrivProps> = props => {
	return (
		<TouchableWrapperPriv style={[styles.button, props.style]} onPress={props.onPress}>
			{props.children}

			{!!props.onClear && <ResetInputPriv onPress={() => props.onClear?.()} />}
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
})
