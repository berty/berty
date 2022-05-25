import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { useThemeColor } from '@berty/store'

interface ResetInputPrivProps {
	onPress: () => void
}

export const ResetInputPriv: React.FC<ResetInputPrivProps> = props => {
	const colors = useThemeColor()

	return (
		<TouchableOpacity style={styles.container} onPress={props.onPress}>
			<Icon name='close-circle-outline' fill={colors['secondary-text']} width={20} height={20} />
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
