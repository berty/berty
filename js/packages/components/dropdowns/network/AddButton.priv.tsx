import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export const AddButtonPriv: React.FC<{ onPress?: () => void; accessibilityLabel?: string }> =
	props => {
		const { padding } = useStyles()
		const colors = useThemeColor()

		return (
			<TouchableOpacity
				accessibilityLabel={props.accessibilityLabel}
				style={[padding.horizontal.medium, styles.button]}
				onPress={props.onPress}
			>
				<View style={styles.container}>
					<Icon
						name='plus-circle'
						pack='feather'
						width={20}
						height={20}
						fill={colors['background-header']}
					/>
				</View>
			</TouchableOpacity>
		)
	}

const styles = StyleSheet.create({
	button: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	container: {
		height: 48,
		justifyContent: 'center',
	},
})
