import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

interface ClearTouchablePrivProps {
	onPress: () => void
}

export const ClearTouchablePriv: React.FC<ClearTouchablePrivProps> = props => {
	return (
		<TouchableOpacity style={styles.container} onPress={props.onPress}>
			<Icon name='close' fill='#8E8E92' width={20} height={20} />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		flex: 1,
		flexDirection: 'row',
	},
})
